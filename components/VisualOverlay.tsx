'use client';
import type { ReactNode } from 'react';

export default function VisualOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* warm gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-black to-black" />
        {/* vignette */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ boxShadow: 'inset 0 0 400px 120px rgba(0,0,0,0.6)' }}
        />
        {/* soft grain (CSS-only dots) */}
        <div
          className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:3px_3px]"
        />
      </div>
      {children}
    </div>
  );
}
