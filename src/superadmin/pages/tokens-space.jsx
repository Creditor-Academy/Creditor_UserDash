import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  Search,
  Plus,
  Database,
  HardDrive,
  CheckCircle,
  AlertCircle,
  X,
  Users,
} from 'lucide-react';

export default function TokensSpace() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [orgs, setOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [allocationType, setAllocationType] = useState('tokens');
  const [allocationQty, setAllocationQty] = useState('');

  useEffect(() => {
    // Mock data
    setOrgs([
      {
        id: 'org-1',
        name: 'Acme Corp',
        plan: 'Starter',
        paymentStatus: 'paid',
        allocationStatus: 'allocated',
        tokensUsed: 32,
        tokensAddon: 5,
        spaceUsed: 120,
        spaceAddon: 10,
        membersUsed: 15,
        membersAddon: 5,
        lastPayment: '2025-12-01',
      },
      {
        id: 'org-2',
        name: 'Globex',
        plan: 'Growth',
        paymentStatus: 'pending',
        allocationStatus: 'not-allocated',
        tokensUsed: 88,
        tokensAddon: 0,
        spaceUsed: 260,
        spaceAddon: 0,
        membersUsed: 25,
        membersAddon: 0,
        lastPayment: '2025-12-05',
      },
      {
        id: 'org-3',
        name: 'Soylent Corp',
        plan: 'Enterprise',
        paymentStatus: 'overdue',
        allocationStatus: 'not-allocated',
        tokensUsed: 210,
        tokensAddon: 15,
        spaceUsed: 540,
        spaceAddon: 40,
        membersUsed: 50,
        membersAddon: 10,
        lastPayment: '2025-11-20',
      },
      {
        id: 'org-4',
        name: 'Initech',
        plan: 'Starter',
        paymentStatus: 'paid',
        allocationStatus: 'allocated',
        tokensUsed: 50,
        tokensAddon: 8,
        spaceUsed: 140,
        spaceAddon: 15,
        membersUsed: 20,
        membersAddon: 8,
        lastPayment: '2025-12-03',
      },
      {
        id: 'org-5',
        name: 'Umbrella Corp',
        plan: 'Growth',
        paymentStatus: 'pending',
        allocationStatus: 'not-allocated',
        tokensUsed: 120,
        tokensAddon: 12,
        spaceUsed: 300,
        spaceAddon: 35,
        membersUsed: 35,
        membersAddon: 12,
        lastPayment: '2025-12-04',
      },
      {
        id: 'org-6',
        name: 'TechStart Inc',
        plan: 'Enterprise',
        paymentStatus: 'paid',
        allocationStatus: 'allocated',
        tokensUsed: 260,
        tokensAddon: 25,
        spaceUsed: 800,
        spaceAddon: 80,
        membersUsed: 100,
        membersAddon: 25,
        lastPayment: '2025-12-02',
      },
    ]);
  }, []);

  const filtered = useMemo(() => {
    return orgs.filter(org => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.plan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || org.paymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orgs, searchTerm, filterStatus]);

  const totals = useMemo(
    () => ({
      tokensAddon: filtered.reduce((sum, o) => sum + o.tokensAddon, 0),
      spaceAddon: filtered.reduce((sum, o) => sum + o.spaceAddon, 0),
      membersAddon: filtered.reduce((sum, o) => sum + (o.membersAddon || 0), 0),
      orgs: filtered.length,
    }),
    [filtered]
  );

  const adjustOrg = (id, deltaTokens = 0, deltaSpace = 0, deltaMembers = 0) => {
    setOrgs(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              tokensAddon: Math.max(0, o.tokensAddon + deltaTokens),
              spaceAddon: Math.max(0, o.spaceAddon + deltaSpace),
              membersAddon: Math.max(0, (o.membersAddon || 0) + deltaMembers),
            }
          : o
      )
    );
  };

  const openModal = org => {
    setSelectedOrg(org);
    setAllocationType('tokens');
    setAllocationQty('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
    setAllocationQty('');
  };

  const handleAllocate = () => {
    if (!selectedOrg) return;
    const qty = Number(allocationQty);
    if (!qty || qty <= 0) return;
    const tokensDelta = allocationType === 'tokens' ? qty : 0;
    const spaceDelta = allocationType === 'space' ? qty : 0;
    const membersDelta = allocationType === 'members' ? qty : 0;
    adjustOrg(selectedOrg.id, tokensDelta, spaceDelta, membersDelta);
    closeModal();
  };

  const setAllocationStatus = (id, status) => {
    setOrgs(prev =>
      prev.map(o => (o.id === id ? { ...o, allocationStatus: status } : o))
    );
  };

  const statusBadge = status => {
    const map = {
      paid: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Paid' },
      pending: {
        bg: 'rgba(245,158,11,0.12)',
        color: '#F59E0B',
        label: 'Pending',
      },
      overdue: {
        bg: 'rgba(239,68,68,0.12)',
        color: '#EF4444',
        label: 'Overdue',
      },
    };
    const s = map[status] || {
      bg: 'rgba(156,163,175,0.12)',
      color: '#6B7280',
      label: status,
    };
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: s.bg, color: s.color }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="w-full max-w-none mx-auto space-y-6 md:space-y-8 pb-8 mt-20">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div style={{ color: colors.text.primary }}>
            <h1 className="text-4xl font-bold mb-2">Tokens & Cloud Space</h1>
            <p className="text-lg" style={{ color: colors.text.secondary }}>
              Manage add-ons, usage, and payments for all organizations
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm"
            style={{
              backgroundColor: colors.bg.secondary,
              borderColor: colors.border,
            }}
          >
            <span className="text-sm" style={{ color: colors.text.secondary }}>
              Filter status
            </span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Total Tokens Add-on
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totals.tokensAddon} M
              </h3>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
            >
              <Database className="h-6 w-6" style={{ color: '#3B82F6' }} />
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Total Space Add-on
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totals.spaceAddon} GB
              </h3>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
            >
              <HardDrive className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Total Members Add-on
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totals.membersAddon}
              </h3>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}
            >
              <Users className="h-6 w-6" style={{ color: '#8B5CF6' }} />
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Organizations
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totals.orgs}
              </h3>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(156,163,175,0.12)' }}
            >
              <CheckCircle className="h-6 w-6" style={{ color: '#6B7280' }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden mt-6"
          style={{
            borderColor: colors.border,
            borderWidth: '1px',
            backgroundColor: colors.bg.secondary,
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: colors.border }}
          >
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Tokens & Space Management
              </h3>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                View payments, usage, and grant add-ons for each organization.
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paid For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-gray-200"
                style={{ backgroundColor: colors.bg.secondary }}
              >
                {filtered.length > 0 ? (
                  filtered.map(org => (
                    <tr
                      key={org.id}
                      style={{ backgroundColor: colors.bg.secondary }}
                    >
                      <td className="px-6 py-4 whitespace-normal">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {org.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {org.plan}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {statusBadge(org.paymentStatus)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-normal text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {(() => {
                          const items = [];
                          if (org.tokensAddon > 0)
                            items.push(`${org.tokensAddon}M tokens add-on`);
                          if (org.spaceAddon > 0)
                            items.push(`${org.spaceAddon}GB space add-on`);
                          if (org.membersAddon > 0)
                            items.push(`${org.membersAddon} members add-on`);
                          return items.length
                            ? items.join(' · ')
                            : 'No add-ons';
                        })()}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(org.lastPayment).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={org.allocationStatus}
                          onChange={e =>
                            setAllocationStatus(org.id, e.target.value)
                          }
                          className="text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          style={{
                            backgroundColor: colors.bg.primary,
                            borderColor: colors.border,
                            color: colors.text.primary,
                          }}
                        >
                          <option value="allocated">Allocated</option>
                          <option value="not-allocated">Not allocated</option>
                        </select>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm align-top"
                        style={{ marginTop: '12px' }}
                      >
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => openModal(org)}
                            className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1"
                            style={{
                              backgroundColor: 'rgba(59,130,246,0.12)',
                              color: '#2563EB',
                            }}
                          >
                            <Plus size={14} /> Add-on
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle
                          className="h-10 w-10 mb-3"
                          style={{ color: colors.text.secondary }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          No organizations match this filter.
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.text.secondary }}
                        >
                          Adjust search or status to see results.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Allocation Modal */}
      {isModalOpen && selectedOrg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Allocate add-on
                </p>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {selectedOrg.name}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: colors.text.secondary }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Type
                </label>
                <select
                  value={allocationType}
                  onChange={e => setAllocationType(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: colors.bg.primary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  }}
                >
                  <option value="tokens">Tokens (M)</option>
                  <option value="space">Space (GB)</option>
                  <option value="members">Members</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label
                  className="text-sm font-medium mb-1"
                  style={{ color: colors.text.secondary }}
                >
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={allocationQty}
                  onChange={e => setAllocationQty(e.target.value)}
                  placeholder="Enter amount"
                  className="px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: colors.bg.primary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.bg.primary,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllocate}
                  disabled={!allocationQty || Number(allocationQty) <= 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  }}
                >
                  Allocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
