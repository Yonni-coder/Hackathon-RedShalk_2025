import { create } from "zustand"

export const useAuthStore = create((set, get) => ({
  user: null,
  authenticated: false,

  setUser: (user) => {
    set({ user, authenticated: !!user })
  },

  isAuthenticated: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) {
        set({ user: null, authenticated: false })
        return false
      }

      const data = await res.json()
      set({ user: data, authenticated: !!data })
      return !!data.user
    } catch (err) {
      console.error("isAuthenticated error:", err)
      set({ user: null, authenticated: false })
      return false
    }
  },

  logout: async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      set({ user: null, authenticated: false })
    }
  },

}))
