import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type SubGroup = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  whatsapp_number: string | null;
  is_active: boolean;
};

type SubGroupBatch = {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  start_date: string;
  end_date: string;
  sub_group_id: number;
  batch_products: any[];
};

export function useSimpleSubGroup(regionId: string) {
  const [subGroup, setSubGroup] = useState<SubGroup | null>(null);
  const [activeBatch, setActiveBatch] = useState<SubGroupBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sub-group
        const { data: subGroupData, error: subGroupError } = await supabase
          .from('sub_groups')
          .select('*')
          .eq('id', regionId)
          .eq('is_active', true)
          .single();

        if (subGroupError) {
          setError('Sub-group not found');
          return;
        }

        setSubGroup(subGroupData);

        // Fetch active batch with products
        const { data: batchData, error: batchError } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
              *,
              product:products(*)
            )
          `)
          .eq('sub_group_id', regionId)
          .in('status', ['active', 'payment_collection'])
          .single();

        if (!batchError && batchData) {
          setActiveBatch(batchData);
        }
      } catch (error) {
        console.error('Error fetching sub-group data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (regionId) {
      fetchData();
    }
  }, [regionId]);

  return {
    subGroup,
    activeBatch,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-run the effect
    },
  };
}
