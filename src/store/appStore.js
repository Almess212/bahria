import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Données SST (température surface mer)
  sst: { sst: 16.0, source: 'Cache local', live: false },
  setSst: (data) => set({ sst: data }),

  // Espèce sélectionnée
  selectedSpecies: null,
  setSelectedSpecies: (species) => set({ selectedSpecies: species }),

  // Données d'analyse
  analysisData: null,
  setAnalysisData: (data) => set({ analysisData: data }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Sidebar state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Language
  language: localStorage.getItem('bahria_language') || 'ar',
  setLanguage: (lang) => {
    localStorage.setItem('bahria_language', lang);
    set({ language: lang });
  },

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

export default useAppStore;
