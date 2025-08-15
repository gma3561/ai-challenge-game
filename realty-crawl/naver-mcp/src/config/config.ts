import { config } from 'dotenv';
import { Logger } from '../utils/logger.js';

// Load environment variables
config();

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

class ConfigManager {
  private logger: Logger;
  private config: AppConfig;

  constructor() {
    this.logger = new Logger();
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost',
        environment: process.env.NODE_ENV || 'development'
      },
      naver: {
        accessLicense: process.env.NAVER_ACCESS_LICENSE || '01000000005a2392e4de200b33a5dde383228e5e336bbccec529eeb2732f9fa65adf259389',
        secretKey: process.env.NAVER_SECRET_KEY || 'AQAAAABaI5Lk3iALM6Xd44Mijl4z8wffuY7x7fH90N1MUgPcYg==',
        baseUrl: process.env.NAVER_BASE_URL || 'https://openapi.naver.com',
        timeout: parseInt(process.env.NAVER_TIMEOUT || '10000')
      },
      database: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'naver_properties',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE === 'true',
        console: process.env.LOG_CONSOLE !== 'false',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        message: 'Too many requests from this IP, please try again later.'
      },
      puppeteer: {
        headless: process.env.PUPPETEER_HEADLESS === 'true',
        timeout: parseInt(process.env.PUPPETEER_TIMEOUT || '30000'),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    };
  }

  get(): AppConfig {
    return this.config;
  }

  getServerConfig(): ServerConfig {
    return this.config.server;
  }

  getNaverConfig(): NaverConfig {
    return this.config.naver;
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  getLoggingConfig(): LoggingConfig {
    return this.config.logging;
  }

  getRateLimitConfig(): RateLimitConfig {
    return this.config.rateLimit;
  }

  getPuppeteerConfig(): PuppeteerConfig {
    return this.config.puppeteer;
  }

  validate(): boolean {
    const requiredEnvVars = [
      'NAVER_ACCESS_LICENSE',
      'NAVER_SECRET_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      this.logger.error(`Missing required environment variables: ${missing.join(', ')}`);
      return false;
    }

    this.logger.info('Configuration validation passed');
    return true;
  }

  isDevelopment(): boolean {
    return this.config.server.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.server.environment === 'production';
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export default configManager;
