import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger.js';

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

export class NaverApiClient {
  private client: AxiosInstance;
  private logger: Logger;
  private config: NaverApiConfig;

  constructor(config: NaverApiConfig) {
    this.config = config;
    this.logger = new Logger();
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://openapi.naver.com',
      timeout: 10000,
      headers: {
        'X-Naver-Client-Id': config.accessLicense,
        'X-Naver-Client-Secret': config.secretKey,
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('API Request:', {
          method: config.method,
          url: config.url,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        this.logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('API Response:', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      (error) => {
        this.logger.error('API Response Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async searchWebDocuments(request: SearchRequest): Promise<SearchResponse> {
    try {
      this.logger.info('Searching web documents:', request);
      
      const response = await this.client.get('/v1/search/blog.json', {
        params: request
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Error searching web documents:', error);
      throw error;
    }
  }

  async searchNews(request: SearchRequest): Promise<SearchResponse> {
    try {
      this.logger.info('Searching news:', request);
      
      const response = await this.client.get('/v1/search/news.json', {
        params: request
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Error searching news:', error);
      throw error;
    }
  }

  async searchRealEstate(query: string): Promise<any> {
    try {
      this.logger.info('Searching real estate:', query);
      
      // 네이버 부동산 검색을 위한 웹문서 검색
      const response = await this.searchWebDocuments({
        query: `${query} 부동산 매물`,
        display: 20,
        sort: 'date'
      });
      
      return response;
    } catch (error) {
      this.logger.error('Error searching real estate:', error);
      throw error;
    }
  }

  async getMarketTrends(location: string): Promise<any> {
    try {
      this.logger.info('Getting market trends for:', location);
      
      const response = await this.searchWebDocuments({
        query: `${location} 부동산 시장 동향`,
        display: 10,
        sort: 'date'
      });
      
      return response;
    } catch (error) {
      this.logger.error('Error getting market trends:', error);
      throw error;
    }
  }

  async getPropertyAnalysis(propertyType: string, location: string): Promise<any> {
    try {
      this.logger.info('Getting property analysis:', { propertyType, location });
      
      const response = await this.searchWebDocuments({
        query: `${location} ${propertyType} 시세 분석`,
        display: 15,
        sort: 'sim'
      });
      
      return response;
    } catch (error) {
      this.logger.error('Error getting property analysis:', error);
      throw error;
    }
  }

  async getInvestmentInsights(location: string): Promise<any> {
    try {
      this.logger.info('Getting investment insights for:', location);
      
      const response = await this.searchWebDocuments({
        query: `${location} 부동산 투자 전망`,
        display: 10,
        sort: 'date'
      });
      
      return response;
    } catch (error) {
      this.logger.error('Error getting investment insights:', error);
      throw error;
    }
  }
}
