import { useState } from 'react';
import { WasScrolledDemo } from './demos/WasScrolledDemo';
import { VisibleDemo } from './demos/VisibleDemo';
import { AnchorObserverDemo } from './demos/AnchorObserverDemo';

const TABS = [
  { id: 'anchorObserver', label: 'useAnchorObserver', component: AnchorObserverDemo },
  { id: 'wasScrolled', label: 'useWasScrolled', component: WasScrolledDemo },
  { id: 'visible', label: 'useVisible', component: VisibleDemo },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('anchorObserver');

  const ActiveDemo = TABS.find(t => t.id === activeTab)!.component;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          gap: 4,
          padding: '0 24px',
        }}
      >
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
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#111' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #111' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1 }}>
        <ActiveDemo />
      </main>
    </div>
  );
}
