'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

export function RoleDebugger() {
  const { user } = useUser();
  const { userProfile, isAdmin, isHost, isCustomer, loading } = useRole();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const updateRole = async (newRole: 'admin' | 'host' | 'customer') => {
    if (!userProfile) {
      setMessage('No user profile found');
      return;
    }

    setUpdating(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userProfile.id);

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Successfully updated role to ${newRole}. Please refresh the page.`);
        // Force a page refresh to update the role
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <p>Loading role information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Role Debugger (Development Only)</CardTitle>
        <CardDescription className="text-yellow-700">
          Current user role information and testing tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User Email:</strong>
            {' '}
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
          <div>
            <strong>User ID:</strong>
            {' '}
            {userProfile?.id || 'N/A'}
          </div>
          <div>
            <strong>Current Role:</strong>
            {' '}
            {userProfile?.role || 'N/A'}
          </div>
          <div>
            <strong>isAdmin:</strong>
            {' '}
            {isAdmin ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>isHost:</strong>
            {' '}
            {isHost ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>isCustomer:</strong>
            {' '}
            {isCustomer ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => updateRole('admin')}
            disabled={updating || isAdmin}
            size="sm"
            variant="outline"
          >
            Set Admin
          </Button>
          <Button
            onClick={() => updateRole('host')}
            disabled={updating || isHost}
            size="sm"
            variant="outline"
          >
            Set Host
          </Button>
          <Button
            onClick={() => updateRole('customer')}
            disabled={updating || isCustomer}
            size="sm"
            variant="outline"
          >
            Set Customer
          </Button>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
