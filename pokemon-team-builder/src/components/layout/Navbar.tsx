import { NavLink } from 'react-router-dom';
import { useTeamStore } from '../../store/teamStore';

export function Navbar() {
  const team = useTeamStore((s) => s.team);
  const teamCount = team.filter(Boolean).length;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl font-semibold transition-colors ${
      isActive
        ? 'bg-indigo-500 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">
          🔴 PokéTeam
        </span>
        <div className="flex gap-2">
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
        </div>
      </div>
    </nav>
  );
}
