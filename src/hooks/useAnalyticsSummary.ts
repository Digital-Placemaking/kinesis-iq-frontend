import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

interface AnalyticsSummary {
  id: string;
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
  computed_at: string;
}

interface AnalyticsSummaryParams {
  partnerId?: string;
  days?: number;
  granularity?: 'hourly' | 'daily';
}

/**
 * Hook to fetch pre-computed analytics summaries
 * Much faster than querying raw events for large datasets
 */
export const useAnalyticsSummary = ({
  partnerId,
  days = 7,
  granularity = 'daily'
}: AnalyticsSummaryParams = {}) => {
  return useQuery({
    queryKey: ['analytics-summary', partnerId, days, granularity],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      let query = supabase
        .from('analytics_summary')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: true })
        .order('hour', { ascending: true });

      // Filter by partner if specified
      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      // Filter by granularity
      if (granularity === 'daily') {
        query = query.is('hour', null);
      } else {
        query = query.not('hour', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as AnalyticsSummary[];
    },
    // Cache for 5 minutes since data is pre-computed every 15 minutes
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get aggregated totals across all time periods
 */
export const useAnalyticsTotals = ({ partnerId, days = 7 }: AnalyticsSummaryParams = {}) => {
  const { data: summaries, ...rest } = useAnalyticsSummary({ partnerId, days, granularity: 'daily' });

  const totals = summaries?.reduce(
    (acc, summary) => ({
      total_visits: acc.total_visits + summary.total_visits,
      unique_sessions: acc.unique_sessions + summary.unique_sessions,
      survey_responses: acc.survey_responses + summary.survey_responses,
      coupon_claims: acc.coupon_claims + summary.coupon_claims,
      coupon_redemptions: acc.coupon_redemptions + summary.coupon_redemptions,
      positive_sentiment: acc.positive_sentiment + summary.positive_sentiment,
      neutral_sentiment: acc.neutral_sentiment + summary.neutral_sentiment,
      negative_sentiment: acc.negative_sentiment + summary.negative_sentiment,
    }),
    {
      total_visits: 0,
      unique_sessions: 0,
      survey_responses: 0,
      coupon_claims: 0,
      coupon_redemptions: 0,
      positive_sentiment: 0,
      neutral_sentiment: 0,
      negative_sentiment: 0,
    }
  );

  return {
    ...rest,
    data: totals,
    raw: summaries,
  };
};
