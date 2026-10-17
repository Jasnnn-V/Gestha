import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  ChevronLeft, 
  Check, 
  RefreshCw, 
  Cpu, 
  Zap, 
  Calendar,
  AlertCircle,
  ArrowRight,
  Maximize,
  Image as ImageIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'selection' | 'capture_side' | 'capture_back' | 'preview' | 'processing' | 'result';

interface NewDetectionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cows: any[];
}

export const NewDetectionFlow: React.FC<NewDetectionFlowProps> = ({ isOpen, onClose, cows }) => {
  const [step, setStep] = useState<Step>('selection');
  const [selectedCow, setSelectedCow] = useState<any>(null);
  const [photos, setPhotos] = useState<{ side?: string; back?: string }>({});
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleStartAnalysis = () => {
    setStep('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p < 20) setStatusText('Preprocessing: Resizing to 224x224...');
      else if (p < 40) setStatusText('Normalizing pixel values [0, 1]...');
      else if (p < 70) setStatusText('Running MobileNetV2 Inference...');
      else if (p < 90) setStatusText('Calculating Confidence Score...');
      else setStatusText('Finalizing results...');

      if (p >= 100) {
        clearInterval(interval);
        setStep('result');
      }
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[110] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b-4 border-black flex items-center justify-between bg-white">
        <button onClick={onClose} className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Deteksi Baru</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 'selection' && (
          <div className="space-y-6">
            <div className="bg-black text-white p-6 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
              <h3 className="text-lg font-black uppercase italic mb-2">Pilih Sapi</h3>
              <p className="text-[10px] font-bold uppercase opacity-60">Pilih subjek yang akan dideteksi kehamilannya</p>
            </div>
            <div className="grid gap-4">
              {cows.map(cow => (
                <button 
                  key={cow.id}
                  onClick={() => { setSelectedCow(cow); setStep('capture_side'); }}
                  className="p-5 border-4 border-black rounded-[24px] flex justify-between items-center hover:bg-black hover:text-white group transition-all"
                >
                  <div>
                    <p className="font-black uppercase italic text-lg">{cow.name}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest group-hover:text-white/60">Tag: {cow.tagId}</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>
        )}

        {(step === 'capture_side' || step === 'capture_back') && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black uppercase italic leading-none">{step === 'capture_side' ? 'Sisi Samping' : 'Sisi Belakang'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-black/40">Pastikan pencahayaan cukup</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black italic">{step === 'capture_side' ? '1' : '2'}</span>
                <span className="text-sm font-black text-black/20">/2</span>
              </div>
            </div>

            <div className="aspect-[3/4] bg-zinc-100 border-4 border-black rounded-[40px] relative overflow-hidden flex items-center justify-center">
              <img 
                src={step === 'capture_side' 
                  ? "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800" 
                  : "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800"} 
                className="w-full h-full object-cover grayscale opacity-50"
              />
              {/* Frame Guide */}
              <div className="absolute inset-8 border-2 border-dashed border-black/30 rounded-[24px]">
                <div className="absolute top-1/2 left-0 right-0 border-t border-black/10" />
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-black/10" />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Position abdomen inside frame
              </div>
            </div>

            <button 
              onClick={() => {
                if (step === 'capture_side') setStep('capture_back');
                else setStep('preview');
              }}
              className="w-full py-6 bg-black text-white rounded-[32px] font-black text-xl uppercase italic flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <Camera className="w-6 h-6" /> Ambil Foto
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase italic">Preview Foto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="aspect-square bg-zinc-100 border-4 border-black rounded-[24px] overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale" />
                </div>
                <p className="text-[10px] font-black uppercase text-center">Samping</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-square bg-zinc-100 border-4 border-black rounded-[24px] overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale" />
                </div>
                <p className="text-[10px] font-black uppercase text-center">Belakang</p>
              </div>
            </div>

            <div className="bg-zinc-50 border-2 border-black border-dashed p-6 rounded-[32px]">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-xs font-black uppercase">Quality Check Passed</p>
              </div>
              <p className="text-[10px] font-bold text-black/40 uppercase">Pencahayaan & fokus optimal untuk analisis MobileNetV2</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep('capture_side')}
                className="flex-1 py-4 border-4 border-black rounded-[24px] font-black text-sm uppercase italic flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button 
                onClick={handleStartAnalysis}
                className="flex-[2] py-4 bg-black text-white rounded-[24px] font-black text-sm uppercase italic flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" /> Proses AI
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative">
              <div className="w-48 h-48 border-8 border-black rounded-full flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-12px] border-t-8 border-black rounded-full"
                />
                <Cpu className="w-20 h-20 animate-pulse" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-black italic">
                {progress}%
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Menganalisis Citra...</h3>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em]">{statusText}</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6 pb-10">
            <div className="bg-black text-white p-8 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Hasil Analisis AI</p>
                <h3 className="text-4xl font-black uppercase italic leading-none mb-4">Bunting</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-white" />
                  </div>
                  <span className="text-xs font-black italic">92.4% Confidence</span>
                </div>
              </div>
              <Zap className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 border-4 border-black rounded-[32px] bg-white">
                <p className="text-[10px] font-black uppercase text-black/40 mb-1">Usia Kebuntingan</p>
                <p className="text-2xl font-black">~7.2 <span className="text-xs">Bulan</span></p>
              </div>
              <div className="p-6 border-4 border-black rounded-[32px] bg-white">
                <p className="text-[10px] font-black uppercase text-black/40 mb-1">Status Fisik</p>
                <p className="text-2xl font-black">Sehat</p>
              </div>
            </div>

            <div className="p-8 border-4 border-black rounded-[40px] bg-zinc-50">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6" />
                <h4 className="text-lg font-black uppercase italic tracking-tight">Prediksi Kelahiran</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b-2 border-black/5 pb-2">
                  <p className="text-[10px] font-black uppercase text-black/40">Expected Date (ECD)</p>
                  <p className="font-black italic text-lg">{format(addDays(new Date(), 60), 'dd MMM yyyy')}</p>
                </div>
                <div className="bg-white border-2 border-black p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <p className="text-[10px] font-bold leading-relaxed uppercase">Notifikasi otomatis telah dijadwalkan untuk H-7 dan H-2 kelahiran.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-6 bg-black text-white rounded-[32px] font-black text-xl uppercase italic flex items-center justify-center gap-4"
            >
              Simpan ke Database
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
