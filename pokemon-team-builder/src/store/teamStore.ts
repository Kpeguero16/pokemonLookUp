import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pokemon, Team } from '../types/pokemon';

interface TeamStore {
  team: Team;
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (id: number) => void;
  clearTeam: () => void;
}

const EMPTY_TEAM: Team = [null, null, null, null, null, null];

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      team: [...EMPTY_TEAM] as Team,

      addPokemon: (pokemon) =>
        set((state) => {
          const firstEmpty = state.team.findIndex((slot) => slot === null);
          if (firstEmpty === -1) return state; // team is full
          const newTeam = [...state.team] as Team;
          newTeam[firstEmpty] = pokemon;
          return { team: newTeam };
        }),

      removePokemon: (id) =>
        set((state) => ({
          team: state.team.map((slot) => (slot?.id === id ? null : slot)) as Team,
        })),

      clearTeam: () => set({ team: [...EMPTY_TEAM] as Team }),
    }),
    {
      name: 'pokemon-team', // localStorage key
    }
  )
);
