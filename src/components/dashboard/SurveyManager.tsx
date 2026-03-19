import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SurveyList } from './surveys/SurveyList';
import { SurveyDialog } from './surveys/SurveyDialog';

interface Survey {
  id: string;
  name: string;
  description?: string;
  type: string;
  order_index: number;
  partner_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface SurveyManagerProps {
  selectedPartner?: string;
}

export const SurveyManager = ({ selectedPartner }: SurveyManagerProps) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('surveys')
        .select('*')
        .order('order_index', { ascending: true });

      if (selectedPartner) {
        query = query.eq('partner_id', selectedPartner);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching surveys:', error);
        toast.error('Failed to load surveys');
        return;
      }

      setSurveys(data || []);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();

    const channel = supabase
      .channel('surveys_changes')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public', 
          table: 'surveys'
        }, 
        () => {
          fetchSurveys();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPartner]);

  const handleCreate = () => {
    setEditingSurvey(null);
    setDialogOpen(true);
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setDialogOpen(true);
  };

  const handleDelete = async (surveyId: string) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;

      toast.success('Survey deleted successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  const handleSave = async (surveyData: Partial<Survey>) => {
    try {
      if (editingSurvey) {
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', editingSurvey.id);

        if (error) throw error;
        toast.success('Survey updated successfully');
      } else {
        // Ensure name is present for new surveys
        if (!surveyData.name) {
          toast.error('Survey name is required');
          return;
        }
        
        const { error } = await supabase
          .from('surveys')
          .insert([{ 
            name: surveyData.name,
            description: surveyData.description,
            type: surveyData.type || 'general',
            order_index: surveyData.order_index || 1,
            active: surveyData.active ?? true,
            partner_id: selectedPartner || null 
          }]);

        if (error) throw error;
        toast.success('Survey created successfully');
      }

      setDialogOpen(false);
      fetchSurveys();
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Survey Management</CardTitle>
            <CardDescription>
              Create and manage surveys with custom names
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SurveyList
          surveys={surveys}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <SurveyDialog
          open={dialogOpen}
          survey={editingSurvey}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      </CardContent>
    </Card>
  );
};