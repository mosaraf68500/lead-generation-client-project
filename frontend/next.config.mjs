/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Transparent-PNG hosts. The home hero uses a cut-out person
      // PNG (no background) so the brand color shows through behind
      // them. Add new hosts here if you swap the asset.
      { protocol: 'https', hostname: 'pngimg.com' },
      { protocol: 'https', hostname: 'www.pngall.com' },
      { protocol: 'https', hostname: 'www.pngmart.com' },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
