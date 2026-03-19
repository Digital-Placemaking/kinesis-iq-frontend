import { Button } from '@/components/ui/button';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Survey {
  id: string;
  name: string;
  description?: string;
  type: string;
  order_index: number;
  active: boolean;
}

interface SurveyListProps {
  surveys: Survey[];
  loading: boolean;
  onEdit: (survey: Survey) => void;
  onDelete: (surveyId: string) => void;
}

export const SurveyList = ({ surveys, loading, onEdit, onDelete }: SurveyListProps) => {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading surveys...</div>;
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No surveys found. Create your first survey to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{survey.name}</h3>
                <Badge variant={survey.active ? 'default' : 'secondary'}>
                  {survey.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">Order: {survey.order_index}</Badge>
              </div>
              {survey.description && (
                <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(survey)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Are you sure you want to delete this survey? This will not delete the questions.')) {
                  onDelete(survey.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};