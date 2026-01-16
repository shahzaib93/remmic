import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useFirebase } from '../../contexts/FirebaseContext'

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
      return 'bg-green-500/15 text-emerald-700 border-green-500/20'
    case 'in progress':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'pending':
      return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20'
    case 'quoted':
      return 'bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] border-[rgba(201,162,39,0.2)]'
    default:
      return 'bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] border-[rgba(201,162,39,0.2)]'
  }
}

const getUrgencyBadgeClass = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'emergency':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/20'
    case 'urgent':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'standard':
      return 'bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] border-[rgba(201,162,39,0.2)]'
    default:
      return 'bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] border-[rgba(201,162,39,0.2)]'
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Maintenance Management</h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Requests</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Pending</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">In Progress</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Completed</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search by property, client, or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-[300px] flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-w-[150px] px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none text-sm"
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
            className="min-w-[150px] px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none text-sm"
          >
            <option value="all">All Priority</option>
            <option value="emergency">Emergency</option>
            <option value="urgent">Urgent</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">Loading maintenance requests...</div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid gap-6 p-6 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-gray-800 m-0 text-lg font-semibold">{request.propertyName}</h3>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.72rem] font-semibold uppercase tracking-wide border ${getUrgencyBadgeClass(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.72rem] font-semibold uppercase tracking-wide border ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="grid gap-2 mb-4">
                  <div className="text-sm text-gray-500">
                    <strong className="text-gray-600">Type:</strong> {request.requestType}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong className="text-gray-600">Client:</strong> {request.clientName} ({request.clientPhone})
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong className="text-gray-600">Contractor:</strong> {request.contractorName}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong className="text-gray-600">Estimated Cost:</strong> {formatCurrency(request.estimatedCost)}
                  </div>
                  {request.actualCost && (
                    <div className="text-sm text-gray-500">
                      <strong className="text-gray-600">Actual Cost:</strong> {formatCurrency(request.actualCost)}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-4 border border-gray-200">
                  <strong>Issue:</strong> {request.description}
                </div>

                {/* Progress Bar */}
                {request.progress > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Progress: {request.progress}%
                    </div>
                    <div className="bg-gray-200 rounded-lg h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#ff5e01] to-[#ff7a32] h-full transition-all duration-300"
                        style={{ width: `${request.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowDetails(true)
                    }}
                    className="border-none rounded-full px-4 py-2 text-[0.78rem] font-semibold cursor-pointer transition-all bg-slate-200/50 text-gray-800 border border-slate-300/30 hover:bg-slate-200"
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
                      className="min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none text-sm"
                    >
                      <option value="">Update Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Quoted">Quoted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
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
          <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem] m-6">
            No maintenance requests match your current filters.
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-8">
          <div className="bg-white rounded-2xl w-full max-w-[900px] max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="m-0 text-gray-800 text-xl font-semibold">Maintenance Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-none border-none text-2xl text-gray-500 cursor-pointer p-1 rounded hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-6">
                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Property Information</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Name:</strong> {selectedRequest.propertyName}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Address:</strong> {selectedRequest.propertyAddress}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">ID:</strong> {selectedRequest.propertyId}</div>
                </div>

                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Client Information</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Name:</strong> {selectedRequest.clientName}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Phone:</strong> {selectedRequest.clientPhone}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Email:</strong> {selectedRequest.clientEmail}</div>
                </div>

                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Contractor Information</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Name:</strong> {selectedRequest.contractorName}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Phone:</strong> {selectedRequest.contractorPhone}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Email:</strong> {selectedRequest.contractorEmail}</div>
                </div>

                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Request Details</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Type:</strong> {selectedRequest.requestType}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Urgency:</strong> {selectedRequest.urgency}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Status:</strong> {selectedRequest.status}</div>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Progress:</strong> {selectedRequest.progress}%</div>
                </div>

                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Cost Information</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Estimated:</strong> {formatCurrency(selectedRequest.estimatedCost)}</div>
                  {selectedRequest.actualCost && (
                    <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Actual:</strong> {formatCurrency(selectedRequest.actualCost)}</div>
                  )}
                </div>

                <div>
                  <h3 className="text-gray-800 mb-3 text-[0.95rem] border-b border-gray-200 pb-2">Timeline</h3>
                  <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Submitted:</strong> {formatDate(selectedRequest.submittedAt)}</div>
                  {selectedRequest.startDate && (
                    <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Started:</strong> {formatDate(selectedRequest.startDate)}</div>
                  )}
                  {selectedRequest.completionDate && (
                    <div className="mb-2 text-sm text-gray-500"><strong className="text-gray-600">Completed:</strong> {formatDate(selectedRequest.completionDate)}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="text-gray-800 mb-2 text-[0.95rem]">Problem Description</h3>
                <p className="text-gray-600 m-0 leading-relaxed">{selectedRequest.description}</p>
              </div>

              {selectedRequest.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h3 className="text-gray-800 mb-2 text-[0.95rem]">Notes</h3>
                  <p className="text-gray-600 m-0 leading-relaxed">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="border-none rounded-full px-4 py-2 text-[0.78rem] font-semibold cursor-pointer transition-all bg-slate-200/50 text-gray-800 border border-slate-300/30 hover:bg-slate-200"
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
