import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useFirebase } from '../../../contexts/FirebaseContext'
import { addDevelopmentProject, DEVELOPMENT_PROJECT_STATUS } from '../../../lib/firebase'
import styles from '../../../styles/adminOverview.module.css'

export default function NewDevelopmentProject() {
  const router = useRouter()
  const { user } = useFirebase()
  const { propertyId } = router.query

  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    projectName: '',
    projectType: 'residential',
    description: '',
    landArea: '',
    proposedUnits: '',
    estimatedCapital: '',
    targetCompletion: '',
    developmentType: 'new_construction',
    notes: ''
  })

  useEffect(() => {
    // Load evaluated properties from localStorage
    const stored = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('evaluatedProperties') || '[]')
      : []
    setProperties(stored)

    if (propertyId) {
      setFormData(prev => ({ ...prev, propertyId }))
    }
  }, [propertyId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedProperty = properties.find(p => p.id === formData.propertyId)

      const projectData = {
        ...formData,
        propertyTitle: selectedProperty?.title || selectedProperty?.propertyAddress || 'N/A',
        propertyLocation: selectedProperty?.location || selectedProperty?.city || 'N/A',
        status: DEVELOPMENT_PROJECT_STATUS.UNDER_EVALUATION,
        estimatedCapital: parseFloat(formData.estimatedCapital) || 0,
        proposedUnits: parseInt(formData.proposedUnits) || 0,
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Admin'
      }

      const result = await addDevelopmentProject(projectData)

      if (result.success) {
        router.push(`/admin-dashboard/development-projects/${result.project.id}`)
      } else {
        alert('Error creating project. Please try again.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Development Project | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin-dashboard" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Create Development Project</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
            Link an evaluated property to a new development project
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.panel} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1f2937' }}>Property Selection</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Select Evaluated Property *
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Select a property --</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title || prop.propertyAddress} - {prop.location || prop.city}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: '#d97706', marginTop: '0.5rem' }}>
                  No evaluated properties found. Properties must be evaluated before creating a development project.
                </p>
              )}
            </div>
          </div>

          <div className={styles.panel} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1f2937' }}>Project Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., Green Valley Residences"
                  required
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
                  Project Type *
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed_use">Mixed Use</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Development Type *
                </label>
                <select
                  name="developmentType"
                  value={formData.developmentType}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value="new_construction">New Construction</option>
                  <option value="renovation">Renovation</option>
                  <option value="redevelopment">Redevelopment</option>
                  <option value="expansion">Expansion</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Land Area (sq ft/marla)
                </label>
                <input
                  type="text"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleChange}
                  placeholder="e.g., 10 Marla or 2722 sq ft"
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
                  Proposed Units
                </label>
                <input
                  type="number"
                  name="proposedUnits"
                  value={formData.proposedUnits}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the development project..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.panel} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1f2937' }}>Financial Estimates</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Estimated Capital Required (PKR)
                </label>
                <input
                  type="number"
                  name="estimatedCapital"
                  value={formData.estimatedCapital}
                  onChange={handleChange}
                  placeholder="e.g., 50000000"
                  min="0"
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
                  Target Completion Date
                </label>
                <input
                  type="date"
                  name="targetCompletion"
                  value={formData.targetCompletion}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Internal Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Internal notes for admin reference..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(249, 115, 22, 0.05)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            REMMIC is a management and structuring platform. Investments are project-based and subject to risk. Returns are indicative only and not guaranteed.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/admin-dashboard"
              className={styles.actionButtonSecondary}
              style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.propertyId}
              className={styles.actionButtonPrimary}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  )
}
