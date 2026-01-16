import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getPropertyFinancialSummary,
  getRentRecords,
  getMaintenanceRequests,
  MAINTENANCE_STATUS
} from '../../../../lib/firebase'
import { generateMonthlyStatement } from '../../../../utils/pdf'

export default function FinancialReporting() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [summary, setSummary] = useState(null)
  const [rentRecords, setRentRecords] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [generating, setGenerating] = useState(false)

  const loadData = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      // Load property
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      const foundProperty = storedProperties.find(p => p.id === propertyId)
      setProperty(foundProperty || { id: propertyId, title: 'Property' })

      // Load financial data
      const [summaryResult, rentResult, maintenanceResult] = await Promise.all([
        getPropertyFinancialSummary(propertyId, dateRange.start || null, dateRange.end || null),
        getRentRecords(propertyId),
        getMaintenanceRequests(propertyId)
      ])

      if (summaryResult.success) setSummary(summaryResult.summary)
      if (rentResult.success) setRentRecords(rentResult.records || [])
      if (maintenanceResult.success) setMaintenanceRecords(maintenanceResult.requests || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId, dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const completedMaintenance = maintenanceRecords.filter(r => r.status === MAINTENANCE_STATUS.COMPLETED)
      const pdfResult = generateMonthlyStatement(
        property,
        summary,
        rentRecords,
        completedMaintenance,
        selectedMonth || new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
      )

      // Open PDF in new tab
      const link = document.createElement('a')
      link.href = pdfResult.pdfDataUri
      link.download = `financial-statement-${propertyId?.slice(0, 8)}-${Date.now()}.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGenerating(false)
    }
  }

  const totalPaid = rentRecords.filter(r => r.paymentStatus === 'paid').length
  const totalPartial = rentRecords.filter(r => r.paymentStatus === 'partial').length
  const totalDue = rentRecords.filter(r => r.paymentStatus === 'due').length

  return (
    <>
      <Head>
        <title>Financial Reporting | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/management/property/${propertyId}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Property Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Financial Reporting</h1>
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="border-none rounded-full px-5 py-3 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {generating ? 'Generating...' : 'Download PDF Statement'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18] mb-8">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Filter by Date Range</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
            </div>
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="border border-slate-300/35 rounded-full px-4 py-2 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading financial data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-8">
              <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
                <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Total Rent Due</h3>
                <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-slate-900">{formatCurrency(summary?.totalRentDue || 0)}</div>
                <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
                  <span>{summary?.recordCount || 0} records</span>
                </div>
              </div>
              <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
                <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Rent Collected</h3>
                <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-emerald-600">
                  {formatCurrency(summary?.totalRentCollected || 0)}
                </div>
                <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
                  <span>{totalPaid} paid, {totalPartial} partial</span>
                </div>
              </div>
              <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
                <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Maintenance Expenses</h3>
                <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-red-600">
                  {formatCurrency(summary?.totalMaintenanceCost || 0)}
                </div>
                <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
                  <span>{summary?.maintenanceCount || 0} requests</span>
                </div>
              </div>
              <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
                <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Net Amount</h3>
                <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold" style={{ color: (summary?.netAmount || 0) >= 0 ? '#059669' : '#dc2626' }}>
                  {formatCurrency(summary?.netAmount || 0)}
                </div>
                <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
                  <span>After all expenses</span>
                </div>
              </div>
            </div>

            {/* Collection Status */}
            <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]" style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem' }}>Rent Collection Status</h3>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#059669' }} />
                  <span>Paid: {totalPaid}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#d97706' }} />
                  <span>Partial: {totalPartial}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }} />
                  <span>Due: {totalDue}</span>
                </div>
              </div>
              {rentRecords.length > 0 && (
                <div style={{ marginTop: '1rem', height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(totalPaid / rentRecords.length) * 100}%`, background: '#059669' }} />
                  <div style={{ width: `${(totalPartial / rentRecords.length) * 100}%`, background: '#d97706' }} />
                  <div style={{ width: `${(totalDue / rentRecords.length) * 100}%`, background: '#dc2626' }} />
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]">
              <div className="flex justify-between items-center gap-4">
                <h2>Recent Transactions</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentRecords.slice(0, 10).map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(record.paymentDate || record.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#d1fae5', color: '#059669', fontSize: '0.75rem' }}>
                            Rent
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{record.month}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                          +{formatCurrency(record.amountReceived || 0)}
                        </td>
                      </tr>
                    ))}
                    {maintenanceRecords.filter(r => r.status === MAINTENANCE_STATUS.COMPLETED).slice(0, 5).map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(record.completedAt || record.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem' }}>
                            Maintenance
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{record.requestType}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                          -{formatCurrency(record.finalCost || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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
          REMMIC provides coordination and reporting services only and does not guarantee income or performance.
        </div>
      </main>

      <Footer />
    </>
  )
}
