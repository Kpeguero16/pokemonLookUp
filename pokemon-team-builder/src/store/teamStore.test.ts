import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTeamStore } from './teamStore';
import { useToastStore } from './toastStore';
import type { SlimCreature } from '../types/pokemon';

function creature(id: number, name = `mon-${id}`): SlimCreature {
  return {
    id,
    name,
    types: ['normal'],
    stats: { hp: 1, attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 },
    bst: 6,
    height: 1,
    weight: 1,
    abilities: [{ name: 'ability', hidden: false }],
    moveCount: 0,
    speciesUrl: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
  };
}

function resetStore() {
  useTeamStore.setState({
    teamIds: [null, null, null, null, null, null],
    teamForms: {},
    teamFormData: {},
    teamName: 'Untitled Squad',
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStore();
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  localStorage.clear();
  resetStore();
});

describe('slot positioning', () => {
  it('setSlot writes an id at the exact slot index, independent of other slots', () => {
    useTeamStore.getState().setSlot(2, 6);
    expect(useTeamStore.getState().teamIds).toEqual([null, null, 6, null, null, null]);
  });

  it('picking a form into a non-adjacent empty slot does not disturb earlier slots or desync from teamForms', () => {
    const { setSlot, setForm } = useTeamStore.getState();
    setSlot(0, 6);
    setForm(0, 'charizard-mega-x', creature(10034, 'charizard-mega-x'));

    setSlot(2, 3);
    setForm(2, 'venusaur-mega', creature(10033, 'venusaur-mega'));

    const state = useTeamStore.getState();
    expect(state.teamIds).toEqual([6, null, 3, null, null, null]);
    expect(state.teamForms).toEqual({ 0: 'charizard-mega-x', 2: 'venusaur-mega' });
    expect(state.teamFormData[2]?.name).toBe('venusaur-mega');
  });

  it('setSlot clears any stale form data previously set at that slot', () => {
    const { setSlot, setForm } = useTeamStore.getState();
    setSlot(0, 6);
    setForm(0, 'charizard-mega-x', creature(10034, 'charizard-mega-x'));

    setSlot(0, 1); // replace slot 0 with a different, form-less pick
    const state = useTeamStore.getState();
    expect(state.teamIds[0]).toBe(1);
    expect(state.teamForms[0]).toBeUndefined();
    expect(state.teamFormData[0]).toBeUndefined();
  });
});

describe('removeSlot', () => {
  it('empties only the target slot, leaving every other slot untouched', () => {
    const { setSlot } = useTeamStore.getState();
    setSlot(0, 6);
    setSlot(1, 3);
    setSlot(2, 9);

    useTeamStore.getState().removeSlot(1);

    expect(useTeamStore.getState().teamIds).toEqual([6, null, 9, null, null, null]);
  });

  it('clears the removed slot\'s form data without touching other slots\' forms', () => {
    const { setSlot, setForm } = useTeamStore.getState();
    setSlot(0, 6);
    setForm(0, 'charizard-mega-x', creature(10034));
    setSlot(1, 3);
    setForm(1, 'venusaur-mega', creature(10033, 'venusaur-mega'));

    useTeamStore.getState().removeSlot(0);

    const state = useTeamStore.getState();
    expect(state.teamForms).toEqual({ 1: 'venusaur-mega' });
    expect(state.teamFormData[0]).toBeUndefined();
    expect(state.teamFormData[1]?.name).toBe('venusaur-mega');
  });
});

describe('addSlot', () => {
  it('fills the first empty slot, not the end of a compacted array, and returns that index', () => {
    const { setSlot, addSlot } = useTeamStore.getState();
    setSlot(0, 6);
    setSlot(2, 9);

    const slotIndex = addSlot(25);

    expect(slotIndex).toBe(1);
    expect(useTeamStore.getState().teamIds).toEqual([6, 25, 9, null, null, null]);
  });

  it('is a no-op and returns null once all 6 slots are filled', () => {
    const { setSlot, addSlot } = useTeamStore.getState();
    [6, 3, 9, 1, 4, 7].forEach((id, i) => setSlot(i, id));

    const slotIndex = addSlot(25);

    expect(slotIndex).toBeNull();
    expect(useTeamStore.getState().teamIds).toEqual([6, 3, 9, 1, 4, 7]);
  });
});

describe('randomizeIds', () => {
  it('populates up to 6 slots and clears all form overrides', () => {
    const { setForm, randomizeIds } = useTeamStore.getState();
    useTeamStore.getState().setSlot(0, 6);
    setForm(0, 'charizard-mega-x', creature(10034));

    randomizeIds([1, 2, 3, 4, 5, 6, 7, 8]);

    const state = useTeamStore.getState();
    expect(state.teamIds).toHaveLength(6);
    expect(state.teamIds.every((id) => id !== null)).toBe(true);
    expect(state.teamForms).toEqual({});
    expect(state.teamFormData).toEqual({});
  });

  it('fills fewer than 6 slots (rest stay null) when fewer ids are available', () => {
    useTeamStore.getState().randomizeIds([1, 2, 3]);
    const { teamIds } = useTeamStore.getState();
    expect(teamIds.filter((id) => id !== null)).toHaveLength(3);
    expect(teamIds.filter((id) => id === null)).toHaveLength(3);
  });
});

describe('clearTeam', () => {
  it('resets to 6 empty slots with no forms', () => {
    const { setSlot, setForm, clearTeam } = useTeamStore.getState();
    setSlot(0, 6);
    setForm(0, 'charizard-mega-x', creature(10034));

    clearTeam();

    const state = useTeamStore.getState();
    expect(state.teamIds).toEqual([null, null, null, null, null, null]);
    expect(state.teamForms).toEqual({});
    expect(state.teamFormData).toEqual({});
  });
});

describe('migration from the pre-fix, densely-packed teamIds shape', () => {
  it('pads an old dense array (length < 6) out to 6 fixed slots, preserving positions 0..n-1', async () => {
    localStorage.setItem(
      'pokemon-team',
      JSON.stringify({
        state: { teamIds: [6, 3], teamForms: {}, teamFormData: {}, teamName: 'My Squad' },
        version: 0,
      })
    );

    vi.resetModules();
    const { useTeamStore: freshStore } = await import('./teamStore');

    expect(freshStore.getState().teamIds).toEqual([6, 3, null, null, null, null]);
    expect(freshStore.getState().teamName).toBe('My Squad');
  });

  it('falls back to defaults instead of throwing when the persisted state field is not an object', async () => {
    localStorage.setItem('pokemon-team', JSON.stringify({ state: null, version: 0 }));

    vi.resetModules();
    const { useTeamStore: freshStore } = await import('./teamStore');

    expect(freshStore.getState().teamIds).toEqual([null, null, null, null, null, null]);
    expect(freshStore.getState().teamName).toBe('Untitled Squad');
  });
});

describe('persistence failure handling', () => {
  it('does not throw when localStorage.setItem is over quota, and still updates state in memory', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      });

    try {
      expect(() => {
        useTeamStore.getState().setSlot(0, 6);
      }).not.toThrow();

      expect(useTeamStore.getState().teamIds[0]).toBe(6);
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('evicts the PokeAPI response cache and retries once before giving up, freeing the write for the rest of the session', () => {
    localStorage.setItem('dexmeta:v5:/pokemon/1', JSON.stringify({ id: 1 }));

    const realSetItem = Storage.prototype.setItem.bind(localStorage);
    let calls = 0;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      calls++;
      if (calls === 1) throw new DOMException('quota exceeded', 'QuotaExceededError');
      realSetItem(key, value);
    });

    try {
      useTeamStore.getState().setSlot(0, 6);

      expect(localStorage.getItem('dexmeta:v5:/pokemon/1')).toBeNull();
      expect(useTeamStore.getState().teamIds[0]).toBe(6);
      expect(useToastStore.getState().toasts.some((t) => t.text.includes("Couldn't save"))).toBe(false);
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('shows a toast only when the write still fails after eviction', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      });

    try {
      useTeamStore.getState().setSlot(0, 6);
      expect(useToastStore.getState().toasts.some((t) => t.text.includes("Couldn't save"))).toBe(true);
    } finally {
      setItemSpy.mockRestore();
    }
  });
});
