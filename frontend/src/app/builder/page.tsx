"use client";

import Link from "next/link";
import { ArrowLeft, Save, Plus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QuestionList from "@/components/quiz-builder/QuestionList";
import { useQuizBuilder } from "@/hooks/useQuizBuilder";

export default function QuizBuilder() {
  const {
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
    reorderQuestions,
    saveQuiz,
    dismissValidation,
  } = useQuizBuilder();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Build a Quiz
            </h1>
            <p className="text-lg text-gray-600">
              Define the basics, add questions, and publish when you are ready.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Error message */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Complete the form before saving</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <div className="mt-3">
                <Button className="bg-red-500 text-white hover:bg-red-500/80" size="sm" onClick={dismissValidation}>
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Once the quiz saved scessfully */}
        {savedQuizId && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Quiz saved successfully! Quiz ID: <strong>{savedQuizId}</strong>
              <br />
              Share this ID with others to let them take your quiz.
            </AlertDescription>
          </Alert>
        )}

        {/* Quiz Details */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quizzes */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-gray-900">Questions</CardTitle>
            <Button onClick={addQuestion} size="sm" variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No questions added yet. Click &quot;Add Question&quot; to start.
              </p>
            ) : (
              <QuestionList
                questions={questions}
                onUpdate={updateQuestion}
                onRemove={removeQuestion}
                onReorder={reorderQuestions}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={saveQuiz}
            disabled={isSaving || !!savedQuizId}
            variant="default"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
