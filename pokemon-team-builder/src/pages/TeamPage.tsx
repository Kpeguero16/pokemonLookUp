import { Link } from 'react-router-dom';
import { useTeamStore } from '../store/teamStore';
import { TeamGrid } from '../components/team/TeamGrid';
import { TeamStatChart } from '../components/team/TeamStatChart';
import { TypeCoveragePanel } from '../components/team/TypeCoveragePanel';

export function TeamPage() {
  const team = useTeamStore((s) => s.team);
  const teamCount = team.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">My Team</h1>
        <p className="text-slate-400 dark:text-slate-500 mt-1">Build your team and analyze its strengths</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        <TeamGrid team={team} />

        {teamCount === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <p className="text-5xl mb-3">🎯</p>
            <p className="font-medium">Your team is empty.</p>
            <Link
              to="/"
              className="inline-block mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Search for Pokémon →
            </Link>
          </div>
        )}

        {teamCount > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-3">Team Analysis</h2>
            <div className="flex flex-col gap-4">
              <TeamStatChart team={team} />
              <TypeCoveragePanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
