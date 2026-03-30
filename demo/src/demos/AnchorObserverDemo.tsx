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

const ANCHOR_IDS = SECTIONS.map(s => s.id);

export function AnchorObserverDemo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentAnchor = ANCHOR_IDS.includes(pathname) ? pathname : ANCHOR_IDS[0];

  const { ref, focusedAnchor } = useAnchorObserver<HTMLDivElement>({
    anchors: ANCHOR_IDS,
    currentAnchor,
    onAnchorChange: newAnchor => {
      navigate(newAnchor);
    },
  });

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>useAnchorObserver</h2>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Syncs scroll position with navigation. Click a nav item or scroll the content — the active section updates
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
        </nav>

        <div
          ref={ref}
          style={{
            flex: 1,
            height: 420,
            overflowY: 'auto',
            borderRadius: 12,
            border: '1px solid #e5e5e5',
            background: '#fff',
          }}
        >
          {SECTIONS.map(section => (
            <div key={section.id} style={{ minHeight: 240, padding: 32, borderBottom: '1px solid #f0f0f0' }}>
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

      <div
        style={{
          marginTop: 16,
          padding: '10px 16px',
          background: '#f9fafb',
          borderRadius: 8,
          fontSize: 13,
          color: '#6b7280',
        }}
      >
        Current anchor: <strong style={{ color: '#111' }}>{focusedAnchor ?? '—'}</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp; State: <strong style={{ color: '#111' }}>{currentAnchor}</strong>
      </div>
    </div>
  );
}
