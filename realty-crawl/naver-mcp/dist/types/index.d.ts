export interface BaseResponse {
    success: boolean;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface PropertySearchFilters {
    location: string;
    propertyType?: PropertyType;
    priceRange?: PriceRange;
    sizeRange?: SizeRange;
    rooms?: number;
    features?: string[];
    yearBuilt?: YearRange;
}
export type PropertyType = '아파트' | '빌라' | '오피스텔' | '단독주택' | '상가' | '사무실' | '창고';
export interface PriceRange {
    min?: number;
    max?: number;
    currency?: 'KRW' | 'USD';
}
export interface SizeRange {
    min?: number;
    max?: number;
    unit?: 'sqm' | 'pyung';
}
export interface YearRange {
    min?: number;
    max?: number;
}
export interface Location {
    city: string;
    district: string;
    neighborhood?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface PropertyImage {
    url: string;
    alt: string;
    type: 'main' | 'interior' | 'exterior' | 'floorplan';
}
export interface MarketData {
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
    marketTrend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}
export interface SearchResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: string;
}
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface FilterOptions {
    locations: string[];
    propertyTypes: PropertyType[];
    priceRanges: PriceRange[];
    sizeRanges: SizeRange[];
    features: string[];
}
export interface UserPreferences {
    userId: string;
    preferredLocations: string[];
    preferredPropertyTypes: PropertyType[];
    budgetRange: PriceRange;
    sizeRange: SizeRange;
    mustHaveFeatures: string[];
    dealBreakers: string[];
}
export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: ('new_listing' | 'price_change' | 'market_update')[];
}
