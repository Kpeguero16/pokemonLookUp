import { useState } from 'react';
import { usePokemon } from '../hooks/usePokemon';
import { SearchBar } from '../components/lookup/SearchBar';
import { PokemonCard } from '../components/lookup/PokemonCard';
import { TOTAL_POKEMON } from '../lib/pokeapi';

export function LookupPage() {
  // null = nothing searched yet; string/number = active query
  const [query, setQuery] = useState<string | number | null>(null);

  const { data: pokemon, isLoading, isError, error } = usePokemon(query);

  function handleSearch(q: string) {
    // If it's a number string, convert so the cache key is consistent
    const asNum = Number(q);
    setQuery(isNaN(asNum) || q === '' ? q : asNum);
  }

  function handlePrev() {
    const currentId = pokemon?.id ?? null;
    if (currentId && currentId > 1) setQuery(currentId - 1);
  }

  function handleNext() {
    const currentId = pokemon?.id ?? null;
    if (currentId) setQuery(currentId + 1);
  }

  function handleRandomize() {
    // Fix for the original script.js bug — + 1 is inside the argument
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    setQuery(randomId);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 min-h-screen bg-slate-50">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Pokédex Lookup
        </h1>
        <p className="text-slate-400 mt-1">Search any Pokémon by name or Pokédex number</p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onPrev={handlePrev}
        onNext={handleNext}
        onRandomize={handleRandomize}
        currentId={pokemon?.id ?? null}
      />

      {/* States */}
      {query === null && (
        <div className="text-center text-slate-400 mt-12">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-lg font-medium">Search for a Pokémon to get started</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="h-6 bg-slate-200 rounded w-32" />
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="flex gap-2">
              <div className="h-7 bg-slate-200 rounded-full w-20" />
            </div>
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-slate-200 rounded-lg" />
              <div className="w-32 h-32 bg-slate-200 rounded-lg" />
            </div>
            <div className="w-full h-56 bg-slate-200 rounded-xl" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg text-center">
          <img
            src="/pokemonLookUp/not_found.png"
            alt="Not found"
            className="w-32 h-32 object-contain mx-auto mb-4 opacity-60"
          />
          <p className="text-xl font-bold text-slate-700 mb-2">Pokémon Not Found</p>
          <p className="text-slate-400 text-sm">
            {error?.message ?? 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      {pokemon && !isLoading && !isError && (
        <PokemonCard pokemon={pokemon} />
      )}
    </div>
  );
}
