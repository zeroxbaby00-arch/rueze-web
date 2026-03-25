'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, User, Search, LogIn, Sun, Moon } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'

export default function Header() {
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || null)
      } else {
        setUserRole(null)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUserRole(profile?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            Rueze
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Shop
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-100 text-gray-800 text-xs rounded-full w-5 h-5 flex items-center justify-center dark:bg-pink-900 dark:text-gray-100">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700">
                  <User className="w-5 h-5" />
                </Link>
                {userRole === 'admin' && (
                  <Link href="/admin" className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800">
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/auth" className="flex items-center gap-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}