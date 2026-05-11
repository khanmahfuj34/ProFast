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
import {
  mockRiderDashboardStats,
  mockRiderDeliveries,
  mockRiderAnalytics,
  mockRiderActivityFeed,
  mockRiderPerformance
} from './mockData';

const RiderDashboard = () => {
  const { user, userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);

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
    queryKey: ['rider-dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/dashboard-stats');
        return res.data;
      } catch (error) {
        console.warn('Using mock data for dashboard stats');
        return mockRiderDashboardStats;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
    staleTime: 10000,
    initialData: mockRiderDashboardStats
  });

  // Fetch active deliveries
  const { data: deliveriesData = { deliveries: mockRiderDeliveries }, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['rider-deliveries'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/deliveries');
        return res.data || { deliveries: mockRiderDeliveries };
      } catch (error) {
        console.warn('Using mock data for deliveries');
        return { deliveries: mockRiderDeliveries };
      }
    },
    enabled: !!user?.email,
    refetchInterval: 15000,
    staleTime: 5000,
    initialData: { deliveries: mockRiderDeliveries }
  });

  // Fetch analytics data for charts
  const { data: analyticsData = mockRiderAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['rider-analytics'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/analytics');
        return res.data;
      } catch (error) {
        console.warn('Using mock data for analytics');
        return mockRiderAnalytics;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000,
    initialData: mockRiderAnalytics
  });

  // Fetch activity feed
  const { data: activityFeed = mockRiderActivityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['rider-activity'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/activity-feed');
        return res.data?.activities || mockRiderActivityFeed;
      } catch (error) {
        console.warn('Using mock data for activity feed');
        return mockRiderActivityFeed;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
    staleTime: 3000,
    initialData: mockRiderActivityFeed
  });

  // Fetch rider performance metrics
  const { data: performance = mockRiderPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['rider-performance'],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get('/rider/performance');
        return res.data;
      } catch (error) {
        console.warn('Using mock data for performance');
        return mockRiderPerformance;
      }
    },
    enabled: !!user?.email,
    refetchInterval: 45000,
    staleTime: 20000,
    initialData: mockRiderPerformance
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
