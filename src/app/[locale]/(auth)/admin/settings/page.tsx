'use client';

import {
  Globe,
  Save,
  Settings as SettingsIcon,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type SiteSetting = {
  id: number;
  key: string;
  value: string;
  description: string | null;
  category: string;
  is_active: boolean;
};

type FeatureSettings = {
  regions_enabled: boolean;
  group_buy_enabled: boolean;
  individual_purchase_enabled: boolean;
};

export default function AdminSettingsPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [settings, setSettings] = useState<FeatureSettings>({
    regions_enabled: true,
    group_buy_enabled: true,
    individual_purchase_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('category', 'features');

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        const settingsMap: any = {};
        data.forEach((setting: SiteSetting) => {
          settingsMap[setting.key] = setting.value === 'true';
        });
        setSettings(settingsMap);
      }
    } catch {
      // Handle error if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, roleLoading, router]);

  const handleToggle = (key: keyof FeatureSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('site_settings')
          .update({ value: value.toString() })
          .eq('key', key),
      );

      const results = await Promise.all(updates);

      const hasError = results.some(result => result.error);
      if (!hasError) {
        // Refresh to show updated settings
        await fetchSettings();
      }
    } catch {
      // Handle error if needed
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-muted-foreground">
            {roleLoading ? 'Checking permissions...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-xl text-gray-600">
                Configure global features and functionality
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Feature Toggles */}
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <SettingsIcon className="mr-2 h-6 w-6 text-purple-600" />
              Feature Settings
            </CardTitle>
            <CardDescription>
              Enable or disable features across the entire platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regions Feature */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-6 transition-all hover:border-purple-200 hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <Label htmlFor="regions-toggle" className="text-lg font-semibold">
                      Regional Sub-Groups
                    </Label>
                    <Badge
                      variant={settings.regions_enabled ? 'default' : 'secondary'}
                      className={settings.regions_enabled ? 'bg-green-100 text-green-800' : ''}
                    >
                      {settings.regions_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Allow users to join regional sub-groups and participate in local group buys.
                    When disabled, the regional sub-groups section will be hidden from the website.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  id="regions-toggle"
                  type="button"
                  onClick={() => handleToggle('regions_enabled')}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-none ${
                    settings.regions_enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.regions_enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.regions_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Group Buy Feature */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-6 transition-all hover:border-purple-200 hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <Label htmlFor="groupbuy-toggle" className="text-lg font-semibold">
                      Group Buy
                    </Label>
                    <Badge
                      variant={settings.group_buy_enabled ? 'default' : 'secondary'}
                      className={settings.group_buy_enabled ? 'bg-green-100 text-green-800' : ''}
                    >
                      {settings.group_buy_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enable group buying feature where users can participate in bulk purchases for better prices.
                    When disabled, group buy batches will be hidden.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  id="groupbuy-toggle"
                  type="button"
                  onClick={() => handleToggle('group_buy_enabled')}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-none ${
                    settings.group_buy_enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.group_buy_enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.group_buy_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Individual Purchase Feature */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-6 transition-all hover:border-purple-200 hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <Label htmlFor="individual-toggle" className="text-lg font-semibold">
                      Individual Purchase
                    </Label>
                    <Badge
                      variant={settings.individual_purchase_enabled ? 'default' : 'secondary'}
                      className={settings.individual_purchase_enabled ? 'bg-green-100 text-green-800' : ''}
                    >
                      {settings.individual_purchase_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Allow users to make individual purchases at regular prices.
                    When disabled, individual purchase options will be hidden.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  id="individual-toggle"
                  type="button"
                  onClick={() => handleToggle('individual_purchase_enabled')}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-none ${
                    settings.individual_purchase_enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.individual_purchase_enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.individual_purchase_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50/80">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-blue-900">Important Note</h3>
                <p className="text-sm text-blue-800">
                  Changes to these settings will affect all users immediately. Disabled features will be
                  hidden from the website, but existing data will be preserved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
