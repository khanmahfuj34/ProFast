import React, { useState } from "react";
import { FiTruck, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

export default function VehicleSection({ profile, onUpdate, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bikeType: profile?.bikeType || "Yamaha FZS V3",
    bikeRegistration: profile?.bikeRegistration || "Dhaka Metro LA-11-1234",
    drivingLicense: profile?.drivingLicense || "DL-987654321",
    nidNumber: profile?.nidNumber || "19987654321000123"
  });

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      bikeType: profile?.bikeType || "Yamaha FZS V3",
      bikeRegistration: profile?.bikeRegistration || "Dhaka Metro LA-11-1234",
      drivingLicense: profile?.drivingLicense || "DL-987654321",
      nidNumber: profile?.nidNumber || "19987654321000123"
    });
    setIsEditing(false);
  };

  return (
    <SettingsCard
      icon={FiTruck}
      title="Vehicle Information"
      description="Manage your vehicle and document information."
    >
      <div className="space-y-6">
        {/* Header & Edit Button */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Registration & Verification</h4>
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">Bike Type</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.bikeType || "Yamaha FZS V3"}</p>
            ) : (
              <input
                type="text"
                value={formData.bikeType}
                onChange={(e) => setFormData({ ...formData, bikeType: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">Bike Registration</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.bikeRegistration || "Dhaka Metro LA-11-1234"}</p>
            ) : (
              <input
                type="text"
                value={formData.bikeRegistration}
                onChange={(e) => setFormData({ ...formData, bikeRegistration: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">Driving License</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.drivingLicense || "DL-987654321"}</p>
            ) : (
              <input
                type="text"
                value={formData.drivingLicense}
                onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">NID Number</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.nidNumber || "19987654321000123"}</p>
            ) : (
              <input
                type="text"
                value={formData.nidNumber}
                onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
