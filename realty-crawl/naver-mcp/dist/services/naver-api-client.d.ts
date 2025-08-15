export interface NaverApiConfig {
    accessLicense: string;
    secretKey: string;
    baseUrl?: string;
}
export interface SearchRequest {
    query: string;
    display?: number;
    start?: number;
    sort?: 'sim' | 'date';
}
export interface SearchResponse {
    lastBuildDate: string;
    total: number;
    start: number;
    display: number;
    items: Array<{
        title: string;
        link: string;
        description: string;
        bloggername?: string;
        bloggerlink?: string;
        postdate?: string;
    }>;
}
export declare class NaverApiClient {
    private client;
    private logger;
    private config;
    constructor(config: NaverApiConfig);
    searchWebDocuments(request: SearchRequest): Promise<SearchResponse>;
    searchNews(request: SearchRequest): Promise<SearchResponse>;
    searchRealEstate(query: string): Promise<any>;
    getMarketTrends(location: string): Promise<any>;
    getPropertyAnalysis(propertyType: string, location: string): Promise<any>;
    getInvestmentInsights(location: string): Promise<any>;
}
