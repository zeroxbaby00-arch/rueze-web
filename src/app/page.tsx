import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const trendingProducts = [
  { id: '1', title: 'Blush Pink Top', price: 650, image: '/placeholder-product-1.jpg' },
  { id: '2', title: 'Gold Pendant', price: 420, image: '/placeholder-product-2.jpg' },
  { id: '3', title: 'Floral Face Mask', price: 280, image: '/placeholder-product-3.jpg' },
  { id: '4', title: 'Couple Keychain', price: 350, image: '/placeholder-product-4.jpg' },
]

const giftCategories = [
  { name: 'For Girlfriend', href: '/shop?sub=girlfriend' },
  { name: 'For Best Friend', href: '/shop?sub=best-friend' },
  { name: 'Under 500 BDT', href: '/shop?sub=under-500' },
  { name: 'Cute & Aesthetic', href: '/shop?sub=cute-aesthetic' },
]

const trustItems = [
  'Cash on Delivery Available',
  'Fast Delivery (2–4 days)',
  'Verified Sellers',
]

const reviews = [
  { name: 'Anika', text: 'This is so cute omg 😭💖', rating: 5 },
  { name: 'Raisa', text: 'Delivery was super fast!', rating: 5 },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-soft-pink to-beige py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-5">
              Aesthetic finds, made for you
            </h1>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-light">
              Curated, premium vibes and gifts tailored for the modern Bangladeshi girl.
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-white px-10 py-3 text-lg font-semibold text-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Trending Now */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Trending Now</h2>
              <Link href="/shop?filter=trending" className="text-pink-500 font-medium hover:text-pink-600">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-48 w-full bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">Image</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-pink-600 font-semibold">৳{product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Perfect Gifts */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Perfect Gifts for Her 💖</h2>
              <p className="text-gray-600 mt-2">Choose thoughtful gifts for every relationship and budget.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {giftCategories.map((gift) => (
                <Link
                  key={gift.name}
                  href={gift.href}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-pink-200 hover:bg-pink-50 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{gift.name}</h3>
                  <p className="text-sm text-gray-500">Explore handpicked items</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-10">Why Trust Rueze?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {trustItems.map((item) => (
                <div key={item} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{item}</h3>
                  <p className="text-gray-500 text-sm">Safe and easy shopping experience.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Rueze */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Why Rueze?</h2>
            <p className="text-gray-700 font-light text-lg mb-8">
              Rueze is built with love for bold, stylish and thoughtful girls in Bangladesh. Every product goes through quality checks and curation from local designers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">Curated products</h3>
                <p className="text-gray-500">Only aesthetic items with premium feel.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">Made for BD</h3>
                <p className="text-gray-500">Localized style, prices and delivery promise.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">Quality checked</h3>
                <p className="text-gray-500">Every order verified by our team.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fake Reviews */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Happy Customers</h2>
              <p className="text-gray-600">Real vibes from the community.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.name} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <p className="text-gray-700 mb-3">“{review.text}”</p>
                  <div className="text-sm font-medium text-gray-900">{review.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}