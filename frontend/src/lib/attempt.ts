import { AttemptSubmissionResult, Question, Quiz } from "@/types/quiz";

export type QuestionResultStatus = "correct" | "incorrect" | "unanswered" | "pending";

export interface FormattedQuestionResult {
  question: Question;
  status: QuestionResultStatus;
  userAnswer: string;
  correctAnswer?: string;
  expected?: string;
}

export interface AttemptSummary {
  totalQuestions: number;
  gradedQuestions: number;
  pendingReview: number;
  score: number;
  incorrectAnswers: number;
  percentage: number;
  questions: FormattedQuestionResult[];
}

// String id helper
const normalizeQuestionId = (question: Question) => String(question.id);

// Show dash on empty answers
const formatAnswer = (answer?: string) => {
  if (!answer || answer.trim() === "") {
    return "—";
  }
  return answer;
};

// Pick the displayed correct answer
const deriveCorrectAnswer = (question: Question, expected?: string) => {
  if (expected) return expected;

  if (question.type === "mcq" && Array.isArray(question.options)) {
    if (typeof question.correctAnswer === "number") {
      return question.options[question.correctAnswer] ?? "";
    }
    return question.correctAnswer ?? "";
  }

  return question.correctAnswer ?? "";
};

// Figure out the answer status
const determineStatus = (
  question: Question,
  answer: string,
  detail?: AttemptSubmissionResult["details"][number]
): QuestionResultStatus => {
  if (!answer || answer.trim() === "") {
    return "unanswered";
  }

  if (question.type === "code") {
    return "pending";
  }

  if (!detail) {
    return "pending";
  }

  return detail.correct ? "correct" : "incorrect";
};

// Assemble the attempt summary
export const buildAttemptSummary = (
  quiz: Quiz,
  result: AttemptSubmissionResult,
  answers: Record<string, string>
): AttemptSummary => {
  const totalQuestions = quiz.questions?.length ?? 0;
  const gradedQuestions = quiz.questions?.filter((q) => q.type !== "code").length ?? 0;
  const pendingReview = totalQuestions - gradedQuestions;
  const score = result.score;
  const incorrectAnswers = Math.max(gradedQuestions - score, 0);
  const percentage = gradedQuestions > 0 ? (score / gradedQuestions) * 100 : 0;

  const detailMap = new Map(
    result.details.map((detail) => [String(detail.questionId), detail])
  );

  const questions: FormattedQuestionResult[] = (quiz.questions ?? []).map((question) => {
    const questionId = normalizeQuestionId(question);
    const detail = detailMap.get(questionId);
    const answer = answers[questionId];
    const status = determineStatus(question, answer, detail);
    const expected = detail?.expected;
    const correctAnswer = deriveCorrectAnswer(question, expected);

    return {
      question,
      status,
      userAnswer: formatAnswer(answer),
      correctAnswer,
      expected,
    };
  });

  return {
    totalQuestions,
    gradedQuestions,
    pendingReview,
    score,
    incorrectAnswers,
    percentage,
    questions,
  };
};
