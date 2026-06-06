import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import {
    RiCloseLine, RiUserLine, RiMailLine, RiTimeLine,
    RiSendPlaneFill, RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine
} from 'react-icons/ri';

const SupportTicketModal = ({ ticket, isOpen, onClose }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const statusMutation = useMutation({
        mutationFn: async (status) => {
            const res = await axiosSecure.patch(`/admin/support/${ticket.ticketId}/status`, { status });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(`Ticket marked as ${data.ticket.status}`);
            queryClient.invalidateQueries(['adminTickets']);
            if (data.ticket.status === 'closed') {
                onClose();
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    });

    const replyMutation = useMutation({
        mutationFn: async () => {
            setIsReplying(true);
            const res = await axiosSecure.post(`/admin/support/${ticket.ticketId}/reply`, { text: replyText });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Reply sent successfully');
            setReplyText('');
            queryClient.invalidateQueries(['adminTickets']);
            setIsReplying(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to send reply');
            setIsReplying(false);
        }
    });

    if (!isOpen || !ticket) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-600';
            case 'in-progress': return 'bg-amber-100 text-amber-600';
            case 'resolved': return 'bg-lime-100 text-lime-600';
            case 'closed': return 'bg-slate-100 text-slate-600';
            default: return 'bg-gray-100 text-gray-600';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0b1120] w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl dark:shadow-slate-900/50 border border-transparent dark:border-slate-700/60 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">{ticket.ticketId}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className={`w-2 h-2 rounded-full bg-current ${getPriorityColor(ticket.priority)}`}></div>
                                <span className={`text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}>{ticket.priority} Priority</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{ticket.subject}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <RiCloseLine size={24} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                    {/* Main Content (Left) */}
                    <div className="flex-1 p-8 border-r border-slate-100 dark:border-slate-700/60">
                        {/* Original Description */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4 text-slate-400 dark:text-slate-500 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold">
                                    {ticket.userEmail?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">{ticket.userEmail}</p>
                                    <p className="text-xs">Reported on {new Date(ticket.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">
                                {ticket.description}
                            </div>
                        </div>

                        {/* Replies Thread */}
                        {ticket.replies && ticket.replies.length > 0 && (
                            <div className="space-y-6 mb-8">
                                <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <RiInformationLine className="text-lime-500" /> Ticket History & Replies
                                </h3>
                                {ticket.replies.map((reply, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-lime-100 dark:bg-lime-900/30 flex-shrink-0 flex items-center justify-center text-lime-600 dark:text-lime-400 font-bold shadow-sm">
                                            {reply.adminName?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm rounded-2xl p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{reply.adminName || 'Admin Support'}</p>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                    {new Date(reply.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{reply.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions (Right) */}
                    <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-col gap-6">
                        {/* User Info */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">User Info</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <RiMailLine className="text-slate-400 dark:text-slate-500" /> {ticket.userEmail}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <RiTimeLine className="text-slate-400 dark:text-slate-500" /> {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {ticket.status !== 'closed' && (
                            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex-1 flex flex-col">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Admin Reply</h4>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply to the user..."
                                    className="w-full h-32 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lime-500 outline-none resize-none mb-3 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                                <button
                                    onClick={() => replyMutation.mutate()}
                                    disabled={!replyText.trim() || isReplying}
                                    className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-green-800 dark:hover:bg-green-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <RiSendPlaneFill /> Send Reply
                                </button>

                                <div className="my-4 h-px bg-slate-100 dark:bg-slate-700/60"></div>

                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h4>
                                <div className="space-y-2">
                                    {ticket.status !== 'resolved' && (
                                        <button
                                            onClick={() => statusMutation.mutate('resolved')}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 hover:bg-lime-100 dark:hover:bg-lime-900/40 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <RiCheckDoubleLine /> Mark Resolved
                                        </button>
                                    )}
                                    <button
                                        onClick={() => statusMutation.mutate('closed')}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-colors"
                                    >
                                        <RiCloseCircleLine /> Close Ticket
                                    </button>
                                </div>
                            </div>
                        )}

                        {ticket.status === 'closed' && (
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                                This ticket is closed. No further actions can be taken.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketModal;
