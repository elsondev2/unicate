import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  glowIntensity: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef(0);
  const frameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize stars with movement
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        glowIntensity: 0,
      });
    }

    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      frameRef.current = requestAnimationFrame(animate);

      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      timeRef.current += 0.033;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Move stars
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Calculate distance to mouse
        const dx = mouseRef.current.x - star.x;
        const dy = mouseRef.current.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hoverRadius = 150;

        // Update glow intensity based on mouse proximity
        if (distance < hoverRadius) {
          star.glowIntensity = Math.min(1, star.glowIntensity + 0.1);
        } else {
          star.glowIntensity = Math.max(0, star.glowIntensity - 0.05);
        }

        // Twinkle effect
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset);
        const currentOpacity = star.opacity * (0.6 + twinkle * 0.4);

        // Draw glow when mouse is near
        if (star.glowIntensity > 0) {
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 8
          );
          gradient.addColorStop(0, `rgba(236, 72, 153, ${star.glowIntensity * 0.4})`);
          gradient.addColorStop(0.5, `rgba(236, 72, 153, ${star.glowIntensity * 0.2})`);
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw star
        const starSize = star.size * (1 + star.glowIntensity * 0.5);
        ctx.fillStyle = `rgba(241, 196, 230, ${currentOpacity * (1 + star.glowIntensity * 0.5)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, starSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8 * (1 + star.glowIntensity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, starSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ opacity: 0.6, pointerEvents: 'none' }}
    />
  );
}
