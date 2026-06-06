import React from 'react';
import { MdCheckCircle, MdAccessTime, MdErrorOutline } from 'react-icons/md';

const AdminRecentTransactions = ({ payments = [], isLoading = false }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Paid' },
      pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', label: 'Pending' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Failed' }
    };
    return statusMap[status] || { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-800 dark:text-slate-300', label: status };
  };

  const getStatusIcon = (status) => {
    if (status === 'paid') return <MdCheckCircle className="text-green-500" />;
    if (status === 'pending') return <MdAccessTime className="text-amber-500" />;
    return <MdErrorOutline className="text-red-500" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1120] rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700/60">
        <div className="h-8 bg-gray-200 dark:bg-slate-700/60 rounded w-40 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800/60 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b1120] rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700/60">
      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700/60">
              <th className="text-left font-semibold text-gray-600 dark:text-slate-400 py-3">Tracking ID</th>
              <th className="text-left font-semibold text-gray-600 dark:text-slate-400 py-3">Receiver</th>
              <th className="text-left font-semibold text-gray-600 dark:text-slate-400 py-3">Amount</th>
              <th className="text-left font-semibold text-gray-600 dark:text-slate-400 py-3">Date</th>
              <th className="text-center font-semibold text-gray-600 dark:text-slate-400 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(!Array.isArray(payments) || payments.length === 0) ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-slate-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              payments.slice(0, 5).map((payment) => {
                const statusInfo = getStatusBadge(payment.paymentStatus);
                return (
                  <tr key={payment._id} className="border-b border-gray-100 dark:border-slate-700/40 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition bg-white dark:bg-[#0b1120]">
                    <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">{payment.trackingId}</td>
                    <td className="py-3 text-gray-700 dark:text-slate-300">{payment.receiverName}</td>
                    <td className="py-3 font-semibold text-gray-900 dark:text-slate-200">৳{payment.totalPrice?.toLocaleString()}</td>
                    <td className="py-3 text-gray-600 dark:text-slate-400">
                      {formatDate(payment.paidAt)}
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {getStatusIcon(payment.paymentStatus)}
                        <span className="font-semibold">{statusInfo.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRecentTransactions;
