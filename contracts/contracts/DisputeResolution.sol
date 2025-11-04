// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StakingContract.sol";
import "./PredictionMarket.sol";

contract DisputeResolution is ReentrancyGuard, Ownable {
    enum DisputeStatus { Open, Voting, Resolved, Rejected }
    enum VoteChoice { NoVote, Uphold, Overturn }

    struct Dispute {
        address market;
        address disputer;
        uint256 disputedOutcome;
        uint256 proposedOutcome;
        string reason;
        uint256 disputeBond;
        uint256 createdAt;
        uint256 votingEndsAt;
        DisputeStatus status;
        uint256 upholdVotes;
        uint256 overturnVotes;
        uint256 totalVotingPower;
        bool resolved;
        uint256 finalOutcome;
    }

    struct Vote {
        VoteChoice choice;
        uint256 votingPower;
        uint256 timestamp;
        bool claimed;
    }

    // State variables
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => mapping(address => Vote)) public votes; // disputeId => voter => vote
    mapping(uint256 => address[]) public disputeVoters; // disputeId => voters[]
    
    uint256 public disputeCounter;
    uint256 public minimumDisputeBond;
    uint256 public votingPeriod;
    uint256 public minimumVotingPower;
    uint256 public quorumThreshold; // Percentage of total voting power needed
    
    IERC20 public orxToken;
    StakingContract public stakingContract;
    
    // Events
    event DisputeOpened(
        uint256 indexed disputeId,
        address indexed market,
        address indexed disputer,
        uint256 disputedOutcome,
        uint256 proposedOutcome
    );
    
    event VoteCast(
        uint256 indexed disputeId,
        address indexed voter,
        VoteChoice choice,
        uint256 votingPower
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        bool upheld,
        uint256 finalOutcome
    );
    
    event RewardsDistributed(uint256 indexed disputeId, uint256 totalRewards);

    modifier onlyActiveValidator() {
        require(stakingContract.isActiveValidator(msg.sender), "Not an active validator");
        _;
    }

    modifier disputeExists(uint256 _disputeId) {
        require(_disputeId < disputeCounter, "Dispute does not exist");
        _;
    }

    constructor(
        address _orxToken,
        address _stakingContract,
        uint256 _minimumDisputeBond,
        uint256 _votingPeriod,
        uint256 _quorumThreshold
    ) Ownable(msg.sender) {
        orxToken = IERC20(_orxToken);
        stakingContract = StakingContract(_stakingContract);
        minimumDisputeBond = _minimumDisputeBond;
        votingPeriod = _votingPeriod;
        quorumThreshold = _quorumThreshold;
        minimumVotingPower = 1000 * 1e18; // 1000 ORX minimum
    }

    /**
     * @dev Open a dispute for a market resolution
     * @param _market Address of the prediction market
     * @param _disputedOutcome Current outcome being disputed
     * @param _proposedOutcome Proposed correct outcome
     * @param _reason Reason for the dispute
     */
    function openDispute(
        address _market,
        uint256 _disputedOutcome,
        uint256 _proposedOutcome,
        string memory _reason
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= minimumDisputeBond, "Insufficient dispute bond");
        require(_disputedOutcome != _proposedOutcome, "Outcomes cannot be the same");
        require(bytes(_reason).length > 0, "Reason required");

        // Verify market status
        (,,,, PredictionMarket.MarketStatus status,,) = PredictionMarket(_market).getMarketInfo();
        require(status == PredictionMarket.MarketStatus.Resolved, "Market not resolved");

        uint256 disputeId = disputeCounter++;
        
        disputes[disputeId] = Dispute({
            market: _market,
            disputer: msg.sender,
            disputedOutcome: _disputedOutcome,
            proposedOutcome: _proposedOutcome,
            reason: _reason,
            disputeBond: msg.value,
            createdAt: block.timestamp,
            votingEndsAt: block.timestamp + votingPeriod,
            status: DisputeStatus.Voting,
            upholdVotes: 0,
            overturnVotes: 0,
            totalVotingPower: 0,
            resolved: false,
            finalOutcome: _disputedOutcome
        });

        emit DisputeOpened(disputeId, _market, msg.sender, _disputedOutcome, _proposedOutcome);

        return disputeId;
    }

    /**
     * @dev Vote on a dispute
     * @param _disputeId ID of the dispute
     * @param _choice Vote choice (Uphold or Overturn)
     */
    function voteOnDispute(uint256 _disputeId, VoteChoice _choice) 
        external 
        nonReentrant 
        disputeExists(_disputeId)
        onlyActiveValidator 
    {
        require(_choice != VoteChoice.NoVote, "Invalid vote choice");
        
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.Voting, "Voting period ended");
        require(block.timestamp <= dispute.votingEndsAt, "Voting period expired");
        require(votes[_disputeId][msg.sender].choice == VoteChoice.NoVote, "Already voted");

        // Calculate voting power based on stake and reputation
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(msg.sender);
        StakingContract.Validator memory validatorInfo = stakingContract.getValidatorInfo(msg.sender);
        
        require(stakeInfo.amount >= minimumVotingPower, "Insufficient voting power");
        
        // Voting power = staked amount * reputation factor
        uint256 votingPower = (stakeInfo.amount * validatorInfo.reputation) / 1000;

        // Record vote
        votes[_disputeId][msg.sender] = Vote({
            choice: _choice,
            votingPower: votingPower,
            timestamp: block.timestamp,
            claimed: false
        });

        disputeVoters[_disputeId].push(msg.sender);

        // Update vote tallies
        if (_choice == VoteChoice.Uphold) {
            dispute.upholdVotes += votingPower;
        } else if (_choice == VoteChoice.Overturn) {
            dispute.overturnVotes += votingPower;
        }

        dispute.totalVotingPower += votingPower;

        emit VoteCast(_disputeId, msg.sender, _choice, votingPower);
    }

    /**
     * @dev Finalize a dispute after voting period
     * @param _disputeId ID of the dispute to finalize
     */
    function finalizeDispute(uint256 _disputeId) 
        external 
        nonReentrant 
        disputeExists(_disputeId) 
    {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.Voting, "Dispute not in voting phase");
        require(block.timestamp > dispute.votingEndsAt, "Voting period not ended");
        require(!dispute.resolved, "Dispute already resolved");

        // Check if quorum was reached
        uint256 totalStaked = orxToken.balanceOf(address(stakingContract));
        uint256 quorumRequired = (totalStaked * quorumThreshold) / 100;
        
        if (dispute.totalVotingPower < quorumRequired) {
            dispute.status = DisputeStatus.Rejected;
            // Return dispute bond to disputer
            (bool success, ) = payable(dispute.disputer).call{value: dispute.disputeBond}("");
            require(success, "Bond return failed");
            
            emit DisputeResolved(_disputeId, false, dispute.finalOutcome);
        } else {
            // Determine outcome based on votes
            bool upheld = dispute.upholdVotes > dispute.overturnVotes;
            
            if (upheld) {
                dispute.status = DisputeStatus.Resolved;
                dispute.finalOutcome = dispute.disputedOutcome;
                // Return dispute bond to disputer (they were wrong)
                (bool success, ) = payable(dispute.disputer).call{value: dispute.disputeBond}("");
                require(success, "Bond return failed");
            } else {
                dispute.status = DisputeStatus.Resolved;
                dispute.finalOutcome = dispute.proposedOutcome;
                
                // Update market with new outcome - this would require market to have an update function
                // For now, we'll just record the decision
                
                // Reward the disputer with their bond back plus bonus
                uint256 reward = dispute.disputeBond + (dispute.disputeBond / 2); // 50% bonus
                (bool success, ) = payable(dispute.disputer).call{value: reward}("");
                require(success, "Reward transfer failed");
            }
            
            dispute.resolved = true;
            _distributeVotingRewards(_disputeId, upheld);
            
            emit DisputeResolved(_disputeId, upheld, dispute.finalOutcome);
        }
    }

    /**
     * @dev Distribute rewards to winning voters
     */
    function _distributeVotingRewards(uint256 _disputeId, bool _upheld) internal {
        Dispute storage dispute = disputes[_disputeId];
        address[] memory voters = disputeVoters[_disputeId];
        
        uint256 winningVotes = _upheld ? dispute.upholdVotes : dispute.overturnVotes;
        uint256 totalReward = dispute.disputeBond / 4; // 25% of dispute bond as reward pool
        
        if (winningVotes == 0) return;
        
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Vote storage vote = votes[_disputeId][voter];
            
            bool wonVote = (_upheld && vote.choice == VoteChoice.Uphold) || 
                          (!_upheld && vote.choice == VoteChoice.Overturn);
            
            if (wonVote && !vote.claimed) {
                uint256 voterReward = (vote.votingPower * totalReward) / winningVotes;
                vote.claimed = true;
                
                // Transfer ORX tokens as reward
                orxToken.transfer(voter, voterReward);
            }
        }
        
        emit RewardsDistributed(_disputeId, totalReward);
    }

    /**
     * @dev Claim voting rewards manually
     */
    function claimVotingReward(uint256 _disputeId) external nonReentrant disputeExists(_disputeId) {
        require(disputes[_disputeId].resolved, "Dispute not resolved");
        require(!votes[_disputeId][msg.sender].claimed, "Reward already claimed");
        
        Dispute storage dispute = disputes[_disputeId];
        Vote storage vote = votes[_disputeId][msg.sender];
        
        bool upheld = dispute.upholdVotes > dispute.overturnVotes;
        bool wonVote = (upheld && vote.choice == VoteChoice.Uphold) || 
                      (!upheld && vote.choice == VoteChoice.Overturn);
        
        require(wonVote, "Did not win the vote");
        
        uint256 winningVotes = upheld ? dispute.upholdVotes : dispute.overturnVotes;
        uint256 totalReward = dispute.disputeBond / 4;
        uint256 voterReward = (vote.votingPower * totalReward) / winningVotes;
        
        vote.claimed = true;
        orxToken.transfer(msg.sender, voterReward);
    }

    /**
     * @dev Get dispute information
     */
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }

    /**
     * @dev Get vote information
     */
    function getVote(uint256 _disputeId, address _voter) external view returns (Vote memory) {
        return votes[_disputeId][_voter];
    }

    /**
     * @dev Get all voters for a dispute
     */
    function getDisputeVoters(uint256 _disputeId) external view returns (address[] memory) {
        return disputeVoters[_disputeId];
    }

    /**
     * @dev Check if user can vote on dispute
     */
    function canVote(uint256 _disputeId, address _voter) external view returns (bool) {
        if (_disputeId >= disputeCounter) return false;
        
        Dispute memory dispute = disputes[_disputeId];
        if (dispute.status != DisputeStatus.Voting) return false;
        if (block.timestamp > dispute.votingEndsAt) return false;
        if (votes[_disputeId][_voter].choice != VoteChoice.NoVote) return false;
        if (!stakingContract.isActiveValidator(_voter)) return false;
        
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(_voter);
        return stakeInfo.amount >= minimumVotingPower;
    }

    /**
     * @dev Update contract parameters
     */
    function updateParameters(
        uint256 _minimumDisputeBond,
        uint256 _votingPeriod,
        uint256 _quorumThreshold,
        uint256 _minimumVotingPower
    ) external onlyOwner {
        minimumDisputeBond = _minimumDisputeBond;
        votingPeriod = _votingPeriod;
        quorumThreshold = _quorumThreshold;
        minimumVotingPower = _minimumVotingPower;
    }

    /**
     * @dev Emergency withdrawal of contract funds
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get total disputes count
     */
    function getTotalDisputes() external view returns (uint256) {
        return disputeCounter;
    }

    /**
     * @dev Get active disputes
     */
    function getActiveDisputes() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active disputes
        for (uint256 i = 0; i < disputeCounter; i++) {
            if (disputes[i].status == DisputeStatus.Voting) {
                activeCount++;
            }
        }
        
        // Build active disputes array
        uint256[] memory activeDisputes = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < disputeCounter; i++) {
            if (disputes[i].status == DisputeStatus.Voting) {
                activeDisputes[index] = i;
                index++;
            }
        }
        
        return activeDisputes;
    }
}