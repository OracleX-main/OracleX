"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFetcher = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseAgent_1 = require("./BaseAgent");
const types_1 = require("../types");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class DataFetcher extends BaseAgent_1.BaseAgent {
    constructor() {
        super('data-fetcher-001', types_1.AgentType.DATA_FETCHER, 'Data Fetcher', 'Collects and aggregates data from multiple external sources');
        this.dataSources = new Map();
    }
    async onInitialize() {
        this.axiosInstance = axios_1.default.create({
            timeout: config_1.config.DATA_SOURCE_TIMEOUT,
            validateStatus: (status) => status < 500,
        });
        await this.initializeDataSources();
        this.startHealthCheckInterval();
    }
    async fetchData(market) {
        logger_1.logger.info(`📊 Fetching data for market: ${market.id}`, {
            question: market.question,
            category: market.category
        });
        const dataPoints = [];
        const relevantSources = this.getRelevantSources(market);
        const fetchPromises = relevantSources.map(async (source) => {
            try {
                const sourceData = await this.fetchFromSource(source, market);
                dataPoints.push(...sourceData);
            }
            catch (error) {
                logger_1.logger.error(`Failed to fetch from source ${source.id}:`, error);
            }
        });
        await Promise.allSettled(fetchPromises);
        logger_1.logger.info(`✅ Collected ${dataPoints.length} data points for market ${market.id}`);
        return dataPoints.slice(0, config_1.config.MAX_DATA_POINTS);
    }
    async processData(data, market) {
        const reasoning = [];
        let outcome = 'UNCERTAIN';
        let confidence = 0.5;
        if (data.length === 0) {
            reasoning.push('No data available for analysis');
            return { outcome, confidence, reasoning, dataUsed: data };
        }
        if (market.category.toLowerCase().includes('price') ||
            market.category.toLowerCase().includes('financial')) {
            const result = this.analyzePriceData(data, market);
            outcome = result.outcome;
            confidence = result.confidence;
            reasoning.push(...result.reasoning);
        }
        else if (market.category.toLowerCase().includes('news') ||
            market.category.toLowerCase().includes('event')) {
            const result = this.analyzeNewsData(data, market);
            outcome = result.outcome;
            confidence = result.confidence;
            reasoning.push(...result.reasoning);
        }
        else {
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
    analyzePriceData(data, market) {
        const reasoning = [];
        let outcome = 'UNCERTAIN';
        let confidence = 0.3;
        const priceData = data.filter(d => d.source.includes('price') || d.source.includes('financial'));
        if (priceData.length === 0) {
            reasoning.push('No price data available');
            return { outcome, confidence, reasoning };
        }
        const avgReliability = priceData.reduce((sum, d) => sum + d.reliability, 0) / priceData.length;
        reasoning.push(`Average data reliability: ${(avgReliability * 100).toFixed(1)}%`);
        const prices = priceData
            .filter(d => typeof d.value === 'number')
            .map(d => d.value);
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
    analyzeNewsData(data, market) {
        const reasoning = [];
        const newsData = data.filter(d => d.source.includes('news') || d.source.includes('article'));
        if (newsData.length === 0) {
            reasoning.push('No news data available');
            return { outcome: 'UNCERTAIN', confidence: 0.3, reasoning };
        }
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
        }
        else if (negativeCount > positiveCount) {
            return { outcome: 'NO', confidence: 0.6 + (negativeCount / newsData.length) * 0.3, reasoning };
        }
        return { outcome: 'UNCERTAIN', confidence: 0.4, reasoning };
    }
    analyzeGenericData(data, market) {
        const reasoning = [];
        const avgReliability = data.reduce((sum, d) => sum + d.reliability, 0) / data.length;
        reasoning.push(`Generic analysis of ${data.length} data points`);
        reasoning.push(`Average reliability: ${(avgReliability * 100).toFixed(1)}%`);
        const confidence = Math.min(0.7, 0.3 + (avgReliability * 0.4));
        return {
            outcome: 'REQUIRES_VALIDATION',
            confidence,
            reasoning
        };
    }
    extractKeywords(question) {
        const positive = ['yes', 'will', 'increase', 'rise', 'grow', 'success', 'win', 'achieve'];
        const negative = ['no', 'decrease', 'fall', 'decline', 'fail', 'lose', 'reject'];
        return { positive, negative };
    }
    getUniqueSourceCount(data) {
        const sources = new Set(data.map(d => d.source));
        return sources.size;
    }
    async initializeDataSources() {
        const sources = [
            {
                id: 'coingecko',
                name: 'CoinGecko API',
                type: types_1.DataSourceType.FINANCIAL_API,
                url: 'https://api.coingecko.com/api/v3',
                apiKey: config_1.config.COINGECKO_API_KEY,
                reliability: 0.9,
                isHealthy: true,
                lastCheck: new Date()
            },
            {
                id: 'newsapi',
                name: 'News API',
                type: types_1.DataSourceType.NEWS_API,
                url: 'https://newsapi.org/v2',
                apiKey: config_1.config.NEWS_API_KEY,
                reliability: 0.8,
                isHealthy: true,
                lastCheck: new Date()
            }
        ];
        sources.forEach(source => {
            this.dataSources.set(source.id, source);
        });
        logger_1.logger.info(`📡 Initialized ${sources.length} data sources`);
    }
    getRelevantSources(market) {
        const category = market.category.toLowerCase();
        const question = market.question.toLowerCase();
        return Array.from(this.dataSources.values()).filter(source => {
            if (category.includes('financial') || category.includes('crypto') ||
                question.includes('price') || question.includes('bitcoin')) {
                return source.type === types_1.DataSourceType.FINANCIAL_API;
            }
            if (category.includes('news') || category.includes('event')) {
                return source.type === types_1.DataSourceType.NEWS_API;
            }
            return source.isHealthy;
        });
    }
    async fetchFromSource(source, market) {
        const dataPoints = [];
        try {
            if (source.id === 'coingecko' && this.isPriceRelated(market)) {
                const data = await this.fetchCoinGeckoData(market);
                dataPoints.push(...data);
            }
            else if (source.id === 'newsapi' && this.isNewsRelated(market)) {
                const data = await this.fetchNewsData(market);
                dataPoints.push(...data);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error fetching from ${source.id}:`, error);
        }
        return dataPoints;
    }
    isPriceRelated(market) {
        const text = (market.question + ' ' + market.category).toLowerCase();
        return text.includes('price') || text.includes('bitcoin') ||
            text.includes('crypto') || text.includes('financial');
    }
    isNewsRelated(market) {
        const text = (market.question + ' ' + market.category).toLowerCase();
        return text.includes('news') || text.includes('event') ||
            text.includes('announcement') || text.includes('decision');
    }
    async fetchCoinGeckoData(market) {
        if (!config_1.config.COINGECKO_API_KEY) {
            return [{
                    source: 'coingecko-mock',
                    value: Math.random() * 50000 + 30000,
                    timestamp: new Date(),
                    reliability: 0.8,
                    metadata: { type: 'mock_price_data' }
                }];
        }
        return [];
    }
    async fetchNewsData(market) {
        return [{
                source: 'news-mock',
                value: 'Mock news article about the market topic',
                timestamp: new Date(),
                reliability: 0.7,
                metadata: { type: 'mock_news_data' }
            }];
    }
    startHealthCheckInterval() {
        setInterval(async () => {
            await this.performHealthChecks();
        }, config_1.config.HEALTH_CHECK_INTERVAL);
    }
    async performHealthChecks() {
        for (const [id, source] of this.dataSources) {
            try {
                const response = await this.axiosInstance.get(source.url, {
                    timeout: 5000,
                    headers: source.apiKey ? { 'Authorization': `Bearer ${source.apiKey}` } : {}
                });
                source.isHealthy = response.status < 400;
                source.lastCheck = new Date();
            }
            catch (error) {
                source.isHealthy = false;
                source.lastCheck = new Date();
                logger_1.logger.warn(`Health check failed for source ${id}:`, error);
            }
        }
    }
    async onCleanup() {
        logger_1.logger.info('🧹 Cleaning up DataFetcher agent');
    }
    getDataSources() {
        return Array.from(this.dataSources.values());
    }
    getHealthySources() {
        return Array.from(this.dataSources.values()).filter(s => s.isHealthy);
    }
}
exports.DataFetcher = DataFetcher;
//# sourceMappingURL=DataFetcher.js.map