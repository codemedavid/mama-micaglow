'use client';

import { ArrowLeft, ArrowRight, Loader2, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

type UserRow = {
  id: number;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'host' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setUsers(data as unknown as UserRow[]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter(u =>
      (u.email?.toLowerCase().includes(q))
      || (u.first_name?.toLowerCase().includes(q))
      || (u.last_name?.toLowerCase().includes(q))
      || (`${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase().includes(q)),
    );
  }, [users, query]);

  const toggleHostRole = async (userId: number) => {
    const target = users.find(u => u.id === userId);
    if (!target || target.role === 'admin') {
      return;
    }

    const nextRole: 'host' | 'customer' = target.role === 'host' ? 'customer' : 'host';
    setMutatingId(userId);

    // optimistic update
    const previous = users;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: nextRole } : u)));

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: nextRole })
        .eq('id', userId);

      if (error) {
        setUsers(previous);
      }
    } finally {
      setMutatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">View and manage all users</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unnamed';
            const initials = (user.first_name?.[0] ?? 'U').toUpperCase();
            const isMutating = mutatingId === user.id;
            const isHost = user.role === 'host';
            const buttonClass = `mt-2 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white shadow disabled:opacity-60 ${isHost ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'}`;
            return (
              <Card key={user.id} className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      {initials}
                    </div>
                    <div>
                      <CardTitle className="text-base text-gray-900">{name}</CardTitle>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                    {user.role}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    {user.is_active
                      ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <UserCheck className="h-4 w-4" />
                            {' '}
                            Active
                          </span>
                        )
                      : (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <UserX className="h-4 w-4" />
                            {' '}
                            Inactive
                          </span>
                        )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Security</span>
                    <span className="inline-flex items-center gap-1 text-gray-900">
                      <Shield className="h-4 w-4 text-purple-600" />
                      {' '}
                      Clerk
                    </span>
                  </div>

                  {user.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => toggleHostRole(user.id)}
                      disabled={isMutating}
                      className={buttonClass}
                    >
                      {isMutating && (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      )}
                      {!isMutating && isHost && (
                        <>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Revert to Customer
                        </>
                      )}
                      {!isMutating && !isHost && (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Promote to Host
                        </>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="mt-6 border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardContent className="py-12 text-center text-gray-600">
              No users found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
