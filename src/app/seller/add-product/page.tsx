'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'clothing'
  })

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'rueze_products')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const data = await response.json()
    return data.secure_url
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file))
      const urls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...urls])
      toast.success('Images uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login first')
        router.push('/auth')
        return
      }

      const productData = {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        images,
        category: formData.category,
        seller_id: user.id,
        approved: false
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error

      toast.success('Product submitted for approval!')
      router.push('/profile')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (BDT)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="beauty">Beauty</option>
              <option value="gifts">Gifts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
            {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
          </div>

          {images.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Uploaded Images</label>
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}