'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function TestSubGroupOrder() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testOrderCreation = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Test data
      const testItems = [
        {
          product_id: 1,
          quantity: 2,
          price_per_vial: 1000,
        },
      ];

      const { data, error } = await supabase.rpc('create_simple_subgroup_order', {
        p_customer_name: 'Test Customer',
        p_whatsapp_number: '+639123456789',
        p_batch_id: 1,
        p_sub_group_id: 1,
        p_items: testItems,
        p_user_id: null,
      });

      if (error) {
        console.error('Error:', error);
        setResult(`ERROR: ${error.message}\nCode: ${error.code}\nDetails: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`SUCCESS! Order created:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      console.error('Catch error:', err);
      setResult(`CATCH ERROR: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testFunctionExists = async () => {
    setLoading(true);
    setResult('Checking if function exists...');

    try {
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type, data_type')
        .eq('routine_name', 'create_simple_subgroup_order');

      if (error) {
        setResult(`Error checking function: ${error.message}`);
      } else {
        setResult(`Function check result: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testTables = async () => {
    setLoading(true);
    setResult('Checking tables...');

    try {
      const { data, error } = await supabase
        .from('sub_group_orders')
        .select('count')
        .limit(1);

      if (error) {
        setResult(`Table error: ${error.message}`);
      } else {
        setResult(`Tables accessible: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`Table error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test Sub-Group Order Function</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testFunctionExists} disabled={loading}>
            Check Function Exists
          </Button>
          <Button onClick={testTables} disabled={loading}>
            Test Tables
          </Button>
          <Button onClick={testOrderCreation} disabled={loading}>
            Test Order Creation
          </Button>
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      </CardContent>
    </Card>
  );
}
