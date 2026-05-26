import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeamStore } from '../../store/teamStore';
import { useThemeStore } from '../../store/themeStore';

function DexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}
function CodexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function Navbar() {
  const teamCount = useTeamStore((s) => s.teamIds.length);
  const { theme, toggleDark } = useThemeStore();
  const isDark = theme === 'dark';
  const { pathname } = useLocation();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const isDex = pathname === '/' || pathname.startsWith('/detail');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['1', '2', '3'].includes(e.key)) {
        setPressedKey(e.key);
        setTimeout(() => setPressedKey(null), 220);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div className="brand-name">Pokémon Look Up</div>
        <div className="brand-sub">v2.0</div>
      </div>
      <nav className="nav" aria-label="Main navigation">
        <Link className="nav-btn" data-active={isDex} to="/">
          Dex<span className={`kbd${pressedKey === '1' ? ' kbd-press' : ''}`} aria-hidden="true">1</span>
        </Link>
        <Link className="nav-btn" data-active={pathname === '/team'} to="/team">
          Team<span className={`kbd${pressedKey === '2' ? ' kbd-press' : ''}`} aria-hidden="true">2</span>
        </Link>
        <Link className="nav-btn" data-active={pathname === '/codex'} to="/codex" title="Moves & Abilities">
          Codex<span className={`kbd${pressedKey === '3' ? ' kbd-press' : ''}`} aria-hidden="true">3</span>
        </Link>
      </nav>
      <div className="topbar-right">
        <Link className="team-pill" to="/team">
          <span className="dot" />
          <span>TEAM {teamCount}/6</span>
        </Link>
        <button className="icon-btn" onClick={toggleDark} aria-label="Toggle theme">
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
    <nav className="bottom-tabs" aria-label="Main navigation">
      <Link className="bottom-tab" data-active={isDex} to="/" aria-label="Dex">
        <DexIcon />
        Dex
      </Link>
      <Link className="bottom-tab" data-active={pathname === '/team'} to="/team" aria-label="Team">
        <TeamIcon />
        Team
        {teamCount > 0 && (
          <span className="bottom-tab-badge" aria-label={`${teamCount} Pokémon in team`}>{teamCount}</span>
        )}
      </Link>
      <Link className="bottom-tab" data-active={pathname === '/codex'} to="/codex" aria-label="Codex">
        <CodexIcon />
        Codex
      </Link>
    </nav>
    </>
  );
}
