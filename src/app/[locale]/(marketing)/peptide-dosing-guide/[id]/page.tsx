import type { Metadata } from 'next';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Info, Shield, Syringe, XCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPeptideById, peptides } from '@/data/peptides';

type PeptidePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PeptidePageProps): Promise<Metadata> {
  const { id } = await params;
  const peptide = getPeptideById(id);

  if (!peptide) {
    return {
      title: 'Peptide Not Found',
    };
  }

  return {
    title: `${peptide.name} - Detailed Dosing Guide`,
    description: `Comprehensive dosing instructions, mechanism of action, and research protocols for ${peptide.name}.`,
  };
}

export async function generateStaticParams() {
  return peptides.map(peptide => ({
    id: peptide.id,
  }));
}

export default async function PeptideDetailPage({ params }: PeptidePageProps) {
  const { id } = await params;
  const peptide = getPeptideById(id);

  if (!peptide) {
    notFound();
  }

  // Note: Available products could be fetched here for future features
  // const availableProducts = await getProductsByPeptideName(peptide.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/peptide-dosing-guide" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Peptides
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-5xl">{peptide.icon}</span>
            <div>
              <h1 className="gradient-text-purple text-4xl font-bold">{peptide.name}</h1>
              <Badge variant="secondary" className="mt-2">
                {peptide.category}
              </Badge>
            </div>
          </div>
          <p className="max-w-4xl text-lg text-muted-foreground">
            {peptide.description}
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>🔴 IMPORTANT:</strong>
            {' '}
            This information is for research and educational purposes only.
            Not intended for human or veterinary use unless prescribed by a licensed medical professional.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Mechanism of Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Mechanism of Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {peptide.mechanism}
                </p>
              </CardContent>
            </Card>

            {/* Dosing Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Dosing Instructions</CardTitle>
                <CardDescription>
                  Detailed reconstitution and dosing protocols for different vial sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {peptide.dosing.map(dose => (
                  <div key={`dosing-${dose.vialSize}`} className="rounded-lg border bg-muted/30 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Badge variant="outline" className="px-3 py-1 text-lg">
                        {dose.vialSize}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Vial Size</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                          <Info className="h-4 w-4" />
                          Reconstitution
                        </h4>
                        <p className="text-muted-foreground">{dose.reconstitution}</p>
                      </div>

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                          <Clock className="h-4 w-4" />
                          Frequency
                        </h4>
                        <p className="text-muted-foreground">{dose.frequency}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 font-semibold">Subcutaneous Dosing</h4>
                      <p className="rounded border-l-4 border-purple-500 bg-muted/50 p-3 text-muted-foreground">
                        {dose.subcutaneous}
                      </p>
                    </div>

                    {dose.notes && (
                      <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3">
                        <h4 className="mb-1 font-semibold text-amber-800">Important Note:</h4>
                        <p className="text-sm text-amber-700">{dose.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Research Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {peptide.benefits.map(benefit => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Side Effects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Possible Side Effects
                </CardTitle>
                <CardDescription>
                  Side effects are often mild and transient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {peptide.sideEffects.map(effect => (
                    <li key={effect} className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                      <span className="text-muted-foreground">{effect}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contraindications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Contraindications
                </CardTitle>
                <CardDescription>
                  Important safety warnings and restrictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {peptide.contraindications.map(contra => (
                    <li key={contra} className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <span className="text-muted-foreground">{contra}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Stacking Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Stacking Suggestions</CardTitle>
                <CardDescription>
                  Recommended combinations with other peptides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {peptide.stacking.map(stack => (
                    <li key={stack} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                      <span className="text-muted-foreground">{stack}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Refrigerated Storage (2-8°C / 36-46°F)</p>
                      <p className="text-sm text-muted-foreground">
                        Generally stable for several days to weeks. Some sources suggest stability up to 30 days.
                        Stability varies by peptide type, purity, and presence of preservatives.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Freezer Storage (-20°C or lower)</p>
                      <p className="text-sm text-muted-foreground">
                        Extends shelf life for months or up to a year.
                        Stability depends on the specific peptide and storage conditions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Manufacturer's Guidance</p>
                      <p className="text-sm text-muted-foreground">
                        Always consult for the most accurate stability information specific to your peptide.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Peptides */}
            <Card>
              <CardHeader>
                <CardTitle>Related Peptides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {peptides
                    .filter(p => p.category === peptide.category && p.id !== peptide.id)
                    .slice(0, 3)
                    .map(relatedPeptide => (
                      <Link
                        key={relatedPeptide.id}
                        href={`/peptide-dosing-guide/${relatedPeptide.id}`}
                        className="flex items-center gap-3 rounded p-2 transition-colors hover:bg-muted"
                      >
                        <span className="text-lg">{relatedPeptide.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{relatedPeptide.name}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="mt-12">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">Research Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-amber-700">
              <p>
                This detailed guide is for educational and research purposes only.
                {' '}
                {peptide.name}
                {' '}
                is a research compound
                and should only be used in laboratory settings by qualified researchers.
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
