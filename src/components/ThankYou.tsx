import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { EmailOptIn } from "@/components/congratulations/EmailOptIn";
import { Coupon } from "@/components/CouponPicker";

interface ThankYouProps {
  onDone: () => void;
  userInfo?: {
    email?: string;
    name?: string;
    provider?: string;
  } | null;
  selectedCoupon?: Coupon | null;
  survey2Skipped?: boolean;
  onResumeSurvey2?: () => void;
}

const ThankYou: React.FC<ThankYouProps> = ({ onDone, userInfo, selectedCoupon, survey2Skipped, onResumeSurvey2 }) => {
  // For poll-only flows (no coupon or no-coupon), always show email opt-in regardless of userInfo
  const isPollOnly = !selectedCoupon || selectedCoupon.id === 'no-coupon';
  const [optedInEmail, setOptedInEmail] = useState<string | undefined>(isPollOnly ? undefined : userInfo?.email);
  const [showEmailOptIn, setShowEmailOptIn] = useState(isPollOnly ? true : !userInfo?.email);

  // Display toast notification when component mounts - only if a real coupon was claimed
  useEffect(() => {
    if (selectedCoupon && selectedCoupon.id !== 'no-coupon') {
      toast.success("Your coupon has been deposited into your e-wallet!", {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [selectedCoupon]);

  const handleEmailOptInComplete = (email?: string) => {
    setOptedInEmail(email);
    setShowEmailOptIn(false);
    if (email) {
      localStorage.setItem('userEmail', email);
    }
  };

  const handleEmailOptInSkip = () => {
    setShowEmailOptIn(false);
  };

  const [userReferralCode, setUserReferralCode] = useState<string>('');

  // Get user's referral code from their email record
  useEffect(() => {
    const fetchReferralCode = async () => {
      const userEmail = optedInEmail || userInfo?.email;
      if (userEmail) {
        const { data } = await supabase
          .from('user_emails')
          .select('referral_code')
          .eq('email_address', userEmail)
          .single();
        
        if (data?.referral_code) {
          setUserReferralCode(data.referral_code);
        }
      }
    };
    fetchReferralCode();
  }, [optedInEmail, userInfo?.email]);

  const shareUrl = `https://foxyboxwaxbar.digitalplacemaking.ca/${userReferralCode ? `?ref=${userReferralCode}` : ''}`;
  const shareText = "Connect with Anthony Perruzza - City Councillor for Humber River - Black Creek";

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    let url = '';
    
    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Thanks for sharing!');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        {/* Header */}
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/anthony-perruzza-logo.jpg" 
            alt="Anthony Perruzza - City Councillor, Humber River - Black Creek" 
            className="mx-auto w-32 h-auto mb-4"
          />
          <CardTitle className="text-2xl font-playfair mb-2">
            Thank You for Your Support
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="text-center">
          {/* Email Opt-In Section - Show if no email yet */}
          {showEmailOptIn && (
            <div className="mb-6">
              <EmailOptIn 
                onComplete={handleEmailOptInComplete}
                onSkip={handleEmailOptInSkip}
              />
            </div>
          )}

          {/* Confirmation Message */}
          {optedInEmail ? (
            userInfo?.name ? (
              <p className="text-gray-600 mb-4">
                Thanks, {userInfo.name}! You're now signed up for exclusive offers and updates.
              </p>
            ) : userInfo?.provider ? (
              <p className="text-gray-600 mb-4">
                Thanks for signing in with {userInfo.provider.charAt(0).toUpperCase() + userInfo.provider.slice(1)}!
                Get ready to unlock exclusive offers and updates wherever you are.
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                You're now signed up for exclusive offers and updates.
              </p>
            )
          ) : (
            <div className="text-gray-600 mb-4">
              <p>
                Thank you for your feedback! Your input helps us improve.
              </p>
              <p className="mt-2 font-bold">
                Your data stays anonymous.
              </p>
            </div>
          )}

          {/* Email Confirmation */}
          {optedInEmail && (
            <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3 text-left mb-4">
              <Mail className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Confirmation Sent</p>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation to {optedInEmail}.
                </p>
              </div>
            </div>
          )}

          {/* Offers Coming Soon - Only show if email provided */}
          {optedInEmail && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 text-left mb-4">
              <Gift className="text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Watch for exclusive offers tailored just for you delivered straight into your inbox.</p>
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="p-6 bg-toronto-blue rounded-lg mb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Share2 className="h-6 w-6 text-white" />
              <p className="text-xl font-semibold text-white">Share with Friends & Earn Rewards</p>
            </div>
            <p className="text-white/90 text-sm mb-4 text-center">
              Share your unique referral link and get rewarded when friends sign up!
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 border-0"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 border-0"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 border-0"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Privacy Message */}
          <div className="p-4 bg-toronto-gray/50 rounded-md">
            <p className="text-sm text-gray-500">
              We value your privacy. Unsubscribe anytime.
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col gap-2">
          {survey2Skipped && onResumeSurvey2 && (
            <Button 
              onClick={onResumeSurvey2}
              variant="outline"
              className="w-full"
            >
              Complete Bonus Survey
            </Button>
          )}
          <a 
            href="https://www.anthonyperruzza.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-toronto-blue hover:bg-toronto-lightblue text-white text-lg w-full"
          >
            Return Home
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThankYou;