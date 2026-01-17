"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { useDashboardData } from "../../hooks/useDashboardData";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    isActive: true,
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

const defaultSummaryMetrics = [
  { id: "sales", label: "Pipeline Volume", value: "-", description: "Loading data...", trend: "", variant: "neutral" },
  { id: "orders", label: "Active Auctions", value: "-", description: "Loading data...", trend: "", variant: "neutral" },
  { id: "properties", label: "Occupancy", value: "-", description: "Loading data...", trend: "", variant: "neutral" },
];

const defaultSalesReport = [];

const defaultCostSegments = [];

const defaultTransactions = [];

const defaultMaintenanceRequests = [];

const defaultAlerts = [];

const donutPalette = ["#6366F1", "#F97316", "#EC4899", "#22D3EE", "#10B981", "#8B5CF6"];

function getTrendClass(variant) {
  if (variant === "up") return styles.trendUp;
  if (variant === "down") return styles.trendDown;
  return "";
}

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

function formatDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-US", options);
}

function getInitials(input) {
  if (!input) {
    return "-";
  }
  const parts = String(input)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]);
  return parts.length ? parts.join("").slice(0, 2).toUpperCase() : "-";
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    status: dataStatus,
    auctions,
    leases,
    maintenance,
    arrears,
    metrics,
    error,
    refresh,
  } = useDashboardData();

  const isReady = dataStatus === "ready";

  const summaryMetrics = useMemo(() => {
    if (!isReady) {
      return defaultSummaryMetrics;
    }

    const reserveTotal = auctions.reduce((sum, auction) => sum + toNumber(auction.reservePrice), 0);
    const liveAuctions = auctions.filter((auction) => (auction.status || "").toLowerCase() === "live").length;
    const prepAuctions = auctions.filter((auction) => (auction.status || "").toLowerCase() === "prep").length;
    const occupancy = metrics?.occupancy;
    const occupancyChange = metrics?.occupancyChange;

    return [
      {
        id: "sales",
        label: "Pipeline Volume",
        value: reserveTotal ? formatCurrency(reserveTotal, { notation: reserveTotal > 999999 ? "compact" : "standard" }) : "$0",
        description: `${auctions.length} total listings`,
        trend: liveAuctions ? `${liveAuctions} live` : prepAuctions ? `${prepAuctions} in prep` : "Pipeline forming",
        variant: reserveTotal > 0 ? "up" : "down",
      },
      {
        id: "orders",
        label: "Active Auctions",
        value: liveAuctions.toString(),
        description: `${prepAuctions} preparing`,
        trend: liveAuctions ? `+${liveAuctions}` : "0",
        variant: liveAuctions > 0 ? "up" : "down",
      },
      {
        id: "properties",
        label: "Occupancy",
        value: occupancy != null ? `${Math.round(occupancy * 100)}%` : "-",
        description: "Portfolio occupancy",
        trend: occupancyChange ?? "-",
        variant: occupancyChange?.trim?.().startsWith("-") ? "down" : "up",
      },
    ];
  }, [isReady, auctions, metrics]);

  const salesReport = useMemo(() => {
    if (!isReady) {
      return defaultSalesReport;
    }

    const grouped = new Map();

    auctions.forEach((auction, index) => {
      const closeDate = auction.biddingEnd ? new Date(auction.biddingEnd) : null;
      const hasValidDate = closeDate && !Number.isNaN(closeDate.getTime());
      const label = hasValidDate
        ? closeDate.toLocaleDateString("en-US", { weekday: "short" })
        : (auction.title || `Lot ${index + 1}`).slice(0, 3).toUpperCase();
      const tooltip = hasValidDate
        ? closeDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : auction.title || "Pending schedule";
      const sortKey = hasValidDate ? closeDate.getTime() : Number.MAX_SAFE_INTEGER - index;
      const current = grouped.get(label) ?? { day: label, value: 0, tooltip, sortKey };
      current.value += toNumber(auction.reservePrice);
      current.tooltip = tooltip;
      current.sortKey = Math.min(current.sortKey, sortKey);
      grouped.set(label, current);
    });

    const result = Array.from(grouped.values()).sort((a, b) => a.sortKey - b.sortKey);
    const maxValue = result.length ? Math.max(...result.map((entry) => entry.value)) : 0;

    return result.slice(0, 7).map((entry) => ({
      ...entry,
      highlighted: maxValue > 0 && entry.value === maxValue,
    }));
  }, [isReady, auctions]);

  const costSegments = useMemo(() => {
    if (!isReady) {
      return defaultCostSegments;
    }

    if (!arrears.length) {
      return [];
    }

    const buckets = new Map();
    arrears.forEach((entry) => {
      const label = entry.property || "Unassigned asset";
      buckets.set(label, (buckets.get(label) ?? 0) + toNumber(entry.amount));
    });

    return Array.from(buckets.entries()).map(([label, value], index) => ({
      label,
      value,
      color: donutPalette[index % donutPalette.length],
    }));
  }, [isReady, arrears]);

  const transactions = useMemo(() => {
    if (!isReady) {
      return defaultTransactions;
    }

    if (!leases.length) {
      return [];
    }

    const arrearsByTenant = new Map(arrears.map((item) => [item.tenant, item]));

    return leases
      .map((lease) => {
        const arrear = arrearsByTenant.get(lease.tenantName);
        const amount = arrear ? toNumber(arrear.amount) : toNumber(lease.amountDue);
        return {
          id: lease.id,
          property: `${lease.propertyId || "Unknown"}${lease.unit ? ` - ${lease.unit}` : ""}`,
          timestamp: formatDate(lease.renewalDate),
          total: amount ? formatCurrency(amount, { maximumFractionDigits: 0 }) : "$0",
          amount,
          initials: getInitials(lease.tenantName || lease.propertyId),
          tenant: lease.tenantName ?? "-",
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [isReady, leases, arrears]);

  const maintenanceRequests = useMemo(() => {
    if (!isReady) {
      return defaultMaintenanceRequests;
    }

    return maintenance.slice(0, 4).map((ticket, index) => ({
      id: ticket.ticket || ticket.id || `ticket-${index}`,
      title: `${ticket.category || "Maintenance"} | ${ticket.property || "Unassigned"}`,
      detail: ticket.priority ? `${ticket.priority} priority` : ticket.sla ? `SLA ${ticket.sla}` : "Open",
      assignee: ticket.owner || "Unassigned",
      badge: getInitials(ticket.category || ticket.property || "M"),
    }));
  }, [isReady, maintenance]);

  const alerts = useMemo(() => {
    if (!isReady) {
      return defaultAlerts;
    }

    const items = [];
    if (arrears.length) {
      const arrearsTotal = arrears.reduce((sum, entry) => sum + toNumber(entry.amount), 0);
      items.push({
        type: arrearsTotal > 0 ? "warning" : "success",
        label: `${arrears.length} arrears accounts`,
      });
    }

    if (maintenance.length) {
      items.push({
        type: "info",
        label: `${maintenance.length} open maintenance tickets`,
      });
    }

    const negotiating = leases.filter((lease) => (lease.status || "").toLowerCase() === "negotiating").length;
    if (negotiating) {
      items.push({
        type: "success",
        label: `${negotiating} renewals in negotiation`,
      });
    }

    if (!items.length) {
      items.push({
        type: "success",
        label: "Portfolio is up to date",
      });
    }

    return items.slice(0, 4);
  }, [isReady, arrears, maintenance, leases]);

  const donutTotal = costSegments.reduce((sum, segment) => sum + segment.value, 0);
  let cumulative = 0;
  const donutGradient =
    donutTotal > 0
      ? costSegments
          .map((segment) => {
            const start = (cumulative / donutTotal) * 100;
            cumulative += segment.value;
            const end = (cumulative / donutTotal) * 100;
            return `${segment.color} ${start}% ${end}%`;
          })
          .join(", ")
      : "#E5E7EB 0% 100%";

  const maxSalesValue = salesReport.length ? Math.max(...salesReport.map((entry) => entry.value)) : 0;

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
            <button type="button" onClick={refresh} className={styles.logoutButton} aria-label="Refresh data">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            <button className={styles.userAvatar} aria-label="User profile">
              <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80" alt="User" fill />
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={styles.topBar} id="overview">
            <div className={styles.greeting}>
              <div className={styles.greetingIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="#F97316" stroke="#F97316" strokeWidth="1.5" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1>Portfolio Dashboard</h1>
                <p>Live auctions, leases, and operations data refreshed in real time.</p>
              </div>
            </div>
            <div className={styles.topBarActions}>
              <div className={styles.searchField}>
                <input type="search" placeholder="Search anything..." />
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
              <span>Unable to load the latest portfolio data.</span>
              <button type="button" onClick={refresh}>Retry</button>
            </div>
          )}

          <section className={styles.summaryRow}>
            {summaryMetrics.map((metric) => (
              <article key={metric.id} className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    <div className={`${styles.cardIcon} ${styles[`icon${metric.id}`]}`}>
                      {metric.id === "sales" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      )}
                      {metric.id === "orders" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      )}
                      {metric.id === "properties" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      )}
                    </div>
                    <h3>{metric.label}</h3>
                  </div>
                  <button className={styles.infoButton} type="button" aria-label="More info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
                <div className={styles.summaryValue}>{metric.value}</div>
                <div className={styles.summaryMeta}>
                  <span className={`${styles.trend} ${getTrendClass(metric.variant)}`}>{metric.trend}</span>
                  <span className={styles.summaryHint}>{metric.description}</span>
                </div>
              </article>
            ))}
          </section>

          <section id="analytics" className={styles.analyticsGrid}>
            <article className={styles.salesCard}>
              <header className={styles.cardHeading}>
                <div>
                  <h2>Auction Pipeline</h2>
                  <p>Reserve volume grouped by closing day</p>
                </div>
                <span className={styles.period}>Next seven closes</span>
              </header>
              <div className={styles.salesChart}>
                {salesReport.length === 0 ? (
                  <div className={styles.emptyState}>No auction data available yet.</div>
                ) : (
                  salesReport.map((day) => (
                    <div key={day.day} className={styles.salesBar}>
                      <div
                        className={`${styles.bar} ${day.highlighted ? styles.barHighlight : ""}`}
                        style={{ height: `${maxSalesValue ? (day.value / maxSalesValue) * 100 : 0}%` }}
                      >
                        {day.highlighted && (
                          <div className={styles.barTooltip}>
                            <strong>{formatCurrency(day.value, { maximumFractionDigits: 0 })}</strong>
                            <span>{day.tooltip}</span>
                          </div>
                        )}
                      </div>
                      <span className={styles.barLabel}>{day.day}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className={styles.costCard}>
              <header className={styles.cardHeading}>
                <div>
                  <h2>Arrears Breakdown</h2>
                  <p>Outstanding balances by property</p>
                </div>
                <button type="button" className={styles.link} onClick={refresh}>
                  Refresh data
                </button>
              </header>
              <div className={styles.donutRow}>
                <div className={styles.donut} style={{ backgroundImage: `conic-gradient(${donutGradient})` }}>
                  <div className={styles.donutCenter}>{formatCurrency(donutTotal, { maximumFractionDigits: 0 })}</div>
                </div>
                <ul className={styles.legend}>
                  {costSegments.length === 0 ? (
                    <li className={styles.emptyState}>No arrears on record.</li>
                  ) : (
                    costSegments.map((segment) => (
                      <li key={segment.label}>
                        <span style={{ backgroundColor: segment.color }} />
                        <div>
                          <strong>{segment.label}</strong>
                          <p>{formatCurrency(segment.value, { maximumFractionDigits: 0 })}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </article>
          </section>

          <section id="properties" className={styles.splitRow}>
            <article className={styles.listCard}>
              <header className={styles.cardHeading}>
                <h2>Outstanding Leases</h2>
                <button className={styles.link} type="button" onClick={refresh}>
                  Refresh
                </button>
              </header>
              <ul className={styles.transactionList}>
                {transactions.length === 0 ? (
                  <li className={styles.emptyState}>All lease accounts are current.</li>
                ) : (
                  transactions.map((transaction) => (
                    <li key={transaction.id}>
                      <div className={styles.transactionThumb}>
                        <span className={styles.transactionPlaceholder}>{transaction.initials}</span>
                      </div>
                      <div className={styles.transactionCopy}>
                        <strong>{transaction.tenant}</strong>
                        <span>{transaction.property}</span>
                        <span>{transaction.timestamp}</span>
                      </div>
                      <span className={styles.transactionTotal}>{transaction.total}</span>
                    </li>
                  ))
                )}
              </ul>
            </article>

            <article className={styles.listCard}>
              <header className={styles.cardHeading}>
                <h2>Maintenance Requests</h2>
                <button className={styles.link} type="button" onClick={refresh}>
                  Refresh
                </button>
              </header>
              <ul className={styles.requestList}>
                {maintenanceRequests.length === 0 ? (
                  <li className={styles.emptyState}>No maintenance tickets open.</li>
                ) : (
                  maintenanceRequests.map((request) => (
                    <li key={request.id}>
                      <div className={styles.requestIcon}>{request.badge}</div>
                      <div className={styles.requestCopy}>
                        <strong>{request.title}</strong>
                        <span>Request ID: {request.id}</span>
                      </div>
                      <div className={styles.requestStatus}>{request.detail}</div>
                      <div className={styles.requestAssignee}>{request.assignee}</div>
                    </li>
                  ))
                )}
              </ul>
            </article>
          </section>

          <section id="reports" className={styles.reportsPanel}>
            <div>
              <h2>Reports &amp; Exports</h2>
              <p>
                Ready to download: {auctions.length} auction dossiers, {leases.length} lease summaries,
                and {maintenance.length} maintenance logs.
              </p>
            </div>
            <div className={styles.reportsActions}>
              <Link href="/reports?download=portfolio" className={styles.link}>
                Download latest pack
              </Link>
              <Link href="/reports?schedule=weekly" className={styles.link}>
                Schedule recurring email
              </Link>
            </div>
          </section>

          <section id="settings" className={styles.alertStrip}>
            {alerts.length === 0 ? (
              <div className={`${styles.alertCard} ${styles.alertinfo}`}>
                <span>Nothing to report.</span>
                <button type="button" className={styles.alertButton} onClick={refresh}>
                  Refresh
                </button>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.label} className={`${styles.alertCard} ${styles[`alert${alert.type}`]}`}>
                  <span>{alert.label}</span>
                  <button type="button" className={styles.alertButton} onClick={refresh}>
                    View
                  </button>
                </div>
              ))
            )}
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

