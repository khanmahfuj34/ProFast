import React from 'react';
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
  FiRefreshCw as RefreshCw
} from 'react-icons/fi';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useNotifications } from '../../../contexts/NotificationContext';

const ParcelRequests = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  // Fetch pending requests
  const { data: requestsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['rider-parcel-requests', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/rider/parcel-requests');
      return res.data;
    },
    enabled: !!user?.email,
    refetchInterval: 30000 // Refetch every 30s as fallback
  });

  // Listen for real-time updates
  React.useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => {
      queryClient.invalidateQueries(['rider-parcel-requests']);
      toast.success('New delivery request available!', { icon: '📦' });
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
    onSuccess: (data) => {
      toast.success('Parcel accepted! Start your journey.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Scanning for delivery requests...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-6 max-w-md">We're having trouble reaching the dispatch server. Please check your internet connection.</p>
        <button 
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const requests = requestsData?.requests || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Dispatch <span className="text-blue-600">Center</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live requests matching your current district
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Tasks</p>
            <p className="text-xl font-black text-slate-900">{requests.length} Requests</p>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Quiet right now</h3>
          <p className="text-slate-500 max-w-sm mb-8 leading-relaxed font-medium">
            There are no new delivery requests in your area at the moment. Keep your status 
            <span className="text-green-600 font-bold"> Online</span> to receive instant notifications.
          </p>
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-6 py-3 rounded-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Check for Updates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map((request, index) => (
            <div 
              key={request._id}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-blue-200 hover:shadow-blue-100/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Top - Earning & Type */}
              <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg text-white">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Potential Earning</p>
                    <p className="text-white text-xl font-black">৳{Math.round(request.parcel?.totalPrice * 0.7)}</p>
                  </div>
                </div>
                <div className="bg-blue-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {request.parcel?.parcelType}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6">
                {/* Parcel Info */}
                <div>
                  <h4 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {request.parcel?.parcelName}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    ID: {request.trackingId}
                  </p>
                </div>

                {/* Route Visualization */}
                <div className="space-y-4 relative">
                  <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-dashed bg-slate-200"></div>
                  
                  <div className="flex items-start gap-4">
                    <div className="z-10 bg-blue-50 p-1.5 rounded-full ring-4 ring-white">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup From</p>
                      <p className="text-sm font-bold text-slate-700">{request.parcel?.senderDistrict}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{request.parcel?.senderAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="z-10 bg-orange-50 p-1.5 rounded-full ring-4 ring-white">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deliver To</p>
                      <p className="text-sm font-bold text-slate-700">{request.parcel?.receiverDistrict}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{request.parcel?.receiverAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</p>
                      <p className="text-xs font-bold text-slate-700">{request.parcel?.parcelWeight}kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received</p>
                      <p className="text-xs font-bold text-slate-700">{new Date(request.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => rejectMutation.mutate(request._id)}
                    disabled={rejectMutation.isPending || acceptMutation.isPending}
                    className="flex-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Skip
                  </button>
                  <button 
                    onClick={() => acceptMutation.mutate(request.parcelId)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                  >
                    {acceptMutation.isPending ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Accept Task
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParcelRequests;
