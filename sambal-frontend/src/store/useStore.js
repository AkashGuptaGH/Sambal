import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  role: 'user', // 'user' or 'admin'
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  clearUser: () => set({ user: null, role: 'user' }),

  weatherData: null,
  setWeatherData: (data) => set({ weatherData: data }),

  claimsHistory: [],
  addClaim: (claim) => 
    set((state) => ({ claimsHistory: [claim, ...state.claimsHistory] })),
  setClaims: (claims) => set({ claimsHistory: claims }),
}));

export default useStore;
