import React, { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiCheck, FiX, FiCamera } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

export default function ProfileSection({ profile, onUpdate, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    photo: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        photo: profile.photo || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        photo: profile.photo || ""
      });
    }
    setIsEditing(false);
  };

  return (
    <SettingsCard
      icon={FiUser}
      title="Account Settings"
      description="Manage your personal information and account details."
    >
      <div className="space-y-6">
        {/* Top Header & Edit Action */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Profile Information</h4>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <FiEdit2 className="w-3.5 h-3.5 text-emerald-600" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-sm"
              >
                <FiCheck className="w-3.5 h-3.5" />
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar Area */}
          <div className="relative">
            <img
              src={formData.photo || profile?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
              alt={profile?.name || "Avatar"}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-50 shadow-sm"
            />
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-slate-100 text-emerald-600 cursor-pointer hover:bg-emerald-50 transition">
                <FiCamera className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Image URL..."
                  className="hidden"
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                />
              </label>
            )}
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">Name</span>
              {!isEditing ? (
                <p className="text-sm font-bold text-slate-900">{profile?.name || "N/A"}</p>
              ) : (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                />
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">Email</span>
              <p className="text-sm font-bold text-slate-600 select-all">{profile?.email || "N/A"}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">Phone</span>
              {!isEditing ? (
                <p className="text-sm font-bold text-slate-900">{profile?.phone || "N/A"}</p>
              ) : (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                />
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">Gender</span>
              {!isEditing ? (
                <p className="text-sm font-bold text-slate-900">{profile?.gender || "N/A"}</p>
              ) : (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Date of Birth</span>
              {!isEditing ? (
                <p className="text-sm font-bold text-slate-900">{profile?.dateOfBirth || "N/A"}</p>
              ) : (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full sm:w-1/2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                />
              )}
            </div>

            {isEditing && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Avatar Image URL</span>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
