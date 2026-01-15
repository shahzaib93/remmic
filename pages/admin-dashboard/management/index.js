import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin, withAdminAuth } from '../../../contexts/AdminContext';

// Sample managed properties data
const sampleProperties = [
  {
    id: 'MGT-001',
    name: 'Skyline Residences - Unit 12A',
    type: 'Apartment',
    location: 'Colombo 03',
    status: 'occupied',
    tenant: { name: 'John Perera', phone: '+94 77 123 4567', since: '2024-01-15' },
    monthlyRent: 150000,
    rentStatus: 'paid',
    nextDue: '2025-02-01',
    maintenanceOpen: 1,
    lastInspection: '2024-12-15',
  },
  {
    id: 'MGT-002',
    name: 'Green Valley Villa - Block C',
    type: 'Villa',
    location: 'Kandy',
    status: 'occupied',
    tenant: { name: 'Sarah Fernando', phone: '+94 71 234 5678', since: '2023-06-01' },
    monthlyRent: 280000,
    rentStatus: 'overdue',
    nextDue: '2025-01-01',
    maintenanceOpen: 0,
    lastInspection: '2024-11-20',
  },
  {
    id: 'MGT-003',
    name: 'Ocean View - Suite 5B',
    type: 'Apartment',
    location: 'Galle',
    status: 'vacant',
    tenant: null,
    monthlyRent: 120000,
    rentStatus: null,
    nextDue: null,
    maintenanceOpen: 2,
    lastInspection: '2024-10-05',
  },
  {
    id: 'MGT-004',
    name: 'Metro Business Park - Office 302',
    type: 'Commercial',
    location: 'Colombo 10',
    status: 'occupied',
    tenant: { name: 'Tech Solutions Ltd', phone: '+94 11 234 5678', since: '2024-03-01' },
    monthlyRent: 450000,
    rentStatus: 'paid',
    nextDue: '2025-02-01',
    maintenanceOpen: 0,
    lastInspection: '2024-12-01',
  },
  {
    id: 'MGT-005',
    name: 'Heritage Residences - Unit 8',
    type: 'Apartment',
    location: 'Negombo',
    status: 'maintenance',
    tenant: null,
    monthlyRent: 95000,
    rentStatus: null,
    nextDue: null,
    maintenanceOpen: 3,
    lastInspection: '2024-09-15',
  },
];

// Sample maintenance requests
const sampleMaintenance = [
  {
    id: 'MNT-001',
    propertyId: 'MGT-001',
    propertyName: 'Skyline Residences - Unit 12A',
    category: 'Plumbing',
    description: 'Leaking kitchen faucet',
    priority: 'medium',
    status: 'in_progress',
    reportedBy: 'John Perera',
    reportedAt: '2025-01-10',
    assignedTo: 'ABC Maintenance',
  },
  {
    id: 'MNT-002',
    propertyId: 'MGT-003',
    propertyName: 'Ocean View - Suite 5B',
    category: 'Electrical',
    description: 'AC unit not cooling properly',
    priority: 'high',
    status: 'pending',
    reportedBy: 'Property Manager',
    reportedAt: '2025-01-12',
    assignedTo: null,
  },
  {
    id: 'MNT-003',
    propertyId: 'MGT-003',
    propertyName: 'Ocean View - Suite 5B',
    category: 'General',
    description: 'Paint touch-up needed in living room',
    priority: 'low',
    status: 'pending',
    reportedBy: 'Property Manager',
    reportedAt: '2025-01-08',
    assignedTo: null,
  },
  {
    id: 'MNT-004',
    propertyId: 'MGT-005',
    propertyName: 'Heritage Residences - Unit 8',
    category: 'Structural',
    description: 'Bathroom renovation in progress',
    priority: 'high',
    status: 'in_progress',
    reportedBy: 'Property Manager',
    reportedAt: '2024-12-20',
    assignedTo: 'Premium Contractors',
  },
];

// Sample rent records
const sampleRentRecords = [
  { id: 1, propertyId: 'MGT-001', month: 'January 2025', amount: 150000, status: 'paid', paidOn: '2025-01-05' },
  { id: 2, propertyId: 'MGT-001', month: 'December 2024', amount: 150000, status: 'paid', paidOn: '2024-12-03' },
  { id: 3, propertyId: 'MGT-002', month: 'January 2025', amount: 280000, status: 'overdue', paidOn: null },
  { id: 4, propertyId: 'MGT-002', month: 'December 2024', amount: 280000, status: 'paid', paidOn: '2024-12-10' },
  { id: 5, propertyId: 'MGT-004', month: 'January 2025', amount: 450000, status: 'paid', paidOn: '2025-01-02' },
];

function ManagementDashboard() {
  const router = useRouter();
  const { addNotification, logAction } = useAdmin();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [rentRecords, setRentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupied: 0,
    vacant: 0,
    maintenanceOpen: 0,
    overdueRent: 0,
    totalMonthlyRent: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [properties, maintenance, rentRecords]);

  const loadData = () => {
    // Load from localStorage or use sample data
    const storedProperties = localStorage.getItem('remmic_managed_properties');
    const storedMaintenance = localStorage.getItem('remmic_maintenance_requests');
    const storedRent = localStorage.getItem('remmic_rent_records');

    setProperties(storedProperties ? JSON.parse(storedProperties) : sampleProperties);
    setMaintenance(storedMaintenance ? JSON.parse(storedMaintenance) : sampleMaintenance);
    setRentRecords(storedRent ? JSON.parse(storedRent) : sampleRentRecords);

    if (!storedProperties) {
      localStorage.setItem('remmic_managed_properties', JSON.stringify(sampleProperties));
    }
    if (!storedMaintenance) {
      localStorage.setItem('remmic_maintenance_requests', JSON.stringify(sampleMaintenance));
    }
    if (!storedRent) {
      localStorage.setItem('remmic_rent_records', JSON.stringify(sampleRentRecords));
    }

    setLoading(false);
  };

  const calculateStats = () => {
    const totalProperties = properties.length;
    const occupied = properties.filter(p => p.status === 'occupied').length;
    const vacant = properties.filter(p => p.status === 'vacant').length;
    const maintenanceOpen = maintenance.filter(m => m.status !== 'completed').length;
    const overdueRent = properties.filter(p => p.rentStatus === 'overdue').length;
    const totalMonthlyRent = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);

    setStats({ totalProperties, occupied, vacant, maintenanceOpen, overdueRent, totalMonthlyRent });
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    }
    return `LKR ${amount?.toLocaleString() || 0}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      occupied: { label: 'Occupied', color: '#10b981' },
      vacant: { label: 'Vacant', color: '#f59e0b' },
      maintenance: { label: 'Under Maintenance', color: '#ef4444' },
      paid: { label: 'Paid', color: '#10b981' },
      overdue: { label: 'Overdue', color: '#ef4444' },
      pending: { label: 'Pending', color: '#f59e0b' },
      in_progress: { label: 'In Progress', color: '#3b82f6' },
      completed: { label: 'Completed', color: '#10b981' },
    };
    const config = statusConfig[status] || { label: status, color: '#6b7280' };
    return (
      <span className="status-badge" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: 'High', color: '#ef4444' },
      medium: { label: 'Medium', color: '#f59e0b' },
      low: { label: 'Low', color: '#6b7280' },
    };
    const config = priorityConfig[priority] || { label: priority, color: '#6b7280' };
    return (
      <span className="priority-badge" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
        {config.label}
      </span>
    );
  };

  const handleMaintenanceAction = (request, action) => {
    const updatedMaintenance = maintenance.map(m => {
      if (m.id === request.id) {
        if (action === 'assign') {
          return { ...m, status: 'in_progress', assignedTo: 'Assigned Contractor' };
        } else if (action === 'complete') {
          return { ...m, status: 'completed' };
        }
      }
      return m;
    });
    setMaintenance(updatedMaintenance);
    localStorage.setItem('remmic_maintenance_requests', JSON.stringify(updatedMaintenance));
    logAction('management', `maintenance_${action}`, request.id, `Maintenance request ${action}ed`);
    addNotification('success', `Maintenance request ${action}ed successfully`);
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'properties', label: 'Properties', count: properties.length },
    { id: 'maintenance', label: 'Maintenance', count: maintenance.filter(m => m.status !== 'completed').length },
    { id: 'rent', label: 'Rent Records', count: rentRecords.length },
  ];

  return (
    <AdminLayout>
      <div className="management-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Property Management</h1>
            <p>Manage properties, tenants, maintenance, and rent collection</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalProperties}</span>
              <span className="stat-label">Total Properties</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.occupied}</span>
              <span className="stat-label">Occupied</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.vacant}</span>
              <span className="stat-label">Vacant</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.maintenanceOpen}</span>
              <span className="stat-label">Open Maintenance</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.totalMonthlyRent)}</span>
              <span className="stat-label">Monthly Rent Total</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value red">{stats.overdueRent}</span>
              <span className="stat-label">Overdue Payments</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section">
          <div className="tabs-container">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          {activeTab === 'properties' && (
            <div className="filters">
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="properties-grid">
              {loading ? (
                <div className="loading-state">Loading properties...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <h3>No properties found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              ) : (
                filteredProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-header">
                      <span className="property-id">{property.id}</span>
                      {getStatusBadge(property.status)}
                    </div>

                    <h3 className="property-name">{property.name}</h3>
                    <p className="property-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {property.location} | {property.type}
                    </p>

                    {property.tenant ? (
                      <div className="tenant-section">
                        <h4>Current Tenant</h4>
                        <div className="tenant-info">
                          <span className="tenant-name">{property.tenant.name}</span>
                          <span className="tenant-phone">{property.tenant.phone}</span>
                          <span className="tenant-since">Since {new Date(property.tenant.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="tenant-section vacant">
                        <span>No current tenant</span>
                      </div>
                    )}

                    <div className="property-details">
                      <div className="detail-row">
                        <span className="detail-label">Monthly Rent</span>
                        <span className="detail-value gold">{formatCurrency(property.monthlyRent)}</span>
                      </div>
                      {property.rentStatus && (
                        <div className="detail-row">
                          <span className="detail-label">Rent Status</span>
                          {getStatusBadge(property.rentStatus)}
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Open Maintenance</span>
                        <span className={`detail-value ${property.maintenanceOpen > 0 ? 'red' : ''}`}>
                          {property.maintenanceOpen}
                        </span>
                      </div>
                    </div>

                    <div className="property-footer">
                      <span className="inspection-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Last inspection: {new Date(property.lastInspection).toLocaleDateString()}
                      </span>
                      <button
                        className="btn-view"
                        onClick={() => router.push(`/management/property/${property.id}`)}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="maintenance-section">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Property</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map(request => (
                      <tr key={request.id}>
                        <td className="id-cell">{request.id}</td>
                        <td>
                          <div className="property-cell">
                            <span className="property-name">{request.propertyName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">{request.category}</span>
                        </td>
                        <td className="description-cell">{request.description}</td>
                        <td>{getPriorityBadge(request.priority)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{request.assignedTo || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            {request.status === 'pending' && (
                              <button
                                className="btn-action assign"
                                onClick={() => handleMaintenanceAction(request, 'assign')}
                              >
                                Assign
                              </button>
                            )}
                            {request.status === 'in_progress' && (
                              <button
                                className="btn-action complete"
                                onClick={() => handleMaintenanceAction(request, 'complete')}
                              >
                                Complete
                              </button>
                            )}
                            {request.status === 'completed' && (
                              <span className="completed-text">Done</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rent Records Tab */}
          {activeTab === 'rent' && (
            <div className="rent-section">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Property ID</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Paid On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentRecords.map(record => (
                      <tr key={record.id}>
                        <td className="id-cell">{record.propertyId}</td>
                        <td>{record.month}</td>
                        <td className="amount-cell">{formatCurrency(record.amount)}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.paidOn ? new Date(record.paidOn).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .management-page {
            padding: 0;
          }

          .page-header {
            margin-bottom: 24px;
          }

          .header-content h1 {
            font-family: var(--font-playfair), 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
            margin: 0 0 4px 0;
          }

          .header-content p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #111111;
            border: 1px solid #222222;
            border-radius: 12px;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
          .stat-icon.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
          .stat-icon.orange { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
          .stat-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
          .stat-icon.gold { background: rgba(201, 162, 39, 0.15); color: #c9a227; }

          .stat-content {
            display: flex;
            flex-direction: column;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
          }

          .stat-value.red {
            color: #ef4444;
          }

          .stat-label {
            font-size: 11px;
            color: #9ca3af;
          }

          .tabs-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            gap: 16px;
            flex-wrap: wrap;
          }

          .tabs-container {
            display: flex;
            gap: 8px;
          }

          .tab-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: transparent;
            border: 1px solid #333333;
            border-radius: 8px;
            color: #9ca3af;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .tab-btn:hover {
            background: #1a1a1a;
          }

          .tab-btn.active {
            background: rgba(201, 162, 39, 0.15);
            border-color: #c9a227;
            color: #c9a227;
          }

          .tab-count {
            background: #222222;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
          }

          .tab-btn.active .tab-count {
            background: rgba(201, 162, 39, 0.3);
          }

          .filters {
            display: flex;
            gap: 12px;
          }

          .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: #111111;
            border: 1px solid #333333;
            border-radius: 8px;
            min-width: 220px;
          }

          .search-box svg {
            color: #6b7280;
          }

          .search-box input {
            flex: 1;
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 14px;
            outline: none;
          }

          .status-filter {
            padding: 8px 14px;
            background: #111111;
            border: 1px solid #333333;
            border-radius: 8px;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
          }

          .tab-content {
            background: #111111;
            border: 1px solid #222222;
            border-radius: 12px;
            padding: 24px;
          }

          .properties-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 20px;
          }

          .property-card {
            background: #0a0a0a;
            border: 1px solid #222222;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.2s ease;
          }

          .property-card:hover {
            border-color: #333333;
          }

          .property-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .property-id {
            font-size: 11px;
            color: #6b7280;
            font-family: monospace;
          }

          .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .property-name {
            font-family: var(--font-playfair), 'Playfair Display', serif;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin: 0 0 8px 0;
          }

          .property-location {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #9ca3af;
            font-size: 13px;
            margin: 0 0 16px 0;
          }

          .tenant-section {
            padding: 14px;
            background: #111111;
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .tenant-section h4 {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 10px 0;
          }

          .tenant-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .tenant-name {
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
          }

          .tenant-phone,
          .tenant-since {
            font-size: 12px;
            color: #9ca3af;
          }

          .tenant-section.vacant {
            text-align: center;
            color: #6b7280;
            font-size: 13px;
          }

          .property-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 14px 0;
            border-top: 1px solid #222222;
            border-bottom: 1px solid #222222;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .detail-label {
            font-size: 12px;
            color: #6b7280;
          }

          .detail-value {
            font-size: 14px;
            color: #ffffff;
            font-weight: 500;
          }

          .detail-value.gold {
            color: #c9a227;
          }

          .detail-value.red {
            color: #ef4444;
          }

          .property-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 14px;
          }

          .inspection-date {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #6b7280;
          }

          .btn-view {
            padding: 8px 14px;
            background: transparent;
            border: 1px solid #c9a227;
            border-radius: 6px;
            color: #c9a227;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-view:hover {
            background: rgba(201, 162, 39, 0.1);
          }

          .table-container {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid #222222;
          }

          th {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #0a0a0a;
          }

          td {
            font-size: 13px;
            color: #ffffff;
          }

          .id-cell {
            font-family: monospace;
            color: #6b7280;
          }

          .property-cell .property-name {
            font-size: 13px;
            margin: 0;
          }

          .category-badge {
            padding: 4px 10px;
            background: rgba(107, 114, 128, 0.15);
            color: #9ca3af;
            border-radius: 4px;
            font-size: 12px;
          }

          .description-cell {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .priority-badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }

          .btn-action {
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-action.assign {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid #3b82f6;
            color: #3b82f6;
          }

          .btn-action.complete {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid #10b981;
            color: #10b981;
          }

          .btn-action:hover {
            opacity: 0.8;
          }

          .completed-text {
            color: #10b981;
            font-size: 12px;
          }

          .amount-cell {
            font-weight: 600;
            color: #c9a227;
          }

          .loading-state,
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
            grid-column: 1 / -1;
          }

          .empty-state svg {
            color: #333333;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            color: #ffffff;
            font-size: 18px;
            margin: 0 0 8px 0;
          }

          @media (max-width: 1400px) {
            .stats-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 1024px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .tabs-section {
              flex-direction: column;
              align-items: stretch;
            }
          }

          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .tabs-container {
              overflow-x: auto;
            }

            .filters {
              flex-direction: column;
            }

            .search-box {
              min-width: 100%;
            }

            .properties-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(ManagementDashboard, 'management');
