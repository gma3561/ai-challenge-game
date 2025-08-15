export interface LuxuryHouseProperty {
    id: string;
    title: string;
    price: string;
    location: string;
    propertyType: string;
    size: string;
    rooms: string;
    floor: string;
    postedDate: string;
    url: string;
    imageUrl?: string;
    description?: string;
}
export interface MonitorConfig {
    checkInterval: number;
    notificationEmail?: string;
    notificationPhone?: string;
    saveToFile: boolean;
    filePath: string;
}
export declare class LuxuryHouseMonitor {
    private browser;
    private logger;
    private config;
    private previousProperties;
    private isMonitoring;
    private monitorInterval;
    constructor(config: MonitorConfig);
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    private checkNewProperties;
    private scrapeProperties;
    private extractPropertiesWithMultipleMethods;
    private extractWithSelectors;
    private extractWithTextPatterns;
    private extractFromPageStructure;
    private findNewProperties;
    private notifyNewProperties;
    private sendEmailNotification;
    private sendSMSNotification;
    private saveNewPropertiesToFile;
    private loadPreviousProperties;
    private saveCurrentProperties;
    private getBrowser;
    close(): Promise<void>;
    getStatus(): {
        isMonitoring: boolean;
        lastCheck?: Date;
        propertyCount: number;
    };
    getAllProperties(): LuxuryHouseProperty[];
}
