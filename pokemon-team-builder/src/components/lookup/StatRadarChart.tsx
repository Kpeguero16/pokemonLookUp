import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PokemonStats } from '../../types/pokemon';

interface StatRadarChartProps {
  stats: PokemonStats;
  color?: string;
}

const STAT_LABELS: { key: keyof PokemonStats; label: string }[] = [
  { key: 'hp',           label: 'HP' },
  { key: 'attack',       label: 'Atk' },
  { key: 'defense',      label: 'Def' },
  { key: 'specialAttack',  label: 'Sp.Atk' },
  { key: 'specialDefense', label: 'Sp.Def' },
  { key: 'speed',        label: 'Speed' },
];

export function StatRadarChart({ stats, color = '#6366f1' }: StatRadarChartProps) {
  const data = STAT_LABELS.map(({ key, label }) => ({
    stat: label,
    value: stats[key],
    fullMark: 255,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
        />
        <Radar
          name="Stats"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [value, 'Base Stat']}
          contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
