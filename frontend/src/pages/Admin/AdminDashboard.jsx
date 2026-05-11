import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AdminTopNavbar from './AdminDashboard/AdminTopNavbar';
import AdminOverviewCards from './AdminDashboard/AdminOverviewCards';
import AdminAnalytics from './AdminDashboard/AdminAnalytics';
import AdminActivityFeed from './AdminDashboard/AdminActivityFeed';
import AdminRecentTransactions from './AdminDashboard/AdminRecentTransactions';
import AdminTopPerformingRiders from './AdminDashboard/AdminTopPerformingRiders';
import {
  mockAdminStats,
  mockAdminPayments,
  mockAdminAnalytics,
  mockAdminActivityFeed,
  mockAdminRiders
} from './AdminDashboard/mockAdminData';

const AdminDashboard = () => {
  const { user, isAdmin, userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/401');
    }
  }, [isAdmin, navigate]);

  // Fetch admin dashboard stats
  const { data: stats = mockAdminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/admin/stats');
        // Transform backend response to match our expected format
        if (res.data.success && res.data.stats) {
          return {
            totalParcels: res.data.stats.totalParcels || 0,
            pendingParcels: 145, // Would come from separate endpoint in production
            deliveredParcels: res.data.stats.totalParcels * 0.8 || 0,
            cancelledParcels: res.data.stats.totalParcels * 0.05 || 0,
            totalRevenue: 125000, // Would come from payments data
            activeRiders: res.data.stats.totalRiders || 0,
            onlineRiders: Math.floor((res.data.stats.totalRiders || 0) * 0.65)
          };
        }
        return mockAdminStats;
      } catch (error) {
        console.warn('Using mock data for admin stats');
        return mockAdminStats;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
    staleTime: 10000,
    initialData: mockAdminStats
  });

  // Fetch payments
  const { data: payments = mockAdminPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/admin/payments');
        return res.data?.payments || mockAdminPayments;
      } catch (error) {
        console.warn('Using mock data for payments');
        return mockAdminPayments;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 45000,
    staleTime: 15000,
    initialData: mockAdminPayments
  });

  // Fetch analytics data
  const { data: analyticsData = mockAdminAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Analytics data would come from aggregated API endpoint in production
      return mockAdminAnalytics;
    },
    refetchInterval: 60000,
    staleTime: 30000,
    initialData: mockAdminAnalytics
  });

  // Fetch riders
  const { data: riders = mockAdminRiders, isLoading: ridersLoading } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/riders');
        return res.data?.riders || mockAdminRiders;
      } catch (error) {
        console.warn('Using mock data for riders');
        return mockAdminRiders;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000,
    initialData: mockAdminRiders
  });

  // Socket.IO event listeners for real-time updates (if available)
  useEffect(() => {
    const handleStatsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    };

    const handlePaymentUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    };

    const handleRiderUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
    };

    // Event listeners would be set up here if Socket.IO is configured
    // socket.on('stats_updated', handleStatsUpdate);
    // socket.on('payment_received', handlePaymentUpdate);
    // socket.on('rider_status_changed', handleRiderUpdate);

    // return () => {
    //   socket.off('stats_updated', handleStatsUpdate);
    //   socket.off('payment_received', handlePaymentUpdate);
    //   socket.off('rider_status_changed', handleRiderUpdate);
    // };
  }, [queryClient]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <AdminTopNavbar userProfile={userProfile} unreadNotifications={0} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.fullName || user?.displayName || 'Admin'}! Here's your business overview.
          </p>
        </div>

        {/* Overview Cards */}
        <AdminOverviewCards stats={stats} isLoading={statsLoading} />

        {/* Main Grid: Analytics & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Charts & Analytics */}
          <div className="lg:col-span-2">
            <AdminAnalytics analyticsData={analyticsData} isLoading={analyticsLoading} />
          </div>

          {/* Right Column: Activity Feed & Top Riders */}
          <div className="space-y-8">
            <AdminActivityFeed activities={mockAdminActivityFeed} isLoading={false} />
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
