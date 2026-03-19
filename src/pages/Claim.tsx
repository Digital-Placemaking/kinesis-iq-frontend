import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, Loader2, Download } from 'lucide-react';

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expires_at: string;
  partner_id?: string;
}

const Claim = () => {
  const { couponId } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchCoupon();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .eq('active', true)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Coupon not found or no longer available');
        navigate('/');
        return;
      }

      setCoupon(data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast.error('Failed to load coupon');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter your name');
      return;
    }

    setClaiming(true);

    try {
      // Generate device ID from browser fingerprint
      const deviceId = localStorage.getItem('device_id') || 
        `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('device_id', deviceId);

      const { data, error } = await supabase.rpc('claim_coupon_with_share', {
        p_coupon_id: couponId,
        p_device_id: deviceId,
        p_user_email: formData.email,
        p_user_name: formData.name
      });

      if (error) throw error;

      const result = data as any;
      if (result && result.success) {
        setRedemptionCode(result.redemption_code);
        setClaimed(true);
        toast.success('Coupon claimed successfully!');
      } else {
        throw new Error(result?.message || 'Failed to claim coupon');
      }
    } catch (error) {
      console.error('Error claiming coupon:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to claim coupon');
    } finally {
      setClaiming(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('redemption-qr');
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
      downloadLink.download = `coupon-${redemptionCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coupon) {
    return null;
  }

  if (claimed && redemptionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Coupon Claimed!</CardTitle>
            <CardDescription>
              Show this QR code to redeem your coupon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex justify-center mb-4">
                <QRCodeSVG 
                  id="redemption-qr"
                  value={redemptionCode}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Code: <span className="font-mono font-bold">{redemptionCode}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{coupon.title}</h3>
              <p className="text-sm text-muted-foreground">{coupon.description}</p>
              <p className="text-lg font-bold text-primary">{coupon.discount}</p>
              {coupon.expires_at && (
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <Button onClick={downloadQRCode} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Save this QR code to your device. Present it at the time of purchase to redeem your discount.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Claim Your Coupon</CardTitle>
          <CardDescription>
            Enter your details to receive your discount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-1">{coupon.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
              <p className="text-xl font-bold text-primary">{coupon.discount}</p>
              {coupon.expires_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={claiming}>
              {claiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim Coupon'
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Email is optional. If provided, you may receive promotional updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Claim;
