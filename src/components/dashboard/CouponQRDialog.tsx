import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CouponQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: {
    id: string;
    title: string;
    discount: string;
  };
}

const CouponQRDialog: React.FC<CouponQRDialogProps> = ({ open, onOpenChange, coupon }) => {
  // Use published URL instead of preview URL
  const publishedUrl = 'https://a55d4558-3bb7-4f1e-8190-3b63114b3efb.lovableproject.com';
  const claimUrl = `${publishedUrl}/claim/${coupon.id}`;
  const [customMessage, setCustomMessage] = useState('Scan to claim your exclusive offer');

  const downloadQRCode = () => {
    const svg = document.getElementById('master-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `coupon-qr-${coupon.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR code downloaded');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyClaimUrl = () => {
    navigator.clipboard.writeText(claimUrl);
    toast.success('Claim URL copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Master QR Code</DialogTitle>
          <DialogDescription>
            Print this QR code for customers to claim the coupon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          <div>
            <Label htmlFor="custom-message">Custom Message</Label>
            <Input
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value.slice(0, 80))}
              placeholder="Enter your branded message"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {customMessage.length}/80 characters
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 border-[8px] border-red-600 inline-block">
              <QRCodeSVG 
                id="master-qr-code"
                value={claimUrl}
                size={240}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">QR Code URL:</p>
            <p className="text-xs text-gray-600 break-all font-mono">
              {claimUrl}
            </p>
            <Button 
              onClick={() => window.open(claimUrl, '_blank')} 
              variant="outline" 
              size="sm"
              className="w-full mt-2"
            >
              Test URL in Browser
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-center">{coupon.title}</h3>
            <p className="text-lg font-bold text-primary text-center">{coupon.discount}</p>
            <p className="text-sm text-muted-foreground text-center italic">
              {customMessage}
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={downloadQRCode} className="w-full" variant="default">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            
            <Button onClick={copyClaimUrl} className="w-full" variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Claim URL
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong>
            </p>
            <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Print and display this QR code</li>
              <li>Customer scans with their phone</li>
              <li>They enter name and email to claim</li>
              <li>They receive personal redemption QR code</li>
              <li>Staff scans redemption code at checkout</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponQRDialog;
