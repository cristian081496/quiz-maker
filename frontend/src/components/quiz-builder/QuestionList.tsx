import { Question } from "@/types/quiz";
import QuestionEditor from "./QuestionEditor";

interface QuestionListProps {
  questions: Question[];
  onUpdate: (index: number, updated: Question) => void;
  onRemove: (index: number) => void;
}

export default function QuestionList({
  questions,
  onUpdate,
  onRemove,
}: QuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index}>
          <QuestionEditor
            question={question}
            index={index}
            onUpdate={(updated) => onUpdate(index, updated)}
            onRemove={() => onRemove(index)}
          />
        </div>
      ))}
    </div>
  );
}
