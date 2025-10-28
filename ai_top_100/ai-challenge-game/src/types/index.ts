// 문제 타입 정의
export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'menu-analysis' | 'battle-simulation' | 'pdf-analysis' | 'video-factcheck' | 'ancient-tablet';
  icon: string;
  color: string;
}

// 문제 단계 정의
export interface ProblemStep {
  id: number;
  title: string;
  content: string;
}

// 문제 세부 정보 타입 정의
export interface ProblemDetail {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'menu-analysis' | 'battle-simulation' | 'pdf-analysis' | 'video-factcheck' | 'ancient-tablet';
  introduction: string;
  steps: ProblemStep[];
  questions: Question[];
}

// 문제 타입 정의
export type QuestionType = 'single-choice' | 'multi-choice' | 'file-upload' | 'json-submit';

// 단일 질문 타입 정의
export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
}

// 사용자 답변 타입 정의
export interface UserAnswer {
  questionId: string;
  answer: string | string[] | File | null;
  isCorrect?: boolean;
  score?: number;
}

// 사용자 진행 상황 타입 정의
export interface UserProgress {
  problemId: string;
  completedSteps: number[];
  answers: UserAnswer[];
  totalScore: number;
  maxScore: number;
  completedAt?: Date;
}