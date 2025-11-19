import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Terms() {
  useScrollToTop();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: November 19, 2025</p>

          <Card className="border-primary/20 shadow-lg">
            <CardContent className="prose prose-sm sm:prose max-w-none p-6 sm:p-8">
              <h2 className="text-2xl font-bold mt-0">1. Acceptance of Terms</h2>
              <p>
                By accessing and using LearnHub, you accept and agree to be bound by the terms and
                provisions of this agreement.
              </p>

              <h2 className="text-2xl font-bold">2. Use License</h2>
              <p>
                Permission is granted to temporarily access LearnHub for personal, non-commercial use.
                This is the grant of a license, not a transfer of title.
              </p>

              <h2 className="text-2xl font-bold">3. User Accounts</h2>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-bold">4. User Content</h2>
              <p>
                You retain all rights to the content you create on LearnHub. By uploading content, you
                grant us a license to store, display, and distribute your content as necessary to
                provide our services.
              </p>

              <h2 className="text-2xl font-bold">5. Prohibited Uses</h2>
              <p>You may not use LearnHub to:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Harass or harm other users</li>
                <li>Attempt to gain unauthorized access</li>
              </ul>

              <h2 className="text-2xl font-bold">6. Service Availability</h2>
              <p>
                We strive to provide reliable service but do not guarantee uninterrupted access. We
                reserve the right to modify or discontinue services with or without notice.
              </p>

              <h2 className="text-2xl font-bold">7. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct
                that we believe violates these Terms or is harmful to other users or our business.
              </p>

              <h2 className="text-2xl font-bold">8. Limitation of Liability</h2>
              <p>
                LearnHub shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of or inability to use the service.
              </p>

              <h2 className="text-2xl font-bold">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes via email or through the service.
              </p>

              <h2 className="text-2xl font-bold">10. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:elsonmgaya25@gmail.com" className="text-primary hover:underline">
                  elsonmgaya25@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <StickyFooter />
    </div>
  );
}
