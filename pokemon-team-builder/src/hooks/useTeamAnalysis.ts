import { useMemo } from 'react';
import { useTeam } from './useTeam';
import { TYPE_CHART, ALL_TYPES } from '../constants/typeChart';
import type { PokemonTypeName, SlimCreature } from '../types/pokemon';

export interface SynergyNote {
  kind: 'warn' | 'good' | 'tip';
  title: string;
  desc: string;
}

export interface RichTeamAnalysis {
  offensiveCoverage: Record<PokemonTypeName, { maxMult: number }>;
  defensiveExposure: Record<PokemonTypeName, { weak: number; resist: number; immune: number }>;
  roles: { physical: number; special: number; wall: number; balanced: number };
  statTotals: Record<keyof SlimCreature['stats'], number>;
  speedTiers: { id: number; name: string; speed: number }[];
  synergyNotes: SynergyNote[];
}

function defensiveProfile(types: PokemonTypeName[]): Record<PokemonTypeName, number> {
  const result = {} as Record<PokemonTypeName, number>;
  for (const atk of ALL_TYPES) {
    let mult = 1;
    for (const def of types) {
      mult *= TYPE_CHART[atk][def];
    }
    result[atk] = mult;
  }
  return result;
}

export function defensiveProfileExport(types: PokemonTypeName[]) {
  return defensiveProfile(types);
}

function computeOffensiveCoverage(
  team: SlimCreature[]
): Record<PokemonTypeName, { maxMult: number }> {
  const out = {} as Record<PokemonTypeName, { maxMult: number }>;
  for (const def of ALL_TYPES) {
    let maxMult = 0;
    for (const c of team) {
      for (const atk of c.types) {
        const m = TYPE_CHART[atk][def];
        if (m > maxMult) maxMult = m;
      }
    }
    out[def] = { maxMult };
  }
  return out;
}

function computeDefensiveExposure(
  team: SlimCreature[]
): Record<PokemonTypeName, { weak: number; resist: number; immune: number }> {
  const out = {} as Record<PokemonTypeName, { weak: number; resist: number; immune: number }>;
  for (const atk of ALL_TYPES) {
    let weak = 0, resist = 0, immune = 0;
    for (const c of team) {
      const m = defensiveProfile(c.types)[atk];
      if (m === 0) immune++;
      else if (m < 1) resist++;
      else if (m > 1) weak++;
    }
    out[atk] = { weak, resist, immune };
  }
  return out;
}

function computeRoles(team: SlimCreature[]) {
  const counts = { physical: 0, special: 0, wall: 0, balanced: 0 };
  for (const c of team) {
    const atk = c.stats.attack;
    const spa = c.stats.specialAttack;
    const dfs = c.stats.defense + c.stats.specialDefense + c.stats.hp;
    if (dfs >= 280 && Math.max(atk, spa) < 100) counts.wall++;
    else if (atk > spa + 15 && atk >= 90) counts.physical++;
    else if (spa > atk + 15 && spa >= 90) counts.special++;
    else counts.balanced++;
  }
  return counts;
}

function computeStatTotals(team: SlimCreature[]): Record<keyof SlimCreature['stats'], number> {
  const keys = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;
  const out = {} as Record<keyof SlimCreature['stats'], number>;
  for (const k of keys) {
    out[k] = team.length === 0 ? 0 : Math.round(team.reduce((s, c) => s + c.stats[k], 0) / team.length);
  }
  return out;
}

function suggestResist(type: string): string {
  const map: Record<string, string> = {
    fire: 'Water- or Rock-type', water: 'Grass- or Dragon-type', electric: 'Ground-type',
    grass: 'Fire- or Flying-type', ice: 'Steel- or Fire-type', fighting: 'Psychic- or Fairy-type',
    poison: 'Steel- or Poison-type', ground: 'Flying-type', flying: 'Rock- or Electric-type',
    psychic: 'Dark- or Steel-type', bug: 'Fire- or Steel-type', rock: 'Fighting- or Ground-type',
    ghost: 'Dark- or Normal-type', dragon: 'Fairy-type', dark: 'Fighting- or Fairy-type',
    steel: 'Fire- or Ground-type', fairy: 'Steel- or Poison-type', normal: 'Rock- or Steel-type',
  };
  return map[type] || 'resistant pivot';
}

function computeSynergyNotes(
  team: SlimCreature[],
  off: Record<PokemonTypeName, { maxMult: number }>,
  def: Record<PokemonTypeName, { weak: number; resist: number; immune: number }>
): SynergyNote[] {
  const tips: SynergyNote[] = [];
  if (team.length === 0) return tips;

  for (const c of team) {
    const profile = defensiveProfile(c.types);
    const x4 = ALL_TYPES.filter((t) => profile[t] === 4);
    if (x4.length > 0) {
      tips.push({
        kind: 'warn',
        title: `${c.name.replace(/-/g, ' ')} is 4× weak to ${x4.join(', ')}`,
        desc: `Make sure another member resists or is immune to ${x4.join(' / ')} so you have a safe pivot.`,
      });
    }
  }

  for (const [type, exposure] of Object.entries(def) as [PokemonTypeName, { weak: number; resist: number; immune: number }][]) {
    if (exposure.weak >= 3 && exposure.weak - exposure.resist - exposure.immune >= 2) {
      tips.push({
        kind: 'warn',
        title: `Stacked weakness: ${type} (${exposure.weak} members)`,
        desc: `Three or more of your team take super-effective ${type} damage. Consider swapping in a ${suggestResist(type)}.`,
      });
    }
  }

  const uncovered = ALL_TYPES.filter((t) => off[t].maxMult < 2);
  if (uncovered.length > 6) {
    tips.push({ kind: 'warn', title: `Offensive coverage gap (${uncovered.length} types)`, desc: `Through STAB alone you can't hit ${uncovered.length} types super-effectively.` });
  } else if (uncovered.length <= 3 && team.length >= 4) {
    tips.push({ kind: 'good', title: 'Strong STAB coverage', desc: `Only ${uncovered.length} type(s) not hit super-effectively by STAB. Solid offensive shape.` });
  }

  const speeds = team.map((c) => c.stats.speed).sort((a, b) => b - a);
  if (team.length >= 4 && speeds.filter((s) => s >= 100).length === 0) {
    tips.push({ kind: 'tip', title: 'No fast threats', desc: "Nothing hits the 100+ speed tier. You'll struggle to revenge-kill without priority or Trick Room." });
  }
  if (team.length >= 4 && speeds.filter((s) => s <= 60).length >= 4) {
    tips.push({ kind: 'tip', title: 'Trick Room candidate', desc: `${speeds.filter((s) => s <= 60).length} of ${team.length} members are 60 speed or below. Lean into Trick Room strategies.` });
  }

  const roles = computeRoles(team);
  if (team.length >= 5) {
    if (roles.wall === 0) tips.push({ kind: 'tip', title: 'No dedicated wall', desc: 'Add a bulky pivot to absorb hits in unfavorable matchups.' });
    if (roles.physical === 0 && roles.special >= 4) tips.push({ kind: 'tip', title: 'Special-heavy team', desc: 'Strong special walls will be a problem — consider a physical breaker.' });
    if (roles.special === 0 && roles.physical >= 4) tips.push({ kind: 'tip', title: 'Physical-heavy team', desc: 'Physical walls and Intimidate users will lock down your sweepers — consider a special attacker.' });
  }

  const stabCount: Record<string, number> = {};
  for (const c of team) for (const t of c.types) stabCount[t] = (stabCount[t] || 0) + 1;
  for (const [t, n] of Object.entries(stabCount)) {
    if (n >= 3) tips.push({ kind: 'tip', title: `${n}× ${t}-type STAB redundancy`, desc: `${n} members share ${t} STAB — diversify for broader coverage.` });
  }

  const safeCount = Object.values(def).filter((v) => v.resist + v.immune > v.weak).length;
  if (team.length === 6 && safeCount >= 12) {
    tips.push({ kind: 'good', title: 'Resilient defensive core', desc: `Team resists more than it's weak to across ${safeCount}/18 types. Good defensive backbone.` });
  }

  return tips;
}

export function useRichTeamAnalysis(): RichTeamAnalysis {
  const team = useTeam();
  return useMemo(() => {
    const offCov = computeOffensiveCoverage(team);
    const defCov = computeDefensiveExposure(team);
    return {
      offensiveCoverage: offCov,
      defensiveExposure: defCov,
      roles: computeRoles(team),
      statTotals: computeStatTotals(team),
      speedTiers: [...team].map((c) => ({ id: c.id, name: c.name, speed: c.stats.speed })).sort((a, b) => b.speed - a.speed),
      synergyNotes: computeSynergyNotes(team, offCov, defCov),
    };
  }, [team]);
}

