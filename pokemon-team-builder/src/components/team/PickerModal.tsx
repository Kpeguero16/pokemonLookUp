import { useState, useMemo, useEffect, useRef } from 'react';
import { ALL_TYPES } from '../../constants/typeChart';
import { TYPE_HEX } from '../../constants/typeColors';
import { POKEMON_WITH_FORMS } from '../../constants/forms';
import { CreatureCard } from '../lookup/CreatureCard';
import { FormPickerModal } from './FormPickerModal';
import type { SlimCreature, PokemonTypeName } from '../../types/pokemon';

interface PickerModalProps {
  creatures: SlimCreature[];
  teamIds: Set<number>;
  onPick: (c: SlimCreature, formName: string | null, formCreature: SlimCreature | null) => void;
  onClose: () => void;
  slotNum: number;
}

export function PickerModal({ creatures, teamIds, onPick, onClose, slotNum }: PickerModalProps) {
  const [q, setQ] = useState('');
  const [tf, setTf] = useState('');
  const [formTarget, setFormTarget] = useState<SlimCreature | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    function trapFocus(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = el!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [onClose]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return creatures.filter((c) => {
      if (teamIds.has(c.id)) return false;
      if (ql && !c.name.includes(ql) && !String(c.id).includes(ql)) return false;
      if (tf && !c.types.includes(tf as PokemonTypeName)) return false;
      return true;
    }).slice(0, 60);
  }, [creatures, teamIds, q, tf]);

  function handleCardSelect(c: SlimCreature) {
    if (POKEMON_WITH_FORMS.has(c.id)) {
      setFormTarget(c);
    } else {
      onPick(c, null, null);
    }
  }

  return (
    <div className="modal-bd" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div id="picker-modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            Pick for slot <span style={{ color: 'var(--accent)' }}>{slotNum}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close picker">×</button>
        </div>
        <div className="modal-body">
          {formTarget ? (
            <FormPickerModal
              creature={formTarget}
              onPickForm={(base, formName, formCreature) => onPick(base, formName, formCreature)}
              onBack={() => setFormTarget(null)}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                <div className="search-input">
                  <span className="si-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                    </svg>
                  </span>
                  <label htmlFor="picker-search" className="sr-only">
                    Search Pokémon by name or number
                  </label>
                  <input
                    id="picker-search"
                    autoFocus
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="search..."
                  />
                </div>
                {/* Type filter: native select on desktop, chip row on mobile */}
                <select
                  value={tf}
                  onChange={(e) => setTf(e.target.value)}
                  className="dex-select picker-type-select"
                  aria-label="Filter by type"
                >
                  <option value="">all types</option>
                  {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="picker-type-chips" role="group" aria-label="Filter by type">
                  <button
                    className="type-filter-pill"
                    data-on={tf === ''}
                    onClick={() => setTf('')}
                    style={{ flexShrink: 0 }}
                  >
                    All
                  </button>
                  {ALL_TYPES.map((t) => (
                    <button
                      key={t}
                      className="type-filter-pill"
                      data-on={tf === t}
                      onClick={() => setTf(tf === t ? '' : t)}
                      style={tf === t ? { color: TYPE_HEX[t as PokemonTypeName], flexShrink: 0 } : { flexShrink: 0 }}
                    >
                      <span className="swatch" style={{ background: TYPE_HEX[t as PokemonTypeName] }} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cards-grid picker-cards-grid" style={{ padding: 2 }}>
                {filtered.map((c) => (
                  <CreatureCard
                    key={c.id}
                    creature={c}
                    onSelect={() => handleCardSelect(c)}
                    hasForms={POKEMON_WITH_FORMS.has(c.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="empty-state" style={{ gridColumn: '1/-1' }}>no matches</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
