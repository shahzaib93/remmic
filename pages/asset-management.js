import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function AssetManagement() {
  const { user: firebaseUser, getProperties } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const loadProperties = async () => {
      if (user) {
        try {
          const result = await getProperties({ userId: user.id })
          if (result?.success) {
            setProperties(result.properties || [])
          }
        } catch (e) {
          const stored = localStorage.getItem('userProperties')
          if (stored) {
            setProperties(JSON.parse(stored))
          } else {
            setProperties([
              {
                id: '1',
                title: 'DHA Phase 6 Commercial Plot',
                type: 'Commercial',
                location: 'DHA Phase 6, Lahore',
                area: '500 sq yards',
                status: 'verified',
                tenantStatus: 'occupied',
                monthlyRent: 150000,
                nextPayment: '2024-02-01',
                maintenanceRequests: 2,
                image: '/property-1.jpg'
              },
              {
                id: '2',
                title: 'Bahria Town Villa',
                type: 'Residential',
                location: 'Bahria Town, Islamabad',
                area: '10 Marla',
                status: 'verified',
                tenantStatus: 'vacant',
                monthlyRent: 0,
                maintenanceRequests: 0,
                image: '/property-2.jpg'
              }
            ])
          }
        }
      }
    }
    loadProperties()
  }, [user])

  const formatCurrency = (value) => {
    if (!value) return 'PKR 0'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'PKR 0'
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)} Lac`
    return `PKR ${num.toLocaleString()}`
  }

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'all') return true
    if (activeTab === 'occupied') return p.tenantStatus === 'occupied'
    if (activeTab === 'vacant') return p.tenantStatus === 'vacant'
    return true
  })

  const totalRent = properties.filter(p => p.tenantStatus === 'occupied').reduce((sum, p) => sum + (p.monthlyRent || 0), 0)
  const occupiedCount = properties.filter(p => p.tenantStatus === 'occupied').length
  const pendingMaintenance = properties.reduce((sum, p) => sum + (p.maintenanceRequests || 0), 0)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Asset Management - REMMIC</title>
        <meta name="description" content="Manage your real estate assets on REMMIC" />
      </Head>

      <Navbar />

      <main className="asset-page">
        <section className="asset-header">
          <div className="asset-header__container">
            <div>
              <h1>Asset Management</h1>
              <p>Manage your properties, tenants, and maintenance</p>
            </div>
            <a href="/land-registration" className="add-btn">+ Add Property</a>
          </div>
        </section>

        <section className="asset-stats">
          <div className="asset-stats__container">
            <div className="stat-card">
              <span className="stat-label">Total Properties</span>
              <span className="stat-value">{properties.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Occupied</span>
              <span className="stat-value">{occupiedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Monthly Rent Income</span>
              <span className="stat-value">{formatCurrency(totalRent)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pending Maintenance</span>
              <span className="stat-value">{pendingMaintenance}</span>
            </div>
          </div>
        </section>

        <section className="asset-filters">
          <div className="asset-filters__container">
            <button className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
            <button className={`filter-btn ${activeTab === 'occupied' ? 'active' : ''}`} onClick={() => setActiveTab('occupied')}>Occupied</button>
            <button className={`filter-btn ${activeTab === 'vacant' ? 'active' : ''}`} onClick={() => setActiveTab('vacant')}>Vacant</button>
          </div>
        </section>

        <section className="asset-list">
          <div className="asset-list__container">
            {filteredProperties.length === 0 ? (
              <div className="no-assets">
                <h3>No properties found</h3>
                <p>Register your first property to get started</p>
                <a href="/land-registration" className="cta-btn">Register Property</a>
              </div>
            ) : (
              <div className="asset-grid">
                {filteredProperties.map((property) => (
                  <article key={property.id} className="asset-card">
                    <div className="asset-card__image">
                      <img src={property.image || '/placeholder.jpg'} alt={property.title} onError={(e) => { e.target.src = '/placeholder.jpg' }} />
                      <span className={`tenant-badge ${property.tenantStatus}`}>
                        {property.tenantStatus === 'occupied' ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <h3>{property.title}</h3>
                      <p className="location">{property.location}</p>
                      <div className="asset-details">
                        <span>{property.type}</span>
                        <span>{property.area}</span>
                      </div>
                      {property.tenantStatus === 'occupied' && (
                        <div className="rent-info">
                          <span className="rent-label">Monthly Rent</span>
                          <span className="rent-value">{formatCurrency(property.monthlyRent)}</span>
                        </div>
                      )}
                    </div>
                    <div className="asset-card__footer">
                      <a href={`/property/${property.id}`} className="view-btn">View Details</a>
                      {property.maintenanceRequests > 0 && (
                        <span className="maintenance-badge">{property.maintenanceRequests} Requests</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .asset-page { min-height: 100vh; background: #f9fafb; padding-top: 90px; }
        .asset-header { background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%); padding: 60px 5%; }
        .asset-header__container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .asset-header h1 { font-size: 2rem; color: #fff; margin: 0 0 8px; }
        .asset-header p { color: rgba(255,255,255,0.6); margin: 0; }
        .add-btn { padding: 14px 28px; background: linear-gradient(135deg, #c9a227, #d4b13d); color: #0a0a0a; font-weight: 600; text-decoration: none; border-radius: 10px; }
        .asset-stats { padding: 0 5%; margin-top: -30px; }
        .asset-stats__container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .stat-label { display: block; font-size: 0.8125rem; color: #6b7280; margin-bottom: 8px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #0a0a0a; }
        .asset-filters { padding: 40px 5% 20px; }
        .asset-filters__container { max-width: 1200px; margin: 0 auto; display: flex; gap: 8px; }
        .filter-btn { padding: 10px 20px; background: #fff; border: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875rem; border-radius: 100px; cursor: pointer; }
        .filter-btn.active { background: linear-gradient(135deg, #c9a227, #d4b13d); border-color: transparent; color: #0a0a0a; }
        .asset-list { padding: 20px 5% 80px; }
        .asset-list__container { max-width: 1200px; margin: 0 auto; }
        .no-assets { text-align: center; padding: 80px 20px; background: #fff; border-radius: 20px; }
        .no-assets h3 { font-size: 1.5rem; color: #0a0a0a; margin: 0 0 8px; }
        .no-assets p { color: #6b7280; margin: 0 0 24px; }
        .cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #c9a227, #d4b13d); color: #0a0a0a; font-weight: 600; text-decoration: none; border-radius: 10px; }
        .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        .asset-card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .asset-card__image { position: relative; height: 180px; }
        .asset-card__image img { width: 100%; height: 100%; object-fit: cover; }
        .tenant-badge { position: absolute; top: 12px; right: 12px; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; border-radius: 100px; }
        .tenant-badge.occupied { background: rgba(16,185,129,0.9); color: #fff; }
        .tenant-badge.vacant { background: rgba(245,158,11,0.9); color: #fff; }
        .asset-card__body { padding: 20px; }
        .asset-card__body h3 { font-size: 1.125rem; font-weight: 700; color: #0a0a0a; margin: 0 0 8px; }
        .location { font-size: 0.875rem; color: #6b7280; margin: 0 0 12px; }
        .asset-details { display: flex; gap: 12px; margin-bottom: 16px; }
        .asset-details span { padding: 4px 12px; background: #f3f4f6; font-size: 0.75rem; color: #374151; border-radius: 100px; }
        .rent-info { padding: 12px; background: rgba(201,162,39,0.1); border-radius: 10px; display: flex; justify-content: space-between; }
        .rent-label { font-size: 0.8125rem; color: #6b7280; }
        .rent-value { font-weight: 700; color: #c9a227; }
        .asset-card__footer { padding: 16px 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .view-btn { font-size: 0.875rem; font-weight: 600; color: #c9a227; text-decoration: none; }
        .maintenance-badge { padding: 4px 10px; background: rgba(239,68,68,0.1); color: #ef4444; font-size: 0.75rem; font-weight: 600; border-radius: 100px; }
        @media (max-width: 1024px) { .asset-stats__container { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .asset-stats__container { grid-template-columns: 1fr; } .asset-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
