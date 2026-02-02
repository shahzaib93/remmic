export default function PromoBanner() {
  return (
    <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden">
      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-1/3 -translate-y-1/3">
        <div className="w-full h-full bg-white/10 rounded-full" />
      </div>
      <div className="absolute bottom-0 right-20 w-40 h-40 transform translate-y-1/2">
        <div className="w-full h-full bg-white/5 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-1/4 w-20 h-20 transform -translate-y-1/2">
        <div className="w-full h-full bg-[#c9a227]/30 rounded-lg rotate-45" />
      </div>

      {/* Content */}
      <div className="relative px-8 py-10 sm:px-12 sm:py-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Start Your Property Journey?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg">
            Join thousands of satisfied buyers who have found their dream properties through our
            transparent auction platform. Register today and start bidding!
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white font-semibold rounded-xl hover:from-[#b8922a] hover:to-[#a67c00] transition-all shadow-lg">
              Create Account
            </button>
            <button className="px-6 py-3 bg-[#c9a227]/30 text-white font-medium rounded-xl hover:bg-[#c9a227]/50 transition-colors border border-white/20">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative bg-black/30 px-8 py-4 sm:px-12">
        <div className="flex flex-wrap justify-between gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2,500+</div>
            <div className="text-xs text-[#facc15] uppercase tracking-wide">Properties Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-xs text-[#facc15] uppercase tracking-wide">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">15K+</div>
            <div className="text-xs text-[#facc15] uppercase tracking-wide">Active Bidders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-xs text-[#facc15] uppercase tracking-wide">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}
