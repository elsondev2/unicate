import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function FAQ() {
  useScrollToTop();
  
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create my first note?',
          a: 'After signing in, click the "New Note" button on your dashboard. You can start typing immediately with our rich text editor.',
        },
        {
          q: 'Can I import existing notes?',
          a: 'Yes! You can import notes from various formats including Markdown, Word documents, and plain text files.',
        },
        {
          q: 'Is there a mobile app?',
          a: 'Yes, LearnHub is fully responsive and works great on mobile browsers. Native apps for iOS and Android are coming soon!',
        },
      ],
    },
    {
      category: 'Mind Maps',
      questions: [
        {
          q: 'How do I create a mind map?',
          a: 'Navigate to the Mind Maps tab and click "New Mind Map". You can then drag and drop nodes to create your visual structure.',
        },
        {
          q: 'Can I export my mind maps?',
          a: 'Yes! You can export mind maps as PNG images, PDF files, or JSON data for backup.',
        },
        {
          q: 'Can I collaborate on mind maps?',
          a: 'Collaboration features are available on Pro and Team plans, allowing real-time editing with others.',
        },
      ],
    },
    {
      category: 'Audio Lessons',
      questions: [
        {
          q: 'What audio formats are supported?',
          a: 'We support MP3, WAV, M4A, and OGG formats. Maximum file size is 100MB per audio file.',
        },
        {
          q: 'Can students download audio lessons?',
          a: 'Yes, teachers can enable downloads for each audio lesson individually.',
        },
      ],
    },
    {
      category: 'Account & Billing',
      questions: [
        {
          q: 'How do I upgrade my plan?',
          a: 'Go to Settings > Billing and select your desired plan. Upgrades take effect immediately.',
        },
        {
          q: 'What happens if I cancel?',
          a: 'You can continue using your paid features until the end of your billing period. After that, you\'ll be moved to the free plan.',
        },
        {
          q: 'Do you offer refunds?',
          a: 'Yes, we offer a 30-day money-back guarantee for all paid plans.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Find answers to common questions about LearnHub
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section, i) => (
              <Card key={i} className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((faq, j) => (
                      <AccordionItem key={j} value={`item-${i}-${j}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Card */}
          <Card className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
              <CardDescription className="text-base">
                Our support team is here to help you get the most out of LearnHub
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <a
                href="mailto:elsonmgaya25@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                elsonmgaya25@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <StickyFooter />
    </div>
  );
}
