'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Order, Product, User, Notification } from '@/types/database'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sellerApproved, setSellerApproved] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'error'>('checking')
  const [statusMessage, setStatusMessage] = useState<string>('Checking auth status...')
  const router = useRouter()

  const checkUser = useCallback(async () => {
    try {
      console.log('Checking user...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const authUser = session?.user ?? null
      console.log('Auth session result:', { authUser, sessionError })

      if (sessionError) {
        setSessionStatus('error')
        setStatusMessage('Auth session error')
        console.error('getSession error:', sessionError)
        router.push('/auth')
        return
      }

      if (!authUser) {
        setSessionStatus('unauthenticated')
        setStatusMessage('Not signed in')
        console.log('No auth user, redirecting to auth')
        router.push('/auth')
        return
      }

      setSessionStatus('authenticated')
      setStatusMessage('Signed in successfully')
      console.log('Fetching profile for user:', authUser.id)
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('Profile fetch result:', { profile, profileError })

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        toast.error('Failed to load profile')
        router.push('/auth')
        return
      }

      if (profile) {
        setUser(profile)

        if (profile.role === 'admin') {
          // Admin can access admin panel
          setSellerApproved(null)
        } else if (profile.role === 'seller') {
          const { data: seller, error: sellerError } = await supabase
            .from('sellers')
            .select('approved')
            .eq('user_id', authUser.id)
            .single()

          console.log('Seller fetch result:', { seller, sellerError })

          const approved = !!seller?.approved
          setSellerApproved(approved)

          if (approved) {
            fetchSellerProducts(authUser.id)
            fetchNotifications(authUser.id)
          }
        } else {
          setSellerApproved(null)
          fetchUserOrders(authUser.id)
        }
      }
    } catch (error) {
      setSessionStatus('error')
      setStatusMessage('Failed to verify auth status')
      toast.error('Failed to load profile')
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching orders:', err)
      setOrders([])
    }
  }

  const fetchSellerProducts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching seller products:', error)
        setProducts([])
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching seller products:', err)
      setProducts([])
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
      } else {
        setNotifications(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err)
      setNotifications([])
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-3">
            <div className="text-lg font-semibold">Loading profile...</div>
            <div className="text-sm text-gray-600">{statusMessage}</div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Please login to view your profile</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium">Auth status: {sessionStatus === 'authenticated' ? 'Signed in' : sessionStatus === 'checking' ? 'Checking...' : sessionStatus === 'unauthenticated' ? 'Not signed in' : 'Error'}</p>
            <p>{statusMessage}</p>
          </div>
        </div>

        {user.role === 'admin' ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <p className="text-gray-600 mb-6">Manage sellers, products, and orders</p>
            <Link href="/admin" className="btn-primary">
              Go to Admin Panel
            </Link>
          </div>
        ) : user.role === 'customer' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                <Link href="/shop" className="btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                        <p className="text-gray-600">Total: ৳{order.total_price}</p>
                        <p className="text-gray-600">Status: <span className="capitalize">{order.status}</span></p>
                        <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{order.address}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          sellerApproved === false ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">Your seller account is pending approval. You cannot add products until an admin approves your seller account.</p>
              <p className="text-gray-500">Please check back later.</p>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Notifications</h2>
                {notifications.length === 0 ? (
                  <p className="text-gray-600">No notifications yet</p>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`card ${!notification.read ? 'border-l-4 border-l-pink-500' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-pink-600 hover:text-pink-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Products</h2>
                <Link href="/seller/add-product" className="btn-primary">
                  Add New Product
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-6">You haven't added any products yet</p>
                  <Link href="/seller/add-product" className="btn-primary">
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
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
                      <p className="text-gray-600 mb-2">৳{product.price}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        Status: {product.approved ? 'Approved' : 'Pending'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  )
}