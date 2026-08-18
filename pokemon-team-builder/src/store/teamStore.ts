import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { SlimCreature } from '../types/pokemon';
import { useToastStore } from './toastStore';
import { evictAllCachedResponses } from '../lib/pokeapi';

/**
 * localStorage wrapper that degrades gracefully if a write fails — e.g. quota exceeded.
 * First frees room by evicting the (much larger, easily-refetched) PokeAPI response cache and
 * retries once, so a full dex cache doesn't permanently block team saves for the rest of the
 * session. Only surfaces a toast if the retry still fails.
 */
const guardedStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
      return;
    } catch {
      // fall through to eviction + retry
    }
    try {
      evictAllCachedResponses();
      localStorage.setItem(name, value);
    } catch {
      useToastStore.getState().showToast("Couldn't save your team — browser storage is full");
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

const EMPTY_SLOTS: (number | null)[] = [null, null, null, null, null, null];

interface TeamStore {
  /** Fixed-length 6 array of base Pokémon IDs — index is the literal team slot, null means empty. */
  teamIds: (number | null)[];
  /** Maps slot index → selected form API name (e.g. 0 → "rattata-alola"). Used for Showdown export. */
  teamForms: Record<number, string>;
  /** Maps slot index → the resolved form SlimCreature. Avoids re-fetching on reload. */
  teamFormData: Record<number, SlimCreature>;
  teamName: string;
  /** Place a base Pokémon into the first empty slot, if any. Returns the slot index it used, or null if the team is full (no-op). */
  addSlot: (id: number) => number | null;
  /** Set a specific slot's base Pokémon directly. Clears any form previously set on that slot. */
  setSlot: (slotIndex: number, id: number | null) => void;
  /** Empty a single slot. Every other slot is left exactly as-is. */
  removeSlot: (slotIndex: number) => void;
  clearTeam: () => void;
  randomizeIds: (allIds: number[]) => void;
  setTeamName: (name: string) => void;
  /** Set the active form for a slot (also stores the resolved SlimCreature) */
  setForm: (slotIndex: number, formName: string, formCreature: SlimCreature) => void;
  /** Remove form override for a slot (revert to base form) */
  clearForm: (slotIndex: number) => void;
}

function withoutKey<T>(record: Record<number, T>, key: number): Record<number, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

/** Pads a pre-fix, densely-packed `teamIds` array (length <= 6) out to the fixed 6-slot shape. */
function normalizeTeamIds(raw: unknown): (number | null)[] {
  const source = Array.isArray(raw) ? raw : [];
  const teamIds = [...EMPTY_SLOTS];
  for (let i = 0; i < Math.min(6, source.length); i++) {
    teamIds[i] = typeof source[i] === 'number' ? source[i] : null;
  }
  return teamIds;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teamIds: [...EMPTY_SLOTS],
      teamForms: {},
      teamFormData: {},
      teamName: 'Untitled Squad',

      addSlot: (id) => {
        const emptyIndex = get().teamIds.findIndex((v) => v === null);
        if (emptyIndex === -1) return null;
        set((state) => {
          const next = [...state.teamIds];
          next[emptyIndex] = id;
          return { teamIds: next };
        });
        return emptyIndex;
      },

      setSlot: (slotIndex, id) =>
        set((state) => {
          const next = [...state.teamIds];
          next[slotIndex] = id;
          return {
            teamIds: next,
            teamForms: withoutKey(state.teamForms, slotIndex),
            teamFormData: withoutKey(state.teamFormData, slotIndex),
          };
        }),

      removeSlot: (slotIndex) =>
        set((state) => {
          const next = [...state.teamIds];
          next[slotIndex] = null;
          return {
            teamIds: next,
            teamForms: withoutKey(state.teamForms, slotIndex),
            teamFormData: withoutKey(state.teamFormData, slotIndex),
          };
        }),

      clearTeam: () => set({ teamIds: [...EMPTY_SLOTS], teamForms: {}, teamFormData: {} }),

      randomizeIds: (allIds) => {
        const pool = [...allIds];
        const next: (number | null)[] = [...EMPTY_SLOTS];
        for (let i = 0; i < 6 && pool.length > 0; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          next[i] = pool.splice(idx, 1)[0];
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
        set((state) => ({
          teamForms: withoutKey(state.teamForms, slotIndex),
          teamFormData: withoutKey(state.teamFormData, slotIndex),
        })),
    }),
    {
      name: 'pokemon-team',
      storage: createJSONStorage(() => guardedStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<TeamStore>;
        return {
          teamIds: normalizeTeamIds(state.teamIds),
          teamForms: state.teamForms ?? {},
          teamFormData: state.teamFormData ?? {},
          teamName: state.teamName ?? 'Untitled Squad',
        } as TeamStore;
      },
    }
  )
);
