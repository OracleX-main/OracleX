// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAIOracle {
    function submitAIResult(
        address _market,
        uint256 _predictedOutcome,
        uint256 _confidence,
        string memory _evidence
    ) external;

    function getAIResult(address _market) 
        external 
        view 
        returns (uint256 outcome, uint256 confidence, bool isSubmitted);
}