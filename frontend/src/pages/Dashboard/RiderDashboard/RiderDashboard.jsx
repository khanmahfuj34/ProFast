import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNotifications } from '../../../contexts/NotificationContext';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import RiderTopNavbar from './components/RiderTopNavbar';
import RiderOverviewCards from './components/RiderOverviewCards';
import RiderActiveDeliveries from './components/RiderActiveDeliveries';
import RiderAnalytics from './components/RiderAnalytics';
import RiderActivityFeed from './components/RiderActivityFeed';
import RiderPerformance from './components/RiderPerformance';
import DeliveryRequestModal from './components/DeliveryRequestModal';

const RiderDashboard = () => {
  const { user, userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { isOnline, setIsOnline, socket } = useNotifications();
  const [activeRequest, setActiveRequest] = useState(null);

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

  // Handle real-time delivery request updates via shared socket
  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleNewRequest = (request) => {
      console.log('📦 [Socket] New delivery request received:', request.trackingId);
      setActiveRequest(request);
    };

    const handleRequestClosed = (data) => {
      setActiveRequest(prev => {
        if (prev && prev.parcelId === data.parcelId) {
          console.log('🔒 [Socket] Delivery request closed by another rider');
          return null;
        }
        return prev;
      });
    };

    const handleDeliveryUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
    };

    const handleEarningsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['rider-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['rider-analytics'] });
    };

    const handleActivityNew = () => {
      queryClient.invalidateQueries({ queryKey: ['rider-activity'] });
    };

    // Attach listeners
    socket.on('new_delivery_request', handleNewRequest);
    socket.on('delivery_request_closed', handleRequestClosed);
    socket.on('delivery_accepted', handleDeliveryUpdated);
    socket.on('delivery_updated', handleDeliveryUpdated);
    socket.on('rider_stats_updated', (data) => {
      if (data.email === user?.email) handleDeliveryUpdated();
    });
    socket.on('earnings_updated', handleEarningsUpdated);
    socket.on('activity_new', handleActivityNew);

    return () => {
      // Cleanup listeners
      socket.off('new_delivery_request', handleNewRequest);
      socket.off('delivery_request_closed', handleRequestClosed);
      socket.off('delivery_accepted', handleDeliveryUpdated);
      socket.off('delivery_updated', handleDeliveryUpdated);
      socket.off('rider_stats_updated');
      socket.off('earnings_updated', handleEarningsUpdated);
      socket.off('activity_new', handleActivityNew);
    };
  }, [socket, user?.email, queryClient]);

  const handleAccept = async (parcelId) => {
    try {
      const res = await axiosSecure.post(`/rider/deliveries/${parcelId}/accept`);
      if (res.data.success) {
        toast.success('Parcel accepted! Start your journey.', { icon: '🚀' });
        setActiveRequest(null);
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
        queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept parcel');
      setActiveRequest(null);
    }
  };

  const handleReject = () => {
    setActiveRequest(null);
    toast('Request dismissed', { icon: '🤝' });
  };

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
      {/* Real-time Delivery Request Modal */}
      {activeRequest && (
        <DeliveryRequestModal 
          request={activeRequest}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
      
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
