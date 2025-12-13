import React from 'react';
import { Headphones, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export default function SupportContent() {
  const tickets = [
    {
      id: 'TKT-001',
      title: 'Course Upload Issue',
      organization: 'Tech Academy',
      priority: 'High',
      status: 'Open',
      date: '2024-11-20',
      description: 'Users unable to upload course materials',
    },
    {
      id: 'TKT-002',
      title: 'Payment Gateway Error',
      organization: 'Global Learning Hub',
      priority: 'Critical',
      status: 'In Progress',
      date: '2024-11-19',
      description: 'Payment processing failing for some transactions',
    },
    {
      id: 'TKT-003',
      title: 'User Authentication Problem',
      organization: 'Professional Development',
      priority: 'Medium',
      status: 'Resolved',
      date: '2024-11-18',
      description: 'Login issues for specific user accounts',
    },
    {
      id: 'TKT-004',
      title: 'Dashboard Performance',
      organization: 'Creative Institute',
      priority: 'Low',
      status: 'Open',
      date: '2024-11-17',
      description: 'Dashboard loading slowly during peak hours',
    },
  ];

  const getPriorityColor = priority => {
    switch (priority) {
      case 'Critical':
        return 'from-red-500 to-red-600';
      case 'High':
        return 'from-orange-500 to-orange-600';
      case 'Medium':
        return 'from-yellow-500 to-yellow-600';
      case 'Low':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Open':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-lg"></div>
                <Headphones className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Support
                </h1>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Manage support tickets and issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="space-y-3">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            className="rounded-xl p-4 bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] hover:border-white/[0.18] transition-all cursor-pointer relative overflow-hidden"
            style={{
              boxShadow:
                '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-cyan-300">
                      {ticket.id}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {ticket.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">{ticket.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPriorityColor(ticket.priority)} flex items-center justify-center shadow-md`}
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08]">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">
                    Organization
                  </div>
                  <div className="text-xs text-gray-300">
                    {ticket.organization}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Priority</div>
                  <div
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor(ticket.priority)} bg-opacity-20 text-white`}
                  >
                    {ticket.priority}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Status</div>
                  <div
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Date</div>
                  <div className="text-xs text-gray-300 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
