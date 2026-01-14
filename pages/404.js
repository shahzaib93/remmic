import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | REMMIC</title>
        <meta name="description" content="Page not found" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          minHeight: 'calc(100vh - 200px)',
          background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            margin: '0 auto',
            padding: '48px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '8rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 16px',
              lineHeight: '1'
            }}>
              404
            </h1>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0a0a0a',
              margin: '0 0 16px'
            }}>
              Page Not Found
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              margin: '0 0 40px',
              lineHeight: '1.6'
            }}>
              Oops! The page you're looking for seems to have moved or doesn't exist.
              Don't worry, let's get you back on track.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
                color: '#0a0a0a',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(201, 162, 39, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                ← Back to Home
              </Link>
              <Link href="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'transparent',
                color: '#0a0a0a',
                fontSize: '1rem',
                fontWeight: '600',
                border: '2px solid #0a0a0a',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>
                Contact Support
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
