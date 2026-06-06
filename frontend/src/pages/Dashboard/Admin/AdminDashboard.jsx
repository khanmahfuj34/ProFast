import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import AdminOverviewCards from './AdminDashboard/AdminOverviewCards';
import AdminAnalytics from './AdminDashboard/AdminAnalytics';
import AdminActivityFeed from './AdminDashboard/AdminActivityFeed';
import AdminRecentTransactions from './AdminDashboard/AdminRecentTransactions';
import AdminTopPerformingRiders from './AdminDashboard/AdminTopPerformingRiders';

const AdminDashboard = () => {
  const { user, isAdmin, userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [analyticsFilter, setAnalyticsFilter] = useState('7d');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/401');
    }
  }, [isAdmin, navigate]);

  // Fetch comprehensive admin dashboard stats from backend
  const { data: stats = {
    totalParcels: 0,
    deliveredParcels: 0,
    pendingParcels: 0,
    cancelledParcels: 0,
    totalRevenue: 0,
    totalRiders: 0,
    activeRiders: 0,
    onlineRiders: 0,
    totalUsers: 0
  }, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/admin/dashboard-stats');
        return res.data?.stats || {};
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 20000, // Refetch every 20 seconds for near real-time updates
    staleTime: 5000,
    retry: 2
  });

  // Fetch payments from backend
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/admin/payments');
        return res.data?.payments || [];
      } catch (error) {
        console.error('Error fetching admin payments:', error);
        return [];
      }
    },
    enabled: !!user?.email,
    refetchInterval: 45000,
    staleTime: 15000
  });

  // Fetch analytics data with time filter from backend
  const { data: analyticsData = { deliveryTrend: [], parcelStatus: [], revenueByDay: [] }, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics', analyticsFilter],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/admin/analytics?range=${analyticsFilter}`);
        return res.data?.analytics || { deliveryTrend: [], parcelStatus: [], revenueByDay: [] };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return { deliveryTrend: [], parcelStatus: [], revenueByDay: [] };
      }
    },
    refetchInterval: 60000,
    staleTime: 30000
  });

  // Handle analytics filter change
  const handleAnalyticsFilterChange = (filter) => {
    setAnalyticsFilter(filter);
    refetchAnalytics();
  };

  // Fetch riders from backend
  const { data: riders = [], isLoading: ridersLoading } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/riders?status=Approved');
        return res.data?.riders || [];
      } catch (error) {
        console.error('Error fetching riders:', error);
        return [];
      }
    },
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000
  });

  // Socket.IO real-time updates setup
  useEffect(() => {
    try {
      // Connect to Socket.IO server
      const socketURL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.origin.replace(/:\d+/, ':3000');
      
      const socket = io(socketURL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // Connection handlers
      socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.IO server');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });

      // Real-time event handlers for dashboard stats updates
      socket.on('dashboard_stats_updated', () => {
        console.log('📡 Received: dashboard_stats_updated event');
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      });

      socket.on('payment_received', (data) => {
        console.log('📡 Received: payment_received event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      });

      socket.on('parcel_status_updated', (data) => {
        console.log('📡 Received: parcel_status_updated event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      });

      socket.on('parcel_rider_assigned', (data) => {
        console.log('📡 Received: parcel_rider_assigned event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-all-parcels'] });
      });

      socket.on('parcel_assigned', (data) => {
        console.log('📡 Received: parcel_assigned event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-all-parcels'] });
      });

      socket.on('admin_matching_update', (data) => {
        console.log('📡 Received: admin_matching_update event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      });

      socket.on('delivery_request_closed', (data) => {
        console.log('📡 Received: delivery_request_closed event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      });

      socket.on('rider_status_changed', (data) => {
        console.log('📡 Received: rider_status_changed event', data);
        queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['online-riders'] });
      });

      // Cleanup on component unmount
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('dashboard_stats_updated');
        socket.off('payment_received');
        socket.off('parcel_status_updated');
        socket.off('parcel_rider_assigned');
        socket.off('rider_status_changed');
        socket.disconnect();
        console.log('🔌 Socket.IO cleanup completed');
      };
    } catch (error) {
      console.error('❌ Socket.IO setup error:', error);
    }
  }, [queryClient]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Welcome back, {userProfile?.fullName || user?.displayName || 'Admin'}! Here's your business overview.
          </p>
        </div>

        {/* Overview Cards */}
        <AdminOverviewCards stats={stats} isLoading={statsLoading} error={statsError} />

        {/* Main Grid: Analytics & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Charts & Analytics */}
          <div className="lg:col-span-2">
            <AdminAnalytics 
              analyticsData={analyticsData} 
              isLoading={analyticsLoading}
              onFilterChange={handleAnalyticsFilterChange}
            />
          </div>

          {/* Right Column: Activity Feed & Top Riders */}
          <div className="space-y-8">
            <AdminActivityFeed activities={[]} isLoading={false} />
            <AdminTopPerformingRiders riders={riders} isLoading={ridersLoading} />
          </div>
        </div>

        {/* Recent Transactions */}
        <AdminRecentTransactions payments={payments} isLoading={paymentsLoading} />
      </main>
    </div>
  );
};

export default AdminDashboard;
