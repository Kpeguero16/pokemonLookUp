import { useRichTeamAnalysis } from '../../hooks/useTeamAnalysis';
import { ALL_TYPES } from '../../constants/typeChart';
import { TYPE_HEX } from '../../constants/typeColors';
import { Sprite } from '../lookup/Sprite';
const STAT_KEYS = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;
const STAT_DISPLAY: Record<typeof STAT_KEYS[number], { short: string; color: string }> = {
  hp:             { short: 'HP',  color: 'var(--stat-hp)' },
  attack:         { short: 'ATK', color: 'var(--stat-atk)' },
  defense:        { short: 'DEF', color: 'var(--stat-def)' },
  specialAttack:  { short: 'SPA', color: 'var(--stat-spa)' },
  specialDefense: { short: 'SPD', color: 'var(--stat-spd)' },
  speed:          { short: 'SPE', color: 'var(--stat-spe)' },
};

export function Analysis() {
  const { offensiveCoverage, defensiveExposure, roles, statTotals, speedTiers, synergyNotes } = useRichTeamAnalysis();

  return (
    <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
      <div className="analysis">
        <div className="panel">
          <h4>
            Offensive coverage{' '}
            <span style={{ color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0, textTransform: 'none', marginLeft: 8 }}>
              (if all team had STAB)
            </span>
          </h4>
          <div className="coverage">
            {ALL_TYPES.map((t) => {
              const c = offensiveCoverage[t];
              const sev = c.maxMult >= 2 ? 'cold' : c.maxMult >= 1 ? 'cool' : 'warm';
              return (
                <div key={t} className="cov-cell" data-sev={sev} title={`Best multiplier: ${c.maxMult}× against ${t}`}>
                  <span className="ct" style={{ color: TYPE_HEX[t] }}>{t.slice(0, 3)}</span>
                  <span className="cv">{c.maxMult}×</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
            ☼ Types you hit 0×:{' '}
            <span style={{ color: 'var(--accent-hot)' }}>
              {ALL_TYPES.filter((t) => offensiveCoverage[t].maxMult === 0).join(', ') || 'none'}
            </span>
          </div>
        </div>

        <div className="panel">
          <h4>
            Defensive exposure{' '}
            <span style={{ color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0, textTransform: 'none', marginLeft: 8 }}>
              (team weakness count)
            </span>
          </h4>
          <div className="coverage">
            {ALL_TYPES.map((t) => {
              const exposure = defensiveExposure[t];
              const net = exposure.weak - exposure.resist - exposure.immune;
              const sev = net >= 3 ? 'hot' : net >= 1 ? 'warm' : net <= -2 ? 'cold' : 'cool';
              return (
                <div
                  key={t}
                  className="cov-cell"
                  data-sev={sev}
                  title={`${exposure.weak} weak / ${exposure.resist} resist / ${exposure.immune} immune`}
                >
                  <span className="ct" style={{ color: TYPE_HEX[t] }}>{t.slice(0, 3)}</span>
                  <span className="cv">
                    {exposure.weak > 0 && <span style={{ color: 'var(--accent-hot)' }}>{exposure.weak}w</span>}
                    {exposure.weak > 0 && (exposure.resist > 0 || exposure.immune > 0) && ' '}
                    {(exposure.resist > 0 || exposure.immune > 0) && (
                      <span style={{ color: 'var(--stat-hp)' }}>{exposure.resist + exposure.immune}r</span>
                    )}
                    {exposure.weak === 0 && exposure.resist === 0 && exposure.immune === 0 && '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="analysis">
        <div className="panel">
          <h4>Role distribution</h4>
          <div className="role-grid">
            {([
              ['physical', 'Phys. attacker'],
              ['special',  'Spec. attacker'],
              ['wall',     'Wall'],
              ['balanced', 'Balanced'],
            ] as const).map(([k, label]) => (
              <div key={k} className="role-card">
                <div className="rv">{roles[k]}</div>
                <div className="rl">{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="filter-label" style={{ marginBottom: 8 }}>Average team stats</div>
            <div className="stat-totals-bars">
              {STAT_KEYS.map((k) => {
                const v = statTotals[k];
                const pct = Math.min(100, (v / 150) * 100);
                return (
                  <div key={k} className="stt-row">
                    <span className="nm">{STAT_DISPLAY[k].short}</span>
                    <span className="tr">
                      <span className="fl" style={{ width: `${pct}%`, background: STAT_DISPLAY[k].color }} />
                    </span>
                    <span className="vl">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel">
          <h4>Speed tier chart</h4>
          {speedTiers.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>—</div>
          ) : (
            <>
              <div className="speed-chart">
                {speedTiers.map((s) => {
                  const pct = Math.min(100, (s.speed / 180) * 100);
                  return (
                    <div key={s.id} className="speed-row">
                      <Sprite id={s.id} kind="pixel" />
                      <span className="sr-name">{s.name.replace(/-/g, ' ')}</span>
                      <div>
                        <div className="speed-row-mobile-label">{s.name.replace(/-/g, ' ')}</div>
                        <span className="sr-track">
                          <span className="sr-fill" style={{ width: `${pct}%` }} />
                        </span>
                      </div>
                      <span className="sr-val">{s.speed}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="panel">
        <h4>
          Synergy &amp; coaching notes{' '}
          <span className="badge">AUTO</span>
        </h4>
        <div className="synergy-list">
          {synergyNotes.length === 0 ? (
            <div className="empty-state" style={{ padding: '12px 0' }}>Add a Pokémon to start analysis.</div>
          ) : synergyNotes.map((tip) => (
            <div key={tip.title} className={`synergy-item ${tip.kind}`}>
              <div className="si-icon">{tip.kind === 'warn' ? '!' : tip.kind === 'good' ? '✓' : '?'}</div>
              <div className="si-body">
                <div className="si-title">{tip.title}</div>
                <div className="si-desc">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

