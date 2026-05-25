import { useQuery } from '@tanstack/react-query';
import { fetchPokemon } from '../lib/pokeapi';
import type { Pokemon } from '../types/pokemon';

export function usePokemon(nameOrId: string | number | null) {
  return useQuery<Pokemon, Error>({
    queryKey: ['pokemon', String(nameOrId).toLowerCase()],
    queryFn: () => fetchPokemon(nameOrId!),
    enabled: nameOrId !== null && nameOrId !== '',
    staleTime: Infinity,  // Pokemon data never changes
    retry: 1,
  });
}
