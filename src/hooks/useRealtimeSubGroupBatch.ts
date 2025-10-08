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

type SubGroupBatchProduct = {
  product_id: number;
  product: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial: number;
};

type SubGroupBatch = {
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
  host_id: number;
  region_id: number | null;
  created_at: string;
  updated_at: string;
  batch_products: SubGroupBatchProduct[];
};

type Region = {
  id: number;
  name: string;
  city: string;
  whatsapp_number: string;
  join_fee: number;
  host_id: number | null;
  created_at: string;
  updated_at: string;
  active_batch: SubGroupBatch | null;
  host?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
};

export function useRealtimeSubGroupBatch(batchId?: number, regionId?: number) {
  const [activeBatch, setActiveBatch] = useState<SubGroupBatch | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveBatch = useCallback(async () => {
    try {
      if (batchId) {
        const { data, error } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
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

      if (regionId) {
        // Fetch the active batch for the specific region
        const { data, error } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
              product_id,
              target_vials,
              current_vials,
              price_per_vial,
              product:products(*)
            )
          `)
          .eq('region_id', regionId)
          .in('status', ['active', 'payment_collection'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          setActiveBatch(null);
        } else {
          // Handle both single object and array responses
          const batchData = Array.isArray(data) ? data[0] : data;
          setActiveBatch(batchData || null);
        }
        setLoading(false);
        return;
      }

      // Fetch the most recent active sub-group batch globally
      const { data, error } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            product_id,
            target_vials,
            current_vials,
            price_per_vial,
            product:products(*)
          )
        `)
        .in('status', ['active', 'payment_collection'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        setActiveBatch(null);
      } else {
        // Handle both single object and array responses
        const batchData = Array.isArray(data) ? data[0] : data;
        setActiveBatch(batchData || null);
      }
    } catch {
      setActiveBatch(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, regionId]);

  useEffect(() => {
    // Initial fetch
    fetchActiveBatch();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel('subgroup-batch-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_group_batches',
        },
        () => {
          // Refetch the active batch when any sub-group batch changes
          fetchActiveBatch();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_group_batch_products',
        },
        () => {
          // Refetch the active batch when sub-group batch products change
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

export function useRealtimeSubGroupBatches() {
  const [batches, setBatches] = useState<SubGroupBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            product_id,
            target_vials,
            current_vials,
            price_per_vial,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setBatches([]);
      } else {
        setBatches(data || []);
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
      .channel('subgroup-batches-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_group_batches',
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
          table: 'sub_group_batch_products',
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

export function useRealtimeRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionsEnabled, setRegionsEnabled] = useState(true);

  const fetchRegions = useCallback(async () => {
    try {
      // First check if regions feature is enabled
      const { data: settingData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'regions_enabled')
        .single();

      const isEnabled = settingData?.value === 'true';
      setRegionsEnabled(isEnabled);

      // If regions are disabled, don't fetch regions data
      if (!isEnabled) {
        setRegions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sub_groups')
        .select(`
          *,
          host:users!sub_groups_host_id_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          active_batch:sub_group_batches!sub_group_batches_region_id_fkey(
            *,
            batch_products:sub_group_batch_products(
              product_id,
              target_vials,
              current_vials,
              price_per_vial,
              product:products(*)
            )
          )
        `)
        .in('active_batch.status', ['active', 'payment_collection'])
        .order('created_at', { ascending: false });

      if (error) {
        setRegions([]);
      } else {
        setRegions(data || []);
      }
    } catch {
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRegions();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel('regions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_groups',
        },
        () => {
          fetchRegions();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_group_batches',
        },
        () => {
          fetchRegions();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_group_batch_products',
        },
        () => {
          fetchRegions();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchRegions]);

  return {
    regions,
    loading,
    regionsEnabled,
    refetch: fetchRegions,
  };
}
