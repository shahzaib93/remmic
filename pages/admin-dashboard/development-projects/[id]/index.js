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
  getProjectMilestones,
  getProjectExpenses,
  DEVELOPMENT_PROJECT_STATUS
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

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

const STATUS_ORDER = [
  'under_evaluation',
  'evaluated',
  'project_structured',
  'funding_open',
  'funded',
  'under_development',
  'completed'
]

export default function DevelopmentProjectDashboard() {
  const router = useRouter()
  const { id: projectId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [expenses, setExpenses] = useState([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const loadData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      // Load project
      const projectsResult = await getDevelopmentProjects()
      if (projectsResult.success) {
        const foundProject = projectsResult.projects.find(p => p.id === projectId)
        setProject(foundProject)
        if (foundProject) {
          setNewStatus(foundProject.status)
        }
      }

      // Load milestones and expenses
      const [milestonesResult, expensesResult] = await Promise.all([
        getProjectMilestones(projectId),
        getProjectExpenses(projectId)
      ])

      if (milestonesResult.success) setMilestones(milestonesResult.milestones || [])
      if (expensesResult.success) setExpenses(expensesResult.expenses || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === project.status) return
    setUpdating(true)
    try {
      const result = await updateDevelopmentProjectStatus(projectId, newStatus)
      if (result.success) {
        setProject(prev => ({ ...prev, status: newStatus }))
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
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

  const getCurrentStatusIndex = () => {
    return STATUS_ORDER.indexOf(project?.status || 'under_evaluation')
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + (m.percentage || 0), 0) / milestones.length)
    : 0

  if (loading) {
    return (
      <>
        <Head><title>Loading... | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <p style={{ color: '#6b7280' }}>Loading project details...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!project) {
    return (
      <>
        <Head><title>Project Not Found | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <h1>Project Not Found</h1>
          <p style={{ color: '#6b7280' }}>The development project could not be found.</p>
          <Link href="/admin-dashboard" className={styles.actionButtonPrimary} style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{project.projectName} | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin-dashboard" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>{project.projectName}</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                {project.propertyLocation} | {project.projectType?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: STATUS_COLORS[project.status]?.bg || '#f3f4f6',
                color: STATUS_COLORS[project.status]?.color || '#6b7280'
              }}>
                {STATUS_LABELS[project.status] || project.status}
              </span>
              <button
                onClick={() => setShowStatusModal(true)}
                className={styles.actionButtonSecondary}
                style={{ padding: '0.5rem 1rem' }}
              >
                Change Status
              </button>
            </div>
          </div>
        </div>

        {/* Status Progress */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Project Status Flow</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto', padding: '0.5rem 0' }}>
            {STATUS_ORDER.map((status, index) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: index <= getCurrentStatusIndex() ? STATUS_COLORS[status]?.bg : '#f3f4f6',
                  color: index <= getCurrentStatusIndex() ? STATUS_COLORS[status]?.color : '#9ca3af',
                  whiteSpace: 'nowrap',
                  border: project.status === status ? `2px solid ${STATUS_COLORS[status]?.color}` : '2px solid transparent'
                }}>
                  {STATUS_LABELS[status]}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <svg width="20" height="20" fill="none" stroke={index < getCurrentStatusIndex() ? '#059669' : '#d1d5db'} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Estimated Capital</h3>
            <div className={styles.metricValue}>{formatCurrency(project.estimatedCapital)}</div>
            <div className={styles.metricMeta}>
              <span>Target budget</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Expenses to Date</h3>
            <div className={styles.metricValue} style={{ color: '#dc2626' }}>
              {formatCurrency(totalExpenses)}
            </div>
            <div className={styles.metricMeta}>
              <span>{expenses.length} expense records</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Milestones</h3>
            <div className={styles.metricValue}>{completedMilestones}/{milestones.length}</div>
            <div className={styles.metricMeta}>
              <span>Completed</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Overall Progress</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>{overallProgress}%</div>
            <div style={{ marginTop: '0.5rem', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${overallProgress}%`, height: '100%', background: '#059669' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Project Sections</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link
              href={`/admin-dashboard/development-projects/${projectId}/feasibility`}
              style={{
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: '#1f2937',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 500 }}>Feasibility</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Analysis & Projections</div>
            </Link>
            <Link
              href={`/admin-dashboard/development-projects/${projectId}/funding`}
              style={{
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: '#1f2937',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontWeight: 500 }}>Funding</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Investment & Capital</div>
            </Link>
            <Link
              href={`/admin-dashboard/development-projects/${projectId}/manage`}
              style={{
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: '#1f2937',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏗️</div>
              <div style={{ fontWeight: 500 }}>Development</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Milestones & Expenses</div>
            </Link>
          </div>
        </div>

        {/* Project Details */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Project Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Project Type</div>
              <div style={{ fontWeight: 500 }}>{project.projectType?.replace('_', ' ').toUpperCase() || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Development Type</div>
              <div style={{ fontWeight: 500 }}>{project.developmentType?.replace('_', ' ').toUpperCase() || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Land Area</div>
              <div style={{ fontWeight: 500 }}>{project.landArea || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Proposed Units</div>
              <div style={{ fontWeight: 500 }}>{project.proposedUnits || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Target Completion</div>
              <div style={{ fontWeight: 500 }}>{formatDate(project.targetCompletion)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Created</div>
              <div style={{ fontWeight: 500 }}>{formatDate(project.createdAt)}</div>
            </div>
          </div>
          {project.description && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Description</div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{project.description}</p>
            </div>
          )}
        </div>

        {/* Recent Milestones */}
        {milestones.length > 0 && (
          <div className={styles.panel} style={{ marginBottom: '2rem' }}>
            <div className={styles.panelHeader}>
              <h2>Recent Milestones</h2>
              <Link href={`/admin-dashboard/development-projects/${projectId}/manage`} style={{ color: '#f97316', fontSize: '0.875rem' }}>
                View All
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {milestones.slice(0, 4).map(milestone => (
                <div key={milestone.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{milestone.milestoneName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Target: {formatDate(milestone.targetDate)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#059669' }}>{milestone.percentage || 0}%</div>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background: milestone.status === 'completed' ? '#d1fae5' : milestone.status === 'in_progress' ? '#fef3c7' : '#f3f4f6',
                      color: milestone.status === 'completed' ? '#059669' : milestone.status === 'in_progress' ? '#d97706' : '#6b7280'
                    }}>
                      {milestone.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
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

      {/* Status Change Modal */}
      {showStatusModal && (
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
            maxWidth: 400,
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 1.5rem' }}>Change Project Status</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className={styles.actionButtonSecondary}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === project.status}
                className={styles.actionButtonPrimary}
                style={{ flex: 1 }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
