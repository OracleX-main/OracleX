// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StakingContract.sol";

contract GovernanceDAO is ReentrancyGuard, Ownable {
    enum ProposalStatus { Draft, Active, Passed, Rejected, Executed, Cancelled }
    enum VoteChoice { NoVote, For, Against, Abstain }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVotingPower;
        uint256 createdAt;
        uint256 votingStartsAt;
        uint256 votingEndsAt;
        ProposalStatus status;
        uint256 quorumRequired;
        uint256 approvalThreshold; // Percentage needed to pass
        bool executed;
        bytes executionData; // For on-chain execution
        address targetContract; // Contract to execute on
    }

    struct Vote {
        VoteChoice choice;
        uint256 votingPower;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes; // proposalId => voter => vote
    mapping(uint256 => address[]) public proposalVoters; // proposalId => voters[]
    
    uint256 public proposalCounter;
    uint256 public proposalThreshold; // Minimum tokens needed to create proposal
    uint256 public votingDelay; // Time before voting starts
    uint256 public votingPeriod; // Duration of voting
    uint256 public quorumPercentage; // Percentage of total supply needed
    uint256 public approvalPercentage; // Percentage of For votes needed
    
    IERC20 public orxToken;
    StakingContract public stakingContract;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 votingStartsAt,
        uint256 votingEndsAt
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 votingPower
    );
    
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalStatusChanged(uint256 indexed proposalId, ProposalStatus newStatus);

    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        _;
    }

    constructor(
        address _orxToken,
        address _stakingContract,
        uint256 _proposalThreshold,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorumPercentage,
        uint256 _approvalPercentage
    ) Ownable(msg.sender) {
        orxToken = IERC20(_orxToken);
        stakingContract = StakingContract(_stakingContract);
        proposalThreshold = _proposalThreshold;
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;
        approvalPercentage = _approvalPercentage;
    }

    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        address _targetContract,
        bytes memory _executionData
    ) external nonReentrant returns (uint256) {
        // Check if proposer has enough voting power
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(msg.sender);
        require(stakeInfo.amount >= proposalThreshold, "Insufficient tokens to propose");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");

        uint256 proposalId = proposalCounter++;
        uint256 currentTime = block.timestamp;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            totalVotingPower: 0,
            createdAt: currentTime,
            votingStartsAt: currentTime + votingDelay,
            votingEndsAt: currentTime + votingDelay + votingPeriod,
            status: ProposalStatus.Active,
            quorumRequired: (orxToken.totalSupply() * quorumPercentage) / 100,
            approvalThreshold: approvalPercentage,
            executed: false,
            executionData: _executionData,
            targetContract: _targetContract
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _title,
            currentTime + votingDelay,
            currentTime + votingDelay + votingPeriod
        );

        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     */
    function castVote(uint256 _proposalId, VoteChoice _choice) 
        external 
        nonReentrant 
        proposalExists(_proposalId) 
    {
        require(_choice != VoteChoice.NoVote, "Invalid vote choice");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.votingStartsAt, "Voting not started");
        require(block.timestamp <= proposal.votingEndsAt, "Voting period ended");
        require(votes[_proposalId][msg.sender].choice == VoteChoice.NoVote, "Already voted");

        // Calculate voting power
        uint256 votingPower = _calculateVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        // Record vote
        votes[_proposalId][msg.sender] = Vote({
            choice: _choice,
            votingPower: votingPower,
            timestamp: block.timestamp
        });

        proposalVoters[_proposalId].push(msg.sender);

        // Update vote tallies
        if (_choice == VoteChoice.For) {
            proposal.votesFor += votingPower;
        } else if (_choice == VoteChoice.Against) {
            proposal.votesAgainst += votingPower;
        } else if (_choice == VoteChoice.Abstain) {
            proposal.votesAbstain += votingPower;
        }

        proposal.totalVotingPower += votingPower;

        emit VoteCast(_proposalId, msg.sender, _choice, votingPower);
    }

    /**
     * @dev Calculate voting power for an address (internal helper)
     */
    function _calculateVotingPower(address _voter) internal view returns (uint256) {
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(_voter);
        uint256 votingPower = stakeInfo.amount;
        
        if (stakingContract.isActiveValidator(_voter)) {
            StakingContract.Validator memory validatorInfo = stakingContract.getValidatorInfo(_voter);
            votingPower = (votingPower * (1000 + validatorInfo.reputation)) / 1000;
        }
        
        return votingPower;
    }

    /**
     * @dev Finalize a proposal after voting period
     */
    function finalizeProposal(uint256 _proposalId) 
        external 
        nonReentrant 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp > proposal.votingEndsAt, "Voting period not ended");

        // Check if quorum was reached
        if (proposal.totalVotingPower < proposal.quorumRequired) {
            proposal.status = ProposalStatus.Rejected;
            emit ProposalStatusChanged(_proposalId, ProposalStatus.Rejected);
            return;
        }

        // Calculate approval percentage
        uint256 totalDecisiveVotes = proposal.votesFor + proposal.votesAgainst;
        if (totalDecisiveVotes == 0) {
            proposal.status = ProposalStatus.Rejected;
            emit ProposalStatusChanged(_proposalId, ProposalStatus.Rejected);
            return;
        }

        uint256 approvalRate = (proposal.votesFor * 100) / totalDecisiveVotes;
        
        if (approvalRate >= proposal.approvalThreshold) {
            proposal.status = ProposalStatus.Passed;
            emit ProposalStatusChanged(_proposalId, ProposalStatus.Passed);
        } else {
            proposal.status = ProposalStatus.Rejected;
            emit ProposalStatusChanged(_proposalId, ProposalStatus.Rejected);
        }
    }

    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(uint256 _proposalId) 
        external 
        nonReentrant 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Passed, "Proposal not passed");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.targetContract != address(0), "No execution target");

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        // Execute the proposal on target contract
        (bool success, ) = proposal.targetContract.call(proposal.executionData);
        
        emit ProposalExecuted(_proposalId, success);
        emit ProposalStatusChanged(_proposalId, ProposalStatus.Executed);
    }

    /**
     * @dev Cancel a proposal (only by proposer or owner before voting starts)
     */
    function cancelProposal(uint256 _proposalId) 
        external 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(block.timestamp < proposal.votingStartsAt, "Voting already started");
        require(proposal.status == ProposalStatus.Active, "Proposal not active");

        proposal.status = ProposalStatus.Cancelled;
        
        emit ProposalCancelled(_proposalId);
        emit ProposalStatusChanged(_proposalId, ProposalStatus.Cancelled);
    }

    /**
     * @dev Get proposal information
     */
    function getProposal(uint256 _proposalId) external view returns (Proposal memory) {
        return proposals[_proposalId];
    }

    /**
     * @dev Get vote information
     */
    function getVote(uint256 _proposalId, address _voter) external view returns (Vote memory) {
        return votes[_proposalId][_voter];
    }

    /**
     * @dev Get all voters for a proposal
     */
    function getProposalVoters(uint256 _proposalId) external view returns (address[] memory) {
        return proposalVoters[_proposalId];
    }

    /**
     * @dev Get voting power for an address
     */
    function getVotingPower(address _voter) external view returns (uint256) {
        return _calculateVotingPower(_voter);
    }

    /**
     * @dev Check if address can create proposal
     */
    function canPropose(address _proposer) external view returns (bool) {
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(_proposer);
        return stakeInfo.amount >= proposalThreshold;
    }

    /**
     * @dev Check if address can vote on proposal
     */
    function canVote(uint256 _proposalId, address _voter) external view returns (bool) {
        if (_proposalId >= proposalCounter) return false;
        
        Proposal memory proposal = proposals[_proposalId];
        if (proposal.status != ProposalStatus.Active) return false;
        if (block.timestamp < proposal.votingStartsAt) return false;
        if (block.timestamp > proposal.votingEndsAt) return false;
        if (votes[_proposalId][_voter].choice != VoteChoice.NoVote) return false;
        
        StakingContract.StakeInfo memory stakeInfo = stakingContract.getStakeInfo(_voter);
        return stakeInfo.amount > 0;
    }

    /**
     * @dev Get active proposals
     */
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < proposalCounter; i++) {
            if (proposals[i].status == ProposalStatus.Active) {
                activeCount++;
            }
        }
        
        uint256[] memory activeProposals = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < proposalCounter; i++) {
            if (proposals[i].status == ProposalStatus.Active) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }

    /**
     * @dev Get proposals by status
     */
    function getProposalsByStatus(ProposalStatus _status) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < proposalCounter; i++) {
            if (proposals[i].status == _status) {
                count++;
            }
        }
        
        uint256[] memory filteredProposals = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < proposalCounter; i++) {
            if (proposals[i].status == _status) {
                filteredProposals[index] = i;
                index++;
            }
        }
        
        return filteredProposals;
    }

    /**
     * @dev Get total proposals count
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @dev Update governance parameters
     */
    function updateParameters(
        uint256 _proposalThreshold,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorumPercentage,
        uint256 _approvalPercentage
    ) external onlyOwner {
        proposalThreshold = _proposalThreshold;
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;
        approvalPercentage = _approvalPercentage;
    }
}
