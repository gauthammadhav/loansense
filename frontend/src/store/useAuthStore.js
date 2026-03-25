import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      
      setAuth: (user, token, role) => set({ 
        user, 
        token, 
        role, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        role: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'loansense-auth-storage',
    }
  )
)
