
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X } from "lucide-react";
import { toast } from "sonner";
import { fetchCoupons, claimCoupon } from "@/services/couponService";
import { supabase } from "@/integrations/supabase/client";
import { isCouponScheduleValid, getScheduleDescription } from "@/utils/couponSchedule";

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  expiresIn: string;
  expires_at?: string;
  image?: string;
  image_url?: string;
  discount?: string;
  remaining?: number;
  claimedCount?: number;
  share_token?: string;
  valid_days?: string[];
  valid_time_start?: string;
  valid_time_end?: string;
}

interface CouponPickerProps {
  onCouponSelected: (coupon: Coupon, claimed?: boolean, claimedData?: Coupon) => void;
  partnerId?: string;
}

const CouponPicker: React.FC<CouponPickerProps> = ({ onCouponSelected, partnerId }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      console.log('Loading coupons for picker with partnerId:', partnerId);
      
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading coupons:', error);
        toast.error('Failed to load offers');
        setCoupons([]);
        return;
      }

      const availableCoupons = (data || []).map(coupon => ({
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        code: '', // Code is not exposed during browsing - revealed only after claiming
        expiresIn: 'Soon', // We'll calculate this based on expires_at
        expires_at: coupon.expires_at,
        discount: coupon.discount,
        image_url: coupon.image_url,
        valid_days: coupon.valid_days,
        valid_time_start: coupon.valid_time_start,
        valid_time_end: coupon.valid_time_end
      }));

      console.log('Fetched coupons for picker:', availableCoupons);
      setCoupons(availableCoupons);
    } catch (error) {
      console.error("Error loading coupons for picker:", error);
      toast.error("Failed to load offers");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();

    // Set up real-time subscription to listen for coupon changes
    // Note: Listen to the underlying coupons table, not the view
    const channel = supabase
      .channel('coupon-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'coupons' // Listen to the base table, not the view
        },
        (payload) => {
          console.log('Real-time coupon change detected:', payload);
          // Refresh coupons when admin makes changes
          loadCoupons();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]); // Re-load when partnerId changes

  const handleCouponClaim = async (coupon: Coupon, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedId(coupon.id);
    setClaiming(coupon.id);
    
    try {
      const deviceId = `demo-device-${Math.random().toString(36).substring(7)}`;
      const result = await claimCoupon({
        couponId: coupon.id,
        deviceId,
      });
      
      if (result.success && result.coupon) {
        toast.success(`${coupon.title} claimed! Now answer one quick question.`);
        setTimeout(() => {
          onCouponSelected(coupon, true, result.coupon);
        }, 300);
      } else {
        toast.error(result.message || 'Failed to claim coupon');
        setClaiming(null);
        setSelectedId(null);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to claim coupon');
      setClaiming(null);
      setSelectedId(null);
    }
  };

  const getCouponIcon = (title: string, discount?: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('coffee') || titleLower.includes('tim')) {
      return "☕";
    }
    if (titleLower.includes('grocery') || titleLower.includes('metro') || titleLower.includes('food')) {
      return "🛒";
    }
    if (titleLower.includes('book') || titleLower.includes('campus')) {
      return "📚";
    }
    if (titleLower.includes('restaurant') || titleLower.includes('dining') || titleLower.includes('mcdonald')) {
      return "🍽️";
    }
    if (discount?.toLowerCase().includes("coffee")) {
      return "☕";
    }
    if (discount?.toLowerCase().includes("dining")) {
      return "🍽️";
    }
    return "🎁";
  };

  const handleSkip = () => {
    onCouponSelected({
      id: 'skipped',
      title: 'No Coupon Selected',
      description: 'User chose to skip coupon selection',
      code: '',
      expiresIn: '',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-2 font-playfair">
            Tap to Redeem
          </CardTitle>
          <CardDescription className="text-gray-600 mb-4">
            Choose from our available offers — just answer 1 quick question
          </CardDescription>
          <Button 
            size="sm" 
            onClick={handleSkip}
            className="bg-toronto-blue hover:bg-toronto-lightblue text-white"
          >
            Skip for now
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-toronto-blue"></div>
            </div>
          ) : coupons.length > 0 ? (
            coupons.map((coupon) => {
              const scheduleValidation = isCouponScheduleValid({
                valid_days: coupon.valid_days,
                valid_time_start: coupon.valid_time_start,
                valid_time_end: coupon.valid_time_end
              });
              const scheduleDescription = getScheduleDescription({
                valid_days: coupon.valid_days,
                valid_time_start: coupon.valid_time_start,
                valid_time_end: coupon.valid_time_end
              });

              return (
                <div
                  key={coupon.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedId === coupon.id
                      ? "border-toronto-blue bg-toronto-blue/5"
                      : "hover:border-toronto-lightblue hover:bg-toronto-lightblue/10"
                  } ${!scheduleValidation.valid ? "opacity-60" : ""}`}
                >
                  {/* Coupon Image */}
                  {coupon.image_url && (
                    <img
                      src={coupon.image_url}
                      alt={coupon.title}
                      className="w-full h-32 object-cover rounded-md mb-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Icons for reward type */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getCouponIcon(coupon.title, coupon.discount)}
                    </span>

                    <h3 className="font-bold text-lg flex-grow">{coupon.title}</h3>

                    {/* Scarcity Messaging */}
                    {coupon.remaining !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {coupon.remaining} left
                      </Badge>
                    )}
                    
                    {!scheduleValidation.valid && (
                      <Badge variant="outline" className="text-xs">
                        Not Available
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>

                  {scheduleDescription && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{scheduleDescription}</span>
                    </div>
                  )}

                  {!scheduleValidation.valid && scheduleValidation.message && (
                    <p className="text-xs text-amber-600 mb-2">{scheduleValidation.message}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col text-xs text-gray-500">
                      <span>Expires in {coupon.expiresIn}</span>
                      {coupon.discount && (
                        <span className="font-medium text-toronto-blue">{coupon.discount}</span>
                      )}
                    </div>

                    {/* Claim Now Button */}
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="text-xs"
                      onClick={(e) => handleCouponClaim(coupon, e)}
                      disabled={claiming === coupon.id || !scheduleValidation.valid}
                    >
                      {claiming === coupon.id ? 'Claiming...' : 'Claim Now'}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-4">
              <p>No offers available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">
                You can still continue with the survey to share your feedback.
              </p>
              <Button 
                onClick={() => onCouponSelected({
                  id: 'no-coupon',
                  title: 'No Coupon Selected',
                  description: 'Continue without selecting a coupon',
                  code: '',
                  expiresIn: '',
                })}
                variant="outline"
                className="mt-4"
              >
                Continue Without Offer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponPicker;
