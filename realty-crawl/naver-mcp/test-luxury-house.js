import puppeteer from 'puppeteer';

async function testLuxuryHouseScraping() {
  console.log('🏠 Testing Luxury House website scraping...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to false to see what's happening
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Navigating to Luxury House website...');
    
    // Navigate to the website
    await page.goto('https://www.luxurynhouse.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a bit for content to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'luxury-house-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as luxury-house-screenshot.png');
    
    // Try to find property elements with different selectors
    console.log('🔍 Looking for property elements...');
    
    const selectors = [
      '.property-item',
      '.item_inner',
      '[class*="property"]',
      '.real-estate-item',
      '.listing-item',
      '.property-card',
      '.item',
      '.card'
    ];
    
    let foundElements = [];
    let foundSelector = null;
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          foundElements = elements;
          foundSelector = selector;
          console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (foundElements.length === 0) {
      console.log('❌ No property elements found with common selectors');
      
      // Let's look at the page structure
      console.log('🔍 Analyzing page structure...');
      
      const pageContent = await page.evaluate(() => {
        // Get all elements with classes
        const elementsWithClasses = Array.from(document.querySelectorAll('*[class]'));
        const classCounts = {};
        
        elementsWithClasses.forEach(el => {
          const classes = el.className.split(' ').filter(c => c.trim());
          classes.forEach(cls => {
            classCounts[cls] = (classCounts[cls] || 0) + 1;
          });
        });
        
        // Get top classes
        const topClasses = Object.entries(classCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20);
        
        return {
          title: document.title,
          url: window.location.href,
          topClasses: topClasses,
          bodyText: document.body.innerText.substring(0, 1000)
        };
      });
      
      console.log('📊 Page Analysis:');
      console.log(`Title: ${pageContent.title}`);
      console.log(`URL: ${pageContent.url}`);
      console.log('Top CSS Classes:');
      pageContent.topClasses.forEach(([cls, count]) => {
        console.log(`  ${cls}: ${count} occurrences`);
      });
      console.log('\nBody Text Preview:');
      console.log(pageContent.bodyText.substring(0, 500) + '...');
      
    } else {
      console.log(`📋 Analyzing ${foundElements.length} found elements...`);
      
      // Get information from the first few elements
      const propertyInfo = await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        const properties = [];
        
        // Analyze first 5 elements
        const elementsToAnalyze = Math.min(5, elements.length);
        
        for (let i = 0; i < elementsToAnalyze; i++) {
          const element = elements[i];
          const property = {
            index: i,
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.trim().substring(0, 200) || '',
            innerHTML: element.innerHTML?.substring(0, 300) || ''
          };
          
          properties.push(property);
        }
        
        return properties;
      }, foundSelector);
      
      console.log('🏠 Property Elements Analysis:');
      propertyInfo.forEach((prop, index) => {
        console.log(`\n--- Element ${index + 1} ---`);
        console.log(`Tag: ${prop.tagName}`);
        console.log(`Class: ${prop.className}`);
        console.log(`ID: ${prop.id}`);
        console.log(`Text: ${prop.textContent}`);
        console.log(`HTML Preview: ${prop.innerHTML}`);
      });
    }
    
    // Wait a bit more to see the page
    console.log('\n⏳ Waiting 10 seconds to view the page...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the test
testLuxuryHouseScraping().catch(console.error);
