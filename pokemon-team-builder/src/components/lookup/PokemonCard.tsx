import type { Pokemon } from '../../types/pokemon';
import { TypeBadge } from '../layout/TypeBadge';
import { StatRadarChart } from './StatRadarChart';
import { AddToTeamButton } from './AddToTeamButton';

interface PokemonCardProps {
  pokemon: Pokemon;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const fallbackSrc = '/pokemonLookUp/not_found.png';

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg flex flex-col items-center gap-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-slate-400 text-sm font-mono">#{String(pokemon.id).padStart(4, '0')}</p>
        <h2 className="text-2xl font-bold text-slate-800">{capitalize(pokemon.name)}</h2>
      </div>

      {/* Types */}
      <div className="flex gap-2">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>

      {/* Sprites */}
      <div className="flex gap-6 items-end">
        <div className="flex flex-col items-center gap-1">
          <img
            src={pokemon.defaultSprite ?? fallbackSrc}
            alt={`${pokemon.name} default sprite`}
            className="w-32 h-32 object-contain image-pixelated hover:-scale-x-100 transition-transform duration-200 cursor-pointer"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
          />
          <span className="text-xs text-slate-400 font-medium">Default</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          {pokemon.shinySprite ? (
            <img
              src={pokemon.shinySprite}
              alt={`${pokemon.name} shiny sprite`}
              className="w-32 h-32 object-contain image-pixelated hover:-scale-x-100 transition-transform duration-200 cursor-pointer"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <span className="text-slate-400 text-xs text-center">No shiny sprite</span>
            </div>
          )}
          <span className="text-xs text-slate-400 font-medium">✨ Shiny</span>
        </div>
      </div>

      {/* Stat Radar Chart */}
      <div className="w-full">
        <h3 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Base Stats
        </h3>
        <StatRadarChart stats={pokemon.stats} />
      </div>

      {/* Add to Team */}
      <AddToTeamButton pokemon={pokemon} />
    </div>
  );
}
