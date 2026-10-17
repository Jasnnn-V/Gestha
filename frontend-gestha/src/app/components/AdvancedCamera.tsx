import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Shield, 
  Activity, 
  AlertCircle, 
  Eye, 
  Settings,
  Wind,
  Thermometer,
  Zap,
  Target
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CameraOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const AdvancedCamera: React.FC<CameraOverlayProps> = ({ isOpen, onClose, title }) => {
  const [scanPos, setScanPos] = useState(0);
  const [isDetected, setIsDetected] = useState(false);
  const [detectedCows, setDetectedCows] = useState<{id: string, x: number, y: number, name: string, confidence: number}[]>([]);
  const [metrics, setMetrics] = useState({ temp: 38.5, hum: 65, air: 'Good' });
  const [logs, setLogs] = useState<{time: string, text: string}[]>([]);

  // Scanning animation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScanPos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulation of detections
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.7) {
        const newCow = {
          id: Math.random().toString(36).substr(2, 4),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 50,
          name: ['Brahman 01', 'Limousin A', 'Simental 12'][Math.floor(Math.random() * 3)],
          confidence: 85 + Math.random() * 14
        };
        setDetectedCows([newCow]);
        setIsDetected(true);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `AI: ${newCow.name} terdeteksi (${newCow.confidence.toFixed(1)}%)` }, ...prev].slice(0, 5));
        
        setTimeout(() => setIsDetected(false), 3000);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
      >
        {/* Header UI */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none">{title}</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">AI LIVE FEED • 4K ULTRA HD</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden flex items-center justify-center">
          {/* Simulated Camera Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Simulated Image */}
          <img 
            src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-overlay"
            alt="Live feed"
          />

          {/* AI Overlays */}
          <div className="absolute inset-0">
            {/* Scan Line */}
            <motion.div 
              style={{ top: `${scanPos}%` }}
              className="absolute left-0 right-0 h-[2px] bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20"
            />

            {/* Target Boxes */}
            {detectedCows.map(cow => (
              <motion.div
                key={cow.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDetected ? 1 : 0 }}
                style={{ left: `${cow.x}%`, top: `${cow.y}%` }}
                className="absolute w-40 h-40 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
              >
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white" />
                
                <div className="absolute -top-12 left-0 bg-white text-black px-3 py-1 text-[10px] font-black uppercase italic whitespace-nowrap">
                  {cow.name} [{cow.confidence.toFixed(1)}%]
                </div>
                <div className="absolute top-full left-0 mt-2 bg-black/50 backdrop-blur-md text-white/80 px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-white/20">
                  MATERNITY STATUS: HIGH RISK
                </div>
              </motion.div>
            ))}

            {/* Corner Viewfinder Decorations */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/20" />
          </div>

          {/* HUD Sidebar Left */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-4">
            <MetricBlock icon={Thermometer} label="TEMP" value="38.5°C" />
            <MetricBlock icon={Wind} label="AIR" value="GOOD" />
            <MetricBlock icon={Zap} label="ENERGY" value="98%" />
          </div>

          {/* HUD Sidebar Right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4 flex flex-col items-end">
            <div className="w-1.5 h-32 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                animate={{ height: ['40%', '60%', '50%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-0 w-full bg-white"
              />
            </div>
            <p className="text-[8px] font-black text-white/40 uppercase vertical-text">Signal Quality</p>
          </div>
        </div>

        {/* Footer Logs */}
        <div className="bg-white p-8 rounded-t-[48px] border-t-8 border-black">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-black" />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Live Analysis Logs</h3>
          </div>
          <div className="space-y-3 mb-8">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className="flex justify-between items-center text-xs border-b border-black/5 pb-2">
                <span className="font-black text-black uppercase tracking-tight">{log.text}</span>
                <span className="text-black/30 font-bold">{log.time}</span>
              </div>
            )) : (
              <p className="text-black/20 text-xs font-black uppercase tracking-widest animate-pulse">Scanning farm perimeter...</p>
            )}
          </div>
          <button 
            className="w-full py-5 bg-black text-white rounded-[32px] font-black text-lg uppercase italic flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Shield className="w-6 h-6" /> Trigger Manual Alarm
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const MetricBlock = ({ icon: Icon, label, value }: any) => (
  <div className="bg-black/40 backdrop-blur-xl border border-white/20 p-3 rounded-2xl flex flex-col items-center gap-1 w-16">
    <Icon className="w-4 h-4 text-white" />
    <span className="text-[8px] font-black text-white/40 uppercase">{label}</span>
    <span className="text-[10px] font-black text-white">{value}</span>
  </div>
);
