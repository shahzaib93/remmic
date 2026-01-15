import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { useAdmin, AdminRoles } from '../../contexts/AdminContext'
import { useFirebase } from '../../contexts/FirebaseContext'

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function AdminUsers() {
  const router = useRouter()
  const { adminUser, isSuper, logAuditAction } = useAdmin()
  const { getAllProperties } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    // Check if user is Super Admin
    if (!isSuper) {
      router.replace('/admin-dashboard?error=unauthorized')
      return
    }
    loadUsers()
  }, [isSuper])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Load users from localStorage (simulating database)
      const storedUsers = JSON.parse(localStorage.getItem('platformUsers') || '[]')

      // Add some sample users if none exist
      if (storedUsers.length === 0) {
        const sampleUsers = [
          {
            id: 'user-1',
            name: 'Ahmed Khan',
            email: 'ahmed@example.com',
            phone: '+92 300 1234567',
            role: 'buyer',
            kycStatus: 'verified',
            kycDocuments: [
              { type: 'cnic', name: 'CNIC Front', status: 'verified' },
              { type: 'cnic', name: 'CNIC Back', status: 'verified' },
            ],
            memberSince: '2024-06-15',
            lastActive: new Date().toISOString(),
            investmentCount: 3,
            propertyCount: 0,
            status: 'active',
          },
          {
            id: 'user-2',
            name: 'Fatima Ali',
            email: 'fatima@example.com',
            phone: '+92 321 9876543',
            role: 'seller',
            kycStatus: 'pending',
            kycDocuments: [
              { type: 'cnic', name: 'CNIC Front', status: 'pending' },
            ],
            memberSince: '2024-08-20',
            lastActive: new Date(Date.now() - 86400000 * 2).toISOString(),
            investmentCount: 0,
            propertyCount: 2,
            status: 'active',
          },
          {
            id: 'user-3',
            name: 'Hassan Malik',
            email: 'hassan@example.com',
            phone: '+92 333 5551234',
            role: 'investor',
            kycStatus: 'verified',
            kycDocuments: [
              { type: 'cnic', name: 'CNIC', status: 'verified' },
              { type: 'proof_of_address', name: 'Utility Bill', status: 'verified' },
              { type: 'bank_statement', name: 'Bank Statement', status: 'verified' },
            ],
            memberSince: '2024-03-10',
            lastActive: new Date(Date.now() - 86400000 * 5).toISOString(),
            investmentCount: 7,
            propertyCount: 0,
            status: 'active',
          },
          {
            id: 'user-4',
            name: 'Sara Hussain',
            email: 'sara@example.com',
            phone: '+92 345 7778899',
            role: 'owner',
            kycStatus: 'rejected',
            kycDocuments: [
              { type: 'cnic', name: 'CNIC', status: 'rejected', reason: 'Image unclear' },
            ],
            memberSince: '2024-09-01',
            lastActive: new Date(Date.now() - 86400000 * 10).toISOString(),
            investmentCount: 0,
            propertyCount: 1,
            status: 'active',
          },
          {
            id: 'user-5',
            name: 'Usman Property Management',
            email: 'usman.pm@example.com',
            phone: '+92 311 2223344',
            role: 'manager',
            kycStatus: 'verified',
            kycDocuments: [
              { type: 'cnic', name: 'CNIC', status: 'verified' },
              { type: 'business_license', name: 'Business License', status: 'verified' },
            ],
            memberSince: '2024-01-15',
            lastActive: new Date().toISOString(),
            investmentCount: 0,
            propertyCount: 0,
            managedProperties: 5,
            status: 'active',
          },
        ]
        localStorage.setItem('platformUsers', JSON.stringify(sampleUsers))
        setUsers(sampleUsers)
      } else {
        setUsers(storedUsers)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      showNotification('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return
    setActionLoading(selectedUser.id)

    try {
      const updatedUsers = users.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      )
      localStorage.setItem('platformUsers', JSON.stringify(updatedUsers))
      setUsers(updatedUsers)

      logAuditAction({
        module: 'users',
        action: 'change_role',
        entity: selectedUser.email,
        notes: `Role changed from ${selectedUser.role} to ${newRole}`,
      })

      showNotification(`Role updated to ${newRole}`)
      setShowRoleModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to change role:', error)
      showNotification('Failed to update role', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLockUser = async (user) => {
    setActionLoading(user.id)

    try {
      const newStatus = user.status === 'locked' ? 'active' : 'locked'
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, status: newStatus } : u
      )
      localStorage.setItem('platformUsers', JSON.stringify(updatedUsers))
      setUsers(updatedUsers)

      logAuditAction({
        module: 'users',
        action: newStatus === 'locked' ? 'lock_user' : 'unlock_user',
        entity: user.email,
        notes: `User ${newStatus === 'locked' ? 'locked' : 'unlocked'} by admin`,
      })

      showNotification(`User ${newStatus === 'locked' ? 'locked' : 'unlocked'}`)
    } catch (error) {
      console.error('Failed to update user status:', error)
      showNotification('Failed to update user', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    // Tab filter
    let matchesTab = true
    if (activeTab === 'buyers') matchesTab = user.role === 'buyer'
    else if (activeTab === 'sellers') matchesTab = user.role === 'seller'
    else if (activeTab === 'investors') matchesTab = user.role === 'investor'
    else if (activeTab === 'owners') matchesTab = user.role === 'owner'
    else if (activeTab === 'managers') matchesTab = user.role === 'manager'
    else if (activeTab === 'admins') matchesTab = user.role === 'admin' || user.role === 'super_admin' || user.role === 'sector_admin'
    else if (activeTab === 'pending-kyc') matchesTab = user.kycStatus === 'pending'
    else if (activeTab === 'locked') matchesTab = user.status === 'locked'

    // Search filter
    let matchesSearch = true
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matchesSearch =
        (user.name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        (user.phone || '').toLowerCase().includes(query)
    }

    return matchesTab && matchesSearch
  })

  // Stats
  const stats = {
    total: users.length,
    buyers: users.filter(u => u.role === 'buyer').length,
    sellers: users.filter(u => u.role === 'seller').length,
    investors: users.filter(u => u.role === 'investor').length,
    pendingKyc: users.filter(u => u.kycStatus === 'pending').length,
    locked: users.filter(u => u.status === 'locked').length,
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      'buyer': { label: 'Buyer', color: 'blue' },
      'seller': { label: 'Seller', color: 'green' },
      'investor': { label: 'Investor', color: 'gold' },
      'owner': { label: 'Owner', color: 'purple' },
      'manager': { label: 'Manager', color: 'orange' },
      'admin': { label: 'Admin', color: 'red' },
      'super_admin': { label: 'Super Admin', color: 'red' },
      'sector_admin': { label: 'Sector Admin', color: 'orange' },
    }
    const config = roleConfig[role] || { label: role, color: 'gray' }
    return (
      <span className={`role-badge role-badge--${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getKycBadge = (status) => {
    const statusConfig = {
      'verified': { label: 'Verified', color: 'green' },
      'pending': { label: 'Pending', color: 'gold' },
      'rejected': { label: 'Rejected', color: 'red' },
      'not_submitted': { label: 'Not Submitted', color: 'gray' },
    }
    const config = statusConfig[status] || { label: status, color: 'gray' }
    return (
      <span className={`kyc-badge kyc-badge--${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (!isSuper) {
    return null
  }

  return (
    <AdminLayout title="Users & Roles">
      <div className="users-page">
        {/* Notification */}
        {notification && (
          <div className={`notification notification--${notification.type}`}>
            {notification.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>Users & Roles</h1>
            <p>Manage platform users, KYC verification, and role assignments</p>
          </div>
          <div className="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Super Admin Only
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className={`stat-card ${activeTab === 'all' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('all')}>
            <div className="stat-icon stat-icon--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className={`stat-card ${activeTab === 'buyers' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('buyers')}>
            <span className="stat-value">{stats.buyers}</span>
            <span className="stat-label">Buyers</span>
          </div>
          <div className={`stat-card ${activeTab === 'sellers' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('sellers')}>
            <span className="stat-value">{stats.sellers}</span>
            <span className="stat-label">Sellers</span>
          </div>
          <div className={`stat-card ${activeTab === 'investors' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('investors')}>
            <span className="stat-value">{stats.investors}</span>
            <span className="stat-label">Investors</span>
          </div>
          <div className={`stat-card stat-card--warning ${activeTab === 'pending-kyc' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('pending-kyc')}>
            <span className="stat-value">{stats.pendingKyc}</span>
            <span className="stat-label">Pending KYC</span>
          </div>
          <div className={`stat-card ${activeTab === 'locked' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('locked')}>
            <span className="stat-value">{stats.locked}</span>
            <span className="stat-label">Locked</span>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Users Table */}
        <section className="users-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
              </svg>
              <h3>No Users Found</h3>
              <p>{searchQuery ? 'Try different search terms' : 'No users match the current filter'}</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>KYC Status</th>
                  <th>Member Since</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const isLoading = actionLoading === user.id
                  return (
                    <tr key={user.id} className={user.status === 'locked' ? 'row--locked' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                            <span className="user-phone">{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getKycBadge(user.kycStatus)}</td>
                      <td>{formatDate(user.memberSince)}</td>
                      <td>
                        <div className="activity-info">
                          <span>{user.investmentCount || 0} investments</span>
                          <span>{user.propertyCount || 0} properties</span>
                        </div>
                      </td>
                      <td>
                        {user.status === 'locked' ? (
                          <span className="status-locked">Locked</span>
                        ) : (
                          <span className="status-active">Active</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn"
                            onClick={() => { setSelectedUser(user); setShowDocModal(true); }}
                            title="View Documents"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                            </svg>
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                            title="Change Role"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </button>
                          <button
                            className={`action-btn ${user.status === 'locked' ? 'action-btn--unlock' : 'action-btn--lock'}`}
                            onClick={() => handleLockUser(user)}
                            disabled={isLoading}
                            title={user.status === 'locked' ? 'Unlock User' : 'Lock User'}
                          >
                            {user.status === 'locked' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change User Role</h3>
            <p>Select a new role for <strong>{selectedUser.name}</strong></p>

            <div className="role-options">
              {['buyer', 'seller', 'investor', 'owner', 'manager'].map(role => (
                <button
                  key={role}
                  className={`role-option ${selectedUser.role === role ? 'role-option--current' : ''}`}
                  onClick={() => handleRoleChange(role)}
                  disabled={actionLoading}
                >
                  {getRoleBadge(role)}
                  {selectedUser.role === role && <span className="current-label">Current</span>}
                </button>
              ))}
            </div>

            <button className="modal-btn--cancel" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocModal && selectedUser && (
        <div className="modal-overlay" onClick={() => { setShowDocModal(false); setSelectedUser(null); }}>
          <div className="modal modal--docs" onClick={e => e.stopPropagation()}>
            <h3>KYC Documents</h3>
            <p>{selectedUser.name} - {selectedUser.email}</p>

            <div className="docs-list">
              {selectedUser.kycDocuments && selectedUser.kycDocuments.length > 0 ? (
                selectedUser.kycDocuments.map((doc, index) => (
                  <div key={index} className="doc-item">
                    <div className="doc-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                      </svg>
                    </div>
                    <div className="doc-info">
                      <span className="doc-name">{doc.name}</span>
                      <span className="doc-type">{doc.type.replace('_', ' ')}</span>
                    </div>
                    <span className={`doc-status doc-status--${doc.status}`}>
                      {doc.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-docs">No documents submitted</div>
              )}
            </div>

            <button className="modal-btn--cancel" onClick={() => { setShowDocModal(false); setSelectedUser(null); }}>
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .users-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Notification */
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 14px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification--success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .notification--error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .header-content h1 {
          margin: 0;
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
        }

        .header-content p {
          margin: 4px 0 0;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
        }

        .stat-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .stat-card--active {
          border-color: rgba(201, 162, 39, 0.4);
          background: rgba(201, 162, 39, 0.08);
        }

        .stat-card--warning .stat-value {
          color: #f97316;
        }

        .stat-card .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-card .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .stat-icon--blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        /* Filter Section */
        .filter-section {
          display: flex;
          gap: 16px;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .search-box svg {
          color: #6b7280;
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: #6b7280;
        }

        .clear-btn {
          padding: 4px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        /* Users Table */
        .users-table-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.03);
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .users-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .users-table tr:last-child td {
          border-bottom: none;
        }

        .row--locked {
          opacity: 0.6;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
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
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
        }

        .user-email {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .user-phone {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Badges */
        .role-badge,
        .kyc-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-badge--blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .role-badge--green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .role-badge--gold { background: rgba(201, 162, 39, 0.15); color: #c9a227; }
        .role-badge--purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        .role-badge--orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
        .role-badge--red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .role-badge--gray { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

        .kyc-badge--green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .kyc-badge--gold { background: rgba(201, 162, 39, 0.15); color: #c9a227; }
        .kyc-badge--red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .kyc-badge--gray { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .status-active {
          color: #22c55e;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-locked {
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.3);
          color: #c9a227;
        }

        .action-btn--lock:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .action-btn--unlock:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(201, 162, 39, 0.2);
          border-top-color: #c9a227;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state svg {
          color: #4b5563;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #fff;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
        }

        .modal--docs {
          max-width: 500px;
        }

        .modal h3 {
          margin: 0 0 8px;
          font-size: 1.1rem;
          color: #fff;
        }

        .modal p {
          margin: 0 0 20px;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .modal p strong {
          color: #fff;
        }

        .role-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .role-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-option:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .role-option--current {
          border-color: rgba(201, 162, 39, 0.4);
          background: rgba(201, 162, 39, 0.08);
        }

        .current-label {
          font-size: 0.7rem;
          color: #c9a227;
          text-transform: uppercase;
        }

        .docs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }

        .doc-icon {
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
        }

        .doc-info {
          flex: 1;
        }

        .doc-name {
          display: block;
          font-size: 0.9rem;
          color: #fff;
        }

        .doc-type {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: capitalize;
        }

        .doc-status {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .doc-status--verified {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .doc-status--pending {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .doc-status--rejected {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .no-docs {
          text-align: center;
          padding: 24px;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .modal-btn--cancel {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn--cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .users-table-wrapper {
            overflow-x: auto;
          }

          .users-table {
            min-width: 800px;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
