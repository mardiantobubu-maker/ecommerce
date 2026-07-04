const nextConfig = {
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'swiper', 
      '@supabase/supabase-js', 
      'react-hot-toast',
      '@reduxjs/toolkit',
      'next-auth'
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "nrunbiazgozefdxixxib.supabase.co" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "www.seragamsekolah.com" },
      { protocol: "https", hostname: "down-id.img.susercontent.com" },
      { protocol: "https", hostname: "p16-images-sign-sg.tokopedia-static.net" },
      { protocol: "https", hostname: "*.tokopedia-static.net" },
      { protocol: "https", hostname: "www.static-src.com" },
      { protocol: "https", hostname: "siplah.blibli.com" },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
