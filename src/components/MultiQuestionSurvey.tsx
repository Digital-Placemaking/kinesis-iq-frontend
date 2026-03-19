import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sentiment } from '@/components/sentiment/SentimentOptions';
import { useSentimentQuestion } from '@/hooks/useSentimentQuestion';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import SentimentOptions from './sentiment/SentimentOptions';
import RankedChoiceQuestion from './sentiment/RankedChoiceQuestion';
import SurveyLoadingState from './sentiment/SurveyLoadingState';
import SurveyNoQuestionState from './sentiment/SurveyNoQuestionState';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MultiQuestionSurveyProps {
  onComplete: (sentiment: Sentiment) => void;
  partnerId?: string;
  surveyId?: string;
  onSkip?: () => void;
  showSkip?: boolean;
  surveyNumber?: number;
  totalSurveys?: number;
}

const MultiQuestionSurvey = ({ onComplete, partnerId, surveyId, onSkip, showSkip, surveyNumber, totalSurveys }: MultiQuestionSurveyProps) => {
  const { questions, loading } = useSentimentQuestion(partnerId, surveyId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { sessionId } = useSessionTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    setIsSubmitting(true);
    try {
      const locationId = localStorage.getItem('currentHotspotId');
      
      // Submit to database using RPC function
      const { error } = await supabase.rpc(
        'insert_survey_response',
        {
          p_question_id: currentQuestion.id,
          p_answer: answer,
          p_session_id: sessionId,
          p_comment: null,
          p_location_id: locationId || null,
          p_partner_id: partnerId || null
        }
      );
        
      if (error) {
        console.error('Error saving response:', error);
        toast.error('Failed to save—please retry');
        return;
      }
      
      // Move to next question or complete
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTextAnswer('');
        setSelectedOption('');
        setSelectedSentiment(null);
      } else {
        // Don't show toast here - let the parent component handle it
        onComplete(answer as Sentiment);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to save your response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRankedSubmit = async (rankedOptions: string[]) => {
    if (!currentQuestion) return;

    setIsSubmitting(true);
    try {
      const locationId = localStorage.getItem('currentHotspotId');
      
      // Submit ranked choice as JSON array
      const { error } = await supabase.rpc(
        'insert_survey_response',
        {
          p_question_id: currentQuestion.id,
          p_answer: JSON.stringify(rankedOptions),
          p_session_id: sessionId,
          p_comment: null,
          p_location_id: locationId || null,
          p_partner_id: partnerId || null
        }
      );
        
      if (error) {
        console.error('Error saving response:', error);
        toast.error('Failed to save—please retry');
        return;
      }
      
      // Move to next question or complete
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Don't show toast here - let the parent component handle it
        onComplete('neutral' as Sentiment); // Default sentiment for ranked choice
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to save your response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSentimentSelect = (sentiment: Sentiment) => {
    if (isSubmitting) return;
    setSelectedSentiment(sentiment);
    setTimeout(() => {
      handleAnswer(sentiment);
    }, 500);
  };

  if (loading) {
    return <SurveyLoadingState />;
  }

  if (!questions || questions.length === 0) {
    return <SurveyNoQuestionState />;
  }

  if (!currentQuestion) {
    return <SurveyNoQuestionState />;
  }

  // Handle skip for any question type (except first question)
  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTextAnswer('');
      setSelectedOption('');
      setSelectedSentiment(null);
    } else {
      // Don't show toast here - let the parent component handle it
      onComplete('neutral' as Sentiment);
    }
  };

  // Render different question types
  const renderQuestion = () => {
    const isFirstQuestion = currentIndex === 0;

    if (currentQuestion.type === 'ranked_choice' && Array.isArray(currentQuestion.options)) {
      return (
        <RankedChoiceQuestion
          question={{
            id: currentQuestion.id,
            text: currentQuestion.text,
            options: currentQuestion.options as string[]
          }}
          onSubmit={handleRankedSubmit}
          onSkip={handleSkip}
          isSubmitting={isSubmitting}
          isFirstQuestion={isFirstQuestion}
        />
      );
    }

    if (currentQuestion.type === 'multiple_choice' && Array.isArray(currentQuestion.options)) {
      return (
        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {(currentQuestion.options as string[]).map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleAnswer(selectedOption)}
              disabled={!selectedOption || isSubmitting}
              className="flex-1"
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Submit'}
            </Button>
            {!isFirstQuestion && (
              <Button 
                onClick={handleSkip}
                disabled={isSubmitting}
                variant="outline"
              >
                Skip
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (currentQuestion.type === 'text') {
      return (
        <div className="space-y-4">
          <Textarea
            placeholder="Type your answer here..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => handleAnswer(textAnswer)}
              disabled={!textAnswer.trim() || isSubmitting}
              className="flex-1"
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Submit'}
            </Button>
            {!isFirstQuestion && (
              <Button 
                onClick={handleSkip}
                disabled={isSubmitting}
                variant="outline"
              >
                Skip
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Default sentiment question
    return (
      <div className="space-y-4">
        <SentimentOptions
          onSentimentSelect={handleSentimentSelect}
          isSubmitting={isSubmitting}
          selectedSentiment={selectedSentiment}
        />
        {!isFirstQuestion && (
          <Button 
            onClick={handleSkip}
            disabled={isSubmitting}
            variant="outline"
            className="w-full"
          >
            Skip
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {surveyNumber && totalSurveys && (
          <div className="mb-2 px-3 py-1 bg-kinesis-orange text-white rounded-md text-lg font-semibold inline-block w-fit">
            Survey {surveyNumber} of {totalSurveys}
          </div>
        )}
        <CardTitle>
          Question {currentIndex + 1} of {questions.length}
        </CardTitle>
        <CardDescription>{currentQuestion.text}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderQuestion()}
        {showSkip && onSkip && (
          <Button 
            onClick={onSkip}
            variant="ghost"
            className="w-full mt-4"
          >
            Skip this survey for now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiQuestionSurvey;
