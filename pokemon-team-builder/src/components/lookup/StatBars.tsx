import type { SlimCreature } from '../../types/pokemon';

const STAT_ORDER = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;
type StatKey = typeof STAT_ORDER[number];

const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SPA',
  specialDefense: 'SPD',
  speed: 'SPE',
};

const STAT_COLORS: Record<StatKey, string> = {
  hp: 'var(--stat-hp)',
  attack: 'var(--stat-atk)',
  defense: 'var(--stat-def)',
  specialAttack: 'var(--stat-spa)',
  specialDefense: 'var(--stat-spd)',
  speed: 'var(--stat-spe)',
};

function tier(v: number): string {
  if (v >= 130) return 'S';
  if (v >= 100) return 'A';
  if (v >= 80) return 'B';
  if (v >= 60) return 'C';
  return 'D';
}

export function StatBars({ stats }: { stats: SlimCreature['stats'] }) {
  const total = STAT_ORDER.reduce((s, k) => s + stats[k], 0);
  return (
    <div className="stat-bars">
      {STAT_ORDER.map((k) => {
        const v = stats[k];
        const pct = Math.min(100, (v / 200) * 100);
        return (
          <div key={k} className="stat-row">
            <div className="stat-name">{STAT_LABELS[k]}</div>
            <div className="stat-val">{v}</div>
            <div className="stat-track">
              <div className="stat-fill" style={{ width: `${pct}%`, background: STAT_COLORS[k] }} />
            </div>
            <div className="stat-tier">{tier(v)}</div>
          </div>
        );
      })}
      <div className="stat-total">
        <span>BST</span>
        <span className="v">{total}</span>
      </div>
    </div>
  );
}
