"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [quizId, setQuizId] = useState("");
  const router = useRouter();

  const handlePlayQuiz = () => {
    if (quizId.trim()) {
      router.push(`/play/${quizId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Quiz Maker
          </h1>
          <p className="text-lg text-gray-600">
            Create and take coding quizzes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For Quiz Builder */}
          <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Create Quiz
              </h2>
              <p className="text-gray-600">
                Build a new quiz with coding questions
              </p>
            </div>
            <Link href="/builder">
              <Button className="w-full" variant="secondary" size="lg">
                Start Building
              </Button>
            </Link>
          </div>

          {/* For Quiz Section */}
          <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Take Quiz
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a quiz ID to start
              </p>
              <Input
                placeholder="Enter quiz ID"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePlayQuiz();
                  }
                }}
                className="mb-4"
              />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              onClick={handlePlayQuiz}
              disabled={!quizId.trim()}
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
