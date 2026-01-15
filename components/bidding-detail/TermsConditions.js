export default function TermsConditions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Terms & Conditions
      </h2>

      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
        <p className="mb-4">
          By participating in this auction, you agree to be bound by the following terms and conditions. Please read them carefully before placing any bids. These terms constitute a legally binding agreement between you ("Bidder") and REMMIC Property Auctions ("Company").
        </p>

        <p className="mb-4">
          <strong>1. Registration and Eligibility:</strong> All bidders must complete registration and identity verification before participating in any auction. You must be at least 18 years of age and have the legal capacity to enter into binding contracts. The Company reserves the right to reject any registration without providing reasons.
        </p>

        <p className="mb-4">
          <strong>2. Bidding Process:</strong> All bids are legally binding offers to purchase. Once placed, bids cannot be withdrawn or cancelled. The minimum bid increment is determined by the auctioneer and displayed on the property listing. Autobidding systems, if enabled, will automatically place bids on your behalf up to your specified maximum amount.
        </p>

        <p className="mb-4">
          <strong>3. Security Deposit:</strong> A security deposit may be required before bidding on certain properties. This deposit is fully refundable if you are unsuccessful in the auction. Successful bidders' deposits will be applied toward the purchase price or retained as per the auction conditions.
        </p>

        <p className="mb-4">
          <strong>4. Winning Bid:</strong> The highest bidder at auction close will be declared the winner, subject to any reserve price being met. The winning bidder is legally obligated to complete the purchase in accordance with the conditions of sale. Failure to complete may result in forfeiture of deposit and legal action.
        </p>

        <p className="mb-4">
          <strong>5. Property Information:</strong> While we endeavor to ensure accuracy, property descriptions and photographs are for illustration purposes only. Buyers are responsible for conducting their own due diligence. The Company accepts no liability for any discrepancies between listing information and actual property condition.
        </p>

        <p className="mb-4">
          <strong>6. Completion:</strong> Unless otherwise stated, completion must occur within 28 days of the auction date. The buyer is responsible for all legal and transfer costs. Delayed completion may incur interest charges and other penalties as specified in the conditions of sale.
        </p>

        <p className="mb-4">
          <strong>7. Privacy:</strong> Your personal information will be processed in accordance with our Privacy Policy. By registering, you consent to our collection and use of your data for auction-related purposes and communication about our services.
        </p>

        <p className="text-xs text-gray-400 mt-6">
          Last updated: January 2024. These terms are subject to change. Please review them before each auction participation.
        </p>
      </div>
    </div>
  )
}
