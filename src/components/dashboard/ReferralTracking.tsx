import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Calendar } from 'lucide-react';

interface ReferralStat {
  referrer_email: string;
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  last_referral_date: string;
}

interface ReferralDetail {
  id: string;
  referrer_email: string;
  referred_email: string;
  created_at: string;
  converted: boolean;
}

const ReferralTracking: React.FC = () => {
  const [stats, setStats] = useState<ReferralStat[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<ReferralDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalReferrers: 0,
    totalReferrals: 0,
    totalConverted: 0
  });

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch aggregated stats
      const { data: statsData, error: statsError } = await supabase
        .from('referral_stats')
        .select('*')
        .order('total_referrals', { ascending: false })
        .limit(50);

      if (statsError) throw statsError;

      // Fetch recent individual referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (referralsError) throw referralsError;

      setStats(statsData || []);
      setRecentReferrals(referralsData || []);

      // Calculate totals
      const totalReferrers = statsData?.length || 0;
      const totalReferrals = statsData?.reduce((sum, stat) => sum + stat.total_referrals, 0) || 0;
      const totalConverted = statsData?.reduce((sum, stat) => sum + stat.successful_referrals, 0) || 0;

      setTotalStats({
        totalReferrers,
        totalReferrals,
        totalConverted
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-toronto-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalReferrers}</div>
            <p className="text-xs text-muted-foreground">Users who shared with others</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">People referred via shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalReferrals > 0 
                ? `${Math.round((totalStats.totalConverted / totalStats.totalReferrals) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.totalConverted} converted sign-ups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Users who brought the most referrals</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No referral data yet. Share links will appear here once users start sharing.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead className="text-right">Total Referrals</TableHead>
                  <TableHead className="text-right">Converted</TableHead>
                  <TableHead>Last Referral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.referral_code}>
                    <TableCell className="font-medium">{stat.referrer_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{stat.referral_code}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge>{stat.total_referrals}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{stat.successful_referrals}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(stat.last_referral_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Latest referred visitors</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReferrals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent referrals yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred By</TableHead>
                  <TableHead>New User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.referrer_email}</TableCell>
                    <TableCell>
                      {referral.referred_email || <span className="text-muted-foreground italic">Pending</span>}
                    </TableCell>
                    <TableCell>
                      {new Date(referral.created_at).toLocaleDateString()} at{' '}
                      {new Date(referral.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.converted ? 'default' : 'secondary'}>
                        {referral.converted ? 'Converted' : 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralTracking;
