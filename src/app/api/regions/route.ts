import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: regionsData, error: regionsError } = await supabase
      .from('sub_groups')
      .select(`
        *,
        host:users!sub_groups_host_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (regionsError) {
      return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }

    // For each region with a host, fetch their active batch
    const regionsWithBatches = await Promise.all(
      (regionsData || []).map(async (region) => {
        if (!region.host_id) {
          return { ...region, active_batch: null };
        }

        const { data: batchData, error: batchError } = await supabase
          .from('sub_group_batches')
          .select(`
            id,
            name,
            status,
            target_vials,
            current_vials
          `)
          .eq('host_id', region.host_id)
          .in('status', ['active', 'payment_collection'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (batchError) {
          return { ...region, active_batch: null };
        }

        return { ...region, active_batch: batchData };
      }),
    );
    return NextResponse.json({ data: regionsWithBatches });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
