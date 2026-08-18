import { useMemo } from 'react';
import { useDexStore } from '../store/dexStore';
import { useTeamStore } from '../store/teamStore';
import type { SlimCreature, Team } from '../types/pokemon';

function resolveSlot(
  id: number | null,
  slotIndex: number,
  creatures: SlimCreature[],
  teamFormData: Record<number, SlimCreature>
): SlimCreature | null {
  if (id === null) return null;
  return teamFormData[slotIndex] ?? creatures.find((c) => c.id === id) ?? null;
}

/** The team's filled members only, in slot order — for analysis/export, where empty slots are irrelevant. */
export function useTeam(): SlimCreature[] {
  const creatures = useDexStore((s) => s.creatures);
  const teamIds = useTeamStore((s) => s.teamIds);
  const teamFormData = useTeamStore((s) => s.teamFormData);
  return useMemo(
    () =>
      teamIds
        .map((id, slotIndex) => resolveSlot(id, slotIndex, creatures, teamFormData))
        .filter((c): c is SlimCreature => c !== null),
    [creatures, teamIds, teamFormData]
  );
}

/** All 6 team slots in literal position order, with `null` for empty slots — for slot-positional display. */
export function useTeamSlots(): Team {
  const creatures = useDexStore((s) => s.creatures);
  const teamIds = useTeamStore((s) => s.teamIds);
  const teamFormData = useTeamStore((s) => s.teamFormData);
  return useMemo(
    () => teamIds.map((id, slotIndex) => resolveSlot(id, slotIndex, creatures, teamFormData)) as Team,
    [creatures, teamIds, teamFormData]
  );
}
