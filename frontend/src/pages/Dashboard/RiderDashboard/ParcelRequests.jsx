import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  FiPackage as Package, 
  FiMapPin as MapPin, 
  FiArrowRight as ArrowRight, 
  FiDollarSign as DollarSign, 
  FiClock as Clock, 
  FiCheckCircle as CheckCircle, 
  FiXCircle as XCircle,
  FiTruck as Truck,
  FiLayers as Layers,
  FiAlertCircle as AlertCircle,
  FiRefreshCw as RefreshCw,
  FiTrendingUp as TrendingUp,
  FiActivity as Activity,
  FiBell as Bell,
  FiFilter as Filter,
  FiChevronDown as ChevronDown,
  FiNavigation as Navigation
} from 'react-icons/fi';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useRiderStatus from '../../../hooks/useRiderStatus';
import { useNotifications } from '../../../contexts/NotificationContext';

const ParcelRequests = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { socket } = useNotifications();
  const { isOnline, toggleStatus, isLoading: statusLoading } = useRiderStatus();
  const [filter, setFilter] = useState('all');

  // Fetch pending requests
  const { data: requestsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['rider-parcel-requests', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/rider/parcel-requests');
      return res.data;
    },
    enabled: !!user?.email,
    refetchInterval: 30000 
  });

  // Fetch dashboard stats for the summary cards
  const { data: statsData } = useQuery({
    queryKey: ['rider-dashboard-stats', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/rider/dashboard-stats');
      return res.data?.stats;
    },
    enabled: !!user?.email
  });

  // Fetch performance data for rates
  const { data: performanceData } = useQuery({
    queryKey: ['rider-performance', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/rider/performance');
      return res.data?.performance;
    },
    enabled: !!user?.email
  });

  // Listen for real-time updates
  React.useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => {
      queryClient.invalidateQueries(['rider-parcel-requests']);
      toast.success('New delivery request available!', { 
        icon: '📦',
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
      });
    };

    const handleRequestClosed = () => {
      queryClient.invalidateQueries(['rider-parcel-requests']);
    };

    socket.on('new_delivery_request', handleNewRequest);
    socket.on('delivery_request_closed', handleRequestClosed);

    return () => {
      socket.off('new_delivery_request', handleNewRequest);
      socket.off('delivery_request_closed', handleRequestClosed);
    };
  }, [socket, queryClient]);

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async (parcelId) => {
      const res = await axiosSecure.post(`/rider/deliveries/${parcelId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Parcel accepted! Start your journey.', {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
      });
      queryClient.invalidateQueries(['rider-parcel-requests']);
      queryClient.invalidateQueries(['rider-deliveries']);
      queryClient.invalidateQueries(['rider-dashboard-stats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept parcel');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId) => {
      const res = await axiosSecure.patch(`/rider/parcel-requests/${requestId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Request dismissed');
      queryClient.invalidateQueries(['rider-parcel-requests']);
    }
  });

  const requests = requestsData?.requests || [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
        <div className="bg-red-50 p-6 rounded-3xl mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3">Connection Interrupted</h2>
        <p className="text-slate-500 mb-8 max-w-md text-lg">We lost connection to the dispatch server. Please check your signal.</p>
        <button 
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-base-500 tracking-tight">
              Parcel Requests
            </h1>
            {requests.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {requests.length} LIVE
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium text-lg">
            Live delivery requests near you
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">

          <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Filter</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="New Requests" 
          value={requests.length} 
          subtext="Nearby requests" 
          icon={<Package />} 
          color="blue"
          loading={isLoading}
        />
        <StatCard 
          label="Response Rate" 
          value="92%" 
          subtext="Excellent" 
          icon={<Activity />} 
          color="indigo" 
          loading={isLoading}
        />
        <StatCard 
          label="Acceptance Rate" 
          value={`${performanceData?.successRate || 0}%`} 
          subtext="Great" 
          icon={<TrendingUp />} 
          color="emerald" 
          loading={isLoading}
        />
        <StatCard 
          label="Total Earnings Today" 
          value={`৳${(statsData?.todayEarnings || 0).toLocaleString()}`} 
          subtext="+12% from yesterday" 
          icon={<DollarSign />} 
          color="amber" 
          loading={isLoading}
        />
      </div>

      {/* Tabs & Sorting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-8 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <TabButton label="All Requests" count={requests.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          <TabButton label="High Priority" count={requests.filter(r => r.parcel?.parcelWeight > 5).length} active={filter === 'priority'} onClick={() => setFilter('priority')} />
          <TabButton label="Regular" count={requests.filter(r => r.parcel?.parcelWeight <= 5).length} active={filter === 'regular'} onClick={() => setFilter('regular')} />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
          <span>Sort by:</span>
          <button className="flex items-center gap-1 font-bold text-slate-900 hover:text-blue-600 transition-colors">
            Newest First <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <RequestSkeleton key={i} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">No Active Requests</h3>
          <p className="text-slate-500 max-w-sm mb-10 text-lg leading-relaxed">
            There are no delivery requests in your area right now. Stay online to be notified immediately.
          </p>
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-3 bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <RefreshCw className="w-5 h-5" />
            Scan for Requests
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <HorizontalRequestCard 
              key={request._id} 
              request={request} 
              index={index}
              onAccept={() => acceptMutation.mutate(request.parcelId)}
              onReject={() => rejectMutation.mutate(request._id)}
              isAccepting={acceptMutation.isPending && acceptMutation.variables === request.parcelId}
              isRejecting={rejectMutation.isPending && rejectMutation.variables === request._id}
              isDisabled={acceptMutation.isPending || rejectMutation.isPending}
            />
          ))}
          
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100 mt-8">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-blue-900">
              <span className="font-bold">Quick Tip:</span> Accept requests quickly to maintain your high acceptance rate and get more priority requests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, subtext, icon, color, loading }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12%</span>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg mb-2"></div>
        ) : (
          <p className="text-3xl font-black text-slate-900">{value}</p>
        )}
        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{label}</p>
        <p className="text-slate-400 text-xs mt-1 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

const TabButton = ({ label, count, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
      active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    <span className="font-bold">{label}</span>
    {count > 0 && (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const HorizontalRequestCard = ({ request, index, onAccept, onReject, isAccepting, isRejecting, isDisabled }) => {
  const isHighPriority = request.parcel?.parcelWeight > 5;
  const isFragile = request.parcel?.parcelType === 'fragile';
  
  return (
    <div 
      className="group bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 p-5 sm:p-6 overflow-hidden relative animate-in fade-in slide-in-from-bottom-6"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
        
        {/* Left: Icon & ID */}
        <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
            isHighPriority ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
          }`}>
            <Package className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-slate-900 font-black truncate">{request.trackingId}</span>
              {isHighPriority && <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">High Priority</span>}
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
              <span>{request.parcel?.parcelType}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {request.parcel?.parcelWeight}kg</span>
              {isFragile && (
                <>
                  <span>•</span>
                  <span className="text-orange-500">Fragile</span>
                </>
              )}
            </div>
            <p className="text-slate-400 text-[10px] mt-2 font-medium">Request time: {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Middle: Route */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-6 md:items-center border-t border-slate-50 pt-6 lg:border-t-0 lg:pt-0 lg:border-x lg:px-8">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white shadow-sm shadow-blue-200"></div>
              <div className="w-0.5 h-8 bg-dashed bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            </div>
            <div className="space-y-4 flex-1 min-w-0">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pickup Location</p>
                <p className="text-sm font-bold text-slate-900 truncate">{request.parcel?.senderDistrict}</p>
                <p className="text-[10px] text-slate-400 truncate">{request.parcel?.senderAddress}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Delivery Location</p>
                <p className="text-sm font-bold text-slate-900 truncate">{request.parcel?.receiverDistrict}</p>
                <p className="text-[10px] text-slate-400 truncate">{request.parcel?.receiverAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Earnings & Actions */}
        <div className="flex items-center justify-between lg:w-72 flex-shrink-0 gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Earnings</p>
            <p className="text-2xl font-black text-green-600">৳{Math.round(request.parcel?.totalPrice * 0.7)}</p>
            <div className="flex items-center justify-end gap-3 text-slate-400 text-[10px] font-bold mt-1 uppercase">
              <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> 4.2 km</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 20 min</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onReject}
              disabled={isDisabled}
              className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
              title="Reject"
            >
              {isRejecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            </button>
            <button 
              onClick={onAccept}
              disabled={isDisabled}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all active:scale-95 shadow-lg shadow-blue-200 group/btn disabled:opacity-50"
            >
              {isAccepting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Accept</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Auto-reject timer bar mockup */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden">
        <div className="h-full bg-blue-500 w-3/4"></div>
      </div>
    </div>
  );
};

const RequestSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-100 rounded w-24"></div>
          <div className="h-3 bg-slate-100 rounded w-32"></div>
        </div>
      </div>
      <div className="flex-1 h-20 bg-slate-50/50 rounded-2xl"></div>
      <div className="lg:w-72 h-16 bg-slate-100 rounded-2xl"></div>
    </div>
  </div>
);

export default ParcelRequests;
