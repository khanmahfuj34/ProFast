import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useNotifications } from "../../../contexts/NotificationContext";

import * as XLSX from "xlsx";

// Components
import EarningsHeader from "./components/EarningsHeader";
import EarningsStatsCards from "./components/EarningsStatsCards";
import EarningsAnalyticsChart from "./components/EarningsAnalyticsChart";
import EarningsBreakdownChart from "./components/EarningsBreakdownChart";
import PayoutSummaryCard from "./components/PayoutSummaryCard";
import EarningsHistoryTable from "./components/EarningsHistoryTable";
import PayoutHistoryModal from "./components/PayoutHistoryModal";

export default function RiderEarnings() {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  // State
  const [dateRange, setDateRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);

  // Fetch Earnings Dashboard Data
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["rider-earnings-dashboard", user?.email, dateRange, page, searchQuery, statusFilter],
    queryFn: async () => {
      const res = await axiosSecure.get("/rider/earnings-dashboard", {
        params: {
          range: dateRange,
          page,
          limit: 5,
          search: searchQuery,
          status: statusFilter
        }
      });
      return res.data;
    },
    enabled: !!user?.email
  });

  // Handle Socket.IO realtime earnings refresh
  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["rider-earnings-dashboard"] });
    };

    socket.on("earnings_updated", handleUpdate);
    socket.on("delivery_updated", handleUpdate);
    socket.on("rider_stats_updated", (data) => {
      if (data.email === user?.email) handleUpdate();
    });

    return () => {
      socket.off("earnings_updated", handleUpdate);
      socket.off("delivery_updated", handleUpdate);
      socket.off("rider_stats_updated");
    };
  }, [socket, user?.email, queryClient]);

  // Export Excel (.xlsx) Handler
  const handleExportExcel = () => {
    const exportData = dashboardData?.history?.allFilteredDeliveries || dashboardData?.history?.deliveries;
    if (!exportData || exportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const formattedData = exportData.map(d => ({
      "Date": d.date,
      "Order ID": d.trackingId,
      "Customer Name": d.customerName || d.customer || "Valued Customer",
      "Parcel Name": d.parcelName,
      "Delivery Type": d.deliveryType,
      "Earnings (৳)": d.earnings,
      "Payment Status": d.paymentStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Earnings History");
    XLSX.writeFile(workbook, `Rider_Earnings_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel report downloaded successfully!");
  };

  // Loading Skeleton State matching premium courier app UX
  if (isLoading && (!dashboardData || !dashboardData.stats)) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans animate-pulse space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-16 bg-slate-200 rounded-2xl w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 rounded-2xl w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const breakdown = dashboardData?.breakdown || {};
  const analytics = dashboardData?.analytics || {};
  const history = dashboardData?.history || { deliveries: [], pagination: {} };
  const payoutHistory = dashboardData?.payoutHistory || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <EarningsHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExport={handleExportExcel}
          isLoading={isLoading}
          onRefresh={() => {
            refetch();
            toast.success("Earnings data refreshed!");
          }}
        />

        {/* Stats Cards Row */}
        <EarningsStatsCards stats={stats} />

        {/* Earnings Analytics Section */}
        <EarningsAnalyticsChart analyticsData={analytics} />

        {/* Breakdown & Payout Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsBreakdownChart breakdown={breakdown} />
          <PayoutSummaryCard stats={stats} onViewHistory={() => setPayoutModalOpen(true)} />
        </div>

        {/* Earnings History Table Section */}
        <EarningsHistoryTable
          deliveries={history.deliveries}
          pagination={history.pagination}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onPageChange={setPage}
          onExportTable={handleExportExcel}
        />

        {/* Payout History Modal Dialog */}
        <PayoutHistoryModal
          isOpen={payoutModalOpen}
          onClose={() => setPayoutModalOpen(false)}
          payouts={payoutHistory}
        />
      </div>
    </div>
  );
}
