import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiCustomerService2Line, 
    RiAddLine, 
    RiSearchLine, 
    RiFilter3Line, 
    RiTimeLine, 
    RiCheckboxCircleLine, 
    RiInformationLine,
    RiArrowRightSLine,
    RiHistoryLine,
    RiShieldCheckLine,
    RiCloseCircleLine,
    RiQuestionLine,
    RiLoader4Line
} from 'react-icons/ri';
import { io } from 'socket.io-client';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import CreateTicketModal from './CreateTicketModal';
import UserSupportTicketModal from './UserSupportTicketModal';

const Support = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Socket Connection for Real-time Ticket Updates
    React.useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            withCredentials: true,
            transports: ['polling', 'websocket']
        });

        socket.on('support_ticket_updated', (ticket) => {
            queryClient.invalidateQueries(['myTickets']);
            setSelectedTicket(prev => prev?.ticketId === ticket.ticketId ? ticket : prev);
        });

        socket.on('support_ticket_replied', () => {
            queryClient.invalidateQueries(['myTickets']);
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    // Fetch My Tickets
    const { data: ticketsData, isLoading } = useQuery({
        queryKey: ['myTickets', statusFilter, searchTerm],
        queryFn: async () => {
            const res = await axiosSecure.get(`/support/my-tickets?status=${statusFilter}&search=${searchTerm}`);
            return res.data.tickets;
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'in_progress': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'resolved': return 'bg-lime-100 text-lime-600 border-lime-200';
            case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-blue-500';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Support & Assistance</h1>
                    <p className="text-slate-500 font-medium mt-1">We're here to help you with any issues or questions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 px-8 bg-slate-900 hover:bg-lime-500 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                    <RiAddLine size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    Create New Ticket
                </button>
            </div>

            {/* Quick Stats / Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tickets', value: ticketsData?.length || 0, icon: RiHistoryLine, color: 'blue' },
                    { label: 'Open', value: ticketsData?.filter(t => t.status === 'open').length || 0, icon: RiQuestionLine, color: 'blue' },
                    { label: 'In Progress', value: ticketsData?.filter(t => t.status === 'in_progress').length || 0, icon: RiLoader4Line, color: 'amber' },
                    { label: 'Resolved', value: ticketsData?.filter(t => t.status === 'resolved').length || 0, icon: RiCheckboxCircleLine, color: 'lime' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by subject or ticket ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all"
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
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ticket ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Priority</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6 h-20 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : ticketsData?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <RiCustomerService2Line size={40} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">No tickets found</p>
                                                <p className="text-sm text-slate-400 font-medium">Create a ticket if you need any help</p>
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
                                            <span className="font-black text-slate-900 text-sm">{ticket.ticketId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 group-hover:text-lime-600 transition-colors">{ticket.subject}</span>
                                                <span className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">{ticket.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                {ticket.category.replace('_', ' ')}
                                            </span>
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
                                                {ticket.status.replace('_', ' ')}
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

            {/* Support Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center text-lime-400">
                            <RiShieldCheckLine size={28} />
                        </div>
                        <h3 className="text-2xl font-black">Fast Support Promise</h3>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Our team typically responds to new tickets within 2-4 business hours. High priority tickets are handled with maximum urgency.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=support${i}`} alt="Agent" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-lime-400">12+ Agents Online</span>
                        </div>
                    </div>
                </div>

                <div className="bg-lime-50 rounded-[40px] p-8 border border-lime-100 flex flex-col justify-between group cursor-pointer hover:bg-lime-100 transition-all duration-500">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-lime-600 shadow-sm">
                                <RiInformationLine size={28} />
                            </div>
                            <RiArrowRightSLine size={32} className="text-lime-300 group-hover:text-lime-600 group-hover:translate-x-2 transition-all" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Knowledge Base</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mt-3">
                            Browse our extensive documentation and FAQs for instant answers to common questions about shipping and billing.
                        </p>
                    </div>
                    <div className="pt-8">
                        <span className="text-xs font-black text-lime-600 uppercase tracking-widest">Visit Help Center →</span>
                    </div>
                </div>
            </div>

            <CreateTicketModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => queryClient.invalidateQueries(['myTickets'])}
            />

            <UserSupportTicketModal 
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </div>
    );
};

export default Support;
