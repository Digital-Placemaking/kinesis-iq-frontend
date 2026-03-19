import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface Survey {
  id: string;
  name: string;
  description?: string;
  type: string;
  order_index: number;
  active: boolean;
}

interface SurveyDialogProps {
  open: boolean;
  survey: Survey | null;
  onClose: () => void;
  onSave: (data: Partial<Survey>) => void;
}

export const SurveyDialog = ({ open, survey, onClose, onSave }: SurveyDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('general');
  const [orderIndex, setOrderIndex] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (survey) {
      setName(survey.name);
      setDescription(survey.description || '');
      setType(survey.type);
      setOrderIndex(survey.order_index);
      setActive(survey.active);
    } else {
      setName('');
      setDescription('');
      setType('general');
      setOrderIndex(1);
      setActive(true);
    }
  }, [survey, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      description,
      type,
      order_index: orderIndex,
      active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{survey ? 'Edit Survey' : 'Create Survey'}</DialogTitle>
            <DialogDescription>
              {survey ? 'Update survey details' : 'Create a new survey with custom name'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Survey Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Satisfaction Survey"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey purpose"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., survey1, survey2, feedback"
              />
              <p className="text-xs text-muted-foreground">
                Used internally to group questions. Use 'survey1' or 'survey2' for the two-survey flow.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Order in which surveys appear (1 = first)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {survey ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};