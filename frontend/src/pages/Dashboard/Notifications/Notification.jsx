import React, { useState, useMemo } from 'react';
import { 
    FiBell, FiInfo, FiPackage, FiDollarSign, FiTruck, 
    FiCheckCircle, FiXCircle, FiClock, FiTrash2, FiChevronRight,
    FiInbox, FiChevronLeft, FiShare2
} from 'react-icons/fi';
import { useNotifications } from '../../../contexts/NotificationContext';
// Removed date-fns import as it was causing resolution errors

// Helper for time-ago since date-fns might not be installed (check package.json showed it wasn't)
// I'll implement a simple one
const timeAgo = (date) => {
    if (!date) return '—';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const TYPE_ICONS = {
    parcel: <FiPackage className="text-blue-500" />,
    payment: <FiDollarSign className="text-emerald-500" />,
    system: <FiInfo className="text-amber-500" />,
    promotion: <FiShare2 className="text-purple-500" />,
    rider: <FiTruck className="text-indigo-500" />,
    success: <FiCheckCircle className="text-lime-500" />,
    error: <FiXCircle className="text-red-500" />
};

const TYPE_BG = {
    parcel: 'bg-blue-50',
    payment: 'bg-emerald-50',
    system: 'bg-amber-50',
    promotion: 'bg-purple-50',
    rider: 'bg-indigo-50',
    success: 'bg-lime-50',
    error: 'bg-red-50'
};

const Notification = () => {
    const { notifications, unreadCount, markAsRead, markAllRead, clearAllRead, isLoading } = useNotifications();
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);

    // Derived State
    const filteredNotifications = useMemo(() => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.isRead);
        return notifications.filter(n => n.type === filter);
    }, [notifications, filter]);

    const selectedNotification = useMemo(() => {
        return notifications.find(n => n._id === selectedId) || null;
    }, [notifications, selectedId]);

    const handleSelect = (notif) => {
        setSelectedId(notif._id);
        if (!notif.isRead) {
            markAsRead(notif._id);
        }
    };

    if (isLoading && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <FiBell className="text-6xl text-slate-200 mb-4" />
                <div className="h-4 w-48 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-50 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-0 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center">
                        <FiBell className="text-lime-600 text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
                        <p className="text-slate-500 text-sm">Stay updated with your parcels and account activities</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={markAllRead}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-lime-600 hover:bg-lime-50 rounded-xl transition"
                    >
                        Mark all as read
                    </button>
                    <button 
                        onClick={clearAllRead}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                        title="Clear read notifications"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: List */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    
                    {/* Filter Tabs */}
                    <div className="flex items-center p-2 bg-slate-50 border-b border-slate-100 gap-1 overflow-x-auto no-scrollbar">
                        {['all', 'unread', 'parcel', 'payment', 'system'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                    filter === tab 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'unread' && unreadCount > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-lime-500 text-white rounded-full text-[10px]">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* List Items */}
                    <div className="flex-1 overflow-y-auto max-h-[700px]">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <FiInbox className="text-6xl mb-4" />
                                <p className="font-bold">No notifications found</p>
                                <p className="text-xs">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredNotifications.map((n) => (
                                    <div 
                                        key={n._id}
                                        onClick={() => handleSelect(n)}
                                        className={`group relative p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50 ${
                                            selectedId === n._id ? 'bg-lime-50/50' : ''
                                        }`}
                                    >
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-lime-500 rounded-r-full shadow-[0_0_10px_rgba(132,204,22,0.5)]"></div>
                                        )}
                                        
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl ${TYPE_BG[n.type] || 'bg-slate-100'}`}>
                                            {TYPE_ICONS[n.type] || <FiBell />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className={`text-sm font-bold truncate ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                                    {n.title}
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                    {timeAgo(n.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs line-clamp-2 leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {n.message}
                                            </p>
                                            
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                    n.type === 'parcel' ? 'bg-blue-100 text-blue-600' :
                                                    n.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {n.type} update
                                                </span>
                                            </div>
                                        </div>

                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-lime-500 flex-shrink-0 mt-1"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>{filteredNotifications.length} items</span>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:text-slate-900 disabled:opacity-20"><FiChevronLeft /></button>
                            <button className="p-1 hover:text-slate-900 disabled:opacity-20"><FiChevronRight /></button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Detail View */}
                <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
                    {selectedNotification ? (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <button 
                                    onClick={() => setSelectedId(null)}
                                    className="p-2 hover:bg-slate-100 rounded-xl lg:hidden"
                                >
                                    <FiChevronLeft />
                                </button>
                                <div className="flex gap-2 ml-auto">
                                    <div className="w-2 h-2 rounded-full bg-lime-500"></div>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-lg ${TYPE_BG[selectedNotification.type]}`}>
                                    {TYPE_ICONS[selectedNotification.type]}
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                                    {selectedNotification.title}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    selectedNotification.type === 'parcel' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {selectedNotification.type} update
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-bold justify-center border-y border-slate-50 py-3">
                                    <FiClock /> {new Date(selectedNotification.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>

                                <div className="text-sm text-slate-600 leading-relaxed text-center">
                                    {selectedNotification.message}
                                </div>

                                {/* Dynamic Details Card based on type */}
                                {selectedNotification.type === 'parcel' && (
                                    <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FiPackage /> Parcel Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Tracking ID</p>
                                                <p className="text-xs font-black text-slate-700 font-mono">{selectedNotification.metadata?.trackingId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                                                <p className="text-xs font-black text-lime-600 uppercase italic">{selectedNotification.metadata?.status || 'Active'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="w-full py-3 bg-white border-2 border-slate-100 hover:border-lime-500 hover:bg-lime-50 text-slate-700 hover:text-lime-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
                                            onClick={() => window.location.href = `/dashboard/track-parcel?id=${selectedNotification.metadata?.trackingId}`}
                                        >
                                            View Parcel Details
                                        </button>
                                    </div>
                                )}

                                {selectedNotification.type === 'payment' && (
                                    <div className="bg-emerald-50/50 rounded-2xl p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <FiDollarSign /> Payment Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase">Amount</p>
                                                <p className="text-xs font-black text-emerald-700">৳{selectedNotification.metadata?.amount || '0'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase">Transaction</p>
                                                <p className="text-[9px] font-black text-emerald-600 font-mono truncate">{selectedNotification.metadata?.transactionId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 h-[600px] flex-col items-center justify-center text-center p-10 grayscale">
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-inner mb-6">
                                <FiBell className="text-4xl text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-400 mb-2">No Notification Selected</h3>
                            <p className="text-sm text-slate-300 max-w-[200px]">Click on a notification from the list to view its full details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notification;
