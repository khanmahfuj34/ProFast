import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// Components
import SettingsHeader from "./components/SettingsHeader";
import ProfileSection from "./components/ProfileSection";
import LocationSection from "./components/LocationSection";
import VehicleSection from "./components/VehicleSection";
import AvailabilitySection from "./components/AvailabilitySection";
import SecuritySection from "./components/SecuritySection";
import SupportSection from "./components/SupportSection";

export default function RiderSettings() {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // Fetch Rider Profile & Settings
  const {
    data: profile,
    isLoading: isProfileLoading
  } = useQuery({
    queryKey: ["rider-settings-profile", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/rider-settings/profile");
      return res.data;
    },
    enabled: !!user?.email
  });

  // Fetch Active Sessions
  const {
    data: sessions,
    isLoading: isSessionsLoading
  } = useQuery({
    queryKey: ["rider-settings-sessions", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/rider-settings/security/sessions");
      return res.data;
    },
    enabled: !!user?.email
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/api/rider-settings/profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rider-settings-profile"]);
      toast.success("Profile information updated successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update profile.")
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/api/rider-settings/location", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rider-settings-profile"]);
      toast.success("Location coverage updated successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update location.")
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/api/rider-settings/vehicle", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rider-settings-profile"]);
      toast.success("Vehicle records updated successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update vehicle.")
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/api/rider-settings/availability", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rider-settings-profile"]);
      toast.success("Availability schedule updated successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update availability.")
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword) => {
      const res = await axiosSecure.put("/api/rider-settings/security/password", { password: newPassword });
      return res.data;
    },
    onSuccess: () => toast.success("Account password updated successfully!"),
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update password.")
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.post("/api/rider-settings/security/logout-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rider-settings-sessions"]);
      toast.success("Logged out from all external devices.");
    },
    onError: (err) => toast.error("Failed to revoke external sessions.")
  });

  const supportMutation = useMutation({
    mutationFn: async (ticketData) => {
      const res = await axiosSecure.post("/api/rider-settings/support/contact", ticketData);
      return res.data;
    },
    onSuccess: (data) => toast.success(data?.message || "Support ticket submitted!"),
    onError: (err) => toast.error("Failed to submit ticket.")
  });

  if (isProfileLoading || isSessionsLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans animate-pulse space-y-6 max-w-7xl mx-auto">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <SettingsHeader />

        {/* Profile Section */}
        <ProfileSection
          profile={profile}
          onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
          isUpdating={updateProfileMutation.isPending}
        />

        {/* Location Section */}
        <LocationSection
          profile={profile}
          onUpdate={(data) => updateLocationMutation.mutateAsync(data)}
          isUpdating={updateLocationMutation.isPending}
        />

        {/* Vehicle Section */}
        <VehicleSection
          profile={profile}
          onUpdate={(data) => updateVehicleMutation.mutateAsync(data)}
          isUpdating={updateVehicleMutation.isPending}
        />

        {/* Availability Section */}
        <AvailabilitySection
          profile={profile}
          onUpdate={(data) => updateAvailabilityMutation.mutateAsync(data)}
          isUpdating={updateAvailabilityMutation.isPending}
        />

        {/* Security Section */}
        <SecuritySection
          sessions={sessions}
          onLogoutAll={() => logoutAllMutation.mutateAsync()}
          onUpdatePassword={(pwd) => updatePasswordMutation.mutateAsync(pwd)}
          isUpdating={updatePasswordMutation.isPending || logoutAllMutation.isPending}
        />

        {/* Support Section */}
        <SupportSection
          onSubmitSupport={(ticket) => supportMutation.mutateAsync(ticket)}
          isSubmitting={supportMutation.isPending}
        />
      </div>
    </div>
  );
}
