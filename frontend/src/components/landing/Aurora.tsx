import { useEffect, useRef } from 'react';

export const Aurora = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const blobs = [
      { x: 0.2, y: 0.3, r: 0.4, color: 'oklch(0.78 0.17 160)', vx: 0.001, vy: 0.0015 }, // Emerald
      { x: 0.8, y: 0.6, r: 0.5, color: 'oklch(0.70 0.28 330)', vx: -0.001, vy: 0.001 },  // Magenta
      { x: 0.5, y: 0.8, r: 0.6, color: 'oklch(0.85 0.1 200)', vx: 0.0005, vy: -0.001 },  // Cyan-ish
      { x: 0.1, y: 0.8, r: 0.4, color: 'oklch(0.985 0.003 247)', vx: 0.001, vy: -0.0005 }, // Soft white
      { x: 0.7, y: 0.2, r: 0.5, color: 'oklch(0.65 0.2 40)', vx: -0.0015, vy: 0.0005 },  // Warm
    ];

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.5; // ~0.5x speed multiplier

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      blobs.forEach((blob, i) => {
        // Drift math using sine/cosine
        const dx = Math.sin(time * blob.vx + i) * (w * 0.2);
        const dy = Math.cos(time * blob.vy + i) * (h * 0.2);
        
        const cx = (w * blob.x) + dx;
        const cy = (h * blob.y) + dy;
        const radius = Math.min(w, h) * blob.r;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        
        // Convert OKLCH string to a color browser canvas can use by creating a temp element
        // Canvas API support for CSS color functions varies, so we ensure fallback to hex if needed
        // For simplicity and performance, we'll use string directly, modern browsers support it
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.7,
        filter: 'blur(60px) saturate(120%)',
      }}
    />
  );
};
