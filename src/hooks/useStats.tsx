import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  activeReports: number;
  recoveredReports: number;
  totalUsers: number;
  isLoading: boolean;
}

export const useStats = (): Stats => {
  const [stats, setStats] = useState<Stats>({
    activeReports: 0,
    recoveredReports: 0,
    totalUsers: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active reports count
        const { count: activeCount } = await supabase
          .from('item_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch recovered reports count
        const { count: recoveredCount } = await supabase
          .from('item_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'recovered');

        // Fetch total users count from profiles
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeReports: activeCount || 0,
          recoveredReports: recoveredCount || 0,
          totalUsers: usersCount || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
