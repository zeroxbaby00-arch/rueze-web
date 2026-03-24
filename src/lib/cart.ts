import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  product_id: string
  quantity: number
  price: number
  title: string
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existing = items.find(i => i.product_id === item.product_id)
        if (existing) {
          existing.quantity += item.quantity
          set({ items })
        } else {
          set({ items: [...items, item] })
        }
      },
      removeItem: (product_id) => {
        set({ items: get().items.filter(i => i.product_id !== product_id) })
      },
      updateQuantity: (product_id, quantity) => {
        const items = get().items
        const item = items.find(i => i.product_id === product_id)
        if (item) {
          item.quantity = quantity
          set({ items })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0)
    }),
    {
      name: 'cart-storage'
    }
  )
)