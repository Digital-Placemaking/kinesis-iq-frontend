
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuestionManager } from '@/hooks/useQuestionManager';
import QuestionDialog from '@/components/dashboard/questions/QuestionDialog';
import QuestionList from '@/components/dashboard/questions/QuestionList';

interface QuestionDesignerProps {
  selectedPartner?: string;
}

const QuestionDesigner: React.FC<QuestionDesignerProps> = ({ selectedPartner }) => {
  const {
    questions,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    currentQuestion,
    setCurrentQuestion,
    isSaving,
    isDeleting,
    selectedQuestions,
    fetchQuestions,
    handleAddQuestion,
    handleEditQuestion,
    handleSaveQuestion,
    handleDeleteQuestion,
    handleMoveQuestion,
    toggleQuestionActive,
    toggleQuestionSelection,
    selectAllQuestions,
    clearSelection,
    bulkActivate,
    bulkDeactivate,
    bulkDelete
  } = useQuestionManager(selectedPartner);
  
  // Initial data fetch and real-time setup
  useEffect(() => {
    fetchQuestions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:survey_questions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'survey_questions' },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPartner]);
  
  // Re-fetch when partner filter changes
  useEffect(() => {
    fetchQuestions();
  }, [selectedPartner]);
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Survey Questions</CardTitle>
            <CardDescription>
              Design and manage the questions shown to community members
            </CardDescription>
          </div>
          <Button onClick={handleAddQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardHeader>
        <CardContent>
          <QuestionList
            questions={questions}
            loading={loading}
            selectedQuestions={selectedQuestions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onMoveQuestion={handleMoveQuestion}
            onToggleActive={toggleQuestionActive}
            onToggleSelection={toggleQuestionSelection}
            onSelectAll={selectAllQuestions}
            onClearSelection={clearSelection}
            onBulkActivate={bulkActivate}
            onBulkDeactivate={bulkDeactivate}
            onBulkDelete={bulkDelete}
          />
        </CardContent>
      </Card>
      
      {/* Question Editor Dialog */}
      <QuestionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        onSave={handleSaveQuestion}
        onDelete={handleDeleteQuestion}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default QuestionDesigner;
