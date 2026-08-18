import { useState, useEffect } from 'react';
import { fetchSpecies, fetchSlimCreature } from '../../lib/pokeapi';
import { TypeBadge } from '../layout/TypeBadge';
import { Sprite } from '../lookup/Sprite';
import { useToastStore } from '../../store/toastStore';
import type { SlimCreature, PokemonFormVariant } from '../../types/pokemon';

interface FormPickerModalProps {
  creature: SlimCreature;
  onPickForm: (baseCreature: SlimCreature, formName: string | null, formCreature: SlimCreature | null) => void;
  onBack: () => void;
}

interface FormOption {
  label: string;
  formName: string | null; // null = base form
  creature: SlimCreature | null; // null until loaded
}

export function FormPickerModal({ creature, onPickForm, onBack }: FormPickerModalProps) {
  const [options, setOptions] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSpecies(creature.speciesUrl).then(async (species) => {
      if (cancelled) return;

      // Build initial options with base + placeholders for variants
      const baseOpt: FormOption = { label: 'Base Form', formName: null, creature };
      const variantOpts: FormOption[] = species.variants.map((v: PokemonFormVariant) => ({
        label: v.displayName,
        formName: v.name,
        creature: null,
      }));

      if (variantOpts.length === 0) {
        // No meaningful forms — just pick base immediately
        onPickForm(creature, null, null);
        return;
      }

      // Fetch ALL form creatures before showing options — this ensures handlePick
      // always takes the synchronous path (opt.creature is never null), avoiding
      // the stale-closure / async-batching issue that prevented modal close.
      const resolved = await Promise.allSettled(
        variantOpts.map((o) => fetchSlimCreature(o.formName!))
      );
      if (cancelled) return;

      const loadedVariants: FormOption[] = variantOpts.map((opt, idx) => ({
        ...opt,
        creature:
          resolved[idx].status === 'fulfilled'
            ? (resolved[idx] as PromiseFulfilledResult<SlimCreature>).value
            : null,
      }));

      setOptions([baseOpt, ...loadedVariants]);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        // Fall back: just pick base form with no form selection
        onPickForm(creature, null, null);
      }
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature.id]);

  async function handlePick(opt: FormOption) {
    if (loadingForm) return;

    if (opt.formName === null) {
      onPickForm(creature, null, null);
      return;
    }

    // If form creature already loaded, use it
    if (opt.creature) {
      onPickForm(creature, opt.formName, opt.creature);
      return;
    }

    // Still loading — fetch on demand (only reached if preload failed)
    setLoadingForm(opt.formName);
    try {
      const formCreature = await fetchSlimCreature(opt.formName);
      onPickForm(creature, opt.formName, formCreature);
    } catch {
      showToast('Could not load form data — adding base form');
      onPickForm(creature, null, null);
    } finally {
      setLoadingForm(null);
    }
  }

  if (loading) {
    return (
      <div className="form-picker">
        <button className="form-picker-back" onClick={onBack}>← back</button>
        <div className="form-picker-header">
          <div className="form-picker-title">
            {creature.name.replace(/-/g, ' ')} — Choose Form
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-picker">
      <button className="form-picker-back" onClick={onBack}>← back</button>
      <div className="form-picker-header">
        <div className="form-picker-title">
          {creature.name.replace(/-/g, ' ')} — Choose Form
        </div>
        <div className="form-picker-subtitle">Select a form to add to your team</div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {options.map((opt) => {
          const disp = opt.creature ?? creature;
          const isLoading = loadingForm !== null && loadingForm === opt.formName;
          return (
            <button
              key={opt.formName ?? 'base'}
              className="form-option-card"
              onClick={() => handlePick(opt)}
              disabled={!!loadingForm}
              aria-label={`Pick ${opt.label}`}
            >
              <div className="foc-sprite">
                <Sprite
                  id={disp.id}
                  kind="pixel"
                  alt={opt.formName ?? creature.name}
                />
              </div>
              <div className="foc-info">
                <div className="foc-label">{opt.label}</div>
                <div className="foc-types">
                  {disp.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                </div>
                {opt.creature && opt.formName !== null && (
                  <div className="foc-bst">
                    BST {opt.creature.bst}
                    {opt.creature.bst !== creature.bst && (
                      <span className={opt.creature.bst > creature.bst ? 'foc-delta pos' : 'foc-delta neg'}>
                        {opt.creature.bst > creature.bst ? '+' : ''}{opt.creature.bst - creature.bst}
                      </span>
                    )}
                  </div>
                )}
                {opt.formName === null && (
                  <div className="foc-bst">BST {creature.bst}</div>
                )}
              </div>
              {isLoading && <div className="foc-spinner" aria-hidden="true" />}
              {!isLoading && <div className="foc-arrow" aria-hidden="true">→</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
