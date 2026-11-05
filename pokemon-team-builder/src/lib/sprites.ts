// Sprite URLs. Kept free of imports so vite.config.ts can use them to preload the first card's art.

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function spriteOfficial(id: number): string {
  return `${SPRITE_BASE}/other/official-artwork/${id}.png`;
}
export function spritePixel(id: number): string {
  return `${SPRITE_BASE}/${id}.png`;
}

// Official artwork is a 475×475 PNG of ~150 KB. The wsrv.nl proxy resizes it and re-encodes it as
// WebP (~13 KB at 256px) with a one-year cache. `Sprite` falls back to the raw PNG if the proxy fails.
// 256 rather than 240: Chrome picks the smallest copy at or above the screen's pixel ratio, and a
// 2-column phone grid at 1.75x needs ~245px.
const OFFICIAL_ART_WIDTHS = [160, 256, 320, 475] as const;

export function spriteOfficialResized(id: number, width: number): string {
  return `https://wsrv.nl/?url=${spriteOfficial(id).replace('https://', '')}&w=${width}&output=webp`;
}
export function spriteOfficialSrcSet(id: number): string {
  return OFFICIAL_ART_WIDTHS.map((w) => `${spriteOfficialResized(id, w)} ${w}w`).join(', ');
}

/** Rendered width of a dex card's artwork: two columns on phones, ~200px cards otherwise. */
export const CARD_ART_SIZES = '(max-width: 600px) 34vw, 200px';
