import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Security() {
  useScrollToTop();
  
  const features = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All your data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Multi-factor authentication and secure password hashing protect your account from unauthorized access.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Our servers are hosted in SOC 2 compliant data centers with 24/7 monitoring and regular security audits.',
    },
    {
      icon: Eye,
      title: 'Privacy by Design',
      description: 'We collect only the minimum data necessary and never sell your personal information to third parties.',
    },
    {
      icon: Key,
      title: 'Access Controls',
      description: 'Granular permission systems ensure that only authorized users can access specific content.',
    },
    {
      icon: AlertTriangle,
      title: 'Incident Response',
      description: 'Our dedicated security team monitors for threats and responds quickly to any security incidents.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Security at LearnHub
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Your data security and privacy are our top priorities. Learn how we protect your information.
            </p>
          </div>

          {/* Security Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="border-primary/20 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Compliance */}
          <Card className="border-primary/20 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose max-w-none">
              <p>LearnHub complies with major security and privacy regulations:</p>
              <ul>
                <li><strong>GDPR</strong> - General Data Protection Regulation compliance for EU users</li>
                <li><strong>CCPA</strong> - California Consumer Privacy Act compliance</li>
                <li><strong>FERPA</strong> - Family Educational Rights and Privacy Act for educational institutions</li>
                <li><strong>SOC 2 Type II</strong> - Independent audit of our security controls</li>
              </ul>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Security Best Practices for Users</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose max-w-none">
              <p>Help us keep your account secure by following these recommendations:</p>
              <ul>
                <li>Use a strong, unique password for your LearnHub account</li>
                <li>Enable two-factor authentication in your account settings</li>
                <li>Never share your password with anyone</li>
                <li>Log out when using shared or public computers</li>
                <li>Keep your email address up to date for security notifications</li>
                <li>Report any suspicious activity to our security team immediately</li>
              </ul>
              <p className="mt-6">
                If you discover a security vulnerability, please report it to{' '}
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
