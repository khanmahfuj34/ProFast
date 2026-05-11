import React from 'react';

const SupportTickets = () => {
  const tickets = [
    {
      id: 'TKT001',
      title: 'Unable to login to account',
      status: 'open',
      priority: 'high',
      user: 'Ahmed Hassan',
      created: '2 hours ago',
    },
    {
      id: 'TKT002',
      title: 'Payment not processed',
      status: 'in-progress',
      priority: 'high',
      user: 'Sarah Khan',
      created: '5 hours ago',
    },
    {
      id: 'TKT003',
      title: 'Delivery address issue',
      status: 'open',
      priority: 'medium',
      user: 'John Doe',
      created: '1 day ago',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-amber-400';
      case 'low':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-slate-400">Manage customer support requests</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
          New Ticket
        </button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-sm">{ticket.id}</span>
                <h3 className="text-white font-semibold">{ticket.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>From: {ticket.user}</span>
              <span>{ticket.created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportTickets;
