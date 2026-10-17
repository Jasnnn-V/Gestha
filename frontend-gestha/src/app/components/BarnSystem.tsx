import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Cpu, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  Wifi, 
  HardDrive,
  Activity,
  ChevronRight,
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BarnSystem: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Barn Status Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic">Status Kandang</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-black rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase">Sistem Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SystemCard 
            icon={Thermometer} 
            label="Suhu" 
            value="26.4°C" 
            sub="Optimal" 
            color="white"
          />
          <SystemCard 
            icon={Droplets} 
            label="Humid" 
            value="68%" 
            sub="+2% dari kemarin" 
            color="white"
          />
          <SystemCard 
            icon={Wind} 
            label="Kipas" 
            value="On" 
            sub="Speed: Auto" 
            color="white"
          />
          <SystemCard 
            icon={Activity} 
            label="Amonia" 
            value="12ppm" 
            sub="Aman" 
            color="white"
          />
        </div>
      </section>

      {/* System Infrastructure Section */}
      <section>
        <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic mb-6">Infrastruktur AI</h2>
        <div className="bg-white border-4 border-black rounded-[40px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-6">
            <InfraItem 
              icon={Cpu} 
              title="Gestha Core AI" 
              desc="Model: Maternity-CNN v2.1" 
              status="Running"
            />
            <InfraItem 
              icon={Wifi} 
              title="Hub Konektivitas" 
              desc="8 Node Terkoneksi" 
              status="Strong"
            />
            <InfraItem 
              icon={HardDrive} 
              title="Penyimpanan Cloud" 
              desc="24/7 Recording Active" 
              status="Normal"
            />
            <InfraItem 
              icon={ShieldCheck} 
              title="Protokol Keamanan" 
              desc="Enkripsi End-to-End" 
              status="Secure"
            />
          </div>
        </div>
      </section>

      {/* Quick Action */}
<motion.button 
  whileTap={{ scale: 0.95 }}
  onClick={() => alert('Fitur Konfigurasi Sistem akan segera tersedia. Hubungi admin untuk pengaturan lebih lanjut.')}
  className="w-full py-6 bg-black text-white rounded-[32px] font-black text-xl uppercase italic flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
>
        <Settings className="w-6 h-6" /> Konfigurasi Sistem
      </motion.button>
    </div>
  );
};

const SystemCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-white border-4 border-black p-6 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-black leading-none mb-2">{value}</p>
    <p className="text-[10px] font-bold text-black/60">{sub}</p>
  </div>
);

const InfraItem = ({ icon: Icon, title, desc, status }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-black text-sm uppercase leading-none mb-1">{title}</h4>
        <p className="text-[10px] font-bold text-black/40 uppercase">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-black/20">{status}</span>
      <ChevronRight className="w-4 h-4 text-black/20" />
    </div>
  </div>
);
