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

  // Reset error state whenever the target sprite changes
  useEffect(() => { setErrored(false); }, [id, kind]);

  const src = errored || kind === 'pixel' ? spritePixel(id) : spriteOfficial(id);

  return (
    <img
      src={src}
      className={className}
      style={{ ...(kind === 'pixel' ? { imageRendering: 'pixelated' as const } : {}), ...style }}
      alt={alt ?? ''}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
