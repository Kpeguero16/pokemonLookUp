import { useTeamStore } from '../../store/teamStore';
import type { Pokemon } from '../../types/pokemon';

interface AddToTeamButtonProps {
  pokemon: Pokemon;
}

export function AddToTeamButton({ pokemon }: AddToTeamButtonProps) {
  const team = useTeamStore((s) => s.team);
  const addPokemon = useTeamStore((s) => s.addPokemon);
  const removePokemon = useTeamStore((s) => s.removePokemon);

  const isOnTeam = team.some((slot) => slot?.id === pokemon.id);
  const teamFull = team.every((slot) => slot !== null);

  if (isOnTeam) {
    return (
      <button
        onClick={() => removePokemon(pokemon.id)}
        className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl border-2 border-red-200 transition-colors"
      >
        ✕ Remove from Team
      </button>
    );
  }

  if (teamFull) {
    return (
      <button
        disabled
        className="px-5 py-2 bg-slate-100 text-slate-400 font-semibold rounded-xl border-2 border-slate-200 cursor-not-allowed"
      >
        Team Full (6/6)
      </button>
    );
  }

  return (
    <button
      onClick={() => addPokemon(pokemon)}
      className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
    >
      + Add to Team
    </button>
  );
}
