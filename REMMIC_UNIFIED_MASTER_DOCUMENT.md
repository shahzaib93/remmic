# REMMIC - Unified Master Document

## Real Estate Evaluation, Marketing, Management & Investment Company
**Amanorx Group**

**Version:** 2.0
**Date:** January 2026
**Status:** Single Source of Truth (Frozen)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Market Background](#2-problem-statement--market-background)
3. [Core Positioning](#3-core-positioning)
4. [UX & Design Philosophy](#4-ux--design-philosophy)
5. [Platform Architecture Overview](#5-platform-architecture-overview)
6. [Step 1: Investment Marketplace](#6-step-1-investment-marketplace)
7. [Step 2: Auction-Based Marketing System](#7-step-2-auction-based-marketing-system)
8. [Step 3: Property & Construction Management](#8-step-3-property--construction-management)
9. [Implementation Status](#9-implementation-status)
10. [Technical Architecture](#10-technical-architecture)
11. [Database Schema](#11-database-schema)
12. [API Reference](#12-api-reference)
13. [Revenue Model](#13-revenue-model)
14. [Legal & Compliance](#14-legal--compliance)
15. [International Expansion Roadmap](#15-international-expansion-roadmap)

---

## 1. EXECUTIVE SUMMARY

REMMIC is a next-generation, technology-driven PropTech ecosystem designed to eliminate opacity, fraud, pricing manipulation, and institutional gaps in the real estate sector.

The platform delivers **end-to-end transparency** across the complete real estate lifecycle:

| Layer | Function |
|-------|----------|
| **Evaluation** | AI-based pricing, certified evaluators, standardized reports |
| **Verification** | Legal document checks, ownership verification, REM Verified badge |
| **Marketing** | Transparent auctions, virtual tours, global buyer access |
| **Investment** | Fractional ownership, direct investment, crowd-funded development |
| **Management** | Rental management, maintenance network, construction oversight |

**Key Differentiator:** Every listing is verified, every price is transparent, every transaction is logged, every repair is tracked.

**Launch Market:** Pakistan
**Vision:** International scalability (UAE, UK, Canada, Turkey, Malaysia, Indonesia)

---

## 2. PROBLEM STATEMENT & MARKET BACKGROUND

The Pakistani real estate market suffers from persistent structural issues:

| Problem | Impact |
|---------|--------|
| Multiple non-standardized prices | Buyer confusion, unfair deals |
| Dealer-driven manipulation | Artificial inflation, kickbacks |
| Unverified documentation | High fraud risk |
| No transparent auction systems | Backroom deals, price fixing |
| Limited overseas investor access | Capital outflow, trust deficit |
| No professional management | Overseas owners exploited |

**REMMIC solves these problems through:**
- Institutional-grade verification
- AI-powered fair pricing
- Transparent auction engine
- Global digital access
- Professional management services

---

## 3. CORE POSITIONING

> **REMMIC is positioned as a hybrid of a private bank and a modern investment exchange.**

### Platform Identity

| Attribute | Description |
|-----------|-------------|
| Institutional-grade | Bank-level security and compliance |
| Regulated | SECP sandbox, SBP escrow compliance |
| Trust-first | Verification before transactions |
| Technology-backed | AI valuation, smart contracts, real-time systems |
| Globally scalable | Multi-jurisdiction ready |

### Final Positioning Statement

> *"REMMIC is not just a real estate platform—it is a fully regulated, technology-backed, institutional-grade real estate ecosystem designed for transparency, trust, and global scalability."*

---

## 4. UX & DESIGN PHILOSOPHY

### 4.1 Core UX Principles

1. **Trust before transactions** - Build confidence before asking for money
2. **Simplicity before sophistication** - Clear paths, minimal friction
3. **Progressive disclosure** - Reveal complexity gradually
4. **Clear, human language** - No jargon, no confusion
5. **Strong hierarchy** - Premium spacing, focused attention

### 4.2 Visual Identity

| Color | Meaning | Hex |
|-------|---------|-----|
| **Black** | Authority, stability | `#0a0a0a` |
| **Gold** | Actions, value, trust | `#c9a227` |
| **Chocolate Brown** | Warmth, exclusivity | `#4a3728` |

**Typography:**
- Primary: Manrope
- Accent: Playfair Display

### 4.3 User Types

| Type | Description | Primary Flow |
|------|-------------|--------------|
| Visitor | First-time browser | Explore → Trust → Sign Up |
| Investor (Retail/Silver) | Active investor | Dashboard → Marketplace → Invest |
| Asset Owner | Property seller/manager | Services → Submit → Manage |
| Advanced (Gold/Platinum) | High-value client | Priority access, analytics, advisory |

---

## 5. PLATFORM ARCHITECTURE OVERVIEW

### 5.1 Three-Step Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REMMIC PLATFORM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │     STEP 1      │  │     STEP 2      │  │     STEP 3      │             │
│  │   INVESTMENT    │  │    AUCTION      │  │   MANAGEMENT    │             │
│  │   MARKETPLACE   │  │   MARKETING     │  │    SYSTEM       │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ • Fractional    │  │ • Seller        │  │ • Rental Mgmt   │             │
│  │   Ownership     │  │   Onboarding    │  │ • Tenant Portal │             │
│  │ • Direct Invest │  │ • Live Auctions │  │ • Maintenance   │             │
│  │ • Portfolio     │  │ • Virtual Tours │  │ • Construction  │             │
│  │ • Trading       │  │ • AI Insights   │  │ • Crowdfunding  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                   │                    │                        │
│           └───────────────────┴────────────────────┘                        │
│                              │                                              │
│                    ┌─────────────────┐                                      │
│                    │  SHARED LAYER   │                                      │
│                    │ • Auth & KYC    │                                      │
│                    │ • Wallet        │                                      │
│                    │ • Notifications │                                      │
│                    │ • Payments      │                                      │
│                    └─────────────────┘                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Step Separation Matrix

| Aspect | Step 1 | Step 2 | Step 3 |
|--------|--------|--------|--------|
| **Purpose** | Invest in fractionalized assets | Buy/sell via auction | Manage & build properties |
| **User Role** | Investor | Buyer / Seller | Owner / Tenant / Technician |
| **Transaction** | Buy shares | Buy property | Rent / Repair / Construction |
| **Asset State** | Fractionalized | Whole property | Managed by REMMIC |
| **Revenue** | Management fees | Listing + success fees | Management + execution fees |
| **Primary Routes** | `/marketplace`, `/invest` | `/auctions`, `/seller/*` | `/owner/*`, `/construction/*` |

### 5.3 Integration Points

| Integration | Description |
|-------------|-------------|
| Shared Auth | Single REMMIC account for all modules |
| Shared KYC | One-time verification, reusable |
| Step 2 → Step 3 | Bought property can be managed by REMMIC |
| Step 3 → Step 1 | Completed construction can be fractionalized |
| Shared Wallet | Single wallet for all investments/payouts |

---

## 6. STEP 1: INVESTMENT MARKETPLACE

### 6.1 Overview

Step 1 enables fractional ownership and investment in verified real estate assets.

**Status:** Baseline Complete (Frozen)

### 6.2 Public Pages

| Page | Route | Purpose |
|------|-------|---------|
| Homepage | `/` | Entry experience, trust building |
| How It Works | `/how-it-works` | 4-step explanation |
| Marketplace | `/marketplace` | Browse assets (view-only public) |
| Asset Detail | `/property/[id]` | Investment detail page |
| Services | `/services` | For owners, investors, realtors |
| Investment Models | `/investment-models` | Direct, Managed, Fractional |
| Silver Founders | `/silver-founders` | Premium membership program |
| Trust & Security | `/trust-security` | Security information |
| About | `/about` | Company information |
| FAQs | `/faqs` | Frequently asked questions |
| Contact | `/contact` | Contact form |

### 6.3 Authenticated Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | User overview |
| My Investments | `/my-investments` | Portfolio |
| Wallet | `/wallet` | Credits & transactions |
| Reports | `/reports` | Documents & statements |
| Profile | `/profile` | KYC & settings |

### 6.4 Key Features

- **Hero Statement:** "Real Assets. Real Ownership. Real Liquidity."
- **Hot Assets Strip:** ROI, risk badge, minimum investment, insurance icon
- **Trust Block:** Insurance partners, Amanorx Group, jurisdiction roadmap
- **Asset Cards:** Grade, risk level, returns, insurance status
- **Risk Disclosure:** Always visible on investment actions

---

## 7. STEP 2: AUCTION-BASED MARKETING SYSTEM

### 7.1 Overview

Step 2 transforms REMMIC into a verified, transparent, auction-based real estate marketing platform that replaces traditional portals.

**Key Differentiator:** Every listing is verified, every price is transparent, every buyer competes fairly.

### 7.2 Implementation Phases

#### Phase 2A: Seller Onboarding & Listing Submission ✅ COMPLETE

| Feature | Status | Description |
|---------|--------|-------------|
| Seller Registration | ✅ | Account creation with KYC |
| Document Upload | ✅ | Secure upload for ownership docs |
| Listing Submission | ✅ | 5-step property submission wizard |
| Media Upload | ✅ | Photo upload with validation |
| Internal Review Queue | ✅ | Admin panel for listing approval |
| Seller Dashboard | ✅ | View submission status |
| Public Auctions Page | ✅ | Browse approved listings |

**Files Created:**
- `/lib/step2-auction-service.js` - Data layer
- `/pages/seller/register.js` - 4-step seller registration
- `/pages/seller/listing/new.js` - 5-step listing wizard
- `/pages/seller/dashboard.js` - Seller overview
- `/pages/admin-dashboard/listings.js` - Admin review queue
- `/pages/auctions.js` - Public auctions browse

#### Phase 2B: Auction Engine & Live Bidding (Planned)

| Feature | Priority | Description |
|---------|----------|-------------|
| Auction Creation | P0 | Convert approved listing to auction |
| Bid Placement | P0 | Real-time bid submission |
| Live Bid Feed | P0 | WebSocket-powered updates |
| Countdown Timer | P0 | Accurate time remaining |
| Anti-Sniping | P0 | Auto-extend on last-minute bids |
| Buy Now | P1 | Instant purchase option |
| Auto-Bid (Proxy) | P1 | Set max bid, auto-increment |
| Notifications | P1 | Outbid, ending soon, won alerts |

#### Phase 2C: Virtual Tours & AI Insights (Planned)

| Feature | Priority | Description |
|---------|----------|-------------|
| Photo Gallery | P0 | High-res image viewer |
| Video Tour | P0 | Walkthrough playback |
| 3D Tour Viewer | P1 | Navigate through property |
| AI Valuation | P1 | Estimated market value |
| Demand Scoring | P1 | Interest level indicator |
| Bid Guidance | P2 | Suggested bid for buyers |
| VR Mode | P2 | Mobile VR support |

### 7.3 Seller Journey

```
SIGNUP → VERIFY IDENTITY → SUBMIT LISTING → REMMIC REVIEW
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                          REJECTED         APPROVED         REVISION
                                               │
                                               ▼
                                    SET AUCTION PARAMETERS
                                    • Base price
                                    • Duration
                                    • Buy Now price
                                               │
                                               ▼
                                        AUCTION LIVE
                                               │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                          SOLD VIA          SOLD VIA          EXPIRED
                          BUY NOW           AUCTION
```

### 7.4 Buyer Journey

```
BROWSE → FILTER → VIEW DETAIL → VIRTUAL TOUR
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
                PLACE BID        BUY NOW           SAVE
                    │                │
                    ▼                ▼
                OUTBID?          PAYMENT
                    │                │
                    ▼                ▼
              AUCTION WON → DEAL COMPLETE
```

### 7.5 Listing Status Flow

```
DRAFT → PENDING_REVIEW → APPROVED → LIVE → SOLD/EXPIRED
              │
              ├── REJECTED
              └── REVISION_REQUESTED
```

### 7.6 Phase 2A Test Instructions

**Start Development Server:**
```bash
cd "/mnt/d/Downloads/remmic 2.1"
npm run dev
```

**Test Routes:**

| Route | Test |
|-------|------|
| `/auctions` | Browse approved listings, test filters |
| `/seller/register` | Complete 4-step registration |
| `/seller/dashboard` | View status and listings |
| `/seller/listing/new` | Create 5-step listing (requires verified seller) |
| `/admin-dashboard/listings` | Review queue (requires admin) |

**Demo Data:**
- Auto-seeds on first `/auctions` load
- 2 sellers (1 verified, 1 pending)
- 5 listings (2 approved, 2 pending, 1 draft)

**Reset Data:**
```javascript
localStorage.removeItem('step2_seller_profiles');
localStorage.removeItem('step2_listings');
localStorage.removeItem('step2_listing_media');
localStorage.removeItem('step2_listing_documents');
localStorage.removeItem('step2_listing_reviews');
location.reload();
```

---

## 8. STEP 3: PROPERTY & CONSTRUCTION MANAGEMENT

### 8.1 Overview

Step 3 transforms REMMIC into a full-service property and construction management platform:

- Remote property management for overseas owners
- Professional rental management (tenant screening, rent collection, maintenance)
- Crowdfunded construction for landowners
- Transparent, investor-backed development with milestone tracking

**Key Differentiator:** Every transaction is logged, every repair is tracked, every construction milestone is verified.

### 8.2 Implementation Phases

#### Phase 3A: Property Management (Planned)

| Feature | Description |
|---------|-------------|
| Owner Dashboard | Portfolio overview, active leases, maintenance queue |
| Tenant Portal | Payments, documents, support tickets |
| Lease Management | Digital contracts, rent scheduling |
| Maintenance System | Ticket creation, SLA tracking, technician assignment |
| Notification Center | Alerts for owners and tenants |

#### Phase 3B: Technician Network (Planned)

| Feature | Description |
|---------|-------------|
| Technician Onboarding | Verification, skill assignment, tiering |
| Work Order System | Assignment engine, proof of work |
| Field Mobile App | Jobs, timers, uploads |
| Rating System | Owner/tenant feedback |
| SLA Dashboard | Breach alerts, escalation |

#### Phase 3C: Construction Crowdfunding (Planned)

| Feature | Description |
|---------|-------------|
| Land Submission | Property details, ownership docs |
| Feasibility Assessment | Engineering, legal, market analysis |
| Project Listing | Blueprints, cost breakdown, timeline |
| Investor Portal | Commitments, distributions, escrow |
| Milestone Tracking | Photo/video updates, verification |
| Smart Contract Distribution | Revenue sharing automation |

### 8.3 User Flows

**Property Owner Journey:**
```
SIGNUP → ADD PROPERTY → SELECT SERVICES → SETUP COMPLETE
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           RENTAL      CONSTRUCTION        BOTH
          MANAGEMENT     PROJECT
              │               │
              └───────────────┴───────────────┐
                                              ▼
                                    ┌─────────────────┐
                                    │ OWNER DASHBOARD │
                                    │ • Properties    │
                                    │ • Tenants       │
                                    │ • Maintenance   │
                                    │ • Construction  │
                                    │ • Payments      │
                                    │ • Reports       │
                                    └─────────────────┘
```

**Tenant Journey:**
```
INVITED → COMPLETE PROFILE → SIGN CONTRACT → MOVE IN
                                                 │
                                                 ▼
                                    ┌─────────────────┐
                                    │ TENANT PORTAL   │
                                    │ • My Lease      │
                                    │ • Pay Rent      │
                                    │ • Report Issue  │
                                    │ • Track Repairs │
                                    │ • Messages      │
                                    └─────────────────┘
```

**Construction Project Lifecycle:**
```
SUBMISSION → FEASIBILITY → APPROVED → CROWDFUNDING → FUNDED
                              │                          │
                          REJECTED                       ▼
                                                   CONSTRUCTION
                                                   M1: Foundation
                                                   M2: Structure
                                                   M3: Exterior
                                                   M4: Interior
                                                   M5: Completion
                                                        │
                                                        ▼
                                               REVENUE DISTRIBUTION
                                               • Investors (pro-rata)
                                               • Landowner (%)
                                               • REMMIC Fee
```

### 8.4 Maintenance SLA

| Urgency | Response Time | Resolution Time |
|---------|---------------|-----------------|
| Emergency | 1 hour | 4 hours |
| High | 4 hours | 24 hours |
| Medium | 24 hours | 72 hours |
| Low | 48 hours | 7 days |

### 8.5 Technician Tiers

| Tier | Requirements | Benefits |
|------|-------------|----------|
| Bronze | Verified | Basic jobs |
| Silver | 50+ jobs, 4.0+ rating | Priority assignment |
| Gold | 200+ jobs, 4.5+ rating | Premium jobs, higher rates |

### 8.6 Page Structure

**Owner Pages:**
| Page | Route |
|------|-------|
| Owner Dashboard | `/owner/dashboard` |
| Add Property | `/owner/property/add` |
| Property Detail | `/owner/property/[id]` |
| Tenant Management | `/owner/tenants` |
| Maintenance Overview | `/owner/maintenance` |
| Construction Projects | `/owner/construction` |
| Reports | `/owner/reports` |

**Tenant Pages:**
| Page | Route |
|------|-------|
| Tenant Portal | `/tenant/dashboard` |
| My Lease | `/tenant/lease` |
| Pay Rent | `/tenant/pay` |
| Report Issue | `/tenant/issue/new` |
| My Tickets | `/tenant/tickets` |

**Construction/Investor Pages:**
| Page | Route |
|------|-------|
| Browse Projects | `/construction` |
| Project Detail | `/construction/[id]` |
| Invest | `/construction/[id]/invest` |
| Submit Land | `/construction/submit-land` |
| Investor Dashboard | `/investor/dashboard` |
| Revenue Statements | `/investor/revenue` |

---

## 9. IMPLEMENTATION STATUS

### 9.1 Overall Progress

| Module | Status | Notes |
|--------|--------|-------|
| Step 1: Investment Marketplace | ✅ COMPLETE | Baseline frozen |
| Step 2 Phase 2A: Seller Onboarding | ✅ COMPLETE | Ready for testing |
| Step 2 Phase 2B: Auction Engine | 🔲 PLANNED | Awaiting approval |
| Step 2 Phase 2C: AI & Tours | 🔲 PLANNED | Post-2B |
| Step 3 Phase 3A: Property Mgmt | 🔲 PLANNED | Awaiting approval |
| Step 3 Phase 3B: Technician Network | 🔲 PLANNED | Post-3A |
| Step 3 Phase 3C: Construction | 🔲 PLANNED | Post-3B |

### 9.2 Step 2 Phase 2A Files

| File | Purpose |
|------|---------|
| `/lib/step2-auction-service.js` | Data layer (localStorage) |
| `/pages/seller/register.js` | 4-step seller registration |
| `/pages/seller/listing/new.js` | 5-step listing wizard |
| `/pages/seller/dashboard.js` | Seller overview |
| `/pages/admin-dashboard/listings.js` | Admin review queue |
| `/pages/auctions.js` | Public auctions browse |
| `/components/admin/AdminLayout.js` | Added "Listings" nav item |
| `/STEP2_PHASE_2A_TEST_NOTES.md` | Test documentation |

### 9.3 Step 1 Files (Existing)

```
pages/
├── index.js              # Homepage
├── how-it-works.js       # How REMMIC Works
├── marketplace.js        # Public/Private Marketplace
├── services.js           # Services
├── investment-models.js  # Investment Models
├── silver-founders.js    # Silver Founders
├── trust-security.js     # Trust & Security
├── about.js              # About REMMIC
├── faqs.js               # FAQs
├── contact.js            # Contact
└── property/[id].js      # Asset Detail

components/
├── Navbar.js             # Site-wide navigation
├── Footer.js             # Site-wide footer
├── TrustBlock.js         # Reusable trust section
└── FooterCTA.js          # Reusable CTA section
```

---

## 10. TECHNICAL ARCHITECTURE

### 10.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Next.js   │  │ React Native│  │  WebSocket  │  │    PWA      │        │
│  │  Web Portal │  │ Tech App    │  │   Client    │  │   Support   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         └────────────────┴────────────────┴────────────────┘                │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  • Authentication      • Rate Limiting      • Request Routing               │
│  • Role-based access   • Logging            • API versioning                │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
    ┌───────────────┬───────────────┼───────────────┬───────────────┐
    ▼               ▼               ▼               ▼               ▼
┌────────┐    ┌────────┐    ┌────────────┐   ┌────────┐    ┌────────────┐
│PROPERTY│    │ AUCTION│    │   USER     │   │CONSTRUC│    │  PAYMENT   │
│SERVICE │    │SERVICE │    │  SERVICE   │   │SERVICE │    │  SERVICE   │
└────────┘    └────────┘    └────────────┘   └────────┘    └────────────┘
    │               │               │               │               │
    └───────────────┴───────────────┼───────────────┴───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PostgreSQL │  │   Redis     │  │  Firebase   │  │  S3/Cloud   │        │
│  │  (Primary)  │  │  (Cache)    │  │(Auth/Notif) │  │  Storage    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Service Breakdown

**Listing Service (Step 2):**
```
POST   /api/listing/submit           # Create listing
GET    /api/listing/[id]             # Get listing
PUT    /api/listing/[id]             # Update listing
POST   /api/listing/[id]/media       # Upload media
POST   /api/listing/[id]/documents   # Upload documents
POST   /api/listing/[id]/finalize    # Submit for review
GET    /api/admin/listings/pending   # Admin review queue
POST   /api/admin/listing/[id]/approve   # Approve
POST   /api/admin/listing/[id]/reject    # Reject
```

**Auction Service (Step 2B):**
```
POST   /api/auction/create           # Create auction
GET    /api/auction/[id]             # Get details
POST   /api/auction/[id]/bid         # Place bid
POST   /api/auction/[id]/autobid     # Set auto-bid
POST   /api/auction/[id]/buynow      # Buy now
WS     /ws/auction/[id]              # Real-time updates
```

**Property Service (Step 3):**
```
POST   /api/property/register        # Register property
GET    /api/property/[id]            # Get details
POST   /api/property/[id]/documents  # Upload docs
POST   /api/property/[id]/verify     # Admin verify
```

**Rental Service (Step 3):**
```
POST   /api/rental/tenant/invite     # Invite tenant
POST   /api/rental/lease/create      # Create lease
POST   /api/rental/rent/pay          # Process payment
POST   /api/rental/payout/process    # Owner payout
```

**Maintenance Service (Step 3):**
```
POST   /api/maintenance/ticket/create    # Create ticket
PUT    /api/maintenance/ticket/[id]/status  # Update status
POST   /api/maintenance/ticket/[id]/assign  # Assign technician
POST   /api/maintenance/ticket/[id]/complete # Complete
```

**Construction Service (Step 3):**
```
POST   /api/construction/land/submit     # Submit land
POST   /api/construction/project/create  # Create project
POST   /api/construction/project/[id]/invest  # Invest
POST   /api/construction/milestone/[id]/verify # Verify milestone
POST   /api/construction/milestone/[id]/release # Release escrow
```

### 10.3 Real-Time Architecture (Phase 2B+)

```
CLIENT ◄────────► WebSocket Server ────────► Redis Pub/Sub
                        │                         │
                        ▼                         ▼
                    Events:                  All Connected
                    • new_bid                 Clients
                    • outbid
                    • time_extended
                    • auction_ended
                    • buy_now_executed
```

---

## 11. DATABASE SCHEMA

### 11.1 Step 2 Tables

```sql
-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  status ENUM('draft', 'pending_review', 'approved', 'rejected',
              'revision_requested', 'live', 'sold', 'expired'),
  property_type VARCHAR(50),
  title VARCHAR(200),
  location JSONB,
  details JSONB,
  features TEXT[],
  asking_price DECIMAL(15,2),
  reserve_price DECIMAL(15,2),
  created_at TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID
);

-- Listing Media
CREATE TABLE listing_media (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  type ENUM('photo', 'video', 'floor_plan'),
  name VARCHAR(200),
  url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP
);

-- Listing Documents
CREATE TABLE listing_documents (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  type VARCHAR(50),
  name VARCHAR(200),
  url TEXT,
  uploaded_at TIMESTAMP
);

-- Listing Reviews (Audit Log)
CREATE TABLE listing_reviews (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  action VARCHAR(50),
  admin_id UUID,
  notes TEXT,
  created_at TIMESTAMP
);

-- Auctions (Phase 2B)
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  status ENUM('scheduled', 'live', 'ending_soon', 'ended', 'sold', 'unsold'),
  base_price DECIMAL(15,2),
  reserve_price DECIMAL(15,2),
  buy_now_price DECIMAL(15,2),
  current_price DECIMAL(15,2),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  urgency ENUM('standard', 'urgent', 'emergency'),
  winner_id UUID REFERENCES users(id),
  final_price DECIMAL(15,2)
);

-- Bids (Phase 2B)
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(15,2),
  is_auto_bid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### 11.2 Step 3 Tables

```sql
-- Managed Properties
CREATE TABLE managed_properties (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  status ENUM('pending', 'verified', 'active', 'inactive'),
  address JSONB,
  details JSONB,
  documents JSONB,
  management_type ENUM('rental', 'construction', 'both'),
  created_at TIMESTAMP
);

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES managed_properties(id),
  status ENUM('invited', 'screening', 'approved', 'active', 'moved_out'),
  screening_result JSONB,
  move_in_date DATE,
  move_out_date DATE
);

-- Leases
CREATE TABLE leases (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES managed_properties(id),
  tenant_id UUID REFERENCES tenants(id),
  rent_amount DECIMAL(12,2),
  security_deposit DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  terms JSONB,
  signed_at TIMESTAMP,
  document_url TEXT
);

-- Rent Payments
CREATE TABLE rent_payments (
  id UUID PRIMARY KEY,
  lease_id UUID REFERENCES leases(id),
  amount DECIMAL(12,2),
  due_date DATE,
  paid_date TIMESTAMP,
  status ENUM('pending', 'paid', 'late', 'partial'),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100)
);

-- Maintenance Tickets
CREATE TABLE maintenance_tickets (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES managed_properties(id),
  reported_by UUID REFERENCES users(id),
  category VARCHAR(50),
  urgency ENUM('low', 'medium', 'high', 'emergency'),
  status ENUM('new', 'assigned', 'in_progress', 'pending_approval',
              'resolved', 'closed', 'escalated'),
  description TEXT,
  media JSONB,
  assigned_technician UUID REFERENCES technicians(id),
  sla_due_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Technicians
CREATE TABLE technicians (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status ENUM('pending', 'verified', 'active', 'suspended'),
  skills TEXT[],
  tier ENUM('bronze', 'silver', 'gold'),
  location GEOGRAPHY,
  rating DECIMAL(2,1),
  jobs_completed INT DEFAULT 0,
  availability JSONB
);

-- Construction Projects
CREATE TABLE construction_projects (
  id UUID PRIMARY KEY,
  landowner_id UUID REFERENCES users(id),
  status ENUM('submitted', 'reviewing', 'approved', 'funding',
              'funded', 'construction', 'completed', 'revenue'),
  land_details JSONB,
  feasibility_report JSONB,
  blueprints JSONB,
  cost_breakdown JSONB,
  timeline JSONB,
  funding_goal DECIMAL(15,2),
  funding_raised DECIMAL(15,2),
  funding_deadline DATE,
  contract_address VARCHAR(100)
);

-- Construction Investments
CREATE TABLE construction_investments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES construction_projects(id),
  investor_id UUID REFERENCES users(id),
  amount DECIMAL(15,2),
  share_percentage DECIMAL(5,4),
  status ENUM('pending', 'escrowed', 'active', 'completed'),
  invested_at TIMESTAMP
);

-- Construction Milestones
CREATE TABLE construction_milestones (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES construction_projects(id),
  name VARCHAR(100),
  description TEXT,
  budget_allocation DECIMAL(15,2),
  status ENUM('pending', 'in_progress', 'completed', 'verified'),
  proof JSONB,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  escrow_released BOOLEAN DEFAULT FALSE
);
```

---

## 12. API REFERENCE

### 12.1 Step 2 Phase 2A APIs (Implemented)

**Seller Profile:**
```javascript
registerSeller(userId, profileData)
submitSellerKYC(userId, kycData)
getSellerProfile(userId)
getSellerStatus(userId)
adminVerifySeller(sellerId, approved, rejectionReason)
```

**Listings:**
```javascript
createListing(sellerId, userId, listingData)
updateListing(listingId, updateData)
submitListingForReview(listingId)
getListing(listingId)
getSellerListings(userId)
getApprovedListings()
```

**Media & Documents:**
```javascript
addListingMedia(listingId, mediaData)
removeListingMedia(mediaId)
getListingMedia(listingId)
addListingDocument(listingId, documentData)
removeListingDocument(documentId)
```

**Admin Review:**
```javascript
getPendingListings()
approveListing(listingId, adminId, notes)
rejectListing(listingId, adminId, reason)
requestListingRevision(listingId, adminId, feedback)
createReviewLog(listingId, action, adminId, notes)
getListingReviewHistory(listingId)
```

**Demo Data:**
```javascript
seedDemoData()
```

---

## 13. REVENUE MODEL

### 13.1 Step 1: Investment Marketplace

| Revenue Stream | Amount |
|----------------|--------|
| Asset Management Fee | 1-2% annually |
| Platform Fee | 0.5% per transaction |
| Exit/Trading Fee | 1% on sale |

### 13.2 Step 2: Auction Marketing

| Revenue Stream | Amount | Trigger |
|----------------|--------|---------|
| Listing Fee | PKR 2,000–5,000 | Per verified listing |
| Success Fee | PKR 10,000–30,000 | On successful sale |
| Featured Listing | PKR 5,000–15,000 | Priority placement |
| Emergency Badge | PKR 3,000 | Urgent listing highlight |
| Banner Promotion | PKR 20,000–50,000 | Homepage banner |
| Premium Membership | PKR 10,000/month | Unlimited listings |
| International Commission | 1–2% | High-value cross-border |

### 13.3 Step 3: Property Management

**Rental Management:**
| Service | Fee |
|---------|-----|
| Property Onboarding | PKR 5,000 (one-time) |
| Monthly Management | 5-8% of rent |
| Tenant Placement | 1 month rent (one-time) |
| Lease Renewal | PKR 5,000 |
| Maintenance Markup | 10% on repair costs |
| Emergency Response | PKR 2,000 premium |

**Construction Management:**
| Service | Fee |
|---------|-----|
| Feasibility Study | PKR 25,000–100,000 |
| Project Setup | 2% of project value |
| Management Fee | 6% of construction cost |
| Success Fee | 4% of sale/revenue |
| Investor Platform Fee | 1% of investment |

---

## 14. LEGAL & COMPLIANCE

### 14.1 Regulatory Framework

| Requirement | Status |
|-------------|--------|
| SECP Sandbox | Participation planned |
| SBP Escrow Compliance | Required for payments |
| Investor Protection | Full disclosures |
| Audit Trails | 7-year retention |
| Data Protection | GDPR-compliant handling |

### 14.2 Verification Requirements

**Seller:**
- CNIC
- Ownership deed
- Utility bills
- Selfie verification

**Buyer:**
- CNIC
- Phone verification
- Payment method

**International:**
- Passport
- Address proof
- Video verification

### 14.3 Transaction Security

- All funds held in escrow until deal complete
- Document verification before release
- Dispute resolution process
- 7-day cooling period for high-value deals

### 14.4 Audit Trail

Every action logged:
- User ID, timestamp, IP address
- Action type, before/after state
- Document versions tracked
- Immutable for 7 years

---

## 15. INTERNATIONAL EXPANSION ROADMAP

### Target Markets

| Market | Priority | Notes |
|--------|----------|-------|
| United Arab Emirates | High | Large Pakistani diaspora |
| Saudi Arabia | High | Gulf investment corridor |
| United Kingdom | Medium | Established expat community |
| Canada | Medium | Growing market |
| Turkey | Medium | Regional hub |
| Malaysia | Low | SEA expansion |
| Indonesia | Low | Future growth |

All expansions aligned with local legal and regulatory frameworks.

---

## APPENDIX A: GLOSSARY

| Term | Definition |
|------|------------|
| KYC | Know Your Customer - identity verification |
| SLA | Service Level Agreement - response time guarantees |
| SPV | Special Purpose Vehicle - legal investment structure |
| Escrow | Third-party fund holding until conditions met |
| Milestone | Construction checkpoint requiring verification |
| REM Verified | REMMIC verification badge |

---

## APPENDIX B: DOCUMENT HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial baseline (Step 1 complete) |
| 2.0 | Jan 2026 | Added Step 2A implementation, unified all docs |

---

**Document Status:** Frozen (Single Source of Truth)

**This document supersedes:**
- STEP2_AUCTION_SYSTEM_DESIGN.md
- STEP2_IMPLEMENTATION_ROADMAP.md
- STEP2_PHASE_2A_TEST_NOTES.md
- STEP3_MANAGEMENT_SYSTEM_DESIGN.md
- STEP3_IMPLEMENTATION_ROADMAP.md
- IMPLEMENTATION_SUMMARY.md
- Remmic – Unified Master Document (urdu).pdf

**Any changes require explicit approval.**
