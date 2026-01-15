import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { useAdmin, AdminRoles } from '../../contexts/AdminContext'

// Format date time
const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminAuditLogs() {
  const router = useRouter()
  const { isSuper, getAuditLogs } = useAdmin()

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 20

  useEffect(() => {
    if (!isSuper) {
      router.replace('/admin-dashboard?error=unauthorized')
      return
    }
    loadLogs()
  }, [isSuper])

  useEffect(() => {
    applyFilters()
  }, [logs, searchQuery, moduleFilter, dateFrom, dateTo])

  const loadLogs = () => {
    setLoading(true)
    try {
      const result = getAuditLogs()
      if (result.success) {
        // If no logs exist, create some sample data
        if (result.logs.length === 0) {
          const sampleLogs = generateSampleLogs()
          localStorage.setItem('auditLogs', JSON.stringify(sampleLogs))
          setLogs(sampleLogs)
        } else {
          setLogs(result.logs)
        }
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleLogs = () => {
    const actions = [
      { module: 'evaluations', action: 'approve_evaluation', entity: 'DHA Phase 5 Plot', notes: 'Evaluation approved for site visit' },
      { module: 'evaluations', action: 'reject_evaluation', entity: 'Model Town Property', notes: 'Incomplete documentation' },
      { module: 'listings', action: 'approve_listing', entity: 'Commercial Plaza F-10', notes: 'Listing approved for auction' },
      { module: 'listings', action: 'reject_listing', entity: 'Residential Plot', notes: 'Price verification needed' },
      { module: 'auctions', action: 'pause_auction', entity: 'Agricultural Land 5', notes: 'Technical issues reported' },
      { module: 'auctions', action: 'resume_auction', entity: 'Agricultural Land 5', notes: 'Issues resolved' },
      { module: 'auctions', action: 'mark_sold', entity: 'DHA Phase 6 House', notes: 'Auction completed successfully' },
      { module: 'management', action: 'assign_manager', entity: 'Bahria Heights Unit', notes: 'Property manager assigned' },
      { module: 'users', action: 'change_role', entity: 'user@example.com', notes: 'Role changed from buyer to investor' },
      { module: 'users', action: 'lock_user', entity: 'spam@example.com', notes: 'Suspicious activity detected' },
      { module: 'development', action: 'update_milestone', entity: 'Green Valley Project', notes: 'Foundation completed' },
      { module: 'reports', action: 'generate_statement', entity: 'Monthly Report Q4', notes: 'PDF statement generated' },
    ]

    const actors = [
      { name: 'Admin User', role: 'super_admin' },
      { name: 'Sector Admin', role: 'sector_admin' },
    ]

    const logs = []
    const now = Date.now()

    for (let i = 0; i < 50; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const actor = actors[Math.floor(Math.random() * actors.length)]
      const timestamp = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days

      logs.push({
        id: `log-${now}-${i}`,
        timestamp: timestamp.toISOString(),
        actor: actor.name,
        actorRole: actor.role,
        ...action,
      })
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        (log.action || '').toLowerCase().includes(query) ||
        (log.entity || '').toLowerCase().includes(query) ||
        (log.actor || '').toLowerCase().includes(query) ||
        (log.notes || '').toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateFrom))
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo)
      endOfDay.setHours(23, 59, 59, 999)
      filtered = filtered.filter(log => new Date(log.timestamp) <= endOfDay)
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setModuleFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  )

  // Stats
  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp)
      const today = new Date()
      return logDate.toDateString() === today.toDateString()
    }).length,
    thisWeek: logs.filter(l => {
      const logDate = new Date(l.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return logDate >= weekAgo
    }).length,
  }

  const modules = [
    { id: 'all', label: 'All Modules' },
    { id: 'evaluations', label: 'Evaluations' },
    { id: 'listings', label: 'Listings' },
    { id: 'auctions', label: 'Auctions' },
    { id: 'management', label: 'Management' },
    { id: 'development', label: 'Development' },
    { id: 'users', label: 'Users' },
    { id: 'reports', label: 'Reports' },
  ]

  const getActionBadge = (action) => {
    const actionConfig = {
      'approve': { color: 'green', label: 'Approve' },
      'reject': { color: 'red', label: 'Reject' },
      'pause': { color: 'gold', label: 'Pause' },
      'resume': { color: 'blue', label: 'Resume' },
      'mark': { color: 'purple', label: 'Mark' },
      'assign': { color: 'blue', label: 'Assign' },
      'change': { color: 'orange', label: 'Change' },
      'lock': { color: 'red', label: 'Lock' },
      'unlock': { color: 'green', label: 'Unlock' },
      'update': { color: 'blue', label: 'Update' },
      'generate': { color: 'purple', label: 'Generate' },
      'create': { color: 'green', label: 'Create' },
      'delete': { color: 'red', label: 'Delete' },
    }

    const actionType = action?.split('_')[0] || 'unknown'
    const config = actionConfig[actionType] || { color: 'gray', label: action }

    return (
      <span className={`action-badge action-badge--${config.color}`}>
        {action?.replace(/_/g, ' ') || 'Unknown'}
      </span>
    )
  }

  const getModuleBadge = (module) => {
    const moduleConfig = {
      'evaluations': { color: 'gold', icon: 'E' },
      'listings': { color: 'blue', icon: 'L' },
      'auctions': { color: 'green', icon: 'A' },
      'management': { color: 'purple', icon: 'M' },
      'development': { color: 'orange', icon: 'D' },
      'users': { color: 'red', icon: 'U' },
      'reports': { color: 'blue', icon: 'R' },
    }

    const config = moduleConfig[module] || { color: 'gray', icon: '?' }

    return (
      <span className={`module-badge module-badge--${config.color}`}>
        {config.icon}
      </span>
    )
  }

  if (!isSuper) {
    return null
  }

  return (
    <AdminLayout title="Audit Logs">
      <div className="audit-page">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>Audit Logs</h1>
            <p>Complete history of all admin actions and system events</p>
          </div>
          <div className="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Super Admin Only
          </div>
        </header>

        {/* Stats Bar */}
        <section className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{stats.thisWeek}</span>
            <span className="stat-label">This Week</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{filteredLogs.length}</span>
            <span className="stat-label">Filtered Results</span>
          </div>
        </section>

        {/* Filters */}
        <section className="filters-section">
          <div className="filter-row">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>

            <div className="date-filter">
              <input
                type="date"
                placeholder="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                placeholder="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {(searchQuery || moduleFilter !== 'all' || dateFrom || dateTo) && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Logs Table */}
        <section className="logs-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading audit logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3>No Logs Found</h3>
              <p>No audit logs match the current filters</p>
            </div>
          ) : (
            <>
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Actor</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span className="timestamp">{formatDateTime(log.timestamp)}</span>
                      </td>
                      <td>
                        <div className="module-cell">
                          {getModuleBadge(log.module)}
                          <span>{log.module}</span>
                        </div>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td>
                        <span className="entity">{log.entity || '—'}</span>
                      </td>
                      <td>
                        <div className="actor-cell">
                          <span className="actor-name">{log.actor}</span>
                          <span className="actor-role">{log.actorRole?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td>
                        <span className="notes">{log.notes || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Export Notice */}
        <div className="export-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span>Audit logs are retained for compliance purposes. Export functionality available in Phase-2.</span>
        </div>
      </div>

      <style jsx>{`
        .audit-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
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

        /* Stats Bar */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 18px 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-item .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-item .stat-label {
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Filters */
        .filters-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
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
          flex-shrink: 0;
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

        .filter-select {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
        }

        .filter-select option {
          background: #1a1a1a;
          color: #fff;
        }

        .date-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-filter input {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 0.85rem;
          outline: none;
        }

        .date-filter input::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        .date-filter span {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .clear-filters {
          padding: 10px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Logs Table */
        .logs-table-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.03);
          text-align: left;
          font-size: 0.7rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .logs-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .logs-table tr:last-child td {
          border-bottom: none;
        }

        .logs-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .timestamp {
          font-size: 0.8rem;
          color: #9ca3af;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .module-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #fff;
          text-transform: capitalize;
        }

        .module-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .module-badge--gold { background: rgba(201, 162, 39, 0.2); color: #c9a227; }
        .module-badge--blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .module-badge--green { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .module-badge--purple { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
        .module-badge--orange { background: rgba(249, 115, 22, 0.2); color: #f97316; }
        .module-badge--red { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .module-badge--gray { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

        .action-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .action-badge--green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .action-badge--red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .action-badge--gold { background: rgba(201, 162, 39, 0.15); color: #c9a227; }
        .action-badge--blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .action-badge--purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        .action-badge--orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
        .action-badge--gray { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

        .entity {
          font-size: 0.85rem;
          color: #fff;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .actor-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .actor-name {
          font-size: 0.85rem;
          color: #fff;
        }

        .actor-role {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: capitalize;
        }

        .notes {
          font-size: 0.8rem;
          color: #9ca3af;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Pagination */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .page-btn {
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.3);
          color: #c9a227;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 0.85rem;
          color: #9ca3af;
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

        /* Export Notice */
        .export-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(74, 55, 40, 0.15);
          border: 1px solid rgba(74, 55, 40, 0.3);
          border-radius: 10px;
          font-size: 0.85rem;
          color: #a18072;
        }

        .export-notice svg {
          color: #a18072;
          flex-shrink: 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .logs-table-wrapper {
            overflow-x: auto;
          }

          .logs-table {
            min-width: 900px;
          }

          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .date-filter {
            width: 100%;
            justify-content: space-between;
          }

          .date-filter input {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .stats-bar {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stat-divider {
            display: none;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
