import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface AnalyticsMetrics {
  partner_id: string;
  date: string;
  hour: number | null;
  total_visits: number;
  unique_sessions: number;
  survey_responses: number;
  coupon_claims: number;
  coupon_redemptions: number;
  positive_sentiment: number;
  neutral_sentiment: number;
  negative_sentiment: number;
}

interface Event {
  event_type: string;
  session_id: string;
}

interface Response {
  answer: string;
}

interface Claim {
  id: string;
  redeemed: boolean;
  coupon_id: string;
}

interface Coupon {
  id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting analytics aggregation...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body to determine aggregation period
    const { period = 'hourly', lookback_hours = 24 } = await req.json().catch(() => ({}));
    
    const now = new Date();
    const lookbackDate = new Date(now.getTime() - lookback_hours * 60 * 60 * 1000);
    
    console.log(`Aggregating ${period} metrics for last ${lookback_hours} hours`);

    // Get all active partners
    const { data: partners, error: partnersError } = await supabase
      .from('locations')
      .select('id')
      .eq('active', true);

    if (partnersError) throw partnersError;
    if (!partners || partners.length === 0) {
      console.log('No active partners found');
      return new Response(
        JSON.stringify({ success: true, message: 'No partners to aggregate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${partners.length} partners`);

    // Process each partner
    const results = await Promise.all(
      partners.map(async (partner) => {
        return await aggregatePartnerMetrics(
          supabase,
          partner.id,
          lookbackDate,
          period === 'daily'
        );
      })
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`Aggregation complete: ${successCount}/${partners.length} succeeded`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: partners.length,
        succeeded: successCount,
        period,
        lookback_hours
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Aggregation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function aggregatePartnerMetrics(
  supabase: any,
  partnerId: string,
  fromDate: Date,
  isDaily: boolean
): Promise<{ success: boolean; partner_id: string }> {
  try {
    const toDate = new Date();
    
    // Determine time buckets to aggregate
    const buckets = isDaily 
      ? generateDailyBuckets(fromDate, toDate)
      : generateHourlyBuckets(fromDate, toDate);

    for (const bucket of buckets) {
      const metrics = await computeMetrics(supabase, partnerId, bucket);
      
      // Upsert into analytics_summary
      const { error: upsertError } = await supabase
        .from('analytics_summary')
        .upsert({
          partner_id: partnerId,
          date: bucket.date,
          hour: bucket.hour,
          ...metrics,
          computed_at: new Date().toISOString()
        }, {
          onConflict: 'partner_id,date,hour'
        });

      if (upsertError) {
        console.error(`Error upserting metrics for partner ${partnerId}:`, upsertError);
      }
    }

    return { success: true, partner_id: partnerId };
  } catch (error) {
    console.error(`Error aggregating partner ${partnerId}:`, error);
    return { success: false, partner_id: partnerId };
  }
}

async function computeMetrics(
  supabase: any,
  partnerId: string,
  bucket: { date: string; hour: number | null; start: Date; end: Date }
): Promise<Omit<AnalyticsMetrics, 'partner_id' | 'date' | 'hour'>> {
  const { start, end } = bucket;
  
  // Query engagement events for the time bucket
  const { data: events, error: eventsError } = await supabase
    .from('engagement_events')
    .select('event_type, session_id')
    .eq('partner_id', partnerId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
  }

  // Count visits and unique sessions
  const sessions = new Set((events as Event[] | null)?.map((e: Event) => e.session_id) || []);
  const total_visits = (events as Event[] | null)?.filter((e: Event) => e.event_type === 'visit_partner_page').length || 0;
  const unique_sessions = sessions.size;

  // Query survey responses
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('answer')
    .eq('partner_id', partnerId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  if (responsesError) {
    console.error('Error fetching responses:', responsesError);
  }

  const survey_responses = responses?.length || 0;
  const positive_sentiment = (responses as Response[] | null)?.filter((r: Response) => r.answer === 'happy').length || 0;
  const neutral_sentiment = (responses as Response[] | null)?.filter((r: Response) => r.answer === 'neutral').length || 0;
  const negative_sentiment = (responses as Response[] | null)?.filter((r: Response) => r.answer === 'concerned').length || 0;

  // Query coupon claims
  const { data: claims, error: claimsError } = await supabase
    .from('coupon_claims')
    .select('id, redeemed, coupon_id')
    .gte('claimed_at', start.toISOString())
    .lt('claimed_at', end.toISOString());

  if (claimsError) {
    console.error('Error fetching claims:', claimsError);
  }

  // Filter claims by partner_id from coupons table
  const { data: coupons, error: couponsError } = await supabase
    .from('coupons')
    .select('id')
    .eq('partner_id', partnerId);

  const partnerCouponIds = new Set((coupons as Coupon[] | null)?.map((c: Coupon) => c.id) || []);
  const partnerClaims = (claims as Claim[] | null)?.filter((c: Claim) => partnerCouponIds.has(c.coupon_id)) || [];

  const coupon_claims = partnerClaims.length;
  const coupon_redemptions = partnerClaims.filter((c: Claim) => c.redeemed).length;

  return {
    total_visits,
    unique_sessions,
    survey_responses,
    coupon_claims,
    coupon_redemptions,
    positive_sentiment,
    neutral_sentiment,
    negative_sentiment
  };
}

function generateHourlyBuckets(from: Date, to: Date): Array<{ date: string; hour: number; start: Date; end: Date }> {
  const buckets = [];
  const current = new Date(from);
  current.setMinutes(0, 0, 0);
  
  while (current < to) {
    const start = new Date(current);
    const end = new Date(current.getTime() + 60 * 60 * 1000);
    
    buckets.push({
      date: start.toISOString().split('T')[0],
      hour: start.getHours(),
      start,
      end
    });
    
    current.setHours(current.getHours() + 1);
  }
  
  return buckets;
}

function generateDailyBuckets(from: Date, to: Date): Array<{ date: string; hour: null; start: Date; end: Date }> {
  const buckets = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  
  while (current < to) {
    const start = new Date(current);
    const end = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    
    buckets.push({
      date: start.toISOString().split('T')[0],
      hour: null,
      start,
      end
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return buckets;
}
