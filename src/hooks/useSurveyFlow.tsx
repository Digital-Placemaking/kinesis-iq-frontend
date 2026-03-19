import { useState } from 'react';
import { Coupon } from '@/components/CouponPicker';
import { Sentiment } from '@/services/mockData';
import { toast } from 'sonner';
import mockDatabase from '@/services/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useSessionTracking } from '@/hooks/useSessionTracking';

export type AppStep = 
  | 'welcome'
  | 'locationPicker'
  | 'promotionOptIn'
  | 'couponPicker'
  | 'survey1'
  | 'survey2'
  | 'congratulations'
  | 'thankYou';

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

export const useSurveyFlow = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [showEmailOptIn, setShowEmailOptIn] = useState(false);
  const [claimedCouponData, setClaimedCouponData] = useState<Coupon | null>(null);
  const [survey2Skipped, setSurvey2Skipped] = useState(false);
  const { startNewSession, trackSessionEvent } = useSessionTracking();

  const handleStartSurvey = (email?: string) => {
    // Store email if provided, otherwise clear any stored email
    if (email) {
      localStorage.setItem('userEmail', email);
    } else {
      localStorage.removeItem('userEmail');
    }
    // Go directly to first survey
    startNewSession(undefined);
    setStep('survey1');
  };

  const handleTakePoll = () => {
    // Go directly to first survey without coupon selection
    startNewSession(undefined);
    trackSessionEvent('direct_to_poll');
    setStep('survey1');
  };

  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
    // Start new session and track visit
    startNewSession(location.id);
    setStep('couponPicker');
  };

  const handleSkipRegistration = () => {
    setStep('welcome');
  };

  // This function is no longer used directly in our flow
  // It's now handled by the PromotionOptIn component
  const handleRegister = async (email: string, name: string) => {
    // Get device ID if available (this would come from your WiFi sniffer)
    // For demo purposes, we'll generate a random device ID
    const deviceId = `demo-device-${Math.random().toString(36).substring(7)}`;
    
    // Update device opt-in status if we have a device ID
    try {
      // Store opt-in preference in localStorage
      localStorage.setItem('user_opt_in', 'true');
    } catch (err) {
      console.error('Failed to update device opt-in status:', err);
    }
    
    // Log the registration
    console.log('User registered:', { email, name, deviceId });
    
    return { email, name };
  };

  // This function is no longer used directly in our flow
  // It's now handled by the PromotionOptIn component
  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    // In a real app, this would use supabase.auth.signInWithOAuth
    // For now, just simulate the sign-in
    const userInfo = { provider };
    
    // Log the social sign-in
    console.log('User signed in with:', provider);
    
    return userInfo;
  };

  const handleCouponSelected = (coupon: Coupon, claimed?: boolean, claimedData?: Coupon) => {
    setSelectedCoupon(coupon);
    if (claimedData) {
      setClaimedCouponData(claimedData);
    }
    
    // If user skipped coupon selection, go directly to thank you page
    if (coupon.id === 'skipped') {
      trackSessionEvent('coupon_skipped');
      setStep('thankYou');
      return;
    }
    
    // Track coupon selection only for real coupons (not "no-coupon")
    if (coupon.id !== 'no-coupon') {
      trackSessionEvent('coupon_selected', coupon.id);
      if (claimed) {
        trackSessionEvent('coupon_claimed', coupon.id);
      }
    }
    // After coupon selection, go to congratulations
    setStep('congratulations');
  };
  
  const handleSurvey1Complete = (selectedSentiment: Sentiment, responseId?: string) => {
    setSentiment(selectedSentiment);
    setLastResponseId(responseId || null);
    
    // Add to mock database
    if (selectedSentiment) {
      mockDatabase.addResponse('1', selectedSentiment);
    }
    
    trackSessionEvent('survey1_complete');
    toast.success('Survey 1 complete! Moving to Survey 2...');
    // After first survey, go to second survey
    setTimeout(() => setStep('survey2'), 1000);
  };

  const handleSurvey2Complete = (selectedSentiment: Sentiment, responseId?: string) => {
    trackSessionEvent('survey2_complete');
    setSurvey2Skipped(false);
    toast.success('All surveys complete! Choose your reward...');
    // After second survey, go to coupon picker
    setTimeout(() => setStep('couponPicker'), 1000);
  };

  const handleSurvey2Skip = () => {
    trackSessionEvent('survey2_skipped');
    setSurvey2Skipped(true);
    // Skip to coupon picker
    setStep('couponPicker');
  };

  const handleResumeSurvey2 = () => {
    trackSessionEvent('survey2_resumed');
    setStep('survey2');
  };


  const handleDone = () => {
    setStep('welcome');
    setSelectedCoupon(null);
    setSentiment(null);
    setSurvey2Skipped(false);
  };

  const handleOptInYes = () => {
    console.log('User opted in for more deals');
    setStep('thankYou');
  };

  const handleOptInNo = () => {
    console.log('User declined additional offers');
    setStep('thankYou');
  };

  const handleEmailOptInComplete = (email?: string) => {
    console.log('Email opt-in completed:', email ? 'with email' : 'skipped');
    setShowEmailOptIn(false);
    setStep('thankYou');
  };

  const handleEmailOptInSkip = () => {
    console.log('Email opt-in skipped');
    setShowEmailOptIn(false);
    setStep('thankYou');
  };

  const handleThankYouDone = async () => {
    // Before redirecting, trigger the email sending function only if a real email was provided
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedEmail) {
      try {
        console.log("Triggering email sending process");
        
        // Call the edge function to process pending emails
        const { data, error } = await supabase.functions.invoke('send-promo-emails', {
          method: 'POST',
          body: { trigger: 'thank-you-page' }
        });
        
        if (error) {
          console.error("Error triggering email sending:", error);
        } else {
          console.log("Email sending triggered:", data);
          toast.success("Check your email for exclusive deals!", {
            duration: 5000
          });
        }
      } catch (err) {
        console.error("Failed to trigger email sending:", err);
      }
    } else {
      console.log("No email provided, skipping email sending");
    }
    
    // Reset the flow
    setStep('welcome');
  };

  return {
    step,
    setStep,
    selectedCoupon,
    selectedLocation,
    sentiment,
    lastResponseId,
    showEmailOptIn,
    claimedCouponData,
    survey2Skipped,
    handleStartSurvey,
    handleTakePoll,
    handleLocationSelected,
    handleSkipRegistration,
    handleRegister,
    handleSocialSignIn,
    handleCouponSelected,
    handleSurvey1Complete,
    handleSurvey2Complete,
    handleSurvey2Skip,
    handleResumeSurvey2,
    handleDone,
    handleOptInYes,
    handleOptInNo,
    handleEmailOptInComplete,
    handleEmailOptInSkip,
    handleThankYouDone
  };
};

export default useSurveyFlow;
