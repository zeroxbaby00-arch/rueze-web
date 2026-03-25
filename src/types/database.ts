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
  stock: number
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
  status: 'pending' | 'approved' | 'packed' | 'shipped' | 'delivered'
  address: string
  phone: string
  delivery_id?: string
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

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'order' | 'approval' | 'delivery'
  read: boolean
  created_at: string
}