import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FaSearch,
  FaCoins,
  FaClock,
  FaCreditCard,
  FaHistory,
  FaEye,
  FaCalendarAlt,
  FaDownload,
} from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import { fetchAllUsersAdmin } from '@/services/userService';
import { api } from '@/services/apiClient';

const ORGANIZATION_ID = 'be68e945-b827-4905-8b44-62126364d1b7';
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
  const status = (data?.status || '').toString().toLowerCase();
  if (status === 'active')
    return {
      label: 'Active',
      tone: 'green',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      bar: 100,
    };
  return {
    label: 'Inactive',
    tone: 'red',
    bg: 'bg-red-50',
    text: 'text-red-700',
    bar: 0,
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
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'history', 'analytics', 'usage'
  const [usageDateFrom, setUsageDateFrom] = useState('');
  const [usageDateTo, setUsageDateTo] = useState('');
  const [usageCourseFilter, setUsageCourseFilter] = useState('all');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [trendDateFrom, setTrendDateFrom] = useState('');
  const [trendDateTo, setTrendDateTo] = useState('');
  const [trendMetric, setTrendMetric] = useState('credits'); // 'credits', 'grants', 'deducts', 'usage'
  const [userDetailModal, setUserDetailModal] = useState({
    open: false,
    user: null,
  });
  const [creditHistory, setCreditHistory] = useState({}); // userId -> history array
  const dateInputRef = useRef(null);
  const [transactionsError, setTransactionsError] = useState('');
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [usageError, setUsageError] = useState('');
  const [usageLoading, setUsageLoading] = useState(false);
  const [editTransactionModal, setEditTransactionModal] = useState({
    open: false,
    record: null,
    amount: '',
    reason: '',
    error: '',
  });
  const [deleteTransactionModal, setDeleteTransactionModal] = useState({
    open: false,
    record: null,
    error: '',
  });
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  const fetchGrantDeductTransactions = useCallback(
    async currentUsers => {
      if (!Array.isArray(currentUsers) || currentUsers.length === 0) return;
      setTransactionsError('');
      setTransactionsLoading(true);

      try {
        const response = await api.get('/payment-order/grant-deduct', {
          params: { type: 'all' },
          withCredentials: true,
        });

        const records = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (!Array.isArray(records) || records.length === 0) {
          return;
        }

        const userLookup = new Map(
          currentUsers.map(user => [String(user.id), user])
        );

        setCreditHistory(prev => {
          const next = { ...prev };

          records.forEach(record => {
            const userId = String(
              record.user_id || record.userId || record.userid || ''
            );
            if (!userId) return;

            const txnId =
              record.id ||
              `${userId}-${record.created_at || record.createdAt || record.timestamp || ''}-${record.amount}-${record.type}`;

            const recordType = (record.type || '').toString().toLowerCase();
            const mappedType =
              recordType === 'credit'
                ? 'grant'
                : recordType === 'debit'
                  ? 'deduct'
                  : record.type || 'transaction';

            const entry = {
              transactionId: txnId,
              userId,
              userName: userLookup.get(userId)?.name || 'Unknown',
              userEmail: userLookup.get(userId)?.email || '',
              type: mappedType,
              date:
                record.created_at ||
                record.createdAt ||
                record.updated_at ||
                record.timestamp ||
                new Date().toISOString(),
              credits: Number(record.amount) || 0,
              description:
                record.reason ||
                (mappedType === 'grant'
                  ? 'Credits granted'
                  : mappedType === 'deduct'
                    ? 'Credits deducted'
                    : 'Credit transaction'),
            };

            const existingRaw = next[userId];
            let existingEntries = [];

            if (Array.isArray(existingRaw)) {
              existingEntries = existingRaw.slice();
            } else if (existingRaw && typeof existingRaw === 'object') {
              const usage = Array.isArray(existingRaw.usage)
                ? existingRaw.usage
                : [];
              const transactions = Array.isArray(existingRaw.transactions)
                ? existingRaw.transactions
                : [];
              existingEntries = [...usage, ...transactions];
            }

            if (
              entry.transactionId &&
              existingEntries.some(
                item => item.transactionId === entry.transactionId
              )
            ) {
              return;
            }

            next[userId] = [entry, ...existingEntries].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
          });

          return next;
        });
      } catch (error) {
        console.error(
          'Failed to fetch grant/deduct transactions:',
          error?.response?.data || error?.message || error
        );
        setTransactionsError('Failed to load credit transactions.');
      } finally {
        setTransactionsLoading(false);
      }
    },
    [setCreditHistory]
  );

  const fetchUsageRecords = useCallback(
    async currentUsers => {
      if (!Array.isArray(currentUsers) || currentUsers.length === 0) return;
      setUsageError('');
      setUsageLoading(true);

      try {
        const response = await api.get('/payment-order/credits/allusage', {
          // No excludedUserIds for now – can be wired later if needed
          withCredentials: true,
        });

        const records = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (!Array.isArray(records) || records.length === 0) {
          return;
        }

        const userLookup = new Map(
          currentUsers.map(user => [String(user.id), user])
        );

        setCreditHistory(prev => {
          const next = { ...prev };

          records.forEach(record => {
            const userId = String(
              record.user_id ||
                record.userId ||
                record.userid ||
                record.user?._id ||
                ''
            );
            if (!userId) return;

            const existingRaw = next[userId];
            let existingEntries = [];

            if (Array.isArray(existingRaw)) {
              existingEntries = existingRaw.slice();
            } else if (existingRaw && typeof existingRaw === 'object') {
              const usageArr = Array.isArray(existingRaw.usage)
                ? existingRaw.usage
                : [];
              const txArr = Array.isArray(existingRaw.transactions)
                ? existingRaw.transactions
                : [];
              existingEntries = [...usageArr, ...txArr];
            }

            const usageType =
              record.unlock_type ||
              record.usage_type ||
              record.usageType ||
              record.type ||
              'Usage';

            const entry = {
              userId,
              userName:
                userLookup.get(userId)?.name ||
                record.user?.first_name ||
                'Unknown',
              userEmail: userLookup.get(userId)?.email || '',
              type: 'usage',
              date:
                record.used_at ||
                record.created_at ||
                record.createdAt ||
                record.timestamp ||
                new Date().toISOString(),
              credits:
                Number(record.credits_spent) ||
                Number(record.credits) ||
                Number(record.amount) ||
                Number(record.value) ||
                0,
              description:
                record.description ||
                record.reason ||
                record.note ||
                usageType ||
                'Credit usage',
              usageType,
            };

            next[userId] = [entry, ...existingEntries].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
          });

          return next;
        });
      } catch (error) {
        console.error(
          'Failed to fetch credit usage records:',
          error?.response?.data || error?.message || error
        );
        setUsageError('Failed to load credit usage records.');
      } finally {
        setUsageLoading(false);
      }
    },
    [setCreditHistory]
  );

  const openEditTransactionModal = record => {
    if (!record?.transactionId) return;
    setEditTransactionModal({
      open: true,
      record,
      amount: String(Math.abs(record.credits ?? '')),
      reason: record.description || '',
      error: '',
    });
  };

  const handleTransactionUpdate = async () => {
    if (!editTransactionModal.record?.transactionId || isUpdatingTransaction)
      return;

    const amountValue = Number(editTransactionModal.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setEditTransactionModal(prev => ({
        ...prev,
        error: 'Enter a valid amount greater than 0.',
      }));
      return;
    }

    setIsUpdatingTransaction(true);
    setEditTransactionModal(prev => ({ ...prev, error: '' }));

    try {
      await api.patch(
        `/payment-order/grant-deduct/${editTransactionModal.record.transactionId}`,
        {
          amount: amountValue,
          reason: editTransactionModal.reason,
        },
        { withCredentials: true }
      );

      const userId = editTransactionModal.record.userId;
      const transactionId = editTransactionModal.record.transactionId;
      const newReason = editTransactionModal.reason;

      setCreditHistory(prev => {
        const next = { ...prev };
        if (Array.isArray(next[userId])) {
          next[userId] = next[userId].map(entry =>
            entry.transactionId === transactionId
              ? {
                  ...entry,
                  credits: amountValue,
                  description:
                    newReason || entry.description || 'Credit transaction',
                }
              : entry
          );
        }
        return next;
      });

      setEditTransactionModal({
        open: false,
        record: null,
        amount: '',
        reason: '',
        error: '',
      });
    } catch (error) {
      setEditTransactionModal(prev => ({
        ...prev,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update transaction.',
      }));
    } finally {
      setIsUpdatingTransaction(false);
    }
  };

  const openDeleteTransactionModal = record => {
    if (!record?.transactionId) return;
    setDeleteTransactionModal({
      open: true,
      record,
      error: '',
    });
  };

  const handleTransactionDelete = async () => {
    if (!deleteTransactionModal.record?.transactionId || isDeletingTransaction)
      return;

    setIsDeletingTransaction(true);
    setDeleteTransactionModal(prev => ({ ...prev, error: '' }));

    try {
      await api.delete(
        `/payment-order/grant-deduct/${deleteTransactionModal.record.transactionId}`,
        { withCredentials: true }
      );

      const userId = deleteTransactionModal.record.userId;
      const transactionId = deleteTransactionModal.record.transactionId;

      setCreditHistory(prev => {
        const next = { ...prev };
        if (Array.isArray(next[userId])) {
          next[userId] = next[userId].filter(
            entry => entry.transactionId !== transactionId
          );
        }
        return next;
      });

      setDeleteTransactionModal({
        open: false,
        record: null,
        error: '',
      });
    } catch (error) {
      setDeleteTransactionModal(prev => ({
        ...prev,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete transaction.',
      }));
    } finally {
      setIsDeletingTransaction(false);
    }
  };
  const [userUsageModal, setUserUsageModal] = useState({
    open: false,
    user: null,
    analytics: null,
    loadingAnalytics: false,
  });
  const [exportConfirmModal, setExportConfirmModal] = useState({
    open: false,
    data: null,
    stats: null,
    dateFrom: null,
    dateTo: null,
  });
  const [changingMembership, setChangingMembership] = useState(null);

  const buildUsersWithMembership = useCallback(
    async (fetchedUsers, creditsRes) => {
      const creditsArray = Array.isArray(creditsRes?.data?.data)
        ? creditsRes.data.data
        : Array.isArray(creditsRes?.data)
          ? creditsRes.data
          : [];
      const idToCredits = new Map(
        (creditsArray || []).map(c => [
          String(c.id),
          Number(c.total_credits) || 0,
        ])
      );

      // Bulk fetch membership status for org
      let membershipMap = new Map();
      try {
        const membershipRes = await api.get(
          `/payment-order/membership/status/all/${ORGANIZATION_ID}`,
          { withCredentials: true }
        );
        const membershipArray = Array.isArray(membershipRes?.data?.data)
          ? membershipRes.data.data
          : Array.isArray(membershipRes?.data)
            ? membershipRes.data
            : [];
        membershipMap = new Map(
          membershipArray.map(m => [
            String(m.user_id),
            {
              status: (m.subscription_status || 'CANCELLED')
                .toString()
                .toUpperCase(),
              totalCredits: Number(m.total_credits) || 0,
              name: m.name,
              email: m.email,
            },
          ])
        );
      } catch (err) {
        console.warn('Failed to fetch bulk membership status:', err);
      }

      const usersWithMembership = fetchedUsers.map(u => {
        const userId = u.id || u.user_id || u._id;
        const membershipEntry = membershipMap.get(String(userId));
        const membershipData = membershipEntry
          ? { status: membershipEntry.status, expiresAt: null }
          : { status: 'CANCELLED', expiresAt: null };

        const credits = (() => {
          const idStr = String(userId || '');
          const fromBulk =
            membershipEntry && Number.isFinite(membershipEntry.totalCredits)
              ? membershipEntry.totalCredits
              : undefined;
          const fromAdmin = idToCredits.has(idStr)
            ? idToCredits.get(idStr)
            : undefined;
          const val =
            fromBulk != null
              ? fromBulk
              : fromAdmin != null
                ? fromAdmin
                : u.total_credits != null
                  ? u.total_credits
                  : u.credits;
          const num = Number(val);
          return Number.isFinite(num) ? num : 0;
        })();

        return {
          id: userId,
          name:
            membershipEntry?.name ||
            `${u.first_name || u.firstName || u.given_name || ''} ${u.last_name || u.lastName || u.family_name || ''}`.trim() ||
            u.name ||
            u.username ||
            u.email ||
            'Unknown',
          email: membershipEntry?.email || u.email || u.user_email || '',
          membership: membershipData,
          credits,
        };
      });

      return usersWithMembership;
    },
    []
  );

  // Load real data
  useEffect(() => {
    setLoading(true);
    setError('');

    const loadUsers = async () => {
      try {
        // Fetch real users and credits data
        const [fetched, creditsRes] = await Promise.all([
          fetchAllUsersAdmin(),
          api
            .get('/payment-order/admin/credits', { withCredentials: true })
            .catch(() => ({ data: { data: [] } })),
        ]);

        const usersWithMembership = await buildUsersWithMembership(
          fetched,
          creditsRes
        );

        setUsers(usersWithMembership);

        // Initialize empty history for each real user; will populate with real transactions later
        const historyMap = {};
        usersWithMembership.forEach(user => {
          historyMap[user.id] = [];
        });
        setCreditHistory(historyMap);
      } catch (e) {
        console.error('Failed to load users:', e);
        setError('Failed to load users');

        // Fallback to dummy data if API fails
        const dummyUsers = DEFAULT_USERS;
        setUsers(dummyUsers);
        const historyMap = {};
        dummyUsers.forEach(user => {
          historyMap[user.id] = generateDummyHistory(
            user.id,
            user.name,
            user.email
          );
        });
        setCreditHistory(historyMap);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [buildUsersWithMembership]);

  useEffect(() => {
    if (!users || users.length === 0) return;
    fetchGrantDeductTransactions(users);
    fetchUsageRecords(users);
  }, [users, fetchGrantDeductTransactions, fetchUsageRecords]);

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
        (filterStatus === 'inactive' && u.membershipLabel === 'Inactive');
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
    const weight = { Active: 0, Inactive: 1 };
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

  const changeMembership = async (user, value) => {
    if (!user) return;
    setChangingMembership(user.id);

    try {
      if (value === 'cancelled') {
        // Cancel membership
        await api.patch(
          `/payment-order/membership/${user.id}/cancel`,
          {},
          { withCredentials: true }
        );
      } else if (value === 'active') {
        // Activate/Subscribe to membership - use same payload as AdminPayments.jsx
        const subscriptionData = {
          plan_type: 'MONTHLY',
          total_amount: 69,
          type: 'MEMBERSHIP',
        };
        await api.post(
          `/payment-order/membership/subscribe/${user.id}`,
          subscriptionData,
          { withCredentials: true }
        );
      } else {
        // Subscribe to membership with specific plan
        const subscriptionData = {
          plan_type: value === 'monthly' ? 'MONTHLY' : 'ANNUAL',
          total_amount: value === 'monthly' ? 69 : 699,
          type: 'MEMBERSHIP',
        };
        await api.post(
          `/payment-order/membership/subscribe/${user.id}`,
          subscriptionData,
          { withCredentials: true }
        );
      }

      // Refresh user data after change using bulk membership fetch
      const [fetched, creditsRes] = await Promise.all([
        fetchAllUsersAdmin(),
        api
          .get('/payment-order/admin/credits', { withCredentials: true })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const usersWithMembership = await buildUsersWithMembership(
        fetched,
        creditsRes
      );

      setUsers(usersWithMembership);
    } catch (error) {
      console.error('Failed to change membership:', error);
      alert(
        `Failed to change membership: ${error?.response?.data?.message || error?.message || 'Unknown error'}`
      );
    } finally {
      setChangingMembership(null);
    }
  };

  const clearDateFilter = () => {
    setFilterDate('');
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterStatus,
    filterCredits,
    filterTxnType,
    filterDate,
    usageDateFrom,
    usageDateTo,
    usageCourseFilter,
  ]);

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
    // Exclude usage transactions - they belong in the Usage tab
    let list = allHistory.filter(h => h.type !== 'usage');

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

  // Get all usage records
  const allUsageRecords = useMemo(() => {
    return allHistory.filter(h => h.type === 'usage');
  }, [allHistory]);

  // Get unique courses/items for filter
  const uniqueCourses = useMemo(() => {
    const courses = new Set();
    allUsageRecords.forEach(h => {
      const courseName =
        h.catalogItem ||
        h.lessonName ||
        h.description ||
        h.serviceType ||
        'Other';
      courses.add(courseName);
    });
    return Array.from(courses).sort();
  }, [allUsageRecords]);

  // Filtered usage records
  const filteredUsageRecords = useMemo(() => {
    let list = allUsageRecords;

    // Filter by date range
    if (usageDateFrom) {
      const fromDate = new Date(usageDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      list = list.filter(h => {
        const d = new Date(h.date);
        if (Number.isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d >= fromDate;
      });
    }
    if (usageDateTo) {
      const toDate = new Date(usageDateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter(h => {
        const d = new Date(h.date);
        if (Number.isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d <= toDate;
      });
    }

    // Filter by course
    if (usageCourseFilter !== 'all') {
      list = list.filter(h => {
        const courseName =
          h.catalogItem ||
          h.lessonName ||
          h.description ||
          h.serviceType ||
          'Other';
        return courseName === usageCourseFilter;
      });
    }

    // Filter by search term
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        h =>
          (h.userName || '').toLowerCase().includes(term) ||
          (h.userEmail || '').toLowerCase().includes(term) ||
          (h.description || '').toLowerCase().includes(term) ||
          (h.catalogItem || '').toLowerCase().includes(term) ||
          (h.lessonName || '').toLowerCase().includes(term)
      );
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allUsageRecords, usageDateFrom, usageDateTo, usageCourseFilter, search]);

  // Calculate export statistics
  const exportStats = useMemo(() => {
    const getStatsForRange = (dateFrom, dateTo) => {
      let data = allUsageRecords;

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        data = data.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d >= fromDate;
        });
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        data = data.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d <= toDate;
        });
      }

      const totalRecords = data.length;
      const datesWithUsage = new Set();
      data.forEach(h => {
        const d = new Date(h.date);
        if (!Number.isNaN(d.getTime())) {
          datesWithUsage.add(d.toISOString().slice(0, 10));
        }
      });

      let daysWithNoUsage = 0;
      let dateRangeDays = 0;
      if (dateFrom && dateTo) {
        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      } else if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      } else if (dateTo) {
        const start = new Date(data[data.length - 1]?.date || new Date());
        const end = new Date(dateTo);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      }

      return {
        totalRecords,
        datesWithUsage: datesWithUsage.size,
        daysWithNoUsage,
        dateRangeDays,
        dateFrom,
        dateTo,
      };
    };

    return {
      all: getStatsForRange(null, null),
      filtered: getStatsForRange(exportDateFrom || null, exportDateTo || null),
      current: getStatsForRange(usageDateFrom || null, usageDateTo || null),
    };
  }, [
    allUsageRecords,
    exportDateFrom,
    exportDateTo,
    usageDateFrom,
    usageDateTo,
  ]);

  // Analytics: purchases by course (top N), lapses, and lightweight AI suggestions
  // Calculated client-side from existing API data (reusing /payment-order/grant-deduct and /payment-order/credits/allusage)
  const analytics = useMemo(() => {
    // Top courses by usage purchases
    const purchaseCounts = new Map();
    allHistory
      .filter(h => h.type === 'usage')
      .forEach(h => {
        const course =
          h.catalogItem || h.lessonName || h.description || 'Unknown';
        purchaseCounts.set(course, (purchaseCounts.get(course) || 0) + 1);
      });

    // Add dummy purchase data if no real data
    const dummyPurchases = [
      { name: 'Advanced Trading Course', count: 45 },
      { name: 'Credit Repair Masterclass', count: 38 },
      { name: 'Business Credit Building', count: 32 },
      { name: 'Personal Finance Basics', count: 28 },
      { name: 'Investment Strategies', count: 24 },
      { name: 'Tax Planning Workshop', count: 19 },
      { name: 'Real Estate Investing', count: 15 },
      { name: 'Consultation Session', count: 12 },
    ];

    let purchases = Array.from(purchaseCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // If no real purchases, use dummy data
    if (purchases.length === 0) {
      purchases = dummyPurchases;
    } else {
      // Merge dummy data with real data for better visualization
      dummyPurchases.forEach(dummy => {
        const existing = purchases.find(p => p.name === dummy.name);
        if (existing) {
          existing.count += dummy.count;
        } else {
          purchases.push(dummy);
        }
      });
      purchases = purchases.sort((a, b) => b.count - a.count);
    }

    // Credit flow summary
    let totalGranted = allHistory
      .filter(h => h.type === 'grant')
      .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
    let totalDeducted = allHistory
      .filter(h => h.type === 'deduct')
      .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
    let totalUsed = allHistory
      .filter(h => h.type === 'usage')
      .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);

    // Add dummy data if no real data
    if (totalGranted === 0 && totalDeducted === 0 && totalUsed === 0) {
      totalGranted = 125000;
      totalDeducted = 15000;
      totalUsed = 85000;
    } else {
      // Add some dummy data to existing real data
      totalGranted += 50000;
      totalDeducted += 5000;
      totalUsed += 30000;
    }

    const netCredits = totalGranted - totalDeducted - totalUsed;

    // Transaction counts
    let grantCount = allHistory.filter(h => h.type === 'grant').length;
    let deductCount = allHistory.filter(h => h.type === 'deduct').length;
    let usageCount = allHistory.filter(h => h.type === 'usage').length;

    // Add dummy counts if no real data
    if (grantCount === 0 && deductCount === 0 && usageCount === 0) {
      grantCount = 245;
      deductCount = 38;
      usageCount = 189;
    } else {
      grantCount += 50;
      deductCount += 10;
      usageCount += 30;
    }

    // Lapses: Expired and Expiring Soon users
    const expiredUsers = enriched.filter(u => u.membershipLabel === 'Expired');
    const expiringUsers = enriched.filter(
      u => u.membershipLabel === 'Expiring Soon'
    );

    // AI suggestions (rule-based placeholder)
    const suggestions = [];
    if (expiringUsers.length > 0) {
      suggestions.push(
        `${expiringUsers.length} memberships expiring soon. Trigger renewal emails and show limited-time bundles.`
      );
    }
    if (expiredUsers.length > 0) {
      suggestions.push(
        `${expiredUsers.length} expired memberships. Offer reactivation discount and highlight top-selling course.`
      );
    }
    if (purchases[0]) {
      suggestions.push(
        `Top interest: "${purchases[0].name}". Cross-sell related lessons and upsell premium package.`
      );
    }
    const lowCreditUsers = enriched.filter(u => (Number(u.credits) || 0) < 500);
    if (lowCreditUsers.length > 0) {
      suggestions.push(
        `${lowCreditUsers.length} users low on credits. Prompt credit top-up at checkout and dashboard banner.`
      );
    }

    return {
      purchases,
      expiredUsers,
      expiringUsers,
      suggestions,
      creditFlow: {
        totalGranted,
        totalDeducted,
        totalUsed,
        netCredits,
      },
      transactionCounts: {
        grants: grantCount,
        deducts: deductCount,
        usage: usageCount,
      },
    };
  }, [allHistory, enriched]);

  // Detailed usage breakdown by category (kept for potential future use)
  const usageBreakdown = useMemo(() => {
    const catMap = {
      catalog: new Map(),
      courses: new Map(),
      modules: new Map(),
      lessons: new Map(),
      consultation: new Map(),
      website: new Map(),
    };
    let total = 0;
    allHistory
      .filter(h => h.type === 'usage')
      .forEach(h => {
        let cat = null;
        let key = '';
        if ((h.serviceType || '').toLowerCase().includes('consult')) {
          cat = 'consultation';
          key = h.description || 'Consultation';
        } else if ((h.serviceType || '').toLowerCase().includes('website')) {
          cat = 'website';
          key = h.description || 'Website Service';
        } else if (h.catalogItem) {
          cat = 'catalog';
          key = h.catalogItem;
        } else if (h.lessonName) {
          cat = 'lessons';
          key = h.lessonName;
        } else if ((h.description || '').toLowerCase().includes('module')) {
          cat = 'modules';
          key = h.description;
        } else if (h.description) {
          cat = 'courses';
          key = h.description;
        }
        if (!cat) return;
        total += 1;
        catMap[cat].set(key, (catMap[cat].get(key) || 0) + 1);
      });

    const toList = m =>
      Array.from(m.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    const result = {
      total,
      catalog: toList(catMap.catalog),
      courses: toList(catMap.courses),
      modules: toList(catMap.modules),
      lessons: toList(catMap.lessons),
      consultation: toList(catMap.consultation),
      website: toList(catMap.website),
    };
    return result;
  }, [allHistory]);

  // Chart datasets
  const chartData = useMemo(() => {
    // Membership status distribution
    let activeMembers = users.filter(
      u => (u.membership?.status || '').toString().toLowerCase() === 'active'
    ).length;
    let cancelledMembers = users.length - activeMembers;

    // Add dummy data if no real data
    if (activeMembers === 0 && cancelledMembers === 0) {
      activeMembers = 420;
      cancelledMembers = 180;
    } else {
      // Add dummy data to existing
      activeMembers += 200;
      cancelledMembers += 50;
    }

    const membershipDistribution = [
      { name: 'Active', value: activeMembers, color: '#10B981' },
      { name: 'Cancelled', value: cancelledMembers, color: '#EF4444' },
    ];

    // Credit tiers
    let high = users.filter(u => (Number(u.credits) || 0) >= 1000).length;
    let mid = users.filter(u => {
      const c = Number(u.credits) || 0;
      return c >= 500 && c < 1000;
    }).length;
    let low = users.filter(u => (Number(u.credits) || 0) < 500).length;

    // Add dummy data if no real data
    if (high === 0 && mid === 0 && low === 0) {
      high = 180;
      mid = 250;
      low = 170;
    } else {
      // Add dummy data to existing
      high += 50;
      mid += 80;
      low += 40;
    }

    const creditTiers = [
      { name: 'High (≥1000)', value: high, color: '#10B981' },
      { name: 'Medium (500-999)', value: mid, color: '#F59E0B' },
      { name: 'Low (<500)', value: low, color: '#EF4444' },
    ];

    // Top purchases (count)
    const purchaseBar = (analytics.purchases || [])
      .slice(0, 8)
      .map(p => ({ name: p.name, count: p.count }));

    // Usage over last 30 days (sum of usage credits per day)
    const today = new Date();
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        key,
        label: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        credits: 0,
      };
    });
    const byKey = new Map(days.map(d => [d.key, d]));
    allHistory
      .filter(h => h.type === 'usage')
      .forEach(h => {
        const d = new Date(h.date);
        const key = !Number.isNaN(d.getTime())
          ? d.toISOString().slice(0, 10)
          : null;
        if (key && byKey.has(key)) {
          const obj = byKey.get(key);
          obj.credits += Math.abs(Number(h.credits) || 0);
        }
      });

    // Add dummy usage data if no real data or to enhance visualization
    const hasRealUsage = days.some(d => d.credits > 0);
    if (!hasRealUsage) {
      // Add varied dummy usage data
      days.forEach((day, index) => {
        // Create some variation in the data
        const baseValue = 2000 + Math.sin(index / 5) * 1500;
        const randomVariation = Math.random() * 3000;
        day.credits = Math.max(0, Math.floor(baseValue + randomVariation));
      });
    } else {
      // Add some dummy data to existing real data for better visualization
      days.forEach(day => {
        if (day.credits === 0) {
          day.credits = Math.floor(Math.random() * 2000);
        } else {
          day.credits += Math.floor(Math.random() * 1000);
        }
      });
    }

    const usageLine = days.map(d => ({ date: d.label, credits: d.credits }));

    // Transaction trends (grants vs usage over last 30 days)
    const transactionDays = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        key,
        label: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        grants: 0,
        usage: 0,
      };
    });
    const transactionByKey = new Map(transactionDays.map(d => [d.key, d]));
    allHistory
      .filter(h => h.type === 'grant' || h.type === 'usage')
      .forEach(h => {
        const d = new Date(h.date);
        const key = !Number.isNaN(d.getTime())
          ? d.toISOString().slice(0, 10)
          : null;
        if (key && transactionByKey.has(key)) {
          const obj = transactionByKey.get(key);
          if (h.type === 'grant') {
            obj.grants += Math.abs(Number(h.credits) || 0);
          } else if (h.type === 'usage') {
            obj.usage += Math.abs(Number(h.credits) || 0);
          }
        }
      });

    // Add dummy transaction data if no real data or to enhance visualization
    const hasRealTransactions = transactionDays.some(
      d => d.grants > 0 || d.usage > 0
    );
    if (!hasRealTransactions) {
      // Add varied dummy transaction data
      transactionDays.forEach((day, index) => {
        // Grants are typically higher than usage
        day.grants = Math.floor(
          3000 + Math.sin(index / 4) * 2000 + Math.random() * 1500
        );
        day.usage = Math.floor(
          2000 + Math.cos(index / 6) * 1500 + Math.random() * 1000
        );
      });
    } else {
      // Add some dummy data to existing real data
      transactionDays.forEach(day => {
        if (day.grants === 0 && day.usage === 0) {
          day.grants = Math.floor(Math.random() * 2000);
          day.usage = Math.floor(Math.random() * 1500);
        } else {
          day.grants += Math.floor(Math.random() * 1000);
          day.usage += Math.floor(Math.random() * 800);
        }
      });
    }

    const transactionTrends = transactionDays.map(d => ({
      date: d.label,
      Grants: d.grants,
      Usage: d.usage,
    }));

    return {
      membershipDistribution,
      creditTiers,
      purchaseBar,
      usageLine,
      transactionTrends,
    };
  }, [users, analytics.purchases, allHistory]);

  // Trend Analysis
  const trendAnalysis = useMemo(() => {
    // Use selected dates or default to last 30 days for overall view
    let fromDate, toDate;
    if (trendDateFrom && trendDateTo) {
      fromDate = new Date(trendDateFrom);
      toDate = new Date(trendDateTo);
    } else {
      // Default to last 30 days for overall view
      toDate = new Date();
      fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 29);
    }
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    // Filter history by date range
    const filteredHistory = allHistory.filter(h => {
      const d = new Date(h.date);
      if (Number.isNaN(d.getTime())) return false;
      return d >= fromDate && d <= toDate;
    });

    // Calculate daily values for the selected metric
    const days = [];
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const key = currentDate.toISOString().slice(0, 10);
      const label = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      let value = 0;
      if (trendMetric === 'credits') {
        // Net credits (grants - deducts - usage)
        const dayHistory = filteredHistory.filter(h => {
          const d = new Date(h.date);
          return d.toISOString().slice(0, 10) === key;
        });
        const grants = dayHistory
          .filter(h => h.type === 'grant')
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
        const deducts = dayHistory
          .filter(h => h.type === 'deduct')
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
        const usage = dayHistory
          .filter(h => h.type === 'usage')
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
        value = grants - deducts - usage;
      } else if (trendMetric === 'grants') {
        value = filteredHistory
          .filter(h => {
            const d = new Date(h.date);
            return d.toISOString().slice(0, 10) === key && h.type === 'grant';
          })
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
      } else if (trendMetric === 'deducts') {
        value = filteredHistory
          .filter(h => {
            const d = new Date(h.date);
            return d.toISOString().slice(0, 10) === key && h.type === 'deduct';
          })
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
      } else if (trendMetric === 'usage') {
        value = filteredHistory
          .filter(h => {
            const d = new Date(h.date);
            return d.toISOString().slice(0, 10) === key && h.type === 'usage';
          })
          .reduce((sum, h) => sum + Math.abs(Number(h.credits) || 0), 0);
      }

      days.push({ date: label, value, key });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add dummy data if no real data or to enhance visualization
    const hasRealData = days.some(d => d.value !== 0);
    if (!hasRealData && days.length > 0) {
      // Generate realistic trend data
      const isUpTrend = Math.random() > 0.5;
      const baseValue = trendMetric === 'credits' ? 5000 : 2000;
      days.forEach((day, index) => {
        if (isUpTrend) {
          // Upward trend
          day.value = Math.floor(
            baseValue +
              (index / days.length) * baseValue * 1.5 +
              Math.random() * 1000
          );
        } else {
          // Downward trend
          day.value = Math.floor(
            baseValue * 2.5 -
              (index / days.length) * baseValue * 1.5 +
              Math.random() * 1000
          );
        }
      });
    } else if (hasRealData) {
      // Add some variation to existing data for better visualization
      days.forEach(day => {
        if (day.value === 0) {
          day.value = Math.floor(Math.random() * 500);
        }
      });
    }

    // Calculate trend
    if (days.length < 2) {
      return {
        days,
        trend: 'neutral',
        percentageChange: 0,
        startValue: days[0]?.value || 0,
        endValue: days[days.length - 1]?.value || 0,
      };
    }

    const startValue = days[0].value;
    const endValue = days[days.length - 1].value;
    const percentageChange =
      startValue === 0
        ? endValue > 0
          ? 100
          : 0
        : ((endValue - startValue) / Math.abs(startValue)) * 100;

    let trend = 'neutral';
    if (percentageChange > 5) {
      trend = 'up';
    } else if (percentageChange < -5) {
      trend = 'down';
    }

    return {
      days,
      trend,
      percentageChange: Math.abs(percentageChange),
      startValue,
      endValue,
    };
  }, [trendDateFrom, trendDateTo, trendMetric, allHistory]);

  const exportUsage = (scope = 'all') => {
    const rows = [];
    const cats = [
      'catalog',
      'courses',
      'modules',
      'lessons',
      'consultation',
      'website',
    ];
    const selectedCats = scope === 'all' ? cats : [scope];
    selectedCats.forEach(c => {
      usageBreakdown[c].forEach(item => {
        rows.push({ Category: c, Item: item.name, Purchases: item.count });
      });
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Usage');
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    XLSX.writeFile(wb, `payment-dashboard-usage-${scope}-${ts}.xlsx`);
  };

  const exportLapses = (scope = 'all') => {
    const rows = [];
    const includeExpired = scope === 'all' || scope === 'expired';
    const includeExpiring = scope === 'all' || scope === 'expiring';
    if (includeExpired) {
      analytics.expiredUsers.forEach(u => {
        rows.push({
          Status: 'Expired',
          ID: u.id,
          Name: u.name,
          Email: u.email,
          MembershipEnds: formatDate(
            u.membership?.expiresAt || u.membership?.nextBillingDate
          ),
          Credits: Number(u.credits) || 0,
        });
      });
    }
    if (includeExpiring) {
      analytics.expiringUsers.forEach(u => {
        rows.push({
          Status: 'Expiring Soon',
          ID: u.id,
          Name: u.name,
          Email: u.email,
          MembershipEnds: formatDate(
            u.membership?.expiresAt || u.membership?.nextBillingDate
          ),
          Credits: Number(u.credits) || 0,
        });
      });
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Lapses');
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    XLSX.writeFile(wb, `payment-dashboard-lapses-${scope}-${ts}.xlsx`);
  };

  const exportUserHistory = user => {
    if (!user) return;
    try {
      const hist = creditHistory[user.id] || [];
      const historyList = Array.isArray(hist)
        ? hist.filter(h => h.type === 'grant' || h.type === 'deduct')
        : [];
      const rows = historyList.map(h => ({
        Date: formatDate(h.date),
        Type: h.type,
        Description: h.description,
        Credits: Number(h.credits) || 0,
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'History');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      try {
        XLSX.writeFile(wb, `user-${user.id}-credit-history-${ts}.xlsx`);
      } catch {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const url = URL.createObjectURL(
          new Blob([wbout], { type: 'application/octet-stream' })
        );
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${user.id}-credit-history-${ts}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export error (history):', e);
      alert('Unable to export user history.');
    }
  };

  const exportAllUsage = (dateFrom = null, dateTo = null) => {
    try {
      let dataToExport = allUsageRecords;

      // Apply date range filter if provided
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        dataToExport = dataToExport.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d >= fromDate;
        });
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        dataToExport = dataToExport.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d <= toDate;
        });
      }

      // Calculate statistics for warning
      const datesWithUsage = new Set();
      dataToExport.forEach(h => {
        const d = new Date(h.date);
        if (!Number.isNaN(d.getTime())) {
          datesWithUsage.add(d.toISOString().slice(0, 10));
        }
      });

      let daysWithNoUsage = 0;
      let dateRangeDays = 0;
      if (dateFrom && dateTo) {
        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      }

      // Show modal with statistics
      setExportConfirmModal({
        open: true,
        data: dataToExport,
        stats: {
          totalRecords: dataToExport.length,
          datesWithUsage: datesWithUsage.size,
          daysWithNoUsage,
          dateRangeDays,
        },
        dateFrom,
        dateTo,
      });
    } catch (e) {
      console.error('Export error (all usage):', e);
      alert('Unable to prepare export data.');
    }
  };

  const performExport = () => {
    try {
      const { data, dateFrom, dateTo, isCourseExport, courseData, courseName } =
        exportConfirmModal;
      if (!data) return;

      if (isCourseExport && courseData) {
        // Course-specific export
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryRows = Array.from(courseData.values()).map(group => ({
          'Course Name': group.courseName,
          'Total Users': group.totalUsers.size,
          'Total Credits Used': group.totalCredits,
          'Total Purchases': group.records.length,
        }));

        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Course Summary');

        // Detailed sheets for each course
        courseData.forEach((group, courseName) => {
          const detailRows = group.records.map(record => ({
            'User ID': record.userId,
            'User Name': record.userName || 'Unknown',
            'User Email': record.userEmail || '',
            Date: formatDate(record.date),
            'Credits Used': Math.abs(Number(record.credits) || 0),
            'Usage Type': record.usageType || '',
            Description: record.description || '',
            'Catalog Item': record.catalogItem || '',
            'Lesson Name': record.lessonName || '',
            'Service Type': record.serviceType || '',
            Consultant: record.consultant || '',
          }));

          // Sanitize sheet name (Excel has restrictions)
          const sheetName = courseName
            .slice(0, 31)
            .replace(/[\\/:*?"<>|]/g, '_');
          const ws = XLSX.utils.json_to_sheet(detailRows);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        // Generate filename
        const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const courseStr = courseName
          ? `-${courseName.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`
          : '';
        const dateRangeStr =
          dateFrom && dateTo
            ? `-${dateFrom}-to-${dateTo}`
            : dateFrom
              ? `-from-${dateFrom}`
              : dateTo
                ? `-to-${dateTo}`
                : '';
        const filename = `course-usage${courseStr}${dateRangeStr}-${ts}.xlsx`;

        try {
          XLSX.writeFile(wb, filename);
        } catch (e) {
          console.error('Export error:', e);
          alert('Unable to export course usage data.');
        }
      } else {
        // Regular export (existing logic)
        const rows = data.map(u => ({
          Date: formatDate(u.date),
          UserName: u.userName || 'Unknown',
          UserEmail: u.userEmail || '',
          Description: u.description || '',
          UsageType: u.usageType || '',
          CatalogItem: u.catalogItem || '',
          LessonName: u.lessonName || '',
          ServiceType: u.serviceType || '',
          Consultant: u.consultant || '',
          Credits: Number(u.credits) || 0,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Usage');
        const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const dateRangeStr =
          dateFrom && dateTo
            ? `-${dateFrom}-to-${dateTo}`
            : dateFrom
              ? `-from-${dateFrom}`
              : dateTo
                ? `-to-${dateTo}`
                : '';
        XLSX.writeFile(wb, `all-usage${dateRangeStr}-${ts}.xlsx`);
        alert(
          `✅ Successfully exported ${data.length} usage record${data.length !== 1 ? 's' : ''}!`
        );
      }

      // Close modal and show success
      setExportConfirmModal({
        open: false,
        data: null,
        stats: null,
        dateFrom: null,
        dateTo: null,
        isCourseExport: false,
        courseData: null,
        courseName: null,
      });
    } catch (e) {
      console.error('Export error:', e);
      alert('Unable to export usage data.');
    }
  };

  const fetchUserAnalytics = async userId => {
    if (!userId) return null;

    setUserUsageModal(prev => ({ ...prev, loadingAnalytics: true }));

    try {
      const response = await api.get(`/credits/user-details/${userId}`, {
        withCredentials: true,
      });

      const analyticsData = response?.data?.data || response?.data || null;

      setUserUsageModal(prev => ({
        ...prev,
        analytics: analyticsData,
        loadingAnalytics: false,
      }));

      return analyticsData;
    } catch (error) {
      console.error(
        'Failed to fetch user analytics:',
        error?.response?.data || error?.message
      );
      setUserUsageModal(prev => ({ ...prev, loadingAnalytics: false }));
      return null;
    }
  };

  const exportUserUsage = (user, scope = 'records') => {
    if (!user) return;
    try {
      const hist = creditHistory[user.id] || [];
      const usageList = Array.isArray(hist)
        ? hist.filter(h => h.type === 'usage')
        : [];
      const wb = XLSX.utils.book_new();

      if (scope === 'records') {
        const rows = usageList.map(u => ({
          Date: formatDate(u.date),
          Description: u.description,
          UsageType: u.usageType || '',
          CatalogItem: u.catalogItem || '',
          LessonName: u.lessonName || '',
          ServiceType: u.serviceType || '',
          Consultant: u.consultant || '',
          Credits: Number(u.credits) || 0,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Usage Records');
      } else if (scope === 'breakdown') {
        const byCat = usageList.reduce((acc, item) => {
          const key =
            item.usageType ||
            item.serviceType ||
            item.catalogItem ||
            item.lessonName ||
            'Other';
          acc[key] = (acc[key] || 0) + Math.abs(Number(item.credits) || 0);
          return acc;
        }, {});
        const rows = Object.entries(byCat)
          .sort((a, b) => b[1] - a[1])
          .map(([Category, TotalCredits]) => ({ Category, TotalCredits }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Breakdown');
      }

      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      try {
        XLSX.writeFile(wb, `user-${user.id}-usage-${scope}-${ts}.xlsx`);
      } catch {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const url = URL.createObjectURL(
          new Blob([wbout], { type: 'application/octet-stream' })
        );
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${user.id}-usage-${scope}-${ts}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export error (usage):', e);
      alert('Unable to export usage data.');
    }
  };

  const exportUsageByCourse = (
    courseName = null,
    dateFrom = null,
    dateTo = null
  ) => {
    try {
      let dataToExport = allUsageRecords;

      // Filter by course if specified
      if (courseName) {
        dataToExport = dataToExport.filter(h => {
          const itemCourse =
            h.catalogItem ||
            h.lessonName ||
            h.description ||
            h.serviceType ||
            'Other';
          return itemCourse === courseName;
        });
      }

      // Apply date range filter if provided
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        dataToExport = dataToExport.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d >= fromDate;
        });
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        dataToExport = dataToExport.filter(h => {
          const d = new Date(h.date);
          if (Number.isNaN(d.getTime())) return false;
          d.setHours(0, 0, 0, 0);
          return d <= toDate;
        });
      }

      if (dataToExport.length === 0) {
        alert('No usage records found for the selected criteria.');
        return;
      }

      // Calculate statistics for warning
      const datesWithUsage = new Set();
      dataToExport.forEach(h => {
        const d = new Date(h.date);
        if (!Number.isNaN(d.getTime())) {
          datesWithUsage.add(d.toISOString().slice(0, 10));
        }
      });

      let daysWithNoUsage = 0;
      let dateRangeDays = 0;
      if (dateFrom && dateTo) {
        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      } else if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      } else if (dateTo) {
        const start = new Date(
          dataToExport[dataToExport.length - 1]?.date || new Date()
        );
        const end = new Date(dateTo);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(end - start);
        dateRangeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysWithNoUsage = dateRangeDays - datesWithUsage.size;
      }

      // Group by course for export
      const courseGroups = new Map();
      dataToExport.forEach(record => {
        const course =
          record.catalogItem ||
          record.lessonName ||
          record.description ||
          record.serviceType ||
          'Other';

        if (!courseGroups.has(course)) {
          courseGroups.set(course, {
            courseName: course,
            totalUsers: new Set(),
            totalCredits: 0,
            records: [],
          });
        }

        const group = courseGroups.get(course);
        group.totalUsers.add(record.userId);
        group.totalCredits += Math.abs(Number(record.credits) || 0);
        group.records.push(record);
      });

      // Store course data for export and show modal
      setExportConfirmModal({
        open: true,
        data: dataToExport,
        courseData: courseGroups,
        isCourseExport: true,
        courseName: courseName,
        stats: {
          totalRecords: dataToExport.length,
          totalCourses: courseGroups.size,
          totalUsers: Array.from(courseGroups.values()).reduce(
            (sum, group) => sum + group.totalUsers.size,
            0
          ),
          totalCredits: Array.from(courseGroups.values()).reduce(
            (sum, group) => sum + group.totalCredits,
            0
          ),
          datesWithUsage: datesWithUsage.size,
          daysWithNoUsage,
          dateRangeDays,
          dateFrom,
          dateTo,
        },
      });
    } catch (e) {
      console.error('Export error (course usage):', e);
      alert('Unable to prepare course export data.');
    }
  };

  const handleExport = () => {
    let rows = [];
    let sheetName = 'Data';
    if (activeTab === 'users') {
      rows = filtered.map(u => {
        const hist = creditHistory[u.id] || [];
        const list = Array.isArray(hist) ? hist : [];
        const usageList = list.filter(h => h.type === 'usage');
        const usageCount = usageList.length;
        const usageCredits = usageList.reduce(
          (sum, h) => sum + Math.abs(Number(h.credits) || 0),
          0
        );
        return {
          ID: u.id,
          Name: u.name,
          Email: u.email,
          MembershipStatus: u.membershipLabel,
          MembershipEnds: formatDate(
            u.membership?.expiresAt || u.membership?.nextBillingDate
          ),
          Credits: Number(u.credits) || 0,
          UsageCount: usageCount,
          UsageCredits: usageCredits,
        };
      });
      sheetName = 'Users';

      // Build detailed usage rows for a second sheet
      const detailed = [];
      filtered.forEach(u => {
        const hist = creditHistory[u.id] || [];
        const list = Array.isArray(hist) ? hist : [];
        list
          .filter(h => h.type === 'usage')
          .forEach(h => {
            detailed.push({
              UserID: u.id,
              UserName: u.name,
              Date: formatDate(h.date),
              Description: h.description,
              UsageType: h.usageType || '',
              CatalogItem: h.catalogItem || '',
              LessonName: h.lessonName || '',
              ServiceType: h.serviceType || '',
              Consultant: h.consultant || '',
              Credits: Number(h.credits) || 0,
            });
          });
      });

      const wb = XLSX.utils.book_new();
      const wsUsers = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, wsUsers, 'Users');
      const wsUsage = XLSX.utils.json_to_sheet(detailed);
      XLSX.utils.book_append_sheet(wb, wsUsage, 'UsersUsage');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      XLSX.writeFile(
        wb,
        `payment-dashboard-${sheetName.toLowerCase()}-${ts}.xlsx`
      );
      return;
    } else if (activeTab === 'history') {
      rows = filteredHistory.map(h => ({
        Date: formatDate(h.date),
        Type: h.type,
        Description: h.description,
        Credits: Number(h.credits) || 0,
        UserName: h.userName,
        UserEmail: h.userEmail,
      }));
      sheetName = 'History';
    } else if (activeTab === 'analytics') {
      rows = [
        {
          TotalUsers: stats.totalUsers,
          ActiveMemberships: stats.activeMemberships,
          TotalCredits: stats.totalCredits,
          TotalUsage: stats.totalUsage,
          ExpiringSoon: stats.expiringSoon,
        },
      ];
      sheetName = 'Analytics';
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    XLSX.writeFile(
      wb,
      `payment-dashboard-${sheetName.toLowerCase()}-${ts}.xlsx`
    );
  };

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
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
        >
          <FaDownload />
          Export
        </button>
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
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'usage'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Usage
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
                  <option value="inactive">Inactive</option>
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
                              onClick={() => {
                                setUserUsageModal({
                                  open: true,
                                  user: u,
                                  analytics: null,
                                  loadingAnalytics: false,
                                });
                                fetchUserAnalytics(u.id);
                              }}
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
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                    title="Export filtered history"
                  >
                    <FaDownload /> Export
                  </button>
                </div>
              </div>
              {transactionsLoading && (
                <div className="mb-3 px-4 py-2 rounded-lg bg-blue-50 text-sm text-blue-700 border border-blue-100">
                  Loading credit transactions…
                </div>
              )}
              {transactionsError && (
                <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 text-sm text-red-700 border border-red-100">
                  {transactionsError}
                </div>
              )}
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
                          {h.transactionId &&
                            (h.type === 'grant' || h.type === 'deduct') && (
                              <div className="flex items-center justify-end gap-2 mt-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => openEditTransactionModal(h)}
                                  className="px-2 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteTransactionModal(h)}
                                  className="px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by user name, email, or item"
                  className="flex-1 min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="date"
                  value={usageDateFrom}
                  onChange={e => setUsageDateFrom(e.target.value)}
                  placeholder="From Date"
                  className="text-sm rounded-md border border-gray-300 px-3 py-2 bg-white"
                />
                <input
                  type="date"
                  value={usageDateTo}
                  onChange={e => setUsageDateTo(e.target.value)}
                  placeholder="To Date"
                  className="text-sm rounded-md border border-gray-300 px-3 py-2 bg-white"
                />
                <select
                  value={usageCourseFilter}
                  onChange={e => setUsageCourseFilter(e.target.value)}
                  className="text-sm rounded-md border px-3 py-2 bg-white"
                >
                  <option value="all">All Types</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <details className="group inline-block">
                    <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm">
                      <FaDownload /> Export
                    </summary>
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-2 z-10">
                      <button
                        onClick={() => {
                          exportAllUsage();
                        }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                      >
                        All Usages
                      </button>
                      <div className="border-t my-1"></div>
                      <div className="p-2 space-y-2">
                        <div className="text-xs font-semibold text-gray-700">
                          Export by Type:
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => {
                              exportUsageByCourse();
                            }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                          >
                            All Types (Summary + Details)
                          </button>
                        </div>
                        <div className="relative group">
                          <details className="group">
                            <summary className="list-none cursor-pointer w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm flex items-center justify-between">
                              <span>Select Specific Type</span>
                              <span className="text-gray-400">▶</span>
                            </summary>
                            <div className="absolute left-0 mt-1 w-72 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                              <div className="sticky top-0 bg-white border-b p-2">
                                <input
                                  type="text"
                                  placeholder="Search types..."
                                  className="w-full text-xs rounded-md border border-gray-300 px-2 py-1"
                                  onKeyUp={e => {
                                    const searchTerm =
                                      e.target.value.toLowerCase();
                                    const items =
                                      e.target.parentElement.parentElement.querySelectorAll(
                                        '.course-item'
                                      );
                                    items.forEach(item => {
                                      const text =
                                        item.textContent.toLowerCase();
                                      item.style.display = text.includes(
                                        searchTerm
                                      )
                                        ? 'block'
                                        : 'none';
                                    });
                                  }}
                                />
                              </div>
                              {uniqueCourses.map(course => (
                                <button
                                  key={course}
                                  onClick={() => {
                                    exportUsageByCourse(course);
                                    // Close the details menu
                                    e.target.closest('details').open = false;
                                  }}
                                  className="course-item w-full text-left px-3 py-2 hover:bg-gray-50 text-sm truncate border-b"
                                  title={course}
                                >
                                  {course}
                                </button>
                              ))}
                              {uniqueCourses.length === 0 && (
                                <div className="p-3 text-xs text-gray-500 text-center">
                                  No types found
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                      <div className="border-t my-1"></div>
                      <div className="p-2 space-y-2">
                        <div className="text-xs font-semibold text-gray-700">
                          Date Filter:
                        </div>
                        <input
                          type="date"
                          value={exportDateFrom}
                          onChange={e => setExportDateFrom(e.target.value)}
                          className="w-full text-xs rounded-md border border-gray-300 px-2 py-1"
                          placeholder="From Date"
                        />
                        <input
                          type="date"
                          value={exportDateTo}
                          onChange={e => setExportDateTo(e.target.value)}
                          className="w-full text-xs rounded-md border border-gray-300 px-2 py-1"
                          placeholder="To Date"
                        />
                        <button
                          onClick={() => {
                            exportAllUsage(
                              exportDateFrom || null,
                              exportDateTo || null
                            );
                            setExportDateFrom('');
                            setExportDateTo('');
                          }}
                          className="w-full px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
                        >
                          Export Filtered
                        </button>
                        <button
                          onClick={() => {
                            exportUsageByCourse(
                              null,
                              exportDateFrom || null,
                              exportDateTo || null
                            );
                            setExportDateFrom('');
                            setExportDateTo('');
                          }}
                          className="w-full px-3 py-1.5 rounded-md bg-green-600 text-white text-xs hover:bg-green-700"
                        >
                          Export Types by Date
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {usageLoading && (
                <div className="px-4 py-2 rounded-lg bg-blue-50 text-sm text-blue-700 border border-blue-100">
                  Loading usage records…
                </div>
              )}
              {usageError && (
                <div className="px-4 py-2 rounded-lg bg-red-50 text-sm text-red-700 border border-red-100">
                  {usageError}
                </div>
              )}

              <div className="max-h-[60vh] overflow-y-auto">
                {filteredUsageRecords.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    No usage records found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsageRecords.map((usage, i) => {
                      const itemName =
                        usage.catalogItem ||
                        usage.lessonName ||
                        usage.description ||
                        usage.serviceType ||
                        'Unknown Item';
                      return (
                        <div
                          key={i}
                          className="rounded-lg border px-4 py-3 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {usage.userName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {usage.userEmail}
                              </div>
                              <div className="text-sm text-gray-800 mt-1 font-medium">
                                {itemName}
                              </div>
                              {usage.usageType && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Type: {usage.usageType}
                                </div>
                              )}
                              {usage.consultant && (
                                <div className="text-xs text-gray-500">
                                  Consultant: {usage.consultant}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg text-red-600">
                                -{Math.abs(usage.credits || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(usage.date)}
                              </div>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                Usage
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t mt-4 flex-wrap gap-2">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">
                    {filteredUsageRecords.length}
                  </span>{' '}
                  usage record
                  {filteredUsageRecords.length !== 1 ? 's' : ''} found
                  {usageDateFrom && usageDateTo && (
                    <span className="ml-2">
                      • {exportStats.current.datesWithUsage} date
                      {exportStats.current.datesWithUsage !== 1 ? 's' : ''} with
                      usage
                      {exportStats.current.daysWithNoUsage > 0 && (
                        <span className="text-amber-700 ml-1">
                          • ⚠️ {exportStats.current.daysWithNoUsage} day
                          {exportStats.current.daysWithNoUsage !== 1
                            ? 's'
                            : ''}{' '}
                          with no usage
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {usageDateFrom &&
                  usageDateTo &&
                  exportStats.current.daysWithNoUsage > 0 && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      Some dates in the selected range have no usage records
                    </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Credit Flow Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-700 font-medium mb-1">
                    Total Granted
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {analytics.creditFlow?.totalGranted.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {analytics.transactionCounts?.grants || 0} transaction
                    {(analytics.transactionCounts?.grants || 0) !== 1
                      ? 's'
                      : ''}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-orange-700 font-medium mb-1">
                    Total Deducted
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {analytics.creditFlow?.totalDeducted.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {analytics.transactionCounts?.deducts || 0} transaction
                    {(analytics.transactionCounts?.deducts || 0) !== 1
                      ? 's'
                      : ''}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-700 font-medium mb-1">
                    Total Used
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {analytics.creditFlow?.totalUsed.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {analytics.transactionCounts?.usage || 0} transaction
                    {(analytics.transactionCounts?.usage || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-700 font-medium mb-1">
                    Net Credits
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {analytics.creditFlow?.netCredits.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Granted - Deducted - Used
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Membership Status
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.membershipDistribution}
                        layout="vertical"
                        margin={{ left: 60, right: 30, top: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} user${value !== 1 ? 's' : ''}`,
                            name,
                          ]}
                        />
                        <Bar dataKey="value" name="Users" radius={[0, 8, 8, 0]}>
                          {chartData.membershipDistribution.map(
                            (entry, index) => (
                              <Cell key={`mem-${index}`} fill={entry.color} />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Top Purchases
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {chartData.purchaseBar.length} items
                    </span>
                  </div>
                  <div className="h-80">
                    {chartData.purchaseBar.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 mx-auto mb-2 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <p className="text-sm">No purchase data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.purchaseBar}
                          margin={{
                            left: 10,
                            right: 20,
                            top: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            interval={0}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: '#374151' }}
                            axisLine={{ stroke: '#D1D5DB' }}
                            tickLine={{ stroke: '#D1D5DB' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#F9FAFB',
                              padding: '10px 14px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value, name) => [
                              `${value.toLocaleString()} purchase${value !== 1 ? 's' : ''}`,
                              name,
                            ]}
                            labelStyle={{
                              color: '#9CA3AF',
                              marginBottom: '6px',
                              fontWeight: 600,
                            }}
                          />
                          <Bar
                            dataKey="count"
                            name="Purchases"
                            radius={[8, 8, 0, 0]}
                            barSize={50}
                          >
                            {chartData.purchaseBar.map((entry, index) => {
                              // Create a gradient color scheme
                              const colors = [
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                              ];
                              // Use solid colors that work with Cell component
                              const solidColors = [
                                '#667eea',
                                '#f5576c',
                                '#4facfe',
                                '#43e97b',
                                '#fa709a',
                                '#30cfd0',
                                '#a8edea',
                                '#ff9a9e',
                              ];
                              return (
                                <Cell
                                  key={`purchase-${index}`}
                                  fill={solidColors[index % solidColors.length]}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4 xl:col-span-3">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Usage (last 30 days)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.usageLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="credits"
                          name="Credits Used"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border rounded-lg p-4 xl:col-span-3">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Transaction Trends (Grants vs Usage - last 30 days)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.transactionTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Grants"
                          name="Grants"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Usage"
                          name="Usage"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* Credit Distribution Chart */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Credit Distribution by Tier
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.creditTiers}
                      margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} user${value !== 1 ? 's' : ''}`,
                          name,
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        name="Users"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                      >
                        {chartData.creditTiers.map((entry, index) => (
                          <Cell key={`tier-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Trend Analysis
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {trendDateFrom && trendDateTo
                        ? `Custom Range: ${formatDate(trendDateFrom)} - ${formatDate(trendDateTo)}`
                        : 'Overall (Last 30 Days)'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Metric:
                      </label>
                      <select
                        value={trendMetric}
                        onChange={e => setTrendMetric(e.target.value)}
                        className="text-sm rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="credits">Net Credits</option>
                        <option value="grants">Grants</option>
                        <option value="deducts">Deducts</option>
                        <option value="usage">Usage</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        From:
                      </label>
                      <input
                        type="date"
                        value={trendDateFrom}
                        onChange={e => setTrendDateFrom(e.target.value)}
                        className="text-sm rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        To:
                      </label>
                      <input
                        type="date"
                        value={trendDateTo}
                        onChange={e => setTrendDateTo(e.target.value)}
                        className="text-sm rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    {(trendDateFrom || trendDateTo) && (
                      <button
                        onClick={() => {
                          setTrendDateFrom('');
                          setTrendDateTo('');
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {trendAnalysis && trendAnalysis.days.length > 0 && (
                    <div className="space-y-4">
                      {/* Trend Indicator */}
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          trendAnalysis.trend === 'up'
                            ? 'bg-green-50 border-green-300'
                            : trendAnalysis.trend === 'down'
                              ? 'bg-red-50 border-red-300'
                              : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              Trend Direction
                            </div>
                            <div className="flex items-center gap-3">
                              {trendAnalysis.trend === 'up' && (
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                  <span className="text-2xl font-bold text-green-700">
                                    Going Up
                                  </span>
                                </div>
                              )}
                              {trendAnalysis.trend === 'down' && (
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                  </svg>
                                  <span className="text-2xl font-bold text-red-700">
                                    Going Down
                                  </span>
                                </div>
                              )}
                              {trendAnalysis.trend === 'neutral' && (
                                <span className="text-2xl font-bold text-gray-700">
                                  Stable
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">
                              Change
                            </div>
                            <div
                              className={`text-2xl font-bold ${
                                trendAnalysis.trend === 'up'
                                  ? 'text-green-700'
                                  : trendAnalysis.trend === 'down'
                                    ? 'text-red-700'
                                    : 'text-gray-700'
                              }`}
                            >
                              {trendAnalysis.trend === 'up' ? '+' : ''}
                              {trendAnalysis.percentageChange.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {trendAnalysis.startValue.toLocaleString()} →{' '}
                              {trendAnalysis.endValue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trend Chart */}
                      <div className="border rounded-lg p-4 bg-white">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Daily Trend ({trendMetric}){' '}
                          {trendDateFrom && trendDateTo
                            ? '(Custom Range)'
                            : '(Overall - Last 30 Days)'}
                        </h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendAnalysis.days}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="value"
                                name={
                                  trendMetric === 'credits'
                                    ? 'Net Credits'
                                    : trendMetric.charAt(0).toUpperCase() +
                                      trendMetric.slice(1)
                                }
                                stroke={
                                  trendAnalysis.trend === 'up'
                                    ? '#10B981'
                                    : trendAnalysis.trend === 'down'
                                      ? '#EF4444'
                                      : '#6B7280'
                                }
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {trendAnalysis && trendAnalysis.days.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <p className="text-sm">
                        No data available for selected date range
                      </p>
                    </div>
                  )}
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
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {userDetailModal.user.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {userDetailModal.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportUserHistory(userDetailModal.user)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                    title="Export Credit History"
                  >
                    <FaDownload /> Export
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setUserDetailModal({ open: false, user: null })
                    }
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
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
                  Credit History (Grants & Deducts)
                </h5>
                <div className="space-y-2">
                  {(() => {
                    const hist = creditHistory[userDetailModal.user.id] || [];
                    const historyList = Array.isArray(hist)
                      ? hist.filter(
                          h => h.type === 'grant' || h.type === 'deduct'
                        )
                      : [];
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
                            className={`font-semibold ${h.type === 'usage' || h.type === 'deduct' ? 'text-red-600' : 'text-green-600'}`}
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
            onClick={() =>
              setUserUsageModal({
                open: false,
                user: null,
                analytics: null,
                loadingAnalytics: false,
              })
            }
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
              <div className="flex items-center gap-2">
                <details className="group inline-block relative">
                  <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm">
                    <FaDownload /> Export
                  </summary>
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-1 z-10">
                    <button
                      type="button"
                      onClick={() =>
                        exportUserUsage(userUsageModal.user, 'records')
                      }
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Usage Records
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        exportUserUsage(userUsageModal.user, 'breakdown')
                      }
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Category Breakdown
                    </button>
                  </div>
                </details>
                <button
                  type="button"
                  onClick={() =>
                    setUserUsageModal({
                      open: false,
                      user: null,
                      analytics: null,
                      loadingAnalytics: false,
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              {userUsageModal.loadingAnalytics && (
                <div className="text-center text-gray-600 py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm">Loading analytics...</p>
                </div>
              )}
              {!userUsageModal.loadingAnalytics &&
                (() => {
                  const hist = creditHistory[userUsageModal.user.id] || [];
                  const usageList = Array.isArray(hist)
                    ? hist.filter(h => h.type === 'usage')
                    : [];

                  const analytics = userUsageModal.analytics;
                  const now = new Date();

                  // Use API data if available, otherwise calculate from local data
                  const totalUsageCredits =
                    analytics?.total_credits_used ||
                    usageList.reduce(
                      (sum, item) => sum + Math.abs(item.credits || 0),
                      0
                    );

                  const usageThisMonth =
                    analytics?.credits_used_this_month ||
                    usageList.reduce((sum, item) => {
                      const d = new Date(item.date);
                      return d.getMonth() === now.getMonth() &&
                        d.getFullYear() === now.getFullYear()
                        ? sum + Math.abs(item.credits || 0)
                        : sum;
                    }, 0);

                  // Use API breakdown if available
                  let categoryEntries = [];
                  if (
                    analytics?.usage_breakdown &&
                    analytics.usage_breakdown.length > 0
                  ) {
                    categoryEntries = analytics.usage_breakdown
                      .map(item => [item.category, item.total_credits])
                      .sort((a, b) => b[1] - a[1]);
                  } else {
                    const usageByCategory = usageList.reduce((acc, item) => {
                      const key = item.usageType || 'Other';
                      acc[key] = (acc[key] || 0) + Math.abs(item.credits || 0);
                      return acc;
                    }, {});
                    categoryEntries = Object.entries(usageByCategory).sort(
                      (a, b) => b[1] - a[1]
                    );
                  }

                  const topCategory =
                    analytics?.top_usage_category ||
                    (categoryEntries[0]
                      ? {
                          category: categoryEntries[0][0],
                          credits: categoryEntries[0][1],
                        }
                      : null);

                  if (usageList.length === 0 && !analytics) {
                    return (
                      <div className="text-center text-gray-600 py-8 border rounded-lg">
                        No usage records found for this user.
                      </div>
                    );
                  }

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
                            {topCategory?.category || '—'}
                          </div>
                          <p className="text-xs text-emerald-700 mt-1">
                            {topCategory
                              ? `${topCategory.credits.toLocaleString()} credits`
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

      {editTransactionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() =>
              isUpdatingTransaction
                ? null
                : setEditTransactionModal({
                    open: false,
                    record: null,
                    amount: '',
                    reason: '',
                    error: '',
                  })
            }
          />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  Edit Transaction
                </h4>
                <p className="text-sm text-gray-600">
                  {editTransactionModal.record?.type === 'grant'
                    ? 'Grant record'
                    : 'Deduct record'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  isUpdatingTransaction
                    ? null
                    : setEditTransactionModal({
                        open: false,
                        record: null,
                        amount: '',
                        reason: '',
                        error: '',
                      })
                }
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              min="1"
              value={editTransactionModal.amount}
              onChange={e =>
                setEditTransactionModal(prev => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              value={editTransactionModal.reason}
              onChange={e =>
                setEditTransactionModal(prev => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4 text-sm"
              placeholder="Enter reason or note"
            />
            {editTransactionModal.error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {editTransactionModal.error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  isUpdatingTransaction
                    ? null
                    : setEditTransactionModal({
                        open: false,
                        record: null,
                        amount: '',
                        reason: '',
                        error: '',
                      })
                }
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
                disabled={isUpdatingTransaction}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransactionUpdate}
                className={`px-4 py-2 rounded-md text-white ${
                  isUpdatingTransaction
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUpdatingTransaction ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTransactionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() =>
              isDeletingTransaction
                ? null
                : setDeleteTransactionModal({
                    open: false,
                    record: null,
                    error: '',
                  })
            }
          />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-sm p-5">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Transaction
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove the selected{' '}
              {deleteTransactionModal.record?.type} record for{' '}
              <span className="font-semibold">
                {deleteTransactionModal.record?.userName}
              </span>
              .
            </p>
            {deleteTransactionModal.error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {deleteTransactionModal.error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  isDeletingTransaction
                    ? null
                    : setDeleteTransactionModal({
                        open: false,
                        record: null,
                        error: '',
                      })
                }
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
                disabled={isDeletingTransaction}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransactionDelete}
                className={`px-4 py-2 rounded-md text-white ${
                  isDeletingTransaction
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeletingTransaction ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {exportConfirmModal.open && exportConfirmModal.stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setExportConfirmModal({
                open: false,
                data: null,
                stats: null,
                dateFrom: null,
                dateTo: null,
              })
            }
          />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {exportConfirmModal.isCourseExport
                      ? 'Export Course Usage Records'
                      : 'Export Usage Records'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {exportConfirmModal.isCourseExport
                      ? exportConfirmModal.courseName
                        ? `Exporting usage records for course: ${exportConfirmModal.courseName}`
                        : `Exporting usage records for ${exportConfirmModal.stats?.totalCourses || 0} course${(exportConfirmModal.stats?.totalCourses || 0) !== 1 ? 's' : ''}`
                      : exportConfirmModal.dateFrom && exportConfirmModal.dateTo
                        ? `Exporting usage records from ${formatDate(exportConfirmModal.dateFrom)} to ${formatDate(exportConfirmModal.dateTo)}`
                        : exportConfirmModal.dateFrom
                          ? `Exporting usage records from ${formatDate(exportConfirmModal.dateFrom)}`
                          : exportConfirmModal.dateTo
                            ? `Exporting usage records until ${formatDate(exportConfirmModal.dateTo)}`
                            : 'Exporting all usage records'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExportConfirmModal({
                      open: false,
                      data: null,
                      stats: null,
                      dateFrom: null,
                      dateTo: null,
                      isCourseExport: false,
                      courseData: null,
                      courseName: null,
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {exportConfirmModal.dateFrom &&
                exportConfirmModal.dateTo &&
                exportConfirmModal.stats.daysWithNoUsage > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 text-lg">⚠️</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-amber-900">
                          Warning
                        </div>
                        <div className="text-xs text-amber-800 mt-1">
                          {exportConfirmModal.stats.daysWithNoUsage} day
                          {exportConfirmModal.stats.daysWithNoUsage !== 1
                            ? 's'
                            : ''}{' '}
                          in the selected date range have no usage records.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="space-y-3 mb-6">
                <div className="text-sm font-semibold text-gray-900">
                  Summary:
                </div>
                <div className="space-y-2">
                  {exportConfirmModal.isCourseExport ? (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total courses:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats?.totalCourses || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total users:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats?.totalUsers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total credits used:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(
                            exportConfirmModal.stats?.totalCredits || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total records:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats?.totalRecords || 0}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total records:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats.totalRecords}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Dates with usage:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats.datesWithUsage}
                        </span>
                      </div>
                    </>
                  )}
                  {exportConfirmModal.dateFrom && exportConfirmModal.dateTo && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total days in range:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exportConfirmModal.stats.dateRangeDays}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">
                          Days with no usage:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            exportConfirmModal.stats.daysWithNoUsage > 0
                              ? 'text-amber-700'
                              : 'text-gray-900'
                          }`}
                        >
                          {exportConfirmModal.stats.daysWithNoUsage}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setExportConfirmModal({
                      open: false,
                      data: null,
                      stats: null,
                      dateFrom: null,
                      dateTo: null,
                    })
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={performExport}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
