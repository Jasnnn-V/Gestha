import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Cow {
  id: string;
  name: string;
  tagId: string;
  dueDate: Date;
}

interface CalvingCalendarProps {
  cows: Cow[];
  onDateClick?: (date: Date, cows: Cow[]) => void;
}

export const CalvingCalendar: React.FC<CalvingCalendarProps> = ({ cows, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group cows by due date
  const cowsByDate = cows.reduce((acc, cow) => {
    const dateKey = format(cow.dueDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(cow);
    return acc;
  }, {} as Record<string, Cow[]>);

  const getCowsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return cowsByDate[dateKey] || [];
  };

  const getDateUrgency = (date: Date) => {
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 0) return 'past';
    if (daysUntil <= 7) return 'critical';
    if (daysUntil <= 21) return 'warning';
    return 'normal';
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  // Calculate start day of week (adjust for Monday start)
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  return (
    <div className="bg-white border-4 border-black rounded-[40px] p-6 lg:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h3>
          <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">Kalender Kelahiran</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToday}
            className="px-4 py-2 bg-black/5 border-2 border-black rounded-[16px] text-xs font-black uppercase"
          >
            Hari Ini
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="w-10 h-10 bg-black rounded-[16px] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="w-10 h-10 bg-black rounded-[16px] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
          <div key={day} className="text-center py-3">
            <span className="text-xs font-black text-black/40 uppercase">{day}</span>
          </div>
        ))}

        {/* Padding Days */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((date) => {
          const cowsOnDate = getCowsForDate(date);
          const isToday = isSameDay(date, new Date());
          const hasCows = cowsOnDate.length > 0;
          const urgency = hasCows ? getDateUrgency(date) : 'normal';

          return (
            <motion.button
              key={date.toISOString()}
              whileHover={{ scale: hasCows ? 1.05 : 1 }}
              whileTap={{ scale: hasCows ? 0.95 : 1 }}
              onClick={() => hasCows && onDateClick?.(date, cowsOnDate)}
              className={cn(
                "aspect-square rounded-[16px] border-2 p-2 flex flex-col items-center justify-center relative transition-all",
                isToday && "border-4 border-black",
                !hasCows && "border-black/10 hover:border-black/20",
                hasCows && urgency === 'critical' && "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
                hasCows && urgency === 'warning' && "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]",
                hasCows && urgency === 'normal' && "bg-white border-black/30",
                hasCows && urgency === 'past' && "bg-black/5 border-black/20 opacity-50"
              )}
            >
              <span className={cn(
                "text-sm font-black",
                hasCows && urgency === 'critical' ? "text-white" : "text-black"
              )}>
                {format(date, 'd')}
              </span>
              {hasCows && (
                <div className="mt-1 flex flex-col items-center gap-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    urgency === 'critical' ? "bg-white" : "bg-black"
                  )} />
                  <span className={cn(
                    "text-[8px] font-black",
                    urgency === 'critical' ? "text-white" : "text-black"
                  )}>
                    {cowsOnDate.length}
                  </span>
                </div>
              )}
              {isToday && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t-2 border-black/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded border-2 border-black" />
            <span className="text-xs font-black text-black/60 uppercase">Kritis (≤7 hari)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded border-2 border-black" />
            <span className="text-xs font-black text-black/60 uppercase">Siaga (≤21 hari)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded border-2 border-black/30" />
            <span className="text-xs font-black text-black/60 uppercase">Normal (&gt;21 hari)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-4 border-black rounded" />
            <span className="text-xs font-black text-black/60 uppercase">Hari Ini</span>
          </div>
        </div>
      </div>

      {/* Upcoming Births This Month */}
      <div className="mt-6 pt-6 border-t-2 border-black/10">
        <h4 className="text-sm font-black text-black uppercase italic mb-4">Kelahiran Bulan Ini</h4>
        {cows.filter(cow => isSameMonth(cow.dueDate, currentMonth)).length > 0 ? (
          <div className="space-y-2">
            {cows
              .filter(cow => isSameMonth(cow.dueDate, currentMonth))
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .map((cow) => {
                const daysUntil = differenceInDays(cow.dueDate, new Date());
                const urgency = getDateUrgency(cow.dueDate);
                return (
                  <div
                    key={cow.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-[16px] border-2",
                      urgency === 'critical' && "bg-black text-white border-black",
                      urgency === 'warning' && "bg-white border-black",
                      urgency === 'normal' && "bg-white border-black/20",
                      urgency === 'past' && "bg-black/5 border-black/10 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {urgency === 'critical' && <AlertTriangle className="w-4 h-4 text-white" />}
                      <div>
                        <p className="text-xs font-black uppercase">{cow.name}</p>
                        <p className={cn(
                          "text-[10px] font-bold uppercase",
                          urgency === 'critical' ? "text-white/60" : "text-black/60"
                        )}>
                          {cow.tagId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black">{format(cow.dueDate, 'd MMM', { locale: id })}</p>
                      <p className={cn(
                        "text-[10px] font-bold",
                        urgency === 'critical' ? "text-white/60" : "text-black/60"
                      )}>
                        {daysUntil > 0 ? `${daysUntil} hari` : 'Hari ini'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-6 bg-black/5 rounded-[20px] border-2 border-dashed border-black/10">
            <CalendarIcon className="w-12 h-12 text-black/20 mx-auto mb-2" />
            <p className="text-xs font-black text-black/40 uppercase">Tidak ada kelahiran bulan ini</p>
          </div>
        )}
      </div>
    </div>
  );
};
