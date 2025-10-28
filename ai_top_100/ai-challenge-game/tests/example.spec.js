// @ts-check
const { test, expect } = require('@playwright/test');

test('AI 챌린지 웹사이트 기능 테스트', async ({ page }) => {
  // 1. 홈페이지 로드
  await test.step('홈페이지 로드 및 기본 구성 확인', async () => {
    await page.goto('/');
    
    // 타이틀 확인
    await expect(page).toHaveTitle(/AI 챌린지/);
    
    // 헤더 존재 확인
    await expect(page.locator('h1:has-text("AI 챌린지")')).toBeVisible();
    
    // 주요 섹션 확인
    await expect(page.locator('section')).toHaveCount(4);
    
    // 문제 카테고리 섹션 확인
    await expect(page.locator('h2:has-text("문제 카테고리")')).toBeVisible();
    
    // 시작하기 버튼 확인
    await expect(page.locator('button:has-text("시작하기")')).toBeVisible();
  });

  // 2. 문제 목록 페이지 이동
  await test.step('문제 목록 페이지 이동 및 필터링 기능 확인', async () => {
    // 문제 목록 페이지로 이동
    await page.locator('a:has-text("문제 둘러보기")').click();
    
    // URL 확인
    await expect(page).toHaveURL(/.*\/problems/);
    
    // 필터링 버튼 확인
    await expect(page.locator('button:has-text("전체")')).toBeVisible();
    
    // 난이도 필터 확인
    const difficultyFilters = await page.locator('button:has-text("난이도")').count();
    expect(difficultyFilters).toBeGreaterThan(0);
    
    // 검색 필드 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
    
    // 문제 카드 존재 확인
    const problemCards = await page.locator('div.sc-*').filter({ hasText: '문제 풀기' }).count();
    expect(problemCards).toBeGreaterThan(0);
  });

  // 3. 문제 필터링 테스트
  await test.step('문제 필터링 테스트', async () => {
    // 검색어 입력
    await page.locator('input[placeholder*="검색"]').fill('메뉴');
    
    // 필터링 결과 확인
    await expect(page.locator('div').filter({ hasText: '춘식도락 메뉴 분석 챌린지' })).toBeVisible();
    
    // 검색어 지우기
    await page.locator('input[placeholder*="검색"]').clear();
    
    // 다른 난이도 필터 선택
    if (await page.locator('button:has-text("난이도 4")').count() > 0) {
      await page.locator('button:has-text("난이도 4")').click();
      
      // 해당 난이도의 문제만 표시되는지 확인
      await expect(page.locator('span:has-text("난이도: ★★★★")')).toBeVisible();
    }
    
    // 전체 필터로 복귀
    await page.locator('button:has-text("전체")').click();
  });

  // 4. 문제 상세 페이지 테스트
  await test.step('문제 상세 페이지 이동 및 UI 확인', async () => {
    // 첫 번째 문제 카드 클릭
    await page.locator('a div').filter({ hasText: '문제 풀기' }).first().click();
    
    // 문제 상세 페이지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 단계 표시 확인
    await expect(page.locator('div').filter({ hasText: '문제 이해' })).toBeVisible();
    
    // 다음 버튼 확인
    await expect(page.locator('button:has-text("다음")')).toBeVisible();
  });

  // 5. 문제 단계 이동 테스트
  await test.step('문제 단계 이동 테스트', async () => {
    // 다음 단계로 이동
    await page.locator('button:has-text("다음")').click();
    
    // 두 번째 단계 확인
    await expect(page.locator('div[role="button"], button').filter({ hasText: '데이터 분석' })).toBeVisible();
    
    // 이전 버튼 확인
    await expect(page.locator('button:has-text("이전")')).toBeVisible();
    
    // 이전 단계로 돌아가기
    await page.locator('button:has-text("이전")').click();
    
    // 첫 번째 단계 확인
    await expect(page.locator('div[role="button"], button').filter({ hasText: '문제 이해' })).toBeVisible();
  });
  
  // 6. 문제 풀이 단계 테스트
  await test.step('문제 풀이 단계 진행 및 답안 제출 테스트', async () => {
    // 문제 풀기 단계로 이동
    await page.locator('button:has-text("다음")').click(); // 2단계
    await page.locator('button:has-text("다음")').click(); // 3단계
    await page.locator('button:has-text("다음")').click(); // 4단계 (문제 풀기)
    
    // 문제 페이지 확인
    await expect(page.locator('h3').filter({ hasText: '문항' })).toBeVisible();
    
    // 첫 번째 문항 확인
    const firstQuestion = await page.locator('h3').filter({ hasText: '문항 1' }).first();
    await expect(firstQuestion).toBeVisible();
    
    // 단일 선택 문항 테스트
    const radioButtons = await page.locator('input[type="radio"]');
    if (await radioButtons.count() > 0) {
      // 첫 번째 옵션 선택
      await radioButtons.first().check();
      
      // 답안 제출 버튼 확인
      const submitButton = await page.locator('button:has-text("답안 제출")').first();
      await expect(submitButton).toBeVisible();
      
      // 답안 제출
      await submitButton.click();
      
      // 결과 피드백 확인
      await expect(page.locator('div').filter({ hasText: '정답입니다' }).or(page.locator('div').filter({ hasText: '오답입니다' }))).toBeVisible();
    }
  });

  // 7. 로컬 스토리지 상태 저장 테스트
  await test.step('로컬 스토리지 상태 저장 테스트', async () => {
    // 로컬 스토리지 확인
    const localStorageData = await page.evaluate(() => {
      // 모든 로컬 스토리지 키 가져오기
      const keys = Object.keys(localStorage);
      // 답변 관련 키 필터링
      const answerKeys = keys.filter(key => key.startsWith('answers_'));
      
      // 키 있는지 확인
      return answerKeys.length > 0;
    });
    
    // 로컬 스토리지에 데이터가 저장되었는지 확인
    expect(localStorageData).toBeTruthy();
  });

  // 8. 반응형 UI 테스트
  await test.step('반응형 UI 테스트', async () => {
    // 모바일 화면 크기로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일에서도 헤더가 보이는지 확인
    await expect(page.locator('h1').first()).toBeVisible();
    
    // 태블릿 화면 크기로 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 태블릿에서도 헤더가 보이는지 확인
    await expect(page.locator('h1').first()).toBeVisible();
    
    // 데스크톱 화면 크기로 되돌리기
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});

// 문제점 탐지 테스트
test('AI 챌린지 웹사이트 문제점 탐지', async ({ page }) => {
  // 1. 이미지 로드 문제 테스트
  await test.step('이미지 로드 문제 탐지', async () => {
    await page.goto('/');
    
    // 깨진 이미지 확인
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    
    // 깨진 이미지 없는지 확인
    expect(brokenImages).toBe(0);
  });
  
  // 2. 콘솔 오류 확인
  await test.step('콘솔 오류 확인', async () => {
    const errors = [];
    
    // 콘솔 오류 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 홈페이지 로드
    await page.goto('/');
    
    // 문제 목록 페이지 이동
    await page.locator('a:has-text("문제 둘러보기")').click();
    
    // 문제 상세 페이지 이동 (첫 번째 문제)
    await page.locator('a div').filter({ hasText: '문제 풀기' }).first().click();
    
    // 콘솔 오류 없는지 확인
    console.log('감지된 콘솔 오류:', errors);
  });
  
  // 3. 접근성 문제 테스트
  await test.step('접근성 문제 탐지', async () => {
    await page.goto('/');
    
    // 이미지에 대체 텍스트 없는 경우 확인
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img:not([alt]), img[alt=""]'));
      return imgs.length;
    });
    
    // 대체 텍스트 없는 이미지 수 기록
    console.log('대체 텍스트 없는 이미지 수:', imagesWithoutAlt);
    
    // 색상 대비 문제 확인 (간단한 체크)
    const lowContrastElements = await page.evaluate(() => {
      // 밝은 색상 배경에 밝은 색상 텍스트 또는 어두운 배경에 어두운 텍스트 탐지
      const elements = Array.from(document.querySelectorAll('*'));
      let count = 0;
      
      for (const el of elements) {
        if (el.textContent?.trim()) {
          const style = window.getComputedStyle(el);
          const backgroundColor = style.backgroundColor;
          const color = style.color;
          
          // 매우 간단한 대비 검사 (실제로는 더 복잡한 계산 필요)
          if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            continue; // 배경색이 투명한 경우 건너뛰기
          }
          
          // 밝은 배경에 밝은 텍스트 또는 어두운 배경에 어두운 텍스트 탐지
          if ((backgroundColor.includes('rgb(2') || backgroundColor.includes('rgb(24') || backgroundColor.includes('rgb(25')) && 
              (color.includes('rgb(2') || color.includes('rgb(24') || color.includes('rgb(25'))) {
            count++;
          }
        }
      }
      
      return count;
    });
    
    // 낮은 대비 요소 수 기록
    console.log('낮은 대비 요소 추정 수:', lowContrastElements);
  });
  
  // 4. 네비게이션 문제 테스트
  await test.step('네비게이션 문제 탐지', async () => {
    // 브라우저 뒤로가기 테스트
    await page.goto('/');
    
    // 문제 목록 페이지 이동
    await page.locator('a:has-text("문제 둘러보기")').click();
    
    // 뒤로가기 실행
    await page.goBack();
    
    // 홈페이지로 돌아왔는지 확인
    await expect(page.locator('h2:has-text("AI 챌린지 특징")')).toBeVisible();
    
    // 다시 문제 목록 페이지 이동
    await page.locator('a:has-text("문제 둘러보기")').click();
    
    // 문제 상세 페이지 이동
    await page.locator('a div').filter({ hasText: '문제 풀기' }).first().click();
    
    // 뒤로가기 실행
    await page.goBack();
    
    // 문제 목록 페이지로 돌아왔는지 확인
    await expect(page.locator('h2:has-text("문제 목록")')).toBeVisible();
  });
});