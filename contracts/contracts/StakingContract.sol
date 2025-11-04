// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingContract is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // in seconds
        uint256 rewardDebt;
        bool isValidator;
    }

    struct Validator {
        address validatorAddress;
        uint256 totalStaked;
        uint256 reputation; // 0-1000
        uint256 successfulResolutions;
        uint256 totalResolutions;
        bool isActive;
        uint256 slashCount;
    }

    // State variables
    IERC20 public orxToken;
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => Validator) public validators;
    address[] public validatorList;
    
    uint256 public totalStaked;
    uint256 public rewardRate; // Reward per second per token (scaled by 1e18)
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public minimumValidatorStake;
    uint256 public minimumStakingPeriod;
    uint256 public slashingRate; // Percentage to slash (basis points)
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 lockPeriod, bool isValidator);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event ValidatorRegistered(address indexed validator, uint256 stakedAmount);
    event ValidatorSlashed(address indexed validator, uint256 slashedAmount, string reason);
    event RewardsDistributed(uint256 totalRewards, uint256 rewardRate);

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    modifier validatorOnly() {
        require(validators[msg.sender].isActive, "Not an active validator");
        _;
    }

    constructor(
        address _orxToken,
        uint256 _rewardRate,
        uint256 _minimumValidatorStake,
        uint256 _minimumStakingPeriod,
        uint256 _slashingRate
    ) Ownable(msg.sender) {
        orxToken = IERC20(_orxToken);
        rewardRate = _rewardRate;
        minimumValidatorStake = _minimumValidatorStake;
        minimumStakingPeriod = _minimumStakingPeriod;
        slashingRate = _slashingRate;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Stake ORX tokens
     * @param _amount Amount of tokens to stake
     * @param _lockPeriod Lock period in seconds
     * @param _asValidator Whether to register as validator
     */
    function stakeTokens(
        uint256 _amount,
        uint256 _lockPeriod,
        bool _asValidator
    ) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0 tokens");
        require(_lockPeriod >= minimumStakingPeriod, "Lock period too short");
        
        if (_asValidator) {
            require(_amount >= minimumValidatorStake, "Insufficient stake for validator");
            require(!validators[msg.sender].isActive, "Already a validator");
        }

        // Transfer tokens from user
        orxToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Update stake info
        StakeInfo storage stake = stakes[msg.sender];
        stake.amount += _amount;
        stake.timestamp = block.timestamp;
        stake.lockPeriod = _lockPeriod;
        stake.isValidator = _asValidator;

        totalStaked += _amount;

        // Register as validator if requested
        if (_asValidator) {
            _registerValidator(msg.sender, _amount);
        }

        emit TokensStaked(msg.sender, _amount, _lockPeriod, _asValidator);
    }

    /**
     * @dev Unstake tokens
     * @param _amount Amount to unstake
     */
    function unstakeTokens(uint256 _amount) 
        external 
        nonReentrant 
        updateReward(msg.sender) 
    {
        StakeInfo storage stake = stakes[msg.sender];
        require(stake.amount >= _amount, "Insufficient staked amount");
        require(
            block.timestamp >= stake.timestamp + stake.lockPeriod,
            "Tokens still locked"
        );

        // If validator, check if they can unstake
        if (stake.isValidator && validators[msg.sender].isActive) {
            require(
                stake.amount - _amount >= minimumValidatorStake || _amount == stake.amount,
                "Would fall below minimum validator stake"
            );
            
            if (_amount == stake.amount) {
                // Remove validator status
                validators[msg.sender].isActive = false;
                _removeFromValidatorList(msg.sender);
            }
        }

        // Update stake
        stake.amount -= _amount;
        totalStaked -= _amount;

        if (stake.amount == 0) {
            delete stakes[msg.sender];
        }

        // Transfer tokens back to user
        orxToken.safeTransfer(msg.sender, _amount);

        emit TokensUnstaked(msg.sender, _amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        rewards[msg.sender] = 0;
        orxToken.safeTransfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Calculate current reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }

    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return
            ((stakes[account].amount *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    /**
     * @dev Register as validator
     */
    function _registerValidator(address _validator, uint256 _stakedAmount) internal {
        validators[_validator] = Validator({
            validatorAddress: _validator,
            totalStaked: _stakedAmount,
            reputation: 500, // Start with medium reputation
            successfulResolutions: 0,
            totalResolutions: 0,
            isActive: true,
            slashCount: 0
        });

        validatorList.push(_validator);

        emit ValidatorRegistered(_validator, _stakedAmount);
    }

    /**
     * @dev Remove validator from list
     */
    function _removeFromValidatorList(address _validator) internal {
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validatorList[i] == _validator) {
                validatorList[i] = validatorList[validatorList.length - 1];
                validatorList.pop();
                break;
            }
        }
    }

    /**
     * @dev Slash validator stake for malicious behavior
     */
    function slashStake(address _validator, string memory _reason) 
        external 
        onlyOwner 
        updateReward(_validator) 
    {
        require(validators[_validator].isActive, "Validator not active");
        
        StakeInfo storage stake = stakes[_validator];
        uint256 slashAmount = (stake.amount * slashingRate) / 10000;
        
        if (slashAmount > stake.amount) {
            slashAmount = stake.amount;
        }

        // Update stake
        stake.amount -= slashAmount;
        totalStaked -= slashAmount;

        // Update validator info
        validators[_validator].slashCount++;
        validators[_validator].reputation = validators[_validator].reputation > 100 ? 
            validators[_validator].reputation - 100 : 0;

        // If stake falls below minimum, deactivate validator
        if (stake.amount < minimumValidatorStake) {
            validators[_validator].isActive = false;
            _removeFromValidatorList(_validator);
        }

        // Burn slashed tokens (send to dead address)
        orxToken.safeTransfer(address(0x000000000000000000000000000000000000dEaD), slashAmount);

        emit ValidatorSlashed(_validator, slashAmount, _reason);
    }

    /**
     * @dev Distribute rewards to stakers
     */
    function distributeRewards(uint256 _rewardAmount) 
        external 
        onlyOwner 
        updateReward(address(0)) 
    {
        require(_rewardAmount > 0, "No rewards to distribute");
        
        // Transfer reward tokens to contract
        orxToken.safeTransferFrom(msg.sender, address(this), _rewardAmount);

        emit RewardsDistributed(_rewardAmount, rewardRate);
    }

    /**
     * @dev Update validator performance
     */
    function updateValidatorPerformance(
        address _validator,
        bool _successful
    ) external onlyOwner {
        require(validators[_validator].isActive, "Validator not active");
        
        Validator storage validator = validators[_validator];
        validator.totalResolutions++;
        
        if (_successful) {
            validator.successfulResolutions++;
            // Increase reputation for successful resolution
            if (validator.reputation < 1000) {
                validator.reputation += 10;
            }
        } else {
            // Decrease reputation for failed resolution
            if (validator.reputation > 10) {
                validator.reputation -= 10;
            }
        }
    }

    /**
     * @dev Get validator list
     */
    function getValidators() external view returns (address[] memory) {
        return validatorList;
    }

    /**
     * @dev Get active validators only
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active validators
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeCount++;
            }
        }

        // Build active validators array
        address[] memory activeValidators = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeValidators[index] = validatorList[i];
                index++;
            }
        }

        return activeValidators;
    }

    /**
     * @dev Update contract parameters
     */
    function updateParameters(
        uint256 _rewardRate,
        uint256 _minimumValidatorStake,
        uint256 _minimumStakingPeriod,
        uint256 _slashingRate
    ) external onlyOwner {
        rewardRate = _rewardRate;
        minimumValidatorStake = _minimumValidatorStake;
        minimumStakingPeriod = _minimumStakingPeriod;
        slashingRate = _slashingRate;
    }

    /**
     * @dev Get stake info for user
     */
    function getStakeInfo(address _user) external view returns (StakeInfo memory) {
        return stakes[_user];
    }

    /**
     * @dev Get validator info
     */
    function getValidatorInfo(address _validator) external view returns (Validator memory) {
        return validators[_validator];
    }

    /**
     * @dev Check if address is active validator
     */
    function isActiveValidator(address _validator) external view returns (bool) {
        return validators[_validator].isActive;
    }
}