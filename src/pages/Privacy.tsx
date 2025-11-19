import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Privacy() {
  useScrollToTop();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: November 19, 2025</p>

          <Card className="border-primary/20 shadow-lg">
            <CardContent className="prose prose-sm sm:prose max-w-none p-6 sm:p-8">
              <h2 className="text-2xl font-bold mt-0">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, including your name, email address,
                and any content you create using LearnHub (notes, mind maps, audio lessons).
              </p>

              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>

              <h2 className="text-2xl font-bold">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information only in the
                following circumstances:
              </p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>

              <h2 className="text-2xl font-bold">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h2 className="text-2xl font-bold">6. Cookies</h2>
              <p>
                We use cookies and similar technologies to provide and improve our services. You can
                control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-bold">7. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13. We do not knowingly collect
                personal information from children under 13.
              </p>

              <h2 className="text-2xl font-bold">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes
                by posting the new policy on this page.
              </p>

              <h2 className="text-2xl font-bold">9. Contact Us</h2>
              <p>
                If you have questions about this privacy policy, please contact us at{' '}
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
