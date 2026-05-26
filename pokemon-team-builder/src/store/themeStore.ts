import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',

      toggleDark: () =>
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          return { theme: next };
        }),
    }),
    { name: 'pokemon-theme' }
  )
);

export function initTheme() {
  const { theme } = useThemeStore.getState();
  document.documentElement.setAttribute('data-theme', theme ?? 'light');
}
