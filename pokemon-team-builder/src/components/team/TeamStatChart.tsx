import type { Team, PokemonStats } from '../../types/pokemon';
import { StatRadarChart } from '../lookup/StatRadarChart';

interface TeamStatChartProps {
  team: Team;
}

function averageStats(team: Team): PokemonStats | null {
  const filled = team.filter(Boolean) as NonNullable<Team[number]>[];
  if (filled.length === 0) return null;

  const sum = filled.reduce(
    (acc, p) => ({
      hp:             acc.hp + p.stats.hp,
      attack:         acc.attack + p.stats.attack,
      defense:        acc.defense + p.stats.defense,
      specialAttack:  acc.specialAttack + p.stats.specialAttack,
      specialDefense: acc.specialDefense + p.stats.specialDefense,
      speed:          acc.speed + p.stats.speed,
    }),
    { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
  );

  const n = filled.length;
  return {
    hp:             Math.round(sum.hp / n),
    attack:         Math.round(sum.attack / n),
    defense:        Math.round(sum.defense / n),
    specialAttack:  Math.round(sum.specialAttack / n),
    specialDefense: Math.round(sum.specialDefense / n),
    speed:          Math.round(sum.speed / n),
  };
}

export function TeamStatChart({ team }: TeamStatChartProps) {
  const avg = averageStats(team);
  if (!avg) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 w-full transition-colors duration-200">
      <h3 className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        Team Average Stats
      </h3>
      <StatRadarChart stats={avg} color="#f59e0b" />
      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        {(Object.entries(avg) as [keyof PokemonStats, number][]).map(([key, val]) => (
          <div key={key}>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{val}</span>{' '}
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
