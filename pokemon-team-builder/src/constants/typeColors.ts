import type { PokemonTypeName } from '../types/pokemon';

/** Hex color for each Pokémon type (DEXMETA palette) */
export const TYPE_HEX: Record<PokemonTypeName, string> = {
  normal:   '#a8a878',
  fire:     '#ff7a3d',
  water:    '#3da3ff',
  electric: '#ffd23d',
  grass:    '#5cc46a',
  ice:      '#7cd6ec',
  fighting: '#d6443f',
  poison:   '#b85cc9',
  ground:   '#dcb44b',
  flying:   '#9eb6ff',
  psychic:  '#ff5fa3',
  bug:      '#aac744',
  rock:     '#b8a557',
  ghost:    '#7a5c9e',
  dragon:   '#7a4dff',
  dark:     '#6e574a',
  steel:    '#b8b8c8',
  fairy:    '#ff9ed6',
};
