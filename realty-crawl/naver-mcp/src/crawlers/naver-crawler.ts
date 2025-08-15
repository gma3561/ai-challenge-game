import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from '../utils/logger.js';

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

export class NaverCrawler {
  private browser: Browser | null = null;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS === 'true',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async searchProperties(params: PropertySearchParams): Promise<Property[]> {
    try {
      this.logger.info('Searching properties with params:', params);
      
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to Naver Real Estate
      const searchUrl = this.buildSearchUrl(params);
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for property listings to load
      await page.waitForSelector('.item_inner', { timeout: 10000 });
      
      // Extract property data
      const properties = await page.evaluate(() => {
        const propertyElements = document.querySelectorAll('.item_inner');
        const properties: any[] = [];
        
        propertyElements.forEach((element) => {
          try {
            const titleElement = element.querySelector('.text');
            const priceElement = element.querySelector('.price');
            const sizeElement = element.querySelector('.info');
            const locationElement = element.querySelector('.location');
            
            if (titleElement && priceElement) {
              properties.push({
                id: Math.random().toString(36).substr(2, 9),
                title: titleElement.textContent?.trim() || '',
                price: priceElement.textContent?.trim() || '',
                size: sizeElement?.textContent?.trim() || '',
                rooms: '',
                location: locationElement?.textContent?.trim() || '',
                address: '',
                description: '',
                images: [],
                details: {},
                url: ''
              });
            }
          } catch (error) {
            console.error('Error parsing property element:', error);
          }
        });
        
        return properties;
      });
      
      await page.close();
      
      this.logger.info(`Found ${properties.length} properties`);
      return properties;
      
    } catch (error) {
      this.logger.error('Error searching properties:', error);
      throw error;
    }
  }

  async getPropertyDetails(propertyId: string): Promise<PropertyDetails> {
    try {
      this.logger.info(`Getting property details for ID: ${propertyId}`);
      
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // For demo purposes, return mock data
      // In real implementation, you would navigate to the property detail page
      const mockDetails: PropertyDetails = {
        id: propertyId,
        title: '강남구 신축 아파트',
        price: '15억 5,000',
        size: '84.95㎡',
        rooms: '3룸',
        location: '강남구',
        address: '서울특별시 강남구 테헤란로 123',
        description: '강남구 중심가에 위치한 신축 아파트입니다.',
        images: ['https://example.com/image1.jpg'],
        details: {
          floor: '15층',
          totalFloors: '25층',
          yearBuilt: '2023',
          parking: '2대',
          elevator: '있음'
        },
        url: 'https://land.naver.com/property/123',
        amenities: ['주차장', '엘리베이터', '보안시스템'],
        transportation: ['지하철 2호선 강남역 도보 5분'],
        schools: ['강남초등학교', '강남중학교'],
        nearbyFacilities: ['백화점', '병원', '공원'],
        marketHistory: [
          { date: '2023-12-01', price: '15억 5,000', change: '+2,000' },
          { date: '2023-11-01', price: '15억 3,000', change: '+1,000' }
        ]
      };
      
      await page.close();
      return mockDetails;
      
    } catch (error) {
      this.logger.error('Error getting property details:', error);
      throw error;
    }
  }

  private buildSearchUrl(params: PropertySearchParams): string {
    const baseUrl = 'https://land.naver.com/search';
    const queryParams = new URLSearchParams();
    
    queryParams.append('query', params.location);
    
    if (params.propertyType) {
      queryParams.append('propertyType', params.propertyType);
    }
    
    if (params.priceRange?.min) {
      queryParams.append('minPrice', params.priceRange.min.toString());
    }
    
    if (params.priceRange?.max) {
      queryParams.append('maxPrice', params.priceRange.max.toString());
    }
    
    if (params.size?.min) {
      queryParams.append('minSize', params.size.min.toString());
    }
    
    if (params.size?.max) {
      queryParams.append('maxSize', params.size.max.toString());
    }
    
    if (params.rooms) {
      queryParams.append('rooms', params.rooms.toString());
    }
    
    return `${baseUrl}?${queryParams.toString()}`;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
