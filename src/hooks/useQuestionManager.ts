
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  active: boolean;
  partner_id?: string;
  survey_id?: string;
  survey_name?: string;
  options?: string[] | unknown;
}

export const useQuestionManager = (selectedPartner?: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('survey_questions')
        .select(`
          *,
          surveys (
            name
          )
        `)
        .order('order', { ascending: true });
      
      // Filter by partner if one is selected
      if (selectedPartner && selectedPartner !== 'all') {
        query = query.eq('partner_id', selectedPartner);
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      
      // Map the data to include survey name
      const questionsWithSurvey = (data || []).map(q => ({
        ...q,
        survey_name: q.surveys?.name || 'No Survey'
      }));
      
      setQuestions(questionsWithSurvey);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load survey questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newOrder = questions.length > 0 
      ? Math.max(...questions.map(q => q.order)) + 1 
      : 1;
      
    setCurrentQuestion({
      id: '',
      text: '',
      type: 'sentiment',
      order: newOrder,
      active: true,
      partner_id: selectedPartner === 'all' ? undefined : selectedPartner
    });
    setIsDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({ ...question });
    setIsDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    try {
      if (!currentQuestion) return;
      if (!currentQuestion.text.trim()) {
        toast.error('Question text cannot be empty');
        return;
      }
      
      setIsSaving(true);
      
      // Validate options for multiple choice and ranked questions
      if ((currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'ranked_choice')) {
        const options = (currentQuestion.options as string[]) || [];
        if (options.length < 2) {
          toast.error('Please add at least 2 options');
          return;
        }
      }

      // Determine if this is an update or insert
      if (currentQuestion.id) {
        const { error } = await supabase
          .from('survey_questions')
          .update({
            text: currentQuestion.text,
            type: currentQuestion.type,
            order: currentQuestion.order,
            active: currentQuestion.active,
            partner_id: currentQuestion.partner_id,
            survey_id: currentQuestion.survey_id,
            options: currentQuestion.options as any || []
          })
          .eq('id', currentQuestion.id);
          
        if (error) throw error;
        toast.success('Question updated successfully');
      } else {
        const { error } = await supabase
          .from('survey_questions')
          .insert({
            text: currentQuestion.text,
            type: currentQuestion.type,
            order: currentQuestion.order,
            active: true,
            partner_id: currentQuestion.partner_id,
            survey_id: currentQuestion.survey_id,
            options: currentQuestion.options as any || []
          });
          
        if (error) throw error;
        toast.success('Question added successfully');
      }
      
      setIsDialogOpen(false);
      await fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      if (!currentQuestion?.id) return;
      
      setIsDeleting(true);
      
      // Refresh the session token to ensure it's valid
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        toast.error('Session expired. Please log out and log back in.');
        return;
      }
      
      // Soft delete: set active to false instead of deleting
      const { error } = await supabase
        .from('survey_questions')
        .update({ active: false })
        .eq('id', currentQuestion.id);
        
      if (error) {
        console.error('Deactivation error details:', error);
        throw error;
      }
      
      toast.success('Question deactivated');
      setIsDialogOpen(false);
      await fetchQuestions();
    } catch (error) {
      console.error('Error deactivating question:', error);
      toast.error('Failed to deactivate question');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    try {
      const index = questions.findIndex(q => q.id === questionId);
      if (index === -1) return;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= questions.length) return;
      
      const questionToMove = questions[index];
      const questionToSwap = questions[newIndex];
      
      // Update the orders in the database
      const updates = [
        {
          id: questionToMove.id,
          order: questionToSwap.order
        },
        {
          id: questionToSwap.id,
          order: questionToMove.order
        }
      ];
      
      for (const update of updates) {
        await supabase
          .from('survey_questions')
          .update({ order: update.order })
          .eq('id', update.id);
      }
      
      await fetchQuestions();
    } catch (error) {
      console.error('Error moving question:', error);
      toast.error('Failed to reorder questions');
    }
  };

  const toggleQuestionActive = async (questionId: string, currentActive: boolean) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Session expired. Please log out and log back in.');
        return;
      }
      
      const { data, error } = await supabase.rpc('toggle_question_active', {
        p_question_id: questionId,
        p_user_id: session.user.id
      });
        
      if (error) {
        console.error('Toggle error details:', error);
        throw error;
      }
      
      const result = data as { success: boolean; message?: string; active?: boolean };
      
      if (result && !result.success) {
        toast.error(result.message || 'Failed to update question status');
        return;
      }
      
      await fetchQuestions();
      toast.success(`Question ${result.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling question status:', error);
      toast.error('Failed to update question status');
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(new Set(questions.map(q => q.id)));
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const bulkActivate = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Session expired. Please log out and log back in.');
        return;
      }

      const promises = Array.from(selectedQuestions).map(questionId =>
        supabase.rpc('set_question_active', {
          p_question_id: questionId,
          p_user_id: session.user.id,
          p_active: true
        })
      );

      await Promise.all(promises);
      await fetchQuestions();
      clearSelection();
      toast.success(`${selectedQuestions.size} question${selectedQuestions.size > 1 ? 's' : ''} activated`);
    } catch (error) {
      console.error('Error in bulk activate:', error);
      toast.error('Failed to activate questions');
    }
  };

  const bulkDeactivate = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Session expired. Please log out and log back in.');
        return;
      }

      const promises = Array.from(selectedQuestions).map(questionId =>
        supabase.rpc('set_question_active', {
          p_question_id: questionId,
          p_user_id: session.user.id,
          p_active: false
        })
      );

      await Promise.all(promises);
      await fetchQuestions();
      clearSelection();
      toast.success(`${selectedQuestions.size} question${selectedQuestions.size > 1 ? 's' : ''} deactivated`);
    } catch (error) {
      console.error('Error in bulk deactivate:', error);
      toast.error('Failed to deactivate questions');
    }
  };

  const bulkDelete = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Session expired. Please log out and log back in.');
        return;
      }

      const promises = Array.from(selectedQuestions).map(questionId =>
        supabase
          .from('survey_questions')
          .update({ active: false })
          .eq('id', questionId)
      );

      await Promise.all(promises);
      await fetchQuestions();
      clearSelection();
      toast.success(`${selectedQuestions.size} questions deleted`);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to delete questions');
    }
  };

  return {
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
  };
};
