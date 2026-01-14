// Assets management utility for REMMIC
// Handles logo and asset URLs from containerized services

const ASSETS_CONFIG = {
  // Asset server base URL (can be overridden by environment)
  baseUrl: process.env.NEXT_PUBLIC_ASSETS_URL || process.env.ASSETS_BASE_URL || 
           (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8080` : 'http://localhost:8080'),
  
  // MinIO base URL for direct S3 access
  minioUrl: process.env.MINIO_PUBLIC_URL || 
            (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:9000` : 'http://localhost:9000'),
  
  // CDN URL (for production)
  cdnUrl: process.env.CDN_BASE_URL,
  
  // Fallback to local assets served by Next.js
  fallbackUrl: '',
  
  // Local fallback logo
  fallbackLogo: '/remmic-logo.svg',
  
  // Asset server enabled only when explicitly requested
  useAssetServer: process.env.NEXT_PUBLIC_USE_ASSET_SERVER === 'true'
};

/**
 * Get the optimal asset URL with fallbacks
 * @param {string} assetPath - The asset path
 * @param {object} options - Options for URL generation
 * @returns {string} - The asset URL
 */
export function getAssetUrl(assetPath, options = {}) {
  const { 
    preferCdn = true, 
    preferOptimized = true,
    fallback = true 
  } = options;

  // Use CDN in production if available
  if (preferCdn && ASSETS_CONFIG.cdnUrl && process.env.NODE_ENV === 'production') {
    return `${ASSETS_CONFIG.cdnUrl}${assetPath}`;
  }

  // Use asset server for optimized assets if enabled
  if (preferOptimized && ASSETS_CONFIG.useAssetServer) {
    return `${ASSETS_CONFIG.baseUrl}${assetPath}`;
  }

  // Fallback to local assets
  if (fallback) {
    return `${ASSETS_CONFIG.fallbackUrl}${assetPath}`;
  }

  return assetPath;
}

/**
 * Get REMMIC logo URL with format and size options
 * @param {object} options - Logo options
 * @returns {string} - Logo URL
 */
export function getLogoUrl(options = {}) {
  const {
    format = 'svg',
    size = 'medium',
    optimized = true,
    fallback = true
  } = options;

  // Logo endpoint mapping
  const logoEndpoints = {
    svg: {
      small: '/logo-small.svg',
      medium: '/logo.svg',
      large: '/logo.svg'
    },
    png: {
      thumb: '/optimized/logos/remmic-logo-thumb.png',
      small: '/optimized/logos/remmic-logo-small.png',
      medium: '/optimized/logos/remmic-logo.png',
      large: '/optimized/logos/remmic-logo-large.png'
    },
    webp: {
      small: '/optimized/logos/remmic-logo-small.webp',
      medium: '/optimized/logos/remmic-logo.webp',
      large: '/optimized/logos/remmic-logo.webp'
    },
    ico: {
      medium: '/logo-favicon.ico'
    }
  };

  // Get the appropriate endpoint
  const endpoint = logoEndpoints[format]?.[size] || logoEndpoints.svg.medium;
  
  // If asset server is disabled or not available, use local fallback
  if (!ASSETS_CONFIG.useAssetServer || !optimized) {
    return ASSETS_CONFIG.fallbackLogo;
  }

  try {
    return getAssetUrl(endpoint, { preferOptimized: optimized, fallback: false });
  } catch (error) {
    // If asset server is not available, fallback to local logo
    if (fallback) {
      console.warn('Asset server unavailable, using fallback logo:', error);
      return ASSETS_CONFIG.fallbackLogo;
    }
    throw error;
  }
}

/**
 * Get favicon URL
 * @returns {string} - Favicon URL
 */
export function getFaviconUrl() {
  if (!ASSETS_CONFIG.useAssetServer) {
    return ASSETS_CONFIG.fallbackLogo;
  }
  return getAssetUrl('/optimized/logos/favicon.ico');
}

/**
 * Get Apple touch icon URL
 * @returns {string} - Apple touch icon URL
 */
export function getAppleTouchIconUrl() {
  if (!ASSETS_CONFIG.useAssetServer) {
    return '/images/logo.png';
  }
  return getAssetUrl('/optimized/logos/apple-touch-icon.png');
}

/**
 * Get responsive logo sources for picture element
 * @param {object} options - Options for responsive images
 * @returns {object} - Responsive image sources
 */
export function getResponsiveLogoSources(options = {}) {
  const { sizes = ['small', 'medium', 'large'] } = options;
  
  return {
    webp: sizes.map(size => ({
      srcSet: getLogoUrl({ format: 'webp', size }),
      media: size === 'small' ? '(max-width: 768px)' : 
             size === 'medium' ? '(max-width: 1200px)' : 
             '(min-width: 1201px)'
    })),
    png: sizes.map(size => ({
      srcSet: getLogoUrl({ format: 'png', size }),
      media: size === 'small' ? '(max-width: 768px)' : 
             size === 'medium' ? '(max-width: 1200px)' : 
             '(min-width: 1201px)'
    })),
    fallback: getLogoUrl({ format: 'svg', size: 'medium' })
  };
}

/**
 * Preload critical assets
 * @param {array} assets - Array of asset paths to preload
 */
export function preloadAssets(assets = []) {
  if (typeof window === 'undefined') return;

  // Default critical assets
  const defaultAssets = [
    getLogoUrl({ format: 'svg', size: 'medium' }),
    getLogoUrl({ format: 'webp', size: 'medium' }),
    getFaviconUrl()
  ];

  const allAssets = [...defaultAssets, ...assets];

  allAssets.forEach(assetUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = assetUrl;
    
    // Determine the appropriate 'as' attribute
    if (assetUrl.includes('.svg')) {
      link.as = 'image';
      link.type = 'image/svg+xml';
    } else if (assetUrl.includes('.webp')) {
      link.as = 'image';
      link.type = 'image/webp';
    } else if (assetUrl.includes('.png') || assetUrl.includes('.jpg')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Check if asset server is available
 * @returns {Promise<boolean>} - Asset server availability
 */
export async function checkAssetServerHealth() {
  try {
    const response = await fetch(`${ASSETS_CONFIG.baseUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('Asset server health check failed:', error);
    return false;
  }
}

/**
 * Get asset manifest from server
 * @returns {Promise<object>} - Asset manifest
 */
export async function getAssetManifest() {
  try {
    const response = await fetch(`${ASSETS_CONFIG.baseUrl}/manifest.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch asset manifest:', error);
  }
  
  // Return default manifest
  return {
    version: '1.0.0',
    assets: {
      logos: {
        main: {
          svg: getLogoUrl({ format: 'svg' }),
          png: getLogoUrl({ format: 'png' }),
          webp: getLogoUrl({ format: 'webp' })
        }
      }
    }
  };
}

/**
 * Logo component props helper
 * @param {object} options - Component options
 * @returns {object} - Props for logo component
 */
export function getLogoProps(options = {}) {
  const {
    size = 'medium',
    alt = 'REMMIC Logo',
    className = 'logo',
    priority = true
  } = options;

  return {
    src: getLogoUrl({ format: 'svg', size }),
    alt,
    className,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    // Add responsive sources for modern browsers
    ...getResponsiveLogoSources({ sizes: [size] })
  };
}

// Export asset configuration for debugging
export { ASSETS_CONFIG };

// Default export with commonly used functions
export default {
  getAssetUrl,
  getLogoUrl,
  getFaviconUrl,
  getAppleTouchIconUrl,
  getResponsiveLogoSources,
  getLogoProps,
  preloadAssets,
  checkAssetServerHealth,
  getAssetManifest,
  config: ASSETS_CONFIG
};
