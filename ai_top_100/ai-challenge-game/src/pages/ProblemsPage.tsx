import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import { Problem } from '../types';

const PageHeader = styled.div`
  background-color: ${props => props.theme.colors.light};
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

const FilterSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => (props.active ? props.theme.colors.primary : 'white')};
  color: ${props => (props.active ? 'white' : props.theme.colors.dark)};
  border: 1px solid ${props => (props.active ? props.theme.colors.primary : '#ddd')};
  padding: ${props => `${props.theme.spacing.sm} ${props.theme.spacing.lg}`};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.medium};
  
  &:hover {
    background: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.light)};
  }
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid #ddd;
  border-radius: ${props => props.theme.borderRadius.medium};
  width: 100%;
  max-width: 300px;
  font-size: ${props => props.theme.fontSizes.medium};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    max-width: 100%;
  }
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ProblemCard = styled(Card)``;

const ProblemIcon = styled.div<{ bgColor: string }>`
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.9);
  background-color: ${props => props.bgColor};
  border-radius: ${props => `${props.theme.borderRadius.large} ${props.theme.borderRadius.large} 0 0`};
`;

const ProblemContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const ProblemTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProblemDescription = styled.p`
  color: #666;
  margin-bottom: ${props => props.theme.spacing.md};
  min-height: 60px;
`;

const ProblemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DifficultyBadge = styled.span`
  color: #777;
  font-size: ${props => props.theme.fontSizes.small};
`;

const CompletionBadge = styled.span<{ completed: boolean }>`
  background-color: ${props => (props.completed ? props.theme.colors.secondary : '#ddd')};
  color: white;
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: ${props => props.theme.fontSizes.small};
  font-weight: 500;
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl} 0;
  color: #666;
  
  i {
    font-size: 3rem;
    margin-bottom: ${props => props.theme.spacing.md};
    color: #ddd;
  }
  
  h3 {
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

// 더미 문제 데이터
const problemsData: Problem[] = [
  {
    id: 'menu-analysis',
    title: '춘식도락 메뉴 분석 챌린지',
    description: '카카오 구내식당의 메뉴판을 OCR로 분석하고 숨겨진 패턴을 발견하세요',
    difficulty: 3,
    category: 'menu-analysis',
    icon: 'fas fa-utensils',
    color: '#ffcccb',
  },
  {
    id: 'battle-simulation',
    title: '전투 없이 예측하는 시뮬레이션의 힘',
    description: '유닛 배치만으로 전투 승자를 예측하는 머신러닝 모델을 구축하세요',
    difficulty: 4,
    category: 'battle-simulation',
    icon: 'fas fa-gamepad',
    color: '#c2e0ff',
  },
  {
    id: 'pdf-analysis',
    title: 'PDF 속 스텔스 텍스트 추적기',
    description: 'PDF에 숨겨진 비밀 메시지를 발견하는 기술적 접근법을 개발하세요',
    difficulty: 5,
    category: 'pdf-analysis',
    icon: 'fas fa-file-pdf',
    color: '#d4ffcc',
  },
  {
    id: 'video-factcheck',
    title: 'The Age of AI: 영상 팩트 체크',
    description: 'AI 관련 다큐멘터리 영상의 사실 관계를 검증하고 팩트 체크하세요',
    difficulty: 3,
    category: 'video-factcheck',
    icon: 'fas fa-video',
    color: '#e0ccff',
  },
  {
    id: 'ancient-tablet',
    title: '고대 유적의 비밀: 이상한 코드 석판',
    description: '고대 석판에 새겨진 암호화 코드를 해독하고 실행 가능한 프로그램으로 복원하세요',
    difficulty: 4,
    category: 'ancient-tablet',
    icon: 'fas fa-scroll',
    color: '#fff5cc',
  },
];

// 유저 진행 상황 더미 데이터
const userProgressData: Record<string, { completed: boolean; progress: number }> = {
  'menu-analysis': { completed: true, progress: 100 },
  'battle-simulation': { completed: false, progress: 60 },
  'pdf-analysis': { completed: false, progress: 0 },
  'video-factcheck': { completed: false, progress: 0 },
  'ancient-tablet': { completed: false, progress: 0 },
};

const ProblemsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | number>('all');
  const [search, setSearch] = useState('');
  
  // 필터링 및 검색 적용
  const filteredProblems = problemsData.filter(problem => {
    const matchesFilter = filter === 'all' || problem.difficulty === filter;
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) || 
                         problem.description.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  return (
    <>
      <PageHeader>
        <Container>
          <Title>문제 목록</Title>
          <Subtitle>
            다양한 AI 문제를 도전하고 해결 능력을 향상시켜보세요
          </Subtitle>
        </Container>
      </PageHeader>
      
      <Container>
        <FilterSection>
          <div>
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              전체
            </FilterButton>
            {[1, 2, 3, 4, 5].map(difficulty => (
              <FilterButton 
                key={difficulty}
                active={filter === difficulty} 
                onClick={() => setFilter(difficulty)}
              >
                난이도 {difficulty}
              </FilterButton>
            ))}
          </div>
          
          <SearchInput
            type="text"
            placeholder="문제 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterSection>
        
        {filteredProblems.length > 0 ? (
          <ProblemGrid>
            {filteredProblems.map(problem => (
              <Link to={`/problem/${problem.id}`} key={problem.id} style={{ textDecoration: 'none' }}>
                <ProblemCard>
                  <ProblemIcon bgColor={problem.color}>
                    <i className={problem.icon} />
                  </ProblemIcon>
                  <ProblemContent>
                    <ProblemTitle>{problem.title}</ProblemTitle>
                    <ProblemDescription>
                      {problem.description}
                    </ProblemDescription>
                    <ProblemMeta>
                      <DifficultyBadge>
                        난이도: {Array(problem.difficulty).fill('★').join('')}
                        {Array(5 - problem.difficulty).fill('☆').join('')}
                      </DifficultyBadge>
                      
                      <CompletionBadge completed={userProgressData[problem.id]?.completed || false}>
                        {userProgressData[problem.id]?.completed ? '완료됨' : 
                         userProgressData[problem.id]?.progress > 0 ? `${userProgressData[problem.id].progress}%` : 
                         '시작하기'}
                      </CompletionBadge>
                    </ProblemMeta>
                    
                    <Button fullWidth>
                      {userProgressData[problem.id]?.completed ? '다시 풀기' : 
                       userProgressData[problem.id]?.progress > 0 ? '계속하기' : 
                       '문제 풀기'}
                    </Button>
                  </ProblemContent>
                </ProblemCard>
              </Link>
            ))}
          </ProblemGrid>
        ) : (
          <NoResults>
            <i className="fas fa-search" />
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 사용해 보세요</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilter('all');
                setSearch('');
              }}
              style={{ marginTop: '1rem' }}
            >
              필터 초기화
            </Button>
          </NoResults>
        )}
      </Container>
    </>
  );
};

export default ProblemsPage;