import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// Fonction utilitaire pour appliquer le thème au DOM
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Vérifier si le système préfère le mode sombre
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Appliquer le thème initial
applyTheme(prefersDarkMode);

export const useTheme = create<ThemeState>(
  persist(
    (set) => ({
      isDark: prefersDarkMode,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        applyTheme(newIsDark);
        return { isDark: newIsDark };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Appliquer le thème au chargement
const savedState = JSON.parse(localStorage.getItem('theme-storage') || '{}');
if (savedState.state?.isDark !== undefined) {
  applyTheme(savedState.state.isDark);
}