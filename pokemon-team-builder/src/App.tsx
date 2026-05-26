import { lazy, Suspense, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useDexStore } from './store/dexStore';
import { useToastStore } from './store/toastStore';
import { Navbar } from './components/layout/Navbar';

const LookupPage = lazy(() => import('./pages/LookupPage').then((m) => ({ default: m.LookupPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then((m) => ({ default: m.DetailPage })));
const TeamPage   = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const MovesPage  = lazy(() => import('./pages/MovesPage').then((m) => ({ default: m.MovesPage })));

function BootScreen() {
  const progress = useDexStore((s) => s.progress);
  const error = useDexStore((s) => s.error);
  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  return (
    <div className="boot-screen" role="status">
      <div>
        <div className="boot-mark" aria-hidden="true">D</div>
        <h2>Pokémon Look Up</h2>
        <div className="boot-sub" aria-hidden="true">// loading dex from pokeapi.co</div>
        <div className="boot-progress" aria-hidden="true">
          <div className="bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-num" aria-hidden="true">
          {progress.done} / {progress.total}
          {error && <span style={{ color: 'var(--accent-hot)' }}> · error: {error}</span>}
        </div>
        <span className="sr-only" aria-live="polite">
          {error
            ? `Error loading Pokédex: ${error}`
            : progress.total > 0
            ? `Loading Pokédex: ${progress.done} of ${progress.total}`
            : 'Loading Pokédex…'}
        </span>
      </div>
    </div>
  );
}

function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="toast-wrap" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="dot" />
          <span>{t.text}</span>
          {t.action && (
            <button
              className="toast-action"
              onClick={() => { t.action!.fn(); dismiss(t.id); }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function KeyboardNav() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '1') navigate('/');
      else if (e.key === '2') navigate('/team');
      else if (e.key === '3') navigate('/codex');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  return null;
}

export default function App() {
  const booted = useDexStore((s) => s.booted);
  const boot = useDexStore((s) => s.boot);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      boot();
    }
  }, [boot]);

  if (!booted) {
    return (
      <>
        <BootScreen />
        <ToastHost />
      </>
    );
  }

  return (
    <HashRouter>
      <KeyboardNav />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="app">
        <Navbar />
        <main id="main-content">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LookupPage />} />
              <Route path="/detail/:id" element={<DetailPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/codex" element={<MovesPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastHost />
    </HashRouter>
  );
}
