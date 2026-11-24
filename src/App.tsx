import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { PathfindingView } from './views/PathfindingView';
import { SortingView } from './views/SortingView';

type Tab = 'path' | 'sort';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'path', label: 'Pathfinding', icon: '🧭' },
  { id: 'sort', label: 'Sorting', icon: '📊' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>(() => (location.hash === '#sort' ? 'sort' : 'path'));
  const theme = useTheme();

  const switchTab = (t: Tab) => {
    setTab(t);
    history.replaceState(null, '', t === 'sort' ? '#sort' : '#path');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <h1>
            Algorithm Playground
          </h1>
        </div>

        <nav className="tabs" aria-label="Choose a visualiser">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="tab" aria-pressed={tab === t.id} onClick={() => switchTab(t.id)}>
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="topbar-end">
          <span className="kbd-hint">
            <kbd>Space</kbd> play/pause <kbd>←</kbd>
            <kbd>→</kbd> step
          </span>
          <button
            type="button"
            onClick={theme.toggle}
            className="icon-btn"
            title={theme.dark ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle colour scheme"
          >
            {theme.dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main">{tab === 'path' ? <PathfindingView /> : <SortingView />}</main>
    </div>
  );
}
