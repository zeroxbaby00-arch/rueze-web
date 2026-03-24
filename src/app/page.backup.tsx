import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-50 to-beige-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Aesthetic finds, made for you
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover cute aesthetic items, perfect gifts, and everything beautiful for the modern girl.
            </p>
            <Link href="/shop" className="btn-primary text-lg px-8 py-3">
              Shop Now
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Clothing', href: '/shop?category=clothing' },
                { name: 'Accessories', href: '/shop?category=accessories' },
                { name: 'Beauty', href: '/shop?category=beauty' },
                { name: 'Gifts', href: '/shop?category=gifts' }
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="card text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Sections */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Trending Now</h3>
                <p className="text-gray-600 mb-6">Discover the latest aesthetic trends</p>
                <Link href="/shop?filter=trending" className="btn-primary">
                  Explore
                </Link>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Perfect Gifts for Her</h3>
                <p className="text-gray-600 mb-6">Find the perfect gift for your special someone</p>
                <Link href="/shop?category=gifts" className="btn-primary">
                  Shop Gifts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}