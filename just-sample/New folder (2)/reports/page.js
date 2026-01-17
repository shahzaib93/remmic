"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { useDashboardData } from "../../hooks/useDashboardData";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    label: "Properties",
    href: "/properties-dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    isActive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m8.66-15.66-4.24 4.24m-4.24 4.24-4.24 4.24m15.66-4.24-4.24-4.24m-4.24-4.24L3.34 8.34" />
      </svg>
    ),
  },
  {
    label: "Help",
    href: "/help",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const loadingRows = Array.from({ length: 4 }, (_, index) => ({
  id: `loading-${index}`,
  tenant: "Loading",
  property: "-",
  status: "loading",
  statusLabel: "Loading",
  amount: 0,
  amountDisplay: "-",
  aging: "-",
  nextAction: "Loading",
  renewal: "-",
}));

const statusOrder = { delinquent: 0, negotiating: 1, active: 2, loading: 3 };

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrency(value, options = {}) {
  const numeric = toNumber(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...options,
  }).format(numeric);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function capitalize(text) {
  if (!text) return "";
  const lower = String(text).toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function normalizeStatus(status) {
  return (status || "").toLowerCase();
}

function getStatusClass(status) {
  const normalized = normalizeStatus(status);
  const statusMap = {
    active: styles.statusAvailable,
    negotiating: styles.statusMaintenance,
    delinquent: styles.statusNotAvailable,
    loading: styles.statusNeedMaintenance,
  };
  return statusMap[normalized] || "";
}

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    status: dataStatus,
    leases,
    arrears,
    auctions,
    metrics,
    error,
    refresh,
  } = useDashboardData();

  const isReady = dataStatus === "ready";

  const uniqueProperties = useMemo(() => {
    if (!isReady) {
      return 0;
    }
    return new Set(leases.map((lease) => lease.propertyId || lease.id)).size;
  }, [isReady, leases]);

  const totalArrears = useMemo(() => {
    if (!isReady) {
      return 0;
    }
    return arrears.reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  }, [isReady, arrears]);

  const filterTags = useMemo(() => {
    if (!isReady) {
      return [];
    }
    const tags = new Set();
    leases.forEach((lease) => {
      if (lease.status) {
        tags.add(capitalize(lease.status));
      }
    });
    if (arrears.length) {
      tags.add("Arrears");
    }
    return Array.from(tags);
  }, [isReady, leases, arrears]);

  const [activeFilters, setActiveFilters] = useState([]);
  useEffect(() => {
    setActiveFilters(filterTags.slice(0, 3));
  }, [filterTags]);

  const arrearsByTenant = useMemo(() => {
    if (!isReady) {
      return new Map();
    }
    return new Map(arrears.map((entry) => [entry.tenant, entry]));
  }, [isReady, arrears]);

  const tableRows = useMemo(() => {
    if (!isReady) {
      return loadingRows;
    }

    const rows = leases.map((lease) => {
      const arrearRecord = arrearsByTenant.get(lease.tenantName);
      const amount = arrearRecord ? toNumber(arrearRecord.amount) : toNumber(lease.amountDue);
      const status = normalizeStatus(lease.status);
      const derivedStatus = arrearRecord ? "delinquent" : status || (amount > 0 ? "delinquent" : "active");
      const aging = arrearRecord?.agingDays ?? lease.agingDays;
      return {
        id: lease.id,
        tenant: lease.tenantName ?? "-",
        property: lease.propertyId ?? "-",
        status: derivedStatus,
        statusLabel: capitalize(derivedStatus),
        amount,
        amountDisplay: amount ? formatCurrency(amount, { maximumFractionDigits: 0 }) : "$0",
        aging: aging != null ? `${aging} days` : "-",
        nextAction: arrearRecord?.nextAction ?? lease.nextAction ?? "Monitor",
        renewal: formatDate(lease.renewalDate),
      };
    });

    const knownTenants = new Set(leases.map((lease) => lease.tenantName));
    arrears.forEach((entry) => {
      if (!knownTenants.has(entry.tenant)) {
        const amount = toNumber(entry.amount);
        rows.push({
          id: `arrear-${entry.id}`,
          tenant: entry.tenant,
          property: entry.property ?? "-",
          status: "delinquent",
          statusLabel: "Delinquent",
          amount,
          amountDisplay: formatCurrency(amount, { maximumFractionDigits: 0 }),
          aging: entry.agingDays != null ? `${entry.agingDays} days` : "-",
          nextAction: entry.nextAction ?? "Follow up",
          renewal: "-",
        });
      }
    });

    return rows.sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return b.amount - a.amount;
    });
  }, [isReady, leases, arrears, arrearsByTenant]);

  const removeFilter = (filter) => {
    setActiveFilters((prev) => prev.filter((item) => item !== filter));
  };

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
                className={`${styles.navLink} ${item.isActive ? styles.navLinkActive : ""}`}
                onClick={closeMenu}
                data-tooltip={item.label}
                title={item.label}
                aria-current={item.isActive ? "page" : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.logoutButton} aria-label="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
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
                  <circle cx="12" cy="12" r="4" fill="#6366F1" stroke="#6366F1" strokeWidth="1.5" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1>Portfolio Reports</h1>
                <p>
                  {isReady
                    ? `Tracking ${uniqueProperties} assets with ${formatCurrency(totalArrears, { maximumFractionDigits: 0 })} outstanding.`
                    : "Loading live portfolio data..."}
                </p>
              </div>
            </div>
            <div className={styles.topBarActions}>
              <div className={styles.searchField}>
                <input type="search" placeholder="Search reports" />
              </div>
              <div className={styles.actionButtons}>
                <button type="button" className={styles.iconButton} aria-label="User profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                <button type="button" className={styles.iconButton} aria-label="Refresh data" onClick={refresh}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
                <button type="button" className={styles.iconButton} aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className={styles.menuToggle}
                aria-label="Toggle navigation"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <span>Unable to load report data.</span>
              <button type="button" onClick={refresh}>Retry</button>
            </div>
          )}

          <section className={styles.filtersSection}>
            <div className={styles.filterTags}>
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  className={styles.filterTag}
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <span className={styles.removeIcon}>x</span>
                </button>
              ))}
            </div>
            <button className={styles.moreFilters} type="button" onClick={refresh}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              Refresh data
            </button>
          </section>

          <section className={styles.tableSection}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Amount Due</th>
                    <th>Aging</th>
                    <th>Next Action</th>
                    <th>Renewal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 && isReady ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyState}>No lease or arrears data available.</td>
                    </tr>
                  ) : (
                    tableRows.map((row) => (
                      <tr key={row.id}>
                        <td className={styles.roomNo}>{row.tenant}</td>
                        <td>{row.property}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(row.status)}`}>
                            {row.statusLabel}
                          </span>
                        </td>
                        <td>{row.amountDisplay}</td>
                        <td>{row.aging}</td>
                        <td>{row.nextAction}</td>
                        <td>{row.renewal}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionButton} aria-label="Archive">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                            <button className={styles.actionButton} aria-label="Edit">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

