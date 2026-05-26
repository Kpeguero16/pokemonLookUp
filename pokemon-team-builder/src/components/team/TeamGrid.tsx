import type { Team } from '../../types/pokemon';
import { TeamSlot } from './TeamSlot';
import { useTeamStore } from '../../store/teamStore';

interface TeamGridProps {
  team: Team;
}

export function TeamGrid({ team }: TeamGridProps) {
  const clearTeam = useTeamStore((s) => s.clearTeam);
  const teamCount = team.filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          Your Team ({teamCount}/6)
        </h2>
        {teamCount > 0 && (
          <button
            onClick={clearTeam}
            className="text-sm text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {team.map((slot, index) => (
          <TeamSlot key={index} pokemon={slot} slotIndex={index} />
        ))}
      </div>
    </div>
  );
}
