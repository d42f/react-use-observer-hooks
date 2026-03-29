import { useRef } from 'react';
import { useWasScrolled } from 'react-use-observer-hooks';

export function WasScrolledDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isWindowScrolled = useWasScrolled(undefined, 10);
  const isBoxScrolled = useWasScrolled(containerRef.current, 80);

  return (
    <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>useWasScrolled</h2>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Returns <code>true</code> once the target element (or window) has scrolled past an offset.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Window scroll (offset: 10px)</h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isWindowScrolled ? '#dcfce7' : '#fef9c3',
              color: isWindowScrolled ? '#166534' : '#854d0e',
              padding: '8px 14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.3s',
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: isWindowScrolled ? '#16a34a' : '#ca8a04' }}
            />
            {isWindowScrolled ? 'Scrolled' : 'Not scrolled'}
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>Scroll the page to see it change</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Element scroll (offset: 80px)</h3>
          <div
            ref={containerRef}
            style={{
              height: 400,
              overflowY: 'auto',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              padding: 16,
              background: '#fafafa',
            }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <p
                key={i}
                style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#6b7280' }}
              >
                Line {i + 1} — scroll me
              </p>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isBoxScrolled ? '#dcfce7' : '#fef9c3',
              color: isBoxScrolled ? '#166534' : '#854d0e',
              padding: '8px 14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.3s',
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: isBoxScrolled ? '#16a34a' : '#ca8a04' }}
            />
            {isBoxScrolled ? 'Scrolled past 80px' : 'Not yet scrolled 80px'}
          </div>
        </div>
      </div>
    </div>
  );
}
