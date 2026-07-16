import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdErrorOutline, MdAssignmentInd, MdClose } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const FailedAssignments = ({ failedAssignments }) => {
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [riderEmailInput, setRiderEmailInput] = useState('');
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { mutate: assignRider, isPending } = useMutation({
    mutationFn: async ({ trackingId, riderEmail }) => {
      const res = await axiosSecure.post(`/api/delivery-control/failed-assignments/${trackingId}/assign`, {
        riderEmail
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Rider manually assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['failedAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
      setSelectedParcel(null);
      setRiderEmailInput('');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to assign rider');
    }
  });

  const handleAssign = (e) => {
    e.preventDefault();
    if (!riderEmailInput) {
      toast.error("Please enter rider email");
      return;
    }
    assignRider({ trackingId: selectedParcel.trackingId, riderEmail: riderEmailInput });
  };

  return (
    <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-red-50/50 p-4 border-b border-red-150 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdErrorOutline className="text-red-650 w-5 h-5" />
          <h2 className="text-lg font-bold text-red-650">Failed Assignments ({failedAssignments.length})</h2>
        </div>
        <span className="text-xs text-red-700 font-medium">Parcels not accepted by riders within timeout</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-650 uppercase tracking-wider bg-slate-50/70">
              <th className="p-4">Tracking ID</th>
              <th className="p-4">Parcel Info</th>
              <th className="p-4">Area</th>
              <th className="p-4">Reason</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {failedAssignments.map((req, index) => (
                <motion.tr
                  key={req.trackingId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-150 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-semibold text-slate-905">{req.trackingId}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-850">{req.parcelType || 'Package'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{req.parcelWeight} kg</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-805">
                    {req.senderDistrict}
                  </td>
                  <td className="p-4 text-sm font-semibold text-red-650">
                    No rider accepted
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedParcel(req)}
                      className="px-4 py-1.5 rounded-lg bg-red-50 text-red-650 hover:bg-red-600 hover:text-white transition-colors border border-red-200 text-sm font-semibold shadow-sm"
                    >
                      Assign Manually
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Manual Assignment Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Manual Assignment</h3>
              <button 
                onClick={() => setSelectedParcel(null)}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-650 mb-1.5">Parcel</div>
              <div className="font-mono text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-200 font-semibold">
                {selectedParcel.trackingId} - {selectedParcel.senderDistrict}
              </div>
            </div>

            <form onSubmit={handleAssign}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-650 mb-2">Assign to Rider (Email)</label>
                <div className="relative">
                  <MdAssignmentInd className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={riderEmailInput}
                    onChange={(e) => setRiderEmailInput(e.target.value)}
                    placeholder="rider@example.com"
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedParcel(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 font-semibold shadow-md"
                >
                  {isPending && <span className="loading loading-spinner loading-sm"></span>}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FailedAssignments;
