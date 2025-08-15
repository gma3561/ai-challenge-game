import puppeteer from 'puppeteer';
import { Logger } from '../utils/logger.js';
export class LuxuryHouseMonitor {
    browser = null;
    logger;
    config;
    previousProperties = new Map();
    isMonitoring = false;
    monitorInterval = null;
    constructor(config) {
        this.config = config;
        this.logger = new Logger();
    }
    async startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Monitoring is already running');
            return;
        }
        this.logger.info('Starting Luxury House monitoring...');
        this.isMonitoring = true;
        // Load previous properties from file if exists
        await this.loadPreviousProperties();
        // Start monitoring loop
        this.monitorInterval = setInterval(async () => {
            await this.checkNewProperties();
        }, this.config.checkInterval);
        // Initial check
        await this.checkNewProperties();
    }
    async stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        this.logger.info('Stopping Luxury House monitoring...');
        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        await this.saveCurrentProperties();
    }
    async checkNewProperties() {
        try {
            this.logger.info('Checking for new properties...');
            const currentProperties = await this.scrapeProperties();
            const newProperties = this.findNewProperties(currentProperties);
            if (newProperties.length > 0) {
                this.logger.info(`Found ${newProperties.length} new properties!`);
                await this.notifyNewProperties(newProperties);
                // Update previous properties
                currentProperties.forEach(prop => {
                    this.previousProperties.set(prop.id, prop);
                });
                // Save current state
                await this.saveCurrentProperties();
            }
            else {
                this.logger.info('No new properties found');
            }
        }
        catch (error) {
            this.logger.error('Error checking new properties:', error);
        }
    }
    async scrapeProperties() {
        try {
            const browser = await this.getBrowser();
            const page = await browser.newPage();
            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            // Navigate to luxury house website
            await page.goto('https://www.luxurynhouse.com/', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            // Wait for page to load and take screenshot
            await page.waitForTimeout(5000);
            await page.screenshot({ path: 'luxury-house-current.png', fullPage: true });
            // Try multiple approaches to find properties
            const properties = await this.extractPropertiesWithMultipleMethods(page);
            await page.close();
            this.logger.info(`Scraped ${properties.length} properties from Luxury House website`);
            return properties;
        }
        catch (error) {
            this.logger.error('Error scraping properties:', error);
            return [];
        }
    }
    async extractPropertiesWithMultipleMethods(page) {
        // Method 1: Look for common property selectors
        let properties = await this.extractWithSelectors(page);
        if (properties.length === 0) {
            // Method 2: Look for text patterns that indicate properties
            properties = await this.extractWithTextPatterns(page);
        }
        if (properties.length === 0) {
            // Method 3: Extract from page structure analysis
            properties = await this.extractFromPageStructure(page);
        }
        return properties;
    }
    async extractWithSelectors(page) {
        const selectors = [
            '.property-item',
            '.item_inner',
            '[class*="property"]',
            '.real-estate-item',
            '.listing-item',
            '.property-card',
            '.item',
            '.card',
            '.house-item',
            '.building-item'
        ];
        for (const selector of selectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    this.logger.info(`Found ${elements.length} elements with selector: ${selector}`);
                    const properties = await page.evaluate((sel) => {
                        const elements = document.querySelectorAll(sel);
                        const props = [];
                        elements.forEach((element, index) => {
                            try {
                                const titleElement = element.querySelector('h3, .title, .name, [class*="title"]');
                                const priceElement = element.querySelector('.price, .cost, [class*="price"]');
                                const locationElement = element.querySelector('.location, .address, [class*="location"]');
                                if (titleElement) {
                                    props.push({
                                        id: `luxury_${Date.now()}_${index}`,
                                        title: titleElement.textContent?.trim() || '',
                                        price: priceElement?.textContent?.trim() || '가격 정보 없음',
                                        location: locationElement?.textContent?.trim() || '위치 정보 없음',
                                        propertyType: '부동산',
                                        size: '',
                                        rooms: '',
                                        floor: '',
                                        postedDate: new Date().toISOString().split('T')[0],
                                        url: window.location.href
                                    });
                                }
                            }
                            catch (error) {
                                console.error('Error parsing element:', error);
                            }
                        });
                        return props;
                    }, selector);
                    if (properties.length > 0) {
                        return properties;
                    }
                }
            }
            catch (error) {
                // Continue to next selector
            }
        }
        return [];
    }
    async extractWithTextPatterns(page) {
        return await page.evaluate(() => {
            const properties = [];
            const text = document.body.innerText;
            // Look for patterns that indicate property listings
            const lines = text.split('\n').filter(line => line.trim());
            lines.forEach((line, index) => {
                // Look for lines that might contain property information
                if (line.includes('억') || line.includes('천만') || line.includes('평') ||
                    line.includes('㎡') || line.includes('층') || line.includes('룸')) {
                    // Try to extract meaningful information
                    const priceMatch = line.match(/(\d+억|\d+천만)/);
                    const sizeMatch = line.match(/(\d+평|\d+㎡)/);
                    const locationMatch = line.match(/(강남|서초|송파|마포|용산|성동|광진|중구|종로|영등포|동작|관악|서대문|은평|노원|도봉|강북|성북|중랑|강동|송파)/);
                    if (priceMatch || sizeMatch || locationMatch) {
                        properties.push({
                            id: `luxury_text_${Date.now()}_${index}`,
                            title: line.substring(0, 100).trim(),
                            price: priceMatch ? priceMatch[0] : '가격 정보 없음',
                            location: locationMatch ? locationMatch[0] : '위치 정보 없음',
                            propertyType: '부동산',
                            size: sizeMatch ? sizeMatch[0] : '',
                            rooms: '',
                            floor: '',
                            postedDate: new Date().toISOString().split('T')[0],
                            url: window.location.href
                        });
                    }
                }
            });
            return properties;
        });
    }
    async extractFromPageStructure(page) {
        return await page.evaluate(() => {
            const properties = [];
            // Analyze the page structure to find potential property information
            const bodyText = document.body.innerText;
            // Look for common property-related keywords
            const propertyKeywords = ['아파트', '빌라', '오피스텔', '단독주택', '상가', '사무실', '매매', '전세', '월세'];
            const priceKeywords = ['억', '천만', '만원'];
            const locationKeywords = ['구', '동', '로', '길'];
            // Split text into sections and analyze each
            const sections = bodyText.split(/\n{2,}/);
            sections.forEach((section, index) => {
                if (section.length > 50 && section.length < 500) { // Reasonable section size
                    const hasPropertyKeyword = propertyKeywords.some(keyword => section.includes(keyword));
                    const hasPriceKeyword = priceKeywords.some(keyword => section.includes(keyword));
                    const hasLocationKeyword = locationKeywords.some(keyword => section.includes(keyword));
                    if (hasPropertyKeyword && (hasPriceKeyword || hasLocationKeyword)) {
                        // Extract price if available
                        const priceMatch = section.match(/(\d+억|\d+천만)/);
                        const price = priceMatch ? priceMatch[0] : '가격 정보 없음';
                        // Extract location if available
                        const locationMatch = section.match(/([가-힣]+구|[가-힣]+동)/);
                        const location = locationMatch ? locationMatch[0] : '위치 정보 없음';
                        properties.push({
                            id: `luxury_structure_${Date.now()}_${index}`,
                            title: section.substring(0, 100).trim(),
                            price: price,
                            location: location,
                            propertyType: '부동산',
                            size: '',
                            rooms: '',
                            floor: '',
                            postedDate: new Date().toISOString().split('T')[0],
                            url: window.location.href
                        });
                    }
                }
            });
            return properties;
        });
    }
    findNewProperties(currentProperties) {
        const newProperties = [];
        currentProperties.forEach(property => {
            if (!this.previousProperties.has(property.id)) {
                newProperties.push(property);
            }
        });
        return newProperties;
    }
    async notifyNewProperties(properties) {
        try {
            // Console notification
            this.logger.info('=== NEW PROPERTIES FOUND ===');
            properties.forEach(prop => {
                this.logger.info(`🏠 ${prop.title} - ${prop.price} - ${prop.location}`);
            });
            // Email notification (if configured)
            if (this.config.notificationEmail) {
                await this.sendEmailNotification(properties);
            }
            // SMS notification (if configured)
            if (this.config.notificationPhone) {
                await this.sendSMSNotification(properties);
            }
            // Save to file
            if (this.config.saveToFile) {
                await this.saveNewPropertiesToFile(properties);
            }
        }
        catch (error) {
            this.logger.error('Error sending notifications:', error);
        }
    }
    async sendEmailNotification(properties) {
        // Email notification implementation
        this.logger.info('Email notification would be sent here');
        // In real implementation, you would use nodemailer or similar service
    }
    async sendSMSNotification(properties) {
        // SMS notification implementation
        this.logger.info('SMS notification would be sent here');
        // In real implementation, you would use Twilio or similar service
    }
    async saveNewPropertiesToFile(properties) {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `new_properties_${timestamp}.json`;
            const filePath = path.join(this.config.filePath, fileName);
            const data = {
                timestamp: new Date().toISOString(),
                count: properties.length,
                properties: properties
            };
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            this.logger.info(`New properties saved to ${filePath}`);
        }
        catch (error) {
            this.logger.error('Error saving properties to file:', error);
        }
    }
    async loadPreviousProperties() {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const filePath = path.join(this.config.filePath, 'previous_properties.json');
            if (await fs.access(filePath).then(() => true).catch(() => false)) {
                const data = await fs.readFile(filePath, 'utf8');
                const properties = JSON.parse(data);
                properties.forEach((prop) => {
                    this.previousProperties.set(prop.id, prop);
                });
                this.logger.info(`Loaded ${this.previousProperties.size} previous properties`);
            }
        }
        catch (error) {
            this.logger.error('Error loading previous properties:', error);
        }
    }
    async saveCurrentProperties() {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const filePath = path.join(this.config.filePath, 'previous_properties.json');
            const data = Array.from(this.previousProperties.values());
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            this.logger.info(`Current properties saved to ${filePath}`);
        }
        catch (error) {
            this.logger.error('Error saving current properties:', error);
        }
    }
    async getBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
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
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    // Get current monitoring status
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            propertyCount: this.previousProperties.size
        };
    }
    // Get all current properties
    getAllProperties() {
        return Array.from(this.previousProperties.values());
    }
}
//# sourceMappingURL=luxury-house-monitor.js.map