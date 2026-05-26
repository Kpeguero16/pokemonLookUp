import type { PokemonTypeName } from '../../types/pokemon';
import { TYPE_HEX } from '../../constants/typeColors';

interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md' | 'lg';
}

const DARK_TEXT_TYPES = new Set<PokemonTypeName>([
  'normal', 'electric', 'ice', 'fairy', 'bug', 'flying', 'steel',
]);

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const color = TYPE_HEX[type] ?? '#999';
  const textColor = DARK_TEXT_TYPES.has(type) ? '#1a1530' : '#fff';
  return (
    <span
      className={`type-badge size-${size}`}
      style={{ background: color, color: textColor }}
    >
      <span className="glyph" style={{ color: textColor }} aria-hidden="true">{type[0].toUpperCase()}</span>
      {type}
    </span>
  );
}
