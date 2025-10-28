import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';

const Hero = styled.section`
  background: linear-gradient(to right, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  padding: ${props => props.theme.spacing.xxl} 0;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.large};
  max-width: 700px;
  margin: 0 auto ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.fontSizes.medium};
  }
`;

const FeaturesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.dark};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FeatureTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.dark};
`;

const FeatureDescription = styled.p`
  color: #666;
`;

const CategoriesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  background-color: ${props => props.theme.colors.light};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.large};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
  transition: transform ${props => props.theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const CategoryImage = styled.div<{ bgColor: string }>`
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.9);
  background-color: ${props => props.bgColor};
`;

const CategoryContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const CategoryTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryDescription = styled.p`
  color: #666;
  margin-bottom: ${props => props.theme.spacing.md};
  min-height: 75px;
`;

const DifficultyBadge = styled.span`
  display: block;
  margin-bottom: ${props => props.theme.spacing.md};
  color: #777;
  font-size: ${props => props.theme.fontSizes.small};
`;

const CTASection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  text-align: center;
`;

const CTATitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.dark};
`;

const CTADescription = styled.p`
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: #666;
`;

const HomePage: React.FC = () => {
  return (
    <>
      <Hero>
        <Container>
          <HeroTitle>AI 챌린지 플랫폼</HeroTitle>
          <HeroSubtitle>
            실제 AI 대회 문제를 분석하고 해결하는 과정을 경험해보세요
          </HeroSubtitle>
          <Button as={Link} to="/problems" size="large">
            시작하기
          </Button>
        </Container>
      </Hero>
      
      <FeaturesSection>
        <Container>
          <SectionTitle>AI 챌린지 특징</SectionTitle>
          <FeatureGrid>
            <Feature>
              <FeatureIcon>
                <i className="fas fa-brain" />
              </FeatureIcon>
              <FeatureTitle>실제 AI 문제 경험</FeatureTitle>
              <FeatureDescription>
                실제 대회와 동일한 형식의 문제를 통해 AI 개발 역량을 향상시킬 수 있습니다.
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureIcon>
                <i className="fas fa-project-diagram" />
              </FeatureIcon>
              <FeatureTitle>단계별 접근법</FeatureTitle>
              <FeatureDescription>
                문제 이해부터 데이터 분석, 해결 전략, 구현까지 체계적인 방법론을 배울 수 있습니다.
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureIcon>
                <i className="fas fa-chart-line" />
              </FeatureIcon>
              <FeatureTitle>진행 상황 관리</FeatureTitle>
              <FeatureDescription>
                개인 진행 상황을 추적하고 문제 해결 능력을 지속적으로 향상시킬 수 있습니다.
              </FeatureDescription>
            </Feature>
          </FeatureGrid>
        </Container>
      </FeaturesSection>
      
      <CategoriesSection>
        <Container>
          <SectionTitle>문제 카테고리</SectionTitle>
          <CategoryGrid>
            <CategoryCard>
              <CategoryImage bgColor="#ffcccb">
                <i className="fas fa-utensils" />
              </CategoryImage>
              <CategoryContent>
                <CategoryTitle>춘식도락 메뉴 분석 챌린지</CategoryTitle>
                <CategoryDescription>
                  카카오 구내식당의 메뉴판을 OCR로 분석하고 숨겨진 패턴을 발견하세요
                </CategoryDescription>
                <DifficultyBadge>난이도: ★★★☆☆</DifficultyBadge>
                <Button as={Link} to="/problem/menu-analysis" fullWidth>
                  문제 풀기
                </Button>
              </CategoryContent>
            </CategoryCard>
            
            <CategoryCard>
              <CategoryImage bgColor="#c2e0ff">
                <i className="fas fa-gamepad" />
              </CategoryImage>
              <CategoryContent>
                <CategoryTitle>전투 없이 예측하는 시뮬레이션의 힘</CategoryTitle>
                <CategoryDescription>
                  유닛 배치만으로 전투 승자를 예측하는 머신러닝 모델을 구축하세요
                </CategoryDescription>
                <DifficultyBadge>난이도: ★★★★☆</DifficultyBadge>
                <Button as={Link} to="/problem/battle-simulation" fullWidth>
                  문제 풀기
                </Button>
              </CategoryContent>
            </CategoryCard>
            
            <CategoryCard>
              <CategoryImage bgColor="#d4ffcc">
                <i className="fas fa-file-pdf" />
              </CategoryImage>
              <CategoryContent>
                <CategoryTitle>PDF 속 스텔스 텍스트 추적기</CategoryTitle>
                <CategoryDescription>
                  PDF에 숨겨진 비밀 메시지를 발견하는 기술적 접근법을 개발하세요
                </CategoryDescription>
                <DifficultyBadge>난이도: ★★★★★</DifficultyBadge>
                <Button as={Link} to="/problem/pdf-analysis" fullWidth>
                  문제 풀기
                </Button>
              </CategoryContent>
            </CategoryCard>
            
            <CategoryCard>
              <CategoryImage bgColor="#e0ccff">
                <i className="fas fa-video" />
              </CategoryImage>
              <CategoryContent>
                <CategoryTitle>The Age of AI: 영상 팩트 체크</CategoryTitle>
                <CategoryDescription>
                  AI 관련 다큐멘터리 영상의 사실 관계를 검증하고 팩트 체크하세요
                </CategoryDescription>
                <DifficultyBadge>난이도: ★★★☆☆</DifficultyBadge>
                <Button as={Link} to="/problem/video-factcheck" fullWidth>
                  문제 풀기
                </Button>
              </CategoryContent>
            </CategoryCard>
            
            <CategoryCard>
              <CategoryImage bgColor="#fff5cc">
                <i className="fas fa-scroll" />
              </CategoryImage>
              <CategoryContent>
                <CategoryTitle>고대 유적의 비밀: 이상한 코드 석판</CategoryTitle>
                <CategoryDescription>
                  고대 석판에 새겨진 암호화 코드를 해독하고 실행 가능한 프로그램으로 복원하세요
                </CategoryDescription>
                <DifficultyBadge>난이도: ★★★★☆</DifficultyBadge>
                <Button as={Link} to="/problem/ancient-tablet" fullWidth>
                  문제 풀기
                </Button>
              </CategoryContent>
            </CategoryCard>
          </CategoryGrid>
        </Container>
      </CategoriesSection>
      
      <CTASection>
        <Container>
          <CTATitle>AI 챌린지를 시작하세요</CTATitle>
          <CTADescription>
            실제 AI 대회에서 출제된 문제들을 기반으로 데이터 분석, 머신러닝 모델링, 
            컴퓨터 비전, 자연어 처리 등 다양한 AI 기술을 활용하는 경험을 제공합니다.
          </CTADescription>
          <Button as={Link} to="/problems" size="large">
            문제 둘러보기
          </Button>
        </Container>
      </CTASection>
    </>
  );
};

export default HomePage;