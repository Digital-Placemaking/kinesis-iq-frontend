
import React from 'react';
import { AppStep } from '@/hooks/useSurveyFlow';
import WelcomeScreen from '@/components/WelcomeScreen';
import MultiQuestionSurvey from '@/components/MultiQuestionSurvey';
import { Coupon } from '@/components/CouponPicker';
import CouponPicker from '@/components/CouponPicker';
import { CongratulationsScreen } from '@/components/congratulations';

import PromotionOptIn from '@/components/PromotionOptIn';
import ThankYou from '@/components/ThankYou';
import { Sentiment } from '@/services/mockData';
import BrandImage from '@/components/BrandImage';
import LocationPicker from '@/components/LocationPicker';

interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  active: boolean;
  client_name?: string;
  parent_location_id?: string;
}

interface SurveyStepRendererProps {
  step: AppStep;
  selectedCoupon: Coupon | null;
  selectedLocation: Location | null;
  userInfo: any;
  lastResponseId?: string | null;
  showEmailOptIn?: boolean;
  survey2Skipped?: boolean;
  onStartSurvey: (email?: string) => void;
  onTakePoll?: () => void;
  onLocationSelected: (location: Location) => void;
  onSkipRegistration: () => void;
  onRegister: (email: string, name: string) => void;
  onSocialSignIn: (provider: 'google' | 'apple') => void;
  onCouponSelected: (coupon: Coupon, claimed?: boolean, claimedData?: Coupon) => void;
  onSurvey1Complete: (sentiment: Sentiment, responseId?: string) => void;
  onSurvey2Complete: (sentiment: Sentiment, responseId?: string) => void;
  onSurvey2Skip: () => void;
  onResumeSurvey2: () => void;
  onOptInYes: () => void;
  onOptInNo: () => void;
  onEmailOptInComplete?: (email?: string) => void;
  onEmailOptInSkip?: () => void;
  onThankYouDone: () => void;
}

const SurveyStepRenderer: React.FC<SurveyStepRendererProps> = ({
  step,
  selectedCoupon,
  selectedLocation,
  userInfo,
  lastResponseId,
  showEmailOptIn,
  survey2Skipped,
  onStartSurvey,
  onTakePoll,
  onLocationSelected,
  onSkipRegistration,
  onRegister,
  onSocialSignIn,
  onCouponSelected,
  onSurvey1Complete,
  onSurvey2Complete,
  onSurvey2Skip,
  onResumeSurvey2,
  onOptInYes,
  onOptInNo,
  onEmailOptInComplete,
  onEmailOptInSkip,
  onThankYouDone,
}) => {

  const renderCurrentStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStartSurvey={onStartSurvey} onTakePoll={onTakePoll} />;
        
      case 'locationPicker':
        return (
          <div className="animate-fade-in">
            <LocationPicker onLocationSelected={onLocationSelected} />
          </div>
        );
        
      case 'promotionOptIn':
        return (
          <div className="animate-scale-in">
            <PromotionOptIn 
              onSkip={onSkipRegistration}
              onRegister={onRegister}
              onSocialSignIn={onSocialSignIn}
              couponId={selectedCoupon?.id}
            />
          </div>
        );
        
      case 'couponPicker':
        return (
          <div className="animate-slide-in-right">
            <CouponPicker 
              onCouponSelected={onCouponSelected} 
              partnerId={selectedLocation?.id}
            />
          </div>
        );
        
      case 'survey1':
        return (
          <div className="animate-fade-in">
            <MultiQuestionSurvey 
              onComplete={onSurvey1Complete}
              partnerId={selectedLocation?.id}
              surveyNumber={1}
              totalSurveys={2}
            />
          </div>
        );
        
      case 'survey2':
        return (
          <div className="animate-fade-in">
            <MultiQuestionSurvey 
              onComplete={onSurvey2Complete}
              onSkip={onSurvey2Skip}
              partnerId={selectedLocation?.id}
              surveyNumber={2}
              totalSurveys={2}
              showSkip={true}
            />
          </div>
        );
        
      case 'congratulations':
        return selectedCoupon ? (
          <div className="animate-fade-in">
            <CongratulationsScreen 
              coupon={selectedCoupon} 
              onOptInYes={onOptInYes}
              onOptInNo={onOptInNo}
              showEmailOptIn={showEmailOptIn}
              onEmailOptInComplete={onEmailOptInComplete}
              onEmailOptInSkip={onEmailOptInSkip}
              userInfo={userInfo}
            />
          </div>
        ) : null;
        
      case 'thankYou':
        return (
          <div className="animate-fade-in">
            <ThankYou 
              onDone={onThankYouDone}
              userInfo={userInfo}
              selectedCoupon={selectedCoupon}
              survey2Skipped={survey2Skipped}
              onResumeSurvey2={onResumeSurvey2}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  const shouldShowBrandImage = () => {
    return step !== 'congratulations' && step !== 'thankYou';
  };

  return (
    <>
      {renderCurrentStep()}
      
      {shouldShowBrandImage() && (
        <div className="mt-8">
          <BrandImage />
        </div>
      )}
    </>
  );
};

export default SurveyStepRenderer;
