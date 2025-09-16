'use client';

import { useUser } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function AdminSetupPage() {
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const promoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // First, check if the user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(fetchError.message);
      }

      if (existingUser) {
        // Update existing user to admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('email', email);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setMessage(`User ${email} has been promoted to admin successfully!`);
        setMessageType('success');
      } else {
        // Create new admin user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            clerk_id: `temp_admin_${Date.now()}`, // Temporary ID
            email,
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setMessage(`Admin user ${email} has been created successfully!`);
        setMessageType('success');
      }

      setEmail('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const createCurrentUserAsAdmin = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Check if current user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (existingUser) {
        // Update existing user to admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('clerk_id', user.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setMessage('You have been promoted to admin successfully!');
        setMessageType('success');
      } else {
        // Create new admin user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            first_name: user.firstName,
            last_name: user.lastName,
            role: 'admin',
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setMessage('Admin account created successfully!');
        setMessageType('success');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <CardTitle>Admin Setup</CardTitle>
              </div>
              <CardDescription>
                Set up your first admin user to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {messageType === 'success'
                    ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )
                    : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                  <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Option 1: Make Current User Admin</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Promote your current account (
                    {user?.emailAddresses[0]?.emailAddress}
                    ) to admin
                  </p>
                  <Button
                    onClick={createCurrentUserAsAdmin}
                    disabled={loading}
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Make Me Admin
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="mb-2 text-lg font-semibold">Option 2: Promote Existing User</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Enter an email address to promote an existing user to admin
                  </p>
                  <form onSubmit={promoteToAdmin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Promote to Admin
                    </Button>
                  </form>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">Next Steps:</h4>
                <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                  <li>Run the SQL setup script in your Supabase dashboard</li>
                  <li>Create your first admin user using one of the options above</li>
                  <li>Refresh the page to access the admin panel</li>
                  <li>Start adding products to your catalog</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
