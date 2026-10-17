import React from 'react';
import {
  Users,
  Baby,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalvingCalendar } from './CalvingCalendar';
import { NotificationCenter } from './NotificationSystem';

interface DashboardProps {
  cows?: Array<{
    id: string;
    name: string;
    tagId: string;
    inseminationDate: Date;
    dueDate: Date;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({ cows = [] }) => {
  const data = [
    { name: 'Hamil', value: 3, color: '#000000' },
    { name: 'Tidak Hamil', value: 9, color: '#E5E7EB' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black text-white p-8 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Ternak</p>
            <h3 className="text-6xl font-black italic leading-none mb-4">12 <span className="text-xl">Ekor</span></h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase">3 Hamil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/30 rounded-full" />
                <span className="text-[10px] font-bold uppercase">9 Tidak Hamil</span>
              </div>
            </div>
          </div>
          <Users className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 -rotate-12" />
        </div>

        <div className="bg-white border-4 border-black p-6 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <StatSmall label="Kesuksesan IB" value="75%" icon={Baby} trend="+5% Bulan Ini" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatSmall label="Hamil" value="3" icon={Baby} trend="+1 bln ini" />
        <StatSmall label="Tidak Hamil" value="9" icon={XCircle} trend="-2 bln ini" />
      </div>

      {/* Distribution Chart */}
      <section className="bg-white border-4 border-black p-6 lg:p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Distribusi Status</h3>
          <PieChartIcon className="w-5 h-5" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="w-full" style={{ height: '256px', minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs lg:text-sm font-black uppercase border-b-2 border-black/5 pb-3">
              <span>Persentase Keberhasilan IB</span>
              <span>75%</span>
            </div>
            <div className="flex justify-between text-xs lg:text-sm font-black uppercase">
              <span>Rata-rata Masa Gestasi</span>
              <span>283 Hari</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Center */}
      {cows.length > 0 && (
        <NotificationCenter cows={cows} />
      )}

      {/* Calving Calendar */}
      {cows.length > 0 && (
        <CalvingCalendar
          cows={cows}
          onDateClick={(date, cowsOnDate) => {
            console.log('Date clicked:', date, cowsOnDate);
          }}
        />
      )}
    </div>
  );
};

const StatSmall = ({ label, value, icon: Icon, trend }: any) => (
  <div className="bg-white border-4 border-black p-6 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-black" />
      </div>
      <span className="text-[8px] font-black text-green-600 uppercase">{trend}</span>
    </div>
    <p className="text-[10px] font-black text-black/40 uppercase mb-1">{label}</p>
    <p className="text-3xl font-black italic">{value}</p>
  </div>
);
