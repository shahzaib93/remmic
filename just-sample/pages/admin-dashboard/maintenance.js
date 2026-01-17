import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useFirebase } from '../../contexts/FirebaseContext'
import overviewStyles from '../../styles/adminOverview.module.css'

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

const formatDate = (input) => {
  if (!input) return '--'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Mock maintenance requests data
const MOCK_MAINTENANCE_REQUESTS = [
  {
    id: 'maint-001',
    propertyId: 'prop-123',
    propertyName: 'DHA Phase 5 Villa',
    propertyAddress: 'Street 10, DHA Phase 5, Islamabad',
    requestType: 'Plumbing',
    description: 'Kitchen sink is clogged and water backing up',
    urgency: 'urgent',
    estimatedCost: '15000',
    status: 'In Progress',
    contractorName: 'Ahmed Construction Services',
    contractorPhone: '+92 300 1234567',
    contractorEmail: 'ahmed@constructionservices.pk',
    clientName: 'Sarah Khan',
    clientPhone: '+92 321 9876543',
    clientEmail: 'sarah.khan@email.com',
    submittedAt: '2024-12-01',
    startDate: '2024-12-02',
    completionDate: null,
    actualCost: null,
    progress: 60,
    notes: 'Contractor started work yesterday, found additional pipe damage'
  },
  {
    id: 'maint-002',
    propertyId: 'prop-456',
    propertyName: 'Gulberg Apartment',
    propertyAddress: 'Block C, Gulberg Residencia, Islamabad',
    requestType: 'Electrical',
    description: 'Power outage in master bedroom, circuit breaker tripping',
    urgency: 'standard',
    estimatedCost: '25000',
    status: 'Pending',
    contractorName: 'Reliable Home Solutions',
    contractorPhone: '+92 301 9876543',
    contractorEmail: 'contact@reliablehome.pk',
    clientName: 'Ahmed Ali',
    clientPhone: '+92 333 4567890',
    clientEmail: 'ahmed.ali@email.com',
    submittedAt: '2024-12-03',
    startDate: null,
    completionDate: null,
    actualCost: null,
    progress: 0,
    notes: 'Waiting for contractor availability'
  },
  {
    id: 'maint-003',
    propertyId: 'prop-789',
    propertyName: 'F-7 Commercial Plaza',
    propertyAddress: 'Main Jinnah Avenue, F-7 Markaz, Islamabad',
    requestType: 'HVAC',
    description: 'Air conditioning system not cooling properly, suspected refrigerant leak',
    urgency: 'emergency',
    estimatedCost: '75000',
    status: 'Completed',
    contractorName: 'Elite Property Maintenance',
    contractorPhone: '+92 333 4567890',
    contractorEmail: 'info@elitemaintenance.pk',
    clientName: 'Fatima Sheikh',
    clientPhone: '+92 315 1234567',
    clientEmail: 'fatima.sheikh@email.com',
    submittedAt: '2024-11-28',
    startDate: '2024-11-29',
    completionDate: '2024-12-01',
    actualCost: '68000',
    progress: 100,
    notes: 'Successfully repaired refrigerant leak and serviced entire system'
  },
  {
    id: 'maint-004',
    propertyId: 'prop-321',
    propertyName: 'Bahria Town House',
    propertyAddress: 'Phase 3, Bahria Town, Rawalpindi',
    requestType: 'Roofing',
    description: 'Water leakage during rain, multiple spots on ceiling',
    urgency: 'urgent',
    estimatedCost: '120000',
    status: 'Quoted',
    contractorName: 'Elite Property Maintenance',
    contractorPhone: '+92 333 4567890',
    contractorEmail: 'info@elitemaintenance.pk',
    clientName: 'Hassan Malik',
    clientPhone: '+92 302 8765432',
    clientEmail: 'hassan.malik@email.com',
    submittedAt: '2024-12-04',
    startDate: null,
    completionDate: null,
    actualCost: null,
    progress: 5,
    notes: 'Site inspection completed, detailed quote provided to client'
  }
]

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return overviewStyles.badgeSuccess
    case 'in progress':
      return overviewStyles.badgeActive
    case 'pending':
      return overviewStyles.badgePending
    case 'quoted':
      return overviewStyles.badge
    default:
      return overviewStyles.badge
  }
}

const getUrgencyBadgeClass = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'emergency':
      return overviewStyles.badgeWarning
    case 'urgent':
      return overviewStyles.badgeActive
    case 'standard':
      return overviewStyles.badge
    default:
      return overviewStyles.badge
  }
}

export default function AdminMaintenancePage() {
  const { getAllContactMessages } = useFirebase()
  const [maintenanceRequests, setMaintenanceRequests] = useState(MOCK_MAINTENANCE_REQUESTS)
  const [filteredRequests, setFilteredRequests] = useState(MOCK_MAINTENANCE_REQUESTS)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    applyFilters()
  }, [filterStatus, filterUrgency, searchTerm, maintenanceRequests])

  const applyFilters = () => {
    let filtered = maintenanceRequests

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status.toLowerCase() === filterStatus.toLowerCase())
    }

    if (filterUrgency !== 'all') {
      filtered = filtered.filter(req => req.urgency.toLowerCase() === filterUrgency.toLowerCase())
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }

  const updateRequestStatus = (requestId, newStatus, notes = '') => {
    setMaintenanceRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: newStatus, notes: notes || req.notes, progress: getProgressForStatus(newStatus) }
        : req
    ))
  }

  const getProgressForStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 0
      case 'quoted': return 10
      case 'in progress': return 50
      case 'completed': return 100
      default: return 0
    }
  }

  const stats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter(req => req.status === 'Pending').length,
    inProgress: maintenanceRequests.filter(req => req.status === 'In Progress').length,
    completed: maintenanceRequests.filter(req => req.status === 'Completed').length,
    totalValue: maintenanceRequests.reduce((sum, req) => sum + Number(req.actualCost || req.estimatedCost || 0), 0)
  }

  return (
    <AdminLayout>
      <div className={overviewStyles.pageHeader}>
        <h1>Property Maintenance Management</h1>
        <div className={overviewStyles.headerStats}>
          <div className={overviewStyles.statCard}>
            <div className={overviewStyles.statValue}>{stats.total}</div>
            <div className={overviewStyles.statLabel}>Total Requests</div>
          </div>
          <div className={overviewStyles.statCard}>
            <div className={overviewStyles.statValue}>{stats.pending}</div>
            <div className={overviewStyles.statLabel}>Pending</div>
          </div>
          <div className={overviewStyles.statCard}>
            <div className={overviewStyles.statValue}>{stats.inProgress}</div>
            <div className={overviewStyles.statLabel}>In Progress</div>
          </div>
          <div className={overviewStyles.statCard}>
            <div className={overviewStyles.statValue}>{stats.completed}</div>
            <div className={overviewStyles.statLabel}>Completed</div>
          </div>
          <div className={overviewStyles.statCard}>
            <div className={overviewStyles.statValue}>{formatCurrency(stats.totalValue)}</div>
            <div className={overviewStyles.statLabel}>Total Value</div>
          </div>
        </div>
      </div>

      <div className={overviewStyles.filtersContainer}>
        <div className={overviewStyles.filters}>
          <input
            type="text"
            placeholder="Search by property, client, or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={overviewStyles.searchInput}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={overviewStyles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="quoted">Quoted</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className={overviewStyles.filterSelect}
          >
            <option value="all">All Priority</option>
            <option value="emergency">Emergency</option>
            <option value="urgent">Urgent</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      <div className={overviewStyles.tableContainer}>
        {loading ? (
          <div className={overviewStyles.emptyState}>Loading maintenance requests...</div>
        ) : filteredRequests.length > 0 ? (
          <div className={overviewStyles.requestsGrid}>
            {filteredRequests.map((request) => (
              <div key={request.id} className={overviewStyles.requestCard}>
                <div className={overviewStyles.requestHeader}>
                  <h3>{request.propertyName}</h3>
                  <div className={overviewStyles.requestBadges}>
                    <span className={getUrgencyBadgeClass(request.urgency)}>
                      {request.urgency}
                    </span>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className={overviewStyles.requestDetails}>
                  <div className={overviewStyles.requestField}>
                    <strong>Type:</strong> {request.requestType}
                  </div>
                  <div className={overviewStyles.requestField}>
                    <strong>Client:</strong> {request.clientName} ({request.clientPhone})
                  </div>
                  <div className={overviewStyles.requestField}>
                    <strong>Contractor:</strong> {request.contractorName}
                  </div>
                  <div className={overviewStyles.requestField}>
                    <strong>Estimated Cost:</strong> {formatCurrency(request.estimatedCost)}
                  </div>
                  {request.actualCost && (
                    <div className={overviewStyles.requestField}>
                      <strong>Actual Cost:</strong> {formatCurrency(request.actualCost)}
                    </div>
                  )}
                </div>

                <div className={overviewStyles.requestDescription}>
                  <strong>Issue:</strong> {request.description}
                </div>

                {request.progress > 0 && (
                  <div className={overviewStyles.progressContainer}>
                    <div className={overviewStyles.progressLabel}>
                      Progress: {request.progress}%
                    </div>
                    <div className={overviewStyles.progressBar}>
                      <div
                        className={overviewStyles.progressFill}
                        style={{ width: `${request.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className={overviewStyles.requestActions}>
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowDetails(true)
                    }}
                    className={overviewStyles.actionButton}
                  >
                    View Details
                  </button>
                  {request.status !== 'Completed' && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          updateRequestStatus(request.id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className={overviewStyles.statusSelect}
                    >
                      <option value="">Update Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Quoted">Quoted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>

                <div className={overviewStyles.requestMeta}>
                  <span>Submitted: {formatDate(request.submittedAt)}</span>
                  {request.startDate && (
                    <span>Started: {formatDate(request.startDate)}</span>
                  )}
                  {request.completionDate && (
                    <span>Completed: {formatDate(request.completionDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={overviewStyles.emptyState}>
            No maintenance requests match your current filters.
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className={overviewStyles.modalOverlay}>
          <div className={overviewStyles.modalContent}>
            <div className={overviewStyles.modalHeader}>
              <h2>Maintenance Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className={overviewStyles.modalClose}
              >
                ×
              </button>
            </div>

            <div className={overviewStyles.modalBody}>
              <div className={overviewStyles.detailsGrid}>
                <div className={overviewStyles.detailsSection}>
                  <h3>Property Information</h3>
                  <div><strong>Name:</strong> {selectedRequest.propertyName}</div>
                  <div><strong>Address:</strong> {selectedRequest.propertyAddress}</div>
                  <div><strong>ID:</strong> {selectedRequest.propertyId}</div>
                </div>

                <div className={overviewStyles.detailsSection}>
                  <h3>Client Information</h3>
                  <div><strong>Name:</strong> {selectedRequest.clientName}</div>
                  <div><strong>Phone:</strong> {selectedRequest.clientPhone}</div>
                  <div><strong>Email:</strong> {selectedRequest.clientEmail}</div>
                </div>

                <div className={overviewStyles.detailsSection}>
                  <h3>Contractor Information</h3>
                  <div><strong>Name:</strong> {selectedRequest.contractorName}</div>
                  <div><strong>Phone:</strong> {selectedRequest.contractorPhone}</div>
                  <div><strong>Email:</strong> {selectedRequest.contractorEmail}</div>
                </div>

                <div className={overviewStyles.detailsSection}>
                  <h3>Request Details</h3>
                  <div><strong>Type:</strong> {selectedRequest.requestType}</div>
                  <div><strong>Urgency:</strong> {selectedRequest.urgency}</div>
                  <div><strong>Status:</strong> {selectedRequest.status}</div>
                  <div><strong>Progress:</strong> {selectedRequest.progress}%</div>
                </div>

                <div className={overviewStyles.detailsSection}>
                  <h3>Cost Information</h3>
                  <div><strong>Estimated:</strong> {formatCurrency(selectedRequest.estimatedCost)}</div>
                  {selectedRequest.actualCost && (
                    <div><strong>Actual:</strong> {formatCurrency(selectedRequest.actualCost)}</div>
                  )}
                </div>

                <div className={overviewStyles.detailsSection}>
                  <h3>Timeline</h3>
                  <div><strong>Submitted:</strong> {formatDate(selectedRequest.submittedAt)}</div>
                  {selectedRequest.startDate && (
                    <div><strong>Started:</strong> {formatDate(selectedRequest.startDate)}</div>
                  )}
                  {selectedRequest.completionDate && (
                    <div><strong>Completed:</strong> {formatDate(selectedRequest.completionDate)}</div>
                  )}
                </div>
              </div>

              <div className={overviewStyles.descriptionSection}>
                <h3>Problem Description</h3>
                <p>{selectedRequest.description}</p>
              </div>

              {selectedRequest.notes && (
                <div className={overviewStyles.notesSection}>
                  <h3>Notes</h3>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <div className={overviewStyles.modalActions}>
              <button
                onClick={() => setShowDetails(false)}
                className={overviewStyles.actionButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}