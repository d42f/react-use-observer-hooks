import { useNavigate, useLocation } from 'react-router-dom';
import { useAnchorObserver } from 'react-use-observer-hooks';

const SECTIONS = [
  {
    id: '/anchor-observer',
    label: 'About',
    color: '#6366f1',
    content:
      'This hook syncs the active section with the scroll position. It uses IntersectionObserver under the hood to detect which section is most visible and updates the URL anchor accordingly.',
  },
  {
    id: '/anchor-observer/features',
    label: 'Features',
    color: '#8b5cf6',
    content:
      'Smooth scrolling to any section on click, automatic anchor detection on scroll, URL synchronization, SSR-safe implementation, and zero external dependencies beyond React.',
  },
  {
    id: '/anchor-observer/usage',
    label: 'Usage',
    color: '#ec4899',
    content:
      'Pass a list of anchor IDs and the current anchor from your router. The hook returns a ref for the container, the currently focused anchor, and a scrollToAnchor function.',
  },
  {
    id: '/anchor-observer/examples',
    label: 'Examples',
    color: '#f97316',
    content:
      'Works great with Next.js App Router and Pages Router. Use the usePathname and useRouter hooks to read and update the URL hash as the user scrolls through sections.',
  },
  {
    id: '/anchor-observer/faq',
    label: 'FAQ',
    color: '#14b8a6',
    content:
      'Q: Does it work with SSR? Yes — window is only accessed after mount. Q: Can I use custom thresholds? Yes — pass IntersectionObserver options. Q: Does it support horizontal scroll? Not currently.',
  },
];

export function AnchorObserverDemo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { ref, focusedAnchor } = useAnchorObserver<HTMLDivElement>({
    offsetPx: 64,
    anchors: SECTIONS.map(s => s.id),
    currentAnchor: pathname,
    onAnchorChange: newAnchor => {
      navigate(newAnchor);
    },
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 32px 64px' }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>useAnchorObserver</h2>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Syncs scroll position with navigation. Click a nav item or scroll the page — the active section updates
        automatically.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <nav
          style={{
            flexShrink: 0,
            width: 140,
            position: 'sticky',
            top: 64,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {SECTIONS.map(section => {
            const isActive = focusedAnchor === section.id;
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.id)}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : '#6b7280',
                  background: isActive ? section.color : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {section.label}
              </button>
            );
          })}

          <div
            style={{
              marginTop: 12,
              padding: '8px 14px',
              background: '#f9fafb',
              borderRadius: 8,
              fontSize: 11,
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            <div>anchor:</div>
            <strong style={{ color: '#374151', wordBreak: 'break-all' }}>
              {focusedAnchor?.replace('/anchor-observer', '') || '/'}
            </strong>
          </div>
        </nav>

        <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SECTIONS.map(section => (
            <div
              key={section.id}
              style={{
                minHeight: '85vh',
                padding: 32,
                marginBottom: 2,
                borderRadius: 12,
                border: '1px solid #e5e5e5',
                background: '#fff',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: 4,
                  height: 24,
                  background: section.color,
                  borderRadius: 2,
                  marginRight: 12,
                  verticalAlign: 'middle',
                }}
              />
              <h3 style={{ display: 'inline', fontSize: 18, verticalAlign: 'middle' }}>{section.label}</h3>
              <p style={{ marginTop: 16, color: '#6b7280', fontSize: 14, lineHeight: 1.75 }}>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
