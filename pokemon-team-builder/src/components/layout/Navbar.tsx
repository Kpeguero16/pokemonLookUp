import { NavLink } from 'react-router-dom';
import { useTeamStore } from '../../store/teamStore';
import { useThemeStore } from '../../store/themeStore';

export function Navbar() {
  const team = useTeamStore((s) => s.team);
  const teamCount = team.filter(Boolean).length;
  const { isDark, toggleDark } = useThemeStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl font-semibold transition-colors ${
      isActive
        ? 'bg-indigo-500 text-white'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
    }`;

  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          🔴 PokéTeam
        </span>

        <div className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            Lookup
          </NavLink>
          <NavLink to="/team" className={linkClass}>
            My Team
            {teamCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-amber-400 text-white rounded-full">
                {teamCount}
              </span>
            )}
          </NavLink>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-1 w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
