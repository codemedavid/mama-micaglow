'use client';

import { Edit, MoreHorizontal, Package, Plus, Save, Settings, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type Host = { id: number; first_name: string | null; last_name: string | null; email: string };
type Region = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  host_id: number | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
};

type Batch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  batch_products: any[];
};

export default function AdminRegionsPage() {
  const { isAdmin, loading } = useRole();
  const [regions, setRegions] = useState<Region[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [_isDeleting, setIsDeleting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isBatchesOpen, setIsBatchesOpen] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [regionsEnabled, setRegionsEnabled] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    region: '',
    city: '',
    host_id: 0,
    whatsapp_number: '',
    is_active: true,
  });

  const canManage = useMemo(() => isAdmin, [isAdmin]);

  const fetchBatchesForRegion = async (region: Region) => {
    if (!region.host_id) {
      setBatches([]);
      return;
    }

    setLoadingBatches(true);
    try {
      const { data, error } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            *,
            product:products(*)
          )
        `)
        .eq('host_id', region.host_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        setBatches([]);
      } else {
        setBatches(data || []);
      }
    } catch {
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const openBatchesDialog = (region: Region) => {
    setSelectedRegion(region);
    setIsBatchesOpen(true);
    fetchBatchesForRegion(region);
  };

  const closeBatchesDialog = () => {
    setSelectedRegion(null);
    setIsBatchesOpen(false);
    setBatches([]);
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch regions setting
        const { data: settingData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'regions_enabled')
          .single();

        const isEnabled = settingData?.value === 'true';
        setRegionsEnabled(isEnabled);

        const [{ data: regionsData }, { data: hostsData }] = await Promise.all([
          supabase.from('sub_groups').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('id, first_name, last_name, email, role').eq('role', 'host'),
        ]);
        setRegions((regionsData || []) as Region[]);
        setHosts(((hostsData || []) as any[]).map(u => ({ id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email })));
      } finally {
        setFetching(false);
      }
    };
    if (!loading && canManage) {
      load();
    }
  }, [loading, canManage]);

  const resetForm = () => setForm({ name: '', description: '', region: '', city: '', host_id: 0, whatsapp_number: '', is_active: true });

  const openEditDialog = (region: Region) => {
    setEditingRegion(region);
    setForm({
      name: region.name,
      description: region.description || '',
      region: region.region,
      city: region.city,
      host_id: region.host_id || 0,
      whatsapp_number: region.whatsapp_number || '',
      is_active: region.is_active,
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditingRegion(null);
    setIsEditOpen(false);
    resetForm();
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        region: form.region.trim(),
        city: form.city.trim(),
        host_id: form.host_id ? form.host_id : null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        is_active: form.is_active,
      };
      const { data, error } = await supabase.from('sub_groups').insert(payload).select('*').single();
      if (!error && data) {
        setRegions(prev => [data as Region, ...prev]);
        setIsOpen(false);
        resetForm();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRegion) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        region: form.region.trim(),
        city: form.city.trim(),
        host_id: form.host_id ? form.host_id : null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        is_active: form.is_active,
      };
      const { data, error } = await supabase
        .from('sub_groups')
        .update(payload)
        .eq('id', editingRegion.id)
        .select('*')
        .single();

      if (!error && data) {
        setRegions(prev => prev.map(r => r.id === editingRegion.id ? data as Region : r));
        closeEditDialog();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (regionId: number) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this region? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('sub_groups').delete().eq('id', regionId);
      if (!error) {
        setRegions(prev => prev.filter(r => r.id !== regionId));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActiveStatus = async (region: Region) => {
    try {
      const { data, error } = await supabase
        .from('sub_groups')
        .update({ is_active: !region.is_active })
        .eq('id', region.id)
        .select('*')
        .single();

      if (!error && data) {
        setRegions(prev => prev.map(r => r.id === region.id ? data as Region : r));
      }
    } catch {
      // Handle error if needed
    }
  };

  const toggleRegionsFeature = async () => {
    try {
      setSavingToggle(true);
      const newValue = !regionsEnabled;

      const { error } = await supabase
        .from('site_settings')
        .update({ value: newValue.toString() })
        .eq('key', 'regions_enabled');

      if (!error) {
        setRegionsEnabled(newValue);
      }
    } catch {
      // Handle error if needed
    } finally {
      setSavingToggle(false);
    }
  };

  if (loading || !canManage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
            <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Regions Feature</span>
                <Badge
                  variant={regionsEnabled ? 'default' : 'secondary'}
                  className={regionsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                >
                  {regionsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <button
                type="button"
                onClick={toggleRegionsFeature}
                disabled={savingToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-none ${
                  regionsEnabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={regionsEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    regionsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={!regionsEnabled}
              >
                <Plus className="mr-2 h-4 w-4" />
                {' '}
                New Region
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Region</DialogTitle>
                <DialogDescription>Define a region and assign a host with contact info.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="rname">Name</Label>
                  <Input id="rname" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="rdesc">Description</Label>
                  <Textarea id="rdesc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input id="region" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Host (optional)</Label>
                  <Select onValueChange={val => setForm(f => ({ ...f, host_id: Number(val) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Unassigned</SelectItem>
                      {hosts.map(h => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {`${h.first_name ?? ''} ${h.last_name ?? ''}`}
                          {' '}
                          —
                          {h.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="whats">WhatsApp Number</Label>
                  <Input id="whats" placeholder="e.g. +63 912 345 6789" value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={handleCreate} disabled={isSaving || !form.name.trim() || !form.region.trim() || !form.city.trim()}>
                    {isSaving
                      ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-pulse" />
                            {' '}
                            Saving…
                          </>
                        )
                      : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {' '}
                            Create
                          </>
                        )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Region</DialogTitle>
              <DialogDescription>Update region details and host assignment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-region">Region</Label>
                  <Input
                    id="edit-region"
                    value={form.region}
                    onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Host (optional)</Label>
                <Select onValueChange={val => setForm(f => ({ ...f, host_id: Number(val) }))} value={String(form.host_id)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Unassigned</SelectItem>
                    {hosts.map(h => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {`${h.first_name ?? ''} ${h.last_name ?? ''}`}
                        {' '}
                        —
                        {h.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-whats">WhatsApp Number</Label>
                <Input
                  id="edit-whats"
                  placeholder="e.g. +63 912 345 6789"
                  value={form.whatsapp_number}
                  onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeEditDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSaving || !form.name.trim() || !form.region.trim() || !form.city.trim()}
                >
                  {isSaving
                    ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-pulse" />
                          {' '}
                          Saving…
                        </>
                      )
                    : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {' '}
                          Update
                        </>
                      )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {fetching
          ? (<div className="py-20 text-center text-gray-600">Loading regions…</div>)
          : !regionsEnabled
              ? (
                  <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <Settings className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">Regions Feature Disabled</h3>
                      <p className="mb-4 text-gray-600">
                        The regions feature is currently disabled. Enable it using the toggle above to manage regional sub-groups.
                      </p>
                      <p className="text-sm text-gray-500">
                        When disabled, the regional sub-groups section will be hidden from the website.
                      </p>
                    </CardContent>
                  </Card>
                )
              : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regions.map(r => (
                      <Card key={r.id} className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                        <CardHeader className="flex items-center justify-between">
                          <CardTitle className="text-lg text-gray-900">{r.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={r.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {r.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {r.host_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openBatchesDialog(r)}
                                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  View Batches
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(r)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleActiveStatus(r)}>
                                    {r.is_active ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(r.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-3 text-sm text-gray-700">{r.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            <div>
                              <span className="text-gray-500">Region:</span>
                              {' '}
                              {r.region}
                            </div>
                            <div>
                              <span className="text-gray-500">City:</span>
                              {' '}
                              {r.city}
                            </div>
                            <div>
                              <span className="text-gray-500">WhatsApp:</span>
                              {' '}
                              {r.whatsapp_number || '—'}
                            </div>
                            <div>
                              <span className="text-gray-500">Host:</span>
                              {' '}
                              {r.host_id ? hosts.find(h => h.id === r.host_id)?.email || 'Unknown' : 'Unassigned'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {regions.length === 0 && (
                      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                        <CardContent className="py-12 text-center text-gray-600">No regions yet. Create one!</CardContent>
                      </Card>
                    )}
                  </div>
                )}

        {/* Batches Dialog */}
        <Dialog open={isBatchesOpen} onOpenChange={setIsBatchesOpen}>
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sub-Group Batches -
                {selectedRegion?.name}
              </DialogTitle>
              <DialogDescription>
                View and manage batches created by the host of this region
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto">
              {loadingBatches
                ? (
                    <div className="py-8 text-center text-gray-600">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                      <p className="mt-2">Loading batches...</p>
                    </div>
                  )
                : batches.length === 0
                  ? (
                      <div className="py-8 text-center text-gray-600">
                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No batches found</h3>
                        <p className="text-sm">This host hasn't created any sub-group batches yet.</p>
                      </div>
                    )
                  : (
                      <div className="grid grid-cols-1 gap-4">
                        {batches.map((batch) => {
                          const progress = batch.target_vials === 0 ? 0 : Math.round((batch.current_vials / batch.target_vials) * 100);
                          return (
                            <Card key={batch.id} className="border border-gray-200">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg text-gray-900">{batch.name}</CardTitle>
                                    <div className="mt-1 flex items-center space-x-2">
                                      <Badge className={
                                        batch.status === 'active'
                                          ? 'bg-green-100 text-green-800'
                                          : batch.status === 'completed'
                                            ? 'bg-blue-100 text-blue-800'
                                            : batch.status === 'cancelled'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                      }
                                      >
                                        {batch.status}
                                      </Badge>
                                      {batch.status === 'active' && (
                                        <Badge className="animate-pulse bg-purple-500 px-2 py-1 text-xs text-white">
                                          LIVE
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  {batch.description && (
                                    <p className="line-clamp-2 text-sm text-gray-600">{batch.description}</p>
                                  )}
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Progress</span>
                                      <span className="font-semibold">
                                        {progress}
                                        %
                                      </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                      <div
                                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>
                                        {batch.current_vials}
                                        {' '}
                                        vials
                                      </span>
                                      <span>
                                        {batch.target_vials}
                                        {' '}
                                        target
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Products:</span>
                                      <span className="ml-1 font-semibold">{batch.batch_products?.length || 0}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Created:</span>
                                      <span className="ml-1">{new Date(batch.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button variant="outline" onClick={closeBatchesDialog}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
