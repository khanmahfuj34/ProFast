import React, { useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { FiSend, FiUsers, FiMessageSquare, FiInfo, FiSettings } from 'react-icons/fi';

const AdminNotifications = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'Everyone',
    type: 'announcement',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosSecure.post('/admin/notifications/broadcast', formData);
      if (res.data.success) {
        toast.success(`Notification broadcasted to ${res.data.count} users!`);
        setFormData({ ...formData, title: '', message: '' });
      } else {
        toast.error(res.data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending notification');
      console.error('Broadcast error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Broadcast Notification</h1>
        <p className="text-slate-500">Send system-wide alerts and updates to users and riders instantly.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FiUsers className="text-slate-400" /> Target Audience
              </label>
              <select
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent font-medium"
              >
                <option value="Everyone">Everyone (Users & Riders)</option>
                <option value="Users">All Users</option>
                <option value="Riders">All Riders</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FiSettings className="text-slate-400" /> Notification Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent font-medium"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="maintenance">🛠️ Maintenance</option>
                <option value="offer">🎁 Offer / Promotion</option>
                <option value="warning">⚠️ Warning</option>
                <option value="system_update">⚙️ System Update</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiMessageSquare className="text-slate-400" /> Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Scheduled System Maintenance"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent font-medium placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiInfo className="text-slate-400" /> Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your notification message here..."
              rows="4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent font-medium placeholder-slate-400 resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <FiSend />
              )}
              {loading ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-lime-50 border border-lime-200 rounded-2xl p-4 text-lime-800 text-sm flex gap-3 items-start mt-6">
          <FiInfo className="mt-0.5 text-lime-600 shrink-0 text-lg" />
          <p>
              <strong>Pro Tip:</strong> Broadcast notifications are sent in real-time. Target audiences will instantly receive a popup and their notification badge will update automatically without requiring a page refresh.
          </p>
      </div>
    </div>
  );
};

export default AdminNotifications;
