"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { quizService } from "@/services/quiz";
import { Question } from "@/types/quiz";

interface UseQuizBuilderResult {
  title: string;
  description: string;
  questions: Question[];
  savedQuizId: string | null;
  validationErrors: string[];
  isSaving: boolean;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  addQuestion: () => void;
  updateQuestion: (index: number, question: Question) => void;
  removeQuestion: (index: number) => void;
  saveQuiz: () => Promise<void>;
  dismissValidation: () => void;
}

const buildQuestion = (position: number): Question => ({
  type: "mcq",
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  position,
  codeSnippet: "",
});

const validateQuestions = (questions: Question[]) => {
  const errors: string[] = [];

  if (!questions.length) {
    errors.push("Add at least one question.");
    return errors;
  }

  questions.forEach((question, index) => {
    if (!question.prompt.trim()) {
      errors.push(`Question ${index + 1} is missing a prompt.`);
    }

    if (question.type === "mcq") {
      const options = question.options ?? [];
      if (options.length < 2 || options.some((option) => !option.trim())) {
        errors.push(`Complete the options for question ${index + 1}.`);
      }
    }

    if (!question.correctAnswer || !String(question.correctAnswer).trim()) {
      errors.push(`Provide a correct answer for question ${index + 1}.`);
    }
  });

  return errors;
};

export const useQuizBuilder = (): UseQuizBuilderResult => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutateAsync: createQuiz, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const quiz = await quizService.create({
        title,
        description,
        isPublished: true,
      });

      for (const question of questions) {
        await quizService.addQuestion(quiz.id, {
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          correctAnswer: question.correctAnswer,
          position: question.position,
          codeSnippet: question.codeSnippet,
        });
      }

      return quiz;
    },
    onSuccess: (quiz) => {
      setSavedQuizId(quiz.id);
    },
  });

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, buildQuestion(prev.length)]);
  }, []);

  const updateQuestion = useCallback((index: number, updated: Question) => {
    setQuestions((prev) => {
      const clone = [...prev];
      clone[index] = { ...updated, position: index };
      return clone;
    });
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      const filtered = prev.filter((_, current) => current !== index);
      return filtered.map((question, position) => ({ ...question, position }));
    });
  }, []);

  const dismissValidation = useCallback(() => setValidationErrors([]), []);

  const saveQuiz = useCallback(async () => {
    const errors = [] as string[];
    if (!title.trim()) errors.push("Title is required.");
    if (!description.trim()) errors.push("Description is required.");

    const questionErrors = validateQuestions(questions);
    errors.push(...questionErrors);

    if (errors.length) {
      setValidationErrors(errors);
      return;
    }

    await createQuiz();
  }, [title, description, questions, createQuiz]);

  return useMemo(
    () => ({
      title,
      description,
      questions,
      savedQuizId,
      validationErrors,
      isSaving,
      setTitle,
      setDescription,
      addQuestion,
      updateQuestion,
      removeQuestion,
      saveQuiz,
      dismissValidation,
    }),
    [
      title,
      description,
      questions,
      savedQuizId,
      validationErrors,
      isSaving,
      addQuestion,
      updateQuestion,
      removeQuestion,
      saveQuiz,
      dismissValidation,
    ]
  );
};
