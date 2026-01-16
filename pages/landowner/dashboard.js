import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import {
  getDevelopmentProjects,
  getDocuments,
  DEVELOPMENT_PROJECT_STATUS
} from '../../lib/firebase'

const STATUS_LABELS = {
  under_evaluation: 'Under Evaluation',
  evaluated: 'Evaluated',
  project_structured: 'Project Structured',
  funding_open: 'Funding Open',
  funded: 'Funded',
  under_development: 'Under Development',
  completed: 'Completed'
}

const STATUS_COLORS = {
  under_evaluation: { bg: '#fef3c7', color: '#d97706' },
  evaluated: { bg: '#dbeafe', color: '#2563eb' },
  project_structured: { bg: '#e0e7ff', color: '#4f46e5' },
  funding_open: { bg: '#d1fae5', color: '#059669' },
  funded: { bg: '#cffafe', color: '#0891b2' },
  under_development: { bg: '#fce7f3', color: '#db2777' },
  completed: { bg: '#d1fae5', color: '#065f46' }
}

export default function LandownerDashboard() {
  const router = useRouter()
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])
  const [projects, setProjects] = useState([])
  const [recentDocuments, setRecentDocuments] = useState([])
  const [stats, setStats] = useState({
    totalProperties: 0,
    underDevelopment: 0,
    completed: 0,
    totalValue: 0
  })

  const loadData = useCallback(async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      // Load user's properties from localStorage (evaluated properties)
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []

      // Filter properties owned by current user
      const userProperties = storedProperties.filter(p =>
        p.ownerId === user.uid || p.userEmail === user.email
      )
      setProperties(userProperties)

      // Load development projects linked to user's properties
      const projectsResult = await getDevelopmentProjects()
      if (projectsResult.success) {
        const userProjects = projectsResult.projects.filter(p =>
          userProperties.some(prop => prop.id === p.propertyId)
        )
        setProjects(userProjects)

        // Calculate stats
        setStats({
          totalProperties: userProperties.length,
          underDevelopment: userProjects.filter(p =>
            [DEVELOPMENT_PROJECT_STATUS.UNDER_DEVELOPMENT, DEVELOPMENT_PROJECT_STATUS.FUNDING_OPEN, DEVELOPMENT_PROJECT_STATUS.FUNDED].includes(p.status)
          ).length,
          completed: userProjects.filter(p => p.status === DEVELOPMENT_PROJECT_STATUS.COMPLETED).length,
          totalValue: userProjects.reduce((sum, p) => sum + (p.estimatedCapital || 0), 0)
        })
      }

      // Load recent documents from first property
      if (userProperties.length > 0) {
        const docsResult = await getDocuments(userProperties[0].id)
        if (docsResult.success) {
          setRecentDocuments(docsResult.documents?.slice(0, 5) || [])
        }
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <>
        <Head><title>Landowner Dashboard | REMMIC</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <h1>Please Sign In</h1>
          <p style={{ color: '#6b7280' }}>You need to sign in to access the landowner dashboard.</p>
          <Link href="/auth" className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.35)]" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Sign In
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Landowner Dashboard | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Landowner Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            Welcome back, {user.displayName || user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-6" style={{ marginBottom: '2rem' }}>
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] border border-slate-100 text-center">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Total Properties</h3>
            <div className="text-[2.25rem] font-bold text-gray-900 mb-1">{stats.totalProperties}</div>
            <div className="text-xs text-gray-500">
              <span>Registered with REMMIC</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] border border-slate-100 text-center">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Under Development</h3>
            <div className="text-[2.25rem] font-bold mb-1" style={{ color: '#f97316' }}>{stats.underDevelopment}</div>
            <div className="text-xs text-gray-500">
              <span>Active projects</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] border border-slate-100 text-center">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Completed</h3>
            <div className="text-[2.25rem] font-bold mb-1" style={{ color: '#059669' }}>{stats.completed}</div>
            <div className="text-xs text-gray-500">
              <span>Projects delivered</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] border border-slate-100 text-center">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Total Project Value</h3>
            <div className="text-[2.25rem] font-bold text-gray-900 mb-1">{formatCurrency(stats.totalValue)}</div>
            <div className="text-xs text-gray-500">
              <span>Estimated</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading your properties...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Main Content */}
            <div>
              {/* Properties */}
              <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '2rem' }}>
                <div className="flex justify-between items-center mb-5">
                  <h2>My Properties</h2>
                </div>
                {properties.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                    <p>No properties registered yet</p>
                    <Link href="/evaluation" className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.35)]" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
                      Submit Property for Evaluation
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {properties.map(property => {
                      const linkedProject = projects.find(p => p.propertyId === property.id)
                      return (
                        <div key={property.id} style={{
                          padding: '1.25rem',
                          background: '#f8fafc',
                          borderRadius: '0.75rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <h4 style={{ margin: '0 0 0.25rem' }}>{property.title || property.propertyAddress || 'Property'}</h4>
                              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                {property.location || property.city || 'Location N/A'}
                              </p>
                            </div>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '2rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              background: property.status === 'approved' ? '#d1fae5' : '#fef3c7',
                              color: property.status === 'approved' ? '#059669' : '#d97706'
                            }}>
                              {property.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                            <span>Type: {property.propertyType || 'N/A'}</span>
                            <span>Area: {property.areaSize || 'N/A'}</span>
                          </div>
                          {linkedProject && (
                            <div style={{
                              padding: '0.75rem',
                              background: 'white',
                              borderRadius: '0.5rem',
                              marginBottom: '0.75rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Development Project</div>
                                  <div style={{ fontWeight: 500 }}>{linkedProject.projectName}</div>
                                </div>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  background: STATUS_COLORS[linkedProject.status]?.bg || '#f3f4f6',
                                  color: STATUS_COLORS[linkedProject.status]?.color || '#6b7280'
                                }}>
                                  {STATUS_LABELS[linkedProject.status] || linkedProject.status}
                                </span>
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link
                              href={`/management/property/${property.id}`}
                              className="border border-slate-300/35 rounded-full px-4 py-2 text-sm font-semibold bg-slate-200/50 text-gray-800 transition-colors hover:bg-slate-300/50"
                              style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.5rem' }}
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/management/property/${property.id}/documents`}
                              className="border border-slate-300/35 rounded-full px-4 py-2 text-sm font-semibold bg-slate-200/50 text-gray-800 transition-colors hover:bg-slate-300/50"
                              style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.5rem' }}
                            >
                              Documents
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Development Projects */}
              {projects.length > 0 && (
                <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20">
                  <div className="flex justify-between items-center mb-5">
                    <h2>Development Projects</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projects.map(project => (
                      <div key={project.id} style={{
                        padding: '1.25rem',
                        background: '#f8fafc',
                        borderRadius: '0.75rem',
                        borderLeft: `4px solid ${STATUS_COLORS[project.status]?.color || '#6b7280'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.25rem' }}>{project.projectName}</h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                              {project.propertyLocation}
                            </p>
                          </div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '2rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: STATUS_COLORS[project.status]?.bg || '#f3f4f6',
                            color: STATUS_COLORS[project.status]?.color || '#6b7280'
                          }}>
                            {STATUS_LABELS[project.status] || project.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                          <span style={{ color: '#6b7280' }}>Capital: {formatCurrency(project.estimatedCapital)}</span>
                          <span style={{ color: '#6b7280' }}>Target: {formatDate(project.targetCompletion)}</span>
                        </div>
                        {project.status === DEVELOPMENT_PROJECT_STATUS.UNDER_DEVELOPMENT && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              <span>Progress</span>
                              <span>{project.progress || 0}%</span>
                            </div>
                            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${project.progress || 0}%`, height: '100%', background: '#f97316' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Quick Actions */}
              <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    href="/evaluation"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>📝</span>
                    <span>Submit New Property</span>
                  </Link>
                  <Link
                    href="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>💬</span>
                    <span>Contact Support</span>
                  </Link>
                  <Link
                    href="/faqs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>❓</span>
                    <span>FAQs</span>
                  </Link>
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20" style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Recent Documents</h3>
                {recentDocuments.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No documents yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {recentDocuments.map(doc => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem'
                      }}>
                        <span>📄</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {formatDate(doc.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {properties.length > 0 && (
                  <Link
                    href={`/management/property/${properties[0].id}/documents`}
                    style={{ display: 'block', marginTop: '1rem', color: '#f97316', fontSize: '0.875rem' }}
                  >
                    View All Documents
                  </Link>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20">
                <h3 style={{ margin: '0 0 1rem' }}>Need Help?</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Contact your REMMIC property manager for any questions about your properties or projects.
                </p>
                <a
                  href="mailto:support@remmic.pk"
                  className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.35)]"
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(249, 115, 22, 0.05)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          REMMIC provides coordination and reporting services only and does not guarantee income or performance. All project values and returns are indicative only.
        </div>
      </main>

      <Footer />
    </>
  )
}
