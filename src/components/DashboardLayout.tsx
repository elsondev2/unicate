import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { LoginTip } from './LoginTip';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 50;

      // Swipe right from left edge to open
      if (touchStartX.current < 50 && swipeDistance > minSwipeDistance) {
        setSidebarOpen(true);
      }

      // Swipe left to close
      if (sidebarOpen && swipeDistance < -minSwipeDistance) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Show swipe hint on first visit (mobile only)
    const hasSeenHint = localStorage.getItem('dashboard_swipe_hint_seen');
    if (!hasSeenHint && window.innerWidth < 1024) {
      setTimeout(() => {
        setShowSwipeHint(true);
        setTimeout(() => {
          setShowSwipeHint(false);
          localStorage.setItem('dashboard_swipe_hint_seen', 'true');
        }, 4000);
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b px-4 py-3 flex items-center gap-3 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-primary/10 hover:bg-primary/20 border border-primary/20"
          >
            <Menu className="h-5 w-5 text-primary" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-card p-1 shadow-md ring-2 ring-primary/20">
              <img
                src="/logo.png"
                alt="Unicate"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Unicate
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {/* Login Tip */}
      <LoginTip />

      {/* Swipe Hint Notification */}
      {showSwipeHint && (
        <div className="fixed top-20 left-4 z-50 lg:hidden animate-in slide-in-from-left duration-300">
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </div>
            <p className="text-sm font-medium">Swipe from left edge to open menu</p>
          </div>
        </div>
      )}
    </div>
  );
}
