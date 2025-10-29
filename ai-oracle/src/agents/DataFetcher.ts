/**
 * Data Fetcher Agent
 * Responsible for collecting data from various external sources
 */

import axios from 'axios';
import { BaseAgent } from './BaseAgent';
import { AgentType, DataPoint, Market, DataSource, DataSourceType } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

export class DataFetcher extends BaseAgent {
  private dataSources: Map<string, DataSource> = new Map();
  private axiosInstance: any;

  constructor() {
    super(
      'data-fetcher-001',
      AgentType.DATA_FETCHER,
      'Data Fetcher',
      'Collects and aggregates data from multiple external sources'
    );
  }

  protected async onInitialize(): Promise<void> {
    // Setup axios with timeouts and retry logic
    this.axiosInstance = axios.create({
      timeout: config.DATA_SOURCE_TIMEOUT,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    // Initialize data sources
    await this.initializeDataSources();
    
    // Start health check interval
    this.startHealthCheckInterval();
  }

  /**
   * Fetch data for market resolution
   */
  public async fetchData(market: Market): Promise<DataPoint[]> {
    logger.info(`📊 Fetching data for market: ${market.id}`, { 
      question: market.question,
      category: market.category 
    });

    const dataPoints: DataPoint[] = [];

    // Determine which data sources to use based on market category
    const relevantSources = this.getRelevantSources(market);

    // Fetch data from each relevant source
    const fetchPromises = relevantSources.map(async (source) => {
      try {
        const sourceData = await this.fetchFromSource(source, market);
        dataPoints.push(...sourceData);
      } catch (error) {
        logger.error(`Failed to fetch from source ${source.id}:`, error);
        // Continue with other sources
      }
    });

    await Promise.allSettled(fetchPromises);

    logger.info(`✅ Collected ${dataPoints.length} data points for market ${market.id}`);
    return dataPoints.slice(0, config.MAX_DATA_POINTS); // Limit data points
  }

  protected async processData(data: DataPoint[], market: Market): Promise<{
    outcome: string;
    confidence: number;
    reasoning: string[];
    dataUsed: DataPoint[];
  }> {
    // Simple processing logic - can be enhanced with ML models
    const reasoning: string[] = [];
    let outcome = 'UNCERTAIN';
    let confidence = 0.5;

    if (data.length === 0) {
      reasoning.push('No data available for analysis');
      return { outcome, confidence, reasoning, dataUsed: data };
    }

    // Analyze data based on market category
    if (market.category.toLowerCase().includes('price') || 
        market.category.toLowerCase().includes('financial')) {
      
      const result = this.analyzePriceData(data, market);
      outcome = result.outcome;
      confidence = result.confidence;
      reasoning.push(...result.reasoning);
      
    } else if (market.category.toLowerCase().includes('news') ||
               market.category.toLowerCase().includes('event')) {
      
      const result = this.analyzeNewsData(data, market);
      outcome = result.outcome;
      confidence = result.confidence;
      reasoning.push(...result.reasoning);
      
    } else {
      // Generic analysis
      const result = this.analyzeGenericData(data, market);
      outcome = result.outcome;
      confidence = result.confidence;
      reasoning.push(...result.reasoning);
    }

    reasoning.unshift(`Analyzed ${data.length} data points from ${this.getUniqueSourceCount(data)} sources`);

    return {
      outcome,
      confidence,
      reasoning,
      dataUsed: data
    };
  }

  private analyzePriceData(data: DataPoint[], market: Market): {
    outcome: string;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    let outcome = 'UNCERTAIN';
    let confidence = 0.3;
    
    const priceData = data.filter(d => d.source.includes('price') || d.source.includes('financial'));
    
    if (priceData.length === 0) {
      reasoning.push('No price data available');
      return { outcome, confidence, reasoning };
    }

    // Simple price analysis logic
    const avgReliability = priceData.reduce((sum, d) => sum + d.reliability, 0) / priceData.length;
    reasoning.push(`Average data reliability: ${(avgReliability * 100).toFixed(1)}%`);

    // Extract price values and analyze trend
    const prices = priceData
      .filter(d => typeof d.value === 'number')
      .map(d => d.value as number);

    if (prices.length > 1) {
      const trend = prices[prices.length - 1] - prices[0];
      if (market.question.toLowerCase().includes('increase') || 
          market.question.toLowerCase().includes('higher')) {
        outcome = trend > 0 ? 'YES' : 'NO';
        confidence = Math.min(0.9, 0.5 + Math.abs(trend) / Math.max(...prices));
        reasoning.push(`Price trend: ${trend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(trend).toFixed(2)}`);
      }
    }

    return { outcome, confidence: Math.max(0.1, confidence), reasoning };
  }

  private analyzeNewsData(data: DataPoint[], market: Market): {
    outcome: string;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    const newsData = data.filter(d => d.source.includes('news') || d.source.includes('article'));
    
    if (newsData.length === 0) {
      reasoning.push('No news data available');
      return { outcome: 'UNCERTAIN', confidence: 0.3, reasoning };
    }

    // Simple sentiment analysis based on keywords
    const keywords = this.extractKeywords(market.question);
    let positiveCount = 0;
    let negativeCount = 0;

    newsData.forEach(d => {
      const text = String(d.value).toLowerCase();
      if (keywords.positive.some(kw => text.includes(kw))) {
        positiveCount++;
      }
      if (keywords.negative.some(kw => text.includes(kw))) {
        negativeCount++;
      }
    });

    reasoning.push(`Found ${positiveCount} positive and ${negativeCount} negative indicators`);

    if (positiveCount > negativeCount) {
      return { outcome: 'YES', confidence: 0.6 + (positiveCount / newsData.length) * 0.3, reasoning };
    } else if (negativeCount > positiveCount) {
      return { outcome: 'NO', confidence: 0.6 + (negativeCount / newsData.length) * 0.3, reasoning };
    }

    return { outcome: 'UNCERTAIN', confidence: 0.4, reasoning };
  }

  private analyzeGenericData(data: DataPoint[], market: Market): {
    outcome: string;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    const avgReliability = data.reduce((sum, d) => sum + d.reliability, 0) / data.length;
    
    reasoning.push(`Generic analysis of ${data.length} data points`);
    reasoning.push(`Average reliability: ${(avgReliability * 100).toFixed(1)}%`);

    // Basic confidence based on data availability and reliability
    const confidence = Math.min(0.7, 0.3 + (avgReliability * 0.4));

    return {
      outcome: 'REQUIRES_VALIDATION',
      confidence,
      reasoning
    };
  }

  private extractKeywords(question: string): { positive: string[], negative: string[] } {
    const positive = ['yes', 'will', 'increase', 'rise', 'grow', 'success', 'win', 'achieve'];
    const negative = ['no', 'decrease', 'fall', 'decline', 'fail', 'lose', 'reject'];
    
    return { positive, negative };
  }

  private getUniqueSourceCount(data: DataPoint[]): number {
    const sources = new Set(data.map(d => d.source));
    return sources.size;
  }

  private async initializeDataSources(): Promise<void> {
    const sources: DataSource[] = [
      {
        id: 'coingecko',
        name: 'CoinGecko API',
        type: DataSourceType.FINANCIAL_API,
        url: 'https://api.coingecko.com/api/v3',
        apiKey: config.COINGECKO_API_KEY,
        reliability: 0.9,
        isHealthy: true,
        lastCheck: new Date()
      },
      {
        id: 'newsapi',
        name: 'News API',
        type: DataSourceType.NEWS_API,
        url: 'https://newsapi.org/v2',
        apiKey: config.NEWS_API_KEY,
        reliability: 0.8,
        isHealthy: true,
        lastCheck: new Date()
      }
      // Add more sources as needed
    ];

    sources.forEach(source => {
      this.dataSources.set(source.id, source);
    });

    logger.info(`📡 Initialized ${sources.length} data sources`);
  }

  private getRelevantSources(market: Market): DataSource[] {
    const category = market.category.toLowerCase();
    const question = market.question.toLowerCase();

    return Array.from(this.dataSources.values()).filter(source => {
      if (category.includes('financial') || category.includes('crypto') || 
          question.includes('price') || question.includes('bitcoin')) {
        return source.type === DataSourceType.FINANCIAL_API;
      }
      
      if (category.includes('news') || category.includes('event')) {
        return source.type === DataSourceType.NEWS_API;
      }
      
      // Return all healthy sources for unknown categories
      return source.isHealthy;
    });
  }

  private async fetchFromSource(source: DataSource, market: Market): Promise<DataPoint[]> {
    const dataPoints: DataPoint[] = [];

    try {
      if (source.id === 'coingecko' && this.isPriceRelated(market)) {
        const data = await this.fetchCoinGeckoData(market);
        dataPoints.push(...data);
      } else if (source.id === 'newsapi' && this.isNewsRelated(market)) {
        const data = await this.fetchNewsData(market);
        dataPoints.push(...data);
      }
    } catch (error) {
      logger.error(`Error fetching from ${source.id}:`, error);
    }

    return dataPoints;
  }

  private isPriceRelated(market: Market): boolean {
    const text = (market.question + ' ' + market.category).toLowerCase();
    return text.includes('price') || text.includes('bitcoin') || 
           text.includes('crypto') || text.includes('financial');
  }

  private isNewsRelated(market: Market): boolean {
    const text = (market.question + ' ' + market.category).toLowerCase();
    return text.includes('news') || text.includes('event') || 
           text.includes('announcement') || text.includes('decision');
  }

  private async fetchCoinGeckoData(market: Market): Promise<DataPoint[]> {
    // Mock implementation - replace with actual API calls
    if (!config.COINGECKO_API_KEY) {
      return [{
        source: 'coingecko-mock',
        value: Math.random() * 50000 + 30000, // Mock Bitcoin price
        timestamp: new Date(),
        reliability: 0.8,
        metadata: { type: 'mock_price_data' }
      }];
    }

    // Actual API implementation would go here
    return [];
  }

  private async fetchNewsData(market: Market): Promise<DataPoint[]> {
    // Mock implementation - replace with actual API calls
    return [{
      source: 'news-mock',
      value: 'Mock news article about the market topic',
      timestamp: new Date(),
      reliability: 0.7,
      metadata: { type: 'mock_news_data' }
    }];
  }

  private startHealthCheckInterval(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, config.HEALTH_CHECK_INTERVAL);
  }

  private async performHealthChecks(): Promise<void> {
    for (const [id, source] of this.dataSources) {
      try {
        // Simple health check - ping the API
        const response = await this.axiosInstance.get(source.url, {
          timeout: 5000,
          headers: source.apiKey ? { 'Authorization': `Bearer ${source.apiKey}` } : {}
        });

        source.isHealthy = response.status < 400;
        source.lastCheck = new Date();
      } catch (error) {
        source.isHealthy = false;
        source.lastCheck = new Date();
        logger.warn(`Health check failed for source ${id}:`, error);
      }
    }
  }

  protected async onCleanup(): Promise<void> {
    // Cleanup any resources, cancel intervals, etc.
    logger.info('🧹 Cleaning up DataFetcher agent');
  }

  // Public getters for monitoring
  public getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  public getHealthySources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(s => s.isHealthy);
  }
}