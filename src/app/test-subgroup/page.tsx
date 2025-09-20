'use client';

import TestSubGroupOrder from '@/components/TestSubGroupOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSubGroupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sub-Group Order Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Testing Steps:</h3>
              <ol className="list-inside list-decimal space-y-1 text-blue-800">
                <li>
                  Run
                  <code>disable-rls-completely.sql</code>
                  {' '}
                  in Supabase SQL Editor
                </li>
                <li>
                  Run
                  <code>test-function-direct.sql</code>
                  {' '}
                  in Supabase SQL Editor
                </li>
                <li>Use the test component below to test from React</li>
                <li>Check browser console for any errors</li>
              </ol>
            </div>

            <TestSubGroupOrder />

            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">What to Look For:</h3>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                <li>
                  <strong>Success:</strong>
                  {' '}
                  Order created with unique order code
                </li>
                <li>
                  <strong>Error:</strong>
                  {' '}
                  Check console for specific error messages
                </li>
                <li>
                  <strong>409 Conflict:</strong>
                  {' '}
                  Usually means duplicate order code or RLS issue
                </li>
                <li>
                  <strong>Permission Denied:</strong>
                  {' '}
                  RLS or permissions not properly configured
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
