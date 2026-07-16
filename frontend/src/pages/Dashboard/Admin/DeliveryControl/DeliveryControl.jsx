import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import FiltersBar from './FiltersBar';
import RequestTable from './RequestTable';
import FailedAssignments from './FailedAssignments';
import ParcelDetailsModal from './ParcelDetailsModal';
import useAuth from '../../../../hooks/useAuth';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useNotifications } from '../../../../contexts/NotificationContext';

const getNormalizedStatus = (req) => {
  const status = (req?.deliveryStatus || req?.status || '').toLowerCase();

  if (['pending', 'pending_rider', 'pending_rider_response', 'pending-pickup', 'awaiting-payment'].includes(status)) {
    return 'pending';
  }
  if (['accepted', 'driver_accepted', 'driver_assigned'].includes(status)) {
    return 'accepted';
  }
  if (['picked-up', 'picked_up'].includes(status)) {
    return 'picked_up';
  }
  if (status === 'on_the_way') {
    return 'on_the_way';
  }
  if (status === 'delivered') {
    return 'delivered';
  }
  if (status === 'cancelled') {
    return 'cancelled';
  }
  return status;
};

const DeliveryControl = () => {
  const { user, tokenReady } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  const [activeTab, setActiveTab] = useState('All Requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Fetch Data
  useQuery({
    queryKey: ['deliveryStats', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/stats');
      return res.data.stats;
    },
    enabled: !!user?.email && tokenReady
  });

  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['deliveryRequests', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/requests');
      return res.data.requests;
    },
    enabled: !!user?.email && tokenReady
  });

  const { data: failedAssignments = [] } = useQuery({
    queryKey: ['failedAssignments', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/api/delivery-control/failed-assignments');
      return res.data.failed;
    },
    enabled: !!user?.email && tokenReady
  });

  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (parcel) => {
    setSelectedParcel(parcel);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedParcel(null), 300); // clear after animation
  };

  // Socket IO Setup
  useEffect(() => {
    if (!socket) return;

    const handleAdminMatchingUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
      queryClient.invalidateQueries({ queryKey: ['failedAssignments'] });
    };

    const handleDashboardStatsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
    };

    const handleParcelStatusUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
    };

    const handleAdminDashboardUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
    };

    // Listen to admin matching updates
    socket.on('admin_matching_update', handleAdminMatchingUpdate);
    socket.on('dashboard_stats_updated', handleDashboardStatsUpdated);
    socket.on('parcel_status_updated', handleParcelStatusUpdated);
    socket.on('admin_dashboard_update', handleAdminDashboardUpdate);

    return () => {
      socket.off('admin_matching_update', handleAdminMatchingUpdate);
      socket.off('dashboard_stats_updated', handleDashboardStatsUpdated);
      socket.off('parcel_status_updated', handleParcelStatusUpdated);
      socket.off('admin_dashboard_update', handleAdminDashboardUpdate);
    };
  }, [socket, queryClient]);

  // Derived state for filtering
  const filteredRequests = requests.filter(req => {
    const normStatus = getNormalizedStatus(req);

    // Tab filtering
    if (activeTab === 'Pending Acceptance' && normStatus !== 'pending') return false;
    if (activeTab === 'Accepted' && normStatus !== 'accepted') return false;
    if (activeTab === 'Picked Up' && normStatus !== 'picked_up') return false;
    if (activeTab === 'On The Way' && normStatus !== 'on_the_way') return false;
    if (activeTab === 'Delivered' && normStatus !== 'delivered') return false;
    if (activeTab === 'Cancelled' && normStatus !== 'cancelled') return false;

    // Status Filter dropdown
    if (statusFilter !== 'All') {
      const dropStatus = statusFilter.toLowerCase();
      if (dropStatus === 'driver_accepted' || dropStatus === 'accepted') {
        if (normStatus !== 'accepted') return false;
      } else if (dropStatus === 'picked-up' || dropStatus === 'picked_up') {
        if (normStatus !== 'picked_up') return false;
      } else {
        if (normStatus !== dropStatus) return false;
      }
    }

    // District Filter dropdown
    if (districtFilter !== 'All' && req.senderDistrict !== districtFilter && req.receiverDistrict !== districtFilter) return false;

    // Payment Filter dropdown
    if (paymentFilter !== 'All') {
      const reqPayment = (req.paymentStatus || 'unpaid').toLowerCase();
      if (paymentFilter.toLowerCase() !== reqPayment) return false;
    }

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
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 text-slate-850 w-full overflow-x-hidden font-sans">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Delivery Control</h1>
          <p className="text-slate-900 text-sm">Monitor live delivery requests and rider activities</p>
        </div>


        <div className="bg-white border border-slate-250 rounded-xl overflow-hidden shadow-xl">
          <FiltersBar
            activeTab={activeTab} setActiveTab={setActiveTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
            requests={requests}
          />
          <RequestTable
            requests={filteredRequests}
            isLoading={isRequestsLoading}
            onViewDetails={openDrawer}
          />
        </div>

        {failedAssignments.length > 0 && (
          <FailedAssignments failedAssignments={failedAssignments} />
        )}

      </div>
      <ParcelDetailsModal
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        parcel={selectedParcel}
      />
    </div>
  );
};

export default DeliveryControl;
