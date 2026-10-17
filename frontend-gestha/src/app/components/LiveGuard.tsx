import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Shield, AlertCircle, X, Moon, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface LiveGuardProps {
  isOpen: boolean;
  onClose: () => void;
  cowName?: string;
}

export const LiveGuard: React.FC<LiveGuardProps> = ({ isOpen, onClose, cowName = "Simental 01" }) => {
  const [isGuarding, setIsGuarding] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [detectionLog, setDetectionLog] = useState<{time: string, msg: string, type: 'info' | 'warn'}[]>([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [activeDetections, setActiveDetections] = useState<string[]>([]);
  const [activeCow, setActiveCow] = useState<string>(cowName);
  const videoRef = useRef<HTMLVideoElement>(null);

  const displayTitle = cowName || "CCTV Kandang";

  // Start webcam when opened
  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraOn(true);
          }
        })
        .catch(() => setIsCameraOn(false));
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
      setIsCameraOn(false);
    };
  }, [isOpen]);

  // Simulation of real-time AI logs
  useEffect(() => {
    if (!isGuarding) return;

    const scenarios = [
      { delay: 3000, msg: "AI: Memantau pergerakan ekor pada Brahman Super...", cow: "Brahman Super", type: 'info' as const },
      { delay: 8000, msg: "Terdeteksi: Sapi mulai merebah (Limousin 02)", cow: "Limousin 02", type: 'warn' as const },
      { delay: 15000, msg: "PERINGATAN: Frekuensi kontraksi meningkat di Brahman Super!", cow: "Brahman Super", type: 'warn' as const },
    ];

    const timers = scenarios.map((item, index) =>
      setTimeout(() => {
        setDetectionLog(prev => [{ time: new Date().toLocaleTimeString(), msg: item.msg, type: item.type }, ...prev].slice(0, 5));
        setActiveCow(item.cow);
        if (item.type === 'warn') {
          setActiveDetections(prev => [...new Set([...prev, `${item.cow}: Melahirkan`])]);
          if (index === 2) triggerAlarm(item.cow);
        }
      }, item.delay)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, [isGuarding]);

  const scanWithAI = async () => {
  if (!videoRef.current) return;
  
  // Ambil frame dari webcam
  const canvas = document.createElement('canvas');
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(videoRef.current, 0, 0);
  const frameBase64 = canvas.toDataURL('image/jpeg');

  try {
    const res = await fetch('http://localhost:5000/camera/scan-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: frameBase64 })
    });
    const data = await res.json();
    
    const msg = `AI: ${data.status} (${(data.confidence * 100).toFixed(1)}%)`;
    setDetectionLog(prev => [
  { 
    time: new Date().toLocaleTimeString(), 
    msg, 
    type: (data.status === 'HAMIL' ? 'warn' : 'info') as 'warn' | 'info'
  },
  ...prev
].slice(0, 5));

    if (data.status === 'HAMIL') {
      toast.success(`Terdeteksi HAMIL! Confidence: ${(data.confidence * 100).toFixed(1)}%`);
    }
  } catch {
    toast.error('Gagal konek ke backend!');
  }
};

  const triggerAlarm = (targetCow: string) => {
    setIsAlarmActive(true);
    toast.error(`ALARM: ${targetCow} Melahirkan!`, { duration: 10000 });
  };

  const stopAlarm = () => {
    setIsAlarmActive(false);
    setIsGuarding(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[200] flex flex-col"
        >
          {/* Camera View Area */}
          <div className="relative flex-1 bg-slate-900 overflow-hidden">

            {/* Webcam Feed */}
            <div className="absolute inset-0">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/40 font-black uppercase tracking-widest text-sm">
                    Kamera Tidak Tersedia
                  </p>
                </div>
              )}
            </div>

            {/* AI Overlay Elements */}
            <div className="absolute inset-0 p-6 pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", isGuarding ? "bg-red-500" : "bg-slate-400")} />
                  <span className="text-white text-xs font-black uppercase tracking-widest">
                    {isGuarding ? 'REC • LIVE GUARD' : 'READY'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-full pointer-events-auto"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Scanning Box */}
              {isGuarding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-[15%] border-2 border-emerald-500/50 rounded-3xl"
                >
                  <motion.div
                    animate={{ y: [0, 200, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-[2px] w-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                  />
                  <div className="absolute top-4 left-4 space-y-2">
                    {activeDetections.map((d, i) => (
                      <div key={i} className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                        DETECTED: {d}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Alarm Overlay */}
            {isAlarmActive && (
              <motion.div
                animate={{ backgroundColor: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0)'] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
                  <AlertCircle className="w-16 h-16 text-red-600 animate-bounce" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">BANGUN!</h2>
                <p className="text-white font-bold mb-8">Tanda kelahiran intens terdeteksi pada {cowName}</p>
                <button
                  onClick={stopAlarm}
                  className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-lg shadow-xl active:scale-95 transition-all pointer-events-auto"
                >
                  SAYA SUDAH BANGUN
                </button>
              </motion.div>
            )}
          </div>

          {/* Controls Area */}
          <div className="bg-white border-t-8 border-black p-8 space-y-6 rounded-t-[48px]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-black font-black text-2xl uppercase italic tracking-tighter">{displayTitle}</h3>
                <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em]">Webcam • Pantauan Kandang Demo</p>
              </div>
              <div className="flex gap-4">
                <button className="p-3 bg-black text-white rounded-2xl shadow-lg"><Moon className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Log List */}
            <div className="bg-black/5 rounded-[32px] p-6 border-2 border-black/5 min-h-[140px]">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-black" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Live Intelligence Log</span>
              </div>
              <div className="space-y-3">
                {detectionLog.length > 0 ? detectionLog.map((log, i) => (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={i}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className={cn("font-black uppercase tracking-tight", log.type === 'warn' ? "text-black bg-white border border-black px-2 py-0.5 rounded" : "text-black/60")}>{log.msg}</span>
                    <span className="text-black/30 font-bold">{log.time}</span>
                  </motion.div>
                )) : (
                  <p className="text-black/20 text-xs font-black text-center mt-6 uppercase tracking-widest italic">Scanning Environment...</p>
                )}
              </div>
            </div>

            {!isAlarmActive && (
              <button
                onClick={() => {
                  setIsGuarding(!isGuarding);
                if (!isGuarding) scanWithAI();}
                }className={cn(
                  "w-full py-6 rounded-[32px] font-black text-xl transition-all flex items-center justify-center gap-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1",
                  isGuarding ? "bg-white text-black" : "bg-black text-white"
                )}
              >
                {isGuarding ? <Shield className="w-7 h-7" /> : <Camera className="w-7 h-7" />}
                {isGuarding ? "STOP GUARD" : "START AI GUARD"}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}