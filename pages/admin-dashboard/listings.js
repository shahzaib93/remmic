/**
 * Admin Listings Review Queue
 *
 * Step 2 Phase 2A: Internal review interface for listing approval
 * Route: /admin-dashboard/listings
 */

import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getPendingListings,
  approveListing,
  rejectListing,
  requestListingRevision,
  getListingReviewHistory,
  LISTING_STATUS,
} from '../../lib/step2-auction-service'

const STATUS_CONFIG = {
  [LISTING_STATUS.DRAFT]: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
  [LISTING_STATUS.PENDING_REVIEW]: { label: 'Pending Review', color: '#f59e0b', bg: '#fffbeb' },
  [LISTING_STATUS.APPROVED]: { label: 'Approved', color: '#10b981', bg: '#ecfdf5' },
  [LISTING_STATUS.REJECTED]: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
  [LISTING_STATUS.REVISION_REQUESTED]: { label: 'Revision Requested', color: '#f97316', bg: '#fff7ed' },
}

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [actionModal, setActionModal] = useState(null) // 'approve', 'reject', 'revision'
  const [actionNotes, setActionNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewHistory, setReviewHistory] = useState([])

  const loadListings = async () => {
    setIsLoading(true)
    const result = await getPendingListings()
    if (result.success) {
      setListings(result.listings)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [])

  const handleSelectListing = async (listing) => {
    setSelectedListing(listing)
    const historyResult = await getListingReviewHistory(listing.id)
    if (historyResult.success) {
      setReviewHistory(historyResult.reviews)
    }
  }

  const handleAction = async () => {
    if (!selectedListing || !actionModal) return

    setIsProcessing(true)

    try {
      let result
      const adminId = 'admin_current' // Would come from auth context in production

      switch (actionModal) {
        case 'approve':
          result = await approveListing(selectedListing.id, adminId, actionNotes)
          break
        case 'reject':
          if (!actionNotes.trim()) {
            alert('Rejection reason is required')
            setIsProcessing(false)
            return
          }
          result = await rejectListing(selectedListing.id, adminId, actionNotes)
          break
        case 'revision':
          if (!actionNotes.trim()) {
            alert('Revision feedback is required')
            setIsProcessing(false)
            return
          }
          result = await requestListingRevision(selectedListing.id, adminId, actionNotes)
          break
      }

      if (result.success) {
        setActionModal(null)
        setActionNotes('')
        setSelectedListing(null)
        await loadListings()
      } else {
        alert(result.error || 'Action failed')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} Lac`
    }
    return new Intl.NumberFormat('en-PK').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AdminLayout
      title="Listing Review Queue"
      description="Review and approve property listings"
      onRefresh={loadListings}
    >
      <div className="listings-page">
        <div className="page-header">
          <h2>Pending Listings</h2>
          <span className="count-badge">{listings.length} awaiting review</span>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>All caught up!</h3>
            <p>No listings pending review.</p>
          </div>
        ) : (
          <div className="listings-layout">
            {/* Listings List */}
            <div className="listings-list">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`listing-item ${selectedListing?.id === listing.id ? 'listing-item--selected' : ''}`}
                  onClick={() => handleSelectListing(listing)}
                >
                  <div className="listing-thumb">
                    {listing.media?.[0] ? (
                      <img src={listing.media[0].url} alt="" />
                    ) : (
                      <div className="thumb-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="listing-info">
                    <h4>{listing.title}</h4>
                    <p className="listing-location">{listing.location}</p>
                    <div className="listing-meta">
                      <span className="listing-price">PKR {formatPrice(listing.askingPrice)}</span>
                      <span className="listing-date">Submitted {formatDate(listing.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Panel */}
            <div className="detail-panel">
              {selectedListing ? (
                <>
                  <div className="detail-header">
                    <h3>{selectedListing.title}</h3>
                    <span
                      className="status-badge"
                      style={{
                        background: STATUS_CONFIG[selectedListing.status].bg,
                        color: STATUS_CONFIG[selectedListing.status].color,
                      }}
                    >
                      {STATUS_CONFIG[selectedListing.status].label}
                    </span>
                  </div>

                  {/* Photos */}
                  {selectedListing.media?.length > 0 && (
                    <div className="photos-section">
                      <h4>Photos ({selectedListing.media.length})</h4>
                      <div className="photos-grid">
                        {selectedListing.media.map((photo, idx) => (
                          <div key={idx} className="photo-item">
                            <img src={photo.url} alt={photo.name} />
                            {photo.isPrimary && <span className="primary-badge">Primary</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Details */}
                  <div className="details-section">
                    <h4>Property Details</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Type</span>
                        <span className="value">{selectedListing.propertyType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Location</span>
                        <span className="value">{selectedListing.location}, {selectedListing.city}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Area</span>
                        <span className="value">{selectedListing.area} {selectedListing.areaUnit}</span>
                      </div>
                      {selectedListing.bedrooms && (
                        <div className="detail-item">
                          <span className="label">Bedrooms</span>
                          <span className="value">{selectedListing.bedrooms}</span>
                        </div>
                      )}
                      {selectedListing.bathrooms && (
                        <div className="detail-item">
                          <span className="label">Bathrooms</span>
                          <span className="value">{selectedListing.bathrooms}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="label">Asking Price</span>
                        <span className="value price">PKR {formatPrice(selectedListing.askingPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="description-section">
                    <h4>Description</h4>
                    <p>{selectedListing.description}</p>
                  </div>

                  {/* Features */}
                  {selectedListing.features?.length > 0 && (
                    <div className="features-section">
                      <h4>Features</h4>
                      <div className="features-tags">
                        {selectedListing.features.map((feature, idx) => (
                          <span key={idx} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedListing.documents?.length > 0 && (
                    <div className="documents-section">
                      <h4>Documents ({selectedListing.documents.length})</h4>
                      <div className="documents-list">
                        {selectedListing.documents.map((doc, idx) => (
                          <div key={idx} className="document-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>{doc.name}</span>
                            <span className="doc-type">{doc.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review History */}
                  {reviewHistory.length > 0 && (
                    <div className="history-section">
                      <h4>Review History</h4>
                      <div className="history-timeline">
                        {reviewHistory.map((review, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-dot" />
                            <div className="history-content">
                              <span className="history-action">{review.action}</span>
                              <span className="history-date">{formatDate(review.createdAt)}</span>
                              {review.notes && <p className="history-notes">{review.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedListing.status === LISTING_STATUS.PENDING_REVIEW && (
                    <div className="action-buttons">
                      <button
                        className="action-btn action-btn--approve"
                        onClick={() => setActionModal('approve')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Approve
                      </button>
                      <button
                        className="action-btn action-btn--revision"
                        onClick={() => setActionModal('revision')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Request Revision
                      </button>
                      <button
                        className="action-btn action-btn--reject"
                        onClick={() => setActionModal('reject')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-selection">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                  </svg>
                  <p>Select a listing to review</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Modal */}
        {actionModal && (
          <div className="modal-overlay" onClick={() => setActionModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>
                {actionModal === 'approve' && 'Approve Listing'}
                {actionModal === 'reject' && 'Reject Listing'}
                {actionModal === 'revision' && 'Request Revision'}
              </h3>
              <p className="modal-subtitle">
                {actionModal === 'approve' && 'This listing will be made available for auction.'}
                {actionModal === 'reject' && 'Please provide a reason for rejection.'}
                {actionModal === 'revision' && 'Provide feedback for the seller to update their listing.'}
              </p>
              <textarea
                placeholder={
                  actionModal === 'approve'
                    ? 'Optional notes (e.g., verification notes)'
                    : actionModal === 'reject'
                    ? 'Reason for rejection (required)'
                    : 'Revision feedback (required)'
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="modal-btn modal-btn--cancel"
                  onClick={() => {
                    setActionModal(null)
                    setActionNotes('')
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  className={`modal-btn modal-btn--${actionModal}`}
                  onClick={handleAction}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .listings-page {
          padding: 24px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .page-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .count-badge {
          padding: 4px 12px;
          background: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 20px;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          background: #fff;
          border-radius: 16px;
          color: #6b7280;
        }

        .empty-state h3 {
          margin: 16px 0 8px;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
        }

        /* Layout */
        .listings-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          min-height: 600px;
        }

        /* Listings List */
        .listings-list {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          max-height: 80vh;
          overflow-y: auto;
        }

        .listing-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
        }

        .listing-item:hover {
          background: #f9fafb;
        }

        .listing-item--selected {
          background: #fffbeb;
          border-left: 3px solid #c9a227;
        }

        .listing-thumb {
          width: 80px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f3f4f6;
        }

        .listing-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .listing-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px;
          line-height: 1.3;
        }

        .listing-location {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 8px;
        }

        .listing-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .listing-price {
          font-weight: 600;
          color: #059669;
        }

        .listing-date {
          color: #9ca3af;
        }

        /* Detail Panel */
        .detail-panel {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Photos Section */
        .photos-section,
        .details-section,
        .description-section,
        .features-section,
        .documents-section,
        .history-section {
          margin-bottom: 24px;
        }

        .photos-section h4,
        .details-section h4,
        .description-section h4,
        .features-section h4,
        .documents-section h4,
        .history-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .photo-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 8px;
          overflow: hidden;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .primary-badge {
          position: absolute;
          bottom: 4px;
          left: 4px;
          padding: 2px 6px;
          background: #c9a227;
          color: #0a0a0a;
          font-size: 0.625rem;
          font-weight: 600;
          border-radius: 4px;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item .label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .detail-item .value {
          font-size: 0.9375rem;
          color: #111827;
          font-weight: 500;
        }

        .detail-item .value.price {
          color: #059669;
          font-weight: 600;
        }

        /* Description */
        .description-section p {
          font-size: 0.9375rem;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        /* Features */
        .features-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feature-tag {
          padding: 6px 12px;
          background: #f3f4f6;
          color: #374151;
          font-size: 0.8125rem;
          border-radius: 6px;
        }

        /* Documents */
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #374151;
        }

        .doc-type {
          margin-left: auto;
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
        }

        /* History */
        .history-timeline {
          position: relative;
          padding-left: 24px;
        }

        .history-item {
          position: relative;
          padding-bottom: 16px;
        }

        .history-dot {
          position: absolute;
          left: -24px;
          top: 4px;
          width: 8px;
          height: 8px;
          background: #c9a227;
          border-radius: 50%;
        }

        .history-item::before {
          content: '';
          position: absolute;
          left: -21px;
          top: 12px;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }

        .history-item:last-child::before {
          display: none;
        }

        .history-action {
          font-weight: 600;
          color: #111827;
          text-transform: capitalize;
        }

        .history-date {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-left: 8px;
        }

        .history-notes {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0 0;
        }

        /* No Selection */
        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          color: #9ca3af;
        }

        .no-selection p {
          margin: 16px 0 0;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f3f4f6;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn--approve {
          background: #ecfdf5;
          color: #059669;
        }

        .action-btn--approve:hover {
          background: #d1fae5;
        }

        .action-btn--revision {
          background: #fff7ed;
          color: #ea580c;
        }

        .action-btn--revision:hover {
          background: #ffedd5;
        }

        .action-btn--reject {
          background: #fef2f2;
          color: #dc2626;
        }

        .action-btn--reject:hover {
          background: #fee2e2;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 480px;
          margin: 20px;
        }

        .modal-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px;
        }

        .modal-subtitle {
          color: #6b7280;
          margin: 0 0 20px;
          font-size: 0.9375rem;
        }

        .modal-content textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .modal-content textarea:focus {
          border-color: #c9a227;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .modal-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .modal-btn--cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-btn--cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .modal-btn--approve {
          background: #059669;
          color: #fff;
        }

        .modal-btn--approve:hover:not(:disabled) {
          background: #047857;
        }

        .modal-btn--revision {
          background: #ea580c;
          color: #fff;
        }

        .modal-btn--revision:hover:not(:disabled) {
          background: #c2410c;
        }

        .modal-btn--reject {
          background: #dc2626;
          color: #fff;
        }

        .modal-btn--reject:hover:not(:disabled) {
          background: #b91c1c;
        }

        @media (max-width: 900px) {
          .listings-layout {
            grid-template-columns: 1fr;
          }

          .listings-list {
            max-height: 300px;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
