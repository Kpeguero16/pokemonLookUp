import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SlimCreature } from '../types/pokemon';

interface TeamStore {
  teamIds: number[];
  /** Maps base Pokémon ID → selected form API name (e.g. 19 → "rattata-alola"). Used for Showdown export. */
  teamForms: Record<number, string>;
  /** Maps base Pokémon ID → the resolved form SlimCreature. Avoids re-fetching on reload. */
  teamFormData: Record<number, SlimCreature>;
  teamName: string;
  addById: (id: number) => void;
  removeById: (id: number) => void;
  clearTeam: () => void;
  setTeamIds: (ids: number[]) => void;
  randomizeIds: (allIds: number[]) => void;
  setTeamName: (name: string) => void;
  /** Set the active form for a team member (also stores the resolved SlimCreature) */
  setForm: (baseId: number, formName: string, formCreature: SlimCreature) => void;
  /** Remove form override (revert to base form) */
  clearForm: (baseId: number) => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      teamIds: [],
      teamForms: {},
      teamFormData: {},
      teamName: 'Untitled Squad',

      addById: (id) =>
        set((state) => {
          if (state.teamIds.includes(id)) return state;
          if (state.teamIds.length >= 6) return state;
          return { teamIds: [...state.teamIds, id] };
        }),

      removeById: (id) =>
        set((state) => {
          const { [id]: _f, ...restForms } = state.teamForms;
          const { [id]: _d, ...restData } = state.teamFormData;
          return {
            teamIds: state.teamIds.filter((tid) => tid !== id),
            teamForms: restForms,
            teamFormData: restData,
          };
        }),

      clearTeam: () => set({ teamIds: [], teamForms: {}, teamFormData: {} }),

      setTeamIds: (ids) =>
        set((state) => {
          const next = ids.slice(0, 6);
          const nextSet = new Set(next);
          const prunedForms: Record<number, string> = {};
          const prunedData: Record<number, SlimCreature> = {};
          for (const [k, v] of Object.entries(state.teamForms)) {
            if (nextSet.has(Number(k))) prunedForms[Number(k)] = v;
          }
          for (const [k, v] of Object.entries(state.teamFormData)) {
            if (nextSet.has(Number(k))) prunedData[Number(k)] = v as SlimCreature;
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

      setForm: (baseId, formName, formCreature) =>
        set((state) => ({
          teamForms: { ...state.teamForms, [baseId]: formName },
          teamFormData: { ...state.teamFormData, [baseId]: formCreature },
        })),

      clearForm: (baseId) =>
        set((state) => {
          const { [baseId]: _f, ...restForms } = state.teamForms;
          const { [baseId]: _d, ...restData } = state.teamFormData;
          return { teamForms: restForms, teamFormData: restData };
        }),
    }),
    { name: 'pokemon-team' }
  )
);
