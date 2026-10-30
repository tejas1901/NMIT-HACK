import React, { useEffect, useRef, memo } from 'react';

export const LiquidBackground: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      // Only resize canvas if window viewport actually changed to prevent buffer clearing flicker
      if (canvas.width !== newW || canvas.height !== newH) {
        width = canvas.width = newW;
        height = canvas.height = newH;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Particle nodes for subtle constellation / freight routing grid
    const PARTICLE_COUNT = Math.min(48, Math.floor((width * height) / 28000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseColor: string;
    }> = [];

    const colors = [
      'rgba(52, 211, 153,', // mint-500
      'rgba(110, 231, 183,', // mint-400
      'rgba(27, 58, 122,', // navy-600
      'rgba(8, 25, 58,' // navy-900
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.35 + 0.15,
        baseColor: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolate
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse influence
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          p.x -= (dx / dist) * force * 1.2;
          p.y -= (dy / dist) * force * 1.2;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.baseColor} ${p.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distBetween < 130) {
            const lineAlpha = (1 - distBetween / 130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 3 large blurred ambient drifting blobs as specified */}
      {/* Blob 1: Light Mint / Green */}
      <div 
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[110px] animate-blob-1"
        style={{
          background: 'radial-gradient(circle, rgba(110, 231, 183, 0.42) 0%, rgba(52, 211, 153, 0.18) 60%, transparent 80%)'
        }}
      />
      
      {/* Blob 2: Dark Blue / Navy at 15% opacity */}
      <div 
        className="absolute top-1/3 -right-48 w-[750px] h-[750px] rounded-full blur-[130px] animate-blob-2"
        style={{
          background: 'radial-gradient(circle, rgba(8, 25, 58, 0.16) 0%, rgba(27, 58, 122, 0.12) 60%, transparent 80%)'
        }}
      />
      
      {/* Blob 3: Soft White & Iridescent sheen */}
      <div 
        className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full blur-[120px] animate-blob-3"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(167, 243, 208, 0.28) 50%, transparent 80%)'
        }}
      />

      {/* Interactive mouse particle network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-65" />
    </div>
  );
});
