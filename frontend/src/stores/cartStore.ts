"use client"

import { create } from "zustand"

export interface CartItem {
    id: string
    roomId: string
    roomName: string
    price: number
    date: string
    startTime: string
    endTime: string
    duration: number
    image: string
    location: string
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
    total: number
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    toggleCart: () => void
    openCart: () => void
    closeCart: () => void
    setItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  total: 0,

  addItem: (item) => {
    const newItems = [...get().items, item]
    set({
      items: newItems,
      total: newItems.reduce((sum, i) => sum + i.price * i.duration, 0),
    })
  },

  removeItem: (id) => {
    const filtered = get().items.filter((i) => i.id !== id)
    set({
      items: filtered,
      total: filtered.reduce((sum, i) => sum + i.price * i.duration, 0),
    })
  },

  clearCart: () => set({ items: [], total: 0 }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  openCart: () => set({ isOpen: true }),

  closeCart: () => set({ isOpen: false }),

  setItems: (items) => {
    set({
      items,
      total: items.reduce((sum, i) => sum + i.price * i.duration, 0),
    })
  },
}))
