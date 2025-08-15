#!/usr/bin/env node

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

class SimpleWebAnalyzer {
  constructor() {
    this.dataPath = './simple-analysis';
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created simple analysis directory');
    }
  }

  async analyzeWebsite() {
    console.log('🔍 Starting simple website analysis...');
    
    try {
      // 1. 메인 페이지 분석
      console.log('\n🌐 1. Analyzing main page...');
      const mainPageData = await this.analyzeMainPage();
      
      // 2. 지역별 링크 분석
      console.log('\n🏙️ 2. Analyzing region links...');
      const regionLinks = await this.analyzeRegionLinks(mainPageData.html);
      
      // 3. 첫 번째 지역 페이지 분석
      if (regionLinks.length > 0) {
        console.log('\n🏠 3. Analyzing first region page...');
        const firstRegion = regionLinks[0];
        const regionPageData = await this.analyzeRegionPage(firstRegion.href);
        
        // 4. 매물 정보 추출
        console.log('\n📋 4. Extracting property information...');
        const properties = await this.extractProperties(regionPageData.html);
        
        // 5. 결과 저장
        console.log('\n💾 5. Saving results...');
        await this.saveResults({
          mainPage: mainPageData,
          regionLinks: regionLinks,
          firstRegion: firstRegion,
          regionPage: regionPageData,
          properties: properties
        });
        
        console.log('\n✅ Simple analysis completed successfully!');
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }
  }

  async analyzeMainPage() {
    try {
      console.log('   📡 Fetching main page...');
      
      const response = await axios.get('https://www.luxurynhouse.com/', {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      const mainPageData = {
        url: 'https://www.luxurynhouse.com/',
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        bodyText: $('body').text().substring(0, 2000),
        links: [],
        forms: [],
        scripts: []
      };
      
      // 링크 수집
      $('a').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href && text.length > 0) {
          mainPageData.links.push({
            text: text,
            href: href,
            className: $el.attr('class') || ''
          });
        }
      });
      
      // 폼 수집
      $('form').each((index, element) => {
        const $el = $(element);
        mainPageData.forms.push({
          action: $el.attr('action') || '',
          method: $el.attr('method') || '',
          className: $el.attr('class') || ''
        });
      });
      
      // 스크립트 수집
      $('script').each((index, element) => {
        const $el = $(element);
        mainPageData.scripts.push({
          src: $el.attr('src') || '',
          type: $el.attr('type') || '',
          content: $el.text().substring(0, 100) || ''
        });
      });
      
      console.log(`   ✅ Main page analyzed: ${mainPageData.links.length} links, ${mainPageData.forms.length} forms`);
      
      return {
        ...mainPageData,
        html: html
      };
      
    } catch (error) {
      console.error('   ❌ Error analyzing main page:', error.message);
      throw error;
    }
  }

  async analyzeRegionLinks(html) {
    try {
      console.log('   🔍 Finding region links...');
      
      const $ = cheerio.load(html);
      const regionLinks = [];
      
      // 서울시 지역명 패턴
      const seoulRegions = [
        '청담', '삼성', '압구정', '신사', '대치', '도곡', '논현', '역삼',
        '개포', '세곡', '일원', '방배', '서초', '우면', '염곡', '내곡',
        '한남', '이태원', '동빙고', '동부이촌', '한강로', '용산', '청암',
        '가락', '잠실', '신천', '석촌', '문정', '장지', '자양', '신당',
        '흥인동', '회현동', '명동', '옥수', '금호', '성수', '가회', '청운',
        '부암', '구기', '평창', '성북', '연희동', '홍은동', '여의도동'
      ];
      
      $('a').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href) {
          // 지역명이 포함된 링크 찾기
          const matchedRegion = seoulRegions.find(region => 
            text.includes(region) || href.includes(region)
          );
          
          if (matchedRegion) {
            regionLinks.push({
              region: matchedRegion,
              text: text,
              href: href.startsWith('http') ? href : `https://www.luxurynhouse.com${href}`,
              className: $el.attr('class') || ''
            });
          }
        }
      });
      
      // 중복 제거
      const uniqueRegionLinks = regionLinks.filter((link, index, self) => 
        index === self.findIndex(l => l.region === link.region)
      );
      
      console.log(`   ✅ Found ${uniqueRegionLinks.length} region links`);
      uniqueRegionLinks.forEach(link => {
        console.log(`      - ${link.region}: ${link.text}`);
      });
      
      return uniqueRegionLinks;
      
    } catch (error) {
      console.error('   ❌ Error analyzing region links:', error.message);
      return [];
    }
  }

  async analyzeRegionPage(url) {
    try {
      console.log(`   📡 Fetching region page: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      const regionPageData = {
        url: url,
        title: $('title').text().trim(),
        bodyText: $('body').text().substring(0, 3000),
        forms: [],
        inputs: [],
        images: []
      };
      
      // 폼 정보 수집
      $('form').each((index, element) => {
        const $el = $(element);
        regionPageData.forms.push({
          action: $el.attr('action') || '',
          method: $el.attr('method') || '',
          className: $el.attr('class') || ''
        });
      });
      
      // 입력 필드 정보 수집
      $('input').each((index, element) => {
        const $el = $(element);
        regionPageData.inputs.push({
          type: $el.attr('type') || '',
          name: $el.attr('name') || '',
          value: $el.attr('value') || '',
          placeholder: $el.attr('placeholder') || '',
          className: $el.attr('class') || ''
        });
      });
      
      // 이미지 정보 수집
      $('img').each((index, element) => {
        const $el = $(element);
        regionPageData.images.push({
          src: $el.attr('src') || '',
          alt: $el.attr('alt') || '',
          className: $el.attr('class') || ''
        });
      });
      
      console.log(`   ✅ Region page analyzed: ${regionPageData.forms.length} forms, ${regionPageData.inputs.length} inputs, ${regionPageData.images.length} images`);
      
      return {
        ...regionPageData,
        html: html
      };
      
    } catch (error) {
      console.error(`   ❌ Error analyzing region page:`, error.message);
      throw error;
    }
  }

  async extractProperties(html) {
    try {
      console.log('   🏠 Extracting property information...');
      
      const $ = cheerio.load(html);
      const properties = [];
      
      // 매물 관련 텍스트 패턴 찾기
      const bodyText = $('body').text();
      const lines = bodyText.split('\n').filter(line => line.trim());
      
      // 매물 정보가 포함된 라인 찾기
      lines.forEach((line, index) => {
        if (line.length > 20 && line.length < 300) {
          // 가격 정보가 있는 라인 찾기
          const hasPrice = /\d+억|\d+천만|\d+만원/.test(line);
          // 위치 정보가 있는 라인 찾기
          const hasLocation = /(강남|서초|송파|마포|용산|성동|광진|중구|종로|영등포|동작|관악|서대문|은평|노원|도봉|강북|성북|중랑|강동|송파)구/.test(line);
          // 매물 유형이 있는 라인 찾기
          const hasPropertyType = /(아파트|빌라|오피스텔|단독주택|상가|사무실|빌딩)/.test(line);
          
          if ((hasPrice && hasLocation) || (hasPropertyType && hasLocation)) {
            const priceMatch = line.match(/(\d+억|\d+천만|\d+만원)/);
            const locationMatch = line.match(/([가-힣]+구)/);
            
            properties.push({
              id: `extracted_${Date.now()}_${index}`,
              title: line.substring(0, 100).trim(),
              price: priceMatch ? priceMatch[0] : '가격 정보 없음',
              location: locationMatch ? locationMatch[0] : '위치 정보 없음',
              fullText: line.trim(),
              lineNumber: index + 1
            });
          }
        }
      });
      
      // 최대 3개만 반환
      const limitedProperties = properties.slice(0, 3);
      
      console.log(`   ✅ Extracted ${limitedProperties.length} properties from text analysis`);
      limitedProperties.forEach((prop, index) => {
        console.log(`      ${index + 1}. ${prop.title} - ${prop.price} - ${prop.location}`);
      });
      
      return limitedProperties;
      
    } catch (error) {
      console.error('   ❌ Error extracting properties:', error.message);
      return [];
    }
  }

  async saveResults(data) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `simple_analysis_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      // HTML은 너무 크므로 제거
      const cleanData = {
        ...data,
        mainPage: { ...data.mainPage, html: '[HTML content removed for size]' },
        regionPage: { ...data.regionPage, html: '[HTML content removed for size]' }
      };
      
      await fs.writeFile(filePath, JSON.stringify(cleanData, null, 2));
      console.log(`   💾 Analysis results saved to ${fileName}`);
      
      // 요약 리포트 생성
      await this.generateSummaryReport(data);
      
    } catch (error) {
      console.error('   ❌ Error saving results:', error.message);
    }
  }

  async generateSummaryReport(data) {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        mainPage: {
          title: data.mainPage.title,
          linkCount: data.mainPage.links.length,
          formCount: data.mainPage.forms.length,
          scriptCount: data.mainPage.scripts.length
        },
        regionAnalysis: {
          totalRegions: data.regionLinks.length,
          regions: data.regionLinks.map(link => link.region)
        },
        propertyAnalysis: {
          totalProperties: data.properties.length,
          properties: data.properties.map(prop => ({
            title: prop.title,
            price: prop.price,
            location: prop.location
          }))
        }
      };
      
      const reportPath = path.join(this.dataPath, `summary_report_${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log('\n📊 Summary Report:');
      console.log(`   Main Page: ${report.mainPage.title}`);
      console.log(`   Links: ${report.mainPage.linkCount}, Forms: ${report.mainPage.formCount}`);
      console.log(`   Regions Found: ${report.regionAnalysis.totalRegions}`);
      console.log(`   Properties Extracted: ${report.propertyAnalysis.totalProperties}`);
      
    } catch (error) {
      console.error('   ❌ Error generating summary report:', error.message);
    }
  }
}

// 메인 실행
async function main() {
  const analyzer = new SimpleWebAnalyzer();
  await analyzer.analyzeWebsite();
}

// 분석 실행
main().catch(console.error);
