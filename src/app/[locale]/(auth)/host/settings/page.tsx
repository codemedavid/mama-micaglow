'use client';

import {
  Bell,
  MapPin,
  Save,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type HostSettings = {
  region: {
    id: number;
    name: string;
    description: string | null;
    region: string;
    city: string;
    whatsapp_number: string | null;
    is_active: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    orderUpdates: boolean;
    batchUpdates: boolean;
    paymentReminders: boolean;
  };
  preferences: {
    timezone: string;
    currency: string;
    language: string;
  };
};

export default function HostSettingsPage() {
  const { isHost, loading, userProfile } = useRole();
  const [settings, setSettings] = useState<HostSettings>({
    region: {
      id: 0,
      name: '',
      description: '',
      region: '',
      city: '',
      whatsapp_number: '',
      is_active: true,
    },
    notifications: {
      emailNotifications: true,
      whatsappNotifications: true,
      orderUpdates: true,
      batchUpdates: true,
      paymentReminders: true,
    },
    preferences: {
      timezone: 'Asia/Manila',
      currency: 'PHP',
      language: 'en',
    },
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isHost || !userProfile) {
      return;
    }

    const fetchSettings = async () => {
      try {
        // Fetch host's region
        const { data: regionData } = await supabase
          .from('sub_groups')
          .select('*')
          .eq('host_id', userProfile.id)
          .eq('is_active', true)
          .single();

        if (regionData) {
          setSettings(prev => ({
            ...prev,
            region: regionData,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchSettings();
  }, [isHost, userProfile]);

  const handleSave = async () => {
    if (!userProfile) {
      return;
    }

    setSaving(true);
    try {
      // Update region settings
      const { error: regionError } = await supabase
        .from('sub_groups')
        .update({
          name: settings.region.name,
          description: settings.region.description,
          region: settings.region.region,
          city: settings.region.city,
          whatsapp_number: settings.region.whatsapp_number,
        })
        .eq('id', settings.region.id);

      if (regionError) {
        console.error('Error updating region:', regionError);
        return;
      }

      // Here you would typically save notification and preference settings
      // For now, we'll just simulate a successful save
      console.warn('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateRegion = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      region: {
        ...prev.region,
        [field]: value,
      },
    }));
  };

  const updateNotification = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const updatePreference = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-xl text-gray-600">Manage your host account and region settings</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="mr-2 h-5 w-5 text-blue-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Region
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Region Settings */}
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="mr-2 h-5 w-5 text-green-600" />
                  Region Settings
                </CardTitle>
                <CardDescription>Manage your assigned region information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="region-name">Region Name</Label>
                    <Input
                      id="region-name"
                      value={settings.region.name}
                      onChange={e => updateRegion('name', e.target.value)}
                      placeholder="e.g., Manila Central"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region-location">Region</Label>
                    <Input
                      id="region-location"
                      value={settings.region.region}
                      onChange={e => updateRegion('region', e.target.value)}
                      placeholder="e.g., Metro Manila"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region-city">City</Label>
                  <Input
                    id="region-city"
                    value={settings.region.city}
                    onChange={e => updateRegion('city', e.target.value)}
                    placeholder="e.g., Makati City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region-description">Description</Label>
                  <Textarea
                    id="region-description"
                    value={settings.region.description || ''}
                    onChange={e => updateRegion('description', e.target.value)}
                    placeholder="Describe your region and its characteristics..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp-number"
                    value={settings.region.whatsapp_number || ''}
                    onChange={e => updateRegion('whatsapp_number', e.target.value)}
                    placeholder="e.g., +63 915 490 1224"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="region-active"
                    type="checkbox"
                    checked={settings.region.is_active}
                    onChange={e => updateRegion('is_active', e.target.checked.toString())}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="region-active">Region is active</Label>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Bell className="mr-2 h-5 w-5 text-orange-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={e => updateNotification('emailNotifications', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates via WhatsApp</p>
                    </div>
                    <input
                      id="whatsapp-notifications"
                      type="checkbox"
                      checked={settings.notifications.whatsappNotifications}
                      onChange={e => updateNotification('whatsappNotifications', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-updates">Order Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about new orders</p>
                    </div>
                    <input
                      id="order-updates"
                      type="checkbox"
                      checked={settings.notifications.orderUpdates}
                      onChange={e => updateNotification('orderUpdates', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="batch-updates">Batch Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about batch changes</p>
                    </div>
                    <input
                      id="batch-updates"
                      type="checkbox"
                      checked={settings.notifications.batchUpdates}
                      onChange={e => updateNotification('batchUpdates', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-reminders">Payment Reminders</Label>
                      <p className="text-sm text-gray-500">Get notified about pending payments</p>
                    </div>
                    <input
                      id="payment-reminders"
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={e => updateNotification('paymentReminders', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-5 w-5 text-purple-600" />
                  Preferences
                </CardTitle>
                <CardDescription>Set your personal preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.preferences.timezone}
                      onChange={e => updatePreference('timezone', e.target.value)}
                      placeholder="Asia/Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={settings.preferences.currency}
                      onChange={e => updatePreference('currency', e.target.value)}
                      placeholder="PHP"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={settings.preferences.language}
                      onChange={e => updatePreference('language', e.target.value)}
                      placeholder="en"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving
                  ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Saving...
                      </>
                    )
                  : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
