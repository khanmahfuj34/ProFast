import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, tokenReady } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (user?.email && tokenReady) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.email, tokenReady, fetchNotifications]);

    // Setup Socket
    useEffect(() => {
        if (!user?.email) return;

        // Use same domain as axiosSecure
        const newSocket = io('http://localhost:3000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('🔌 [Socket] Connected to notification room');
            newSocket.emit('join_notification_room', user.email);
        });

        newSocket.on('new_notification', (notification) => {
            console.log('🔔 [Socket] New notification received:', notification.title);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 [Socket] Disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.email]);

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
            markAsRead, 
            markAllRead, 
            clearAllRead,
            fetchNotifications 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
