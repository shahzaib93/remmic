import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Feature() {
  return (
    <>
      <Head>
        <title>Feature - REMMIC</title>
        <meta name="description" content="Discover REMMIC's powerful property management features - property overview, mobile access, secure compliance, and automated rent collection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Feature - REMMIC" />
        <meta name="twitter:title" content="Feature - REMMIC" />
        <link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
        <link href="/images/logo.png" rel="apple-touch-icon"/>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="section-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="feature-component">
                    <div className="feature-top-content-wrapper">
                      <div className="section-tag">
                        <div>
                          Feature
                        </div>
                      </div>
                      <h2 className="heading-style-h2">Everything You Need to Run Your Properties—Without the Stress</h2>
                    </div>
                    <div className="padding-bottom padding-large">
                    </div>
                    <div className="feature-bottom-content-wrapper">
                      <div className="feature-bottom-card first-card">
                        <div className="feature-bottom-image-wrapper">
                          <img src="/images/feature-bottom-image-1.png" loading="lazy" sizes="(max-width: 1883px) 100vw, 1883px" alt="Property Overview" className="feature-bottom-image first"/>
                          <div className="feature-bottom-circal">
                          </div>
                        </div>
                        <div className="feature-bottom-content">
                          <h5 className="heading-style-h5">Property Overview</h5>
                          <div className="text-size-regular">
                            Stay in control of your properties anytime, anywhere—right from your phone or tablet.
                          </div>
                        </div>
                      </div>
                      <div className="feature-bottom-card second-card">
                        <div className="feature-bottom-image-wrapper second">
                          <img src="/images/feature-bottom-image-2.png" loading="lazy" sizes="(max-width: 2640px) 100vw, 2640px" alt="Mobile Access" className="feature-bottom-image"/>
                        </div>
                        <div className="feature-bottom-content">
                          <h5 className="heading-style-h5">Mobile Access</h5>
                          <div className="text-size-regular">
                            Stay in control of your properties anytime, anywhere—right from your phone or tablet.
                          </div>
                        </div>
                      </div>
                      <div className="feature-bottom-card third">
                        <div className="feature-bottom-image-wrapper third">
                          <img src="/images/feature-bottom-image-3.png" loading="lazy" sizes="(max-width: 2640px) 100vw, 2640px" alt="Secure and Compliant" className="feature-bottom-image second"/>
                        </div>
                        <div className="feature-bottom-content">
                          <h5 className="heading-style-h5">Secure &amp; Compliant</h5>
                          <div className="text-size-regular">
                            Stay in control of your properties anytime, anywhere—right from your phone or tablet.
                          </div>
                        </div>
                      </div>
                      <div className="feature-bottom-card fourth">
                        <div className="feature-bottom-image-wrapper third">
                          <img src="/images/feature-bottom-image-4.png" loading="lazy" sizes="(max-width: 1229px) 100vw, 1229px" alt="Rent Collection" className="feature-bottom-image second"/>
                        </div>
                        <div className="feature-bottom-content">
                          <h5 className="heading-style-h5">Rent Collection</h5>
                          <div className="text-size-regular">
                            Stay in control of your properties anytime, anywhere—right from your phone or tablet.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}