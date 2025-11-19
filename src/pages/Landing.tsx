import { useNavigate } from 'react-router-dom';
import { memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Network, 
  Music, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Zap,
  Heart,
  Star,
  GraduationCap,
  Brain,
  Lightbulb,
  Target
} from 'lucide-react';
import { StickyHeader } from '@/components/StickyHeader';
import { StickyFooter } from '@/components/StickyFooter';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { smoothScrollToElement } from '@/lib/smoothScroll';
import { useScrollToTop } from '@/hooks/useScrollToTop';

// Memoized feature card component
interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
  };
  index: number;
}

const FeatureCard = memo(({ feature, index }: FeatureCardProps) => {
  const Icon = feature.icon;
  return (
    <Card 
      className="border-primary/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className={`bg-gradient-to-br ${feature.gradient} p-4 sm:p-6`}>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} />
        </div>
        <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
        <CardDescription className="text-sm">{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  );
});

FeatureCard.displayName = 'FeatureCard';

function Landing() {
  useScrollToTop();
  const navigate = useNavigate();

  const handleScrollToFeatures = useCallback(() => {
    const element = document.getElementById('features');
    smoothScrollToElement(element, 80, 500);
  }, []);

  const features = useMemo(() => [
    {
      icon: BookOpen,
      title: 'Rich Text Notes',
      description: 'Create beautiful notes with formatting, images, and links',
      gradient: 'from-primary/10 to-accent/10',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      icon: Network,
      title: 'Interactive Mind Maps',
      description: 'Visualize concepts with drag-and-drop mind mapping',
      gradient: 'from-secondary/10 to-primary/10',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-primary'
    },
    {
      icon: Music,
      title: 'Audio Lessons',
      description: 'Upload and share audio content for flexible learning',
      gradient: 'from-accent/10 to-secondary/10',
      iconBg: 'bg-accent/10',
      iconColor: 'text-primary'
    },
    {
      icon: Users,
      title: 'Teacher & Student Roles',
      description: 'Separate portals for educators and learners',
      gradient: 'from-primary/10 to-secondary/10',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    }
  ], []);

  const benefits = useMemo(() => [
    { icon: Zap, text: 'Lightning-fast performance' },
    { icon: Heart, text: 'Beautiful, intuitive design' },
    { icon: Brain, text: 'Enhanced learning retention' },
    { icon: Target, text: 'Goal-oriented features' }
  ], []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AnimatedBackground />
      <StickyHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 sm:pt-32 pb-12 sm:pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6 animate-fade-in text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-medium">Transform Your Learning Experience</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight animate-slide-in-left px-4">
            Learn Smarter with<br />Visual Mind Maps
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto animate-slide-in-right px-4">
            Create stunning notes, interactive mind maps, and audio lessons. 
            Perfect for teachers and students who want to make learning engaging and effective.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 animate-fade-in px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleScrollToFeatures}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
            >
              Explore Features
            </Button>
          </div>

          {/* Free Badge */}
          <div className="flex justify-center px-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                100% Free Forever
              </span>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4">
            Everything You Need to Learn
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Powerful tools designed to make learning intuitive, engaging, and effective
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* Mind Map Showcase */}
      <section className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Card className="border-secondary/20 shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-secondary/5 to-accent/5 flex flex-col justify-center order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-primary w-fit mb-3 sm:mb-4 text-xs sm:text-sm">
                  <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Featured</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  Interactive Mind Maps
                </h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                  Create beautiful, interactive mind maps with drag-and-drop nodes. 
                  Connect ideas visually and see the big picture of any topic.
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>Drag-and-drop interface</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>Custom colors and styles</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>Export and share easily</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>Real-time collaboration</span>
                  </li>
                </ul>
                <Button size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto">
                  Try Mind Maps
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6 sm:p-8 lg:p-12 flex items-center justify-center min-h-[300px] sm:min-h-[400px] order-1 lg:order-2">
                <div className="relative w-full h-full flex items-center justify-center scale-75 sm:scale-90 lg:scale-100">
                  {/* Mind Map Visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Center Node */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-xl z-10 relative">
                        <Brain className="h-8 w-8 sm:h-12 sm:w-12" />
                      </div>
                      
                      {/* Connected Nodes */}
                      <div className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 sm:border-4 border-primary/30 flex items-center justify-center shadow-lg">
                        <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-20 sm:-right-28 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 sm:border-4 border-accent/30 flex items-center justify-center shadow-lg">
                        <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                      </div>
                      <div className="absolute -bottom-16 sm:-bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 sm:border-4 border-secondary/30 flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -left-20 sm:-left-28 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 sm:border-4 border-primary/30 flex items-center justify-center shadow-lg">
                        <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-4">
            Why Choose Unicate?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg bg-card border border-primary/20 shadow-sm hover:shadow-md transition-all hover:border-primary/40"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span className="text-base sm:text-lg font-medium">{benefit.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <StickyFooter />
    </div>
  );
}

export default memo(Landing);
