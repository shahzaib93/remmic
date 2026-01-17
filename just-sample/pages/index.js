import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [imagesVisible, setImagesVisible] = useState(false)
  const [bottomVisible, setBottomVisible] = useState(false)
  const [blogVisible, setBlogVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [testimonialVisible, setTestimonialVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [ctaVisible, setCtaVisible] = useState(false)
  const blogRef = useRef(null)
  const testimonialRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    const imagesTimer = setTimeout(() => {
      setImagesVisible(true)
    }, 600)
    
    const bottomTimer = setTimeout(() => {
      setBottomVisible(true)
    }, 1200)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(imagesTimer)
      clearTimeout(bottomTimer)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBlogVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (blogRef.current) {
      observer.observe(blogRef.current)
    }

    return () => {
      if (blogRef.current) {
        observer.unobserve(blogRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (blogRef.current) {
        const rect = blogRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const elementTop = rect.top
        const elementHeight = rect.height
        
        // Calculate scroll progress when element is in view
        if (elementTop < windowHeight && elementTop > -elementHeight) {
          const progress = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)))
          setScrollProgress(progress)
        }
      }
    }

    handleScroll() // Initial call
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === testimonialRef.current) {
            setTestimonialVisible(entry.isIntersecting)
          } else if (entry.target === ctaRef.current) {
            setCtaVisible(entry.isIntersecting)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (testimonialRef.current) {
      observer.observe(testimonialRef.current)
    }
    if (ctaRef.current) {
      observer.observe(ctaRef.current)
    }

    return () => {
      if (testimonialRef.current) {
        observer.unobserve(testimonialRef.current)
      }
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current)
      }
    }
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  return (
    <>
      <Head>
        <title>Home - REMMIC</title>
        <meta content="Home - REMMIC" property="og:title"/>
        <meta content="Home - REMMIC" property="twitter:title"/>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <header className="section-about-header">
            <div className="padding-global">
              <div className="container-large">
                <div data-w-id="6f830710-9012-c9b9-0f80-9873ebcfd482" className="about-header-component">
                  <div className="about-header-top-content-wrapper" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, -65px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                    transition: 'transform 800ms ease, opacity 800ms ease'
                  }}>
                    <div className="about-header-top-content">
                      <h2 className="heading-style-h2" 
                          style={{
                            textAlign: 'center', 
                            fontSize: '2.8rem', 
                            lineHeight: '1.3', 
                            fontWeight: 'bold', 
                            margin: '0 auto'
                          }}>
                        One Platform for Smarter <br/>
                        Property Management
                      </h2>
                      <div className="text-size-regular">
                        From seamless listings to secure rent collection — manage your properties with ease, transparency, and control.
                      </div>
                    </div>
                    <a href="/login" className="button is-secondary w-inline-block">
                      <div className="button-text">
                        Get Started
                      </div>
                    </a>
                  </div>
                  <div className="about-image-card-list">
                    <div style={{
                      transform: imagesVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(343px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(-11deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 800ms ease'
                    }} className="about-image-wrapper first">
                      <img src="/house5.jpg" loading="lazy" alt="Contemporary luxury villa exterior" className="about-image"/>
                    </div>
                    <div style={{
                      transform: imagesVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(62px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      zIndex: 2,
                      transition: 'transform 800ms ease 200ms'
                    }} className="about-image-wrapper second">
                      <img src="/house6.jpg" loading="lazy" alt="Modern coastal house with large windows" className="about-image"/>
                    </div>
                    <div style={{
                      transform: imagesVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(-240px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(11deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 800ms ease 400ms'
                    }} className="about-image-wrapper third">
                      <img src="/house7.jpg" loading="lazy" alt="Classic brick townhouse facade" className="about-image"/>
                    </div>
                  </div>
                  <div className="about-header-bottom-content">
                    <div data-w-id="19753702-405b-2898-54ef-b99c9125b831" style={{
                      opacity: bottomVisible ? 1 : 0,
                      transform: bottomVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease, opacity 800ms ease'
                    }} className="text-size-regular text-color-black-800">
                      At Remmic, we're building the future of property management — where landlords, property managers, and tenants stay connected, organized, and stress-free.
                    </div>
                    <div data-w-id="bbf15cac-b772-8866-331b-f5161cfb85c4" style={{
                      opacity: bottomVisible ? 1 : 0,
                      transform: bottomVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease 200ms, opacity 800ms ease 200ms'
                    }} className="text-size-regular text-color-black-800">
                      Born from real frustration with outdated systems, we created a smarter, faster, and more intuitive platform designed to automate the chaos — from listings and lease tracking to rent collection and maintenance requests.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section ref={blogRef} className="section-blog">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="blog-component">
                    <div data-w-id="0fbb8193-5c85-dd1a-5bc6-05d8088310d5" className="blog-top-content-wrapper" style={{
                      opacity: blogVisible ? 1 : 0,
                      transform: blogVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease, opacity 800ms ease'
                    }}>
                      <div className="blog-highlight">
                        <div>Feature</div>
                      </div>
                      <h2 className="heading-style-h2">Stay Informed, Stay Ahead in Real Estate</h2>
                    </div>
                    <div className="blog-bottom-content">
                      <div className="blog-collection-wrap w-dyn-list">
                        <div role="list" className="blog-collection-list w-dyn-items">
                          <div role="listitem" className="blog-collection-item w-dyn-item" style={{
                            opacity: blogVisible ? 1 : 0,
                            transform: `translate3d(0, ${Math.max(0, (1 - scrollProgress) * 50)}px, 0) scale3d(${Math.max(0.95, 0.95 + scrollProgress * 0.05)}, ${Math.max(0.95, 0.95 + scrollProgress * 0.05)}, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)`,
                            transition: blogVisible ? 'opacity 800ms ease 200ms' : 'transform 800ms ease 200ms, opacity 800ms ease 200ms'
                          }}>
                            <a href="/bidding" className="blog-card w-inline-block">
                              <div className="blog-image-wraaper">
                                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=582&h=400&fit=crop&crop=center&auto=format&q=80" loading="lazy" alt="Live Property Auctions" sizes="100vw" className="blog-image"/>
                              </div>
                              <div className="blog-content-wrapper">
                                <div className="blog-card-top-content">
                                  <div className="blog-ctegory">
                                    <div>Live Auctions</div>
                                  </div>
                                  <div className="blog-content">
                                    <h5 className="heading-style-h5">Join Live Property Auctions</h5>
                                    <div className="text-size-regular text-color-black-800">
                                      Participate in real-time property auctions with transparent bidding and competitive pricing. Secure your next investment today.
                                    </div>
                                  </div>
                                </div>
                                <div className="blog-card-bottom-content">
                                  <div className="blog-read-time">
                                  <div className="text-size-small tex-color-black-700 remmic-tag">REMMIC</div>
                                  </div>
                                  <div className="footer-submit-button">
                                    <button type="submit" data-wait="Please wait..." className="button w-inline-block">
                                      <div className="button-text">Start Bidding</div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="blog-collection-wrap w-dyn-list">
                        <div role="list" className="blog-collection-list w-dyn-items">
                          <div role="listitem" className="blog-collection-item w-dyn-item" style={{
                            opacity: blogVisible ? 1 : 0,
                            transform: `translate3d(0, ${Math.max(0, (1 - scrollProgress) * 70)}px, 0) scale3d(${Math.max(0.9, 0.9 + scrollProgress * 0.1)}, ${Math.max(0.9, 0.9 + scrollProgress * 0.1)}, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)`,
                            transition: blogVisible ? 'opacity 800ms ease 400ms' : 'transform 800ms ease 400ms, opacity 800ms ease 400ms'
                          }}>
                            <a href="/property" className="blog-card w-inline-block">
                              <div className="blog-image-wraaper">
                                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=582&h=400&fit=crop&crop=center&auto=format&q=80" loading="lazy" alt="Property Management Services" className="blog-image"/>
                              </div>
                              <div className="blog-content-wrapper">
                                <div className="blog-card-top-content">
                                  <div className="blog-ctegory">
                                    <div>Property Management</div>
                                  </div>
                                  <div className="blog-content">
                                    <h5 className="heading-style-h5">Investment Shares & Rental Management</h5>
                                    <div className="text-size-regular text-color-black-800">
                                      Explore fractional ownership opportunities and comprehensive rental management solutions. Maximize your property investment returns.
                                    </div>
                                  </div>
                                </div>
                                <div className="blog-card-bottom-content">
                                  <div className="blog-read-time">
                                  <div className="text-size-small tex-color-black-700 remmic-tag">REMMIC</div>
                                  </div>
                                  <div className="footer-submit-button">
                                    <button type="submit" data-wait="Please wait..." className="button w-inline-block">
                                      <div className="button-text">Explore Options</div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="blog-collection-wrap w-dyn-list">
                        <div role="list" className="blog-collection-list w-dyn-items">
                          <div role="listitem" className="blog-collection-item w-dyn-item" style={{
                            opacity: blogVisible ? 1 : 0,
                            transform: `translate3d(0, ${Math.max(0, (1 - scrollProgress) * 90)}px, 0) scale3d(${Math.max(0.85, 0.85 + scrollProgress * 0.15)}, ${Math.max(0.85, 0.85 + scrollProgress * 0.15)}, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)`,
                            transition: blogVisible ? 'opacity 800ms ease 600ms' : 'transform 800ms ease 600ms, opacity 800ms ease 600ms'
                          }}>
                            <a href="/evaluation" className="blog-card w-inline-block">
                              <div className="blog-image-wraaper">
                                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=582&h=400&fit=crop&crop=center&auto=format&q=80" loading="lazy" alt="Property Evaluation Services" sizes="100vw" className="blog-image"/>
                              </div>
                              <div className="blog-content-wrapper">
                                <div className="blog-card-top-content">
                                  <div className="blog-ctegory">
                                    <div>Property Evaluation</div>
                                  </div>
                                  <div className="blog-content">
                                    <h5 className="heading-style-h5">AI-Powered Property Valuation</h5>
                                    <div className="text-size-regular text-color-black-800">
                                      Get accurate property valuations with AI-powered analysis and comprehensive market reports. Know your property's true value.
                                    </div>
                                  </div>
                                </div>
                                <div className="blog-card-bottom-content">
                                  <div className="blog-read-time">
                                  <div className="text-size-small tex-color-black-700 remmic-tag">REMMIC</div>
                                  </div>
                                  <div className="footer-submit-button">
                                    <button type="submit" data-wait="Please wait..." className="button w-inline-block">
                                      <div className="button-text">Get Evaluation</div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </a>
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

        <section className="section-cta" ref={ctaRef}>
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div data-w-id="03b4adc1-f918-bae5-37d1-18bef1a11870" className="cta-component" style={{
                  opacity: ctaVisible ? 1 : 0,
                  transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                  transition: 'transform 800ms ease, opacity 800ms ease'
                }}>
                  <div className="cta-content" style={{
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(-30px, 0, 0) scale3d(0.95, 0.95, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                    transition: 'transform 800ms ease 200ms, opacity 800ms ease 200ms'
                  }}>
                    <h2 className="heading-style-h2">Take Control of Your Properties Now</h2>
                    <div className="cta-button-wrapper">
                      <a href="/login" className="button is-secondary w-inline-block" style={{
                        opacity: ctaVisible ? 1 : 0,
                        transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 20px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                        transition: 'transform 600ms ease 400ms, opacity 600ms ease 400ms'
                      }}>
                        <div className="button-text">Get Started</div>
                      </a>
                      <a href="/login" className="button w-inline-block" style={{
                        opacity: ctaVisible ? 1 : 0,
                        transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 20px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                        transition: 'transform 600ms ease 500ms, opacity 600ms ease 500ms'
                      }}>
                        <div className="button-text">Explore</div>
                      </a>
                    </div>
                  </div>
                  <div className="cta-image-wrapper" style={{
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0deg) skew(0, 0)' : 'translate3d(30px, 0, 0) scale3d(0.95, 0.95, 1) rotateX(0) rotateY(0) rotateZ(5deg) skew(0, 0)',
                    transition: 'transform 800ms ease 300ms, opacity 800ms ease 300ms'
                  }}>
                    <img src="/images/3d-models/3dwallpaper.jpg" loading="lazy" sizes="(max-width: 802px) 100vw, 802px" alt="" className="cta-image"/>
                  </div>
                  <div className="cta-glass-image-wrapper" style={{
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0deg) skew(0, 0)' : 'translate3d(0, 0, 0) scale3d(0.8, 0.8, 1) rotateX(0) rotateY(0) rotateZ(-10deg) skew(0, 0)',
                    transition: 'transform 1000ms ease 600ms, opacity 1000ms ease 600ms'
                  }}>
                    <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a33e286e2e1212a5ec3dd9_glass.png" loading="lazy" alt="" className="cta-glass-image"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-testimonial">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div className="testimonial-component">
                  <div data-w-id="7700d1c4-64a2-cbf3-320e-4553985a2ee0" className="testimonial-top-content">
                    <div className="feature-head-line">
                      <div>Testimonial</div>
                    </div>
                    <h2 className="heading-style-h2">Loved by Property Managers Worldwide</h2>
                  </div>
                  <div data-w-id="7700d1c4-64a2-cbf3-320e-4553985a2ee6" className="testimonial-bottom-content-wrap">
                    <div className="testimonial-slider" style={{ position: 'relative', overflow: 'hidden' }}>
                      <div className="testimonial-slider-mask" style={{
                        display: 'flex',
                        transform: `translateX(-${currentSlide * 100}%)`,
                        transition: 'transform 0.5s ease'
                      }}>
                        <div className="testimonial-slide" style={{ minWidth: '100%', flex: '0 0 100%' }}>
                          <div className="testimonial-card">
                            <div className="testimonial-top-content-wrapper">
                              <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546a140f93a4bb33a7a_%E2%80%9C.svg" loading="lazy" alt="" className="testimonial-icon"/>
                              <div className="testimonial-right-star-wrap">
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546883db0097585a1c2_Star%2015.svg" loading="lazy" alt="" className="star-image"/>
                              </div>
                            </div>
                            <h6 className="heading-style-h6 is-testimonial">"I've tried several property management tools, but none compare to this. The dashboards are clear, automation features are fantastic, and everything feels seamless. Rent collection, tenant communication, and lease management are now stress-free. I highly recommend it to anyone managing multiple units. It has truly elevated the way I run my properties."</h6>
                            <div className="testimonial-bottom-content">
                              <div className="testimonial-bottom-left-content">
                                <div className="testimonial-author-image-wrap">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1722605478a79ebf18d8_Testimonial%201.png" loading="lazy" alt="" className="testimonial-author-image"/>
                                </div>
                                <div className="author-content">
                                  <div className="text-size-regular is-black-900">Daniel Reyes</div>
                                  <div className="text-size-small tex-color-black-700">Real Estate Investor</div>
                                </div>
                              </div>
                              <a href="https://x.com/" target="_blank" className="author-social-media-link-wrap w-inline-block">
                                <div className="author-social-media-link">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab181859e87c557d75e6c5_x.com.svg" loading="lazy" alt="" className="social-icon normal"/>
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="social-icon hover"/>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="testimonial-slide" style={{ minWidth: '100%', flex: '0 0 100%' }}>
                          <div className="testimonial-card">
                            <div className="testimonial-top-content-wrapper">
                              <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546a140f93a4bb33a7a_%E2%80%9C.svg" loading="lazy" alt="" className="testimonial-icon"/>
                              <div className="testimonial-right-star-wrap">
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546883db0097585a1c2_Star%2015.svg" loading="lazy" alt="" className="star-image"/>
                              </div>
                            </div>
                            <h6 className="heading-style-h6 is-testimonial">"The customer support team is outstanding! They respond quickly and go above and beyond to help. The platform itself is user-friendly and powerful. I can generate detailed reports, automate routine tasks, and keep everything organized effortlessly. This has become an essential tool for my property management business."</h6>
                            <div className="testimonial-bottom-content">
                              <div className="testimonial-bottom-left-content">
                                <div className="testimonial-author-image-wrap">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1b9515cfbe348db28b32_Rectangle%2064.png" loading="lazy" alt="" className="testimonial-author-image"/>
                                </div>
                                <div className="author-content">
                                  <div className="text-size-regular is-black-900">Sarah Johnson</div>
                                  <div className="text-size-small tex-color-black-700">Property Manager</div>
                                </div>
                              </div>
                              <a href="https://x.com/" target="_blank" className="author-social-media-link-wrap w-inline-block">
                                <div className="author-social-media-link">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab181859e87c557d75e6c5_x.com.svg" loading="lazy" alt="" className="social-icon normal"/>
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="social-icon hover"/>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="testimonial-slide" style={{ minWidth: '100%', flex: '0 0 100%' }}>
                          <div className="testimonial-card">
                            <div className="testimonial-top-content-wrapper">
                              <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546a140f93a4bb33a7a_%E2%80%9C.svg" loading="lazy" alt="" className="testimonial-icon"/>
                              <div className="testimonial-right-star-wrap">
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546cc071081e444df28_Star%2011.svg" loading="lazy" alt="" className="star-image"/>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68aae546883db0097585a1c2_Star%2015.svg" loading="lazy" alt="" className="star-image"/>
                              </div>
                            </div>
                            <h6 className="heading-style-h6 is-testimonial">"Managing multiple properties used to be chaotic, but this platform changed everything. I can track payments, schedule maintenance, and communicate with tenants all in one place. It's intuitive, reliable, and has saved me countless hours each week. Truly a game-changer for property managers!"</h6>
                            <div className="testimonial-bottom-content">
                              <div className="testimonial-bottom-left-content">
                                <div className="testimonial-author-image-wrap">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1bc75dd5d4ab5f790c53_3.png" loading="lazy" alt="" className="testimonial-author-image"/>
                                </div>
                                <div className="author-content">
                                  <div className="text-size-regular is-black-900">Alex Morgan</div>
                                  <div className="text-size-small tex-color-black-700">Landlord & Portfolio Manager</div>
                                </div>
                              </div>
                              <a href="https://x.com/" target="_blank" className="author-social-media-link-wrap w-inline-block">
                                <div className="author-social-media-link">
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab181859e87c557d75e6c5_x.com.svg" loading="lazy" alt="" className="social-icon normal"/>
                                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="social-icon hover"/>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Navigation controls - positioned at the bottom of the card */}
                      <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        zIndex: 10
                      }}>
                        <div className="testimonial-left-arrow" style={{
                          cursor: 'pointer'
                        }} onClick={prevSlide}>
                          <div className="testimonial-arrow-wrap">
                            <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1acd805301b6dbaa349e_Left%20.svg" loading="lazy" alt="" className="normal-arrow"/>
                            <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1acd605478a79ebfddcb_Left%20Hover.svg" loading="lazy" alt="" className="hover-arrow"/>
                          </div>
                        </div>
                        
                        {/* Navigation Dots */}
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center'
                        }}>
                          {[0, 1, 2].map((index) => (
                            <div
                              key={index}
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: currentSlide === index ? '#ff5e01' : '#e5e7eb',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                              }}
                              onClick={() => setCurrentSlide(index)}
                            />
                          ))}
                        </div>
                        
                        <div className="testimonial-right-arrow" style={{
                          cursor: 'pointer'
                        }} onClick={nextSlide}>
                          <div className="testimonial-arrow-wrap">
                            <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1acd1b87ff896e8e5e70_Right%20.svg" loading="lazy" alt="" className="normal-arrow"/>
                            <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ab1acd02e976cbdb58eeb8_Hover%20Right%20.svg" loading="lazy" alt="" className="hover-arrow"/>
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

        <footer className="section-footer">
          <div className="padding-global">
            <div className="container-large">
              <div className="footer-component">
                <div className="footer-top-content">
                  <div className="footer-form-block w-form">
                    <form id="email-form" name="email-form" method="get" className="footer-form">
                      <input className="footer-input w-input" maxLength="256" name="email" placeholder="Enter your email" type="email" id="email" required=""/>
                        <div className="footer-submit-button">
                          <button type="submit" className="button w-inline-block">
                            <div className="button-text">Submit</div>
                          </button>
                        </div>
                    </form>
                    <div className="w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                  <div className="footer-social-link-wrapper">
                    <a href="https://www.instagram.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac246154f611ea1420a7c4_instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461db48f9856f9b7dc5_instagram%2002.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                    </a>
                    <a href="https://x.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2462f03cccc6637bd306_twitter.svg" loading="lazy" alt="X" className="social-link"/>
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="hover-social-link"/>
                    </a>
                    <a href="https://linkedin.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461ba0482ed367c032e_linkedin.svg" loading="lazy" alt="linkdin" className="social-link"/>
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461471a6191f7cb01da_linkedin%2002.svg" loading="lazy" alt="Linkdine" className="hover-social-link"/>
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24610096cecff568c101_facebook.svg" loading="lazy" alt="facebook" className="social-link"/>
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24615c48e8d43a920438_facebook%2002.svg" loading="lazy" alt="Facebook " className="hover-social-link"/>
                    </a>
                  </div>
                </div>
                <div className="footer-card">
                  <div className="text-size-regular">Company</div>
                  <div className="footer-link-list">
                    <a href="/" className="text-size-regular">Home</a>
                    <a href="/about" className="text-size-regular">About</a>
                    <a href="/contact" className="text-size-regular">Contact</a>
                    <a href="/blog" className="text-size-regular">Blog</a>
                  </div>
                </div>
                <div className="footer-card-list">
                  <div className="footer-card">
                    <div className="text-size-regular">Inner page</div>
                    <div className="footer-bottom-link-list">
                      <a href="/feature" className="footer-text">Feature</a>
                      <a href="/team" className="footer-text">Team</a>
                      <a href="/pricing" className="footer-text">Price</a>
                      <a href="/privacy-policy" className="footer-text">Privacy Policy</a>
                      <a href="/terms-and-conditions" className="footer-text">Terms & Conditions</a>
                    </div>
                  </div>
                  <div className="footer-card second">
                    <div className="text-size-regular">Authentication</div>
                    <div className="footer-bottom-link-list">
                      <a href="#" className="footer-text">Login</a>
                      <a href="#" className="footer-text">Sign up</a>
                      <a href="#" className="footer-text">Forgot</a>
                      <a href="#" className="footer-text">Confirm email</a>
                    </div>
                  </div>
                  <div className="footer-card">
                    <div className="text-size-regular">Utility pages</div>
                    <div className="footer-bottom-link-list">
                      <a href="/style-guide" className="footer-text">Style Guide</a>
                      <a href="/change-log" className="footer-text">Change log</a>
                      <a href="/licenses" className="footer-text">Licenses</a>
                      <a href="/protected" className="footer-text">Protected</a>
                    </div>
                  </div>
                </div>
                <div className="footer-botom-content">
                  <div className="text-size-small tex-color-black-700">© 2024 REMMIC. All rights reserved.</div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
