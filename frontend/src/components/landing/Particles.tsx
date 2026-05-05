import { useMemo } from 'react';

export const Particles = () => {
  // Generate ~45 particles once
  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `-${Math.random() * 20}%`, // start slightly below
      size: Math.random() * 4 + 1, // 1px to 5px
      duration: Math.random() * 20 + 10, // 10s to 30s
      delay: Math.random() * 10, // 0s to 10s delay
      maxOpacity: Math.random() * 0.35 + 0.15, // 0.15 to 0.50
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'var(--text-primary)',
            borderRadius: '50%',
            filter: 'blur(1px)',
            // Pass max opacity to the CSS animation via CSS variable
            '--max-opacity': p.maxOpacity,
            animation: `drift ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0, // Starts at 0, animation handles it
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
