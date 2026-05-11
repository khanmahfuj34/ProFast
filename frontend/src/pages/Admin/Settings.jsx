import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailAlerts: true,
    maintenanceMode: false,
    twoFactorAuth: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage system configurations and preferences</p>
      </div>

      {/* General Settings */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <h3 className="text-white font-semibold">Push Notifications</h3>
              <p className="text-slate-400 text-sm mt-1">Enable real-time push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={() => handleToggle('notificationsEnabled')}
              className="toggle toggle-emerald"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <h3 className="text-white font-semibold">Email Alerts</h3>
              <p className="text-slate-400 text-sm mt-1">Receive email notifications for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={() => handleToggle('emailAlerts')}
              className="toggle toggle-emerald"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
              <p className="text-slate-400 text-sm mt-1">Enhance account security with 2FA</p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={() => handleToggle('twoFactorAuth')}
              className="toggle toggle-emerald"
            />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <h3 className="text-white font-semibold">Maintenance Mode</h3>
              <p className="text-slate-400 text-sm mt-1">Enable maintenance mode to prevent user access</p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={() => handleToggle('maintenanceMode')}
              className="toggle toggle-orange"
            />
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <h3 className="text-white font-semibold mb-3">API Configuration</h3>
            <input
              type="text"
              placeholder="API Key"
              className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg placeholder-slate-500 mb-3"
            />
            <input
              type="text"
              placeholder="API Endpoint"
              className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
          Save Changes
        </button>
        <button className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Settings;
