export interface PropertySearchParams {
    location: string;
    propertyType?: string;
    priceRange?: {
        min?: number;
        max?: number;
    };
    size?: {
        min?: number;
        max?: number;
    };
    rooms?: number;
}
export interface Property {
    id: string;
    title: string;
    price: string;
    size: string;
    rooms: string;
    location: string;
    address: string;
    description: string;
    images: string[];
    details: Record<string, any>;
    url: string;
}
export interface PropertyDetails extends Property {
    amenities: string[];
    transportation: string[];
    schools: string[];
    nearbyFacilities: string[];
    marketHistory: Array<{
        date: string;
        price: string;
        change: string;
    }>;
}
export declare class NaverCrawler {
    private browser;
    private logger;
    constructor();
    private getBrowser;
    searchProperties(params: PropertySearchParams): Promise<Property[]>;
    getPropertyDetails(propertyId: string): Promise<PropertyDetails>;
    private buildSearchUrl;
    close(): Promise<void>;
}
