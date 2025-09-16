'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'host' | 'customer';

type UserProfile = {
  id: number;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function useRole() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = useCallback(async (role: UserRole = 'customer') => {
    if (!user) {
      return null;
    }

    try {
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (existingUser) {
        setUserProfile(existingUser);
        return existingUser;
      }

      // Create new user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName,
          last_name: user.lastName,
          role,
        })
        .select()
        .single();

      if (error) {
        return null;
      }

      setUserProfile(data);
      return data;
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      const resetState = () => {
        setUserProfile(null);
        setLoading(false);
      };
      resetState();
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        if (error) {
          // If user profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            const newProfile = await createUserProfile('customer');
            if (newProfile) {
              setUserProfile(newProfile);
            } else {
              setUserProfile(null);
            }
          } else {
            setUserProfile(null);
          }
        } else {
          setUserProfile(data);
        }
      } catch {
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isSignedIn, isLoaded, createUserProfile]);

  const updateUserRole = async (newRole: UserRole) => {
    if (!userProfile) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userProfile.id);

      if (error) {
        return false;
      }

      setUserProfile(prev => prev ? { ...prev, role: newRole } : null);
      return true;
    } catch {
      return false;
    }
  };

  return {
    userProfile,
    role: userProfile?.role || 'customer',
    isAdmin: userProfile?.role === 'admin',
    isHost: userProfile?.role === 'host',
    isCustomer: userProfile?.role === 'customer',
    loading,
    createUserProfile,
    updateUserRole,
  };
}
