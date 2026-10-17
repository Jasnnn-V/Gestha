import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Cow {
  id: string;
  name: string;
  tagId: string;
  inseminationDate: Date;
  status: 'normal' | 'warning' | 'critical';
  signs: string[];
}

interface CowCardProps {
  cow: Cow;
  onClick: (cow: Cow) => void;
}

export const CowCard: React.FC<CowCardProps> = ({ cow, onClick }) => {
  const pregnancyDuration = 283; // Average gestation period for cows
  const dueDate = addDays(cow.inseminationDate, pregnancyDuration);
  const daysLeft = differenceInDays(dueDate, new Date());
  const progress = Math.min(100, Math.max(0, ((pregnancyDuration - daysLeft) / pregnancyDuration) * 100));

  const getStatusColor = () => {
    if (daysLeft <= 7) return 'bg-red-500';
    if (daysLeft <= 21) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusBg = () => {
    if (daysLeft <= 7) return 'bg-red-50';
    if (daysLeft <= 21) return 'bg-amber-50';
    return 'bg-emerald-50';
  };

  const getStatusText = () => {
    if (daysLeft <= 0) return 'Waktu Melahirkan!';
    if (daysLeft <= 7) return 'Sangat Kritis';
    if (daysLeft <= 21) return 'Siaga';
    return 'Normal';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(cow)}
      className={cn(
        "relative overflow-hidden rounded-[32px] border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        cow.urgency === 'high' ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "w-16 h-16 rounded-[24px] border-2 border-black flex items-center justify-center text-3xl",
            cow.urgency === 'high' ? "bg-white" : "bg-black"
          )}>
            🐄
          </div>
          <div>
            <h3 className={cn("text-xl font-black leading-tight", cow.urgency === 'high' ? "text-white" : "text-black")}>{cow.name}</h3>
            <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40")}>TAG: {cow.tagId}</p>
          </div>
        </div>
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-black",
          cow.urgency === 'high' ? "bg-white text-black" : "bg-black text-white"
        )}>
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
          <span>Prediksi: {format(dueDate, 'dd MMM yyyy')}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-500">Kemajuan Kehamilan</span>
            <span className="text-slate-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn("h-full transition-all duration-1000", getStatusColor())}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
          <div className="flex items-center">
            <AlertCircle className={cn("w-4 h-4 mr-1", daysLeft <= 7 ? "text-red-500" : "text-slate-400")} />
            <span className="text-xs font-semibold text-slate-600">
              {daysLeft > 0 ? `${daysLeft} hari lagi` : "Sudah waktunya"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </motion.div>
  );
};
