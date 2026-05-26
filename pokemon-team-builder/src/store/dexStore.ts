import { create } from 'zustand';
import type { SlimCreature } from '../types/pokemon';
import { fetchCreaturesRange, TOTAL_POKEMON } from '../lib/pokeapi';

interface DexStore {
  creatures: SlimCreature[];
  booted: boolean;
  progress: { done: number; total: number };
  error: string | null;
  boot: (count?: number) => Promise<void>;
}

export const useDexStore = create<DexStore>((set) => ({
  creatures: [],
  booted: false,
  progress: { done: 0, total: 0 },
  error: null,

  boot: async (count = TOTAL_POKEMON) => {
    const ids = Array.from({ length: count }, (_, i) => i + 1);
    set({ progress: { done: 0, total: count } });
    try {
      const results = await fetchCreaturesRange(ids, (done, total) => {
        set({ progress: { done, total } });
      });
      results.sort((a, b) => a.id - b.id);
      set({ creatures: results, booted: true });
    } catch (e) {
      set({ error: String(e), booted: true });
    }
  },
}));
