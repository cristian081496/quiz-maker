export type QuestionType = 'mcq' | 'short' | 'code';

export interface Question {
  id?: string;
  quizId?: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  position?: number;
  codeSnippet?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimitSeconds?: number;
  isPublished?: boolean;
  createdAt?: string;
  questions?: Question[];
}

export interface QuizCreateData {
  title: string;
  description: string;
  timeLimitSeconds?: number;
  isPublished?: boolean;
}

export interface Attempt {
  id: string;
  quizId: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  quiz?: Quiz;
  answers?: AttemptAnswer[];
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export interface AttemptEvent {
  type: 'blur' | 'focus' | 'paste' | 'visibility_change';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AttemptSubmissionResult {
  score: number;
  details: {
    questionId: number;
    correct: boolean;
    expected?: string;
  }[];
}
