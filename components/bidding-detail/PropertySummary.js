export default function PropertySummary({ summaryPoints = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Property Summary
      </h2>

      <ul className="space-y-3">
        {summaryPoints.map((point, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-[#c9a227]/10 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-gray-600 text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>

      {summaryPoints.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No summary available</p>
      )}
    </div>
  )
}

// Skeleton
export function PropertySummarySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-5" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
