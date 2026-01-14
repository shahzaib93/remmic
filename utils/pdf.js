import { jsPDF } from 'jspdf'

const addSectionHeader = (doc, text, y) => {
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(text, 14, y)
  doc.setDrawColor(249, 115, 22)
  doc.setLineWidth(0.5)
  doc.line(14, y + 1, 196, y + 1)
  return y + 6
}

const writeKeyValue = (doc, label, value, y) => {
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  doc.text(`${label}:`, 14, y)
  doc.setTextColor(15, 23, 42)
  const line = doc.splitTextToSize(value || 'N/A', 120)
  doc.text(line, 60, y)
  return y + Math.max(6, line.length * 6)
}

export const generateEvaluationPdf = (evaluation = {}, adminComment = '') => {
  const doc = new jsPDF()
  const createdAt = new Date().toISOString()

  doc.setFontSize(18)
  doc.setTextColor(8, 47, 73)
  doc.text('Property Evaluation Report', 105, 18, { align: 'center' })
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 26, { align: 'center' })

  let cursor = addSectionHeader(doc, 'Submission Overview', 36)
  cursor = writeKeyValue(doc, 'Evaluation ID', String(evaluation.id || evaluation.evaluationId || 'N/A'), cursor)
  cursor = writeKeyValue(doc, 'Owner', evaluation.fullName || evaluation.userName || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Contact', evaluation.contact || evaluation.userPhone || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Email', evaluation.email || evaluation.userEmail || 'N/A', cursor)

  cursor = addSectionHeader(doc, 'Property Details', cursor + 2)
  cursor = writeKeyValue(doc, 'Type', evaluation.propertyType || evaluation.property || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Location', evaluation.propertyAddress || evaluation.address || evaluation.city || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Area', evaluation.areaSize || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Floors', evaluation.floors ? String(evaluation.floors) : 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Declared Value', evaluation.propertyValue ? String(evaluation.propertyValue) : 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Evaluated Value', evaluation.evaluationValue ? String(evaluation.evaluationValue) : 'Pending', cursor)

  cursor = addSectionHeader(doc, 'Admin Comment', cursor + 4)
  doc.setFontSize(11)
  doc.setTextColor(31, 41, 55)
  const commentLines = doc.splitTextToSize(adminComment || 'No additional remarks provided.', 180)
  doc.text(commentLines, 14, cursor)
  cursor += Math.max(10, commentLines.length * 6)

  if (Array.isArray(evaluation.propertyMedia) && evaluation.propertyMedia.length) {
    cursor = addSectionHeader(doc, 'Attached Media', cursor + 4)
    doc.setFontSize(10)
    evaluation.propertyMedia.slice(0, 5).forEach((media, index) => {
      doc.text(`• ${media.name || `Media ${index + 1}`}`, 16, cursor + index * 6)
    })
    cursor += Math.min(5, evaluation.propertyMedia.length) * 6 + 4
  }

  if (Array.isArray(evaluation.supportingDocuments) && evaluation.supportingDocuments.length) {
    cursor = addSectionHeader(doc, 'Documents', cursor)
    doc.setFontSize(10)
    evaluation.supportingDocuments.slice(0, 5).forEach((docItem, index) => {
      doc.text(`• ${docItem.name || `Document ${index + 1}`}`, 16, cursor + index * 6)
    })
  }

  const pdfDataUri = doc.output('datauristring')
  return { pdfDataUri, createdAt }
}

// Financial Statement PDF Generation
export const generateMonthlyStatement = (property = {}, summary = {}, rentRecords = [], maintenanceRecords = [], month = '') => {
  const doc = new jsPDF()
  const createdAt = new Date().toISOString()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(8, 47, 73)
  doc.text('Monthly Financial Statement', 105, 18, { align: 'center' })
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Period: ${month || new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}`, 105, 26, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' })

  // Property Details
  let cursor = addSectionHeader(doc, 'Property Information', 44)
  cursor = writeKeyValue(doc, 'Property', property.title || property.propertyName || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Location', property.location || property.address || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Property ID', property.id?.slice(0, 12) || 'N/A', cursor)

  // Financial Summary
  cursor = addSectionHeader(doc, 'Financial Summary', cursor + 4)
  cursor = writeKeyValue(doc, 'Total Rent Due', formatPKR(summary.totalRentDue), cursor)
  cursor = writeKeyValue(doc, 'Rent Collected', formatPKR(summary.totalRentCollected), cursor)
  cursor = writeKeyValue(doc, 'Maintenance Expenses', formatPKR(summary.totalMaintenanceCost), cursor)
  cursor = writeKeyValue(doc, 'Management Fees', formatPKR(summary.managementFees || 0), cursor)
  doc.setFontSize(12)
  doc.setTextColor(5, 150, 105)
  cursor = writeKeyValue(doc, 'Net Amount', formatPKR(summary.netAmount), cursor)

  // Rent Records Table
  if (rentRecords.length > 0) {
    cursor = addSectionHeader(doc, 'Rent Records', cursor + 4)
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)

    // Table header
    doc.text('Month', 14, cursor)
    doc.text('Due', 60, cursor)
    doc.text('Received', 90, cursor)
    doc.text('Status', 130, cursor)
    doc.text('Date', 160, cursor)
    cursor += 6

    doc.setDrawColor(229, 231, 235)
    doc.line(14, cursor - 2, 196, cursor - 2)

    doc.setTextColor(31, 41, 55)
    rentRecords.slice(0, 10).forEach((record) => {
      doc.text(String(record.month || 'N/A'), 14, cursor)
      doc.text(formatPKR(record.amountDue), 60, cursor)
      doc.text(formatPKR(record.amountReceived || 0), 90, cursor)
      doc.text(String(record.paymentStatus || 'due').toUpperCase(), 130, cursor)
      doc.text(record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : '-', 160, cursor)
      cursor += 5
    })
  }

  // Maintenance Records
  if (maintenanceRecords.length > 0 && cursor < 250) {
    cursor = addSectionHeader(doc, 'Maintenance Expenses', cursor + 4)
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)

    doc.text('Type', 14, cursor)
    doc.text('Description', 50, cursor)
    doc.text('Cost', 140, cursor)
    doc.text('Status', 170, cursor)
    cursor += 6

    doc.line(14, cursor - 2, 196, cursor - 2)

    doc.setTextColor(31, 41, 55)
    maintenanceRecords.slice(0, 8).forEach((record) => {
      doc.text(String(record.requestType || 'N/A').slice(0, 12), 14, cursor)
      const desc = doc.splitTextToSize(String(record.description || '').slice(0, 50), 80)
      doc.text(desc[0] || 'N/A', 50, cursor)
      doc.text(formatPKR(record.finalCost || record.estimatedCost || 0), 140, cursor)
      doc.text(String(record.status || 'N/A').toUpperCase(), 170, cursor)
      cursor += 5
    })
  }

  // Disclaimer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('REMMIC provides coordination and reporting services only and does not guarantee income or performance.', 105, 285, { align: 'center' })

  const pdfDataUri = doc.output('datauristring')
  return { pdfDataUri, createdAt }
}

// Annual Report Generation
export const generateAnnualReport = (property = {}, yearData = {}, year = '') => {
  const doc = new jsPDF()
  const createdAt = new Date().toISOString()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(8, 47, 73)
  doc.text('Annual Property Report', 105, 18, { align: 'center' })
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Year: ${year || new Date().getFullYear()}`, 105, 26, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' })

  // Property Details
  let cursor = addSectionHeader(doc, 'Property Information', 44)
  cursor = writeKeyValue(doc, 'Property', property.title || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Location', property.location || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Type', property.propertyType || 'N/A', cursor)
  cursor = writeKeyValue(doc, 'Management', property.managementType === 'remmic_managed' ? 'REMMIC Managed' : 'Self Managed', cursor)

  // Annual Summary
  cursor = addSectionHeader(doc, 'Annual Financial Summary', cursor + 4)
  cursor = writeKeyValue(doc, 'Total Rent Expected', formatPKR(yearData.totalRentExpected || 0), cursor)
  cursor = writeKeyValue(doc, 'Total Rent Collected', formatPKR(yearData.totalRentCollected || 0), cursor)
  cursor = writeKeyValue(doc, 'Collection Rate', `${yearData.collectionRate || 0}%`, cursor)
  cursor = writeKeyValue(doc, 'Total Maintenance', formatPKR(yearData.totalMaintenance || 0), cursor)
  cursor = writeKeyValue(doc, 'Management Fees', formatPKR(yearData.managementFees || 0), cursor)
  cursor = writeKeyValue(doc, 'Net Income', formatPKR(yearData.netIncome || 0), cursor)

  // Occupancy
  cursor = addSectionHeader(doc, 'Occupancy Statistics', cursor + 4)
  cursor = writeKeyValue(doc, 'Total Tenants', String(yearData.totalTenants || 0), cursor)
  cursor = writeKeyValue(doc, 'Active Tenants', String(yearData.activeTenants || 0), cursor)
  cursor = writeKeyValue(doc, 'Occupancy Rate', `${yearData.occupancyRate || 0}%`, cursor)

  // Maintenance Summary
  cursor = addSectionHeader(doc, 'Maintenance Summary', cursor + 4)
  cursor = writeKeyValue(doc, 'Total Requests', String(yearData.totalMaintenanceRequests || 0), cursor)
  cursor = writeKeyValue(doc, 'Completed', String(yearData.completedMaintenance || 0), cursor)
  cursor = writeKeyValue(doc, 'Pending', String(yearData.pendingMaintenance || 0), cursor)

  // Disclaimer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('REMMIC provides coordination and reporting services only and does not guarantee income or performance.', 105, 285, { align: 'center' })

  const pdfDataUri = doc.output('datauristring')
  return { pdfDataUri, createdAt }
}

// Helper function to format currency
const formatPKR = (amount) => {
  if (!amount && amount !== 0) return 'PKR 0'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}