import { useState } from 'react';
import { CARD_ART_SIZES, spriteOfficial, spriteOfficialResized, spriteOfficialSrcSet, spritePixel } from '../../lib/sprites';

const NOT_FOUND = `${import.meta.env.BASE_URL}not_found.png`;

interface SpriteProps {
  id: number;
  kind?: 'official' | 'pixel';
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  /** Fetch now at high priority, for art that's on screen at load. Everything else loads lazily. */
  priority?: boolean;
  /** Rendered width of official artwork, so the browser picks the smallest resized copy that fits. */
  sizes?: string;
}

export function Sprite({ id, kind = 'official', className, alt, style, priority = false, sizes = CARD_ART_SIZES }: SpriteProps) {
  // Each failed source moves one step down the chain; a new id or kind starts over at the top.
  const key = `${kind}:${id}`;
  const [failed, setFailed] = useState({ key, count: 0 });
  const stage = failed.key === key ? failed.count : 0;

  const sources = kind === 'pixel'
    ? [spritePixel(id), spriteOfficial(id)]
    : [spriteOfficialResized(id, 256), spriteOfficial(id), spritePixel(id)];
  const src = sources[stage] ?? NOT_FOUND;
  const srcSet = kind === 'official' && stage === 0 ? spriteOfficialSrcSet(id) : undefined;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      className={className}
      style={{ ...(kind === 'pixel' ? { imageRendering: 'pixelated' as const } : {}), ...style }}
      alt={alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      // React 18 only passes the lowercase spelling through to the DOM.
      {...(priority ? { fetchpriority: 'high' } : {})}
      onError={() => {
        if (stage < sources.length) setFailed({ key, count: stage + 1 });
      }}
    />
  );
}
