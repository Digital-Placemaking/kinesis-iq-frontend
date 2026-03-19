
import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useDeviceTracking } from '@/hooks/useDeviceTracking';
import { useAuthState } from '@/hooks/useAuthState';
import useSurveyFlow from '@/hooks/useSurveyFlow';
import SurveyStepRenderer from '@/components/SurveyStepRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useSessionTracking } from '@/hooks/useSessionTracking';

const Index = () => {
  const { deviceId } = useDeviceTracking();
  const { userInfo, setUserInfo } = useAuthState();
  const { trackSessionEvent } = useSessionTracking();
  
  const {
    step,
    setStep,
    selectedCoupon,
    selectedLocation,
    lastResponseId,
    showEmailOptIn,
    claimedCouponData,
    survey2Skipped,
    handleStartSurvey,
    handleTakePoll,
    handleLocationSelected,
    handleSkipRegistration,
    handleCouponSelected,
    handleSurvey1Complete,
    handleSurvey2Complete,
    handleSurvey2Skip,
    handleResumeSurvey2,
    handleOptInYes,
    handleOptInNo,
    handleEmailOptInComplete,
    handleEmailOptInSkip,
    handleThankYouDone
  } = useSurveyFlow();

  // Track auth state changes and seed data for admin users
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Track auth login event
          trackSessionEvent('auth_login', undefined, undefined, {
            provider: user.app_metadata?.provider || 'email',
            email: user.email,
            timestamp: Date.now()
          });

          // If user is authenticated and on welcome screen, skip to survey
          if (step === 'welcome') {
            handleStartSurvey(user.email || undefined);
          }
        }
      } catch (error) {
        console.log('No admin user logged in, skipping data seeding');
      }
    };
    
    initializeData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Track auth login event for new sign-ins
        trackSessionEvent('auth_login', undefined, undefined, {
          provider: session.user.app_metadata?.provider || 'email',
          email: session.user.email,
          timestamp: Date.now()
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [trackSessionEvent, step, handleStartSurvey]);

  const handleRegister = async (email: string, name: string) => {
    // Store user info for future promotions
    setUserInfo({ email, name });
    
    // Proceed to thank you page
    setStep('thankYou');
  };

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setUserInfo({ provider });
    
    // Log the social sign-in
    console.log('User signed in with:', provider);
    
    // Proceed to thank you page
    setStep('thankYou');
  };

  return (
    <AppLayout>
      <SurveyStepRenderer
        step={step}
        selectedCoupon={claimedCouponData || selectedCoupon}
        selectedLocation={selectedLocation}
        userInfo={userInfo}
        lastResponseId={lastResponseId}
        showEmailOptIn={showEmailOptIn}
        survey2Skipped={survey2Skipped}
        onStartSurvey={handleStartSurvey}
        onTakePoll={handleTakePoll}
        onLocationSelected={handleLocationSelected}
        onSkipRegistration={handleSkipRegistration}
        onRegister={handleRegister}
        onSocialSignIn={handleSocialSignIn}
        onCouponSelected={handleCouponSelected}
        onSurvey1Complete={handleSurvey1Complete}
        onSurvey2Complete={handleSurvey2Complete}
        onSurvey2Skip={handleSurvey2Skip}
        onResumeSurvey2={handleResumeSurvey2}
        onOptInYes={handleOptInYes}
        onOptInNo={handleOptInNo}
        onEmailOptInComplete={handleEmailOptInComplete}
        onEmailOptInSkip={handleEmailOptInSkip}
        onThankYouDone={handleThankYouDone}
      />
    </AppLayout>
  );
};

export default Index;
