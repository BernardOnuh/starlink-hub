"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./dashboard.module.css";

interface Payment {
  _id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
}

interface Stats { _id: string; count: number; total: number; }

export default function AdminDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getStat = (s: string) => stats.find((x) => x._id === s);
  const paidStat = getStat("paid");
  const pendingStat = getStat("pending");
  const failedStat = getStat("failed");

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <main className={styles.main}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>StarLink Hub</span>
        </div>
        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.active}`}>📊 Payments</div>
        </nav>
        <div className={styles.sidebarFooter}>Admin Panel</div>
      </div>

      <div className={styles.body}>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>Payments Dashboard</h1>
            <p className={styles.pageSubtitle}>{total} total transactions</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchData}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Paid</span>
            <span className={`${styles.statValue} ${styles.green}`}>
              ₦{((paidStat?.total || 0)).toLocaleString()}
            </span>
            <span className={styles.statSub}>{paidStat?.count || 0} payments</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending</span>
            <span className={`${styles.statValue} ${styles.yellow}`}>{pendingStat?.count || 0}</span>
            <span className={styles.statSub}>awaiting confirmation</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Failed</span>
            <span className={`${styles.statValue} ${styles.red}`}>{failedStat?.count || 0}</span>
            <span className={styles.statSub}>unsuccessful</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Records</span>
            <span className={styles.statValue}>{total}</span>
            <span className={styles.statSub}>all time</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <input
              placeholder="Search by name, email or reference…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={styles.searchInput}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={styles.select}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loadingRow}>Loading payments…</div>
          ) : payments.length === 0 ? (
            <div className={styles.loadingRow}>No payments found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td><span className={styles.ref}>{p.reference}</span></td>
                    <td>
                      <div className={styles.customerName}>{p.customerName}</div>
                      <div className={styles.customerEmail}>{p.customerEmail}</div>
                    </td>
                    <td>{p.customerPhone}</td>
                    <td className={styles.amountCell}>₦{p.amount.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.date}>{new Date(p.createdAt).toLocaleDateString("en-NG")}</td>
                    <td className={styles.date}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span>Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>
    </main>
  );
}
