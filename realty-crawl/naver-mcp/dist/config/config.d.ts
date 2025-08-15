export interface AppConfig {
    server: ServerConfig;
    naver: NaverConfig;
    database: DatabaseConfig;
    logging: LoggingConfig;
    rateLimit: RateLimitConfig;
    puppeteer: PuppeteerConfig;
}
export interface ServerConfig {
    port: number;
    host: string;
    environment: string;
}
export interface NaverConfig {
    accessLicense: string;
    secretKey: string;
    baseUrl: string;
    timeout: number;
}
export interface DatabaseConfig {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
}
export interface LoggingConfig {
    level: string;
    file: boolean;
    console: boolean;
    maxSize: string;
    maxFiles: number;
}
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}
export interface PuppeteerConfig {
    headless: boolean;
    timeout: number;
    args: string[];
}
declare class ConfigManager {
    private logger;
    private config;
    constructor();
    private loadConfig;
    get(): AppConfig;
    getServerConfig(): ServerConfig;
    getNaverConfig(): NaverConfig;
    getDatabaseConfig(): DatabaseConfig;
    getLoggingConfig(): LoggingConfig;
    getRateLimitConfig(): RateLimitConfig;
    getPuppeteerConfig(): PuppeteerConfig;
    validate(): boolean;
    isDevelopment(): boolean;
    isProduction(): boolean;
}
export declare const configManager: ConfigManager;
export default configManager;
