'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search } from 'lucide-react'
import { useCartStore } from '@/lib/cart'

export default function Header() {
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Rueze
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors">
              Shop
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-100 text-gray-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}