import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeamStore {
  teamIds: number[];
  teamName: string;
  addById: (id: number) => void;
  removeById: (id: number) => void;
  clearTeam: () => void;
  setTeamIds: (ids: number[]) => void;
  randomizeIds: (allIds: number[]) => void;
  setTeamName: (name: string) => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      teamIds: [],
      teamName: 'Untitled Squad',

      addById: (id) =>
        set((state) => {
          if (state.teamIds.includes(id)) return state;
          if (state.teamIds.length >= 6) return state;
          return { teamIds: [...state.teamIds, id] };
        }),

      removeById: (id) =>
        set((state) => ({
          teamIds: state.teamIds.filter((tid) => tid !== id),
        })),

      clearTeam: () => set({ teamIds: [] }),

      setTeamIds: (ids) => set({ teamIds: ids.slice(0, 6) }),

      randomizeIds: (allIds) => {
        const pool = [...allIds];
        const next: number[] = [];
        while (next.length < 6 && pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          next.push(pool.splice(idx, 1)[0]);
        }
        set({ teamIds: next });
      },

      setTeamName: (name) => set({ teamName: name }),
    }),
    { name: 'pokemon-team' }
  )
);
