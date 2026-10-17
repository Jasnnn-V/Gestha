import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, Home, BookOpen, Settings, Plus, Camera, Scan } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CowMascot } from './CowMascot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onCameraClick: () => void;
  onScanClick: () => void;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
  onCameraClick,
  onScanClick,
  criticalCount
}) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'home', icon: ClipboardList, label: 'Data Ternak' },
    { id: 'cows', icon: Home, label: 'Kandang' },
    { id: 'education', icon: BookOpen, label: 'Edukasi' },
    { id: 'settings', icon: Settings, label: 'Sistem' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r-8 border-black flex flex-col shadow-2xl z-50">
      {/* Header with Cow Logo */}
      <div className="p-8 border-b-4 border-black relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-black rounded-full opacity-5" />
        <div className="absolute bottom-[-10px] left-[-10px] w-16 h-16 bg-black rounded-full opacity-5" />

        <div className="flex gap-4 items-center relative z-10">
          <div className="bg-black p-2 rounded-full shadow-lg">
            <CowMascot size={56} mood={criticalCount > 0 ? 'alert' : 'happy'} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-black leading-tight tracking-tighter uppercase italic">GESTHA</h1>
            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.25em]">AI CATTLE WATCHER</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-b-4 border-black space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddClick}
          className="w-full bg-black text-white py-4 px-6 rounded-[24px] font-black text-sm uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] border-2 border-black"
        >
          <Plus className="w-5 h-5" />
          Tambah Sapi Baru
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCameraClick}
            className="bg-black text-white py-4 px-4 rounded-[20px] font-black text-xs uppercase flex flex-col items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-black"
          >
            <Camera className="w-5 h-5" />
            <span>Live</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onScanClick}
            className="bg-white text-black py-4 px-4 rounded-[20px] font-black text-xs uppercase flex flex-col items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-4 border-black"
          >
            <Scan className="w-5 h-5" />
            <span>Scan</span>
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-[20px] font-black text-sm uppercase transition-all relative",
                isActive
                  ? "bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                  : "text-black hover:bg-black/5 border-2 border-transparent hover:border-black/10"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
              <span className="tracking-tight">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-l-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t-4 border-black">
        <div className="bg-black/5 p-4 rounded-[20px] border-2 border-black/10">
          <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Versi Sistem</p>
          <p className="text-sm font-black text-black uppercase italic">v2.0.4 Enterprise</p>
        </div>
      </div>
    </aside>
  );
};
