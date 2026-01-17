import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function BiddingDetail() {
  const router = useRouter()
  const { id } = router.query
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 8,
    minutes: 5
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Update countdown every minute
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 }
        }
        return prev
      })
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Mock property data - in real app this would come from API
  const property = {
    id: id || '1',
    title: 'Spacious Family Home',
    location: 'F-11, Islamabad',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop&auto=format&q=80',
    size: '1 Kanal',
    bedrooms: 5,
    bathrooms: 6,
    currentBid: '6.8 Crore',
    totalBids: 18,
    description: 'Discover the epitome of luxury living in this stunning 1-Kanal house located in the prestigious F-11 sector of Islamabad. This architectural masterpiece boasts 5 spacious bedrooms with attached modern bathrooms, a state-of-the-art kitchen, and multiple living areas perfect for family gatherings. With high-end finishes, a lush green lawn, and ample parking space, this home offers both comfort and elegance. Ideal for families seeking a premium lifestyle in a secure and serene environment.',
    recentBids: [
      { bidder: 'Ali R.', amount: 'PKR 6.8 Crore' },
      { bidder: 'Fatima K.', amount: 'PKR 6.79 Crore' },
      { bidder: 'Usman S.', amount: 'PKR 6.78 Crore' }
    ]
  }

  return (
    <>
      <Head>
        <title>{property.title} - Bidding Details | REMMIC</title>
        <meta name="description" content={`Bid on ${property.title} in ${property.location}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <div className="padding-global">
            <div className="container-large">
              
              {/* Property Header */}
              <div style={{
                marginBottom: '30px',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease'
              }}>
                <h1 className="heading-style-h1" style={{ marginBottom: '5px' }}>
                  {property.title}
                </h1>
                <p className="text-size-large" style={{ color: '#666' }}>
                  {property.location}
                </p>
              </div>

              {/* Top Grid - Image and Map */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '30px',
                marginBottom: '40px',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease 0.2s'
              }}>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  height: '400px'
                }}>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13277.214150567283!2d72.99479632873167!3d33.70222409893574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbe1b54c86071%3A0x6b772c6383aeb485!2sF-11%2C%20Islamabad%2C%20Islamabad%20Capital%20Territory!5e0!3m2!1sen!2s!4v1693750858567!5m2!1sen!2s"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>

              {/* Bottom Grid - Details and Bidding */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '40px'
              }}>
                
                {/* Property Details */}
                <div style={{
                  background: '#fff',
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s ease 0.4s'
                }}>
                  <h2 className="heading-style-h2" style={{ marginBottom: '20px' }}>
                    Property Details
                  </h2>
                  
                  <div style={{
                    display: 'flex',
                    gap: '30px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                      <span>{property.size}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                      <span>{property.bedrooms} Beds</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  </div>

                  <h3 className="heading-style-h3" style={{ marginTop: '30px', marginBottom: '15px' }}>
                    Description
                  </h3>
                  <p className="text-size-regular" style={{ lineHeight: '1.6' }}>
                    {property.description}
                  </p>
                </div>

                {/* Bidding Box */}
                <div style={{
                  position: 'sticky',
                  top: '120px',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s ease 0.6s'
                }}>
                  <div style={{
                    background: '#fff',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    
                    {/* Countdown */}
                    <div style={{
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      backgroundColor: '#f5f5f5',
                      color: '#000',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                    </div>

                    {/* Current Bid */}
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: 0, color: '#666' }}>Current Bid</p>
                      <span style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#000'
                      }}>
                        PKR {property.currentBid}
                      </span>
                    </div>

                    {/* Total Bids */}
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: 0, color: '#666' }}>Total Bids</p>
                      <span style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#000'
                      }}>
                        {property.totalBids}
                      </span>
                    </div>

                    {/* Bid Form */}
                    <form style={{ marginBottom: '20px' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="bid-amount" style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                          Your Bid Amount (PKR)
                        </label>
                        <input 
                          type="number" 
                          id="bid-amount" 
                          placeholder="68,100,000"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1.2rem',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                        Minimum increment: PKR 100,000
                      </p>
                      <button 
                        type="submit" 
                        className="button is-secondary w-button"
                        style={{
                          width: '100%',
                          padding: '15px',
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          marginBottom: '10px'
                        }}
                      >
                        Place Your Bid
                      </button>
                      <button 
                        type="button" 
                        className="button w-button"
                        style={{
                          width: '100%',
                          padding: '15px',
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          backgroundColor: '#5D5D5D',
                          color: '#fff'
                        }}
                      >
                        Auto Bid
                      </button>
                    </form>

                    {/* Bid History */}
                    <div>
                      <h4 className="heading-style-h4" style={{ marginBottom: '10px' }}>
                        Recent Bids
                      </h4>
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}>
                        {property.recentBids.map((bid, index) => (
                          <li key={index} style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #eee'
                          }}>
                            <strong>{bid.bidder}</strong> - {bid.amount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      <style jsx>{`
        @media (max-width: 992px) {
          .main-wrapper > div > div > div:nth-child(2),
          .main-wrapper > div > div > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
          .main-wrapper > div > div > div:nth-child(3) > div:last-child > div {
            position: static !important;
          }
        }
      `}</style>
    </>
  )
}
