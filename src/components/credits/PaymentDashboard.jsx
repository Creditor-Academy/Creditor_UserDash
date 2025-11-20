import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaCoins, FaClock, FaCreditCard } from 'react-icons/fa';
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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [changingMembership, setChangingMembership] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setUsers(DEFAULT_USERS);
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
      if (filterCredits === 'zero') creditsOk = (Number(u.credits) || 0) === 0;
      else if (filterCredits === 'low')
        creditsOk =
          (Number(u.credits) || 0) > 0 && (Number(u.credits) || 0) < 100;
      else if (filterCredits === 'high')
        creditsOk = (Number(u.credits) || 0) >= 1000;
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
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, membership: next } : u))
    );
    setChangingMembership(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaCreditCard className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Payment Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Manage memberships and credits
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading && (
            <div className="p-6 text-center text-gray-600">Loading…</div>
          )}
          {error && !loading && (
            <div className="p-4 text-red-700 bg-red-50">{error}</div>
          )}
          {!loading && !error && paged.length === 0 && (
            <div className="p-6 text-center text-gray-600">No users</div>
          )}
          {!loading &&
            !error &&
            paged.map(u => (
              <div
                key={u.id}
                className="rounded-xl border px-4 py-3 mb-3 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {u.name}
                    </div>
                    <div className="text-sm text-gray-700 truncate">
                      {u.email}
                    </div>
                  </div>
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
                          onChange={e => changeMembership(u, e.target.value)}
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
                        u.membership?.expiresAt || u.membership?.nextBillingDate
                      )}
                    </div>
                  </div>
                  {(() => {
                    const ui = creditUI(u.credits);
                    return (
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${ui.bg} ${ui.text}`}
                      >
                        <FaCoins className={ui.icon} />
                        <span className="font-semibold">{u.credits}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Page {pageClamped} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 text-sm"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
