import { apiClient } from './client';
import { Attempt, AttemptEvent, AttemptSubmissionResult } from '@/types/quiz';

export const attemptService = {
  // Start a new attempt
  start: async (quizId: string): Promise<Attempt> => {
    const { data } = await apiClient.post('/attempts', { quizId });
    return data;
  },

  // Submit answer for a question
  submitAnswer: async (attemptId: string, questionId: string, answer: string): Promise<void> => {
    await apiClient.post(`/attempts/${attemptId}/answer`, {
      questionId,
      value: answer,
    });
  },

  // Submit attempt for grading
  submit: async (attemptId: string): Promise<AttemptSubmissionResult> => {
    const { data } = await apiClient.post(`/attempts/${attemptId}/submit`);
    return data;
  },

  // Log attempt event
  logEvent: async (attemptId: string, event: AttemptEvent): Promise<void> => {
    await apiClient.post(`/attempts/${attemptId}/events`, {
      event: JSON.stringify(event),
    });
  },
};
