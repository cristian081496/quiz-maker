import { Question } from "@/types/quiz";
import QuestionEditor from "./QuestionEditor";

interface QuestionListProps {
  questions: Question[];
  onUpdate: (index: number, updated: Question) => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function QuestionList({
  questions,
  onUpdate,
  onRemove,
  onReorder,
}: QuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("questionIndex", index.toString());
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const fromIndex = parseInt(
              e.dataTransfer.getData("questionIndex")
            );
            if (fromIndex !== index) {
              onReorder(fromIndex, index);
            }
          }}
        >
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