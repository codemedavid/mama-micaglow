'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price_per_vial: number;
  price_per_box: number;
  vials_per_box: number;
  image_url: string | null;
};

type BatchProduct = {
  product_id: number;
  product: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial: number;
};

type Batch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  shipping_fee: number;
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
};

export function useRealtimeBatch(batchId?: number) {
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveBatch = useCallback(async () => {
    try {
      if (batchId) {
        const { data, error } = await supabase
          .from('group_buy_batches')
          .select(`
            *,
            batch_products:group_buy_products(
              product_id,
              target_vials,
              current_vials,
              price_per_vial,
              product:products(*)
            )
          `)
          .eq('id', batchId)
          .single();

        if (error) {
          setActiveBatch(null);
        } else {
          setActiveBatch(data);
        }
        setLoading(false);
        return;
      }

      // Only fetch admin-created active batches (main group buy batches)
      // Exclude host-created batches (sub-group batches)
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (adminUsers && adminUsers.length > 0) {
        const adminIds = adminUsers.map(user => user.id);
        const { data, error } = await supabase
          .from('group_buy_batches')
          .select(`
            *,
            batch_products:group_buy_products(
              product_id,
              target_vials,
              current_vials,
              price_per_vial,
              product:products(*)
            )
          `)
          .in('status', ['active', 'payment_collection'])
          .in('created_by', adminIds) // Only fetch admin-created batches
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          setActiveBatch(null);
        } else {
          // Handle both single object and array responses
          const batchData = Array.isArray(data) ? data[0] : data;
          setActiveBatch(batchData || null);
        }
      } else {
        setActiveBatch(null);
      }
    } catch {
      setActiveBatch(null);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    // Initial fetch
    fetchActiveBatch();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel('batch-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_buy_batches',
        },
        () => {
          // Refetch the active batch when any batch changes
          fetchActiveBatch();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_buy_products',
        },
        () => {
          // Refetch the active batch when batch products change
          fetchActiveBatch();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchActiveBatch]);

  return {
    activeBatch,
    loading,
    refetch: fetchActiveBatch,
  };
}

export function useRealtimeBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      // Only fetch admin-created batches (main group buy batches)
      // Exclude host-created batches (sub-group batches)
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (adminUsers && adminUsers.length > 0) {
        const adminIds = adminUsers.map(user => user.id);

        const { data, error } = await supabase
          .from('group_buy_batches')
          .select(`
            *,
            batch_products:group_buy_products(
              product_id,
              target_vials,
              current_vials,
              price_per_vial,
              product:products(*)
            )
          `)
          .in('created_by', adminIds)
          .order('created_at', { ascending: false });

        if (error) {
          setBatches([]);
        } else {
          setBatches(data || []);
        }
      } else {
        setBatches([]);
      }
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchBatches();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel('batches-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_buy_batches',
        },
        () => {
          fetchBatches();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_buy_products',
        },
        () => {
          fetchBatches();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchBatches]);

  return {
    batches,
    loading,
    refetch: fetchBatches,
  };
}
