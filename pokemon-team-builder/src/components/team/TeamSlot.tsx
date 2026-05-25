import type { Pokemon } from '../../types/pokemon';
import { TypeBadge } from '../layout/TypeBadge';
import { useTeamStore } from '../../store/teamStore';

interface TeamSlotProps {
  pokemon: Pokemon | null;
  slotIndex: number;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function TeamSlot({ pokemon, slotIndex }: TeamSlotProps) {
  const removePokemon = useTeamStore((s) => s.removePokemon);
  const fallbackSrc = '/pokemonLookUp/not_found.png';

  if (!pokemon) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-36">
        <span className="text-3xl text-slate-300">⬡</span>
        <span className="text-sm text-slate-400 font-medium">Slot {slotIndex + 1}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm relative group">
      {/* Remove button */}
      <button
        onClick={() => removePokemon(pokemon.id)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
        title="Remove from team"
      >
        ✕
      </button>

      {/* Sprite */}
      <img
        src={pokemon.defaultSprite ?? fallbackSrc}
        alt={pokemon.name}
        className="w-20 h-20 object-contain image-pixelated hover:-scale-x-100 transition-transform duration-200"
        onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
      />

      {/* Name & number */}
      <div className="text-center">
        <p className="text-xs text-slate-400 font-mono">#{String(pokemon.id).padStart(4, '0')}</p>
        <p className="text-sm font-bold text-slate-700">{capitalize(pokemon.name)}</p>
      </div>

      {/* Types */}
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  );
}
