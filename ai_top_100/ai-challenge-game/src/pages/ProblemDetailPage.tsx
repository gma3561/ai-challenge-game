import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import { Problem, ProblemDetail, Question as QuestionType, UserAnswer } from '../types';

// 문제 데이터 (실제로는 API나 별도 파일에서 불러올 것)
const problemsData: Record<string, Problem> = {
  'menu-analysis': {
    id: 'menu-analysis',
    title: '춘식도락 메뉴 분석 챌린지',
    description: '카카오 구내식당의 메뉴판을 OCR로 분석하고 숨겨진 패턴을 발견하세요',
    difficulty: 3,
    category: 'menu-analysis',
    icon: 'fas fa-utensils',
    color: '#ffcccb',
  },
  'battle-simulation': {
    id: 'battle-simulation',
    title: '전투 없이 예측하는 시뮬레이션의 힘',
    description: '유닛 배치만으로 전투 승자를 예측하는 머신러닝 모델을 구축하세요',
    difficulty: 4,
    category: 'battle-simulation',
    icon: 'fas fa-gamepad',
    color: '#c2e0ff',
  },
  // 다른 문제들...
};

// 상세 문제 데이터
const problemDetailsData: Record<string, ProblemDetail> = {
  'menu-analysis': {
    id: 'menu-analysis',
    title: '춘식도락 메뉴 분석 챌린지',
    description: '카카오 구내식당의 메뉴판을 OCR로 분석하고 숨겨진 패턴을 발견하세요',
    difficulty: 3,
    category: 'menu-analysis',
    introduction: '8장의 주간 메뉴 이미지에서 정보를 추출하고, 숨겨진 패턴을 발견하여 문제를 해결하는 챌린지입니다.',
    steps: [
      {
        id: 1,
        title: '문제 이해',
        content: `
          <h2>대회 개요</h2>
          <p><strong>대회명</strong>: 춘식도락 메뉴 분석 챌린지</p>
          <p><strong>주관</strong>: AI Top 100</p>
          <p><strong>목적</strong>: 카카오 구내식당 [춘식도락]의 실제 메뉴판 이미지를 분석하여 패턴 발견</p>

          <h2>문제 설명</h2>
          <p>8장의 주간 메뉴 이미지에서 정보를 추출하고, 숨겨진 패턴을 발견하여 문제를 해결하는 챌린지입니다.</p>

          <h2>춘식도락 메뉴판 구성</h2>
          <h3>식사 시간대별 제공 메뉴</h3>
          
          <h4>평일 (월~목)</h4>
          <ul>
            <li><strong>중식</strong> (Lunch)</li>
            <li><strong>중식 (TAKE OUT)</strong></li>
            <li><strong>석식</strong> (Dinner)</li>
            <li><strong>석식 (TAKE OUT)</strong></li>
          </ul>
          
          <h4>금요일</h4>
          <ul>
            <li><strong>중식</strong> (Lunch)</li>
            <li><strong>중식 (TAKE OUT)</strong></li>
            <li><del>석식</del> (제공 안 됨)</li>
            <li><del>석식 (TAKE OUT)</del> (제공 안 됨)</li>
          </ul>

          <h2>유의사항</h2>
          <ul>
            <li>⚠️ <strong>2025년 1-2월 데이터만 분석</strong>할 것</li>
            <li>📋 <strong>춘식도락 메뉴판에 기재된 메뉴명과 텍스트가 분석의 기준</strong></li>
            <li>🎯 메뉴판 이미지에 표시된 정보를 정확히 추출</li>
          </ul>
        `,
      },
      {
        id: 2,
        title: '데이터 분석',
        content: `
          <h2>데이터 분석</h2>
          <p>이 섹션에서는 춘식도락 메뉴 이미지를 분석하는 방법을 배웁니다. 다음은 제공된 이미지에서 추출할 수 있는 정보의 예시입니다.</p>
          
          <h3>메뉴 이미지 샘플</h3>
          <div class="sample-image">
            <img src="/sample-menu.jpg" alt="춘식도락 메뉴 샘플" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
            <p><em>위 이미지는 예시입니다. 실제 대회에서는 8장의 실제 메뉴 이미지를 제공받게 됩니다.</em></p>
          </div>
          
          <h3>데이터 추출 방법</h3>
          <p>메뉴 이미지에서 다음 정보를 추출해야 합니다:</p>
          <ol>
            <li><strong>날짜 정보</strong>: 각 이미지는 특정 주(월~금)의 메뉴를 나타냅니다.</li>
            <li><strong>코너별 메뉴</strong>: 각 코너(한식A, 한식B 등)의 메뉴명</li>
            <li><strong>메뉴 세부 정보</strong>: 주 메뉴와 반찬 구성</li>
            <li><strong>칼로리 정보</strong>: 각 메뉴별 칼로리</li>
          </ol>
        `,
      },
      {
        id: 3,
        title: '해결 전략',
        content: `
          <h2>해결 전략</h2>
          <p>춘식도락 메뉴 분석 챌린지를 효과적으로 해결하기 위한 전략을 알아봅니다.</p>
          
          <h3>접근 방법</h3>
          <ol>
            <li><strong>데이터 추출</strong>: OCR을 이용해 모든 메뉴 이미지에서 텍스트 추출</li>
            <li><strong>데이터 구조화</strong>: 추출된 텍스트를 구조화된 형태로 변환</li>
            <li><strong>패턴 분석</strong>: 메뉴별, 코너별 패턴 발견</li>
            <li><strong>문제 해결</strong>: 각 문항에 맞는 분석 수행</li>
          </ol>
          
          <h3>OCR 기술 활용</h3>
          <p>OCR(Optical Character Recognition) 기술을 활용하여 이미지에서 텍스트를 추출할 수 있습니다:</p>
          <ul>
            <li>Python과 Tesseract OCR</li>
            <li>EasyOCR 라이브러리</li>
            <li>Cloud Vision API(Google, AWS 등)</li>
          </ul>
        `,
      },
      {
        id: 4,
        title: '문제 풀기',
        content: `
          <h2>문제 풀기</h2>
          <p>각 문항을 풀어보세요. 실제 대회와 동일한 형식으로 답변을 제출할 수 있습니다.</p>
        `,
      },
      {
        id: 5,
        title: '결과 확인',
        content: `
          <h2>결과 확인</h2>
          <p>제출한 답안을 채점하고 결과를 확인합니다.</p>
          
          <div id="results-container">
            <!-- 결과가 여기에 표시됩니다 -->
          </div>
        `,
      },
    ],
    questions: [
      {
        id: 'menu-q1',
        type: 'single-choice',
        title: '문항 1: 조리법별 메뉴 분석 (10점)',
        description: '1월 13일 주간(1/13-1/17) 중식의 한식A, 한식B, 팝업A, 팝업B, 양식 코너에서 제공된 반찬들을 분석하여 반찬명이 정확히 <strong>조림, 볶음, 무침, 구이</strong>로 끝나는 개수를 내림차순으로 정렬하세요.',
        points: 10,
        options: [
          '무침 > 볶음 > 조림 > 구이',
          '조림 > 볶음 > 무침 > 구이',
          '볶음 > 무침 > 조림 > 구이',
          '구이 > 무침 > 볶음 > 조림',
        ],
        correctAnswer: '조림 > 볶음 > 무침 > 구이',
      },
      {
        id: 'menu-q2',
        type: 'single-choice',
        title: '문항 2: 1월 칼로리 순위 분석 (15점)',
        description: '1월 전체 중식의 <strong>한식A, 한식B, 양식, 팝업A, 팝업B</strong> 코너의 평균 칼로리를 각각 계산하고 내림차순으로 정렬하세요.',
        points: 15,
        options: [
          '양식 > 한식A > 팝업B > 한식B > 팝업A',
          '팝업B > 양식 > 한식A > 한식B > 팝업A',
          '한식A > 한식B > 양식 > 팝업B > 팝업A',
          '양식 > 팝업B > 한식A > 한식B > 팝업A',
        ],
        correctAnswer: '양식 > 팝업B > 한식A > 한식B > 팝업A',
      },
      {
        id: 'menu-q3',
        type: 'multi-choice',
        title: '문항 3: 지역 특색 메뉴 (15점)',
        description: '1, 2월의 모든 범위(중식, 중식 TAKE OUT, 석식, 석식 TAKE OUT)의 메뉴명에 포함된 지역명(국가/도시/지명)을 추출하고 <strong>2회 이상 등장한 지역</strong>을 모두 선택하세요.',
        points: 15,
        options: [
          '나가사키',
          '안동',
          '전주',
          '태국',
          '베트남',
        ],
        correctAnswer: ['안동', '전주', '베트남'],
      },
      {
        id: 'menu-q4',
        type: 'single-choice',
        title: '문항 4: 메뉴별 칼로리 비교 (10점)',
        description: '1, 2월에서 다음 메뉴들의 칼로리를 찾아 내림차순으로 정렬하세요: 덴가스떡볶이, 돈코츠라멘, 마라탕면, 수제남산왕돈까스, 탄탄면',
        points: 10,
        options: [
          '마라탕면 > 수제남산왕돈까스 > 돈코츠라멘 > 탄탄면 > 덴가스떡볶이',
          '수제남산왕돈까스 > 돈코츠라멘 > 마라탕면 > 덴가스떡볶이 > 탄탄면',
          '수제남산왕돈까스 > 마라탕면 > 돈코츠라멘 > 탄탄면 > 덴가스떡볶이',
          '수제남산왕돈까스 > 돈코츠라멘 > 마라탕면 > 탄탄면 > 덴가스떡볶이',
        ],
        correctAnswer: '수제남산왕돈까스 > 돈코츠라멘 > 마라탕면 > 탄탄면 > 덴가스떡볶이',
      },
      {
        id: 'menu-q5',
        type: 'json-submit',
        title: '문항 5: 2월 한 달 식단 최적화 챌린지 (40점)',
        description: `
          <p>2월 한 달간 칼로리 기준으로 최적 조합을 찾으세요.</p>
          <ul>
            <li><strong>월-목요일</strong>: 같은 날짜에 중식과 석식의 합계 칼로리가 <strong>1,550kcal에 가장 근접한</strong> 코너 조합</li>
            <li><strong>금요일</strong>: <strong>가장 칼로리가 낮은 중식</strong> 코너</li>
          </ul>
          <p>JSON 형식으로 답안을 제출하세요:</p>
        `,
        points: 40,
      },
    ],
  },
  // 다른 문제 상세 정보들...
};

const PageHeader = styled.div<{ bgColor: string }>`
  background-color: ${props => props.bgColor};
  padding: ${props => props.theme.spacing.xl} 0;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.dark};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: #666;
  max-width: 800px;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    overflow-x: auto;
    padding-bottom: ${props => props.theme.spacing.md};
  }
`;

const Step = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-right: ${props => props.theme.spacing.lg};
    min-width: 100px;
  }
`;

const StepCircle = styled.div<{ active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background-color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.light)};
  color: ${props => (props.active ? 'white' : props.theme.colors.dark)};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StepLine = styled.div<{ active: boolean }>`
  flex: 1;
  height: 3px;
  background-color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.light)};
  margin: 0 ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const StepTitle = styled.div`
  font-weight: ${props => props.theme.fontSizes.medium};
  white-space: nowrap;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.fontSizes.small};
  }
`;

const ContentCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ContentTitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.dark};
`;

const Content = styled.div`
  h2 {
    margin-top: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  h3 {
    margin-top: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p, ul, ol {
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  ul, ol {
    padding-left: ${props => props.theme.spacing.lg};
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: ${props => props.theme.spacing.md} 0;
  }
  
  pre, code {
    background-color: ${props => props.theme.colors.light};
    padding: ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.small};
    overflow-x: auto;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const QuestionContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const QuestionTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const QuestionDescription = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const OptionsList = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const OptionItem = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid #ddd;
  border-radius: ${props => props.theme.borderRadius.small};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.medium};
  
  &:hover {
    background-color: ${props => props.theme.colors.light};
  }
  
  input {
    margin-right: ${props => props.theme.spacing.sm};
  }
`;

const JsonSubmitArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid #ddd;
  border-radius: ${props => props.theme.borderRadius.small};
  font-family: monospace;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FileUploadArea = styled.div`
  border: 2px dashed #ddd;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  border-radius: ${props => props.theme.borderRadius.small};
  margin-bottom: ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.medium};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
  
  i {
    font-size: 2rem;
    color: #999;
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const Result = styled.div<{ correct: boolean }>`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.small};
  background-color: ${props => 
    props.correct 
      ? `${props.theme.colors.secondary}20`
      : `${props.theme.colors.danger}20`
  };
  border: 1px solid ${props => 
    props.correct
      ? props.theme.colors.secondary
      : props.theme.colors.danger
  };
  color: ${props => 
    props.correct
      ? props.theme.colors.secondary
      : props.theme.colors.danger
  };
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProblemDetailPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [submitResult, setSubmitResult] = useState<{
    questionId: string;
    correct: boolean;
    message: string;
  } | null>(null);
  
  // 문제 데이터 로드
  useEffect(() => {
    if (!problemId) return;
    
    const problemDetail = problemDetailsData[problemId];
    if (problemDetail) {
      setProblem(problemDetail);
    } else {
      // 존재하지 않는 문제인 경우 목록 페이지로 리디렉션
      navigate('/problems');
    }
    
    // 로컬 스토리지에서 이전 답변 로드
    const savedAnswers = localStorage.getItem(`answers_${problemId}`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [problemId, navigate]);
  
  // 다음 단계로 이동
  const goToNextStep = () => {
    if (problem && activeStep < problem.steps.length) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // 이전 단계로 이동
  const goToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // 답변 저장
  const saveAnswer = (questionId: string, answer: string | string[] | null) => {
    const newAnswers = {
      ...answers,
      [questionId]: {
        questionId,
        answer,
      },
    };
    
    setAnswers(newAnswers);
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`answers_${problemId}`, JSON.stringify(newAnswers));
  };
  
  // 답변 제출 및 검증
  const submitAnswer = (questionId: string) => {
    if (!problem) return;
    
    const question = problem.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const userAnswer = answers[questionId]?.answer;
    
    let correct = false;
    
    // 답변 타입에 따른 검증
    switch (question.type) {
      case 'single-choice':
        correct = userAnswer === question.correctAnswer;
        break;
      case 'multi-choice':
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
          // 두 배열의 길이가 같고, 모든 요소가 일치하는지 확인
          correct = userAnswer.length === question.correctAnswer.length && 
                   userAnswer.every(item => question.correctAnswer?.includes(item));
        }
        break;
      case 'file-upload':
      case 'json-submit':
        // 임시로 모든 파일 업로드와 JSON 제출을 올바르다고 간주
        correct = true;
        break;
    }
    
    // 결과 설정
    setSubmitResult({
      questionId,
      correct,
      message: correct ? '정답입니다! 잘 하셨습니다.' : '오답입니다. 다시 시도해보세요.',
    });
    
    // 정답인 경우 답변 객체 업데이트
    if (correct) {
      const updatedAnswers = {
        ...answers,
        [questionId]: {
          ...answers[questionId],
          isCorrect: true,
          score: question.points,
        },
      };
      
      setAnswers(updatedAnswers);
      localStorage.setItem(`answers_${problemId}`, JSON.stringify(updatedAnswers));
    }
  };
  
  if (!problem) return <div>Loading...</div>;
  
  // 현재 스텝에 해당하는 내용
  const currentStep = problem.steps.find(step => step.id === activeStep);
  
  // 문제를 풀어야 하는 스텝인지 확인
  const isQuestionStep = activeStep === 4;
  
  return (
    <>
      <PageHeader bgColor={problemsData[problemId || '']?.color || '#f0f0f0'}>
        <Container>
          <Title>{problem.title}</Title>
          <Subtitle>
            {problem.description}
          </Subtitle>
        </Container>
      </PageHeader>
      
      <Container>
        {/* 단계 표시 */}
        <StepsContainer>
          {problem.steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <Step active={activeStep >= step.id}>
                <StepCircle active={activeStep >= step.id}>{step.id}</StepCircle>
                <StepTitle>{step.title}</StepTitle>
              </Step>
              
              {index < problem.steps.length - 1 && (
                <StepLine active={activeStep > step.id} />
              )}
            </React.Fragment>
          ))}
        </StepsContainer>
        
        {/* 내용 표시 */}
        <ContentCard>
          <ContentTitle>{currentStep?.title}</ContentTitle>
          
          {/* 문제 풀기 스텝이 아닌 경우 내용 표시 */}
          {!isQuestionStep && currentStep && (
            <Content dangerouslySetInnerHTML={{ __html: currentStep.content }} />
          )}
          
          {/* 문제 풀기 스텝인 경우 문제 표시 */}
          {isQuestionStep && (
            <Content>
              <p>각 문항을 풀어보세요. 실제 대회와 동일한 형식으로 답변을 제출할 수 있습니다.</p>
              
              {problem.questions.map(question => (
                <QuestionContainer key={question.id}>
                  <QuestionTitle>{question.title}</QuestionTitle>
                  <QuestionDescription dangerouslySetInnerHTML={{ __html: question.description }} />
                  
                  {/* 단일 선택 문제 */}
                  {question.type === 'single-choice' && (
                    <OptionsList>
                      {question.options?.map((option, index) => (
                        <OptionItem key={index}>
                          <input 
                            type="radio" 
                            name={question.id} 
                            value={option}
                            checked={answers[question.id]?.answer === option}
                            onChange={() => saveAnswer(question.id, option)}
                          />
                          {option}
                        </OptionItem>
                      ))}
                    </OptionsList>
                  )}
                  
                  {/* 다중 선택 문제 */}
                  {question.type === 'multi-choice' && (
                    <OptionsList>
                      {question.options?.map((option, index) => (
                        <OptionItem key={index}>
                          <input 
                            type="checkbox" 
                            name={question.id} 
                            value={option}
                            checked={Array.isArray(answers[question.id]?.answer) && 
                                    (answers[question.id]?.answer as string[])?.includes(option)}
                            onChange={(e) => {
                              const currentAnswers = Array.isArray(answers[question.id]?.answer) 
                                ? [...(answers[question.id]?.answer as string[] || [])] 
                                : [];
                                
                              if (e.target.checked) {
                                // 추가
                                saveAnswer(question.id, [...currentAnswers, option]);
                              } else {
                                // 제거
                                saveAnswer(
                                  question.id, 
                                  currentAnswers.filter(item => item !== option)
                                );
                              }
                            }}
                          />
                          {option}
                        </OptionItem>
                      ))}
                    </OptionsList>
                  )}
                  
                  {/* JSON 제출 문제 */}
                  {question.type === 'json-submit' && (
                    <JsonSubmitArea 
                      placeholder="JSON 형식으로 답안을 입력하세요..."
                      value={answers[question.id]?.answer as string || ''}
                      onChange={(e) => saveAnswer(question.id, e.target.value)}
                    />
                  )}
                  
                  {/* 파일 업로드 문제 */}
                  {question.type === 'file-upload' && (
                    <FileUploadArea>
                      <i className="fas fa-cloud-upload-alt" />
                      <p>파일을 선택하거나 이곳에 끌어다 놓으세요</p>
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                      />
                    </FileUploadArea>
                  )}
                  
                  {/* 제출 버튼 */}
                  <Button onClick={() => submitAnswer(question.id)}>
                    답안 제출
                  </Button>
                  
                  {/* 제출 결과 표시 */}
                  {submitResult && submitResult.questionId === question.id && (
                    <Result correct={submitResult.correct}>
                      {submitResult.message}
                    </Result>
                  )}
                </QuestionContainer>
              ))}
            </Content>
          )}
        </ContentCard>
        
        {/* 네비게이션 버튼 */}
        <Navigation>
          <Button 
            variant="outline" 
            onClick={goToPrevStep} 
            disabled={activeStep === 1}
          >
            이전
          </Button>
          
          <Button 
            onClick={goToNextStep} 
            disabled={activeStep === problem.steps.length}
          >
            다음
          </Button>
        </Navigation>
      </Container>
    </>
  );
};

export default ProblemDetailPage;