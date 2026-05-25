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
import { ALL_TYPES } from '../../constants/typeChart';

/** Color-code a bar by effectiveness multiplier */
function offensiveColor(multiplier: number): string {
  if (multiplier === 0)    return '#94a3b8'; // immune — gray
  if (multiplier <= 0.5)   return '#fbbf24'; // not very effective — yellow
  if (multiplier === 1)    return '#e2e8f0'; // normal — light
  if (multiplier === 2)    return '#34d399'; // super effective — green
  return '#059669';                          // 4x — dark green (dual-type)
}

function defensiveColor(multiplier: number): string {
  if (multiplier === 0)    return '#34d399'; // immune — green (good!)
  if (multiplier <= 0.5)   return '#86efac'; // resistant — light green
  if (multiplier <= 1)     return '#e2e8f0'; // neutral — light
  if (multiplier <= 2)     return '#fca5a5'; // weak — light red
  return '#ef4444';                          // very weak — red
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
}: {
  data: ChartEntry[];
  colorFn: (v: number) => string;
  referenceValue: number;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 w-full">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
      <p className="text-xs text-slate-400 mb-3">{description}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 40, left: -20 }}>
          <XAxis
            dataKey="type"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            formatter={(v) => [`${v}×`, 'Multiplier']}
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          />
          <ReferenceLine y={referenceValue} stroke="#94a3b8" strokeDasharray="4 2" />
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
      />
      <CoverageChart
        data={defensiveData}
        colorFn={defensiveColor}
        referenceValue={1}
        title="Defensive Weaknesses"
        description="Avg. damage multiplier your team receives from each attacking type"
      />
    </div>
  );
}
