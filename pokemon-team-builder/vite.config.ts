import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { CARD_ART_SIZES, spriteOfficialResized, spriteOfficialSrcSet } from './src/lib/sprites.ts'

/**
 * The dex opens on #1, and its art is the page's largest paint. Preloading it from the HTML lets it
 * download alongside the JS and dex.json instead of waiting for them and the first render.
 */
function preloadFirstCardArt(): Plugin {
  return {
    name: 'preload-first-card-art',
    transformIndexHtml: () => [{
      tag: 'link',
      injectTo: 'head',
      attrs: {
        rel: 'preload',
        as: 'image',
        href: spriteOfficialResized(1, 256),
        imagesrcset: spriteOfficialSrcSet(1),
        imagesizes: CARD_ART_SIZES,
        fetchpriority: 'high',
      },
    }],
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFirstCardArt()],
  base: '/pokemonLookUp/',
  build: {
    // Small font subsets would otherwise be inlined as base64 into the render-blocking stylesheet,
    // even though the browser only downloads the subsets a page actually uses.
    assetsInlineLimit: (filePath) => (/\.woff2?$/.test(filePath) ? false : undefined),
  },
  test: {
    environment: 'jsdom',
  },
})
