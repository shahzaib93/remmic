/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double rendering issues
  
  // Optimize webpack for better performance and reduce warnings
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Reduce webpack warnings about missing optional dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Suppress verbose cache warnings from webpack infrastructure logs
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    }

    // Ignore specific webpack warnings
    config.ignoreWarnings = [
      /Module not found.*@next\/swc/,
      /Critical dependency: the request of a dependency is an expression/,
    ]

    // Simplify webpack configuration to prevent chunk issues
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: false,
          default: false,
        },
      }
    }

    return config
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Compiler options
  compiler: {
    // Remove console logs in production only
    removeConsole: false,
  },

  // Disable experimental features that might cause issues
  experimental: {
    // optimizeCss: true, // Disabled to prevent build issues
  },

  // Increase stability
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
