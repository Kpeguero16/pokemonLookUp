import { useMemo } from 'react';
import { useTeamStore } from '../store/teamStore';
import { TYPE_CHART, ALL_TYPES } from '../constants/typeChart';
import type { Team, TeamAnalysis, PokemonTypeName } from '../types/pokemon';

/**
 * Pure function — no React hooks. Easy to test in isolation.
 * Computes offensive coverage and defensive exposure for a team.
 */
export function computeAnalysis(team: Team): TeamAnalysis {
  const filledSlots = team.filter(Boolean) as NonNullable<Team[number]>[];

  // Initialize with zeros
  const offensiveCoverage = Object.fromEntries(
    ALL_TYPES.map((t) => [t, 0])
  ) as Record<PokemonTypeName, number>;

  const defensiveExposure = Object.fromEntries(
    ALL_TYPES.map((t) => [t, 0])
  ) as Record<PokemonTypeName, number>;

  if (filledSlots.length === 0) return { offensiveCoverage, defensiveExposure };

  // Offensive coverage: for each defending type D,
  // find the MAX effectiveness any of our Pokemon's types can deal to D
  for (const defendingType of ALL_TYPES) {
    let maxEffectiveness = 0;
    for (const pokemon of filledSlots) {
      for (const attackingType of pokemon.types) {
        const effectiveness = TYPE_CHART[attackingType][defendingType];
        if (effectiveness > maxEffectiveness) maxEffectiveness = effectiveness;
      }
    }
    offensiveCoverage[defendingType] = maxEffectiveness;
  }

  // Defensive exposure: for each attacking type A,
  // compute each Pokemon's received multiplier (considering dual types)
  // and average across the filled team
  for (const attackingType of ALL_TYPES) {
    let totalMultiplier = 0;
    for (const pokemon of filledSlots) {
      let multiplier = TYPE_CHART[attackingType][pokemon.types[0]];
      if (pokemon.types[1]) {
        multiplier *= TYPE_CHART[attackingType][pokemon.types[1]];
      }
      totalMultiplier += multiplier;
    }
    defensiveExposure[attackingType] = totalMultiplier / filledSlots.length;
  }

  return { offensiveCoverage, defensiveExposure };
}

/** React hook — reads team from Zustand and memoizes the analysis */
export function useTeamAnalysis(): TeamAnalysis {
  const team = useTeamStore((s) => s.team);
  return useMemo(() => computeAnalysis(team), [team]);
}
