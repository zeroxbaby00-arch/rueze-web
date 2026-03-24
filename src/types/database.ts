export interface User {
  id: string
  name: string
  phone: string
  role: 'customer' | 'seller' | 'admin'
  created_at: string
}

export interface Product {
  id: string
  title: string
  price: number
  description: string
  images: string[]
  category: string
  seller_id: string
  approved: boolean
  created_at: string
  users?: {
    name: string
  }
}

export interface Order {
  id: string
  user_id: string
  products: OrderItem[]
  total_price: number
  status: 'pending' | 'packed' | 'shipped' | 'delivered'
  address: string
  phone: string
  created_at: string
}

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

export interface Seller {
  id: string
  user_id: string
  approved: boolean
  created_at: string
}