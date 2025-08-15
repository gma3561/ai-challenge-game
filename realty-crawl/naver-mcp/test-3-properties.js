#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

class TestPropertyCrawler {
  constructor() {
    this.dataPath = './test-3-properties';
    this.ensureDataDirectory();
    this.maxProperties = 3; // 테스트용 3개만
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created test data directory');
    }
  }

  async startTestCrawling() {
    console.log('🧪 Starting test crawling for 3 properties...');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // 브라우저를 보면서 진행
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // 메인 페이지로 이동
      console.log('🌐 Navigating to Luxury House website...');
      await page.goto('https://www.luxurynhouse.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await page.waitForTimeout(3000);
      
      // 메인 페이지 스크린샷
      await page.screenshot({ 
        path: path.join(this.dataPath, 'main_page.png'), 
        fullPage: true 
      });
      console.log('📸 Main page screenshot saved');
      
      // 첫 번째 지역 선택 (청담/삼성)
      console.log('🏙️ Selecting first region: 청담/삼성');
      await this.selectRegion(page, '청담');
      
      // 2025년도 필터 적용 시도
      await this.applyYearFilter(page);
      
      // 3개 매물만 수집
      const properties = await this.collectProperties(page);
      
      // 각 매물의 상세 정보 및 사진 수집
      const detailedProperties = await this.collectDetailsAndImages(page, properties);
      
      // 결과 저장
      await this.saveResults(detailedProperties);
      
      console.log('✅ Test crawling completed successfully!');
      
    } catch (error) {
      console.error('❌ Test crawling failed:', error);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }

  async selectRegion(page, regionName) {
    try {
      // 지역 링크 찾기
      const regionLink = await page.$(`a:has-text("${regionName}")`);
      
      if (regionLink) {
        await regionLink.click();
        await page.waitForTimeout(3000);
        
        // 지역 페이지 스크린샷
        await page.screenshot({ 
          path: path.join(this.dataPath, `${regionName}_region_page.png`), 
          fullPage: true 
        });
        console.log(`   📍 Navigated to ${regionName} region`);
        
      } else {
        console.log(`⚠️ Region link not found for: ${regionName}`);
        // 대안: href에 지역명이 포함된 링크 찾기
        const links = await page.$$('a');
        for (const link of links) {
          const href = await link.evaluate(el => el.href);
          const text = await link.evaluate(el => el.textContent?.trim());
          
          if (href && text && (href.includes(regionName) || text.includes(regionName))) {
            await link.click();
            await page.waitForTimeout(3000);
            console.log(`   📍 Found alternative link for ${regionName}`);
            break;
          }
        }
      }
      
    } catch (error) {
      console.error(`Error selecting region ${regionName}:`, error);
    }
  }

  async applyYearFilter(page) {
    try {
      console.log('   📅 Applying 2025 year filter...');
      
      // 연도 입력 필드 찾기
      const yearInputs = await page.$$('input[type="date"], input[type="text"], select');
      
      for (const input of yearInputs) {
        const placeholder = await input.evaluate(el => el.placeholder);
        const type = await input.evaluate(el => el.type);
        
        if (placeholder && (placeholder.includes('년') || placeholder.includes('date'))) {
          // 연도 필터 입력
          await input.type('2025');
          console.log('   ✅ Applied year filter: 2025');
          break;
        }
      }
      
      // 필터 적용 버튼 클릭 시도
      const filterButtons = await page.$$('button, input[type="submit"], .filter-btn, .search-btn');
      for (const button of filterButtons) {
        const text = await button.evaluate(el => el.textContent?.trim());
        if (text && (text.includes('검색') || text.includes('적용') || text.includes('filter'))) {
          await button.click();
          await page.waitForTimeout(2000);
          console.log('   ✅ Applied filter');
          break;
        }
      }
      
    } catch (error) {
      console.log('   ⚠️ Could not apply year filter');
    }
  }

  async collectProperties(page) {
    try {
      console.log('   🏠 Collecting properties...');
      
      // 매물 컨테이너 찾기
      const properties = await page.evaluate(() => {
        const propertyElements = [];
        
        // 다양한 선택자로 매물 찾기
        const selectors = [
          '.property-item', '.item_inner', '[class*="property"]', '.real-estate-item',
          '.listing-item', '.property-card', '.item', '.card', '.house-item', '.building-item'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            propertyElements.push(...Array.from(elements));
            break;
          }
        }
        
        // 매물 정보 추출 (최대 3개)
        const properties = [];
        propertyElements.slice(0, 3).forEach((element, index) => {
          try {
            const titleElement = element.querySelector('h3, .title, .name, [class*="title"]');
            const priceElement = element.querySelector('.price, .cost, [class*="price"]');
            const locationElement = element.querySelector('.location, .address, [class*="location"]');
            const typeElement = element.querySelector('.type, .category, [class*="type"]');
            
            if (titleElement) {
              properties.push({
                id: `test_property_${Date.now()}_${index}`,
                title: titleElement.textContent?.trim() || '',
                price: priceElement?.textContent?.trim() || '가격 정보 없음',
                location: locationElement?.textContent?.trim() || '위치 정보 없음',
                propertyType: typeElement?.textContent?.trim() || '부동산',
                fullText: element.textContent?.trim() || '',
                url: window.location.href,
                elementIndex: index
              });
            }
          } catch (error) {
            console.error('Error parsing property element:', error);
          }
        });
        
        return properties;
      });
      
      console.log(`   📋 Found ${properties.length} properties`);
      return properties;
      
    } catch (error) {
      console.error('Error collecting properties:', error);
      return [];
    }
  }

  async collectDetailsAndImages(page, properties) {
    const detailedProperties = [];
    
    console.log('   🔍 Collecting details and images...');
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`   📋 Processing property ${i + 1}/${properties.length}: ${property.title.substring(0, 50)}...`);
      
      try {
        // 매물 상세 정보 수집
        const detail = await this.extractPropertyDetail(page, property);
        detailedProperties.push(detail);
        
        // 적절한 딜레이
        await this.delay(1000 + Math.random() * 2000);
        
      } catch (error) {
        console.error(`Error processing property ${property.title}:`, error);
        detailedProperties.push(property); // 기본 정보라도 저장
      }
    }
    
    return detailedProperties;
  }

  async extractPropertyDetail(page, property) {
    try {
      // 매물 링크 찾기 시도
      const propertyLinks = await page.$$('a[href*="property"], a[href*="detail"], a[href*="view"], a');
      
      if (propertyLinks.length > property.elementIndex) {
        const propertyLink = propertyLinks[property.elementIndex];
        
        // 새 탭에서 상세 페이지 열기
        const newPage = await page.browser().newPage();
        await newPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        
        const href = await propertyLink.evaluate(el => el.href);
        console.log(`      🔗 Opening detail page: ${href}`);
        
        await newPage.goto(href, { waitUntil: 'networkidle2' });
        await newPage.waitForTimeout(3000);
        
        // 상세 페이지 스크린샷
        const screenshotPath = path.join(this.dataPath, `property_${property.id}_detail.png`);
        await newPage.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`      📸 Detail page screenshot saved: ${screenshotPath}`);
        
        // 상세 정보 추출
        const detail = await newPage.evaluate(() => {
          return {
            detailUrl: window.location.href,
            detailTitle: document.title,
            detailBody: document.body.innerText.substring(0, 3000),
            forms: Array.from(document.querySelectorAll('form')).map(form => ({
              action: form.action,
              method: form.method,
              className: form.className
            })),
            inputs: Array.from(document.querySelectorAll('input')).map(input => ({
              type: input.type,
              name: input.name,
              value: input.value,
              placeholder: input.placeholder
            }))
          };
        });
        
        // 이미지 수집
        const images = await this.collectImages(newPage, property.id);
        
        await newPage.close();
        
        // 상세 정보와 기본 정보 결합
        return {
          ...property,
          ...detail,
          images: images,
          screenshotPath: screenshotPath
        };
      }
      
      return property;
      
    } catch (error) {
      console.error(`Error extracting detail for ${property.title}:`, error);
      return property;
    }
  }

  async collectImages(page, propertyId) {
    try {
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img');
        return Array.from(imgElements).map((img, index) => ({
          src: img.src,
          alt: img.alt || `Image ${index + 1}`,
          className: img.className,
          width: img.naturalWidth,
          height: img.naturalHeight
        })).filter(img => img.src && img.src.startsWith('http')); // 외부 이미지만
      });
      
      console.log(`      🖼️ Found ${images.length} images`);
      
      // 이미지 다운로드 시도
      const downloadedImages = [];
      for (let i = 0; i < Math.min(images.length, 5); i++) { // 최대 5개만 다운로드
        const image = images[i];
        try {
          const imagePath = await this.downloadImage(page, image, propertyId, i);
          if (imagePath) {
            downloadedImages.push({
              ...image,
              localPath: imagePath
            });
          }
        } catch (error) {
          console.log(`         ⚠️ Failed to download image ${i + 1}: ${error.message}`);
        }
      }
      
      return downloadedImages;
      
    } catch (error) {
      console.error('Error collecting images:', error);
      return [];
    }
  }

  async downloadImage(page, image, propertyId, index) {
    try {
      // 이미지 URL로 이동
      await page.goto(image.src, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);
      
      // 이미지 파일명 생성
      const imageName = `property_${propertyId}_image_${index + 1}.png`;
      const imagePath = path.join(this.dataPath, imageName);
      
      // 이미지 스크린샷으로 저장
      await page.screenshot({ 
        path: imagePath,
        type: 'png'
      });
      
      console.log(`         💾 Image downloaded: ${imageName}`);
      return imagePath;
      
    } catch (error) {
      console.log(`         ⚠️ Image download failed: ${error.message}`);
      return null;
    }
  }

  async saveResults(properties) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `test_3_properties_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      const data = {
        testInfo: {
          crawledAt: new Date().toISOString(),
          propertyCount: properties.length,
          maxProperties: this.maxProperties,
          description: 'Test crawling for 3 properties with images'
        },
        properties: properties
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Results saved to ${fileName}`);
      
      // 요약 리포트 생성
      await this.generateSummaryReport(properties);
      
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }

  async generateSummaryReport(properties) {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        totalProperties: properties.length,
        propertiesWithImages: properties.filter(p => p.images && p.images.length > 0).length,
        propertiesWithDetails: properties.filter(p => p.detailUrl).length,
        imageCount: properties.reduce((total, p) => total + (p.images ? p.images.length : 0), 0)
      };
      
      const reportPath = path.join(this.dataPath, `test_summary_report_${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log('\n📊 Test Summary Report:');
      console.log(`   Total Properties: ${report.totalProperties}`);
      console.log(`   Properties with Images: ${report.propertiesWithImages}`);
      console.log(`   Properties with Details: ${report.propertiesWithDetails}`);
      console.log(`   Total Images: ${report.imageCount}`);
      
    } catch (error) {
      console.error('Error generating summary report:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 메인 실행
async function main() {
  const crawler = new TestPropertyCrawler();
  await crawler.startTestCrawling();
}

// 테스트 크롤링 실행
main().catch(console.error);
