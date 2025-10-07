"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuestionPlayer from "@/components/quiz-player/QuestionPlayer";
import QuizResults from "@/components/quiz-player/QuizResults";
import { useQuizAttempt } from "@/hooks/useQuizAttempt";

export default function QuizPlayer() {
  const params = useParams();
  const quizId = params.id as string;

  const {
    quiz,
    result,
    answers,
    questions,
    quizError,
    isQuizLoading,
    currentQuestion,
    currentQuestionIndex,
    goToNext,
    goToPrevious,
    goToQuestion,
    recordAnswer,
    submitAttempt,
    isSubmittingAttempt,
    isQuestionAnswered,
    trackPaste,
    antiCheatSummary,
  } = useQuizAttempt({ quizId });

  const totalQuestions = questions.length;

  const unansweredCount = useMemo(() => {
    return questions.filter((question) => !isQuestionAnswered(question)).length;
  }, [questions, isQuestionAnswered]);

  const handleSubmit = async () => {
    if (!totalQuestions) return;

    if (unansweredCount > 0) {
      const proceed = confirm(
        `You have ${unansweredCount} unanswered question(s). Submit anyway?`
      );
      if (!proceed) return;
    }

    await submitAttempt();
  };

  // Loading State
  if (isQuizLoading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // if theres an error on the quiz, show an error message and a link to the home page
  if (quizError) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load quiz. Please check the quiz ID and try again.
            </AlertDescription>
          </Alert>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // if the restult and quiz are available then show the quiz results
  if (result && quiz) {
    return (
      <QuizResults
        quiz={quiz}
        result={result}
        answers={answers}
        antiCheatSummary={antiCheatSummary}
      />
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex gap-1">
              {questions.map((question, index) => (
                <button
                  key={question.id ?? index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-blue-600 text-white"
                      : isQuestionAnswered(question)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentQuestion ? (
          <QuestionPlayer
            question={currentQuestion}
            answer={answers[String(currentQuestion.id)] || ""}
            onAnswerChange={(answer) =>
              recordAnswer(String(currentQuestion.id), answer)
            }
            onPaste={trackPaste}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No questions available for this quiz.
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmittingAttempt}
              className="ml-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmittingAttempt ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={goToNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
