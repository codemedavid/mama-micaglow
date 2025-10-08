import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'FAQ - Mama_MicaGlow',
  description: 'Frequently Asked Questions about peptides, dosing, administration, and research protocols.',
};

const faqData = [
  {
    category: 'General Questions',
    icon: '❓',
    questions: [
      {
        question: 'What are peptides, and how are they used in research?',
        answer: 'Peptides are short chains of amino acids researched for their potential effects on metabolism, tissue repair, anti-aging, neuroprotection, and more. The information provided is for laboratory and educational purposes only, compiled from clinical trials and research protocols as of September 25, 2025.',
      },
      {
        question: 'Is this guide intended for human or veterinary use?',
        answer: 'No, this guide is not intended for human or veterinary use unless prescribed by a licensed medical professional. It is for research purposes only.',
      },
      {
        question: 'Where can I find instructions for preparing and injecting peptides?',
        answer: 'Refer to the Prep & Injection Guide linked in the peptide dosing guide for proper reconstitution, syringe sizing, and injection protocols.',
      },
    ],
  },
  {
    category: 'Dosing and Administration',
    icon: '💉',
    questions: [
      {
        question: 'How should I dose Semaglutide for weight loss research?',
        answer: 'For Semaglutide (3MG), mix with 0.6mL BAC water and dose once weekly subcutaneously, starting at 4 units (0.25mg) and increasing up to 40 units (2.5mg) over 4-week intervals.',
      },
      {
        question: 'What is the typical dosing schedule for BPC-157 in tissue repair studies?',
        answer: 'For BPC-157 (5MG), mix with 2mL BAC water and dose 250-500mcg (25-50 units) daily subcutaneously.',
      },
      {
        question: 'How often should Retatrutide be administered?',
        answer: 'Retatrutide (6MG) should be mixed with 1.2mL BAC water and dosed weekly subcutaneously, titrating from 20 units (1mg) over 4 weeks up to 120 units (6mg).',
      },
    ],
  },
  {
    category: 'Benefits and Effects',
    icon: '✨',
    questions: [
      {
        question: 'What are the benefits of using Ipamorelin in research?',
        answer: 'Ipamorelin increases growth hormone for muscle growth, improves sleep, metabolism, and energy, based on research data.',
      },
      {
        question: 'Can Melanotan 2 help with tanning?',
        answer: 'Yes, Melanotan 2 promotes skin pigmentation for UV protection, as shown in research models.',
      },
      {
        question: 'What does NAD+ do in anti-aging studies?',
        answer: 'NAD+ enhances energy, DNA repair, and supports anti-aging and metabolic functions by boosting sirtuins and mitochondrial activity.',
      },
    ],
  },
  {
    category: 'Side Effects and Contraindications',
    icon: '⚠️',
    questions: [
      {
        question: 'What are common side effects of Tirzepatide?',
        answer: 'Common side effects include nausea, vomiting, diarrhea, and injection site reactions, with rare risks like pancreatitis or thyroid tumors.',
      },
      {
        question: 'Who should avoid using HGH Fragment 176-191?',
        answer: 'Avoid use if hypersensitive, as it may cause mild head rush or injection pain.',
      },
      {
        question: 'Are there contraindications for Thymosin Alpha-1?',
        answer: 'Yes, avoid in cases of autoimmune disease due to its immune-enhancing effects.',
      },
    ],
  },
  {
    category: 'Stacking and Combinations',
    icon: '🔗',
    questions: [
      {
        question: 'Can I stack Semaglutide with other peptides?',
        answer: 'Yes, it can be stacked with Tirzepatide for enhanced weight loss, Cagrilintide for satiety, AOD-9604 for lipolysis, or BPC-157 to mitigate GI side effects.',
      },
      {
        question: 'What peptides pair well with BPC-157 for repair?',
        answer: 'BPC-157 stacks well with TB-500 for comprehensive healing and GHK-Cu for skin and connective tissue support.',
      },
      {
        question: 'Is stacking Ipamorelin and CJC-1295 effective?',
        answer: 'Yes, combining Ipamorelin with CJC-1295 (NO dac or With dac) provides synergistic growth hormone release.',
      },
    ],
  },
  {
    category: 'Safety and Precautions',
    icon: '🛡️',
    questions: [
      {
        question: 'What should I do if I experience side effects?',
        answer: 'Discontinue use and consult research protocols or a professional, as side effects vary (e.g., nausea with Tirzepatide, flushing with NAD+).',
      },
      {
        question: 'Are there peptides to avoid with certain conditions?',
        answer: 'Yes, avoid EPO if you have cancer or cardiovascular disease, and avoid Dermorphin if sensitive to opioids due to respiratory depression risks.',
      },
      {
        question: 'How often should I cycle peptides like Epitalon?',
        answer: 'Epitalon (10MG) is dosed 5-10mg daily for 10-20 days, cycled twice a year.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-purple-100/80 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-purple-700">Frequently Asked Questions</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Peptide Research FAQ
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Find answers to common questions about peptides, dosing protocols, administration,
            and research guidelines. All information is for educational and research purposes only.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-12 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <span className="text-xl">⚠️</span>
              Important Notice
            </CardTitle>
            <CardDescription className="text-amber-700">
              This information is for research and educational purposes only. Not intended for human or veterinary use unless prescribed by a licensed medical professional.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <Card key={`category-${category.category}`} className="overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">{category.icon}</span>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, questionIndex) => (
                    <AccordionItem key={`question-${category.category}-${faq.question.slice(0, 20)}`} value={`${categoryIndex}-${questionIndex}`}>
                      <AccordionTrigger className="px-6 py-4 text-left hover:bg-purple-50/50">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                          <p className="leading-relaxed text-gray-700">{faq.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="mt-12 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <span className="text-xl">📚</span>
              Additional Resources
            </CardTitle>
            <CardDescription className="text-purple-700">
              Explore more detailed information about peptides and research protocols.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-purple-200 bg-white p-4">
                <h4 className="mb-2 font-semibold text-purple-800">Peptide Dosing Guide</h4>
                <p className="mb-3 text-sm text-gray-600">
                  Comprehensive dosing protocols for all available peptides.
                </p>
                <Button asChild variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                  <Link href="/peptide-dosing-guide">
                    View Guide
                  </Link>
                </Button>
              </div>
              <div className="rounded-lg border border-purple-200 bg-white p-4">
                <h4 className="mb-2 font-semibold text-purple-800">Prep & Injection Guide</h4>
                <p className="mb-3 text-sm text-gray-600">
                  Step-by-step instructions for reconstitution and administration.
                </p>
                <Badge variant="outline" className="border-purple-300 text-purple-600">
                  Coming Soon
                </Badge>
              </div>
              <div className="rounded-lg border border-purple-200 bg-white p-4">
                <h4 className="mb-2 font-semibold text-purple-800">Research Protocols</h4>
                <p className="mb-3 text-sm text-gray-600">
                  Detailed research methodologies and safety guidelines.
                </p>
                <Badge variant="outline" className="border-purple-300 text-purple-600">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-xl font-semibold text-green-800">
              Still have questions?
            </h3>
            <p className="mb-4 text-green-700">
              Our research support team is here to help with additional questions about peptides and protocols.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Badge variant="outline" className="border-green-300 text-green-700">
                📧 support@mamamicalglow.com
              </Badge>
              <Badge variant="outline" className="border-green-300 text-green-700">
                📞 +63 915 490 1224
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
