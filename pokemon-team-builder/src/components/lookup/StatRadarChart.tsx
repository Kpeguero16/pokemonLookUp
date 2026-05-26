import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PokemonStats } from '../../types/pokemon';
import { useThemeStore } from '../../store/themeStore';

interface StatRadarChartProps {
  stats: PokemonStats;
  color?: string;
}

const STAT_LABELS: { key: keyof PokemonStats; label: string }[] = [
  { key: 'hp',             label: 'HP' },
  { key: 'attack',         label: 'Atk' },
  { key: 'defense',        label: 'Def' },
  { key: 'specialAttack',  label: 'Sp.Atk' },
  { key: 'specialDefense', label: 'Sp.Def' },
  { key: 'speed',          label: 'Speed' },
];

export function StatRadarChart({ stats, color = '#6366f1' }: StatRadarChartProps) {
  const isDark = useThemeStore((s) => s.isDark);

  const data = STAT_LABELS.map(({ key, label }) => ({
    stat: label,
    value: stats[key],
    fullMark: 255,
  }));

  const gridColor   = isDark ? '#334155' : '#e2e8f0';
  const labelColor  = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg   = isDark ? '#1e293b' : '#ffffff';
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fontSize: 12, fill: labelColor, fontWeight: 600 }}
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
          contentStyle={{
            borderRadius: '8px',
            fontSize: '13px',
            backgroundColor: tooltipBg,
            color: tooltipText,
            border: `1px solid ${tooltipBorder}`,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
