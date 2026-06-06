import React from 'react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeDetails = () => {
    switch (theme) {
      case 'light':
        return {
          icon: <FiSun className="w-[18px] h-[18px] text-amber-500 shrink-0" />,
          label: 'Light Mode',
        };
      case 'dark':
        return {
          icon: <FiMoon className="w-[18px] h-[18px] text-indigo-400 shrink-0" />,
          label: 'Dark Mode',
        };
      case 'system':
      default:
        return {
          icon: <FiMonitor className="w-[18px] h-[18px] text-emerald-500 shrink-0" />,
          label: 'System Mode',
        };
    }
  };

  const { icon, label } = getThemeDetails();

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 p-2.5 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold transition-all duration-300 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/60 text-gray-700 dark:text-slate-300 shadow-sm cursor-pointer select-none active:scale-95"
      title={`Theme: ${label}. Click to switch.`}
    >
      {icon}
      <span className="hidden sm:inline whitespace-nowrap">{label}</span>
    </button>
  );
};

export default ThemeToggle;
