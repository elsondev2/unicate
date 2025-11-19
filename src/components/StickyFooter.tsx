import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function StickyFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative mt-20 border-t bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Large CTA Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students and teachers already using Unicate
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all group"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free forever
          </p>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold mb-4 text-primary">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/faq')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/security')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Security
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-card p-1 shadow-md ring-2 ring-primary/20">
              <img
                src="/logo.png"
                alt="Unicate"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Unicate. All rights reserved.
            </p>
          </div>


        </div>
      </div>
    </footer>
  );
}
