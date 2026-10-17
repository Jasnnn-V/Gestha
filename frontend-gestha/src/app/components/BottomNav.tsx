import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, Home, BookOpen, Settings, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BottomNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'home', icon: ClipboardList, label: 'Data' },
    { id: 'cows', icon: Home, label: 'Kandang' },
    { id: 'education', icon: BookOpen, label: 'Edukasi' },
    { id: 'settings', icon: Settings, label: 'Sistem' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black px-8 pb-8 pt-4 flex justify-between items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all relative",
            activeTab === tab.id ? "text-black scale-110" : "text-black/30"
          )}
        >
          <tab.icon className={cn("w-7 h-7", activeTab === tab.id ? "stroke-[3px]" : "stroke-[2px]")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-4 w-10 h-1.5 bg-black rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-28 right-6 w-16 h-16 bg-black text-white rounded-[24px] shadow-xl border-4 border-white flex items-center justify-center active:scale-90 transition-transform z-40"
  >
    <Plus className="w-9 h-9 stroke-[3px]" />
  </button>
);
