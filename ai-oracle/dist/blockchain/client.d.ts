import { Contract } from 'web3-eth-contract';
import { EventEmitter } from 'events';
import { BlockchainConfig } from '../types';
export declare class BlockchainClient extends EventEmitter {
    private web3;
    private config;
    private contracts;
    constructor(config: BlockchainConfig);
    initialize(): Promise<void>;
    connect(): Promise<void>;
    private loadContracts;
    getContract(name: string): Contract<any> | undefined;
    getBalance(address: string): Promise<string>;
    getCurrentBlock(): Promise<number>;
    sendTransaction(to: string, data: string, value?: string): Promise<string>;
    callContractMethod(contractName: string, methodName: string, params?: any[]): Promise<any>;
    sendContractTransaction(contractName: string, methodName: string, params?: any[]): Promise<string>;
    listenToEvents(contractName: string, eventName: string, callback: (event: any) => void): Promise<void>;
    disconnect(): void;
    getMarket(marketId: string): Promise<any>;
    submitResolution(oracleResult: any): Promise<string>;
    submitDisputeResolution(marketId: string, resolution: any): Promise<string>;
    getStatus(): Promise<any>;
}
