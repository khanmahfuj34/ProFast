import React, { useEffect, useRef } from 'react';
import { 
    RiCloseLine, RiTimeLine, RiInformationLine, RiCustomerService2Line, RiUserLine 
} from 'react-icons/ri';

const UserSupportTicketModal = ({ ticket, isOpen, onClose }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [isOpen, ticket?.replies]);

    if (!isOpen || !ticket) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-600';
            case 'in-progress': return 'bg-amber-100 text-amber-600';
            case 'in_progress': return 'bg-amber-100 text-amber-600';
            case 'resolved': return 'bg-lime-100 text-lime-600';
            case 'closed': return 'bg-slate-100 text-slate-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-bold text-slate-400">{ticket.ticketId}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('-', ' ').replace('_', ' ')}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{ticket.subject}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <RiCloseLine size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Conversation Body */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 bg-slate-50/50 space-y-6"
                >
                    {/* User's Original Message */}
                    <div className="flex gap-4 justify-end">
                        <div className="flex-1 max-w-[80%] bg-lime-500 text-white shadow-md rounded-2xl rounded-tr-sm p-5 ml-auto">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-white">You</p>
                                <span className="text-xs text-lime-100 font-medium flex items-center gap-1">
                                    <RiTimeLine /> {new Date(ticket.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-lime-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-2">
                            <RiUserLine />
                        </div>
                    </div>

                    {/* Admin Replies */}
                    {ticket.replies && ticket.replies.length > 0 ? (
                        ticket.replies.map((reply, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-2">
                                    <RiCustomerService2Line />
                                </div>
                                <div className="flex-1 max-w-[80%] bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-bold text-slate-900">{reply.adminName || 'Support Team'}</p>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <RiTimeLine /> {new Date(reply.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{reply.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center py-10 opacity-60">
                            <div className="bg-slate-200/50 text-slate-500 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                                <RiInformationLine /> Support team hasn't replied yet.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                {ticket.status === 'closed' || ticket.status === 'resolved' ? (
                    <div className="p-4 bg-slate-100 text-center text-slate-500 text-sm font-bold border-t border-slate-200 flex-shrink-0">
                        This ticket has been marked as {ticket.status}.
                    </div>
                ) : (
                    <div className="p-4 bg-white text-center text-slate-400 text-sm font-medium border-t border-slate-100 flex-shrink-0">
                        We will notify you when a support agent responds.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSupportTicketModal;
