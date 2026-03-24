'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { Minus, Plus, Trash2 } from 'lucide-react'

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()

  const total = getTotal()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {items.map((item) => (
                <div key={item.product_id} className="card mb-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-2">৳{item.price}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 border rounded">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">৳{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="card h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full btn-primary py-3 text-center block"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="w-full btn-secondary py-2 text-center block mt-2"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}