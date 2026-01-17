# REMMIC Real Estate Platform

A modern real estate platform with property management, bidding system, and blockchain integration.

## 📁 Project Structure

```
REMMIC THEME/
├── 📄 server.js                    # Express server with organized routing
├── 📄 package.json                 # Project dependencies
├── 📄 README.md                    # This file
├── 
├── 📁 src/                         # Main source directory
│   ├── 📁 components/              # Reusable components
│   │   └── 🧩 navbar.html         # Standardized navigation bar
│   ├── 📁 pages/                   # HTML pages organized by category
│   │   ├── 🏠 home.html           # Landing page
│   │   ├── ℹ️ about.html           # About us page
│   │   ├── 📞 contact.html         # Contact page
│   │   ├── ⭐ feature.html         # Features page
│   │   ├── 💰 pricing.html         # Pricing page
│   │   ├── 💳 payment.html         # Payment page
│   │   ├── 🎨 style-guide.html     # Style guide for developers
│   │   │
│   │   ├── 📁 auth/                # Authentication pages
│   │   │   ├── 🔐 login.html       # User login
│   │   │   └── ✍️ signup.html       # User registration
│   │   │
│   │   ├── 📁 property/            # Property-related pages
│   │   │   ├── 🏘️ property-list.html     # Property listings
│   │   │   ├── 💰 bidding.html           # Bidding system
│   │   │   ├── 📊 bidding-detail.html    # Individual bid details
│   │   │   ├── 📈 evaluation.html        # Property evaluation
│   │   │   ├── 💼 investment.html        # Investment opportunities
│   │   │   ├── 🏠 rental-management.html # Rental management
│   │   │   └── 📋 land-registration.html # Blockchain land registration
│   │   │
│   │   ├── 📁 team/                # Team pages
│   │   │   └── 👥 team.html        # Team members
│   │   │
│   │   ├── 📁 legal/               # Legal pages
│   │   │   └── 📜 privacy-policy.html # Privacy policy
│   │   │
│   │   └── 📁 errors/              # Error pages
│   │       └── ❌ 404.html         # 404 Not Found page
│   │
│   ├── 📁 assets/                  # Static assets
│   │   ├── 📁 images/              # Images organized by type
│   │   │   ├── 🖼️ logo.png         # Company logo
│   │   │   ├── 📁 properties/      # Property images
│   │   │   │   ├── house.jpg
│   │   │   │   ├── house6.jpg
│   │   │   │   ├── Houses.png
│   │   │   │   ├── Apartments.png
│   │   │   │   └── commercial.png
│   │   │   ├── 📁 3d-models/       # 3D visualization images
│   │   │   │   ├── 3d-model.jpg
│   │   │   │   ├── 3d-view.jpg
│   │   │   │   └── 3dmodel.png
│   │   │   ├── 📁 team/            # Team member photos
│   │   │   │   ├── junaid.jpg
│   │   │   │   ├── saad.jpg
│   │   │   │   └── uzair.jpg
│   │   │   └── 📁 features/        # Feature icons & illustrations
│   │   │       ├── blockchain.png
│   │   │       ├── check-progress.png
│   │   │       └── verified.png
│   │   ├── 📁 css/                 # Stylesheets
│   │   │   └── opixo.webflow.shared.269830e95.css
│   │   └── 📁 js/                  # JavaScript files
│   │       └── webflow.[hash].js
│   │
│   └── 📁 scripts/                 # Custom scripts
│       └── remove-webflow-badge.js # Removes Webflow branding
└── 
└── 📁 [legacy]/                    # Original unorganized files (kept for backup)
    ├── remmic theme ready new things/
    ├── css,js/
    └── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your system
- npm (comes with Node.js)

### Installation
1. Navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Server
```bash
npm start          # Start the server
npm run dev        # Start with auto-reload (nodemon)
```

The server will start on `http://localhost:3000` and automatically open in your browser.

## 📄 Available Pages

### Main Pages
- **Home** - `/` or `/home` - Landing page
- **About** - `/about` - Company information
- **Contact** - `/contact` - Contact form
- **Features** - `/features` - Platform features

### Property Management
- **Property Listings** - `/property` or `/properties`
- **Bidding System** - `/bidding`
- **Property Evaluation** - `/evaluation`
- **Investment Opportunities** - `/investment`
- **Rental Management** - `/rental`
- **Land Registration** - `/land-registration` (Blockchain-based)

### User Management
- **Login** - `/login`
- **Sign Up** - `/signup`

### Business Pages
- **Team** - `/team`
- **Pricing** - `/pricing`
- **Payment** - `/payment`

### Legal & Docs
- **Privacy Policy** - `/privacy`
- **Style Guide** - `/style-guide` (for developers)

## 🛠️ Key Features

### 🏠 Property Management
- Property listings with detailed information
- Advanced search and filtering
- 3D property visualization
- Virtual tours

### 💰 Bidding System
- Real-time bidding on properties
- Bid history and tracking
- Automated bid notifications

### 🔗 Blockchain Integration
- Secure land registration
- Immutable property records
- Smart contract integration

### 📊 Investment Tools
- ROI calculators
- Market analysis
- Investment tracking

### 🔒 Security Features
- Webflow badge removal for clean branding
- Secure user authentication
- Data protection compliance

### 🧩 Component System
- **Standardized Navbar**: All pages use the same navigation component
- **Current Page Highlighting**: Active page is automatically highlighted
- **Responsive Design**: Works on all device sizes
- **Easy Maintenance**: Update navbar once, applies to all pages

## 🔧 Development

### File Organization Benefits
- **Easy Navigation**: Files are logically grouped by functionality
- **Scalable Structure**: Easy to add new features and pages
- **Clear Separation**: Assets, pages, and scripts are clearly separated
- **Maintainable**: Easy to find and modify specific components

### Adding New Pages
1. Create HTML file in appropriate `src/pages/` subdirectory
2. Add route in `server.js` using `injectScript()` middleware
3. Update this README if needed

### Asset Management
- Images are automatically organized by type
- CSS and JS files are served from `/assets/`
- Custom scripts go in `/scripts/`

## 🌐 Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive web app features

## 📞 Support
For technical support or questions about the codebase, refer to the organized file structure above to quickly locate relevant files.

---
**REMMIC** - Revolutionizing Real Estate with Blockchain Technology