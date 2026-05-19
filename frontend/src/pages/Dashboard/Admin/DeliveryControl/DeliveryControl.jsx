import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import StatsCards from './StatsCards';
import FiltersBar from './FiltersBar';
import RequestTable from './RequestTable';
import RiderStatusPanel from './RiderStatusPanel';
import LiveMapPanel from './LiveMapPanel';
import FailedAssignments from './FailedAssignments';
import useAuth from '../../../../hooks/useAuth';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const DeliveryControl = () => {
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('All Requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Fetch Data
  const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
    queryKey: ['deliveryStats'],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/stats');
      return res.data.stats;
    }
  });

  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/requests');
      return res.data.requests;
    }
  });

  const { data: riderStatus = {}, isLoading: isRiderStatusLoading } = useQuery({
    queryKey: ['riderStatus'],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/riders-status');
      return res.data.statuses;
    },
    refetchInterval: 30000 // Refetch every 30s just in case
  });

  const { data: failedAssignments = [] } = useQuery({
    queryKey: ['failedAssignments'],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/failed-assignments');
      return res.data.failed;
    }
  });

  // Socket IO Setup
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Listen to admin matching updates
    newSocket.on('admin_matching_update', () => {
      queryClient.invalidateQueries(['deliveryRequests']);
      queryClient.invalidateQueries(['deliveryStats']);
      queryClient.invalidateQueries(['failedAssignments']);
    });
    
    newSocket.on('dashboard_stats_updated', () => {
      queryClient.invalidateQueries(['deliveryRequests']);
      queryClient.invalidateQueries(['deliveryStats']);
      queryClient.invalidateQueries(['riderStatus']);
    });

    return () => newSocket.close();
  }, [queryClient]);

  // Derived state for filtering
  const filteredRequests = requests.filter(req => {
    // Tab filtering
    if (activeTab === 'Pending Acceptance' && req.status !== 'pending') return false;
    if (activeTab === 'Accepted' && req.status !== 'driver_accepted') return false;
    if (activeTab === 'Picked Up' && req.status !== 'picked-up') return false;
    if (activeTab === 'On The Way' && req.status !== 'on_the_way') return false;
    if (activeTab === 'Delivered' && req.status !== 'delivered') return false;
    if (activeTab === 'Cancelled' && req.status !== 'cancelled') return false;
    
    // Status Filter dropdown
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;
    
    // District Filter dropdown
    if (districtFilter !== 'All' && req.senderDistrict !== districtFilter && req.receiverDistrict !== districtFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      const matchTrack = req.trackingId?.toLowerCase().includes(lowerQ);
      const matchSender = req.senderName?.toLowerCase().includes(lowerQ);
      const matchReceiver = req.receiverName?.toLowerCase().includes(lowerQ);
      if (!matchTrack && !matchSender && !matchReceiver) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 lg:p-6 text-slate-200 w-full overflow-x-hidden font-sans">
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Delivery Control</h1>
          <p className="text-slate-400 text-sm">Monitor live delivery requests and rider activities</p>
        </div>

        {/* Top Stats */}
        <StatsCards stats={stats} isLoading={isStatsLoading} />

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
              <FiltersBar 
                activeTab={activeTab} setActiveTab={setActiveTab}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
              />
              <RequestTable 
                requests={filteredRequests} 
                isLoading={isRequestsLoading} 
              />
            </div>
            
            {failedAssignments.length > 0 && (
              <FailedAssignments failedAssignments={failedAssignments} />
            )}
            
          </div>

          {/* Right Sidebar Area */}
          <div className="w-full xl:w-[340px] flex flex-col gap-6">
            <RiderStatusPanel riderStatus={riderStatus} isLoading={isRiderStatusLoading} />
            <LiveMapPanel requests={requests} riderStatus={riderStatus} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryControl;
