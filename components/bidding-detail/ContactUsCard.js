export default function ContactUsCard({ agent = {}, legalContact = {}, conveyancing = {} }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Contact Us
      </h2>

      {/* Agent Card */}
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {agent.avatar ? (
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#c9a227]/10">
              <span className="text-xl font-semibold text-[#c9a227]">
                {agent.name?.charAt(0) || 'A'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{agent.name || 'Property Agent'}</h3>
          <p className="text-sm text-gray-500">{agent.role || 'Property Consultant'}</p>
          <div className="mt-2 space-y-1">
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-2 text-sm text-[#c9a227] hover:text-[#b8922a]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {agent.email || 'contact@remmic.pk'}
            </a>
            <a
              href={`tel:${agent.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {agent.phone || '+92 300 0000000'}
            </a>
          </div>
        </div>
      </div>

      {/* Legal Contact Chip */}
      {legalContact?.email && (
        <div className="mt-4">
          <a
            href={`mailto:${legalContact.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Legal Contact
          </a>
        </div>
      )}

      {/* Conveyancing Team */}
      {conveyancing?.team && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Conveyancing Services</h4>
          <p className="text-sm text-gray-600">{conveyancing.team}</p>
          <div className="mt-2 space-y-1">
            {conveyancing.contact && (
              <a
                href={`mailto:${conveyancing.contact}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#c9a227]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {conveyancing.contact}
              </a>
            )}
            {conveyancing.phone && (
              <a
                href={`tel:${conveyancing.phone}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {conveyancing.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton
export function ContactUsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-5" />
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-1" />
          <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
