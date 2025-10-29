import { BaseAgent } from './BaseAgent';
import { DataPoint, Market, DataSource } from '../types';
export declare class DataFetcher extends BaseAgent {
    private dataSources;
    private axiosInstance;
    constructor();
    protected onInitialize(): Promise<void>;
    fetchData(market: Market): Promise<DataPoint[]>;
    protected processData(data: DataPoint[], market: Market): Promise<{
        outcome: string;
        confidence: number;
        reasoning: string[];
        dataUsed: DataPoint[];
    }>;
    private analyzePriceData;
    private analyzeNewsData;
    private analyzeGenericData;
    private extractKeywords;
    private getUniqueSourceCount;
    private initializeDataSources;
    private getRelevantSources;
    private fetchFromSource;
    private isPriceRelated;
    private isNewsRelated;
    private fetchCoinGeckoData;
    private fetchNewsData;
    private startHealthCheckInterval;
    private performHealthChecks;
    protected onCleanup(): Promise<void>;
    getDataSources(): DataSource[];
    getHealthySources(): DataSource[];
}
