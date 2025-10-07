import { Question } from "@/types/quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuestionPlayerProps {
  question: Question;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export default function QuestionPlayer({
  question,
  answer,
  onAnswerChange,
}: QuestionPlayerProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="mb-6">
        <p className="text-lg text-gray-900 leading-relaxed">{question.prompt}</p>
      </div>

      <div>
        {question.type === "mcq" && question.options && (
          <RadioGroup value={answer} onValueChange={onAnswerChange}>
            <div className="space-y-2">
              {question.options.map((option, index) => {
                const baseId = question.id ?? `question-${index}`;
                const optionId = `${baseId}-option-${index}`;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={optionId} />
                    <Label
                      htmlFor={optionId}
                      className="cursor-pointer flex-1 text-gray-700"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        )}

        {question.type === "short" && (
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full"
          />
        )}

        {question.type === "code" && (
          <Textarea
            placeholder="Enter your code solution"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        )}
      </div>
    </div>
  );
}
