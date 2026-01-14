import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getDevelopmentProjects,
  getFeasibilityReport,
  addFeasibilityReport,
  updateFeasibilityReport,
  addProjectDrawing,
  getProjectDrawings
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

export default function FeasibilityModule() {
  const router = useRouter()
  const { id: projectId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState(null)
  const [feasibility, setFeasibility] = useState(null)
  const [drawings, setDrawings] = useState([])
  const [activeTab, setActiveTab] = useState('analysis')

  const [formData, setFormData] = useState({
    marketAnalysis: '',
    marketScore: '',
    locationScore: '',
    demandScore: '',
    constructionCostEstimate: '',
    landCost: '',
    infrastructureCost: '',
    contingency: '',
    conservativeROI: '',
    moderateROI: '',
    optimisticROI: '',
    breakEvenPeriod: '',
    developmentTimeline: '',
    phaseDetails: '',
    risks: '',
    recommendations: '',
    status: 'draft'
  })

  const loadData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      // Load project
      const projectsResult = await getDevelopmentProjects()
      if (projectsResult.success) {
        const foundProject = projectsResult.projects.find(p => p.id === projectId)
        setProject(foundProject)
      }

      // Load feasibility report
      const feasibilityResult = await getFeasibilityReport(projectId)
      if (feasibilityResult.success && feasibilityResult.report) {
        setFeasibility(feasibilityResult.report)
        setFormData(prev => ({
          ...prev,
          ...feasibilityResult.report
        }))
      }

      // Load drawings
      const drawingsResult = await getProjectDrawings(projectId)
      if (drawingsResult.success) {
        setDrawings(drawingsResult.drawings || [])
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (status = 'draft') => {
    setSaving(true)
    try {
      const data = {
        ...formData,
        status,
        constructionCostEstimate: parseFloat(formData.constructionCostEstimate) || 0,
        landCost: parseFloat(formData.landCost) || 0,
        infrastructureCost: parseFloat(formData.infrastructureCost) || 0,
        contingency: parseFloat(formData.contingency) || 0,
        conservativeROI: parseFloat(formData.conservativeROI) || 0,
        moderateROI: parseFloat(formData.moderateROI) || 0,
        optimisticROI: parseFloat(formData.optimisticROI) || 0,
        marketScore: parseInt(formData.marketScore) || 0,
        locationScore: parseInt(formData.locationScore) || 0,
        demandScore: parseInt(formData.demandScore) || 0,
        updatedBy: user?.uid || 'admin',
        updatedByName: user?.displayName || user?.email || 'Admin'
      }

      let result
      if (feasibility?.id) {
        result = await updateFeasibilityReport(feasibility.id, data)
      } else {
        result = await addFeasibilityReport({ ...data, projectId })
      }

      if (result.success) {
        setFeasibility(result.report)
        setFormData(prev => ({ ...prev, status }))
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDrawingUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const result = await addProjectDrawing({
          projectId,
          drawingType: file.name.includes('floor') ? 'floor_plan' :
            file.name.includes('elevation') ? 'elevation' :
              file.name.includes('3d') || file.name.includes('render') ? 'render' : 'architectural',
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileType: file.type,
          fileUrl: reader.result,
          version: 1,
          uploadedBy: user?.uid || 'admin'
        })

        if (result.success) {
          setDrawings(prev => [result.drawing, ...prev])
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading drawing:', error)
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

  const totalCost = (parseFloat(formData.constructionCostEstimate) || 0) +
    (parseFloat(formData.landCost) || 0) +
    (parseFloat(formData.infrastructureCost) || 0) +
    (parseFloat(formData.contingency) || 0)

  const averageScore = Math.round(
    ((parseInt(formData.marketScore) || 0) +
      (parseInt(formData.locationScore) || 0) +
      (parseInt(formData.demandScore) || 0)) / 3
  )

  if (loading) {
    return (
      <>
        <Head><title>Loading... | REMMIC Admin</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <p style={{ color: '#6b7280' }}>Loading feasibility data...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Feasibility | {project?.projectName} | REMMIC Admin</title>
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
              <h1 style={{ margin: 0, color: '#1f2937' }}>Feasibility Analysis</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                {project?.projectName}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: formData.status === 'approved' ? '#d1fae5' : formData.status === 'submitted' ? '#dbeafe' : '#fef3c7',
                color: formData.status === 'approved' ? '#059669' : formData.status === 'submitted' ? '#2563eb' : '#d97706'
              }}>
                {formData.status?.toUpperCase() || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Total Estimated Cost</h3>
            <div className={styles.metricValue}>{formatCurrency(totalCost)}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Market Score</h3>
            <div className={styles.metricValue} style={{ color: averageScore >= 70 ? '#059669' : averageScore >= 50 ? '#d97706' : '#dc2626' }}>
              {averageScore}/100
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Moderate ROI</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>
              {formData.moderateROI || 0}%
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Drawings</h3>
            <div className={styles.metricValue}>{drawings.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          {['analysis', 'costs', 'roi', 'timeline', 'drawings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: activeTab === tab ? '#f97316' : 'transparent',
                color: activeTab === tab ? 'white' : '#6b7280',
                borderRadius: '0.5rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'roi' ? 'ROI Scenarios' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          {activeTab === 'analysis' && (
            <>
              <h3 style={{ margin: '0 0 1.5rem' }}>Market Analysis</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Market Analysis Summary
                </label>
                <textarea
                  name="marketAnalysis"
                  value={formData.marketAnalysis}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe market conditions, competition, target demographics..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <h4 style={{ margin: '1.5rem 0 1rem' }}>Scoring (0-100)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Market Potential Score
                  </label>
                  <input
                    type="number"
                    name="marketScore"
                    value={formData.marketScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0-100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Location Score
                  </label>
                  <input
                    type="number"
                    name="locationScore"
                    value={formData.locationScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0-100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Demand Score
                  </label>
                  <input
                    type="number"
                    name="demandScore"
                    value={formData.demandScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0-100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Risks & Challenges
                </label>
                <textarea
                  name="risks"
                  value={formData.risks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Identify potential risks and challenges..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'costs' && (
            <>
              <h3 style={{ margin: '0 0 1.5rem' }}>Cost Estimates (PKR)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Land Cost
                  </label>
                  <input
                    type="number"
                    name="landCost"
                    value={formData.landCost}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Construction Cost
                  </label>
                  <input
                    type="number"
                    name="constructionCostEstimate"
                    value={formData.constructionCostEstimate}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Infrastructure Cost
                  </label>
                  <input
                    type="number"
                    name="infrastructureCost"
                    value={formData.infrastructureCost}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Contingency
                  </label>
                  <input
                    type="number"
                    name="contingency"
                    value={formData.contingency}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600 }}>Total Estimated Cost</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </>
          )}

          {activeTab === 'roi' && (
            <>
              <h3 style={{ margin: '0 0 1.5rem' }}>ROI Scenarios</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                These are indicative projections only and not guaranteed returns.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '0.75rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#dc2626' }}>Conservative</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      name="conservativeROI"
                      value={formData.conservativeROI}
                      onChange={handleChange}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>
                </div>
                <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '0.75rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Moderate</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      name="moderateROI"
                      value={formData.moderateROI}
                      onChange={handleChange}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #fcd34d',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>
                </div>
                <div style={{ padding: '1.5rem', background: '#d1fae5', borderRadius: '0.75rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#059669' }}>Optimistic</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      name="optimisticROI"
                      value={formData.optimisticROI}
                      onChange={handleChange}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #6ee7b7',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Break-Even Period (months)
                </label>
                <input
                  type="text"
                  name="breakEvenPeriod"
                  value={formData.breakEvenPeriod}
                  onChange={handleChange}
                  placeholder="e.g., 24-36 months"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <>
              <h3 style={{ margin: '0 0 1.5rem' }}>Development Timeline</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Estimated Timeline
                </label>
                <input
                  type="text"
                  name="developmentTimeline"
                  value={formData.developmentTimeline}
                  onChange={handleChange}
                  placeholder="e.g., 18-24 months"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Phase Details
                </label>
                <textarea
                  name="phaseDetails"
                  value={formData.phaseDetails}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Phase 1: Planning & Approvals (3 months)&#10;Phase 2: Foundation (2 months)&#10;Phase 3: Structure (6 months)&#10;..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Recommendations
                </label>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Key recommendations for project success..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'drawings' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Architectural Drawings</h3>
                <label className={styles.actionButtonPrimary} style={{ cursor: 'pointer' }}>
                  + Upload Drawing
                  <input
                    type="file"
                    onChange={handleDrawingUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {drawings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📐</div>
                  <p>No drawings uploaded yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {drawings.map(drawing => (
                    <div key={drawing.id} style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {drawing.fileType?.includes('pdf') ? '📄' : '🖼️'}
                      </div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{drawing.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {drawing.drawingType?.replace('_', ' ').toUpperCase()}
                      </div>
                      <a
                        href={drawing.fileUrl}
                        download={drawing.fileName}
                        className={styles.actionButtonSecondary}
                        style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.5rem' }}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className={styles.actionButtonSecondary}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave('submitted')}
            disabled={saving}
            className={styles.actionButtonPrimary}
          >
            {saving ? 'Saving...' : 'Submit for Approval'}
          </button>
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
          All projections and ROI scenarios are indicative only and not guaranteed. Actual returns may vary based on market conditions and project execution.
        </div>
      </main>

      <Footer />
    </>
  )
}
