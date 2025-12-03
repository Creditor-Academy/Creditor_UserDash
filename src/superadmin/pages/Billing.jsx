import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      label: 'Paid',
    },
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      label: 'Pending',
    },
    overdue: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      label: 'Overdue',
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-300',
      label: 'Cancelled',
    },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
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
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockBills = [
      {
        id: 'BL-001',
        invoiceNumber: 'INV-2023-001',
        organization: 'Acme Corp',
        amount: 5000,
        status: 'paid',
        dueDate: '2023-06-30',
        issuedDate: '2023-06-01',
        description: 'Monthly subscription for premium plan',
        paymentMethod: 'credit-card',
        paidDate: '2023-06-15',
      },
      {
        id: 'BL-002',
        invoiceNumber: 'INV-2023-002',
        organization: 'Globex',
        amount: 3500,
        status: 'pending',
        dueDate: '2023-07-15',
        issuedDate: '2023-07-01',
        description: 'Monthly subscription for standard plan',
      },
      {
        id: 'BL-003',
        invoiceNumber: 'INV-2023-003',
        organization: 'Soylent Corp',
        amount: 7200,
        status: 'overdue',
        dueDate: '2023-06-15',
        issuedDate: '2023-05-15',
        description: 'Enterprise plan with additional features',
      },
      {
        id: 'BL-004',
        invoiceNumber: 'INV-2023-004',
        organization: 'Initech',
        amount: 2500,
        status: 'paid',
        dueDate: '2023-06-20',
        issuedDate: '2023-05-20',
        description: 'Monthly subscription for basic plan',
        paymentMethod: 'bank-transfer',
        paidDate: '2023-06-18',
      },
      {
        id: 'BL-005',
        invoiceNumber: 'INV-2023-005',
        organization: 'Umbrella Corp',
        amount: 4800,
        status: 'pending',
        dueDate: '2023-07-10',
        issuedDate: '2023-06-10',
        description: 'Monthly subscription for premium plan with support',
      },
      {
        id: 'BL-006',
        invoiceNumber: 'INV-2023-006',
        organization: 'TechStart Inc',
        amount: 1500,
        status: 'cancelled',
        dueDate: '2023-06-25',
        issuedDate: '2023-05-25',
        description: 'One-time setup fee (cancelled)',
      },
    ];

    setTimeout(() => {
      setBills(mockBills);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter bills
  const filteredBills = bills.filter(bill => {
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

  // Billing statistics
  const stats = {
    totalRevenue: bills.reduce(
      (sum, b) => sum + (b.status === 'paid' ? b.amount : 0),
      0
    ),
    pendingAmount: bills.reduce(
      (sum, b) => sum + (b.status === 'pending' ? b.amount : 0),
      0
    ),
    overdueAmount: bills.reduce(
      (sum, b) => sum + (b.status === 'overdue' ? b.amount : 0),
      0
    ),
    totalBills: bills.length,
    paidBills: bills.filter(b => b.status === 'paid').length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    overdueBills: bills.filter(b => b.status === 'overdue').length,
  };

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-8">
        {/* Header */}
        <div style={{ color: colors.text.primary }} className="mt-6">
          <h1 className="text-4xl font-bold mb-2">Billing & Payments</h1>
          <p className="text-lg" style={{ color: colors.text.secondary }}>
            Manage invoices and track payments from all organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
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
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.totalRevenue.toFixed(2)}
                </h3>
                <p className="text-xs mt-2" style={{ color: '#10B981' }}>
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

          {/* Overdue Amount */}
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
                  Overdue Amount
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.overdueAmount.toFixed(2)}
                </h3>
                <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
                  {stats.overdueBills} overdue invoices
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertCircle className="h-6 w-6" style={{ color: '#EF4444' }} />
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

        {/* Bills Table */}
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
            <h3 className="text-lg font-semibold">All Invoices</h3>
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
                    Invoice #
                  </th>
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
                    Amount
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
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Issued Date
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {bill.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {bill.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          ${bill.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(bill.issuedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Details"
                        >
                          <Eye
                            className="h-4 w-4"
                            style={{ color: colors.text.secondary }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
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
