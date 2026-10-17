import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'red' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-5 rounded-[28px] border-4 border-black flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center border-2 border-black", color === 'red' ? 'bg-black text-white' : 'bg-white text-black')}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">{label}</p>
        <p className="text-2xl font-black text-black leading-none">{value}</p>
      </div>
    </div>
  );
};
