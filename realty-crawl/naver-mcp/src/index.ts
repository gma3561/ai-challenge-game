#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ImageContent,
  EmbeddedResource
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { NaverCrawler } from './crawlers/naver-crawler.js';
import { PropertyService } from './services/property-service.js';
import { NaverApiClient } from './services/naver-api-client.js';
import { Logger } from './utils/logger.js';
import configManager from './config/config.js';

// Load environment variables
config();

class NaverMCPServer {
  private server: Server;
  private naverCrawler: NaverCrawler;
  private propertyService: PropertyService;
  private naverApiClient: NaverApiClient;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    
    // Validate configuration
    if (!configManager.validate()) {
      throw new Error('Configuration validation failed');
    }
    
    this.naverCrawler = new NaverCrawler();
    this.propertyService = new PropertyService();
    
    // Initialize Naver API client
    const naverConfig = configManager.getNaverConfig();
    this.naverApiClient = new NaverApiClient({
      accessLicense: naverConfig.accessLicense,
      secretKey: naverConfig.secretKey,
      baseUrl: naverConfig.baseUrl
    });
    
    this.server = new Server({
      name: 'naver-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: {},
      },
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_properties',
            description: 'Search for properties on Naver Real Estate using web crawling and API',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to search (e.g., "강남구", "서울시")'
                },
                propertyType: {
                  type: 'string',
                  description: 'Type of property (e.g., "아파트", "빌라", "오피스텔")',
                  enum: ['아파트', '빌라', '오피스텔', '단독주택', '상가']
                },
                priceRange: {
                  type: 'object',
                  properties: {
                    min: { type: 'number', description: 'Minimum price in millions' },
                    max: { type: 'number', description: 'Maximum price in millions' }
                  }
                },
                size: {
                  type: 'object',
                  properties: {
                    min: { type: 'number', description: 'Minimum size in square meters' },
                    max: { type: 'number', description: 'Maximum size in square meters' }
                  }
                },
                rooms: {
                  type: 'number',
                  description: 'Number of rooms'
                }
              },
              required: ['location']
            }
          },
          {
            name: 'get_property_details',
            description: 'Get detailed information about a specific property',
            inputSchema: {
              type: 'object',
              properties: {
                propertyId: {
                  type: 'string',
                  description: 'Unique identifier of the property'
                }
              },
              required: ['propertyId']
            }
          },
          {
            name: 'get_market_trends',
            description: 'Get market trends and statistics for a specific area using Naver API',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to analyze (e.g., "강남구", "서울시")'
                },
                period: {
                  type: 'string',
                  description: 'Time period for analysis',
                  enum: ['1개월', '3개월', '6개월', '1년']
                }
              },
              required: ['location']
            }
          },
          {
            name: 'compare_properties',
            description: 'Compare multiple properties side by side',
            inputSchema: {
              type: 'object',
              properties: {
                propertyIds: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of property IDs to compare',
                  minItems: 2,
                  maxItems: 5
                }
              },
              required: ['propertyIds']
            }
          },
          {
            name: 'search_naver_api',
            description: 'Search using Naver Search API for real estate related information',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for real estate information'
                },
                searchType: {
                  type: 'string',
                  description: 'Type of search to perform',
                  enum: ['web', 'news', 'real_estate', 'market_trends', 'investment_insights']
                },
                display: {
                  type: 'number',
                  description: 'Number of results to return (max 100)',
                  minimum: 1,
                  maximum: 100
                }
              },
              required: ['query', 'searchType']
            }
          },
          {
            name: 'get_property_analysis',
            description: 'Get comprehensive property analysis for a specific area and property type',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to analyze'
                },
                propertyType: {
                  type: 'string',
                  description: 'Type of property to analyze',
                  enum: ['아파트', '빌라', '오피스텔', '단독주택', '상가']
                }
              },
              required: ['location', 'propertyType']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        this.logger.info(`Tool called: ${name}`, { args });
        
        switch (name) {
          case 'search_properties':
            return await this.handleSearchProperties(args);
          
          case 'get_property_details':
            return await this.handleGetPropertyDetails(args);
          
          case 'get_market_trends':
            return await this.handleGetMarketTrends(args);
          
          case 'compare_properties':
            return await this.handleCompareProperties(args);
          
          case 'search_naver_api':
            return await this.handleSearchNaverApi(args);
          
          case 'get_property_analysis':
            return await this.handleGetPropertyAnalysis(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Error executing tool ${name}:`, error);
        throw error;
      }
    });
  }

  private async handleSearchProperties(args: any) {
    const { location, propertyType, priceRange, size, rooms } = args;
    
    const properties = await this.naverCrawler.searchProperties({
      location,
      propertyType,
      priceRange,
      size,
      rooms
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${properties.length} properties in ${location}`
        },
        {
          type: 'text',
          text: JSON.stringify(properties, null, 2)
        }
      ]
    };
  }

  private async handleGetPropertyDetails(args: any) {
    const { propertyId } = args;
    
    const details = await this.naverCrawler.getPropertyDetails(propertyId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Property Details for ${propertyId}`
        },
        {
          type: 'text',
          text: JSON.stringify(details, null, 2)
        }
      ]
    };
  }

  private async handleGetMarketTrends(args: any) {
    const { location, period } = args;
    
    // Use Naver API for market trends
    const apiTrends = await this.naverApiClient.getMarketTrends(location);
    const serviceTrends = await this.propertyService.getMarketTrends(location, period);
    
    const combinedTrends = {
      apiData: apiTrends,
      serviceData: serviceTrends,
      location,
      period
    };
    
    return {
      content: [
        {
          type: 'text',
          text: `Market Trends for ${location} (${period}) - Combined from API and Service`
        },
        {
          type: 'text',
          text: JSON.stringify(combinedTrends, null, 2)
        }
      ]
    };
  }

  private async handleCompareProperties(args: any) {
    const { propertyIds } = args;
    
    const comparison = await this.propertyService.compareProperties(propertyIds);
    
    return {
      content: [
        {
          type: 'text',
          text: `Property Comparison`
        },
        {
          type: 'text',
          text: JSON.stringify(comparison, null, 2)
        }
      ]
    };
  }

  private async handleSearchNaverApi(args: any) {
    const { query, searchType, display = 10 } = args;
    
    let result;
    
    switch (searchType) {
      case 'web':
        result = await this.naverApiClient.searchWebDocuments({ query, display });
        break;
      case 'news':
        result = await this.naverApiClient.searchNews({ query, display });
        break;
      case 'real_estate':
        result = await this.naverApiClient.searchRealEstate(query);
        break;
      case 'market_trends':
        result = await this.naverApiClient.getMarketTrends(query);
        break;
      case 'investment_insights':
        result = await this.naverApiClient.getInvestmentInsights(query);
        break;
      default:
        throw new Error(`Unknown search type: ${searchType}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Naver API Search Results for "${query}" (${searchType})`
        },
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleGetPropertyAnalysis(args: any) {
    const { location, propertyType } = args;
    
    const analysis = await this.naverApiClient.getPropertyAnalysis(propertyType, location);
    
    return {
      content: [
        {
          type: 'text',
          text: `Property Analysis for ${propertyType} in ${location}`
        },
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2)
        }
      ]
    };
  }

  async run() {
    try {
      this.logger.info('Starting Naver MCP Server...');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.logger.info('Naver MCP Server started successfully');
      
      // Keep the process alive
      process.on('SIGINT', () => {
        this.logger.info('Shutting down Naver MCP Server...');
        this.naverCrawler.close();
        process.exit(0);
      });
      
    } catch (error) {
      this.logger.error('Failed to start Naver MCP Server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new NaverMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
