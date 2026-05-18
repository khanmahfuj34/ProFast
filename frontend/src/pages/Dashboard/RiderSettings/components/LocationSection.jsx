import React, { useState } from "react";
import { FiMapPin, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

export default function LocationSection({ profile, onUpdate, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    division: profile?.division || "Dhaka",
    district: profile?.district || "Dhaka",
    currentAddress: profile?.currentAddress || "Mirpur 10, Dhaka 1216, Bangladesh",
    preferredDeliveryArea: profile?.preferredDeliveryArea || "Mirpur, Pallabi, Kallyanpur, Shyamoli"
  });

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      division: profile?.division || "Dhaka",
      district: profile?.district || "Dhaka",
      currentAddress: profile?.currentAddress || "Mirpur 10, Dhaka 1216, Bangladesh",
      preferredDeliveryArea: profile?.preferredDeliveryArea || "Mirpur, Pallabi, Kallyanpur, Shyamoli"
    });
    setIsEditing(false);
  };

  return (
    <SettingsCard
      icon={FiMapPin}
      title="Location Settings"
      description="Manage your location and delivery area preferences."
    >
      <div className="space-y-6">
        {/* Header & Edit Button */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Area & Coverage</h4>
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
            <span className="text-xs text-slate-400 font-semibold block mb-1">Division</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.division || "Dhaka"}</p>
            ) : (
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">District</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.district || "Dhaka"}</p>
            ) : (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Current Address</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.currentAddress || "Mirpur 10, Dhaka 1216, Bangladesh"}</p>
            ) : (
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Preferred Delivery Area</span>
            {!isEditing ? (
              <p className="text-sm font-bold text-slate-900">{profile?.preferredDeliveryArea || "Mirpur, Pallabi, Kallyanpur, Shyamoli"}</p>
            ) : (
              <input
                type="text"
                value={formData.preferredDeliveryArea}
                onChange={(e) => setFormData({ ...formData, preferredDeliveryArea: e.target.value })}
                placeholder="e.g. Mirpur, Dhanmondi, Gulshan..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition"
              />
            )}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
