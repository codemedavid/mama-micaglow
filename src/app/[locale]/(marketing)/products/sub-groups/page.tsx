'use client';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for regional sub-groups
const regions = [
  'All Regions',
  'Metro Manila',
  'Luzon',
  'Visayas',
  'Mindanao',
  'Cebu',
  'Davao',
  'Iloilo',
  'Baguio',
  'Cagayan de Oro',
];

const subGroups = [
  {
    id: '1',
    name: 'Manila Peptide Community',
    region: 'Metro Manila',
    host: {
      name: 'Dr. Maria Santos',
      avatar: '/api/placeholder/40/40',
      rating: 4.9,
      reviews: 45,
    },
    members: 156,
    activeBatches: 3,
    description: 'Largest peptide community in Metro Manila. Regular group buys and educational sessions.',
    specialties: ['Healing', 'Recovery', 'Anti-Aging'],
    lastActivity: '2 hours ago',
    isActive: true,
    joinFee: 0,
  },
  {
    id: '2',
    name: 'Cebu Research Group',
    region: 'Cebu',
    host: {
      name: 'Prof. Juan Dela Cruz',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      reviews: 32,
    },
    members: 89,
    activeBatches: 2,
    description: 'Research-focused group specializing in growth peptides and recovery compounds.',
    specialties: ['Growth', 'Research', 'Recovery'],
    lastActivity: '1 day ago',
    isActive: true,
    joinFee: 0,
  },
  {
    id: '3',
    name: 'Davao Wellness Circle',
    region: 'Davao',
    host: {
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      rating: 4.7,
      reviews: 28,
    },
    members: 67,
    activeBatches: 1,
    description: 'Wellness-focused community emphasizing anti-aging and cosmetic peptides.',
    specialties: ['Anti-Aging', 'Cosmetic', 'Wellness'],
    lastActivity: '3 days ago',
    isActive: true,
    joinFee: 0,
  },
  {
    id: '4',
    name: 'Iloilo Peptide Hub',
    region: 'Iloilo',
    host: {
      name: 'Dr. Roberto Garcia',
      avatar: '/api/placeholder/40/40',
      rating: 4.6,
      reviews: 19,
    },
    members: 43,
    activeBatches: 0,
    description: 'Growing community in Iloilo with focus on healing and recovery peptides.',
    specialties: ['Healing', 'Recovery'],
    lastActivity: '1 week ago',
    isActive: false,
    joinFee: 0,
  },
  {
    id: '5',
    name: 'Baguio Mountain Peptides',
    region: 'Baguio',
    host: {
      name: 'Lisa Chen',
      avatar: '/api/placeholder/40/40',
      rating: 4.9,
      reviews: 15,
    },
    members: 34,
    activeBatches: 1,
    description: 'Small but active community in Baguio with regular group purchases.',
    specialties: ['Healing', 'Growth'],
    lastActivity: '5 hours ago',
    isActive: true,
    joinFee: 0,
  },
  {
    id: '6',
    name: 'CDO Research Network',
    region: 'Cagayan de Oro',
    host: {
      name: 'Dr. Michael Torres',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      reviews: 22,
    },
    members: 78,
    activeBatches: 2,
    description: 'Professional research network with emphasis on clinical-grade peptides.',
    specialties: ['Research', 'Clinical', 'Growth'],
    lastActivity: '1 day ago',
    isActive: true,
    joinFee: 0,
  },
];

export default function SubGroupsPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = subGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase())
      || group.description.toLowerCase().includes(searchTerm.toLowerCase())
      || group.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || group.region.toLowerCase() === selectedRegion.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-white/30 bg-white/20 text-white">
              <MapPin className="mr-1 h-3 w-3" />
              Regional Sub-Groups
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Find Local Peptide Communities
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Connect with regional hosts and join local group purchases.
              Get better prices and build relationships with fellow peptide enthusiasts in your area.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                <MapPin className="mr-2 h-5 w-5" />
                Find My Region
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Crown className="mr-2 h-5 w-5" />
                Become a Host
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How Regional Sub-Groups Work</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Join local communities led by trusted regional hosts
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Find Your Region</h3>
              <p className="text-muted-foreground">
                Browse sub-groups in your area or nearby regions
              </p>
            </div>

            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Join a Community</h3>
              <p className="text-muted-foreground">
                Connect with local hosts and fellow peptide enthusiasts
              </p>
            </div>

            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Group Purchases</h3>
              <p className="text-muted-foreground">
                Participate in local group buys organized by regional hosts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search sub-groups..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region.toLowerCase()}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredGroups.length}
              {' '}
              sub-groups found
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Groups Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map(group => (
              <Card key={group.id} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-1 text-lg">{group.name}</CardTitle>
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{group.region}</span>
                        {group.isActive
                          ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            )
                          : (
                              <Badge variant="secondary">
                                <Clock className="mr-1 h-3 w-3" />
                                Inactive
                              </Badge>
                            )}
                      </div>
                    </div>
                    {group.joinFee > 0 && (
                      <Badge variant="outline" className="border-orange-600 text-orange-600">
                        ₱
                        {group.joinFee}
                        {' '}
                        fee
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="mb-4">
                    {group.description}
                  </CardDescription>

                  {/* Host Info */}
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Host</p>
                      <p className="text-sm font-medium">{group.host.name}</p>
                      <div className="flex items-center gap-1">

                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-2xl font-bold text-primary">{group.members}</p>
                        <p className="text-xs text-muted-foreground">Members</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-2xl font-bold text-primary">{group.activeBatches}</p>
                        <p className="text-xs text-muted-foreground">Active Batches</p>
                      </div>
                    </div>

                    {/* Specialties */}

                    {/* Pricing Info */}

                    {/* Last Activity */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last activity:
                        {group.lastActivity}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        disabled={!group.isActive}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {group.isActive ? 'Join Group' : 'Request to Join'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Become a Regional Host</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Lead your local peptide community and help others access better prices
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Lead Your Community</h3>
              <p className="text-sm text-muted-foreground">
                Organize group purchases and build relationships with local peptide enthusiasts
              </p>
            </div>

            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Earn Host Benefits</h3>
              <p className="text-sm text-muted-foreground">
                Get special discounts and early access to new products as a regional host
              </p>
            </div>

            <div className="text-center">
              <div className="gradient-purple mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Flexible Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Organize group buys on your own schedule and manage your community
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" className="gradient-purple text-white hover:opacity-90">
              <Crown className="mr-2 h-5 w-5" />
              Apply to Become a Host
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Join a Local Community?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Connect with regional hosts and start participating in local group purchases today
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <MapPin className="mr-2 h-5 w-5" />
              Browse All Groups
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <ArrowRight className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
