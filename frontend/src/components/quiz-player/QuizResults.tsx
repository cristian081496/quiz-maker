import { useMemo } from "react";
import Link from "next/link";
import { Home, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Quiz, AttemptSubmissionResult } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildAttemptSummary } from "@/lib/attempt";

interface QuizResultsProps {
  quiz: Quiz;
  result: AttemptSubmissionResult;
  answers: Record<string, string>;
  antiCheatSummary?: {
    tabSwitches: number;
    pastes: number;
  };
}

const scoreColor = (pct: number) => {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-yellow-600";
  return "text-red-600";
};

const badgeForStatus = (status: string) => {
  if (status === "correct") {
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Correct
      </Badge>
    );
  }

  if (status === "incorrect") {
    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Incorrect
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </Badge>
    );
  }

  return (
    <Badge className="bg-gray-100 text-gray-800">
      <AlertCircle className="w-3 h-3 mr-1" />
      Unanswered
    </Badge>
  );
};

const answerColor = (status: string) => {
  if (status === "correct") return "text-green-600";
  if (status === "incorrect") return "text-red-600";
  return "text-gray-700";
};

export default function QuizResults({ quiz, result, answers, antiCheatSummary }: QuizResultsProps) {
  const summary = useMemo(
    () => buildAttemptSummary(quiz, result, answers),
    [quiz, result, answers]
  );

  const antiCheatText = useMemo(() => {
    if (!antiCheatSummary) return "";
    const parts: string[] = [];
    if (antiCheatSummary.tabSwitches > 0) {
      parts.push(`${antiCheatSummary.tabSwitches} tab switches`);
    }
    if (antiCheatSummary.pastes > 0) {
      parts.push(`${antiCheatSummary.pastes} pastes`);
    }
    return parts.join(" · ");
  }, [antiCheatSummary]);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
          <div
            className={`text-5xl font-bold mb-2 ${scoreColor(summary.percentage)}`}
          >
            {summary.score}/{summary.gradedQuestions || summary.totalQuestions}
          </div>
          <p className="text-gray-600">
            You scored {summary.percentage.toFixed(1)}%
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Quiz Title:</span>
                <span>{quiz.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Questions:</span>
                <span>{summary.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Graded Questions:</span>
                <span>{summary.gradedQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Correct Answers:</span>
                <span className="text-green-600">{summary.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Incorrect Answers:</span>
                <span className="text-red-600">{summary.incorrectAnswers}</span>
              </div>
              {summary.pendingReview > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Pending Review:</span>
                  <span className="text-yellow-600">{summary.pendingReview}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Anti-cheat:</span>
                <span className="text-gray-600">
                  {antiCheatText || "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.questions.map((item, index) => (
                <div
                  key={item.question.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Question {index + 1}:</span>
                        {badgeForStatus(item.status)}
                      </div>
                      <p className="text-gray-700">
                        {item.question.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      <span className={answerColor(item.status)}>
                        {item.userAnswer}
                      </span>
                    </div>
                    {item.status === "incorrect" && item.correctAnswer && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">{item.correctAnswer}</span>
                      </div>
                    )}
                    {item.status === "pending" && item.expected && (
                      <div>
                        <span className="font-medium">Suggested answer: </span>
                        <span className="text-green-600">{item.expected}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Link href="/">
            <Button size="lg">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
