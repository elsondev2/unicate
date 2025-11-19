import { useEffect } from 'react';

/**
 * Hook to scroll to top of page on component mount with smooth animation
 */
export function useScrollToTop() {
  useEffect(() => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Add fade-in animation
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.3s ease-in-out';
      document.body.style.opacity = '1';
    });

    return () => {
      document.body.style.transition = '';
    };
  }, []);
}
