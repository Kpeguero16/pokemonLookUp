import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SlimCreature } from '../types/pokemon';

interface TeamStore {
  teamIds: number[];
  /** Maps slot index → selected form API name (e.g. 0 → "rattata-alola"). Used for Showdown export. */
  teamForms: Record<number, string>;
  /** Maps slot index → the resolved form SlimCreature. Avoids re-fetching on reload. */
  teamFormData: Record<number, SlimCreature>;
  teamName: string;
  addSlot: (id: number) => void;
  removeSlot: (slotIndex: number) => void;
  clearTeam: () => void;
  setTeamIds: (ids: number[]) => void;
  randomizeIds: (allIds: number[]) => void;
  setTeamName: (name: string) => void;
  /** Set the active form for a slot (also stores the resolved SlimCreature) */
  setForm: (slotIndex: number, formName: string, formCreature: SlimCreature) => void;
  /** Remove form override for a slot (revert to base form) */
  clearForm: (slotIndex: number) => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      teamIds: [],
      teamForms: {},
      teamFormData: {},
      teamName: 'Untitled Squad',

      addSlot: (id) =>
        set((state) => {
          if (state.teamIds.length >= 6) return state;
          return { teamIds: [...state.teamIds, id] };
        }),

      removeSlot: (slotIndex) =>
        set((state) => {
          const { [slotIndex]: _f, ...restForms } = state.teamForms;
          const { [slotIndex]: _d, ...restData } = state.teamFormData;
          const nextIds = state.teamIds.filter((_, i) => i !== slotIndex);

          // Re-index forms and form data since slot indices have changed
          const reindexedForms: Record<number, string> = {};
          const reindexedData: Record<number, SlimCreature> = {};
          for (const [k, v] of Object.entries(restForms)) {
            const oldIndex = Number(k);
            const newIndex = oldIndex > slotIndex ? oldIndex - 1 : oldIndex;
            reindexedForms[newIndex] = v;
          }
          for (const [k, v] of Object.entries(restData)) {
            const oldIndex = Number(k);
            const newIndex = oldIndex > slotIndex ? oldIndex - 1 : oldIndex;
            reindexedData[newIndex] = v as SlimCreature;
          }

          return {
            teamIds: nextIds,
            teamForms: reindexedForms,
            teamFormData: reindexedData,
          };
        }),

      clearTeam: () => set({ teamIds: [], teamForms: {}, teamFormData: {} }),

      setTeamIds: (ids) =>
        set((state) => {
          const next = ids.slice(0, 6);
          const newLen = next.length;

          // If we're trimming slots, clean up form data for removed slots
          const prunedForms: Record<number, string> = {};
          const prunedData: Record<number, SlimCreature> = {};
          for (const [k, v] of Object.entries(state.teamForms)) {
            const idx = Number(k);
            if (idx < newLen) prunedForms[idx] = v;
          }
          for (const [k, v] of Object.entries(state.teamFormData)) {
            const idx = Number(k);
            if (idx < newLen) prunedData[idx] = v as SlimCreature;
          }

          return { teamIds: next, teamForms: prunedForms, teamFormData: prunedData };
        }),

      randomizeIds: (allIds) => {
        const pool = [...allIds];
        const next: number[] = [];
        while (next.length < 6 && pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          next.push(pool.splice(idx, 1)[0]);
        }
        set({ teamIds: next, teamForms: {}, teamFormData: {} });
      },

      setTeamName: (name) => set({ teamName: name }),

      setForm: (slotIndex, formName, formCreature) =>
        set((state) => ({
          teamForms: { ...state.teamForms, [slotIndex]: formName },
          teamFormData: { ...state.teamFormData, [slotIndex]: formCreature },
        })),

      clearForm: (slotIndex) =>
        set((state) => {
          const { [slotIndex]: _f, ...restForms } = state.teamForms;
          const { [slotIndex]: _d, ...restData } = state.teamFormData;
          return { teamForms: restForms, teamFormData: restData };
        }),
    }),
    { name: 'pokemon-team' }
  )
);
