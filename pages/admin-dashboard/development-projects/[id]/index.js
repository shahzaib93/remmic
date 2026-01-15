import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';
import { useAdmin, withAdminAuth } from '../../../../contexts/AdminContext';
import { useFirebase } from '../../../../contexts/FirebaseContext';
import {
  getDevelopmentProjects,
  updateDevelopmentProjectStatus,
  getProjectMilestones,
  getProjectExpenses,
} from '../../../../lib/firebase';

const STATUS_LABELS = {
  under_evaluation: 'Under Evaluation',
  evaluated: 'Evaluated',
  project_structured: 'Project Structured',
  funding_open: 'Funding Open',
  funded: 'Funded',
  under_development: 'Under Development',
  completed: 'Completed',
};

const STATUS_COLORS = {
  under_evaluation: '#6b7280',
  evaluated: '#3b82f6',
  project_structured: '#8b5cf6',
  funding_open: '#c9a227',
  funded: '#10b981',
  under_development: '#f59e0b',
  completed: '#059669',
};

const STATUS_ORDER = [
  'under_evaluation',
  'evaluated',
  'project_structured',
  'funding_open',
  'funded',
  'under_development',
  'completed',
];

function DevelopmentProjectDashboard() {
  const router = useRouter();
  const { id: projectId } = router.query;
  const { user } = useFirebase();
  const { addNotification, logAction } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const projectsResult = await getDevelopmentProjects();
      if (projectsResult.success) {
        const foundProject = projectsResult.projects.find((p) => p.id === projectId);
        setProject(foundProject);
        if (foundProject) {
          setNewStatus(foundProject.status);
        }
      }

      const [milestonesResult, expensesResult] = await Promise.all([
        getProjectMilestones(projectId),
        getProjectExpenses(projectId),
      ]);

      if (milestonesResult.success) setMilestones(milestonesResult.milestones || []);
      if (expensesResult.success) setExpenses(expensesResult.expenses || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === project.status) return;
    setUpdating(true);
    try {
      const result = await updateDevelopmentProjectStatus(projectId, newStatus);
      if (result.success) {
        setProject((prev) => ({ ...prev, status: newStatus }));
        logAction('development', 'status_update', projectId, `Status changed to ${STATUS_LABELS[newStatus]}`);
        addNotification('success', `Project status updated to ${STATUS_LABELS[newStatus]}`);
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addNotification('error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'LKR 0';
    if (amount >= 1000000000) return `LKR ${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`;
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCurrentStatusIndex = () => {
    return STATUS_ORDER.indexOf(project?.status || 'under_evaluation');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const overallProgress =
    milestones.length > 0
      ? Math.round(milestones.reduce((sum, m) => sum + (m.percentage || 0), 0) / milestones.length)
      : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-state">
          <p>Loading project details...</p>
        </div>
        <style jsx>{`
          .loading-state {
            text-align: center;
            padding: 60px 20px;
            color: #9ca3af;
          }
        `}</style>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="not-found">
          <h2>Project Not Found</h2>
          <p>The development project could not be found.</p>
          <button onClick={() => router.push('/admin-dashboard/development')} className="btn-back">
            Back to Development
          </button>
        </div>
        <style jsx>{`
          .not-found {
            text-align: center;
            padding: 60px 20px;
          }
          .not-found h2 {
            color: #ffffff;
            margin-bottom: 8px;
          }
          .not-found p {
            color: #9ca3af;
            margin-bottom: 20px;
          }
          .btn-back {
            padding: 10px 20px;
            background: linear-gradient(135deg, #c9a227 0%, #e0b82e 100%);
            color: #0a0a0a;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>{project.projectName} | REMMIC Admin</title>
      </Head>

      <div className="project-detail-page">
        {/* Header */}
        <div className="page-header">
          <button className="btn-back" onClick={() => router.push('/admin-dashboard/development')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Development
          </button>

          <div className="header-content">
            <div className="header-main">
              <span className="project-id">{projectId}</span>
              <h1>{project.projectName}</h1>
              <p className="project-meta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {project.propertyLocation} | {project.projectType?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="header-actions">
              <span
                className="status-badge"
                style={{
                  backgroundColor: `${STATUS_COLORS[project.status]}20`,
                  color: STATUS_COLORS[project.status],
                }}
              >
                {STATUS_LABELS[project.status] || project.status}
              </span>
              <button className="btn-status" onClick={() => setShowStatusModal(true)}>
                Change Status
              </button>
            </div>
          </div>
        </div>

        {/* Status Progress Flow */}
        <div className="status-flow-panel">
          <h3>Project Status Flow</h3>
          <div className="status-flow">
            {STATUS_ORDER.map((status, index) => (
              <div key={status} className="status-step">
                <div
                  className={`status-node ${index <= getCurrentStatusIndex() ? 'active' : ''} ${
                    project.status === status ? 'current' : ''
                  }`}
                  style={{
                    borderColor: index <= getCurrentStatusIndex() ? STATUS_COLORS[status] : '#333333',
                    background:
                      index <= getCurrentStatusIndex() ? `${STATUS_COLORS[status]}20` : 'transparent',
                  }}
                >
                  {STATUS_LABELS[status]}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div className={`status-connector ${index < getCurrentStatusIndex() ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(project.estimatedCapital)}</span>
              <span className="stat-label">Estimated Capital</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value red">{formatCurrency(totalExpenses)}</span>
              <span className="stat-label">Expenses to Date</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {completedMilestones}/{milestones.length}
              </span>
              <span className="stat-label">Milestones Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value green">{overallProgress}%</span>
              <span className="stat-label">Overall Progress</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="nav-section">
          <h3>Project Sections</h3>
          <div className="nav-grid">
            <Link href={`/admin-dashboard/development-projects/${projectId}/feasibility`} className="nav-card">
              <div className="nav-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C3 20.24 3 19.96 3 19.4V3"></path>
                  <path d="m7 14 4-4 4 4 6-6"></path>
                </svg>
              </div>
              <div className="nav-content">
                <span className="nav-title">Feasibility</span>
                <span className="nav-desc">Analysis & Projections</span>
              </div>
              <svg className="nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>

            <Link href={`/admin-dashboard/development-projects/${projectId}/funding`} className="nav-card">
              <div className="nav-icon gold">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="nav-content">
                <span className="nav-title">Funding</span>
                <span className="nav-desc">Investment & Capital</span>
              </div>
              <svg className="nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>

            <Link href={`/admin-dashboard/development-projects/${projectId}/manage`} className="nav-card">
              <div className="nav-icon green">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="nav-content">
                <span className="nav-title">Development</span>
                <span className="nav-desc">Milestones & Expenses</span>
              </div>
              <svg className="nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        {/* Project Details */}
        <div className="details-panel">
          <h3>Project Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Project Type</span>
              <span className="detail-value">{project.projectType?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Development Type</span>
              <span className="detail-value">{project.developmentType?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Land Area</span>
              <span className="detail-value">{project.landArea || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Proposed Units</span>
              <span className="detail-value">{project.proposedUnits || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Target Completion</span>
              <span className="detail-value">{formatDate(project.targetCompletion)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">{formatDate(project.createdAt)}</span>
            </div>
          </div>
          {project.description && (
            <div className="description-section">
              <span className="detail-label">Description</span>
              <p>{project.description}</p>
            </div>
          )}
        </div>

        {/* Recent Milestones */}
        {milestones.length > 0 && (
          <div className="milestones-panel">
            <div className="panel-header">
              <h3>Recent Milestones</h3>
              <Link href={`/admin-dashboard/development-projects/${projectId}/manage`} className="view-all-link">
                View All
              </Link>
            </div>
            <div className="milestones-list">
              {milestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="milestone-item">
                  <div className="milestone-info">
                    <span className="milestone-name">{milestone.milestoneName}</span>
                    <span className="milestone-date">Target: {formatDate(milestone.targetDate)}</span>
                  </div>
                  <div className="milestone-status">
                    <span className="milestone-progress">{milestone.percentage || 0}%</span>
                    <span
                      className="milestone-badge"
                      style={{
                        background:
                          milestone.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : milestone.status === 'in_progress'
                            ? 'rgba(201, 162, 39, 0.15)'
                            : 'rgba(107, 114, 128, 0.15)',
                        color:
                          milestone.status === 'completed'
                            ? '#10b981'
                            : milestone.status === 'in_progress'
                            ? '#c9a227'
                            : '#6b7280',
                      }}
                    >
                      {milestone.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>
            REMMIC is a management and structuring platform. Investments are project-based and subject to risk.
            Returns are indicative only and not guaranteed.
          </span>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Change Project Status</h3>
              <div className="form-group">
                <label>New Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === project.status}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .project-detail-page {
          padding: 0;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid #333333;
          border-radius: 6px;
          color: #9ca3af;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 16px;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: #1a1a1a;
          color: #ffffff;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .project-id {
          font-size: 12px;
          color: #6b7280;
          font-family: monospace;
          display: block;
          margin-bottom: 4px;
        }

        .header-content h1 {
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 14px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-status {
          padding: 10px 16px;
          background: transparent;
          border: 1px solid #c9a227;
          border-radius: 6px;
          color: #c9a227;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-status:hover {
          background: rgba(201, 162, 39, 0.1);
        }

        .status-flow-panel {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .status-flow-panel h3 {
          font-size: 14px;
          font-weight: 600;
          color: #9ca3af;
          margin: 0 0 16px 0;
        }

        .status-flow {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          padding: 8px 0;
        }

        .status-step {
          display: flex;
          align-items: center;
        }

        .status-node {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          border: 2px solid;
          color: #9ca3af;
          transition: all 0.2s ease;
        }

        .status-node.active {
          color: #ffffff;
        }

        .status-node.current {
          box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.3);
        }

        .status-connector {
          color: #333333;
          display: flex;
          align-items: center;
        }

        .status-connector.active {
          color: #10b981;
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
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .stat-icon.blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .stat-icon.red {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .stat-icon.gold {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .stat-icon.green {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          display: block;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-value.red {
          color: #ef4444;
        }

        .stat-value.green {
          color: #10b981;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #9ca3af;
        }

        .progress-bar {
          height: 4px;
          background: #222222;
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #9ca3af;
          margin: 0 0 16px 0;
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .nav-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-card:hover {
          border-color: #c9a227;
          transform: translateY(-2px);
        }

        .nav-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .nav-icon.gold {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .nav-icon.green {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .nav-content {
          flex: 1;
        }

        .nav-title {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .nav-desc {
          display: block;
          font-size: 13px;
          color: #6b7280;
        }

        .nav-arrow {
          color: #6b7280;
        }

        .nav-card:hover .nav-arrow {
          color: #c9a227;
        }

        .details-panel {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .details-panel h3 {
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 20px 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
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

        .description-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #222222;
        }

        .description-section p {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.6;
          margin: 8px 0 0;
        }

        .milestones-panel {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .panel-header h3 {
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .view-all-link {
          color: #c9a227;
          font-size: 13px;
          text-decoration: none;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .milestone-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #0a0a0a;
          border-radius: 8px;
        }

        .milestone-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .milestone-name {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
        }

        .milestone-date {
          font-size: 12px;
          color: #6b7280;
        }

        .milestone-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .milestone-progress {
          font-size: 16px;
          font-weight: 600;
          color: #10b981;
        }

        .milestone-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .disclaimer-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          color: #f59e0b;
          font-size: 13px;
          line-height: 1.5;
        }

        .disclaimer-banner svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
        }

        .modal-content h3 {
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group select {
          width: 100%;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #333333;
          border-radius: 6px;
          color: #ffffff;
          font-size: 14px;
        }

        .form-group select:focus {
          outline: none;
          border-color: #c9a227;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid #333333;
          border-radius: 6px;
          color: #9ca3af;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #1a1a1a;
          color: #ffffff;
        }

        .btn-confirm {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #c9a227 0%, #e0b82e 100%);
          border: none;
          border-radius: 6px;
          color: #0a0a0a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4);
        }

        .btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .status-flow-panel {
            overflow-x: auto;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default withAdminAuth(DevelopmentProjectDashboard, 'development');
