import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  Search,
  Eye,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  DollarSign,
  Bell,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/60',
      text: 'text-emerald-800 dark:text-emerald-100',
      border: 'border border-emerald-500/60',
      label: 'Paid',
    },
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/60',
      text: 'text-amber-800 dark:text-amber-50',
      border: 'border border-amber-500/60',
      label: 'Pending',
    },
    overdue: {
      bg: 'bg-rose-100 dark:bg-rose-900/60',
      text: 'text-rose-800 dark:text-rose-50',
      border: 'border border-rose-500/60',
      label: 'Overdue',
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border border-gray-500/40',
      label: 'Cancelled',
    },
  }[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border border-gray-400/40',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border || ''}`}
    >
      {statusConfig.label}
    </span>
  );
};

// Bill Detail Modal Component
const BillDetailModal = ({ bill, isOpen, onClose, onMarkAsPaid }) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!isOpen || !bill) return null;

  const handleMarkAsPaid = () => {
    if (paymentMethod.trim()) {
      onMarkAsPaid(bill.id, paymentMethod);
      setPaymentMethod('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bg.secondary }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border || 'rgba(255,255,255,0.1)' }}
        >
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Invoice {bill.invoiceNumber}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              Bill ID: {bill.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-10 rounded-lg transition-colors"
            style={{ color: colors.text.primary }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Amount
              </label>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                ${bill.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Status
              </label>
              <StatusBadge status={bill.status} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Description
            </label>
            <p
              style={{ color: colors.text.secondary }}
              className="text-sm leading-relaxed"
            >
              {bill.description}
            </p>
          </div>

          {/* Bill Details */}
          <div
            className="grid grid-cols-2 gap-4 p-4 rounded-lg"
            style={{ backgroundColor: colors.bg.primary }}
          >
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Organization
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {bill.organization}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Paid For
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {bill.paidFor}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Issued Date
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {new Date(bill.issuedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Due Date
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {new Date(bill.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Invoice Number
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {bill.invoiceNumber}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Space Used
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {bill.spaceUsed} GB
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Tokens
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {bill.tokenCount?.toLocaleString() ?? '—'} M
              </p>
            </div>
          </div>

          {/* Payment Section */}
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  color: colors.text.primary,
                }}
              >
                <option value="">Select payment method</option>
                <option value="credit-card">Credit Card</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          )}

          {bill.paymentMethod && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Payment Details
              </label>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.bg.primary }}
              >
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  <strong>Payment Method:</strong> {bill.paymentMethod}
                </p>
                {bill.paidDate && (
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.text.secondary }}
                  >
                    <strong>Paid Date:</strong>{' '}
                    {new Date(bill.paidDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{ borderColor: colors.border || 'rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.bg.primary,
              color: colors.text.primary,
              border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
            }}
          >
            Close
          </button>
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={!paymentMethod.trim()}
              className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
              }}
            >
              <CheckCircle className="inline mr-2" size={16} />
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Billing() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billingPeriod, setBillingPeriod] = useState('current');
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [revenueView, setRevenueView] = useState('month');
  const [monthView, setMonthView] = useState('all');

  // Mock data
  useEffect(() => {
    const today = new Date();
    const formatDate = date => date.toISOString().split('T')[0];
    const buildPeriod = offset => {
      const anchor = new Date(
        today.getFullYear(),
        today.getMonth() + offset,
        1
      );
      const dueDate = new Date(anchor.getFullYear(), anchor.getMonth(), 20);
      const issuedDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      return {
        slug: offset === 0 ? 'current' : 'previous',
        label: anchor.toLocaleDateString('default', {
          month: 'long',
          year: 'numeric',
        }),
        dueDate: formatDate(dueDate),
        issuedDate: formatDate(issuedDate),
      };
    };

    const currentPeriod = buildPeriod(0);
    const previousPeriod = buildPeriod(-1);

    const organizations = [
      {
        id: 'org-1',
        organization: 'Acme Corp',
        planName: 'Starter',
        planPrice: 99,
        billingCycle: 'Monthly',
        current: {
          status: 'paid',
          paymentMethod: 'credit-card',
          spaceUsed: 120,
          tokenCount: 32,
          paidFor: 'Monthly subscription',
        },
        previous: {
          status: 'paid',
          paymentMethod: 'credit-card',
          spaceUsed: 110,
          tokenCount: 30,
          paidFor: 'Monthly subscription',
        },
      },
      {
        id: 'org-2',
        organization: 'Globex',
        planName: 'Growth',
        planPrice: 499,
        billingCycle: 'Monthly',
        current: {
          status: 'pending',
          spaceUsed: 260,
          tokenCount: 88,
          paidFor: 'Tokens addon',
        },
        previous: {
          status: 'paid',
          paymentMethod: 'bank-transfer',
          spaceUsed: 240,
          tokenCount: 82,
          paidFor: 'Monthly subscription',
        },
      },
      {
        id: 'org-3',
        organization: 'Soylent Corp',
        planName: 'Enterprise',
        planPrice: 999,
        billingCycle: 'Monthly',
        current: {
          status: 'overdue',
          spaceUsed: 540,
          tokenCount: 210,
          paidFor: 'Storage addon',
        },
        previous: {
          status: 'pending',
          spaceUsed: 500,
          tokenCount: 198,
          paidFor: 'Monthly subscription',
        },
      },
      {
        id: 'org-4',
        organization: 'Initech',
        planName: 'Starter',
        planPrice: 99,
        billingCycle: 'Monthly',
        current: {
          status: 'paid',
          paymentMethod: 'bank-transfer',
          spaceUsed: 140,
          tokenCount: 50,
          paidFor: 'Annual subscription',
        },
        previous: {
          status: 'paid',
          paymentMethod: 'credit-card',
          spaceUsed: 135,
          tokenCount: 48,
          paidFor: 'Annual subscription',
        },
      },
      {
        id: 'org-5',
        organization: 'Umbrella Corp',
        planName: 'Growth',
        planPrice: 499,
        billingCycle: 'Monthly',
        current: {
          status: 'pending',
          spaceUsed: 300,
          tokenCount: 120,
          paidFor: 'Tokens addon',
        },
        previous: {
          status: 'overdue',
          spaceUsed: 280,
          tokenCount: 115,
          paidFor: 'Storage addon',
        },
      },
      {
        id: 'org-6',
        organization: 'TechStart Inc',
        planName: 'Enterprise',
        planPrice: 999,
        billingCycle: 'Annual',
        current: {
          status: 'paid',
          paymentMethod: 'credit-card',
          spaceUsed: 800,
          tokenCount: 260,
          paidFor: 'Annual subscription',
        },
        previous: {
          status: 'paid',
          paymentMethod: 'credit-card',
          spaceUsed: 760,
          tokenCount: 250,
          paidFor: 'Annual subscription',
        },
      },
    ];

    let invoiceCounter = 1;
    const buildBill = (org, period, details) => {
      const isPaid = details.status === 'paid';
      const paidDate = isPaid
        ? formatDate(
            new Date(
              new Date(period.dueDate).getFullYear(),
              new Date(period.dueDate).getMonth(),
              10
            )
          )
        : null;

      return {
        id: `${org.id}-${period.slug}`,
        invoiceNumber: `INV-${new Date(period.issuedDate).getFullYear()}-${String(
          invoiceCounter++
        ).padStart(3, '0')}`,
        organization: org.organization,
        amount: org.planPrice,
        status: details.status,
        dueDate: period.dueDate,
        issuedDate: period.issuedDate,
        description: `${org.planName} plan subscription for ${period.label}`,
        paymentMethod: details.paymentMethod || null,
        paidDate,
        planName: org.planName,
        planPrice: org.planPrice,
        billingCycle: org.billingCycle,
        period: period.slug,
        periodLabel: period.label,
        reminderSent: false,
        invoiceSent: false,
        spaceUsed: details.spaceUsed || 0,
        tokenCount: details.tokenCount ?? 0,
        paidFor: details.paidFor || 'Subscription',
      };
    };

    const mockBills = organizations.flatMap(org => [
      buildBill(org, currentPeriod, org.current),
      buildBill(org, previousPeriod, org.previous),
    ]);

    setBills(mockBills);
    setIsLoading(false);
  }, []);

  // Filter bills
  const periodBills =
    billingPeriod === 'all'
      ? bills
      : bills.filter(bill => bill.period === billingPeriod);

  const filteredBills = periodBills.filter(bill => {
    const matchesSearch =
      bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / rowsPerPage);
  const currentBills = filteredBills.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle mark as paid
  const handleMarkAsPaid = (billId, paymentMethod) => {
    setBills(
      bills.map(b =>
        b.id === billId
          ? {
              ...b,
              status: 'paid',
              paymentMethod,
              paidDate: new Date().toISOString(),
            }
          : b
      )
    );
    setIsDetailModalOpen(false);
    setSelectedBill(null);
  };

  const handleSendReminder = billId => {
    setBills(prev =>
      prev.map(b =>
        b.id === billId
          ? {
              ...b,
              reminderSent: true,
            }
          : b
      )
    );
  };

  const handleSendInvoice = billId => {
    setBills(prev =>
      prev.map(b =>
        b.id === billId
          ? {
              ...b,
              invoiceSent: true,
            }
          : b
      )
    );
  };

  // Billing statistics
  const stats = {
    totalRevenue: periodBills.reduce(
      (sum, b) => sum + (b.status === 'paid' ? b.amount : 0),
      0
    ),
    pendingAmount: periodBills.reduce(
      (sum, b) => sum + (b.status === 'pending' ? b.amount : 0),
      0
    ),
    cancelledAmount: periodBills.reduce(
      (sum, b) => sum + (b.status === 'cancelled' ? b.amount : 0),
      0
    ),
    totalBills: periodBills.length,
    paidBills: periodBills.filter(b => b.status === 'paid').length,
    pendingBills: periodBills.filter(b => b.status === 'pending').length,
    cancelledBills: periodBills.filter(b => b.status === 'cancelled').length,
    organizations: new Set(periodBills.map(b => b.organization)).size,
  };

  const revenueWindow = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sums = { day: 0, week: 0, month: 0, year: 0 };

    periodBills.forEach(bill => {
      if (bill.status !== 'paid' || !bill.paidDate) return;
      const paidDate = new Date(bill.paidDate);

      if (paidDate.toDateString() === now.toDateString()) {
        sums.day += bill.amount;
      }

      if (paidDate >= startOfWeek && paidDate <= now) {
        sums.week += bill.amount;
      }

      if (
        paidDate.getMonth() === currentMonth &&
        paidDate.getFullYear() === currentYear
      ) {
        sums.month += bill.amount;
      }

      if (paidDate.getFullYear() === currentYear) {
        sums.year += bill.amount;
      }
    });

    return sums;
  }, [periodBills]);

  const monthlyTotals = useMemo(() => {
    const map = new Map();

    bills.forEach(bill => {
      if (bill.status !== 'paid' || !bill.paidDate) return;
      const paidDate = new Date(bill.paidDate);
      const key = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      const label = paidDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      const existing = map.get(key) || { amount: 0, label };
      map.set(key, { amount: existing.amount + bill.amount, label });
    });

    return Array.from(map.entries())
      .map(([key, { amount, label }]) => ({ key, amount, label }))
      .sort((a, b) => {
        const [ay, am] = a.key.split('-').map(Number);
        const [by, bm] = b.key.split('-').map(Number);
        return new Date(by, bm - 1, 1) - new Date(ay, am - 1, 1);
      });
  }, [bills]);

  const selectedMonthAmount = useMemo(() => {
    if (monthView === 'all') {
      return monthlyTotals.reduce((sum, m) => sum + m.amount, 0);
    }
    const match = monthlyTotals.find(m => m.key === monthView);
    return match ? match.amount : 0;
  }, [monthView, monthlyTotals]);

  const revenueLabel = {
    day: 'Today',
    week: 'Last 7 days',
    month: 'This month',
    year: 'This year',
  }[revenueView];

  const periodLabel =
    billingPeriod === 'current'
      ? 'Current month'
      : billingPeriod === 'previous'
        ? 'Previous month'
        : 'All periods';

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="w-full max-w-none mx-auto space-y-6 md:space-y-8 pb-8">
        {/* Header + Revenue filters */}
        <div
          className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          style={{ color: colors.text.primary }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Billing & Payments</h1>
            <p className="text-lg" style={{ color: colors.text.secondary }}>
              Manage invoices and track payments from all organizations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:justify-end">
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-full border shadow-sm"
              style={{
                backgroundColor: colors.bg.secondary,
                borderColor: colors.border,
              }}
            >
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Revenue window
              </span>
              <select
                value={revenueView}
                onChange={e => setRevenueView(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-full border shadow-sm"
              style={{
                backgroundColor: colors.bg.secondary,
                borderColor: colors.border,
              }}
            >
              <div className="flex flex-col leading-tight">
                <span
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Revenue by month
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  ${selectedMonthAmount.toFixed(2)}
                </span>
              </div>
              <select
                value={monthView}
                onChange={e => setMonthView(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
              >
                <option value="all">All paid</option>
                {monthlyTotals.map(month => (
                  <option key={month.key} value={month.key}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Revenue (with window selector) */}
          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Revenue — {revenueLabel}
                </p>
                <h3 className="text-2xl font-bold">
                  ${revenueWindow[revenueView].toFixed(2)}
                </h3>
                <p className="text-xs" style={{ color: '#10B981' }}>
                  {stats.paidBills} paid invoices
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <DollarSign className="h-6 w-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Pending Amount
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.pendingAmount.toFixed(2)}
                </h3>
                <p className="text-xs mt-2" style={{ color: '#F59E0B' }}>
                  {stats.pendingBills} pending invoices
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Clock className="h-6 w-6" style={{ color: '#F59E0B' }} />
              </div>
            </div>
          </div>

          {/* Total Invoices */}
          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Total Invoices
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalBills}</h3>
                <p className="text-xs mt-2" style={{ color: '#3B82F6' }}>
                  All time invoices
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <FileText className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Bills Table */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{
            borderColor: colors.border,
            borderWidth: '1px',
            backgroundColor: colors.bg.secondary,
          }}
        >
          {/* Table Header with Filters */}
          <div
            className="p-4 border-b flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: colors.border }}
          >
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Billing details — {periodLabel}
              </h3>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                All organizations, plans, invoices, dates, status, and actions
                in one table.
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  }}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.text.secondary }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Organization
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Paid For
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Space Used
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Tokens (M)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-gray-200"
                style={{ backgroundColor: colors.bg.secondary }}
              >
                {currentBills.length > 0 ? (
                  currentBills.map(bill => (
                    <tr
                      key={bill.id}
                      style={{ backgroundColor: colors.bg.secondary }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor =
                          colors.bg.hover)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor =
                          colors.bg.secondary)
                      }
                    >
                      <td className="px-6 py-4 whitespace-normal">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {bill.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {bill.planName}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-normal"
                        style={{ color: colors.text.secondary }}
                      >
                        {bill.paidFor}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {bill.spaceUsed} GB
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {bill.tokenCount?.toLocaleString() ?? '—'} M
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          ${bill.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="View details"
                          >
                            <Eye
                              className="h-4 w-4"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            onClick={() => handleSendInvoice(bill.id)}
                            className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                            title={
                              bill.invoiceSent ? 'Invoice sent' : 'Send invoice'
                            }
                          >
                            <Send
                              className="h-4 w-4"
                              style={{
                                color: bill.invoiceSent
                                  ? '#3B82F6'
                                  : colors.text.secondary,
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search
                          className="h-12 w-12 mb-4 opacity-30"
                          style={{ color: colors.text.primary }}
                        />
                        <h3
                          className="text-lg font-medium mb-1"
                          style={{ color: colors.text.primary }}
                        >
                          No invoices found
                        </h3>
                        <p
                          className="text-sm max-w-md"
                          style={{ color: colors.text.secondary }}
                        >
                          {searchTerm || statusFilter !== 'all'
                            ? 'No invoices match your search criteria. Try adjusting your filters.'
                            : 'No invoices available.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredBills.length > 0 && (
            <div
              className="px-6 py-4 flex items-center justify-between border-t"
              style={{ borderColor: colors.border }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * rowsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, filteredBills.length)}
                </span>{' '}
                of <span className="font-medium">{filteredBills.length}</span>{' '}
                results
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Rows per page: {rowsPerPage}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span
                    className="px-2 text-sm"
                    style={{ color: colors.text.primary }}
                  >
                    {currentPage} of{' '}
                    {Math.ceil(filteredBills.length / rowsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(p =>
                        Math.min(
                          Math.ceil(filteredBills.length / rowsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredBills.length / rowsPerPage)
                    }
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Detail Modal */}
      <BillDetailModal
        bill={selectedBill}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBill(null);
        }}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </main>
  );
}
