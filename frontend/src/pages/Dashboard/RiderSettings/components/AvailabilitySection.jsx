import React, { useState, useEffect } from "react";
import { FiClock, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilitySection({ profile, onUpdate, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const [formData, setFormData] = useState({
    availableDays: [],
    availableHours: "",
    dayOffMode: ""
  });

  useEffect(() => {
    if (profile) {
      setIsOnline(profile.isOnline !== undefined ? profile.isOnline : false);
      setFormData({
        availableDays: Array.isArray(profile.availableDays) ? profile.availableDays : [],
        availableHours: profile.availableHours || "",
        dayOffMode: profile.dayOffMode || ""
      });
    }
  }, [profile]);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await onUpdate({ ...formData, isOnline: nextState });
  };

  const handleDayToggle = (day) => {
    const current = formData.availableDays;
    if (current.includes(day)) {
      setFormData({ ...formData, availableDays: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, availableDays: [...current, day] });
    }
  };

  const handleSave = async () => {
    await onUpdate({ ...formData, isOnline });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        availableDays: Array.isArray(profile.availableDays) ? profile.availableDays : [],
        availableHours: profile.availableHours || "",
        dayOffMode: profile.dayOffMode || ""
      });
    }
    setIsEditing(false);
  };

  return (
    <SettingsCard
      icon={FiClock}
      title="Availability Settings"
      description="Manage your availability and working schedule."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Online/Offline Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Online / Offline</h4>
            <p className="text-slate-500 text-xs mt-0.5">Accept delivery requests instantly</p>
          </div>

          <div className="flex items-center gap-4 my-6">
            <button
              onClick={handleToggleOnline}
              disabled={isUpdating}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                isOnline ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition-transform" />
            </button>
            <span className={`text-sm font-black tracking-wide ${isOnline ? "text-emerald-600" : "text-slate-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <p className={`text-xs font-semibold ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
            {isOnline ? "● You are accepting delivery requests" : "○ You are currently unavailable"}
          </p>
        </div>

        {/* Right Side: Work Schedule Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Work Schedule</h4>
              <p className="text-slate-500 text-xs mt-0.5">Set your regular working hours</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <FiEdit2 className="w-3 h-3 text-emerald-600" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <FiX />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
                >
                  <FiCheck />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1.5">Available Days</span>
              {!isEditing ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile?.availableDays && profile.availableDays.length > 0 ? (
                    profile.availableDays.map((day) => (
                      <span
                        key={day}
                        className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                      >
                        {day}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-slate-400">N/A</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isActive = formData.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer hover:scale-105 ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                            : "bg-slate-200/60 text-slate-500 border border-transparent"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">Available Hours</span>
                {!isEditing ? (
                  <p className="text-xs font-bold text-slate-900">{profile?.availableHours || "N/A"}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.availableHours}
                    onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                    placeholder="e.g. 09:00 AM - 06:00 PM"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                  />
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">Day Off Mode</span>
                {!isEditing ? (
                  <p className="text-xs font-bold text-slate-900">{profile?.dayOffMode || "N/A"}</p>
                ) : (
                  <select
                    value={formData.dayOffMode}
                    onChange={(e) => setFormData({ ...formData, dayOffMode: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                  >
                    <option value="">Select Day Off</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Friday">Friday</option>
                    <option value="None">None</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
