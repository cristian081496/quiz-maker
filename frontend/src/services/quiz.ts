import { apiClient } from './client';
import { Quiz, QuizCreateData, Question } from '@/types/quiz';

const PROMPT_WITH_SNIPPET = "__QUIZ_SNIPPET__:";

const encodePrompt = (prompt: string, codeSnippet?: string) => {
  if (!codeSnippet || !codeSnippet.trim()) {
    return prompt;
  }

  const payload = JSON.stringify({ prompt, codeSnippet });
  return `${PROMPT_WITH_SNIPPET}${payload}`;
};

const decodePrompt = (raw: string) => {
  if (!raw.startsWith(PROMPT_WITH_SNIPPET)) {
    return { prompt: raw, codeSnippet: undefined };
  }

  try {
    const encoded = raw.slice(PROMPT_WITH_SNIPPET.length);
    const parsed = JSON.parse(encoded) as { prompt?: string; codeSnippet?: string };
    return {
      prompt: parsed.prompt ?? "",
      codeSnippet: parsed.codeSnippet,
    };
  } catch (error) {
    console.warn("Failed to decode prompt", error);
    return { prompt: raw, codeSnippet: undefined };
  }
};

const mapQuestionFromApi = (question: Question): Question => {
  const { prompt, codeSnippet } = decodePrompt(question.prompt);
  return {
    ...question,
    prompt,
    codeSnippet,
  };
};

export const mapQuizFromApi = (quiz: Quiz): Quiz => {
  if (!quiz.questions) return quiz;
  return {
    ...quiz,
    questions: quiz.questions.map(mapQuestionFromApi),
  };
};

const prepareQuestionPayload = (question: Omit<Question, "id" | "quizId">) => {
  const { prompt, codeSnippet, ...rest } = question;
  return {
    ...rest,
    prompt: encodePrompt(prompt, codeSnippet),
  };
};

const prepareQuestionUpdate = (updates: Partial<Omit<Question, "id" | "quizId">>) => {
  const { prompt, codeSnippet, ...rest } = updates;

  if (prompt === undefined && codeSnippet === undefined) {
    return rest;
  }

  return {
    ...rest,
    prompt: encodePrompt(prompt ?? "", codeSnippet),
  };
};

export const quizService = {
  // Get all quizzes
  getAll: async (): Promise<Quiz[]> => {
    const { data } = await apiClient.get('/quizzes');
    return (data as Quiz[]).map(mapQuizFromApi);
  },

  // Create a new quiz
  create: async (quiz: QuizCreateData): Promise<Quiz> => {
    const { data } = await apiClient.post('/quizzes', quiz);
    return mapQuizFromApi(data);
  },

  // Get quiz by ID
  getById: async (id: string): Promise<Quiz> => {
    const { data } = await apiClient.get(`/quizzes/${id}`);
    return mapQuizFromApi(data);
  },

  // Update quiz metadata
  update: async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    const { data } = await apiClient.patch(`/quizzes/${id}`, updates);
    return mapQuizFromApi(data);
  },

  // Add question to quiz
  addQuestion: async (quizId: string, question: Omit<Question, 'id' | 'quizId'>): Promise<Question> => {
    const payload = prepareQuestionPayload(question);
    const { data } = await apiClient.post(`/quizzes/${quizId}/questions`, payload);
    return mapQuestionFromApi(data);
  },

  // Update question
  updateQuestion: async (questionId: string, updates: Partial<Question>): Promise<Question> => {
    const payload = prepareQuestionUpdate(updates);
    const { data } = await apiClient.patch(`/questions/${questionId}`, payload);
    return mapQuestionFromApi(data);
  },

  // Delete question
  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/questions/${questionId}`);
  },
};
