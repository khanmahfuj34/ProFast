import React, { useState } from "react";
import { FiLock, FiSmartphone, FiCheckCircle, FiX, FiLogOut } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

export default function SecuritySection({ sessions, onLogoutAll, onUpdatePassword, isUpdating }) {
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) return;
    await onUpdatePassword(newPassword);
    setNewPassword("");
    setPwdModalOpen(false);
  };

  return (
    <SettingsCard
      icon={FiLock}
      title="Security Settings"
      description="Manage your password and account security."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Password Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between items-start space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Password</h4>
            <p className="text-slate-500 text-xs mt-0.5">Change your account password securely</p>
          </div>

          <button
            onClick={() => setPwdModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50/70 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
          >
            <FiLock className="w-4 h-4" />
            Change Password
          </button>
        </div>

        {/* Device & Session Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between items-start space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Device & Session</h4>
            <p className="text-slate-500 text-xs mt-0.5">Manage your active logged in devices</p>
          </div>

          <button
            onClick={() => setDevicesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50/70 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
          >
            <FiSmartphone className="w-4 h-4" />
            Manage Devices
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Change Account Password</h3>
              <button onClick={() => setPwdModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">New Password (min 6 characters)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPwdModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={isUpdating || newPassword.length < 6}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Devices Modal */}
      {devicesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Active Sessions</h3>
                <p className="text-slate-500 text-xs mt-0.5">Devices currently authenticated to your account</p>
              </div>
              <button onClick={() => setDevicesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(sessions || []).map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                      <FiSmartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {s.device}
                        {s.isCurrent && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            THIS DEVICE
                          </span>
                        )}
                      </h5>
                      <p className="text-xs text-slate-500">{s.location} • IP: {s.ip}</p>
                      <span className="text-[10px] font-bold text-slate-400">Last Active: {s.lastActive}</span>
                    </div>
                  </div>
                  {s.isCurrent ? (
                    <FiCheckCircle className="text-emerald-600 w-5 h-5" />
                  ) : (
                    <button
                      onClick={() => onLogoutAll()}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  onLogoutAll();
                  setDevicesModalOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs cursor-pointer transition shadow-2xs"
              >
                <FiLogOut />
                Logout from all devices
              </button>
              <button
                onClick={() => setDevicesModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
