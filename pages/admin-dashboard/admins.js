import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { useAdmin, AdminRoles } from '../../contexts/AdminContext'

const STORAGE_KEY = 'remmic_sector_admins'

export default function AdminsPage() {
  const router = useRouter()
  const { adminUser, hasAccess } = useAdmin()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  // Form state for adding new admin
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })

  // Form state for editing admin
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  // Check access
  useEffect(() => {
    if (adminUser && adminUser.adminRole !== AdminRoles.SUPER_ADMIN) {
      router.replace('/admin-dashboard')
    }
  }, [adminUser, router])

  // Load admins from localStorage
  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      // In Phase-1, load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setAdmins(JSON.parse(stored))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading admins:', error)
      setLoading(false)
    }
  }

  const saveAdmins = (adminsList) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminsList))
    setAdmins(adminsList)
  }

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000)
  }

  // Add new Sector Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault()

    if (!addForm.fullName || !addForm.email) {
      showNotificationMsg('Name and email are required', 'error')
      return
    }

    // Check if email already exists
    if (admins.some(a => a.email.toLowerCase() === addForm.email.toLowerCase())) {
      showNotificationMsg('An admin with this email already exists', 'error')
      return
    }

    try {
      const response = await fetch('/api/admin/sector-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          createdBy: adminUser?.email || 'super_admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newAdminsList = [...admins, data.admin]
        saveAdmins(newAdminsList)

        if (data.generatedPassword) {
          setGeneratedPassword(data.generatedPassword)
        }

        setAddForm({ fullName: '', email: '', phone: '', password: '' })
        setShowAddModal(false)
        showNotificationMsg('Sector Admin created successfully')
      } else {
        showNotificationMsg(data.error || 'Failed to create admin', 'error')
      }
    } catch (error) {
      showNotificationMsg('Failed to create admin', 'error')
    }
  }

  // Toggle admin status
  const handleToggleStatus = async (admin) => {
    try {
      const response = await fetch(`/api/admin/sector-admin/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          updatedBy: adminUser?.email || 'super_admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedAdmins = admins.map(a =>
          a.id === admin.id ? { ...a, isActive: !a.isActive } : a
        )
        saveAdmins(updatedAdmins)
        showNotificationMsg(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully`)
      }
    } catch (error) {
      showNotificationMsg('Failed to update status', 'error')
    }
  }

  // Reset password
  const handleResetPassword = async () => {
    if (!selectedAdmin) return

    try {
      const response = await fetch(`/api/admin/sector-admin/${selectedAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          updatedBy: adminUser?.email || 'super_admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedAdmins = admins.map(a =>
          a.id === selectedAdmin.id ? { ...a, passwordHash: data.passwordHash } : a
        )
        saveAdmins(updatedAdmins)
        setGeneratedPassword(data.newPassword)
        setShowResetModal(false)
        showNotificationMsg('Password reset successfully')
      }
    } catch (error) {
      showNotificationMsg('Failed to reset password', 'error')
    }
  }

  // Update admin profile
  const handleUpdateAdmin = async (e) => {
    e.preventDefault()

    if (!selectedAdmin) return

    try {
      const response = await fetch(`/api/admin/sector-admin/${selectedAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          updatedBy: adminUser?.email || 'super_admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedAdmins = admins.map(a =>
          a.id === selectedAdmin.id ? { ...a, ...editForm } : a
        )
        saveAdmins(updatedAdmins)
        setShowEditModal(false)
        setSelectedAdmin(null)
        showNotificationMsg('Admin updated successfully')
      }
    } catch (error) {
      showNotificationMsg('Failed to update admin', 'error')
    }
  }

  // Delete admin
  const handleDeleteAdmin = async (admin) => {
    if (!confirm(`Are you sure you want to remove ${admin.fullName}?`)) return

    try {
      const response = await fetch(`/api/admin/sector-admin/${admin.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        const updatedAdmins = admins.filter(a => a.id !== admin.id)
        saveAdmins(updatedAdmins)
        showNotificationMsg('Admin removed successfully')
      }
    } catch (error) {
      showNotificationMsg('Failed to remove admin', 'error')
    }
  }

  // Open edit modal
  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setEditForm({
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone || '',
    })
    setShowEditModal(true)
  }

  // Open reset password modal
  const openResetModal = (admin) => {
    setSelectedAdmin(admin)
    setShowResetModal(true)
  }

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && admin.isActive) ||
                         (statusFilter === 'inactive' && !admin.isActive)
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Admin Management">
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
        <style jsx>{`
          .loading-state {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(201, 162, 39, 0.2);
            border-top-color: #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Admin Management">
      <div className="admins-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Admin Management</h1>
            <p>Manage Sector Admin accounts and permissions</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Sector Admin
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{admins.length}</span>
              <span className="stat-label">Total Admins</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{admins.filter(a => a.isActive).length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{admins.filter(a => !a.isActive).length}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="table-container">
          {filteredAdmins.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <h3>No Sector Admins Found</h3>
              <p>Click "Add Sector Admin" to create your first admin account.</p>
            </div>
          ) : (
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="admin-info">
                        <div className="admin-avatar">
                          {admin.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="admin-name">{admin.fullName}</span>
                          <span className="admin-role">Sector Admin</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span className="email">{admin.email}</span>
                        {admin.phone && <span className="phone">{admin.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${admin.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="date">{formatDate(admin.createdAt)}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="action-btn"
                          title="Edit"
                          onClick={() => openEditModal(admin)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          className="action-btn"
                          title="Reset Password"
                          onClick={() => openResetModal(admin)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                          </svg>
                        </button>
                        <button
                          className={`action-btn ${admin.isActive ? 'action-btn--warning' : 'action-btn--success'}`}
                          title={admin.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(admin)}
                        >
                          {admin.isActive ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0112 20zm6.31-3.1L7.1 5.69A7.902 7.902 0 0112 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className="action-btn action-btn--danger"
                          title="Remove"
                          onClick={() => handleDeleteAdmin(admin)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Sector Admin</h2>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddAdmin}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      placeholder="Enter phone number (optional)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="text"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Leave empty to auto-generate"
                    />
                    <span className="helper-text">Leave empty to generate a secure password automatically</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && selectedAdmin && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Sector Admin</h2>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateAdmin}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter phone number (optional)"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetModal && selectedAdmin && (
          <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reset Password</h2>
                <button className="close-btn" onClick={() => setShowResetModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="confirm-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="warning-icon">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  <p>Are you sure you want to reset the password for <strong>{selectedAdmin.fullName}</strong>?</p>
                  <p className="sub-text">A new password will be generated automatically.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-warning" onClick={handleResetPassword}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="modal-overlay" onClick={() => setGeneratedPassword('')}>
            <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Password Generated</h2>
                <button className="close-btn" onClick={() => setGeneratedPassword('')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="password-display">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="success-icon">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <p>The new password has been generated:</p>
                  <div className="password-box">
                    <code>{generatedPassword}</code>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword)
                        showNotificationMsg('Password copied to clipboard')
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                  <p className="warning-text">Please save this password securely. It will not be shown again.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-primary" onClick={() => setGeneratedPassword('')}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className={`notification-toast notification-toast--${notification.type}`}>
            {notification.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .admins-page {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
        }

        .header-content p {
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          border: none;
          border-radius: 10px;
          color: #0a0a0a;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(201, 162, 39, 0.3);
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 10px;
        }

        .search-input svg {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-input input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
        }

        .search-input input::placeholder {
          color: #6b7280;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 10px;
        }

        .filter-group label {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .filter-group select {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          padding: 12px 0;
          outline: none;
          cursor: pointer;
        }

        .filter-group select option {
          background: #1a1a1a;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(201, 162, 39, 0.1);
          border-radius: 12px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 10px;
          color: #c9a227;
        }

        .stat-icon--success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .stat-icon--warning {
          background: rgba(234, 179, 8, 0.1);
          color: #eab308;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        /* Table */
        .table-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(201, 162, 39, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state svg {
          color: #4a3728;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          color: #fff;
          font-size: 1.1rem;
          margin: 0 0 8px;
        }

        .empty-state p {
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0;
        }

        .admins-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admins-table th {
          text-align: left;
          padding: 14px 20px;
          background: rgba(201, 162, 39, 0.05);
          color: #c9a227;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(201, 162, 39, 0.1);
        }

        .admins-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .admins-table tr:last-child td {
          border-bottom: none;
        }

        .admins-table tr:hover td {
          background: rgba(201, 162, 39, 0.03);
        }

        .admin-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          font-weight: 700;
          font-size: 1rem;
        }

        .admin-name {
          display: block;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .admin-role {
          display: block;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-info .email {
          color: #fff;
          font-size: 0.9rem;
        }

        .contact-info .phone {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .status-badge--active {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .status-badge--inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .date {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.3);
          color: #c9a227;
        }

        .action-btn--success:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .action-btn--warning:hover {
          background: rgba(234, 179, 8, 0.1);
          border-color: rgba(234, 179, 8, 0.3);
          color: #eab308;
        }

        .action-btn--danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 480px;
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          overflow: hidden;
        }

        .modal--small {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.1);
        }

        .modal-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          color: #c9a227;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(201, 162, 39, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .form-group input::placeholder {
          color: #6b7280;
        }

        .helper-text {
          display: block;
          margin-top: 6px;
          color: #6b7280;
          font-size: 0.8rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid rgba(201, 162, 39, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #9ca3af;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .btn-warning {
          padding: 12px 20px;
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
          border: none;
          border-radius: 10px;
          color: #0a0a0a;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-warning:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.3);
        }

        /* Confirm Modal */
        .confirm-message {
          text-align: center;
        }

        .warning-icon {
          color: #eab308;
          margin-bottom: 16px;
        }

        .confirm-message p {
          color: #fff;
          font-size: 1rem;
          margin: 0 0 8px;
        }

        .confirm-message .sub-text {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        /* Password Display */
        .password-display {
          text-align: center;
        }

        .success-icon {
          color: #22c55e;
          margin-bottom: 16px;
        }

        .password-display p {
          color: #9ca3af;
          font-size: 0.95rem;
          margin: 0 0 16px;
        }

        .password-box {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .password-box code {
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 1.1rem;
          color: #c9a227;
          font-weight: 600;
        }

        .copy-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          color: #c9a227;
        }

        .warning-text {
          color: #ef4444 !important;
          font-size: 0.85rem !important;
        }

        /* Notification Toast */
        .notification-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          z-index: 2000;
          animation: slideIn 0.3s ease;
        }

        .notification-toast--success {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .notification-toast--success svg {
          color: #22c55e;
        }

        .notification-toast--error {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .notification-toast--error svg {
          color: #ef4444;
        }

        .notification-toast span {
          color: #fff;
          font-size: 0.9rem;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
          }

          .filters-bar {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .admins-table {
            display: block;
          }

          .admins-table thead {
            display: none;
          }

          .admins-table tbody {
            display: block;
          }

          .admins-table tr {
            display: block;
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .admins-table td {
            display: block;
            padding: 8px 0;
            border: none;
          }

          .admins-table td::before {
            content: attr(data-label);
            font-size: 0.75rem;
            color: #c9a227;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: block;
            margin-bottom: 4px;
          }

          .actions {
            justify-content: flex-start;
            margin-top: 12px;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
