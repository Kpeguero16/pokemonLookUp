import { useState } from 'react';
import { usePokemon } from '../hooks/usePokemon';
import { SearchBar } from '../components/lookup/SearchBar';
import { PokemonCard } from '../components/lookup/PokemonCard';
import { TOTAL_POKEMON } from '../lib/pokeapi';

export function LookupPage() {
  const [query, setQuery] = useState<string | number | null>(null);

  const { data: pokemon, isLoading, isError, error } = usePokemon(query);

  function handleSearch(q: string) {
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
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    setQuery(randomId);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Pokédex Lookup
        </h1>
        <p className="text-slate-400 dark:text-slate-500 mt-1">Search any Pokémon by name or Pokédex number</p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onPrev={handlePrev}
        onNext={handleNext}
        onRandomize={handleRandomize}
        currentId={pokemon?.id ?? null}
      />

      {query === null && (
        <div className="text-center text-slate-400 dark:text-slate-500 mt-12">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-lg font-medium">Search for a Pokémon to get started</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 w-full max-w-lg animate-pulse transition-colors duration-200">
          <div className="flex flex-col items-center gap-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
            <div className="flex gap-2">
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
            </div>
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="w-full h-56 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 w-full max-w-lg text-center transition-colors duration-200">
          <img
            src="/pokemonLookUp/not_found.png"
            alt="Not found"
            className="w-32 h-32 object-contain mx-auto mb-4 opacity-60"
          />
          <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Pokémon Not Found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
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
