# Rueze - Aesthetic Marketplace

A modern, minimalist e-commerce marketplace website focused on girls' fashion, accessories, beauty, and aesthetic items.

## Features

- **User Side**: Browse products by category, search, cart, checkout with Cash on Delivery
- **Seller System**: Dashboard to add products and view orders
- **Admin Panel**: Approve sellers/products, manage orders, analytics
- **Minimalist Design**: Clean UI with soft pink, beige, and light grey colors

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT-based authentication
- **File Upload**: Cloudinary

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file from the `.env.local.example` file and fill in your Supabase and Cloudinary credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the browser client.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used only on the server for admin operations.

**Note**: Never commit your `.env.local` file. Keep the service role key secret. You can find both Supabase keys in your Supabase dashboard under Settings > API.

## Deployment

- **Frontend**: Vercel
- **Backend**: Supabase
- **Database**: Supabase

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable components
- `src/lib/` - Utility functions and configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request