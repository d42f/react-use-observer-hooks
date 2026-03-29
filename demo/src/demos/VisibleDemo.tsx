import { useRef, CSSProperties, useEffect } from 'react';
import { useVisible } from 'react-use-observer-hooks';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#06b6d4',
];

function Card({ index }: { index: number }) {
  const [ref, isVisible] = useVisible();

  const style: CSSProperties = {
    height: 120,
    borderRadius: 12,
    background: COLORS[index % COLORS.length],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  };

  return (
    <div ref={ref} style={style}>
      Card {index + 1}
    </div>
  );
}

export function VisibleDemo() {
  return (
    <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>useVisible</h2>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Detects if an element is visible in the viewport. Cards animate in as you scroll down.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <Card key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
