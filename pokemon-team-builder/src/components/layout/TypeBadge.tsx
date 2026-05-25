import type { PokemonTypeName } from '../../types/pokemon';
import { TYPE_COLORS } from '../../constants/typeColors';

interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const { bg, text } = TYPE_COLORS[type];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`${bg} ${text} ${sizeClass} rounded-full font-semibold uppercase tracking-wide`}
    >
      {type}
    </span>
  );
}
