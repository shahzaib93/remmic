import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin, withAdminAuth } from '../../../contexts/AdminContext';

const PROJECT_STATUSES = {
  UNDER_EVALUATION: { label: 'Under Evaluation', color: '#6b7280', order: 1 },
  EVALUATED: { label: 'Evaluated', color: '#3b82f6', order: 2 },
  PROJECT_STRUCTURED: { label: 'Project Structured', color: '#8b5cf6', order: 3 },
  FUNDING_OPEN: { label: 'Funding Open', color: '#c9a227', order: 4 },
  FUNDED: { label: 'Funded', color: '#10b981', order: 5 },
  UNDER_DEVELOPMENT: { label: 'Under Development', color: '#f59e0b', order: 6 },
  COMPLETED: { label: 'Completed', color: '#059669', order: 7 },
};

// Sample development projects
const sampleProjects = [
  {
    id: 'DEV-001',
    name: 'Riverside Luxury Apartments',
    location: 'Colombo 03',
    status: 'FUNDING_OPEN',
    totalUnits: 48,
    landArea: '2.5 acres',
    projectValue: 850000000,
    fundingTarget: 500000000,
    fundingRaised: 325000000,
    expectedROI: 18.5,
    expectedCompletion: '2027-06-30',
    createdAt: '2024-08-15',
    developer: 'Prime Developers Ltd',
    milestones: [
      { id: 1, name: 'Land Acquisition', status: 'completed', date: '2024-06-01' },
      { id: 2, name: 'Planning Approval', status: 'completed', date: '2024-08-10' },
      { id: 3, name: 'Foundation Work', status: 'in_progress', date: '2025-03-01' },
      { id: 4, name: 'Structural Work', status: 'pending', date: '2025-09-01' },
      { id: 5, name: 'Finishing & Handover', status: 'pending', date: '2027-06-30' },
    ],
  },
  {
    id: 'DEV-002',
    name: 'Green Valley Villas',
    location: 'Kandy',
    status: 'UNDER_DEVELOPMENT',
    totalUnits: 24,
    landArea: '5 acres',
    projectValue: 450000000,
    fundingTarget: 300000000,
    fundingRaised: 300000000,
    expectedROI: 22.0,
    expectedCompletion: '2026-12-31',
    createdAt: '2024-03-10',
    developer: 'Highland Homes',
    milestones: [
      { id: 1, name: 'Land Acquisition', status: 'completed', date: '2024-02-01' },
      { id: 2, name: 'Planning Approval', status: 'completed', date: '2024-04-15' },
      { id: 3, name: 'Foundation Work', status: 'completed', date: '2024-08-01' },
      { id: 4, name: 'Structural Work', status: 'in_progress', date: '2025-06-01' },
      { id: 5, name: 'Finishing & Handover', status: 'pending', date: '2026-12-31' },
    ],
  },
  {
    id: 'DEV-003',
    name: 'Oceanview Commercial Complex',
    location: 'Galle',
    status: 'PROJECT_STRUCTURED',
    totalUnits: 32,
    landArea: '1.8 acres',
    projectValue: 620000000,
    fundingTarget: 400000000,
    fundingRaised: 0,
    expectedROI: 16.0,
    expectedCompletion: '2028-03-31',
    createdAt: '2024-11-01',
    developer: 'Coastal Developers',
    milestones: [
      { id: 1, name: 'Land Acquisition', status: 'completed', date: '2024-10-01' },
      { id: 2, name: 'Planning Approval', status: 'in_progress', date: '2025-02-01' },
      { id: 3, name: 'Foundation Work', status: 'pending', date: '2025-08-01' },
      { id: 4, name: 'Structural Work', status: 'pending', date: '2026-06-01' },
      { id: 5, name: 'Finishing & Handover', status: 'pending', date: '2028-03-31' },
    ],
  },
  {
    id: 'DEV-004',
    name: 'Metro Business Park',
    location: 'Colombo 10',
    status: 'UNDER_EVALUATION',
    totalUnits: 60,
    landArea: '3.2 acres',
    projectValue: 1200000000,
    fundingTarget: 750000000,
    fundingRaised: 0,
    expectedROI: 15.0,
    expectedCompletion: '2029-06-30',
    createdAt: '2024-12-01',
    developer: 'Urban Ventures',
    milestones: [],
  },
  {
    id: 'DEV-005',
    name: 'Heritage Residences',
    location: 'Negombo',
    status: 'COMPLETED',
    totalUnits: 36,
    landArea: '2.0 acres',
    projectValue: 380000000,
    fundingTarget: 250000000,
    fundingRaised: 250000000,
    expectedROI: 24.5,
    expectedCompletion: '2024-09-30',
    createdAt: '2023-01-15',
    developer: 'Legacy Builders',
    milestones: [
      { id: 1, name: 'Land Acquisition', status: 'completed', date: '2022-12-01' },
      { id: 2, name: 'Planning Approval', status: 'completed', date: '2023-02-15' },
      { id: 3, name: 'Foundation Work', status: 'completed', date: '2023-06-01' },
      { id: 4, name: 'Structural Work', status: 'completed', date: '2024-03-01' },
      { id: 5, name: 'Finishing & Handover', status: 'completed', date: '2024-09-30' },
    ],
  },
];

function DevelopmentManagement() {
  const router = useRouter();
  const { addNotification, logAction } = useAdmin();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeFunding: 0,
    totalFundingRaised: 0,
    underDevelopment: 0,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
    calculateStats();
  }, [projects, activeTab, searchTerm]);

  const loadProjects = () => {
    const stored = localStorage.getItem('remmic_development_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects(sampleProjects);
      localStorage.setItem('remmic_development_projects', JSON.stringify(sampleProjects));
    }
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.developer.toLowerCase().includes(term)
      );
    }

    // Sort by status order, then by date
    filtered.sort((a, b) => {
      const orderA = PROJECT_STATUSES[a.status]?.order || 0;
      const orderB = PROJECT_STATUSES[b.status]?.order || 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredProjects(filtered);
  };

  const calculateStats = () => {
    const totalProjects = projects.length;
    const activeFunding = projects.filter(p => p.status === 'FUNDING_OPEN').length;
    const totalFundingRaised = projects.reduce((sum, p) => sum + (p.fundingRaised || 0), 0);
    const underDevelopment = projects.filter(p => p.status === 'UNDER_DEVELOPMENT').length;

    setStats({ totalProjects, activeFunding, totalFundingRaised, underDevelopment });
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `LKR ${(amount / 1000000000).toFixed(2)}B`;
    }
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    }
    return `LKR ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusInfo = PROJECT_STATUSES[status];
    return (
      <span className="status-badge" style={{ backgroundColor: `${statusInfo?.color}20`, color: statusInfo?.color }}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getFundingProgress = (raised, target) => {
    if (!target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  const handleViewProject = (projectId) => {
    router.push(`/admin-dashboard/development-projects/${projectId}`);
  };

  const handleCreateProject = () => {
    router.push('/admin-dashboard/development-projects/new');
  };

  const tabs = [
    { id: 'all', label: 'All Projects', count: projects.length },
    { id: 'UNDER_EVALUATION', label: 'Under Evaluation', count: projects.filter(p => p.status === 'UNDER_EVALUATION').length },
    { id: 'PROJECT_STRUCTURED', label: 'Structured', count: projects.filter(p => p.status === 'PROJECT_STRUCTURED').length },
    { id: 'FUNDING_OPEN', label: 'Funding Open', count: projects.filter(p => p.status === 'FUNDING_OPEN').length },
    { id: 'UNDER_DEVELOPMENT', label: 'In Development', count: projects.filter(p => p.status === 'UNDER_DEVELOPMENT').length },
    { id: 'COMPLETED', label: 'Completed', count: projects.filter(p => p.status === 'COMPLETED').length },
  ];

  return (
    <AdminLayout>
      <div className="development-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Development Projects</h1>
            <p>Manage development projects, funding, and milestones</p>
          </div>
          <button className="btn-primary" onClick={handleCreateProject}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="disclaimer-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Returns are indicative only and not guaranteed. Past performance does not guarantee future results.</span>
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
              <span className="stat-value">{stats.totalProjects}</span>
              <span className="stat-label">Total Projects</span>
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
              <span className="stat-value">{stats.activeFunding}</span>
              <span className="stat-label">Active Funding</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.totalFundingRaised)}</span>
              <span className="stat-label">Total Funding Raised</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.underDevelopment}</span>
              <span className="stat-label">Under Development</span>
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="controls-section">
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
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {loading ? (
            <div className="loading-state">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h3>No projects found</h3>
              <p>Try adjusting your filters or create a new project</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-id">{project.id}</div>
                  {getStatusBadge(project.status)}
                </div>

                <h3 className="project-name">{project.name}</h3>
                <p className="project-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {project.location}
                </p>

                <div className="project-details">
                  <div className="detail-row">
                    <span className="detail-label">Developer</span>
                    <span className="detail-value">{project.developer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project Value</span>
                    <span className="detail-value">{formatCurrency(project.projectValue)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Units</span>
                    <span className="detail-value">{project.totalUnits}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expected ROI</span>
                    <span className="detail-value highlight">{project.expectedROI}%</span>
                  </div>
                </div>

                {/* Funding Progress */}
                {project.fundingTarget > 0 && (
                  <div className="funding-section">
                    <div className="funding-header">
                      <span>Funding Progress</span>
                      <span>{getFundingProgress(project.fundingRaised, project.fundingTarget).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getFundingProgress(project.fundingRaised, project.fundingTarget)}%` }}
                      ></div>
                    </div>
                    <div className="funding-amounts">
                      <span>{formatCurrency(project.fundingRaised)}</span>
                      <span>of {formatCurrency(project.fundingTarget)}</span>
                    </div>
                  </div>
                )}

                {/* Milestones Preview */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="milestones-preview">
                    <span className="milestones-label">Milestones</span>
                    <div className="milestone-dots">
                      {project.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className={`milestone-dot ${m.status}`}
                          title={`${m.name} - ${m.status}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="project-footer">
                  <span className="completion-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Expected: {new Date(project.expectedCompletion).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <button className="btn-view" onClick={() => handleViewProject(project.id)}>
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <style jsx>{`
          .development-page {
            padding: 0;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
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

          .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #c9a227 0%, #e0b82e 100%);
            color: #0a0a0a;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4);
          }

          .disclaimer-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 8px;
            margin-bottom: 24px;
            color: #f59e0b;
            font-size: 13px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: #111111;
            border: 1px solid #222222;
            border-radius: 12px;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .stat-icon.blue {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
          }

          .stat-icon.gold {
            background: rgba(201, 162, 39, 0.15);
            color: #c9a227;
          }

          .stat-icon.green {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
          }

          .stat-icon.orange {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
          }

          .stat-content {
            display: flex;
            flex-direction: column;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
          }

          .stat-label {
            font-size: 13px;
            color: #9ca3af;
          }

          .controls-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            gap: 16px;
            flex-wrap: wrap;
          }

          .tabs-container {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .tab-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: transparent;
            border: 1px solid #333333;
            border-radius: 8px;
            color: #9ca3af;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .tab-btn:hover {
            background: #1a1a1a;
            border-color: #444444;
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

          .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #111111;
            border: 1px solid #333333;
            border-radius: 8px;
            min-width: 250px;
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

          .search-box input::placeholder {
            color: #6b7280;
          }

          .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 20px;
          }

          .project-card {
            background: #111111;
            border: 1px solid #222222;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.2s ease;
          }

          .project-card:hover {
            border-color: #333333;
            transform: translateY(-2px);
          }

          .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .project-id {
            font-size: 12px;
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

          .project-name {
            font-family: var(--font-playfair), 'Playfair Display', serif;
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin: 0 0 8px 0;
          }

          .project-location {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #9ca3af;
            font-size: 13px;
            margin: 0 0 16px 0;
          }

          .project-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 16px 0;
            border-top: 1px solid #222222;
            border-bottom: 1px solid #222222;
          }

          .detail-row {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .detail-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .detail-value {
            font-size: 14px;
            color: #ffffff;
            font-weight: 500;
          }

          .detail-value.highlight {
            color: #c9a227;
          }

          .funding-section {
            margin-top: 16px;
            padding: 12px;
            background: #0a0a0a;
            border-radius: 8px;
          }

          .funding-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: #9ca3af;
          }

          .progress-bar {
            height: 6px;
            background: #222222;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #c9a227 0%, #e0b82e 100%);
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .funding-amounts {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }

          .funding-amounts span:first-child {
            color: #c9a227;
            font-weight: 600;
          }

          .funding-amounts span:last-child {
            color: #6b7280;
          }

          .milestones-preview {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
          }

          .milestones-label {
            font-size: 12px;
            color: #6b7280;
          }

          .milestone-dots {
            display: flex;
            gap: 6px;
          }

          .milestone-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #333333;
          }

          .milestone-dot.completed {
            background: #10b981;
          }

          .milestone-dot.in_progress {
            background: #c9a227;
          }

          .milestone-dot.pending {
            background: #333333;
          }

          .project-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #222222;
          }

          .completion-date {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #6b7280;
          }

          .btn-view {
            display: flex;
            align-items: center;
            gap: 6px;
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

          .loading-state,
          .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
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

          .empty-state p {
            margin: 0;
            font-size: 14px;
          }

          @media (max-width: 1200px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 16px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .controls-section {
              flex-direction: column;
              align-items: stretch;
            }

            .tabs-container {
              overflow-x: auto;
              padding-bottom: 8px;
            }

            .search-box {
              min-width: 100%;
            }

            .projects-grid {
              grid-template-columns: 1fr;
            }

            .project-details {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(DevelopmentManagement, 'development');
