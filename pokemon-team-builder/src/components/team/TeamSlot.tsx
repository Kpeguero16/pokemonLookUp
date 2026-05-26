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
      <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-36 transition-colors duration-200">
        <span className="text-3xl text-slate-300 dark:text-slate-600">⬡</span>
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">Slot {slotIndex + 1}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm relative group transition-colors duration-200">
      {/* Remove button — always visible on touch devices, hover-only on desktop */}
      <button
        onClick={() => removePokemon(pokemon.id)}
        aria-label={`Remove ${pokemon.name} from team`}
        className={[
          'absolute top-2 right-2',
          // Large touch target on mobile, smaller on desktop
          'w-8 h-8 sm:w-6 sm:h-6',
          'flex items-center justify-center text-xs',
          'rounded-full transition-colors',
          // Always visible on mobile (no hover state on touch), hover-reveal on desktop
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
          'text-slate-400 dark:text-slate-500',
          'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30',
          'active:bg-red-100 dark:active:bg-red-900/50',
        ].join(' ')}
      >
        ✕
      </button>

      {/* Sprite */}
      <img
        src={pokemon.defaultSprite ?? fallbackSrc}
        alt={pokemon.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain image-pixelated hover:-scale-x-100 transition-transform duration-200"
        onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
      />

      {/* Name & number */}
      <div className="text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">#{String(pokemon.id).padStart(4, '0')}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{capitalize(pokemon.name)}</p>
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
