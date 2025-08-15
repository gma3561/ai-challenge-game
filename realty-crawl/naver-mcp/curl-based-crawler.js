#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class CurlBasedCrawler {
  constructor() {
    this.dataPath = './curl-crawled-data';
    this.ensureDataDirectory();
    this.maxProperties = 3;
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('📁 Created curl crawled data directory');
    }
  }

  async startCrawling() {
    console.log('🧪 Starting curl-based crawling for 3 properties...');
    
    try {
      // 1. 메인 페이지에서 매물 정보 추출
      console.log('\n🌐 1. Extracting property information from main page...');
      const mainPageContent = await this.fetchMainPage();
      const properties = await this.extractPropertiesFromHTML(mainPageContent);
      
      // 2. 각 매물의 상세 정보 수집
      console.log('\n🔍 2. Collecting detailed information for each property...');
      const detailedProperties = await this.collectPropertyDetails(properties);
      
      // 3. 이미지 다운로드
      console.log('\n🖼️ 3. Downloading property images...');
      const propertiesWithImages = await this.downloadImages(detailedProperties);
      
      // 4. 결과 저장
      console.log('\n💾 4. Saving results...');
      await this.saveResults(propertiesWithImages);
      
      console.log('\n✅ Curl-based crawling completed successfully!');
      
    } catch (error) {
      console.error('❌ Crawling failed:', error);
    }
  }

  async fetchMainPage() {
    try {
      console.log('   📡 Fetching main page...');
      
      const { stdout } = await execAsync(
        'curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "https://www.luxurynhouse.com/"'
      );
      
      console.log('   ✅ Main page fetched successfully');
      return stdout;
      
    } catch (error) {
      console.error('   ❌ Error fetching main page:', error.message);
      throw error;
    }
  }

  async extractPropertiesFromHTML(html) {
    try {
      console.log('   🏠 Extracting property information...');
      
      const properties = [];
      const lines = html.split('\n');
      
      let currentProperty = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 매물 제목 찾기
        if (line.includes('main_title') && line.includes('>') && line.includes('</span>')) {
          const titleMatch = line.match(/<span class="main_title">([^<]+)<\/span>/);
          if (titleMatch && titleMatch[1].trim()) {
            currentProperty = {
              id: `property_${Date.now()}_${properties.length}`,
              title: titleMatch[1].trim(),
              lineNumber: i + 1
            };
          }
        }
        
        // 매물 링크 찾기
        if (currentProperty && line.includes('h_idx=') && line.includes('href=')) {
          const linkMatch = line.match(/href="([^"]+)"/);
          if (linkMatch) {
            currentProperty.detailUrl = `https://www.luxurynhouse.com${linkMatch[1]}`;
          }
        }
        
        // 매물 이미지 찾기
        if (currentProperty && line.includes('img src=') && line.includes('salebook')) {
          const imgMatch = line.match(/src="([^"]+)"/);
          if (imgMatch) {
            currentProperty.imageUrl = `https://www.luxurynhouse.com${imgMatch[1]}`;
          }
        }
        
        // 매물 위치 및 유형 찾기
        if (currentProperty && line.includes('selling_title') && line.includes('[') && line.includes(']')) {
          const locationMatch = line.match(/\[ ([^\]]+) \]/);
          if (locationMatch) {
            currentProperty.location = locationMatch[1].trim();
          }
          
          const typeMatch = line.match(/\]([^<]+)</);
          if (typeMatch) {
            currentProperty.propertyType = typeMatch[1].trim();
          }
        }
        
        // 매물 가격 찾기
        if (currentProperty && line.includes('price') && line.includes('억') || line.includes('천만') || line.includes('만원')) {
          const priceMatch = line.match(/<p class="price">\s*([^<]+)<\/p>/);
          if (priceMatch) {
            currentProperty.price = priceMatch[1].trim();
          }
        }
        
        // 매물 거래 조건 찾기
        if (currentProperty && line.includes('condi01')) {
          const conditionMatch = line.match(/<span class='condi01'>([^<]+)<\/span>/);
          if (conditionMatch) {
            currentProperty.condition = conditionMatch[1].trim();
          }
        }
        
        // 매물 정보가 완성되면 저장
        if (currentProperty && currentProperty.title && currentProperty.detailUrl && properties.length < this.maxProperties) {
          // 기본 정보 정리
          currentProperty.extractedAt = new Date().toISOString();
          currentProperty.source = 'main_page';
          
          properties.push(currentProperty);
          console.log(`      📋 Extracted: ${currentProperty.title} - ${currentProperty.price || '가격 정보 없음'} - ${currentProperty.location || '위치 정보 없음'}`);
          
          currentProperty = null; // 다음 매물 준비
        }
      }
      
      console.log(`   ✅ Extracted ${properties.length} properties`);
      return properties;
      
    } catch (error) {
      console.error('   ❌ Error extracting properties:', error.message);
      return [];
    }
  }

  async collectPropertyDetails(properties) {
    const detailedProperties = [];
    
    console.log(`   🔍 Collecting details for ${properties.length} properties...`);
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`   📋 Processing ${i + 1}/${properties.length}: ${property.title.substring(0, 50)}...`);
      
      try {
        // 상세 페이지 가져오기
        const detailContent = await this.fetchPropertyDetail(property.detailUrl);
        
        // 상세 정보 추출
        const detail = await this.extractDetailInfo(detailContent);
        
        // 기본 정보와 상세 정보 결합
        const detailedProperty = {
          ...property,
          ...detail
        };
        
        detailedProperties.push(detailedProperty);
        
        // 적절한 딜레이
        await this.delay(1000);
        
      } catch (error) {
        console.error(`      ❌ Error processing property ${property.title}:`, error.message);
        detailedProperties.push(property); // 기본 정보라도 저장
      }
    }
    
    return detailedProperties;
  }

  async fetchPropertyDetail(url) {
    try {
      const { stdout } = await execAsync(
        `curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "${url}"`
      );
      
      return stdout;
      
    } catch (error) {
      console.error(`      ❌ Error fetching detail page:`, error.message);
      return '';
    }
  }

  async extractDetailInfo(html) {
    try {
      const detail = {
        detailTitle: '',
        detailBody: '',
        additionalImages: [],
        forms: [],
        inputs: []
      };
      
      const lines = html.split('\n');
      
      for (const line of lines) {
        // 제목 추출
        if (line.includes('<title>') && line.includes('</title>')) {
          const titleMatch = line.match(/<title>([^<]+)<\/title>/);
          if (titleMatch) {
            detail.detailTitle = titleMatch[1].trim();
          }
        }
        
        // 추가 이미지 찾기
        if (line.includes('img src=') && line.includes('salebook')) {
          const imgMatch = line.match(/src="([^"]+)"/);
          if (imgMatch) {
            detail.additionalImages.push(`https://www.luxurynhouse.com${imgMatch[1]}`);
          }
        }
        
        // 폼 정보 찾기
        if (line.includes('<form')) {
          const actionMatch = line.match(/action="([^"]+)"/);
          const methodMatch = line.match(/method="([^"]+)"/);
          detail.forms.push({
            action: actionMatch ? actionMatch[1] : '',
            method: methodMatch ? methodMatch[1] : ''
          });
        }
        
        // 입력 필드 정보 찾기
        if (line.includes('<input')) {
          const typeMatch = line.match(/type="([^"]+)"/);
          const nameMatch = line.match(/name="([^"]+)"/);
          const placeholderMatch = line.match(/placeholder="([^"]+)"/);
          
          detail.inputs.push({
            type: typeMatch ? typeMatch[1] : '',
            name: nameMatch ? nameMatch[1] : '',
            placeholder: placeholderMatch ? placeholderMatch[1] : ''
          });
        }
      }
      
      // 본문 텍스트 추출 (간단한 버전)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        detail.detailBody = bodyMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);
      }
      
      return detail;
      
    } catch (error) {
      console.error('      ❌ Error extracting detail info:', error.message);
      return {};
    }
  }

  async downloadImages(properties) {
    const propertiesWithImages = [];
    
    console.log(`   🖼️ Downloading images for ${properties.length} properties...`);
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`   📸 Processing images for ${i + 1}/${properties.length}: ${property.title.substring(0, 50)}...`);
      
      try {
        const downloadedImages = [];
        
        // 메인 이미지 다운로드
        if (property.imageUrl) {
          const mainImagePath = await this.downloadImage(property.imageUrl, property.id, 'main');
          if (mainImagePath) {
            downloadedImages.push({
              type: 'main',
              originalUrl: property.imageUrl,
              localPath: mainImagePath
            });
          }
        }
        
        // 추가 이미지 다운로드
        if (property.additionalImages && property.additionalImages.length > 0) {
          for (let j = 0; j < Math.min(property.additionalImages.length, 3); j++) {
            const additionalImagePath = await this.downloadImage(property.additionalImages[j], property.id, `additional_${j + 1}`);
            if (additionalImagePath) {
              downloadedImages.push({
                type: `additional_${j + 1}`,
                originalUrl: property.additionalImages[j],
                localPath: additionalImagePath
              });
            }
          }
        }
        
        // 이미지 정보 추가
        const propertyWithImages = {
          ...property,
          downloadedImages: downloadedImages,
          imageCount: downloadedImages.length
        };
        
        propertiesWithImages.push(propertyWithImages);
        
        console.log(`      ✅ Downloaded ${downloadedImages.length} images`);
        
      } catch (error) {
        console.error(`      ❌ Error downloading images for ${property.title}:`, error.message);
        propertiesWithImages.push({
          ...property,
          downloadedImages: [],
          imageCount: 0
        });
      }
    }
    
    return propertiesWithImages;
  }

  async downloadImage(imageUrl, propertyId, imageType) {
    try {
      // 이미지 파일명 생성
      const imageName = `property_${propertyId}_${imageType}.jpg`;
      const imagePath = path.join(this.dataPath, imageName);
      
      // curl로 이미지 다운로드
      await execAsync(`curl -s -o "${imagePath}" "${imageUrl}"`);
      
      // 파일 존재 확인
      try {
        await fs.access(imagePath);
        console.log(`         💾 Image downloaded: ${imageName}`);
        return imagePath;
      } catch {
        console.log(`         ⚠️ Image download failed: ${imageName}`);
        return null;
      }
      
    } catch (error) {
      console.log(`         ⚠️ Image download failed: ${error.message}`);
      return null;
    }
  }

  async saveResults(properties) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `curl_crawled_3_properties_${timestamp}.json`;
      const filePath = path.join(this.dataPath, fileName);
      
      const data = {
        crawlInfo: {
          crawledAt: new Date().toISOString(),
          propertyCount: properties.length,
          maxProperties: this.maxProperties,
          method: 'curl-based',
          description: 'Curl-based crawling for 3 properties with images'
        },
        properties: properties
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`   💾 Results saved to ${fileName}`);
      
      // 요약 리포트 생성
      await this.generateSummaryReport(properties);
      
    } catch (error) {
      console.error('   ❌ Error saving results:', error.message);
    }
  }

  async generateSummaryReport(properties) {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        totalProperties: properties.length,
        propertiesWithImages: properties.filter(p => p.downloadedImages && p.downloadedImages.length > 0).length,
        propertiesWithDetails: properties.filter(p => p.detailTitle).length,
        totalImages: properties.reduce((total, p) => total + (p.downloadedImages ? p.downloadedImages.length : 0), 0),
        priceBreakdown: {},
        locationBreakdown: {}
      };
      
      // 가격별 분류
      properties.forEach(prop => {
        const price = prop.price || '가격 정보 없음';
        report.priceBreakdown[price] = (report.priceBreakdown[price] || 0) + 1;
        
        const location = prop.location || '위치 정보 없음';
        report.locationBreakdown[location] = (report.locationBreakdown[location] || 0) + 1;
      });
      
      const reportPath = path.join(this.dataPath, `curl_summary_report_${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log('\n📊 Curl Crawling Summary Report:');
      console.log(`   Total Properties: ${report.totalProperties}`);
      console.log(`   Properties with Images: ${report.propertiesWithImages}`);
      console.log(`   Properties with Details: ${report.propertiesWithDetails}`);
      console.log(`   Total Images Downloaded: ${report.totalImages}`);
      console.log('   Price Breakdown:', report.priceBreakdown);
      console.log('   Location Breakdown:', report.locationBreakdown);
      
    } catch (error) {
      console.error('   ❌ Error generating summary report:', error.message);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 메인 실행
async function main() {
  const crawler = new CurlBasedCrawler();
  await crawler.startCrawling();
}

// 크롤링 실행
main().catch(console.error);
