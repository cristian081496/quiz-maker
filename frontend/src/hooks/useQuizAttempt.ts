"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { attemptService } from "@/services/attempt";
import { useQuiz } from "@/hooks/useQuiz";
import { Attempt, AttemptSubmissionResult, Question } from "@/types/quiz";

interface UseQuizAttemptOptions {
  autoStart?: boolean;
}

interface UseQuizAttemptConfig {
  quizId: string;
  options?: UseQuizAttemptOptions;
}

const defaultOptions: UseQuizAttemptOptions = {
  autoStart: true,
};

const questionKey = (question?: Question) => (question?.id ? String(question.id) : "");

export const useQuizAttempt = ({
  quizId,
  options,
}: UseQuizAttemptConfig) => {
  const { autoStart } = { ...defaultOptions, ...options };

  const {
    data: quiz,
    isLoading: isQuizLoading,
    error: quizError,
  } = useQuiz(quizId);

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<AttemptSubmissionResult | null>(null);

  const {
    mutate: startAttempt,
    isPending: isStartingAttempt,
    error: startAttemptError,
  } = useMutation({
    mutationFn: () => attemptService.start(quizId),
    onSuccess: (startedAttempt) => {
      setAttempt(startedAttempt);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setResult(null);
    },
  });

  const {
    mutate: submitAnswer,
    isPending: isSavingAnswer,
  } = useMutation({
    mutationFn: ({ questionId, value }: { questionId: string; value: string }) => {
      if (!attempt) return Promise.resolve();
      return attemptService.submitAnswer(attempt.id, questionId, value);
    },
  });

  const {
    mutateAsync: submitAttempt,
    isPending: isSubmittingAttempt,
    error: submitAttemptError,
  } = useMutation({
    mutationFn: async () => {
      if (!attempt) throw new Error("Attempt not started");
      const submission = await attemptService.submit(attempt.id);
      setResult(submission);
      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              score: submission.score,
              submittedAt: new Date().toISOString(),
            }
          : prev
      );
      return submission;
    },
  });

  useEffect(() => {
    if (!autoStart) return;
    if (!quiz) return;
    if (attempt) return;
    if (isStartingAttempt) return;
    startAttempt();
  }, [autoStart, quiz, attempt, isStartingAttempt, startAttempt]);

  const questions = useMemo(() => {
    if (attempt?.quiz?.questions) return attempt.quiz.questions;
    return quiz?.questions ?? [];
  }, [attempt, quiz]);

  const currentQuestion = questions[currentQuestionIndex];

  const recordAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      submitAnswer({ questionId, value });
    },
    [submitAnswer]
  );

  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev >= questions.length - 1) return prev;
      return prev + 1;
    });
  }, [questions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  }, []);

  const isQuestionAnswered = useCallback(
    (question: Question) => {
      const key = questionKey(question);
      const value = answers[key];
      return Boolean(value && value.trim());
    },
    [answers]
  );

  const resetAttempt = useCallback(() => {
    setAttempt(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  }, []);

  return {
    quiz,
    attempt,
    result,
    answers,
    questions,
    quizError,
    isQuizLoading,
    isSavingAnswer,
    isSubmittingAttempt,
    startAttemptError,
    submitAttemptError,
    currentQuestion,
    currentQuestionIndex,
    goToQuestion,
    goToNext,
    goToPrevious,
    recordAnswer,
    submitAttempt,
    isQuestionAnswered,
    resetAttempt,
  };
};
