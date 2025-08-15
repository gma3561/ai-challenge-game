#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

class WebsiteAnalyzer {
  constructor() {
    this.dataPath = './analysis';
    this.ensureAnalysisDirectory();
  }

  async ensureAnalysisDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created analysis directory');
    }
  }

  async analyzeWebsite() {
    console.log('🔍 Starting comprehensive website analysis...');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // 브라우저를 보면서 분석
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // 1. 메인 페이지 분석
      console.log('\n🌐 1. 메인 페이지 분석 중...');
      await this.analyzeMainPage(page);
      
      // 2. 서울시 지역별 페이지 분석
      console.log('\n🏙️ 2. 서울시 지역별 페이지 분석 중...');
      await this.analyzeSeoulRegions(page);
      
      // 3. 매물 목록 페이지 구조 분석
      console.log('\n📋 3. 매물 목록 페이지 구조 분석 중...');
      await this.analyzePropertyListStructure(page);
      
      // 4. 상세 페이지 구조 분석
      console.log('\n🏠 4. 상세 페이지 구조 분석 중...');
      await this.analyzeDetailPageStructure(page);
      
      // 5. "더보기" 버튼 동작 분석
      console.log('\n⏭️ 5. "더보기" 버튼 동작 분석 중...');
      await this.analyzeMoreButton(page);
      
      // 6. 연도별 필터링 분석
      console.log('\n📅 6. 연도별 필터링 분석 중...');
      await this.analyzeYearFiltering(page);
      
      console.log('\n✅ 웹사이트 분석 완료!');
      
    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 브라우저 종료');
      }
    }
  }

  async analyzeMainPage(page) {
    try {
      await page.goto('https://www.luxurynhouse.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await page.waitForTimeout(3000);
      
      // 메인 페이지 스크린샷
      await page.screenshot({ path: path.join(this.dataPath, 'main_page.png'), fullPage: true });
      
      // 페이지 기본 정보 수집
      const mainPageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          bodyText: document.body.innerText.substring(0, 2000),
          links: Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim(),
            href: a.href,
            className: a.className
          })).filter(link => link.text && link.text.length > 0),
          forms: Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action,
            method: form.method,
            className: form.className
          })),
          scripts: Array.from(document.querySelectorAll('script')).map(script => ({
            src: script.src,
            type: script.type,
            content: script.textContent?.substring(0, 100) || ''
          }))
        };
      });
      
      // 메인 페이지 정보 저장
      await fs.writeFile(
        path.join(this.dataPath, 'main_page_analysis.json'),
        JSON.stringify(mainPageInfo, null, 2)
      );
      
      console.log('📊 메인 페이지 분석 완료');
      console.log(`   - 제목: ${mainPageInfo.title}`);
      console.log(`   - 링크 수: ${mainPageInfo.links.length}`);
      console.log(`   - 폼 수: ${mainPageInfo.forms.length}`);
      console.log(`   - 스크립트 수: ${mainPageInfo.scripts.length}`);
      
    } catch (error) {
      console.error('메인 페이지 분석 실패:', error);
    }
  }

  async analyzeSeoulRegions(page) {
    try {
      // 서울시 지역별 링크 찾기
      const seoulRegions = await page.evaluate(() => {
        const regionLinks = Array.from(document.querySelectorAll('a')).filter(link => {
          const text = link.textContent?.trim();
          return text && (
            text.includes('청담') || text.includes('삼성') || text.includes('압구정') ||
            text.includes('신사') || text.includes('대치') || text.includes('도곡') ||
            text.includes('논현') || text.includes('역삼') || text.includes('개포') ||
            text.includes('세곡') || text.includes('일원') || text.includes('방배') ||
            text.includes('서초') || text.includes('우면') || text.includes('염곡') ||
            text.includes('내곡') || text.includes('한남') || text.includes('이태원') ||
            text.includes('동빙고') || text.includes('동부이촌') || text.includes('한강로') ||
            text.includes('용산') || text.includes('청암') || text.includes('가락') ||
            text.includes('잠실') || text.includes('신천') || text.includes('석촌') ||
            text.includes('문정') || text.includes('장지') || text.includes('자양') ||
            text.includes('신당') || text.includes('흥인동') || text.includes('회현동') ||
            text.includes('명동') || text.includes('옥수') || text.includes('금호') ||
            text.includes('성수') || text.includes('가회') || text.includes('청운') ||
            text.includes('부암') || text.includes('구기') || text.includes('평창') ||
            text.includes('성북') || text.includes('연희동') || text.includes('홍은동') ||
            text.includes('여의도동')
          );
        });
        
        return regionLinks.map(link => ({
          text: link.textContent?.trim(),
          href: link.href,
          className: link.className
        }));
      });
      
      // 서울시 지역 정보 저장
      await fs.writeFile(
        path.join(this.dataPath, 'seoul_regions.json'),
        JSON.stringify(seoulRegions, null, 2)
      );
      
      console.log(`🏙️ 서울시 지역 분석 완료: ${seoulRegions.length}개 지역 발견`);
      seoulRegions.forEach(region => {
        console.log(`   - ${region.text}: ${region.href}`);
      });
      
    } catch (error) {
      console.error('서울시 지역 분석 실패:', error);
    }
  }

  async analyzePropertyListStructure(page) {
    try {
      // 첫 번째 지역 페이지로 이동 (예: 청담/삼성)
      await page.goto('https://www.luxurynhouse.com/', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      
      // 지역 선택 (예: 청담/삼성 클릭)
      const regionLink = await page.$('a[href*="청담"], a[href*="삼성"]');
      if (regionLink) {
        await regionLink.click();
        await page.waitForTimeout(3000);
        
        // 매물 목록 페이지 스크린샷
        await page.screenshot({ path: path.join(this.dataPath, 'property_list_page.png'), fullPage: true });
        
        // 매물 목록 구조 분석
        const listStructure = await page.evaluate(() => {
          // 매물 컨테이너 찾기
          const containers = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.includes('억') || text.includes('천만') || text.includes('평') || text.includes('㎡');
          });
          
          // 매물 항목 찾기
          const propertyItems = Array.from(document.querySelectorAll('*')).filter(el => {
            const classes = el.className || '';
            return classes.includes('item') || classes.includes('property') || classes.includes('card') || classes.includes('list');
          });
          
          return {
            containers: containers.slice(0, 10).map(container => ({
              tagName: container.tagName,
              className: container.className,
              id: container.id,
              textPreview: container.textContent?.substring(0, 200) || ''
            })),
            propertyItems: propertyItems.slice(0, 10).map(item => ({
              tagName: item.tagName,
              className: item.className,
              id: item.id,
              textPreview: item.textContent?.substring(0, 200) || ''
            })),
            bodyStructure: {
              title: document.title,
              url: window.location.href,
              bodyText: document.body.innerText.substring(0, 1000)
            }
          };
        });
        
        // 매물 목록 구조 정보 저장
        await fs.writeFile(
          path.join(this.dataPath, 'property_list_structure.json'),
          JSON.stringify(listStructure, null, 2)
        );
        
        console.log('📋 매물 목록 구조 분석 완료');
        
      } else {
        console.log('⚠️ 지역 링크를 찾을 수 없습니다');
      }
      
    } catch (error) {
      console.error('매물 목록 구조 분석 실패:', error);
    }
  }

  async analyzeDetailPageStructure(page) {
    try {
      // 매물 항목 클릭 시도
      const propertyLink = await page.$('a[href*="property"], a[href*="detail"], a[href*="view"]');
      if (propertyLink) {
        // 새 탭에서 열기
        const newPage = await page.browser().newPage();
        await newPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        
        const href = await propertyLink.evaluate(el => el.href);
        await newPage.goto(href, { waitUntil: 'networkidle2' });
        await newPage.waitForTimeout(3000);
        
        // 상세 페이지 스크린샷
        await newPage.screenshot({ path: path.join(this.dataPath, 'detail_page.png'), fullPage: true });
        
        // 상세 페이지 구조 분석
        const detailStructure = await newPage.evaluate(() => {
          return {
            title: document.title,
            url: window.location.href,
            bodyText: document.body.innerText.substring(0, 2000),
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
            })),
            images: Array.from(document.querySelectorAll('img')).map(img => ({
              src: img.src,
              alt: img.alt,
              className: img.className
            }))
          };
        });
        
        // 상세 페이지 구조 정보 저장
        await fs.writeFile(
          path.join(this.dataPath, 'detail_page_structure.json'),
          JSON.stringify(detailStructure, null, 2)
        );
        
        await newPage.close();
        console.log('🏠 상세 페이지 구조 분석 완료');
        
      } else {
        console.log('⚠️ 매물 상세 링크를 찾을 수 없습니다');
      }
      
    } catch (error) {
      console.error('상세 페이지 구조 분석 실패:', error);
    }
  }

  async analyzeMoreButton(page) {
    try {
      // "더보기" 버튼 찾기
      const moreButton = await page.$('button:contains("더보기"), a:contains("더보기"), .more, .load-more');
      
      if (moreButton) {
        console.log('⏭️ "더보기" 버튼 발견');
        
        // 버튼 정보 수집
        const buttonInfo = await moreButton.evaluate(btn => ({
          tagName: btn.tagName,
          className: btn.className,
          text: btn.textContent?.trim(),
          isVisible: btn.offsetParent !== null
        }));
        
        console.log(`   - 버튼 정보: ${JSON.stringify(buttonInfo)}`);
        
        // "더보기" 버튼 정보 저장
        await fs.writeFile(
          path.join(this.dataPath, 'more_button_info.json'),
          JSON.stringify(buttonInfo, null, 2)
        );
        
      } else {
        console.log('⚠️ "더보기" 버튼을 찾을 수 없습니다');
        
        // 페이지에서 "더보기" 관련 텍스트 검색
        const moreText = await page.evaluate(() => {
          const text = document.body.innerText;
          const morePatterns = ['더보기', '더 보기', '추가', '더 많은', 'load more', 'show more'];
          return morePatterns.filter(pattern => text.includes(pattern));
        });
        
        if (moreText.length > 0) {
          console.log(`   - 발견된 "더보기" 관련 텍스트: ${moreText.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error('"더보기" 버튼 분석 실패:', error);
    }
  }

  async analyzeYearFiltering(page) {
    try {
      // 연도별 필터링 요소 찾기
      const yearFilters = await page.evaluate(() => {
        // 연도 관련 입력 필드나 선택 요소 찾기
        const yearInputs = Array.from(document.querySelectorAll('input[type="date"], input[type="text"], select, .date-filter, .year-filter')).filter(el => {
          const text = el.textContent || el.placeholder || el.value || '';
          return text.includes('2025') || text.includes('2024') || text.includes('년') || text.includes('date');
        });
        
        // 연도 관련 텍스트 찾기
        const yearTexts = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('2025') || text.includes('2024') || text.includes('년도') || text.includes('연도');
        });
        
        return {
          yearInputs: yearInputs.map(input => ({
            tagName: input.tagName,
            type: input.type || 'unknown',
            className: input.className,
            placeholder: input.placeholder,
            value: input.value,
            text: input.textContent?.trim()
          })),
          yearTexts: yearTexts.slice(0, 10).map(el => ({
            tagName: el.tagName,
            className: el.className,
            text: el.textContent?.trim()
          }))
        };
      });
      
      // 연도 필터링 정보 저장
      await fs.writeFile(
        path.join(this.dataPath, 'year_filtering_analysis.json'),
        JSON.stringify(yearFilters, null, 2)
      );
      
      console.log('📅 연도별 필터링 분석 완료');
      console.log(`   - 연도 입력 필드: ${yearFilters.yearInputs.length}개`);
      console.log(`   - 연도 관련 텍스트: ${yearFilters.yearTexts.length}개`);
      
    } catch (error) {
      console.error('연도별 필터링 분석 실패:', error);
    }
  }
}

// 메인 실행
async function main() {
  const analyzer = new WebsiteAnalyzer();
  await analyzer.analyzeWebsite();
}

// 분석 실행
main().catch(console.error);
