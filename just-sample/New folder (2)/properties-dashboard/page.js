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
    ),
    isActive: true
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
    )
  },
];

// Generate calendar days for January 2022
const generateCalendarDays = () => {
  const days = [];

  // Previous month days (26-31 from December)
  for (let i = 26; i <= 31; i++) {
    days.push({ day: i, currentMonth: false, type: i === 27 ? 'orange' : null });
  }

  // Current month days (1-31 January)
  for (let i = 1; i <= 31; i++) {
    let type = null;
    if (i === 12) type = 'orange';
    if (i === 17) type = 'purple';
    if (i === 31) type = 'blue';
    days.push({ day: i, currentMonth: true, type });
  }

  // Next month days (1-5 from February)
  for (let i = 1; i <= 5; i++) {
    days.push({ day: i, currentMonth: false, type: null });
  }

  return days;
};

export default function PropertiesDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Attendance");
  const [currentMonth, setCurrentMonth] = useState("JAN 2022");

  const calendarDays = generateCalendarDays();
  const closeMenu = () => setMenuOpen(false);

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
                <p>Explore information and activity about your property</p>
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
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </header>

          <section className={styles.attendanceSection}>
            <div className={styles.attendanceCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Employee Attendance</h2>
                  <p>Employee attendance calendar here.</p>
                </div>
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tab} ${activeTab === "Info" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("Info")}
                  >
                    Info
                  </button>
                  <button
                    className={`${styles.tab} ${activeTab === "Attendance" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("Attendance")}
                  >
                    Attendance
                  </button>
                  <button
                    className={`${styles.tab} ${activeTab === "Leaves" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("Leaves")}
                  >
                    Leaves
                  </button>
                </div>
              </div>

              <div className={styles.calendarContainer}>
                <div className={styles.calendarHeader}>
                  <button className={styles.navButton} aria-label="Previous month">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <span className={styles.monthLabel}>{currentMonth}</span>
                  <button className={styles.navButton} aria-label="Next month">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                <div className={styles.calendar}>
                  {calendarDays.map((item, index) => (
                    <div
                      key={index}
                      className={`${styles.calendarDay} ${!item.currentMonth ? styles.otherMonth : ''} ${item.type ? styles[item.type] : ''}`}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
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
