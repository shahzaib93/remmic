export default function PropertyInfoTable({
  description = '',
  location = '',
  planning = '',
  tenureDetails = '',
  accommodation = '',
  vat = '',
  additionalInfo = '',
  epcRating = '',
  councilTaxBand = '',
}) {
  const infoRows = [
    { label: 'Property Description', value: description },
    { label: 'Location', value: location },
    { label: 'Planning', value: planning },
    { label: 'Tenure', value: tenureDetails },
    { label: 'Accommodation', value: accommodation },
    { label: 'VAT', value: vat },
    { label: 'Additional Information', value: additionalInfo },
    { label: 'EPC Rating', value: epcRating, isBadge: true },
    { label: 'Council Tax Band', value: councilTaxBand },
  ].filter((row) => row.value)

  const getEPCColor = (rating) => {
    const colors = {
      A: 'bg-emerald-500',
      B: 'bg-emerald-400',
      C: 'bg-lime-400',
      D: 'bg-yellow-400',
      E: 'bg-orange-400',
      F: 'bg-orange-500',
      G: 'bg-red-500',
    }
    return colors[rating?.toUpperCase()] || 'bg-gray-400'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Detailed Information
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {infoRows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                {row.label}
              </h3>
            </div>
            <div className="md:col-span-3">
              {row.isBadge ? (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-white font-semibold text-sm ${getEPCColor(row.value)}`}
                >
                  {row.value}
                </span>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {row.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {infoRows.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-400 text-sm">No detailed information available</p>
        </div>
      )}
    </div>
  )
}

// Skeleton
export function PropertyInfoTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <div className="md:col-span-1">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
