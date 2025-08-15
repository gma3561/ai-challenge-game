const axios = require('axios');

// 네이버 검색 API 설정
const NAVER_ACCESS_LICENSE = '01000000005a2392e4de200b33a5dde383228e5e336bbccec529eeb2732f9fa65adf259389';
const NAVER_SECRET_KEY = 'AQAAAABaI5Lk3iALM6Xd44Mijl4z8wffuY7x7fH90N1MUgPcYg==';

async function searchLuxuryHouse() {
  try {
    console.log('🔍 럭셔리 하우스 검색 중...');
    
    // 1. 웹문서 검색
    console.log('\n📄 웹문서 검색 결과:');
    const webResults = await searchWebDocuments('럭셔리 하우스');
    console.log(`총 ${webResults.total}개 결과`);
    webResults.items.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.description.substring(0, 100)}...`);
      console.log(`   링크: ${item.link}`);
      console.log('');
    });
    
    // 2. 뉴스 검색
    console.log('\n📰 뉴스 검색 결과:');
    const newsResults = await searchNews('럭셔리 하우스');
    console.log(`총 ${newsResults.total}개 결과`);
    newsResults.items.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.description.substring(0, 100)}...`);
      console.log(`   날짜: ${item.postdate}`);
      console.log('');
    });
    
    // 3. 부동산 관련 검색
    console.log('\n🏠 부동산 관련 검색 결과:');
    const realEstateResults = await searchRealEstate('럭셔리 하우스');
    console.log(`총 ${realEstateResults.total}개 결과`);
    realEstateResults.items.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.description.substring(0, 100)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 검색 중 오류 발생:', error.message);
  }
}

async function searchWebDocuments(query) {
  const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
    params: {
      query: query,
      display: 20,
      sort: 'date'
    },
    headers: {
      'X-Naver-Client-Id': NAVER_ACCESS_LICENSE,
      'X-Naver-Client-Secret': NAVER_SECRET_KEY
    }
  });
  return response.data;
}

async function searchNews(query) {
  const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
    params: {
      query: query,
      display: 10,
      sort: 'date'
    },
    headers: {
      'X-Naver-Client-Id': NAVER_ACCESS_LICENSE,
      'X-Naver-Client-Secret': NAVER_SECRET_KEY
    }
  });
  return response.data;
}

async function searchRealEstate(query) {
  const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
    params: {
      query: `${query} 부동산 매물`,
      display: 15,
      sort: 'sim'
    },
    headers: {
      'X-Naver-Client-Id': NAVER_ACCESS_LICENSE,
      'X-Naver-Client-Secret': NAVER_SECRET_KEY
    }
  });
  return response.data;
}

// 검색 실행
searchLuxuryHouse();
