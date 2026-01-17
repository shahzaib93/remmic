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