import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Team() {
  return (
    <>
      <Head>
        <title>Team - REMMIC</title>
        <meta content="Meet the REMMIC team - property management experts" property="og:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
      </Head>
      
      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper">
          {/* Header Section */}
          <header className="section-header">
            <div className="padding-global">
              <div className="container-large">
                <div className="header-component">
                  <div className="header-top-content-wrap">
                    <div className="header-top-card">
                      <h1 className="heading-style-h1">Meet Our</h1>
                    </div>
                    <div className="header-top-card second">
                      <div className="header-top-card-content">
                        <h1 className="heading-style-h1 text-color-brand">Expert Team</h1>
                      </div>
                      <div className="header-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Join Our Team</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Team Section */}
          <section className="section-team">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="team-component">
                    <div className="team-top-content">
                      <div className="team-top-content-wrapper">
                        <div className="section-tag">
                          <div>Team</div>
                        </div>
                        <h2 className="heading-style-h2">The People Behind REMMIC</h2>
                      </div>
                      <div className="text-size-regular">
                        We're a passionate team of property management experts, developers, and customer success specialists dedicated to revolutionizing how you manage your properties.
                      </div>
                    </div>
                    
                    <div className="team-bottom-content">
                      <div className="team-collection-list-wrapper w-dyn-list">
                        <div role="list" className="team-collection-list w-dyn-items">
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/uzair.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Uzair Karghatra</h6>
                                    <div className="text-size-regular">
                                      Head of Product
                                    </div>
                                  </div>
                                  <a href="/member/Uzair-Karghatra" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/junaid.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Junaid Tariq</h6>
                                    <div className="text-size-regular">
                                      Co-Founder & CEO
                                    </div>
                                  </div>
                                  <a href="/member/Junaid-tariq" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="team-collection-list-wrapper right w-dyn-list">
                        <div role="list" className="team-collection-list w-dyn-items">
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/khatam.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">M.Khatam Usmani</h6>
                                    <div className="text-size-regular">
                                      Head of Product
                                    </div>
                                  </div>
                                  <a href="/member/Khatam-Usmani" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/saad.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Saad Bin Khalid</h6>
                                    <div className="text-size-regular">
                                      Product Designer
                                    </div>
                                  </div>
                                  <a href="/member/Saad" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Culture Section */}
          <section className="section-culture" style={{padding: '80px 0', background: '#f9f9f9'}}>
            <div className="padding-global">
              <div className="container-large">
                <div style={{textAlign: 'center', marginBottom: '60px'}}>
                  <h2 className="heading-style-h2">Our Culture & Values</h2>
                  <p style={{fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '20px auto 0'}}>
                    We believe in building more than just software - we're building the future of property management
                  </p>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px'}}>
                  <div style={{textAlign: 'center', padding: '20px'}}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>🚀</div>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px'}}>Innovation</h4>
                    <p style={{color: '#666', lineHeight: '1.6'}}>We constantly push boundaries to create cutting-edge solutions that transform property management.</p>
                  </div>
                  
                  <div style={{textAlign: 'center', padding: '20px'}}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>🤝</div>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px'}}>Collaboration</h4>
                    <p style={{color: '#666', lineHeight: '1.6'}}>Great things happen when we work together, sharing knowledge and supporting each other's growth.</p>
                  </div>
                  
                  <div style={{textAlign: 'center', padding: '20px'}}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎯</div>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px'}}>Excellence</h4>
                    <p style={{color: '#666', lineHeight: '1.6'}}>We strive for excellence in everything we do, from code quality to customer service.</p>
                  </div>
                  
                  <div style={{textAlign: 'center', padding: '20px'}}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>💚</div>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px'}}>Impact</h4>
                    <p style={{color: '#666', lineHeight: '1.6'}}>We're driven by the positive impact we make on our customers' lives and businesses.</p>
                  </div>
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
