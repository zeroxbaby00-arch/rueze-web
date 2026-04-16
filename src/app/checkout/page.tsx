'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/lib/cart'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  const total = getTotal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)

    try {
      let userId

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      if (user) {
        // User is logged in
        userId = user.id
      } else {
        // Create guest account automatically
        const guestEmail = `guest_${Date.now()}@rueze.com`
        const guestPassword = Math.random().toString(36) + Date.now().toString(36)

        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: guestEmail,
            password: guestPassword,
            role: 'customer'
          })
        })

        const registerResult = await registerResponse.json()
        if (!registerResponse.ok) {
          throw new Error(registerResult.error || 'Failed to create guest checkout account')
        }

        // Sign in the guest user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: guestEmail,
          password: guestPassword
        })

        if (signInError) throw signInError

        userId = signInData.user?.id
      }

      // Check stock availability and get product details
      const productIds = items.map(item => item.product_id)
      const { data: products } = await supabase
        .from('products')
        .select('id, title, stock, seller_id')
        .in('id', productIds)

      if (products) {
        for (const item of items) {
          const product = products.find(p => p.id === item.product_id)
          if (product && product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stock}`)
          }
        }
      }

      // Create order
      const orderData = {
        user_id: userId,
        products: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total_price: total,
        status: 'pending',
        address: formData.address,
        phone: formData.phone
      }

      const { error } = await supabase
        .from('orders')
        .insert([orderData])

      if (error) throw error

      // Update stock
      if (products) {
        for (const item of items) {
          const product = products.find(p => p.id === item.product_id)
          if (product) {
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.product_id)

            if (stockError) {
              console.error('Failed to update stock:', stockError)
            }
          }
        }
      }

      // Notify sellers
      if (products) {
        const sellerNotifications = products.map(product => {
          const orderItem = items.find(item => item.product_id === product.id)
          return {
            user_id: product.seller_id,
            title: 'New Order Received',
            message: `You have received an order for "${product.title}" (Quantity: ${orderItem?.quantity}). Please prepare the item for delivery.`,
            type: 'order'
          }
        })

        await supabase
          .from('notifications')
          .insert(sellerNotifications)
      }

      toast.success('Order placed successfully! Cash on Delivery.')
      clearCart()
      router.push('/shop')
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <a href="/shop" className="btn-primary">
              Continue Shopping
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-bold">৳{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>৳{total}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <h2 className="text-xl font-bold mb-4">Delivery Information</h2>

            {/* Account Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Shopping as guest</p>
                  <p className="text-sm text-gray-600">No account required • Order tracking not available</p>
                </div>
                <a
                  href="/auth"
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Login to track orders →
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Cash on Delivery:</strong> Pay when you receive your order. No advance payment required.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}