import { Property, PropertyDetails } from '../crawlers/naver-crawler.js';
export interface MarketTrends {
    location: string;
    period: string;
    averagePrice: string;
    priceChange: string;
    volumeChange: string;
    marketStatus: '상승' | '하락' | '안정';
    trends: Array<{
        month: string;
        averagePrice: string;
        volume: number;
    }>;
}
export interface PropertyComparison {
    properties: PropertyDetails[];
    comparison: {
        priceRange: {
            min: string;
            max: string;
            average: string;
        };
        sizeRange: {
            min: string;
            max: string;
            average: string;
        };
        pricePerSize: Array<{
            propertyId: string;
            pricePerSize: string;
        }>;
        recommendations: string[];
    };
}
export declare class PropertyService {
    private logger;
    constructor();
    getMarketTrends(location: string, period: string): Promise<MarketTrends>;
    compareProperties(propertyIds: string[]): Promise<PropertyComparison>;
    getPropertyRecommendations(userPreferences: {
        budget: number;
        preferredLocation: string;
        propertyType: string;
        size: number;
    }): Promise<Property[]>;
    getMarketAnalysis(location: string): Promise<{
        supplyDemand: string;
        priceForecast: string;
        investmentRisk: string;
        recommendations: string[];
    }>;
}
