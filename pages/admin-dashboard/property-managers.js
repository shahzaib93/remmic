import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import { assignPropertyManager, removePropertyManager } from '../../lib/firebase'
import styles from '../../styles/adminOverview.module.css'

export default function PropertyManagersAdmin() {
  const router = useRouter()
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [managers, setManagers] = useState([])
  const [properties, setProperties] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedManager, setSelectedManager] = useState(null)
  const [saving, setSaving] = useState(false)

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: ''
  })

  const [assignForm, setAssignForm] = useState({
    propertyId: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load property managers from localStorage
      const storedManagers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyManagers') || '[]')
        : []
      setManagers(storedManagers)

      // Load properties
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      setProperties(storedProperties)

      // Load assignments
      const storedAssignments = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyManagerAssignments') || '[]')
        : []
      setAssignments(storedAssignments)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddManager = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newManager = {
        id: `pm_${Date.now()}`,
        ...managerForm,
        role: 'property_manager',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'admin'
      }

      const updatedManagers = [...managers, newManager]
      localStorage.setItem('propertyManagers', JSON.stringify(updatedManagers))
      setManagers(updatedManagers)

      setShowAddModal(false)
      setManagerForm({ name: '', email: '', phone: '', specialization: '' })
    } catch (error) {
      console.error('Error adding manager:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignProperty = async (e) => {
    e.preventDefault()
    if (!selectedManager || !assignForm.propertyId) return

    setSaving(true)
    try {
      const property = properties.find(p => p.id === assignForm.propertyId)

      const newAssignment = {
        id: `assign_${Date.now()}`,
        managerId: selectedManager.id,
        managerName: selectedManager.name,
        propertyId: assignForm.propertyId,
        propertyTitle: property?.title || property?.propertyAddress || 'Property',
        assignedAt: new Date().toISOString(),
        assignedBy: user?.uid || 'admin'
      }

      // Update Firebase
      await assignPropertyManager(assignForm.propertyId, selectedManager.id)

      // Update localStorage
      const updatedAssignments = [...assignments, newAssignment]
      localStorage.setItem('propertyManagerAssignments', JSON.stringify(updatedAssignments))
      setAssignments(updatedAssignments)

      setShowAssignModal(false)
      setSelectedManager(null)
      setAssignForm({ propertyId: '' })
    } catch (error) {
      console.error('Error assigning property:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId, propertyId, managerId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return

    try {
      await removePropertyManager(propertyId, managerId)

      const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
      localStorage.setItem('propertyManagerAssignments', JSON.stringify(updatedAssignments))
      setAssignments(updatedAssignments)
    } catch (error) {
      console.error('Error removing assignment:', error)
    }
  }

  const handleDeactivateManager = (managerId) => {
    if (!confirm('Are you sure you want to deactivate this manager?')) return

    const updatedManagers = managers.map(m =>
      m.id === managerId ? { ...m, status: 'inactive' } : m
    )
    localStorage.setItem('propertyManagers', JSON.stringify(updatedManagers))
    setManagers(updatedManagers)
  }

  const openAssignModal = (manager) => {
    setSelectedManager(manager)
    setShowAssignModal(true)
  }

  const getManagerAssignments = (managerId) => {
    return assignments.filter(a => a.managerId === managerId)
  }

  const getUnassignedProperties = () => {
    const assignedPropertyIds = assignments.map(a => a.propertyId)
    return properties.filter(p => !assignedPropertyIds.includes(p.id))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <>
      <Head>
        <title>Property Managers | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin-dashboard" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>Property Managers</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                Manage property managers and their assignments
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className={styles.actionButtonPrimary}
            >
              + Add Property Manager
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Total Managers</h3>
            <div className={styles.metricValue}>{managers.length}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Active</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>
              {managers.filter(m => m.status === 'active').length}
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Assignments</h3>
            <div className={styles.metricValue}>{assignments.length}</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Unassigned Properties</h3>
            <div className={styles.metricValue} style={{ color: '#d97706' }}>
              {getUnassignedProperties().length}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        ) : managers.length === 0 ? (
          <div className={styles.panel} style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h2>No Property Managers</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Add property managers to assign them to properties.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className={styles.actionButtonPrimary}
            >
              Add First Manager
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {managers.map(manager => {
              const managerAssignments = getManagerAssignments(manager.id)
              return (
                <div key={manager.id} className={styles.panel} style={{
                  opacity: manager.status === 'inactive' ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#f97316',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '1.25rem'
                      }}>
                        {manager.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>{manager.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{manager.email}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      background: manager.status === 'active' ? '#d1fae5' : '#f3f4f6',
                      color: manager.status === 'active' ? '#059669' : '#6b7280'
                    }}>
                      {manager.status?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>Phone: {manager.phone || 'N/A'}</div>
                    <div>Specialization: {manager.specialization || 'General'}</div>
                    <div>Added: {formatDate(manager.createdAt)}</div>
                  </div>

                  {/* Assigned Properties */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      Assigned Properties ({managerAssignments.length})
                    </div>
                    {managerAssignments.length === 0 ? (
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No properties assigned</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {managerAssignments.map(assignment => (
                          <div key={assignment.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: '#f8fafc',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}>
                            <span>{assignment.propertyTitle}</span>
                            <button
                              onClick={() => handleRemoveAssignment(assignment.id, assignment.propertyId, manager.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openAssignModal(manager)}
                      disabled={manager.status === 'inactive'}
                      className={styles.actionButtonPrimary}
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      Assign Property
                    </button>
                    {manager.status === 'active' && (
                      <button
                        onClick={() => handleDeactivateManager(manager.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add Manager Modal */}
      {showAddModal && (
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
            <h2 style={{ margin: '0 0 1.5rem' }}>Add Property Manager</h2>
            <form onSubmit={handleAddManager}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
                <input
                  type="text"
                  value={managerForm.name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ahmad Khan"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email *</label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., manager@remmic.pk"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone</label>
                  <input
                    type="tel"
                    value={managerForm.phone}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Specialization</label>
                  <select
                    value={managerForm.specialization}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, specialization: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <option value="">General</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setManagerForm({ name: '', email: '', phone: '', specialization: '' })
                  }}
                  className={styles.actionButtonSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.actionButtonPrimary}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Adding...' : 'Add Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Property Modal */}
      {showAssignModal && selectedManager && (
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
            <h2 style={{ margin: '0 0 0.5rem' }}>Assign Property</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Assigning to: <strong>{selectedManager.name}</strong>
            </p>
            <form onSubmit={handleAssignProperty}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Property *</label>
                <select
                  value={assignForm.propertyId}
                  onChange={(e) => setAssignForm({ propertyId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                >
                  <option value="">-- Select a property --</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title || property.propertyAddress} - {property.location || property.city}
                    </option>
                  ))}
                </select>
                {getUnassignedProperties().length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.5rem' }}>
                    All properties are already assigned. You can reassign if needed.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedManager(null)
                    setAssignForm({ propertyId: '' })
                  }}
                  className={styles.actionButtonSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !assignForm.propertyId}
                  className={styles.actionButtonPrimary}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
