import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Dashboard cache (latest generation only)
  latestGeneration: any | null;
  latestGenerationLastFetch: number | null;
  
  // History cache (all generations)
  allGenerations: any[];
  allGenerationsLastFetch: number | null;
  
  selectedGenerationId: string | null;
  generationsCacheTTL: number; // 5 minutes in ms
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Dashboard cache methods
  setLatestGeneration: (generation: any) => void;
  isLatestGenerationCacheValid: () => boolean;
  invalidateLatestGenerationCache: () => void;
  
  // History cache methods
  setAllGenerations: (generations: any[]) => void;
  isAllGenerationsCacheValid: () => boolean;
  invalidateAllGenerationsCache: () => void;
  
  setSelectedGenerationId: (id: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      // Dashboard cache
      latestGeneration: null,
      latestGenerationLastFetch: null,
      
      // History cache
      allGenerations: [],
      allGenerationsLastFetch: null,
      
      selectedGenerationId: null,
      generationsCacheTTL: 30 * 60 * 1000, // 30 minutes

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Dashboard cache methods
      setLatestGeneration: (latestGeneration) => set({ latestGeneration, latestGenerationLastFetch: Date.now() }),
      isLatestGenerationCacheValid: () => {
        const state = get();
        if (!state.latestGenerationLastFetch || !state.latestGeneration) {
          return false;
        }
        return Date.now() - state.latestGenerationLastFetch < state.generationsCacheTTL;
      },
      invalidateLatestGenerationCache: () => set({ latestGenerationLastFetch: null, latestGeneration: null }),
      
      // History cache methods
      setAllGenerations: (allGenerations) => set({ allGenerations, allGenerationsLastFetch: Date.now() }),
      isAllGenerationsCacheValid: () => {
        const state = get();
        if (!state.allGenerationsLastFetch || state.allGenerations.length === 0) {
          return false;
        }
        return Date.now() - state.allGenerationsLastFetch < state.generationsCacheTTL;
      },
      invalidateAllGenerationsCache: () => set({ allGenerationsLastFetch: null, allGenerations: [] }),
      
      setSelectedGenerationId: (selectedGenerationId) => set({ selectedGenerationId }),
      clearError: () => set({ error: null }),
      logout: () => set({ 
        user: null, 
        token: null, 
        latestGeneration: null,
        allGenerations: [],
        selectedGenerationId: null,
        latestGenerationLastFetch: null,
        allGenerationsLastFetch: null,
      }),
    }),
    {
      name: 'spavix-app-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedGenerationId: state.selectedGenerationId,
        latestGenerationLastFetch: state.latestGenerationLastFetch,
        allGenerationsLastFetch: state.allGenerationsLastFetch,
      }),
    }
  )
);
