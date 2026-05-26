import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDark: () =>
        set((state) => {
          const next = !state.isDark;
          // Keep the <html> class in sync whenever the store changes
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
    }),
    { name: 'pokemon-theme' }
  )
);

/** Call once at app startup to sync the class with the persisted value */
export function initTheme() {
  const isDark = useThemeStore.getState().isDark;
  document.documentElement.classList.toggle('dark', isDark);
}
