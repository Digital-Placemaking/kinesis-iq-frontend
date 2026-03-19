
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, Share2, ImageDown } from 'lucide-react';
import { toast } from 'sonner';
import { Coupon } from '../CouponPicker';
import { WalletButtons } from '../wallet/WalletButtons';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { supabase } from '@/integrations/supabase/client';
import { ShareCouponDialog } from '../coupon/ShareCouponDialog';
import { overlayQROnCoupon, downloadImage } from '@/services/qrOverlayService';

interface ActionButtonsProps {
  coupon: Coupon;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  userEmail?: string;
  userName?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  coupon, 
  copied, 
  setCopied,
  userEmail,
  userName
}) => {
  const { trackSessionEvent } = useSessionTracking();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Debug logging
  console.log('🔍 ActionButtons render:', {
    couponId: coupon.id,
    hasShareToken: !!coupon.share_token,
    shareToken: coupon.share_token,
    couponCode: coupon.code,
    hasImageUrl: !!coupon.image_url
  });
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success('Coupon code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
      
      // Track copy event
      trackSessionEvent('copy_code', coupon.id);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCouponImage = async () => {
    if (!coupon.image_url || !coupon.code) {
      toast.error('Coupon image or code not available');
      return;
    }

    try {
      setIsGeneratingImage(true);
      toast.loading('Generating your personalized coupon...');
      
      // Generate the combined image with QR code overlay
      const combinedImageUrl = await overlayQROnCoupon(
        coupon.image_url,
        coupon.code,
        {
          qrSize: 180,
          qrPosition: 'bottom-right',
          padding: 20,
        }
      );

      // Download the image
      const filename = `${coupon.title.replace(/\s+/g, '-')}-${coupon.code}.png`;
      downloadImage(combinedImageUrl, filename);
      
      toast.success('Coupon image downloaded!');
      trackSessionEvent('download_coupon_image', coupon.id);
    } catch (error) {
      console.error('Failed to generate coupon image:', error);
      toast.error('Failed to generate coupon image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    try {
      toast.loading('Creating Google Wallet pass...');
      
      // Call the Google Wallet edge function
      const { data, error } = await supabase.functions.invoke('google-wallet', {
        body: {
          id: coupon.id,
          title: coupon.title,
          code: coupon.code,
          discount: coupon.discount || 'Special Offer',
          validUntil: coupon.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: coupon.description,
        }
      });

      if (error) {
        console.error('Google Wallet error:', error);
        toast.error('Failed to add to Google Wallet');
        return;
      }

      if (data?.success && data?.saveUrl) {
        // Create a temporary link and click it - this works better for cross-origin redirects
        const link = document.createElement('a');
        link.href = data.saveUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Opening Google Wallet...');
        
        // Track wallet add event
        trackSessionEvent('add_to_google_wallet', coupon.id);
      } else {
        toast.error(data?.message || 'Failed to create wallet pass');
      }
    } catch (err) {
      console.error('Failed to add to Google Wallet:', err);
      toast.error('Failed to add to Google Wallet');
    }
  };

  return (
    <>
      <div className="w-full space-y-3">
        <Button 
          onClick={handleCopyCode} 
          className="w-full bg-toronto-blue hover:bg-toronto-lightblue"
          size="lg"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>

        {coupon.image_url && coupon.code && (
          <Button 
            onClick={handleDownloadCouponImage}
            disabled={isGeneratingImage}
            className="w-full bg-toronto-blue hover:bg-toronto-lightblue"
            size="lg"
          >
            <ImageDown className="mr-2 h-4 w-4" />
            {isGeneratingImage ? 'Generating...' : 'Download Coupon with QR'}
          </Button>
        )}

        <Button 
          onClick={handleAddToGoogleWallet}
          className="w-full bg-toronto-blue hover:bg-toronto-lightblue"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Add to Google Wallet
        </Button>

        {coupon.share_token && (
          <Button 
            onClick={() => {
              setShareDialogOpen(true);
              trackSessionEvent('share_button_clicked', coupon.id);
            }}
            className="w-full bg-toronto-blue hover:bg-toronto-lightblue"
            size="lg"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share with Friends
          </Button>
        )}
      </div>

      {coupon.share_token && (
        <ShareCouponDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shareToken={coupon.share_token}
          couponTitle={coupon.title}
          couponCode={coupon.code}
          couponImageUrl={coupon.image_url}
        />
      )}
    </>
  );
};
