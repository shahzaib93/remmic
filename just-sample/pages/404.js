import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | REMMIC</title>
        <meta content="Page not found" property="og:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
      </Head>
      
      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper">
          <section style={{padding: '120px 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="container-large">
              <div style={{maxWidth: '600px', margin: '0 auto'}}>
                <h1 style={{fontSize: '8rem', fontWeight: 'bold', color: '#ff5e01', margin: '0 0 20px 0', lineHeight: '1'}}>404</h1>
                <h2 style={{fontSize: '3rem', fontWeight: 'bold', color: '#333', margin: '0 0 20px 0'}}>Page Not Found</h2>
                <p style={{fontSize: '1.2rem', color: '#666', margin: '0 0 40px 0', lineHeight: '1.6'}}>
                  Oops! The page you're looking for seems to have moved or doesn't exist. 
                  Don't worry, let's get you back on track.
                </p>
                <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                  <a href="/" className="button w-inline-block">
                    <div className="button-text">Back to Home</div>
                  </a>
                  <a href="/contact" className="button is-secondary w-inline-block">
                    <div className="button-text">Contact Support</div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      <script src="/scripts/remove-webflow-badge.js"></script>
    </>
  )
}