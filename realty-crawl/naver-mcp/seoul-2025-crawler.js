#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

class Seoul2025PropertyCrawler {
  constructor() {
    this.dataPath = './seoul-2025-data';
    this.ensureDataDirectory();
    this.seoulRegions = [
      '청담/삼성', '압구정/신사', '대치/도곡', '논현/역삼', '개포/세곡/일원',
      '방배/서초', '우면/염곡/내곡', '한남/이태원', '동빙고/동부이촌', '한강로/용산',
      '청암', '가락/잠실', '신천/석촌', '문정/장지', '자양', '신당', '흥인동',
      '회현동/명동', '옥수/금호', '성수', '가회/청운', '부암/구기/평창', '성북',
      '연희동/홍은동', '여의도동'
    ];
    this.crawledProperties = new Map();
    this.currentRegion = '';
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created Seoul 2025 data directory');
    }
  }

  async startCrawling() {
    console.log('🏠 Starting Seoul 2025 Property Crawling...');
    console.log(`📍 Target regions: ${this.seoulRegions.length}개`);
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // 브라우저를 보면서 진행
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // 메인 페이지로 이동
      await page.goto('https://www.luxurynhouse.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await page.waitForTimeout(3000);
      
      // 각 서울시 지역별로 크롤링
      for (const region of this.seoulRegions) {
        try {
          console.log(`\n🏙️ Processing region: ${region}`);
          this.currentRegion = region;
          
          await this.crawlRegion(page, region);
          
          // 지역 간 딜레이
          await this.delay(2000 + Math.random() * 3000);
          
        } catch (error) {
          console.error(`❌ Error processing region ${region}:`, error);
          continue; // 다음 지역으로 진행
        }
      }
      
      // 최종 결과 저장
      await this.saveFinalResults();
      
      console.log('\n✅ Seoul 2025 Property Crawling completed!');
      
    } catch (error) {
      console.error('❌ Crawling failed:', error);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }

  async crawlRegion(page, region) {
    try {
      // 지역 링크 찾기 및 클릭
      const regionLink = await this.findRegionLink(page, region);
      if (!regionLink) {
        console.log(`⚠️ Region link not found for: ${region}`);
        return;
      }
      
      // 지역 페이지로 이동
      await regionLink.click();
      await page.waitForTimeout(3000);
      
      // 지역 페이지 스크린샷
      await page.screenshot({ 
        path: path.join(this.dataPath, `${region.replace(/\//g, '_')}_page.png`),
        fullPage: true 
      });
      
      console.log(`   📍 Navigated to ${region} page`);
      
      // 2025년도 필터 적용 시도
      await this.applyYearFilter(page);
      
      // "더보기" 버튼을 통한 모든 매물 로드
      const allProperties = await this.loadAllProperties(page);
      
      console.log(`   🏠 Found ${allProperties.length} properties in ${region}`);
      
      // 각 매물의 상세 정보 수집
      const detailedProperties = await this.crawlPropertyDetails(page, allProperties);
      
      // 지역별 결과 저장
      await this.saveRegionResults(region, detailedProperties);
      
    } catch (error) {
      console.error(`Error crawling region ${region}:`, error);
    }
  }

  async findRegionLink(page, region) {
    try {
      // 지역명으로 링크 찾기
      const regionNames = region.split('/');
      
      for (const name of regionNames) {
        const link = await page.$(`a:has-text("${name}")`);
        if (link) {
          return link;
        }
      }
      
      // 대안: href에 지역명이 포함된 링크 찾기
      const links = await page.$$('a');
      for (const link of links) {
        const href = await link.evaluate(el => el.href);
        const text = await link.evaluate(el => el.textContent?.trim());
        
        if (href && text && regionNames.some(name => 
          href.includes(name) || text.includes(name)
        )) {
          return link;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding region link for ${region}:`, error);
      return null;
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
        const className = await input.evaluate(el => el.className);
        
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

  async loadAllProperties(page) {
    const properties = [];
    let hasMoreButton = true;
    let clickCount = 0;
    const maxClicks = 30; // 무한 로딩 방지
    
    try {
      while (hasMoreButton && clickCount < maxClicks) {
        // 현재 페이지의 매물들 수집
        const currentProperties = await this.extractCurrentPageProperties(page);
        properties.push(...currentProperties);
        
        console.log(`   📋 Loaded ${properties.length} properties so far...`);
        
        // "더보기" 버튼 찾기
        const moreButton = await this.findMoreButton(page);
        
        if (moreButton && await moreButton.isVisible()) {
          // 버튼 클릭
          await moreButton.click();
          
          // 새로운 매물들이 로드될 때까지 대기
          await this.waitForNewProperties(page, properties.length);
          
          clickCount++;
          console.log(`   ⏭️ Clicked "more" button ${clickCount} times`);
          
          // 적절한 딜레이
          await this.delay(1000 + Math.random() * 2000);
          
        } else {
          hasMoreButton = false;
          console.log('   ✅ No more properties to load');
        }
      }
      
    } catch (error) {
      console.error('Error loading all properties:', error);
    }
    
    return properties;
  }

  async extractCurrentPageProperties(page) {
    try {
      return await page.evaluate(() => {
        const properties = [];
        
        // 매물 컨테이너 찾기 (다양한 선택자 시도)
        const selectors = [
          '.property-item', '.item_inner', '[class*="property"]', '.real-estate-item',
          '.listing-item', '.property-card', '.item', '.card', '.house-item', '.building-item'
        ];
        
        let propertyElements = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            propertyElements = Array.from(elements);
            break;
          }
        }
        
        // 매물 정보 추출
        propertyElements.forEach((element, index) => {
          try {
            const titleElement = element.querySelector('h3, .title, .name, [class*="title"]');
            const priceElement = element.querySelector('.price, .cost, [class*="price"]');
            const locationElement = element.querySelector('.location, .address, [class*="location"]');
            const typeElement = element.querySelector('.type, .category, [class*="type"]');
            const dateElement = element.querySelector('.date, .posted, [class*="date"]');
            
            if (titleElement) {
              const property = {
                id: `seoul_2025_${Date.now()}_${index}`,
                title: titleElement.textContent?.trim() || '',
                price: priceElement?.textContent?.trim() || '가격 정보 없음',
                location: locationElement?.textContent?.trim() || '위치 정보 없음',
                propertyType: typeElement?.textContent?.trim() || '부동산',
                postedDate: dateElement?.textContent?.trim() || new Date().toISOString().split('T')[0],
                fullText: element.textContent?.trim() || '',
                url: window.location.href
              };
              
              properties.push(property);
            }
          } catch (error) {
            console.error('Error parsing property element:', error);
          }
        });
        
        return properties;
      });
      
    } catch (error) {
      console.error('Error extracting properties:', error);
      return [];
    }
  }

  async findMoreButton(page) {
    try {
      // 다양한 "더보기" 버튼 선택자 시도
      const selectors = [
        'button:has-text("더보기")',
        'a:has-text("더보기")',
        '.more',
        '.load-more',
        '.show-more',
        '[class*="more"]',
        '[class*="load"]'
      ];
      
      for (const selector of selectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            const isVisible = await button.isVisible();
            if (isVisible) {
              return button;
            }
          }
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      // 텍스트 기반으로 찾기
      const buttons = await page.$$('button, a');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent?.trim());
        if (text && (text.includes('더보기') || text.includes('더 많은') || text.includes('추가'))) {
          const isVisible = await button.isVisible();
          if (isVisible) {
            return button;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding more button:', error);
      return null;
    }
  }

  async waitForNewProperties(page, currentCount) {
    const maxWait = 10000; // 최대 10초 대기
    const checkInterval = 500; // 0.5초마다 확인
    let waited = 0;
    
    while (waited < maxWait) {
      await this.delay(checkInterval);
      waited += checkInterval;
      
      const newCount = await page.evaluate(() => {
        const selectors = ['.property-item', '.item_inner', '[class*="property"]', '.item', '.card'];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            return elements.length;
          }
        }
        return 0;
      });
      
      if (newCount > currentCount) {
        console.log(`   ✅ New properties loaded: ${newCount - currentCount}`);
        return;
      }
    }
    
    console.log('   ⏰ Timeout waiting for new properties');
  }

  async crawlPropertyDetails(page, properties) {
    const detailedProperties = [];
    
    console.log(`   🔍 Crawling details for ${properties.length} properties...`);
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`   📋 Processing ${i + 1}/${properties.length}: ${property.title.substring(0, 50)}...`);
      
      try {
        // 매물 상세 정보 수집 시도
        const detail = await this.extractPropertyDetail(page, property);
        detailedProperties.push(detail);
        
        // 적절한 딜레이
        await this.delay(500 + Math.random() * 1000);
        
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
      const propertyLink = await page.$(`a[href*="property"], a[href*="detail"], a[href*="view"]`);
      
      if (propertyLink) {
        // 새 탭에서 상세 페이지 열기
        const newPage = await page.browser().newPage();
        await newPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        
        const href = await propertyLink.evaluate(el => el.href);
        await newPage.goto(href, { waitUntil: 'networkidle2' });
        await newPage.waitForTimeout(2000);
        
        // 상세 정보 추출
        const detail = await newPage.evaluate(() => {
          return {
            detailUrl: window.location.href,
            detailTitle: document.title,
            detailBody: document.body.innerText.substring(0, 3000),
            images: Array.from(document.querySelectorAll('img')).map(img => ({
              src: img.src,
              alt: img.alt
            }))
          };
        });
        
        await newPage.close();
        
        // 상세 정보와 기본 정보 결합
        return {
          ...property,
          ...detail
        };
      }
      
      return property;
      
    } catch (error) {
      console.error(`Error extracting detail for ${property.title}:`, error);
      return property;
    }
  }

  async saveRegionResults(region, properties) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${region.replace(/\//g, '_')}_2025_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      const data = {
        region: region,
        year: '2025',
        crawledAt: new Date().toISOString(),
        propertyCount: properties.length,
        properties: properties
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`   💾 Saved ${properties.length} properties to ${fileName}`);
      
      // 전체 결과에 추가
      properties.forEach(prop => {
        this.crawledProperties.set(prop.id, prop);
      });
      
    } catch (error) {
      console.error(`Error saving results for ${region}:`, error);
    }
  }

  async saveFinalResults() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `seoul_2025_all_properties_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      const allProperties = Array.from(this.crawledProperties.values());
      
      const finalData = {
        summary: {
          totalProperties: allProperties.length,
          regions: this.seoulRegions,
          year: '2025',
          crawledAt: new Date().toISOString()
        },
        properties: allProperties
      };
      
      await fs.writeFile(filePath, JSON.stringify(finalData, null, 2));
      console.log(`\n🎉 Final results saved: ${allProperties.length} properties in ${fileName}`);
      
      // 요약 리포트 생성
      await this.generateSummaryReport(allProperties);
      
    } catch (error) {
      console.error('Error saving final results:', error);
    }
  }

  async generateSummaryReport(properties) {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        totalProperties: properties.length,
        regionBreakdown: {},
        propertyTypeBreakdown: {},
        priceRangeBreakdown: {}
      };
      
      // 지역별 분류
      properties.forEach(prop => {
        const region = prop.location || '미분류';
        report.regionBreakdown[region] = (report.regionBreakdown[region] || 0) + 1;
        
        const type = prop.propertyType || '미분류';
        report.propertyTypeBreakdown[type] = (report.propertyTypeBreakdown[type] || 0) + 1;
        
        // 가격 범위 분류
        const price = prop.price;
        if (price && price.includes('억')) {
          const priceNum = parseFloat(price.replace(/[^\d.]/g, ''));
          if (priceNum <= 5) report.priceRangeBreakdown['5억 이하'] = (report.priceRangeBreakdown['5억 이하'] || 0) + 1;
          else if (priceNum <= 10) report.priceRangeBreakdown['5-10억'] = (report.priceRangeBreakdown['5-10억'] || 0) + 1;
          else if (priceNum <= 20) report.priceRangeBreakdown['10-20억'] = (report.priceRangeBreakdown['10-20억'] || 0) + 1;
          else report.priceRangeBreakdown['20억 이상'] = (report.priceRangeBreakdown['20억 이상'] || 0) + 1;
        } else {
          report.priceRangeBreakdown['가격 정보 없음'] = (report.priceRangeBreakdown['가격 정보 없음'] || 0) + 1;
        }
      });
      
      const reportPath = path.join(this.dataPath, `seoul_2025_summary_report_${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log('\n📊 Summary Report:');
      console.log(`   Total Properties: ${report.totalProperties}`);
      console.log('   Region Breakdown:', report.regionBreakdown);
      console.log('   Property Type Breakdown:', report.propertyTypeBreakdown);
      console.log('   Price Range Breakdown:', report.priceRangeBreakdown);
      
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
  const crawler = new Seoul2025PropertyCrawler();
  await crawler.startCrawling();
}

// 크롤링 실행
main().catch(console.error);
