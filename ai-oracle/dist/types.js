"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceType = exports.AgentType = exports.MarketStatus = void 0;
var MarketStatus;
(function (MarketStatus) {
    MarketStatus["ACTIVE"] = "ACTIVE";
    MarketStatus["PENDING_RESOLUTION"] = "PENDING_RESOLUTION";
    MarketStatus["RESOLVED"] = "RESOLVED";
    MarketStatus["DISPUTED"] = "DISPUTED";
    MarketStatus["CANCELLED"] = "CANCELLED";
})(MarketStatus || (exports.MarketStatus = MarketStatus = {}));
var AgentType;
(function (AgentType) {
    AgentType["DATA_FETCHER"] = "DATA_FETCHER";
    AgentType["VALIDATOR"] = "VALIDATOR";
    AgentType["ARBITER"] = "ARBITER";
    AgentType["CONFIDENCE_SCORER"] = "CONFIDENCE_SCORER";
})(AgentType || (exports.AgentType = AgentType = {}));
var DataSourceType;
(function (DataSourceType) {
    DataSourceType["FINANCIAL_API"] = "FINANCIAL_API";
    DataSourceType["NEWS_API"] = "NEWS_API";
    DataSourceType["SOCIAL_MEDIA"] = "SOCIAL_MEDIA";
    DataSourceType["WEATHER_API"] = "WEATHER_API";
    DataSourceType["SPORTS_API"] = "SPORTS_API";
    DataSourceType["GOVERNMENT_API"] = "GOVERNMENT_API";
    DataSourceType["WEB_SCRAPING"] = "WEB_SCRAPING";
})(DataSourceType || (exports.DataSourceType = DataSourceType = {}));
//# sourceMappingURL=types.js.map