import React from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function BillingContent() {
  const billingData = [
    {
      id: 1,
      organization: 'Tech Academy',
      amount: '$2,500.00',
      status: 'Paid',
      date: '2024-11-01',
      dueDate: '2024-11-15',
      invoiceId: 'INV-001',
    },
    {
      id: 2,
      organization: 'Global Learning Hub',
      amount: '$5,200.00',
      status: 'Paid',
      date: '2024-11-05',
      dueDate: '2024-11-20',
      invoiceId: 'INV-002',
    },
    {
      id: 3,
      organization: 'Professional Development',
      amount: '$1,800.00',
      status: 'Pending',
      date: '2024-11-10',
      dueDate: '2024-11-25',
      invoiceId: 'INV-003',
    },
    {
      id: 4,
      organization: 'Creative Institute',
      amount: '$3,400.00',
      status: 'Paid',
      date: '2024-11-12',
      dueDate: '2024-11-27',
      invoiceId: 'INV-004',
    },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$12,900.00',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Pending',
      value: '$1,800.00',
      icon: CreditCard,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      label: 'This Month',
      value: '$12,900.00',
      icon: TrendingUp,
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div
          className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] overflow-hidden"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-lg"></div>
                <CreditCard className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Billing
                </h1>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Manage payments and invoices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-xl p-4 bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] relative overflow-hidden"
              style={{
                boxShadow:
                  '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-400 text-xs font-medium">
                    {stat.label}
                  </h3>
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices Table */}
      <div
        className="rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12]"
        style={{
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Invoice ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {billingData.map(bill => (
                <tr
                  key={bill.id}
                  className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-cyan-300 font-semibold">
                    {bill.invoiceId}
                  </td>
                  <td className="px-4 py-3 text-xs text-white font-medium">
                    {bill.organization}
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-300 font-semibold">
                    {bill.amount}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${bill.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25'}`}
                    >
                      {bill.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {bill.date}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {bill.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
