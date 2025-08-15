#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

class SimpleLuxuryHouseMonitor {
  constructor() {
    this.dataPath = './data';
    this.previousDataFile = path.join(this.dataPath, 'previous_data.json');
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created data directory');
    }
  }

  async loadPreviousData() {
    try {
      const data = await fs.readFile(this.previousDataFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { properties: [], lastCheck: null };
    }
  }

  async saveCurrentData(data) {
    await fs.writeFile(this.previousDataFile, JSON.stringify(data, null, 2));
  }

  async scrapeWebsite() {
    console.log('🌐 Scraping Luxury House website...');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // Navigate to website
      await page.goto('https://www.luxurynhouse.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForTimeout(5000);

      // Take screenshot
      await page.screenshot({ path: path.join(this.dataPath, 'current_screenshot.png') });
      console.log('📸 Screenshot saved');

      // Extract page information
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyText: document.body.innerText.substring(0, 2000),
          timestamp: new Date().toISOString()
        };
      });

      // Look for property-related information in text
      const properties = this.extractPropertiesFromText(pageInfo.bodyText);
      
      await browser.close();
      
      return {
        timestamp: pageInfo.timestamp,
        properties: properties,
        pageInfo: pageInfo
      };

    } catch (error) {
      console.error('❌ Error scraping website:', error);
      if (browser) await browser.close();
      return null;
    }
  }

  extractPropertiesFromText(text) {
    const properties = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    // Look for property indicators
    lines.forEach((line, index) => {
      if (line.length > 20 && line.length < 200) {
        const hasPrice = /\d+억|\d+천만|\d+만원/.test(line);
        const hasLocation = /(강남|서초|송파|마포|용산|성동|광진|중구|종로|영등포|동작|관악|서대문|은평|노원|도봉|강북|성북|중랑|강동|송파)구/.test(line);
        const hasPropertyType = /(아파트|빌라|오피스텔|단독주택|상가|사무실|빌딩)/.test(line);
        
        if ((hasPrice && hasLocation) || (hasPropertyType && hasLocation)) {
          const priceMatch = line.match(/(\d+억|\d+천만|\d+만원)/);
          const locationMatch = line.match(/([가-힣]+구)/);
          
          properties.push({
            id: `luxury_${Date.now()}_${index}`,
            title: line.substring(0, 100).trim(),
            price: priceMatch ? priceMatch[0] : '가격 정보 없음',
            location: locationMatch ? locationMatch[0] : '위치 정보 없음',
            fullText: line.trim(),
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    return properties;
  }

  async checkForNewProperties() {
    console.log('🔍 Checking for new properties...');
    
    const previousData = await this.loadPreviousData();
    const currentData = await this.scrapeWebsite();
    
    if (!currentData) {
      console.log('❌ Failed to scrape website');
      return;
    }
    
    // Find new properties
    const newProperties = [];
    const previousIds = new Set(previousData.properties.map(p => p.id));
    
    currentData.properties.forEach(prop => {
      if (!previousIds.has(prop.id)) {
        newProperties.push(prop);
      }
    });
    
    if (newProperties.length > 0) {
      console.log(`🎉 Found ${newProperties.length} new properties!`);
      newProperties.forEach(prop => {
        console.log(`🏠 ${prop.title}`);
        console.log(`   💰 ${prop.price} | 📍 ${prop.location}`);
        console.log(`   📝 ${prop.fullText.substring(0, 80)}...`);
        console.log('---');
      });
      
      // Save new properties to separate file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newPropertiesFile = path.join(this.dataPath, `new_properties_${timestamp}.json`);
      await fs.writeFile(newPropertiesFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        count: newProperties.length,
        properties: newProperties
      }, null, 2));
      
      console.log(`💾 New properties saved to ${newPropertiesFile}`);
      
    } else {
      console.log('✅ No new properties found');
    }
    
    // Save current data as previous
    await this.saveCurrentData(currentData);
    
    return {
      totalProperties: currentData.properties.length,
      newProperties: newProperties.length,
      timestamp: currentData.timestamp
    };
  }

  async startMonitoring(intervalMinutes = 5) {
    console.log(`🏠 Starting Luxury House monitoring (checking every ${intervalMinutes} minutes)...`);
    console.log(`📁 Data will be saved to: ${this.dataPath}`);
    
    // Initial check
    await this.checkForNewProperties();
    
    // Set up interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(async () => {
      console.log(`\n⏰ Scheduled check at ${new Date().toLocaleString()}`);
      await this.checkForNewProperties();
    }, intervalMs);
    
    // Keep process running
    console.log(`\n🔄 Monitoring active. Press Ctrl+C to stop.`);
  }
}

// Main execution
async function main() {
  const monitor = new SimpleLuxuryHouseMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping monitor...');
    process.exit(0);
  });
  
  // Start monitoring with 5-minute intervals
  await monitor.startMonitoring(5);
}

// Run the monitor
main().catch(console.error);
