import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, tokenReady, userProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    const isRider = userProfile?.role === 'rider';

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user?.email || !tokenReady) return;
        setIsLoading(true);
        try {
            const res = await axiosSecure.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('❌ [NotificationContext] Fetch error:', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, tokenReady, axiosSecure]);

    // ✅ Rider Status Management
    const fetchRiderStatus = useCallback(async () => {
        if (!user?.email || !tokenReady || !isRider) {
            setStatusLoading(false);
            return;
        }
        try {
            const res = await axiosSecure.get('/rider/status');
            if (res.data.success) {
                setIsOnline(res.data.isOnline);
                console.log(`🏍️ [Status] Rider status loaded: ${res.data.isOnline ? 'Online' : 'Offline'}`);
            }
        } catch (error) {
            console.error('❌ [Status] Fetch error:', error.message);
        } finally {
            setStatusLoading(false);
        }
    }, [user?.email, tokenReady, isRider, axiosSecure]);

    const toggleStatus = async () => {
        const nextState = !isOnline;
        setStatusLoading(true);
        try {
            const res = await axiosSecure.patch('/rider/status', { isOnline: nextState });
            if (res.data.success) {
                setIsOnline(nextState);
                if (socket && socket.connected) {
                    socket.emit(nextState ? 'rider_online' : 'rider_offline', { email: user.email });
                }
                console.log(`🏍️ [Status] Rider status toggled to: ${nextState ? 'Online' : 'Offline'}`);
            }
        } catch (error) {
            console.error('❌ [Status] Toggle error:', error.message);
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email && tokenReady) {
            fetchNotifications();
            if (isRider) fetchRiderStatus();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setIsOnline(false);
        }
    }, [user?.email, tokenReady, isRider, fetchNotifications, fetchRiderStatus]);

    // Setup Socket
    // Setup Socket with mobile stability features (auto-reconnect, visibilitychange checks)
    useEffect(() => {
        if (!user?.email) return;

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        newSocket.on('connect', () => {
            console.log('🔌 [Socket] Connected to notification room');
            // Join personal notification room (all users)
            newSocket.emit('join_notification_room', user.email);
        });

        newSocket.on('new_notification', (notification) => {
            console.log('🔔 [Socket] New notification received:', notification.title);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Add real-time toast popup
            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex border border-slate-100 overflow-hidden`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="w-10 h-10 bg-lime-100 text-lime-600 flex items-center justify-center rounded-xl text-lg">
                                    🔔
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-slate-100 bg-slate-50">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: 5000, position: 'top-right' });
        });

        newSocket.on('disconnect', (reason) => {
            console.log(`🔌 [Socket] Disconnected: ${reason}`);
        });

        // Mobile background tab optimization: Force reconnect when user returns/tab is visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && newSocket.disconnected) {
                console.log('🔌 [Socket] Tab became visible. Forcing reconnection...');
                newSocket.connect();
            }
        };

        // Network connection restored: Force reconnect
        const handleOnline = () => {
            if (newSocket.disconnected) {
                console.log('🔌 [Socket] Network online. Forcing reconnection...');
                newSocket.connect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);

        setSocket(newSocket);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
            newSocket.disconnect();
        };
    }, [user?.email]);

    // ✅ Rider Signal: Notify backend when rider is ready for deliveries
    useEffect(() => {
        if (socket && isRider && user?.email && isOnline) {
            socket.emit('rider_online', { email: user.email });
            console.log(`🏍️ [Socket] Signaling rider_online for ${user.email}`);
        }
    }, [socket, isRider, user?.email, isOnline]);

    const markAsRead = async (id) => {
        try {
            await axiosSecure.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('❌ [NotificationContext] Mark as read error:', error.message);
        }
    };

    const markAllRead = async () => {
        try {
            await axiosSecure.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('❌ [NotificationContext] Mark all read error:', error.message);
        }
    };

    const clearAllRead = async () => {
        try {
            await axiosSecure.delete('/notifications/clear');
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch (error) {
            console.error('❌ [NotificationContext] Clear error:', error.message);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            isLoading,
            socket,
            isOnline,
            setIsOnline,
            statusLoading,
            toggleStatus,
            markAsRead, 
            markAllRead, 
            clearAllRead,
            fetchNotifications 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
