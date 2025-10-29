// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ORXToken
 * @dev OracleX utility and governance token
 */
contract ORXToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Minting allocation
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18; // 15%
    uint256 public constant INVESTORS_ALLOCATION = 200_000_000 * 10**18; // 20%
    uint256 public constant ECOSYSTEM_ALLOCATION = 400_000_000 * 10**18; // 40%
    uint256 public constant TREASURY_ALLOCATION = 150_000_000 * 10**18; // 15%
    uint256 public constant LIQUIDITY_ALLOCATION = 100_000_000 * 10**18; // 10%

    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor(
        address _teamWallet,
        address _investorsWallet,
        address _ecosystemWallet,
        address _treasuryWallet,
        address _liquidityWallet
    ) ERC20("OracleX", "ORX") ERC20Permit("OracleX") Ownable(msg.sender) {
        // Mint initial allocations
        _mint(_teamWallet, TEAM_ALLOCATION);
        _mint(_investorsWallet, INVESTORS_ALLOCATION);
        _mint(_ecosystemWallet, ECOSYSTEM_ALLOCATION);
        _mint(_treasuryWallet, TREASURY_ALLOCATION);
        _mint(_liquidityWallet, LIQUIDITY_ALLOCATION);
    }

    /**
     * @dev Add a minter address (for rewards and staking contracts)
     */
    function addMinter(address _minter) external onlyOwner {
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Remove a minter address
     */
    function removeMinter(address _minter) external onlyOwner {
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Mint tokens (only by authorized minters)
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from another account (with allowance)
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    // Override required by Solidity
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}