import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import RiderTopNavbar from './components/RiderTopNavbar';
import RiderOverviewCards from './components/RiderOverviewCards';
import RiderActiveDeliveries from './components/RiderActiveDeliveries';
import RiderAnalytics from './components/RiderAnalytics';
import RiderActivityFeed from './components/RiderActivityFeed';
import RiderPerformance from './components/RiderPerformance';

const RiderDashboard = () => {
  const { user, userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);

  // ✅ Inline mock data constants for fallback when backend is unavailable
  const mockRiderDashboardStats = {
    totalDeliveries: 0,
    completedDeliveries: 0,
    inProgressDeliveries: 0,
    cancelledDeliveries: 0,
    totalEarnings: 0,
    weeklyEarnings: 0,
    averageDeliveryTime: 0,
    successRate: 0
  };

  const mockRiderDeliveries = [];

  const mockRiderAnalytics = {
    totalDeliveries: 0,
    delivered: 0,
    cancelled: 0,
    pending: 0,
    successRate: 0,
    totalEarnings: 0
  };

  const mockRiderActivityFeed = [];

  const mockRiderPerformance = {
    totalDeliveries: 0,
    completedDeliveries: 0,
    cancelledDeliveries: 0,
    successRate: 0,
    cancelRate: 0,
    averageRating: 0,
    weeklyDeliveries: 0
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.email) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      auth: {
        email: user.email,
        token: localStorage.getItem('access_token')
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected for real-time updates');
      toast.success('Connected to live updates', { duration: 2000 });
    });

    newSocket.on('delivery_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
    });

    newSocket.on('earnings_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['rider-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['rider-analytics'] });
    });

    newSocket.on('activity_new', () => {
      queryClient.invalidateQueries({ queryKey: ['rider-activity'] });
    });

    newSocket.on('disconnect', () => {
      toast.error('Disconnected from live updates', { duration: 2000 });
    });

    // Initialize socket connection for real-time delivery updates
    return () => {
      newSocket.close();
    };
  }, [user?.email, queryClient]);

  // Fetch dashboard overview stats
  const { data: stats = mockRiderDashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['rider-dashboard-stats', user?.email],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/dashboard-stats');
        // Backend returns { success: true, stats: {...} }
        return res.data?.stats || mockRiderDashboardStats;
      } catch (error) {
        console.error('❌ Dashboard stats error:', error.message);
        return mockRiderDashboardStats;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1
  });

  // Fetch active deliveries - now using /rider/deliveries endpoint
  const { data: deliveriesData = { deliveries: mockRiderDeliveries }, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['rider-deliveries', user?.email],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/deliveries');
        // Backend returns { success: true, deliveries: [...] }
        return { deliveries: res.data?.deliveries || mockRiderDeliveries };
      } catch (error) {
        console.error('❌ Deliveries error:', error.message);
        return { deliveries: mockRiderDeliveries };
      }
    },
    enabled: !!user?.email,
    refetchInterval: 15000,
    staleTime: 5000,
    retry: 1
  });

  // Fetch analytics data - now using /rider/analytics endpoint
  const { data: analyticsData = mockRiderAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['rider-analytics', user?.email],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/analytics');
        // Backend returns { success: true, analytics: {...} }
        return res.data?.analytics || mockRiderAnalytics;
      } catch (error) {
        console.error('❌ Analytics error:', error.message);
        return mockRiderAnalytics;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 1
  });

  // Fetch activity feed - now using /rider/activity-feed endpoint
  const { data: activityFeed = mockRiderActivityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['rider-activity', user?.email],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/activity-feed');
        // Backend returns { success: true, activities: [...] }
        return res.data?.activities || mockRiderActivityFeed;
      } catch (error) {
        console.error('❌ Activity feed error:', error.message);
        return mockRiderActivityFeed;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
    staleTime: 3000,
    retry: 1
  });

  // Fetch rider performance metrics - now using /rider/performance endpoint
  const { data: performance = mockRiderPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['rider-performance', user?.email],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/performance');
        // Backend returns { success: true, performance: {...} }
        return res.data?.performance || mockRiderPerformance;
      } catch (error) {
        console.error('❌ Performance error:', error.message);
        return mockRiderPerformance;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 45000,
    staleTime: 20000,
    retry: 1
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Fixed Top Navigation Bar */}
      <RiderTopNavbar 
        user={user} 
        userProfile={userProfile}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.fullName || 'Rider'}! Here's your delivery overview.
          </p>
        </div>

        {/* Dashboard Overview Cards - KPIs */}
        <RiderOverviewCards 
          stats={stats}
          isLoading={statsLoading}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Active Deliveries & Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Deliveries Section */}
            <RiderActiveDeliveries 
              deliveries={deliveriesData.deliveries || []}
              isLoading={deliveriesLoading}
            />

            {/* Analytics & Charts Section */}
            <RiderAnalytics 
              analyticsData={analyticsData}
              isLoading={analyticsLoading}
            />
          </div>

          {/* Right Column: Activity Feed & Performance Metrics */}
          <div className="space-y-8">
            {/* Recent Activity Feed */}
            <RiderActivityFeed 
              activities={activityFeed}
              isLoading={activityLoading}
            />

            {/* Performance Metrics */}
            <RiderPerformance 
              performance={performance}
              isLoading={performanceLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiderDashboard;
