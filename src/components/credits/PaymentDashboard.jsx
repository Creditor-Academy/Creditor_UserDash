import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaSearch,
  FaCoins,
  FaClock,
  FaCreditCard,
  FaHistory,
  FaEye,
  FaCalendarAlt,
} from 'react-icons/fa';
function formatDate(value) {
  try {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(value ?? '—');
  }
}

function daysLeft(expiresAt) {
  try {
    if (!expiresAt) return null;
    const end = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return null;
  }
}

function membershipUI(data) {
  const d = daysLeft(data?.expiresAt || data?.nextBillingDate);
  const Status = (data?.status || '').toString().toLowerCase() === 'active';
  if (!Status || d == null)
    return {
      label: 'Expired',
      tone: 'red',
      bg: 'bg-red-50',
      text: 'text-red-700',
      bar: 0,
    };
  if (d <= 2)
    return {
      label: 'Expired',
      tone: 'red',
      bg: 'bg-red-50',
      text: 'text-red-700',
      bar: 0,
    };
  if (d <= 7)
    return {
      label: 'Expiring Soon',
      tone: 'yellow',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      bar: Math.max(10, Math.min(80, Math.round((d / 30) * 100))),
    };
  return {
    label: 'Active',
    tone: 'green',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    bar: Math.max(20, Math.min(100, Math.round((d / 30) * 100))),
  };
}

function creditUI(n) {
  const v = Number(n) || 0;
  if (v >= 1000)
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
    };
  if (v >= 500)
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      icon: 'text-amber-600',
    };
  return { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' };
}

// Generate dummy transaction history
const generateDummyHistory = (userId, userName, userEmail) => {
  const now = Date.now();
  const history = [];

  // Grant history
  const grants = [
    {
      date: new Date(now - 30 * 86400000).toISOString(),
      credits: 1000,
      reason: 'Welcome bonus',
    },
    {
      date: new Date(now - 15 * 86400000).toISOString(),
      credits: 500,
      reason: 'Promotional grant',
    },
    {
      date: new Date(now - 7 * 86400000).toISOString(),
      credits: 200,
      reason: 'Manual grant',
    },
  ];

  // Deduct history
  const deducts = [
    {
      date: new Date(now - 25 * 86400000).toISOString(),
      credits: 100,
      reason: 'Admin adjustment',
    },
    {
      date: new Date(now - 10 * 86400000).toISOString(),
      credits: 50,
      reason: 'Refund correction',
    },
  ];

  // Usage history
  const usages = [
    {
      date: new Date(now - 20 * 86400000).toISOString(),
      credits: 750,
      type: 'Catalog Purchase',
      description: 'Premium Course Access',
      catalogItem: 'Premium Catalog Bundle',
    },
    {
      date: new Date(now - 12 * 86400000).toISOString(),
      credits: 1000,
      type: 'Consultation',
      description: 'Expert Consultation Session',
      serviceType: 'Consultation',
      consultant: 'Dr. Rivera',
    },
    {
      date: new Date(now - 5 * 86400000).toISOString(),
      credits: 500,
      type: 'Lesson Purchase',
      description: 'Advanced Module Unlock',
      lessonName: 'Advanced Trading Lesson',
    },
  ];

  grants.forEach(g => {
    history.push({
      userId,
      userName,
      userEmail,
      type: 'grant',
      date: g.date,
      credits: g.credits,
      description: g.reason,
    });
  });

  deducts.forEach(d => {
    history.push({
      userId,
      userName,
      userEmail,
      type: 'deduct',
      date: d.date,
      credits: d.credits,
      description: d.reason,
    });
  });

  usages.forEach(u => {
    history.push({
      userId,
      userName,
      userEmail,
      type: 'usage',
      date: u.date,
      credits: u.credits,
      description: u.description,
      usageType: u.type,
      catalogItem: u.catalogItem,
      lessonName: u.lessonName,
      serviceType: u.serviceType,
      consultant: u.consultant,
    });
  });

  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const DEFAULT_USERS = [
  {
    id: 'U001',
    name: 'Tom Brown',
    email: 'longtimepainter42@gmail.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    },
    credits: 0,
  },
  {
    id: 'U002',
    name: 'PaulMichael Rowland',
    email: 'paulmichael@creditoracademy.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
    credits: 5850,
  },
  {
    id: 'U003',
    name: 'Sara Ali',
    email: 'sara.ali@example.com',
    membership: { status: 'CANCELLED', expiresAt: null },
    credits: 120,
  },
  {
    id: 'U004',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@example.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 1 * 86400000).toISOString(),
    },
    credits: 45,
  },
  {
    id: 'U005',
    name: 'Anita Singh',
    email: 'anita.singh@example.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
    credits: 300,
  },
  {
    id: 'U006',
    name: 'Vikram Patel',
    email: 'vikram.patel@example.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 9 * 86400000).toISOString(),
    },
    credits: 750,
  },
  {
    id: 'U007',
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    membership: { status: 'CANCELLED', expiresAt: null },
    credits: 520,
  },
  {
    id: 'U008',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    },
    credits: 1500,
  },
  {
    id: 'U009',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    membership: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    },
    credits: 980,
  },
  {
    id: 'U010',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    membership: { status: 'CANCELLED', expiresAt: null },
    credits: 480,
  },
];

const PaymentDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCredits, setFilterCredits] = useState('all');
  const [filterTxnType, setFilterTxnType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'history', 'analytics'
  const [userDetailModal, setUserDetailModal] = useState({
    open: false,
    user: null,
  });
  const [userUsageModal, setUserUsageModal] = useState({
    open: false,
    user: null,
  });
  const [changingMembership, setChangingMembership] = useState(null);
  const [creditHistory, setCreditHistory] = useState({}); // userId -> history array
  const dateInputRef = useRef(null);

  // Load dummy data
  useEffect(() => {
    setLoading(true);
    setError('');

    // Use dummy users
    const dummyUsers = DEFAULT_USERS;
    setUsers(dummyUsers);

    // Generate dummy history for each user
    const historyMap = {};
    dummyUsers.forEach(user => {
      historyMap[user.id] = generateDummyHistory(
        user.id,
        user.name,
        user.email
      );
    });
    setCreditHistory(historyMap);

    setLoading(false);
  }, []);

  const enriched = useMemo(() => {
    return users.map(u => {
      const ui = membershipUI(u.membership || { status: 'cancelled' });
      return {
        ...u,
        membershipLabel: ui.label,
        membershipTone: ui.tone,
        membershipBg: ui.bg,
        membershipText: ui.text,
        membershipBar: ui.bar,
      };
    });
  }, [users]);

  const filtered = useMemo(() => {
    const f = enriched.filter(u => {
      const term = search.trim().toLowerCase();
      const matches =
        !term ||
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        String(u.id || '')
          .toLowerCase()
          .includes(term);
      const statusOk =
        filterStatus === 'all' ||
        (filterStatus === 'active' && u.membershipLabel === 'Active') ||
        (filterStatus === 'expiring' &&
          u.membershipLabel === 'Expiring Soon') ||
        (filterStatus === 'expired' && u.membershipLabel === 'Expired');
      let creditsOk = true;
      const v = Number(u.credits) || 0;
      if (filterCredits === 'zero') creditsOk = v === 0;
      else if (filterCredits === 'low') creditsOk = v > 0 && v < 100;
      else if (filterCredits === 'high') creditsOk = v >= 1000;
      else if (filterCredits === 'red') creditsOk = v < 500;
      else if (filterCredits === 'yellow') creditsOk = v >= 500 && v < 1000;
      else if (filterCredits === 'green') creditsOk = v >= 1000;
      return matches && statusOk && creditsOk;
    });
    const weight = { Active: 0, 'Expiring Soon': 1, Expired: 2 };
    return f.sort(
      (a, b) =>
        (weight[a.membershipLabel] ?? 99) - (weight[b.membershipLabel] ?? 99)
    );
  }, [enriched, search, filterStatus, filterCredits]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageClamped = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageClamped - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, pageClamped, perPage]);

  const changeMembership = (user, value) => {
    if (!user) return;
    setChangingMembership(user.id);
    const next =
      value === 'cancelled'
        ? { status: 'CANCELLED', expiresAt: null }
        : {
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          };

    // Just update local state for dummy data
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, membership: next } : u))
    );
    setChangingMembership(null);
  };

  const clearDateFilter = () => {
    setFilterDate('');
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterCredits, filterTxnType, filterDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeMemberships = users.filter(
      u => (u.membership?.status || '').toString().toLowerCase() === 'active'
    ).length;
    const totalCredits = users.reduce(
      (sum, u) => sum + (Number(u.credits) || 0),
      0
    );
    const totalUsage = Object.values(creditHistory).reduce((sum, hist) => {
      const historyList = Array.isArray(hist) ? hist : [];
      // Sum only usage type transactions
      const usageSum = historyList
        .filter(h => h.type === 'usage')
        .reduce((s, h) => s + (Number(h.credits) || 0), 0);
      return sum + usageSum;
    }, 0);

    return {
      totalUsers,
      activeMemberships,
      totalCredits,
      totalUsage,
      expiringSoon: users.filter(u => {
        const ui = membershipUI(u.membership || { status: 'cancelled' });
        return ui.label === 'Expiring Soon';
      }).length,
    };
  }, [users, creditHistory]);

  // Get all transaction history (grants, deducts, usage)
  const allHistory = useMemo(() => {
    const history = [];
    Object.entries(creditHistory).forEach(([userId, hist]) => {
      if (Array.isArray(hist)) {
        history.push(...hist);
      } else {
        const usage = hist?.usage || [];
        const transactions = hist?.transactions || [];
        const user = users.find(u => u.id === userId);

        usage.forEach(u => {
          history.push({
            userId,
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
            type: 'usage',
            date: u.date || u.created_at || new Date().toISOString(),
            credits: Number(u.credits) || 0,
            description: u.description || u.type || 'Credit Usage',
          });
        });

        transactions.forEach(t => {
          history.push({
            userId,
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
            type: t.type || 'transaction',
            date: t.date || t.created_at || new Date().toISOString(),
            credits: Number(t.credits) || Number(t.amount) || 0,
            description: t.description || t.reason || 'Credit Transaction',
          });
        });
      }
    });
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [creditHistory, users]);

  const filteredHistory = useMemo(() => {
    let list = allHistory;
    if (filterDate) {
      const targetDate = new Date(filterDate);
      list = list.filter(h => {
        const d = new Date(h.date);
        if (Number.isNaN(d.getTime())) return false;
        return (
          d.getFullYear() === targetDate.getFullYear() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getDate() === targetDate.getDate()
        );
      });
    }
    if (filterTxnType !== 'all') {
      list = list.filter(h => h.type === filterTxnType);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        h =>
          (h.userName || '').toLowerCase().includes(term) ||
          (h.userEmail || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [allHistory, filterDate, filterTxnType, users, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaCreditCard className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Payment Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Manage memberships, credits, and transaction history
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalUsers}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Active Memberships</div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.activeMemberships}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Credits</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalCredits.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Usage</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.totalUsage.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="border-b px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users & Memberships
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'users' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users by name, email, or ID"
                  className="flex-1 min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="text-sm rounded-md border px-3 py-2 bg-white"
                >
                  <option value="all">All Memberships</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={filterCredits}
                  onChange={e => setFilterCredits(e.target.value)}
                  className="text-sm rounded-md border px-3 py-2 bg-white"
                >
                  <option value="all">All Credits</option>
                  <option value="red">Red (&lt; 500)</option>
                  <option value="yellow">Yellow (500-999)</option>
                  <option value="green">Green (≥ 1000)</option>
                </select>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {loading && (
                  <div className="p-6 text-center text-gray-600">Loading…</div>
                )}
                {error && !loading && (
                  <div className="p-4 text-red-700 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}
                {!loading && !error && paged.length === 0 && (
                  <div className="p-6 text-center text-gray-600">
                    No users found
                  </div>
                )}
                {!loading &&
                  !error &&
                  paged.map(u => {
                    const hist = creditHistory[u.id] || [];
                    const historyCount = Array.isArray(hist)
                      ? hist.length
                      : (hist?.usage?.length || 0) +
                        (hist?.transactions?.length || 0);
                    return (
                      <div
                        key={u.id}
                        className="rounded-xl border px-4 py-3 mb-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-sm text-gray-700 truncate">
                              {u.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const ui = membershipUI(
                                u.membership || { status: 'cancelled' }
                              );
                              return (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-md ${ui.bg} ${ui.text} text-xs font-semibold`}
                                >
                                  {ui.label}
                                </span>
                              );
                            })()}
                            <button
                              onClick={() =>
                                setUserUsageModal({ open: true, user: u })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Usage Details"
                            >
                              <FaClock className="text-sm" />
                              Usage
                            </button>
                            <button
                              onClick={() => {
                                setUserDetailModal({ open: true, user: u });
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details & History"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const v =
                                (u.membership?.status || '')
                                  .toString()
                                  .toLowerCase() === 'active'
                                  ? 'active'
                                  : 'cancelled';
                              return (
                                <select
                                  value={v}
                                  onChange={e =>
                                    changeMembership(u, e.target.value)
                                  }
                                  disabled={changingMembership === u.id}
                                  className="text-xs rounded-md border px-2 py-1 bg-white"
                                >
                                  <option value="active">active</option>
                                  <option value="cancelled">not active</option>
                                </select>
                              );
                            })()}
                            <div className="text-xs text-gray-600">
                              Ends{' '}
                              {formatDate(
                                u.membership?.expiresAt ||
                                  u.membership?.nextBillingDate
                              )}
                            </div>
                          </div>
                          {(() => {
                            const ui = creditUI(u.credits);
                            const hist = creditHistory[u.id] || [];
                            const historyCount = Array.isArray(hist)
                              ? hist.length
                              : (hist?.usage?.length || 0) +
                                (hist?.transactions?.length || 0);
                            const grantCount = Array.isArray(hist)
                              ? hist.filter(h => h.type === 'grant').length
                              : 0;
                            const deductCount = Array.isArray(hist)
                              ? hist.filter(h => h.type === 'deduct').length
                              : 0;
                            const usageCount = Array.isArray(hist)
                              ? hist.filter(h => h.type === 'usage').length
                              : hist?.usage?.length || 0;
                            return (
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500">
                                  {historyCount} transaction
                                  {historyCount !== 1 ? 's' : ''} ({grantCount}{' '}
                                  grants, {deductCount} deducts, {usageCount}{' '}
                                  usage)
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${ui.bg} ${ui.text}`}
                                >
                                  <FaCoins className={ui.icon} />
                                  <span className="font-semibold">
                                    {u.credits}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
                <div className="text-sm text-gray-600">
                  Page {pageClamped} of {totalPages} • {filtered.length} total
                  users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md border hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded-md border hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="mb-4 flex gap-2 flex-wrap">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users by name, email, or ID"
                  className="flex-1 min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={filterTxnType}
                  onChange={e => setFilterTxnType(e.target.value)}
                  className="text-sm rounded-md border px-3 py-2 bg-white"
                >
                  <option value="all">All Transactions</option>
                  <option value="grant">Grants Only</option>
                  <option value="deduct">Deducts Only</option>
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (dateInputRef.current?.showPicker) {
                        dateInputRef.current.showPicker();
                      } else {
                        dateInputRef.current?.focus();
                      }
                    }}
                    className={`text-sm rounded-md border px-3 py-2 flex items-center gap-2 ${
                      filterDate
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    <FaCalendarAlt
                      className={
                        filterDate ? 'text-blue-600' : 'text-gray-500 text-base'
                      }
                    />
                    {filterDate
                      ? new Date(filterDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Select Date'}
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                  {filterDate && (
                    <button
                      onClick={clearDateFilter}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    No transaction history
                  </div>
                ) : (
                  filteredHistory.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {h.userName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {h.userEmail}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {h.description}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div
                            className={`font-semibold text-lg ${
                              h.type === 'usage' || h.type === 'deduct'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {h.type === 'usage' || h.type === 'deduct'
                              ? '-'
                              : '+'}
                            {Math.abs(h.credits)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(h.date)}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                              h.type === 'usage'
                                ? 'bg-red-100 text-red-700'
                                : h.type === 'grant'
                                  ? 'bg-green-100 text-green-700'
                                  : h.type === 'deduct'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {h.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Credit Distribution
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        High Credits (≥1000)
                      </span>
                      <span className="font-medium">
                        {
                          users.filter(u => (Number(u.credits) || 0) >= 1000)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Medium Credits (500-999)
                      </span>
                      <span className="font-medium">
                        {
                          users.filter(u => {
                            const c = Number(u.credits) || 0;
                            return c >= 500 && c < 1000;
                          }).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Low Credits (&lt;500)
                      </span>
                      <span className="font-medium">
                        {
                          users.filter(u => (Number(u.credits) || 0) < 500)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Membership Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active</span>
                      <span className="font-medium text-emerald-600">
                        {stats.activeMemberships}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiring Soon</span>
                      <span className="font-medium text-amber-600">
                        {stats.expiringSoon}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expired</span>
                      <span className="font-medium text-red-600">
                        {users.length -
                          stats.activeMemberships -
                          stats.expiringSoon}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {userDetailModal.open && userDetailModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setUserDetailModal({ open: false, user: null })}
          />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {userDetailModal.user.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {userDetailModal.user.email}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setUserDetailModal({ open: false, user: null })
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">Current Credits</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {userDetailModal.user.credits}
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">Membership</div>
                  <div className="text-lg font-semibold">
                    {(() => {
                      const ui = membershipUI(
                        userDetailModal.user.membership || {
                          status: 'cancelled',
                        }
                      );
                      return <span className={ui.text}>{ui.label}</span>;
                    })()}
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">
                  Credit History (Grants, Deducts & Usage)
                </h5>
                <div className="space-y-2">
                  {(() => {
                    const hist = creditHistory[userDetailModal.user.id] || [];
                    const historyList = Array.isArray(hist) ? hist : [];

                    if (historyList.length === 0) {
                      return (
                        <div className="text-center text-gray-600 py-4">
                          No history
                        </div>
                      );
                    }

                    return historyList.map((h, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg px-3 py-2 flex justify-between items-center ${
                          h.type === 'grant'
                            ? 'bg-green-50 border-green-200'
                            : h.type === 'deduct'
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {h.description || h.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(h.date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              h.type === 'grant'
                                ? 'bg-green-100 text-green-700'
                                : h.type === 'deduct'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {h.type}
                          </span>
                          <div
                            className={`font-semibold ${
                              h.type === 'usage' || h.type === 'deduct'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {h.type === 'usage' || h.type === 'deduct'
                              ? '-'
                              : '+'}
                            {Math.abs(h.credits || 0)}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Usage Modal */}
      {userUsageModal.open && userUsageModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setUserUsageModal({ open: false, user: null })}
          />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  Usage details
                </h4>
                <p className="text-sm text-gray-600">
                  {userUsageModal.user.name} · {userUsageModal.user.email}
                </p>
              </div>
              <button
                onClick={() => setUserUsageModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              {(() => {
                const hist = creditHistory[userUsageModal.user.id] || [];
                const usageList = Array.isArray(hist)
                  ? hist.filter(h => h.type === 'usage')
                  : [];

                if (usageList.length === 0) {
                  return (
                    <div className="text-center text-gray-600 py-8 border rounded-lg">
                      No usage records found for this user.
                    </div>
                  );
                }

                const now = new Date();
                const totalUsageCredits = usageList.reduce(
                  (sum, item) => sum + Math.abs(item.credits || 0),
                  0
                );
                const usageThisMonth = usageList.reduce((sum, item) => {
                  const d = new Date(item.date);
                  return d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                    ? sum + Math.abs(item.credits || 0)
                    : sum;
                }, 0);
                const usageByCategory = usageList.reduce((acc, item) => {
                  const key = item.usageType || 'Other';
                  acc[key] = (acc[key] || 0) + Math.abs(item.credits || 0);
                  return acc;
                }, {});

                const categoryEntries = Object.entries(usageByCategory).sort(
                  (a, b) => b[1] - a[1]
                );

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="text-xs uppercase text-blue-700 font-semibold">
                          Total Credits Used
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {totalUsageCredits.toLocaleString()}
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Lifetime usage recorded for this user
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                        <div className="text-xs uppercase text-amber-700 font-semibold">
                          Credits used this month
                        </div>
                        <div className="text-2xl font-bold text-amber-900">
                          {usageThisMonth.toLocaleString()}
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          {now.toLocaleString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
                        <div className="text-xs uppercase text-emerald-700 font-semibold">
                          Top usage category
                        </div>
                        <div className="text-lg font-bold text-emerald-900">
                          {categoryEntries[0]?.[0] || '—'}
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          {categoryEntries[0]
                            ? `${categoryEntries[0][1].toLocaleString()} credits`
                            : 'No usage yet'}
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg">
                      <div className="border-b px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                        Usage breakdown by category
                      </div>
                      <ul className="divide-y">
                        {categoryEntries.map(([label, total]) => (
                          <li
                            key={label}
                            className="flex items-center justify-between px-4 py-2 text-sm"
                          >
                            <span className="font-medium text-gray-900">
                              {label}
                            </span>
                            <span className="text-gray-600">
                              {total.toLocaleString()} credits
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                          <tr>
                            <th className="px-4 py-2">Activity</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Credits</th>
                            <th className="px-4 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {usageList.map((usage, index) => {
                            const detailLine =
                              usage.catalogItem ||
                              usage.lessonName ||
                              usage.serviceType ||
                              usage.consultant ||
                              '';
                            return (
                              <tr
                                key={`${usage.date}-${index}`}
                                className="bg-white"
                              >
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-gray-900">
                                    {usage.description || 'Usage'}
                                  </div>
                                  {detailLine && (
                                    <div className="text-xs text-gray-500">
                                      {detailLine}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    {usage.usageType || 'Usage'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-red-600">
                                  -{Math.abs(usage.credits || 0)}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">
                                  {formatDate(usage.date)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
