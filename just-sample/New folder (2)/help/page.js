"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/>
        <line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
      </svg>
    )
  },
  {
    label: "Properties",
    href: "/properties-dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    label: "Reports",
    href: "/reports",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    )
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m15.66-4.24l-4.24-4.24m-4.24-4.24L3.34 8.34"/>
      </svg>
    )
  },
  {
    label: "Help",
    href: "/help",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    isActive: true
  },
];

const events = [
  { id: 1, date: 10, title: "Property Inspection", time: "10:00 AM", type: "inspection" },
  { id: 2, date: 15, title: "Maintenance Request", time: "2:00 PM", type: "maintenance" },
  { id: 3, date: 20, title: "Lease Renewal", time: "11:00 AM", type: "lease" },
  { id: 4, date: 25, title: "Client Meeting", time: "3:00 PM", type: "meeting" },
];

const upcomingEvents = [
  { id: 1, title: "Property Tour - 123 Maple Ave", date: "Oct 10, 2025", time: "10:00 AM", type: "tour" },
  { id: 2, title: "Maintenance - Room 105", date: "Oct 15, 2025", time: "2:00 PM", type: "maintenance" },
  { id: 3, title: "Lease Signing - 305 Building", date: "Oct 20, 2025", time: "11:00 AM", type: "lease" },
  { id: 4, title: "Client Consultation", date: "Oct 25, 2025", time: "3:00 PM", type: "meeting" },
];

export default function HelpPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth] = useState("October 2025");

  const closeMenu = () => setMenuOpen(false);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardWrapper}>
        <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarVisible : ""}`}>
          <nav className={styles.nav} aria-label="Dashboard navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${item.isActive ? styles.navLinkActive : ''}`}
                onClick={closeMenu}
                data-tooltip={item.label}
                title={item.label}
              >
                <span className={styles.navIcon}>{item.icon}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.logoutButton} aria-label="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </Link>
            <button className={styles.userAvatar} aria-label="User profile">
              <Image
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80"
                alt="User"
                fill
              />
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={styles.topBar}>
            <div className={styles.greeting}>
              <div className={styles.greetingIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="#F97316" stroke="#F97316" strokeWidth="1.5"/>
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1>Hello, Mira!</h1>
                <p>Get help and support for your property management needs</p>
              </div>
            </div>
            <div className={styles.topBarActions}>
              <div className={styles.searchField}>
                <input type="search" placeholder="Search Anything..." />
              </div>
              <div className={styles.actionButtons}>
                <button type="button" className={styles.iconButton} aria-label="User profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                <button type="button" className={styles.iconButton} aria-label="Refresh">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </button>
                <button type="button" className={styles.iconButton} aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className={styles.menuToggle}
                aria-label="Toggle navigation"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? "âœ•" : "â˜°"}
              </button>
            </div>
          </header>

          <div className={styles.helpContent}>
            <section className={styles.helpCategories}>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <h3>Getting Started</h3>
                <p>Learn the basics of using the platform</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3>Account & Security</h3>
                <p>Manage your account settings</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3>Property Management</h3>
                <p>Tips for managing properties</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>Contact Support</h3>
                <p>Get in touch with our team</p>
              </div>
            </section>

            <section className={styles.faqSection}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                <details className={styles.faqItem}>
                  <summary>How do I add a new property?</summary>
                  <p>Navigate to the Properties page and click the &ldquo;Add Property&rdquo; button. Fill in the required information including property details, location, and pricing.</p>
                </details>

                <details className={styles.faqItem}>
                  <summary>How can I track maintenance requests?</summary>
                  <p>Go to the Reports page to view all maintenance requests. You can filter by status, assign tasks, and track completion.</p>
                </details>

                <details className={styles.faqItem}>
                  <summary>What payment methods are supported?</summary>
                  <p>We support credit cards, debit cards, and bank transfers. You can manage payment methods in your account settings.</p>
                </details>

                <details className={styles.faqItem}>
                  <summary>How do I export reports?</summary>
                  <p>Visit the Analytics page and use the export button to download reports in PDF or Excel format.</p>
                </details>

                <details className={styles.faqItem}>
                  <summary>Can I schedule property tours?</summary>
                  <p>Yes! Use the Calendar page to schedule and manage property tours, inspections, and other events.</p>
                </details>
              </div>
            </section>

            <section className={styles.contactSection}>
              <h2>Need More Help?</h2>
              <p>Our support team is here to assist you</p>
              <div className={styles.contactMethods}>
                <div className={styles.contactCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <h4>Email Support</h4>
                  <p>support@remic.com</p>
                </div>

                <div className={styles.contactCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <h4>Phone Support</h4>
                  <p>1-800-REMIC-01</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />
    </div>
  );
}
