'use client';

import type { Peptide } from '@/data/peptides';
import { AlertTriangle, ArrowRight, Clock, Search, Syringe } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categories, peptides } from '@/data/peptides';

function PeptideCard({ peptide }: { peptide: Peptide }) {
  return (
    <Card className="group h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{peptide.icon}</span>
            <div>
              <CardTitle className="text-lg transition-colors group-hover:text-purple-600">
                {peptide.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {peptide.category}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {peptide.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          {peptide.halfLife && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{peptide.halfLife}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {peptide.dosing.slice(0, 2).map(dose => (
              <Badge key={dose.vialSize} variant="outline" className="px-1 py-0 text-xs">
                {dose.vialSize}
              </Badge>
            ))}
            {peptide.dosing.length > 2 && (
              <Badge variant="outline" className="px-1 py-0 text-xs">
                +
                {peptide.dosing.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <Button asChild className="w-full text-sm transition-colors group-hover:bg-purple-600">
          <Link href={`/peptide-dosing-guide/${peptide.id}`}>
            View Details
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PeptideDosingGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPeptides = useMemo(() => {
    return peptides.filter((peptide) => {
      const matchesSearch = peptide.name.toLowerCase().includes(searchTerm.toLowerCase())
        || peptide.category.toLowerCase().includes(searchTerm.toLowerCase())
        || peptide.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || peptide.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <Badge className="gradient-purple mb-4 border-0 text-white">
            <Syringe className="mr-1 h-3 w-3" />
            Research Protocols
          </Badge>
          <h1 className="gradient-text-purple mb-4 text-4xl font-bold md:text-5xl">
            Peptide Dosing Guide
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Browse our comprehensive collection of research peptides. Click on any peptide to view detailed dosing instructions,
            mechanisms of action, and research protocols.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>🔴 IMPORTANT:</strong>
            {' '}
            All information is compiled from research sources for laboratory and educational purposes only.
            It is not intended for human or veterinary use unless prescribed by a licensed medical professional.
            Data is drawn from clinical trials, peer-reviewed studies, and research protocols where available.
          </AlertDescription>
        </Alert>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col gap-6">
            <div className="relative max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search peptides..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Navigation */}
            <div className="relative">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'border border-gray-200 bg-white text-gray-900 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing
            {' '}
            {filteredPeptides.length}
            {' '}
            of
            {' '}
            {peptides.length}
            {' '}
            peptides
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Peptides Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPeptides.map(peptide => (
            <PeptideCard key={peptide.id} peptide={peptide} />
          ))}
        </div>

        {/* No Results Message */}
        {filteredPeptides.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-muted-foreground">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">No peptides found</h3>
              <p>Try adjusting your search terms or category filter.</p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <CardTitle>Research Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This dosing guide is for educational and research purposes only. All peptides listed are
                research compounds and should only be used in laboratory settings by qualified researchers.
              </p>
              <p>
                Always consult with a licensed medical professional before considering any peptide therapy.
                Individual results may vary, and proper medical supervision is essential for safe use.
              </p>
              <p>
                The information provided is based on available research literature and should not be
                considered as medical advice or treatment recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
