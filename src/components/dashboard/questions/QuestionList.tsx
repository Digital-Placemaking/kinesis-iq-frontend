
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import { Question } from '@/hooks/useQuestionManager';
import { Checkbox } from '@/components/ui/checkbox';

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  selectedQuestions: Set<string>;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => Promise<void>;
  onToggleActive: (questionId: string, currentActive: boolean) => Promise<void>;
  onToggleSelection: (questionId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkActivate: () => Promise<void>;
  onBulkDeactivate: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  loading,
  selectedQuestions,
  onAddQuestion,
  onEditQuestion,
  onMoveQuestion,
  onToggleActive,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete
}) => {
  const questionTypes = [
    { value: 'sentiment', label: 'Sentiment (Happy/Neutral/Concerned)' },
    { value: 'text', label: 'Text Response' },
    { value: 'multiple_choice', label: 'Multiple Choice' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(null).map((_, index) => (
          <div key={`loading-${index}`} className="border rounded-md p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No questions found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first survey question
        </p>
        <Button onClick={onAddQuestion} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedQuestions.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md border border-primary/20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedQuestions.size} question{selectedQuestions.size > 1 ? 's' : ''} selected
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBulkActivate}>
              Activate Selected
            </Button>
            <Button variant="outline" size="sm" onClick={onBulkDeactivate}>
              Deactivate Selected
            </Button>
            <Button variant="destructive" size="sm" onClick={onBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          id="select-all"
          checked={selectedQuestions.size === questions.length && questions.length > 0}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll();
            } else {
              onClearSelection();
            }
          }}
        />
        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Select all
        </label>
      </div>

      {questions.map((question, index) => (
        <div 
          key={question.id}
          className={`border rounded-md p-4 transition-all ${
            question.active 
              ? 'bg-background' 
              : 'bg-muted/50 border-dashed'
          } ${
            selectedQuestions.has(question.id) ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selectedQuestions.has(question.id)}
              onCheckedChange={() => onToggleSelection(question.id)}
              className="mt-1"
            />
            <div className="flex justify-between items-start flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!question.active && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                      Inactive
                    </span>
                  )}
                  {question.survey_name && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                      {question.survey_name}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium">{question.text}</h3>
                <p className="text-sm text-muted-foreground">
                  {questionTypes.find(t => t.value === question.type)?.label || question.type} · Order: {question.order}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost" 
                  size="sm"
                  disabled={index === 0}
                  onClick={() => onMoveQuestion(question.id, 'up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={index === questions.length - 1}
                  onClick={() => onMoveQuestion(question.id, 'down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant={question.active ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggleActive(question.id, question.active)}
                >
                  {question.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onEditQuestion(question)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
