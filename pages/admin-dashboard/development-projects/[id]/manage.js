import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getDevelopmentProjects,
  getProjectMilestones,
  addProjectMilestone,
  updateMilestoneProgress,
  getProjectExpenses,
  addProjectExpense,
  approveExpense
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

export default function DevelopmentManagement() {
  const router = useRouter()
  const { id: projectId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [expenses, setExpenses] = useState([])
  const [activeTab, setActiveTab] = useState('milestones')

  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [saving, setSaving] = useState(false)

  const [milestoneForm, setMilestoneForm] = useState({
    milestoneName: '',
    description: '',
    targetDate: '',
    percentage: 0
  })

  const [expenseForm, setExpenseForm] = useState({
    expenseType: 'construction',
    description: '',
    contractor: '',
    amount: '',
    invoiceNumber: '',
    dueDate: ''
  })

  const [updateForm, setUpdateForm] = useState({
    percentage: 0,
    status: 'pending',
    notes: ''
  })

  const loadData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [projectsResult, milestonesResult, expensesResult] = await Promise.all([
        getDevelopmentProjects(),
        getProjectMilestones(projectId),
        getProjectExpenses(projectId)
      ])

      if (projectsResult.success) {
        const foundProject = projectsResult.projects.find(p => p.id === projectId)
        setProject(foundProject)
      }
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

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await addProjectMilestone({
        projectId,
        ...milestoneForm,
        percentage: parseInt(milestoneForm.percentage) || 0,
        status: 'pending',
        createdBy: user?.uid || 'admin'
      })

      if (result.success) {
        setMilestones(prev => [...prev, result.milestone])
        setShowMilestoneModal(false)
        setMilestoneForm({ milestoneName: '', description: '', targetDate: '', percentage: 0 })
      }
    } catch (error) {
      console.error('Error adding milestone:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateMilestone = async (e) => {
    e.preventDefault()
    if (!selectedMilestone) return
    setSaving(true)
    try {
      const result = await updateMilestoneProgress(selectedMilestone.id, {
        percentage: parseInt(updateForm.percentage) || 0,
        status: updateForm.status,
        notes: updateForm.notes,
        updatedBy: user?.uid || 'admin'
      })

      if (result.success) {
        setMilestones(prev => prev.map(m =>
          m.id === selectedMilestone.id ? { ...m, ...result.milestone } : m
        ))
        setShowUpdateModal(false)
        setSelectedMilestone(null)
        setUpdateForm({ percentage: 0, status: 'pending', notes: '' })
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await addProjectExpense({
        projectId,
        ...expenseForm,
        amount: parseFloat(expenseForm.amount) || 0,
        status: 'pending',
        createdBy: user?.uid || 'admin'
      })

      if (result.success) {
        setExpenses(prev => [...prev, result.expense])
        setShowExpenseModal(false)
        setExpenseForm({
          expenseType: 'construction',
          description: '',
          contractor: '',
          amount: '',
          invoiceNumber: '',
          dueDate: ''
        })
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleApproveExpense = async (expenseId) => {
    try {
      const result = await approveExpense(expenseId, user?.uid || 'admin')
      if (result.success) {
        setExpenses(prev => prev.map(e =>
          e.id === expenseId ? { ...e, status: 'approved' } : e
        ))
      }
    } catch (error) {
      console.error('Error approving expense:', error)
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

  const openUpdateModal = (milestone) => {
    setSelectedMilestone(milestone)
    setUpdateForm({
      percentage: milestone.percentage || 0,
      status: milestone.status || 'pending',
      notes: ''
    })
    setShowUpdateModal(true)
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0)
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
          <p style={{ color: '#6b7280' }}>Loading development data...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Development Management | {project?.projectName} | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/admin-dashboard/development-projects/${projectId}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Project Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Development Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            {project?.projectName} - Milestones & Expenses
          </p>
        </div>

        {/* Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Overall Progress</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>{overallProgress}%</div>
            <div style={{ marginTop: '0.5rem', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${overallProgress}%`, height: '100%', background: '#059669' }} />
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
            <h3>Total Expenses</h3>
            <div className={styles.metricValue} style={{ color: '#dc2626' }}>
              {formatCurrency(totalExpenses)}
            </div>
            <div className={styles.metricMeta}>
              <span>{expenses.length} records</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Approved Expenses</h3>
            <div className={styles.metricValue}>{formatCurrency(approvedExpenses)}</div>
            <div className={styles.metricMeta}>
              <span>{expenses.filter(e => e.status === 'approved').length} approved</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('milestones')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'milestones' ? '#f97316' : '#f3f4f6',
              color: activeTab === 'milestones' ? 'white' : '#6b7280',
              borderRadius: '0.5rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Milestones ({milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'expenses' ? '#f97316' : '#f3f4f6',
              color: activeTab === 'expenses' ? 'white' : '#6b7280',
              borderRadius: '0.5rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Expenses ({expenses.length})
          </button>
        </div>

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Project Milestones</h3>
              <button
                onClick={() => setShowMilestoneModal(true)}
                className={styles.actionButtonPrimary}
              >
                + Add Milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p>No milestones defined yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {milestones.map((milestone, index) => (
                  <div key={milestone.id || index} style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    borderLeft: `4px solid ${milestone.status === 'completed' ? '#059669' : milestone.status === 'in_progress' ? '#f97316' : '#e5e7eb'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{milestone.milestoneName}</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          {milestone.description || 'No description'}
                        </p>
                      </div>
                      <button
                        onClick={() => openUpdateModal(milestone)}
                        className={styles.actionButtonSecondary}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        Update
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, marginRight: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progress</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{milestone.percentage || 0}%</span>
                        </div>
                        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${milestone.percentage || 0}%`,
                            height: '100%',
                            background: milestone.status === 'completed' ? '#059669' : '#f97316'
                          }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '2rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: milestone.status === 'completed' ? '#d1fae5' :
                            milestone.status === 'in_progress' ? '#fef3c7' :
                              milestone.status === 'delayed' ? '#fee2e2' : '#f3f4f6',
                          color: milestone.status === 'completed' ? '#059669' :
                            milestone.status === 'in_progress' ? '#d97706' :
                              milestone.status === 'delayed' ? '#dc2626' : '#6b7280'
                        }}>
                          {milestone.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          Target: {formatDate(milestone.targetDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Project Expenses</h3>
              <button
                onClick={() => setShowExpenseModal(true)}
                className={styles.actionButtonPrimary}
              >
                + Add Expense
              </button>
            </div>

            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                <p>No expenses recorded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Contractor</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            textTransform: 'capitalize'
                          }}>
                            {expense.expenseType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#374151' }}>{expense.description || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{expense.contractor || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(expense.amount)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: expense.status === 'approved' ? '#d1fae5' :
                              expense.status === 'paid' ? '#dbeafe' : '#fef3c7',
                            color: expense.status === 'approved' ? '#059669' :
                              expense.status === 'paid' ? '#2563eb' : '#d97706'
                          }}>
                            {expense.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {expense.status === 'pending' && (
                            <button
                              onClick={() => handleApproveExpense(expense.id)}
                              className={styles.actionButtonPrimary}
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
          REMMIC is a management and structuring platform. All expense records should be verified with original documentation.
        </div>
      </main>

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
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
            <h2 style={{ margin: '0 0 1.5rem' }}>Add Milestone</h2>
            <form onSubmit={handleAddMilestone}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Milestone Name *</label>
                <input
                  type="text"
                  value={milestoneForm.milestoneName}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, milestoneName: e.target.value }))}
                  placeholder="e.g., Foundation Complete"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this milestone..."
                  rows={2}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Date</label>
                  <input
                    type="date"
                    value={milestoneForm.targetDate}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Weight (%)</label>
                  <input
                    type="number"
                    value={milestoneForm.percentage}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, percentage: e.target.value }))}
                    min="0"
                    max="100"
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
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
                  {saving ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Milestone Modal */}
      {showUpdateModal && selectedMilestone && (
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
            <h2 style={{ margin: '0 0 1.5rem' }}>Update Milestone</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{selectedMilestone.milestoneName}</p>
            <form onSubmit={handleUpdateMilestone}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Progress (%)</label>
                  <input
                    type="number"
                    value={updateForm.percentage}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, percentage: e.target.value }))}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Progress notes..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedMilestone(null)
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
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
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
            <h2 style={{ margin: '0 0 1.5rem' }}>Add Expense</h2>
            <form onSubmit={handleAddExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Type *</label>
                  <select
                    value={expenseForm.expenseType}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expenseType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <option value="construction">Construction</option>
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="permits">Permits & Fees</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount (PKR) *</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Expense description..."
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contractor/Vendor</label>
                  <input
                    type="text"
                    value={expenseForm.contractor}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, contractor: e.target.value }))}
                    placeholder="Contractor name..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Invoice Number</label>
                  <input
                    type="text"
                    value={expenseForm.invoiceNumber}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-001"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
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
                  {saving ? 'Adding...' : 'Add Expense'}
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
