import { Aurora } from './Aurora';
import { Particles } from './Particles';

export const Backdrop = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
      
      {/* 1. Aurora Canvas */}
      <Aurora />

      {/* 2. Particle Drift */}
      <Particles />

      {/* 3. Floating SVG Streaks (7 lines) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {[...Array(7)].map((_, i) => {
          const top = `${15 + (i * 12)}%`; // Staggered y-positions
          const duration = 15 + Math.random() * 10;
          const delay = Math.random() * 10;
          const isEmerald = i % 2 === 0;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top,
                left: 0,
                width: '150px',
                height: '1px',
                background: isEmerald 
                  ? 'linear-gradient(to right, transparent, var(--emerald-primary), transparent)' 
                  : 'linear-gradient(to right, transparent, var(--text-primary), transparent)',
                opacity: 0,
                animation: `streak ${duration}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* 4. Vertical Scanning Beam */}
      <div 
        className="animate-scan-x"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, var(--emerald-primary), transparent)',
          opacity: 0.3,
          boxShadow: '0 0 10px var(--emerald-primary)',
        }}
      />

      {/* 5. Vignette */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, var(--bg-primary) 100%)',
        }}
      />
    </div>
  );
};
