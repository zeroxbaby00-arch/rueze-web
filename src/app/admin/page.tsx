'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Order, Product, User } from '@/types/database'
import toast from 'react-hot-toast'

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [pendingSellers, setPendingSellers] = useState<User[]>([])
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState('sellers')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAdmin = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const authUser = session?.user ?? null
    if (!authUser) {
      router.push('/auth')
      return
    }

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    setUser(profile)
    fetchData()
    setLoading(false)
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  const fetchData = async () => {
    try {
      // Fetch pending sellers
      const { data: sellers, error: sellersError } = await supabaseAdmin
        .from('sellers')
        .select('*, users(*)')
        .eq('approved', false)

      if (sellersError) {
        console.error('Error fetching sellers:', sellersError)
        toast.error('Failed to fetch sellers')
      } else if (sellers) {
        setPendingSellers(sellers.map(s => s.users))
      }

      // Fetch pending products
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*, users(name)')
        .eq('approved', false)

      if (productsError) {
        console.error('Error fetching products:', productsError)
        toast.error('Failed to fetch products')
      } else if (products) {
        setPendingProducts(products)
      }

      // Fetch all orders
      const { data: allOrders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        toast.error('Failed to fetch orders')
      } else if (allOrders) {
        console.log('Fetched orders:', allOrders)
        setOrders(allOrders)
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      toast.error('Failed to fetch data')
    }
  }

  const approveSeller = async (sellerId: string) => {
    const { error } = await supabaseAdmin
      .from('sellers')
      .update({ approved: true })
      .eq('user_id', sellerId)

    if (error) {
      toast.error('Failed to approve seller')
    } else {
      toast.success('Seller approved!')
      fetchData()
    }
  }

  const approveProduct = async (productId: string) => {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ approved: true })
      .eq('id', productId)

    if (error) {
      toast.error('Failed to approve product')
    } else {
      toast.success('Product approved!')
      fetchData()
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // If approving order, create Pathao delivery
    if (status === 'approved') {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        try {
          const response = await fetch('/api/pathao/create-delivery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              pickupAddress: 'Your Store Address, Dhaka', // This should be configurable
              deliveryAddress: order.address,
              recipientName: 'Customer', // Could get from user profile
              recipientPhone: order.phone,
              itemDescription: `Order #${order.id.slice(-8)}`,
              itemQuantity: order.products.length,
              itemPrice: order.total_price
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            toast.error(`Failed to create delivery: ${errorData.error}`)
            return
          }

          const deliveryData = await response.json()
          toast.success(`Delivery created! Tracking ID: ${deliveryData.delivery_id}`)
        } catch (error) {
          toast.error('Failed to create delivery')
          return
        }
      }
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update order status')
    } else {
      toast.success('Order status updated!')
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Access denied</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'sellers', label: 'Pending Sellers' },
            { id: 'products', label: 'Pending Products' },
            { id: 'orders', label: 'All Orders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab.id
                  ? 'bg-pink-100 text-pink-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'sellers' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending Sellers ({pendingSellers.length})</h2>
            {pendingSellers.length === 0 ? (
              <p className="text-gray-600">No pending sellers</p>
            ) : (
              <div className="space-y-4">
                {pendingSellers.map((seller) => (
                  <div key={seller.id} className="card flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{seller.name}</p>
                      <p className="text-gray-600">{seller.phone}</p>
                    </div>
                    <button
                      onClick={() => approveSeller(seller.id)}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending Products ({pendingProducts.length})</h2>
            {pendingProducts.length === 0 ? (
              <p className="text-gray-600">No pending products</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product) => (
                  <div key={product.id} className="card">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-2">Seller: {product.users?.name}</p>
                    <p className="font-bold mb-4">৳{product.price}</p>
                    <button
                      onClick={() => approveProduct(product.id)}
                      className="w-full btn-primary"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                        <p className="text-gray-600">Total: ৳{order.total_price}</p>
                        <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="px-3 py-1 border border-gray-300 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Address: {order.address}</p>
                      <p>Phone: {order.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}