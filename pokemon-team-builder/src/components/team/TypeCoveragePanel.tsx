import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useTeamAnalysis } from '../../hooks/useTeamAnalysis';
import { useThemeStore } from '../../store/themeStore';
import { ALL_TYPES } from '../../constants/typeChart';

function offensiveColor(multiplier: number): string {
  if (multiplier === 0)  return '#94a3b8'; // immune — gray
  if (multiplier <= 0.5) return '#fbbf24'; // not very effective — yellow
  if (multiplier === 1)  return '#cbd5e1'; // normal — slate
  if (multiplier === 2)  return '#34d399'; // super effective — green
  return '#059669';                        // 4x — dark green
}

function defensiveColor(multiplier: number): string {
  if (multiplier === 0)  return '#34d399'; // immune — green (good!)
  if (multiplier <= 0.5) return '#86efac'; // resistant — light green
  if (multiplier <= 1)   return '#cbd5e1'; // neutral — slate
  if (multiplier <= 2)   return '#fca5a5'; // weak — light red
  return '#ef4444';                        // very weak — red
}

interface ChartEntry {
  type: string;
  value: number;
}

function CoverageChart({
  data,
  colorFn,
  referenceValue,
  title,
  description,
  isDark,
}: {
  data: ChartEntry[];
  colorFn: (v: number) => string;
  referenceValue: number;
  title: string;
  description: string;
  isDark: boolean;
}) {
  const axisColor     = isDark ? '#64748b' : '#94a3b8';
  const refColor      = isDark ? '#475569' : '#94a3b8';
  const tooltipBg     = isDark ? '#1e293b' : '#ffffff';
  const tooltipText   = isDark ? '#e2e8f0' : '#1e293b';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 w-full transition-colors duration-200">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{description}</p>
      {/* Taller chart + more bottom room for angled labels; left:0 prevents y-axis clipping on narrow screens */}
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 60, left: 0 }}>
          <XAxis
            dataKey="type"
            tick={{ fontSize: 10, fill: axisColor }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: axisColor }}
            width={28}
          />
          <Tooltip
            formatter={(v) => [`${v}×`, 'Multiplier']}
            contentStyle={{
              borderRadius: '8px',
              fontSize: '12px',
              backgroundColor: tooltipBg,
              color: tooltipText,
              border: `1px solid ${tooltipBorder}`,
            }}
          />
          <ReferenceLine y={referenceValue} stroke={refColor} strokeDasharray="4 2" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.type} fill={colorFn(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TypeCoveragePanel() {
  const { offensiveCoverage, defensiveExposure } = useTeamAnalysis();
  const isDark = useThemeStore((s) => s.isDark);

  const offensiveData: ChartEntry[] = ALL_TYPES.map((type) => ({
    type,
    value: offensiveCoverage[type],
  }));

  const defensiveData: ChartEntry[] = ALL_TYPES.map((type) => ({
    type,
    value: Number(defensiveExposure[type].toFixed(2)),
  }));

  return (
    <div className="flex flex-col gap-4 w-full">
      <CoverageChart
        data={offensiveData}
        colorFn={offensiveColor}
        referenceValue={1}
        title="Offensive Coverage"
        description="Best hit your team can land on each type (using Pokémon's own types)"
        isDark={isDark}
      />
      <CoverageChart
        data={defensiveData}
        colorFn={defensiveColor}
        referenceValue={1}
        title="Defensive Weaknesses"
        description="Avg. damage multiplier your team receives from each attacking type"
        isDark={isDark}
      />
    </div>
  );
}
