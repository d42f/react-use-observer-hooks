import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { WasScrolledDemo } from './demos/WasScrolledDemo';
import { VisibleDemo } from './demos/VisibleDemo';
import { AnchorObserverDemo } from './demos/AnchorObserverDemo';

const TABS = [
  {
    path: 'anchor-observer',
    routePath: 'anchor-observer/*',
    label: 'useAnchorObserver',
    component: AnchorObserverDemo,
  },
  { path: 'was-scrolled', routePath: 'was-scrolled', label: 'useWasScrolled', component: WasScrolledDemo },
  { path: 'visible', routePath: 'visible', label: 'useVisible', component: VisibleDemo },
] as const;

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: 4, padding: '0 24px' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            demo
          </span>
          {TABS.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              style={({ isActive }) => ({
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#111' : '#6b7280',
                borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
                transition: 'color 0.15s',
                textDecoration: 'none',
              })}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route index element={<Navigate to={TABS[0].path} replace />} />
          {TABS.map(tab => (
            <Route key={tab.path} path={tab.routePath} element={<tab.component />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
