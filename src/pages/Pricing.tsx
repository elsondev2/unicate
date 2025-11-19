import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Pricing() {
  useScrollToTop();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 notes',
        'Up to 5 mind maps',
        'Basic audio lessons',
        'Community support',
        'Mobile app access',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$9',
      description: 'For serious learners',
      features: [
        'Unlimited notes',
        'Unlimited mind maps',
        'Unlimited audio lessons',
        'Priority support',
        'Advanced export options',
        'Collaboration tools',
        'Custom themes',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '$29',
      description: 'For schools and organizations',
      features: [
        'Everything in Pro',
        'Up to 50 team members',
        'Admin dashboard',
        'Advanced analytics',
        'SSO integration',
        'Dedicated support',
        'Custom branding',
        'API access',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your learning journey. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Free Forever Notice */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  100% Free Forever
                </h2>
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <p className="text-lg text-muted-foreground">
                Unicate is completely free to use. All features, unlimited storage, no hidden costs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison (Hidden but kept for future) */}
        <div className="hidden grid md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-2xl scale-105'
                  : 'border-primary/20 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. You can cancel your subscription at any time with no penalties.',
              },
            ].map((faq, i) => (
              <Card key={i} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                  <CardDescription>{faq.a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <StickyFooter />
    </div>
  );
}
