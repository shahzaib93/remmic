import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getDevelopmentProjects,
  updateDevelopmentProjectStatus,
  DEVELOPMENT_PROJECT_STATUS
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

export default function FundingModule() {
  const router = useRouter()
  const { id: projectId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [fundingData, setFundingData] = useState({
    capitalRequired: 0,
    minimumInvestment: 0,
    maximumInvestment: 0,
    expectedReturn: 0,
    fundingProgress: 0,
    totalInvestors: 0,
    fundingDeadline: '',
    investmentTiers: []
  })
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const loadData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const projectsResult = await getDevelopmentProjects()
      if (projectsResult.success) {
        const foundProject = projectsResult.projects.find(p => p.id === projectId)
        setProject(foundProject)
        if (foundProject?.fundingData) {
          setFundingData(prev => ({ ...prev, ...foundProject.fundingData }))
        }
        if (foundProject?.estimatedCapital) {
          setFundingData(prev => ({ ...prev, capitalRequired: foundProject.estimatedCapital }))
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFundingData(prev => ({ ...prev, [name]: value }))
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      // Update project status to funding_open
      const result = await updateDevelopmentProjectStatus(projectId, DEVELOPMENT_PROJECT_STATUS.FUNDING_OPEN, {
        fundingData: {
          ...fundingData,
          capitalRequired: parseFloat(fundingData.capitalRequired) || 0,
          minimumInvestment: parseFloat(fundingData.minimumInvestment) || 0,
          maximumInvestment: parseFloat(fundingData.maximumInvestment) || 0,
          expectedReturn: parseFloat(fundingData.expectedReturn) || 0,
          publishedAt: new Date().toISOString(),
          publishedBy: user?.uid || 'admin'
        }
      })

      if (result.success) {
        setProject(prev => ({ ...prev, status: DEVELOPMENT_PROJECT_STATUS.FUNDING_OPEN }))
        setShowPublishModal(false)
      }
    } catch (error) {
      console.error('Error publishing:', error)
    } finally {
      setPublishing(false)
    }
  }

  const handleCloseFunding = async () => {
    setPublishing(true)
    try {
      const newStatus = fundingData.fundingProgress >= 100
        ? DEVELOPMENT_PROJECT_STATUS.FUNDED
        : DEVELOPMENT_PROJECT_STATUS.PROJECT_STRUCTURED

      const result = await updateDevelopmentProjectStatus(projectId, newStatus, {
        fundingData: {
          ...fundingData,
          closedAt: new Date().toISOString(),
          closedBy: user?.uid || 'admin'
        }
      })

      if (result.success) {
        setProject(prev => ({ ...prev, status: newStatus }))
        setShowCloseModal(false)
      }
    } catch (error) {
      console.error('Error closing funding:', error)
    } finally {
      setPublishing(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
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

  const isFundingOpen = project?.status === DEVELOPMENT_PROJECT_STATUS.FUNDING_OPEN
  const canPublish = project?.status === DEVELOPMENT_PROJECT_STATUS.PROJECT_STRUCTURED

  if (loading) {
    return (
      <>
        <Head><title>Loading... | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <p style={{ color: '#6b7280' }}>Loading funding data...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Funding | {project?.projectName} | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/admin-dashboard/development-projects/${projectId}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Project Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>Investment & Funding</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                {project?.projectName}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isFundingOpen ? (
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#d1fae5',
                  color: '#059669'
                }}>
                  FUNDING OPEN
                </span>
              ) : (
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#f3f4f6',
                  color: '#6b7280'
                }}>
                  {project?.status?.toUpperCase().replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem' }}>Funding Progress</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 500 }}>
              {formatCurrency((fundingData.capitalRequired * fundingData.fundingProgress) / 100)} raised
            </span>
            <span style={{ color: '#6b7280' }}>
              {fundingData.fundingProgress || 0}% of {formatCurrency(fundingData.capitalRequired)}
            </span>
          </div>
          <div style={{ height: 12, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(fundingData.fundingProgress || 0, 100)}%`,
              height: '100%',
              background: fundingData.fundingProgress >= 100 ? '#059669' : '#f97316',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>{fundingData.totalInvestors || 0} investors</span>
            {fundingData.fundingDeadline && (
              <span>Deadline: {formatDate(fundingData.fundingDeadline)}</span>
            )}
          </div>
        </div>

        {/* Funding Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Capital Required</h3>
            <div className={styles.metricValue}>{formatCurrency(fundingData.capitalRequired)}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Min Investment</h3>
            <div className={styles.metricValue}>{formatCurrency(fundingData.minimumInvestment)}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Max Investment</h3>
            <div className={styles.metricValue}>{formatCurrency(fundingData.maximumInvestment)}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Expected Return</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>
              {fundingData.expectedReturn || 0}%
            </div>
            <div className={styles.metricMeta}>
              <span>Indicative only</span>
            </div>
          </div>
        </div>

        {/* Funding Configuration */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem' }}>Funding Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Total Capital Required (PKR)
              </label>
              <input
                type="number"
                name="capitalRequired"
                value={fundingData.capitalRequired}
                onChange={handleChange}
                disabled={isFundingOpen}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: isFundingOpen ? '#f9fafb' : 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Expected Return (%)
              </label>
              <input
                type="number"
                name="expectedReturn"
                value={fundingData.expectedReturn}
                onChange={handleChange}
                disabled={isFundingOpen}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: isFundingOpen ? '#f9fafb' : 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Minimum Investment (PKR)
              </label>
              <input
                type="number"
                name="minimumInvestment"
                value={fundingData.minimumInvestment}
                onChange={handleChange}
                disabled={isFundingOpen}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: isFundingOpen ? '#f9fafb' : 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Maximum Investment (PKR)
              </label>
              <input
                type="number"
                name="maximumInvestment"
                value={fundingData.maximumInvestment}
                onChange={handleChange}
                disabled={isFundingOpen}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: isFundingOpen ? '#f9fafb' : 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Funding Deadline
              </label>
              <input
                type="date"
                name="fundingDeadline"
                value={fundingData.fundingDeadline}
                onChange={handleChange}
                disabled={isFundingOpen}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: isFundingOpen ? '#f9fafb' : 'white'
                }}
              />
            </div>
            {isFundingOpen && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Current Funding Progress (%)
                </label>
                <input
                  type="number"
                  name="fundingProgress"
                  value={fundingData.fundingProgress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Simulated Investors (Demo) */}
        {isFundingOpen && (
          <div className={styles.panel} style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Recent Investments</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Investor data will be linked from the investment module.
            </p>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
              <span style={{ color: '#6b7280' }}>No investments recorded yet</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {canPublish && (
            <button
              onClick={() => setShowPublishModal(true)}
              className={styles.actionButtonPrimary}
            >
              Publish to Investment Module
            </button>
          )}
          {isFundingOpen && (
            <button
              onClick={() => setShowCloseModal(true)}
              className={styles.actionButtonSecondary}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
            >
              Close Funding
            </button>
          )}
        </div>

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
          REMMIC is a management and structuring platform. Investments are project-based and subject to risk. Returns are indicative only and not guaranteed.
        </div>
      </main>

      {/* Publish Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: 500,
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 1rem' }}>Publish to Investment Module</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              This will make the project visible to investors and open it for investment. Are you sure you want to proceed?
            </p>
            <div style={{
              padding: '1rem',
              background: '#fef3c7',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#92400e'
            }}>
              Make sure all feasibility data and funding configuration are correct before publishing.
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowPublishModal(false)}
                className={styles.actionButtonSecondary}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className={styles.actionButtonPrimary}
                style={{ flex: 1 }}
              >
                {publishing ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Funding Modal */}
      {showCloseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: 500,
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 1rem' }}>Close Funding</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {fundingData.fundingProgress >= 100
                ? 'Funding target has been reached! The project will move to "Funded" status.'
                : 'Funding target has not been reached. The project will return to "Project Structured" status.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowCloseModal(false)}
                className={styles.actionButtonSecondary}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseFunding}
                disabled={publishing}
                className={styles.actionButtonPrimary}
                style={{ flex: 1, background: fundingData.fundingProgress >= 100 ? '#059669' : '#dc2626' }}
              >
                {publishing ? 'Processing...' : 'Close Funding'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
