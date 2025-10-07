import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quiz";
import { Question } from "@/types/quiz";

export const useQuizzes = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: quizService.getAll,
  });
};

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizService.getById(id),
    enabled: !!id,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};

export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, question }: { quizId: string; question: Omit<Question, 'id' | 'quizId'> }) =>
      quizService.addQuestion(quizId, question),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, updates }: { questionId: string; updates: Partial<Question> }) =>
      quizService.updateQuestion(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
    },
  });
};
