import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Check, Mail, MessageSquare, Send, Image as ImageIcon, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateShareLink } from '@/services/pdfCouponService';
import { overlayQROnCoupon, shareImage, uploadCouponImageToStorage } from '@/services/qrOverlayService';
import { toast } from 'sonner';

interface ShareCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareToken: string;
  couponTitle: string;
  couponCode?: string;
  couponImageUrl?: string;
}

export const ShareCouponDialog: React.FC<ShareCouponDialogProps> = ({
  open,
  onOpenChange,
  shareToken,
  couponTitle,
  couponCode,
  couponImageUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const shareLink = generateShareLink(shareToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: couponTitle,
          text: `Check out this coupon: ${couponTitle}`,
          url: shareLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const shareMessage = `Check out this great deal: ${couponTitle}! Claim your coupon here: ${shareLink}`;

  const handleSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(smsUrl, '_blank');
  };

  const handleEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(couponTitle)}&body=${encodeURIComponent(shareMessage)}`;
    window.open(emailUrl, '_blank');
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${couponTitle} - Claim your coupon!`)}&url=${encodeURIComponent(shareLink)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleShareImage = async () => {
    if (!couponImageUrl || !couponCode) {
      toast.error('Coupon image not available for sharing');
      return;
    }

    try {
      setIsGeneratingImage(true);
      toast.loading('Generating shareable image...');

      // Generate image with QR code
      const combinedImage = await overlayQROnCoupon(
        couponImageUrl,
        couponCode,
        { qrSize: 180, qrPosition: 'bottom-right' }
      );

      // Try to share
      const result = await shareImage(
        combinedImage,
        couponTitle.replace(/\s+/g, '-'),
        `Check out ${couponTitle}!`
      );

      if (result.success) {
        if (result.method === 'native') {
          toast.success('Opening share menu...');
        } else {
          toast.success('Image downloaded! Share it manually.');
        }
      } else {
        toast.error('Failed to share image');
      }
    } catch (error) {
      console.error('Failed to share image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!couponImageUrl || !couponCode) {
      toast.error('Coupon image not available');
      return;
    }

    try {
      setIsGeneratingImage(true);
      toast.loading('Generating image...');

      const combinedImage = await overlayQROnCoupon(
        couponImageUrl,
        couponCode,
        { qrSize: 180, qrPosition: 'bottom-right' }
      );

      // Create download
      const link = document.createElement('a');
      link.href = combinedImage;
      link.download = `${couponTitle.replace(/\s+/g, '-')}-${couponCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleWhatsAppImageShare = async () => {
    if (!couponImageUrl || !couponCode) {
      toast.error('Coupon image not available');
      return;
    }

    try {
      setIsGeneratingImage(true);
      toast.loading('Preparing WhatsApp share...');

      // Generate image with QR code
      const combinedImage = await overlayQROnCoupon(
        couponImageUrl,
        couponCode,
        { qrSize: 180, qrPosition: 'bottom-right' }
      );

      // Convert to blob
      const response = await fetch(combinedImage);
      const blob = await response.blob();
      const file = new File([blob], `${couponTitle.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      const whatsappMessage = `🎉 Check out this amazing deal!\n\n${couponTitle}\n\nClaim yours here: ${shareLink}`;

      // Check if native share is available (mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            text: whatsappMessage,
            files: [file],
          });
          toast.success('Opening WhatsApp...');
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            throw error;
          }
        }
      } else {
        // Desktop fallback: Download image and open WhatsApp Web with message
        // Create download
        const link = document.createElement('a');
        link.href = combinedImage;
        link.download = `${couponTitle.replace(/\s+/g, '-')}-${couponCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Open WhatsApp Web with message
        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        toast.success('Image downloaded! Paste it in WhatsApp chat.');
      }
    } catch (error) {
      console.error('Failed to share to WhatsApp:', error);
      toast.error('Failed to prepare WhatsApp share');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Coupon</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Image Sharing Section */}
          {couponImageUrl && couponCode && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Share as Image</Label>
                <p className="text-sm text-muted-foreground">
                  Share your personalized coupon with embedded QR code
                </p>
                <div className="space-y-2">
                  {/* WhatsApp Image Share - Featured */}
                  <Button
                    onClick={handleWhatsAppImageShare}
                    disabled={isGeneratingImage}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                    size="lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isGeneratingImage ? 'Generating...' : 'Share Image on WhatsApp'}
                  </Button>
                  
                  {/* Other Image Share Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleShareImage}
                      disabled={isGeneratingImage}
                      variant="outline"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {isGeneratingImage ? 'Generating...' : 'More Options'}
                    </Button>
                    <Button
                      onClick={handleDownloadImage}
                      disabled={isGeneratingImage}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Link Sharing Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Share Link</Label>
            <p className="text-sm text-muted-foreground">
              Friends can claim their own unique coupon
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={shareLink} size={200} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Share via Messaging</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSMS}
                variant="outline"
                className="flex items-center justify-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
              <Button
                onClick={handleEmail}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Send className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleFacebook}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
            <Button
              onClick={handleTwitter}
              variant="outline"
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Twitter / X
            </Button>
            {navigator.share && (
              <Button
                onClick={handleShare}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                More Options
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Anyone who clicks this link can claim their own copy of the coupon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
