import { useMemo } from 'react';
import { useDexStore } from '../store/dexStore';
import { useTeamStore } from '../store/teamStore';
import type { SlimCreature } from '../types/pokemon';

export function useTeam(): SlimCreature[] {
  const creatures = useDexStore((s) => s.creatures);
  const teamIds = useTeamStore((s) => s.teamIds);
  return useMemo(
    () => teamIds.map((id) => creatures.find((c) => c.id === id)).filter(Boolean) as SlimCreature[],
    [creatures, teamIds]
  );
}
