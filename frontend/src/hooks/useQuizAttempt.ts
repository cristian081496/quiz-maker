"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { attemptService } from "@/services/attempt";
import { useQuiz } from "@/hooks/useQuiz";
import { Attempt, AttemptEvent, AttemptSubmissionResult, Question } from "@/types/quiz";

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
  // Track simple anticheat counts for the session
  const [summaryCounts, setSummaryCounts] = useState({
    tabSwitches: 0,
    pastes: 0,
  });
  const visibilityStateRef = useRef<DocumentVisibilityState | null>(null);

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
      setSummaryCounts({ tabSwitches: 0, pastes: 0 });
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

  const attemptId = attempt?.id ? String(attempt.id) : null;

  // Send anti-cheat event to backend 
  const pushEvent = useCallback(
    (type: AttemptEvent["type"], metadata?: Record<string, unknown>) => {
      if (!attemptId || result) return;
      const event: AttemptEvent = {
        type,
        timestamp: new Date().toISOString(),
        metadata,
      };
      attemptService.logEvent(attemptId, event).catch(() => {});
      setSummaryCounts((prev) => ({
        tabSwitches:
          type === "visibility_change"
            ? prev.tabSwitches + 1
            : prev.tabSwitches,
        pastes: type === "paste" ? prev.pastes + 1 : prev.pastes,
      }));
    },
    [attemptId, result]
  );

  const trackPaste = useCallback(
    (questionId?: string) => {
      pushEvent("paste", questionId ? { questionId } : undefined);
    },
    [pushEvent]
  );

  useEffect(() => {
    if (!attemptId || result) return;

    visibilityStateRef.current = document.visibilityState;

    const handleVisibility = () => {
      const state = document.visibilityState;
      if (visibilityStateRef.current === state) return;
      visibilityStateRef.current = state;
      if (state === "hidden") {
        pushEvent("visibility_change", { state });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [attemptId, pushEvent, result]);

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
    setSummaryCounts({ tabSwitches: 0, pastes: 0 });
    visibilityStateRef.current = null;
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
    trackPaste,
    antiCheatSummary: summaryCounts,
  };
};
