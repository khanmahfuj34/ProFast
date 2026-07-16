import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { useNotifications } from '../../../contexts/NotificationContext';
import { 
    RiSearchLine, RiFilter3Line, RiCustomerService2Line, 
    RiHistoryLine, RiQuestionLine, RiLoader4Line, RiCheckboxCircleLine 
} from 'react-icons/ri';
import SupportTicketModal from './SupportTicketModal';

const SupportTickets = () => {
    const { user, tokenReady } = useAuth();
    const { socket } = useNotifications();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Socket Connection
    useEffect(() => {
        if (!socket) return;

        const handleNewSupportTicket = () => {
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
        };

        const handleSupportTicketUpdated = (ticket) => {
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
            setSelectedTicket(prev => prev?.ticketId === ticket.ticketId ? ticket : prev);
        };

        const handleSupportTicketReplied = () => {
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
        };

        socket.on('new_support_ticket', handleNewSupportTicket);
        socket.on('support_ticket_updated', handleSupportTicketUpdated);
        socket.on('support_ticket_replied', handleSupportTicketReplied);

        return () => {
            socket.off('new_support_ticket', handleNewSupportTicket);
            socket.off('support_ticket_updated', handleSupportTicketUpdated);
            socket.off('support_ticket_replied', handleSupportTicketReplied);
        };
    }, [socket, queryClient]);

    // Fetch Tickets
    const { data: ticketsData, isLoading } = useQuery({
        queryKey: ['adminTickets', statusFilter, searchTerm, user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/admin/support?status=${statusFilter}&search=${searchTerm}`);
            return res.data.tickets;
        },
        enabled: !!user?.email && tokenReady
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'in-progress': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'resolved': return 'bg-lime-100 text-lime-600 border-lime-200';
            case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-emerald-500';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-slate-900">Support Tickets</h1>
                <p className="text-slate-500 font-medium mt-1">Manage and respond to customer support requests.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tickets', value: ticketsData?.length || 0, icon: RiHistoryLine, color: 'blue' },
                    { label: 'Open', value: ticketsData?.filter(t => t.status === 'open').length || 0, icon: RiQuestionLine, color: 'blue' },
                    { label: 'In Progress', value: ticketsData?.filter(t => t.status === 'in-progress').length || 0, icon: RiLoader4Line, color: 'amber' },
                    { label: 'Resolved', value: ticketsData?.filter(t => t.status === 'resolved').length || 0, icon: RiCheckboxCircleLine, color: 'lime' },
                ].map((stat, i) => {
                    const colorMap = {
                        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
                        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
                        lime: { bg: 'bg-lime-50', text: 'text-lime-600' }
                    };
                    const colors = colorMap[stat.color] || colorMap.blue;
                    return (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center ${colors.text}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by User Name, Email, or Ticket ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 placeholder:text-slate-400 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <RiFilter3Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-12 pl-11 pr-8 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Table & Cards */}
            <div className="space-y-4">
                {/* Desktop Table View (Hidden on mobile/tablet) */}
                <div className="hidden lg:block bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User / Ticket ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/50"></td>
                                        </tr>
                                    ))
                                ) : ticketsData?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                    <RiCustomerService2Line size={40} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">No support tickets found</p>
                                                    <p className="text-sm text-slate-400 font-medium">Try adjusting your filters or search term.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ticketsData?.map((ticket) => (
                                        <tr 
                                            key={ticket.ticketId} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-sm group-hover:text-lime-600 transition-colors">{ticket.userEmail}</span>
                                                    <span className="text-xs font-bold text-slate-400">{ticket.ticketId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col max-w-sm">
                                                    <span className="font-bold text-slate-800">{ticket.subject}</span>
                                                    <span className="text-xs text-slate-400 font-medium line-clamp-1">{ticket.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full bg-current ${getPriorityColor(ticket.priority)}`}></div>
                                                    <span className={`text-xs font-bold capitalize ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-slate-900">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                                                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Stacked Cards View (Hidden on desktop) */}
                <div className="block lg:hidden space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-36"></div>
                        ))
                    ) : ticketsData?.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <RiCustomerService2Line size={32} />
                            </div>
                            <p className="text-base font-black text-slate-900">No support tickets found</p>
                        </div>
                    ) : (
                        ticketsData?.map((ticket) => (
                            <div
                                key={ticket.ticketId}
                                onClick={() => setSelectedTicket(ticket)}
                                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 cursor-pointer hover:border-lime-500 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                    <span className="font-mono text-xs font-bold text-slate-400">{ticket.ticketId}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}{' '}
                                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{ticket.subject}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]">{ticket.userEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('-', ' ')}
                                        </span>
                                        <span className={`text-[10px] font-extrabold capitalize flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <SupportTicketModal 
                ticket={selectedTicket} 
                isOpen={!!selectedTicket} 
                onClose={() => setSelectedTicket(null)} 
            />
        </div>
    );
};

export default SupportTickets;
