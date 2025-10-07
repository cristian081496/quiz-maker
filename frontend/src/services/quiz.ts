import { apiClient } from './client';
import { Quiz, QuizCreateData, Question } from '@/types/quiz';

export const quizService = {
  // Get all quizzes
  getAll: async (): Promise<Quiz[]> => {
    const { data } = await apiClient.get('/quizzes');
    return data;
  },

  // Create a new quiz
  create: async (quiz: QuizCreateData): Promise<Quiz> => {
    const { data } = await apiClient.post('/quizzes', quiz);
    return data;
  },

  // Get quiz by ID
  getById: async (id: string): Promise<Quiz> => {
    const { data } = await apiClient.get(`/quizzes/${id}`);
    return data;
  },

  // Update quiz metadata
  update: async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    const { data } = await apiClient.patch(`/quizzes/${id}`, updates);
    return data;
  },

  // Add question to quiz
  addQuestion: async (quizId: string, question: Omit<Question, 'id' | 'quizId'>): Promise<Question> => {
    const { data } = await apiClient.post(`/quizzes/${quizId}/questions`, question);
    return data;
  },

  // Update question
  updateQuestion: async (questionId: string, updates: Partial<Question>): Promise<Question> => {
    const { data } = await apiClient.patch(`/questions/${questionId}`, updates);
    return data;
  },

  // Delete question
  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/questions/${questionId}`);
  },
};