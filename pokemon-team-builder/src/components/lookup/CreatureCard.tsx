import type { SlimCreature } from '../../types/pokemon';
import { TYPE_HEX } from '../../constants/typeColors';
import { TypeBadge } from '../layout/TypeBadge';
import { Sprite } from './Sprite';

interface CreatureCardProps {
  creature: SlimCreature;
  onSelect?: (c: SlimCreature) => void;
  onAdd?: (c: SlimCreature) => void;
  inTeam?: boolean;
  hasForms?: boolean;
}

export function CreatureCard({ creature, onSelect, onAdd, inTeam, hasForms }: CreatureCardProps) {
  const tint = TYPE_HEX[creature.types[0]] ?? '#666';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(creature);
    }
  }

  return (
    <div
      className={`card${inTeam ? ' in-team' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(creature)}
      onKeyDown={handleKeyDown}
      aria-label={`${creature.name.replace(/-/g, ' ')}, #${creature.id}, ${creature.types.join('/')} type, BST ${creature.bst}${inTeam ? ', in team' : ''}`}
      style={{ '--card-tint': tint } as React.CSSProperties}
    >
      <div className="c-id">#{String(creature.id).padStart(3, '0')}</div>
      <div className="sprite-wrap" style={{ '--card-tint': tint } as React.CSSProperties}>
        <Sprite id={creature.id} alt={creature.name} />
      </div>
      <div className="c-name">
        <span>{creature.name.replace(/-/g, ' ')}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {hasForms && <span className="forms-badge">FORMS</span>}
          <span className="c-bst">{creature.bst}</span>
        </div>
      </div>
      <div className="c-types">
        {creature.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
      {onAdd && (
        <button
          className="add-btn"
          aria-label={`Add ${creature.name.replace(/-/g, ' ')} to team`}
          onClick={(e) => { e.stopPropagation(); onAdd(creature); }}
        >+</button>
      )}
    </div>
  );
}
