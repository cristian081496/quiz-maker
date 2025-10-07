import { Question, QuestionType } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updated: Question) => void;
  onRemove: () => void;
}

export default function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
}: QuestionEditorProps) {
  const handleTypeChange = (type: QuestionType) => {
    const updated = { ...question, type };
    if (type === "mcq" && !question.options) {
      updated.options = ["", "", "", ""];
    } else if (type !== "mcq") {
      updated.options = undefined;
    }
    onUpdate(updated);
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <span className="font-medium text-gray-900">Question {index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {/* Question Type */}
        <div>
          <Label>Question Type</Label>
          <RadioGroup
            value={question.type}
            onValueChange={(value) => handleTypeChange(value as QuestionType)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mcq" id={`type-mcq-${index}`} />
              <Label htmlFor={`type-mcq-${index}`}>Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id={`type-short-${index}`} />
              <Label htmlFor={`type-short-${index}`}>Short Answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="code" id={`type-code-${index}`} />
              <Label htmlFor={`type-code-${index}`}>Code</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Question Prompt */}
        <div>
          <Label>Question Prompt</Label>
          <Textarea
            placeholder="Enter your question"
            value={question.prompt}
            onChange={(e) => onUpdate({ ...question, prompt: e.target.value })}
            rows={3}
          />
        </div>

        {/* Optional code snippet */}
        <div>
          <Label>Code Snippet (optional)</Label>
          <Textarea
            placeholder="Paste any reference code"
            value={question.codeSnippet ?? ""}
            onChange={(e) => onUpdate({ ...question, codeSnippet: e.target.value })}
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        {/* Options for MCQ */}
        {question.type === "mcq" && question.options && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {question.options.map((option, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Correct Answer */}
        <div>
          <Label>Correct Answer</Label>
          {question.type === "mcq" && question.options ? (
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question.correctAnswer || ""}
              onChange={(e) =>
                onUpdate({ ...question, correctAnswer: e.target.value })
              }
            >
              <option value="">Select correct answer</option>
              {question.options.map((option, i) => (
                <option key={i} value={option}>
                  {option || `Option ${i + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <Input
              placeholder={
                question.type === "code"
                  ? "Enter expected output or solution"
                  : "Enter correct answer"
              }
              value={question.correctAnswer || ""}
              onChange={(e) =>
                onUpdate({ ...question, correctAnswer: e.target.value })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
