import { useState, useEffect } from 'react';
import { spriteOfficial, spritePixel } from '../../lib/pokeapi';

interface SpriteProps {
  id: number;
  kind?: 'official' | 'pixel';
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function Sprite({ id, kind = 'official', className, alt, style }: SpriteProps) {
  const [errored, setErrored] = useState(false);
  const [triedBoth, setTriedBoth] = useState(false);

  // Reset error state whenever the target sprite changes
  useEffect(() => { setErrored(false); setTriedBoth(false); }, [id, kind]);

  const primary = kind === 'pixel' ? spritePixel(id) : spriteOfficial(id);
  const fallback = kind === 'pixel' ? spriteOfficial(id) : spritePixel(id);
  const src = triedBoth ? '/not_found.png' : errored ? fallback : primary;

  return (
    <img
      src={src}
      className={className}
      style={{ ...(kind === 'pixel' ? { imageRendering: 'pixelated' as const } : {}), ...style }}
      alt={alt ?? ''}
      loading="lazy"
      onError={() => {
        if (errored && !triedBoth) {
          setTriedBoth(true);
        } else {
          setErrored(true);
        }
      }}
    />
  );
}
