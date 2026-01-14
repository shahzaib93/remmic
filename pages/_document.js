import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  // Asset URLs - using fallback URLs that work in SSR
  const faviconUrl = '/remmic-logo.svg'
  const appleTouchIconUrl = '/images/logo.png'

  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="generator" content="Next.js" />

        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={appleTouchIconUrl} />
        
        {/* Additional favicon sizes for better compatibility */}
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo.png" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#C49B49" />
        <meta name="msapplication-TileColor" content="#C49B49" />
        
        {/* Preload critical logo asset */}
        <link rel="preload" href="/remmic-logo.svg" as="image" type="image/svg+xml" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
