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
    ),
    isActive: true
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

export default function SettingsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
                <h1>Settings</h1>
                <p>Manage your account settings and preferences</p>
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

          <div className={styles.settingsGrid}>
            {/* Profile Settings */}
            <section className={styles.settingsCard}>
              <h2>Profile Information</h2>
              <div className={styles.settingsGroup}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" defaultValue="Mira Johnson" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" defaultValue="mira.johnson@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select id="role" defaultValue="manager">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>
              <button className={styles.saveButton}>Save Changes</button>
            </section>

            {/* Notification Settings */}
            <section className={styles.settingsCard}>
              <h2>Notifications</h2>
              <div className={styles.settingsGroup}>
                <div className={styles.toggleGroup}>
                  <div>
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications for important updates</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div>
                    <h3>Email Alerts</h3>
                    <p>Get email notifications for new properties</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Appearance Settings */}
            <section className={styles.settingsCard}>
              <h2>Appearance</h2>
              <div className={styles.settingsGroup}>
                <div className={styles.toggleGroup}>
                  <div>
                    <h3>Dark Mode</h3>
                    <p>Switch to dark theme</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Security Settings */}
            <section className={styles.settingsCard}>
              <h2>Security</h2>
              <div className={styles.settingsGroup}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input type="password" id="currentPassword" placeholder="Enter current password" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <input type="password" id="newPassword" placeholder="Enter new password" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" placeholder="Confirm new password" />
                </div>
              </div>
              <button className={styles.saveButton}>Update Password</button>
            </section>

            {/* Danger Zone */}
            <section className={`${styles.settingsCard} ${styles.dangerCard}`}>
              <h2>Danger Zone</h2>
              <div className={styles.settingsGroup}>
                <div className={styles.dangerItem}>
                  <div>
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <button className={styles.dangerButton}>Delete Account</button>
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
