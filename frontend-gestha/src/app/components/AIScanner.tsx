import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Thermometer, Upload, X, CheckCircle2, AlertCircle, Scan, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

interface AIScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export interface AnalysisResult {
  status: 'Bunting' | 'Tidak Bunting';
  confidence: number;
  estimatedAge?: string;
  morphologyFindings: string[];
  thermalFindings: string[];
  type: 'Hybrid' | 'Visual' | 'Thermal';
}

export const AIScanner: React.FC<AIScannerProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [step, setStep] = useState<'selection' | 'uploading' | 'analyzing' | 'result'>('selection');
  const [scanType, setScanType] = useState<'visual' | 'thermal' | 'hybrid' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartAnalysis = (type: 'visual' | 'thermal' | 'hybrid') => {
    setScanType(type);
    setStep('uploading');
  };

  const simulateAnalysis = () => {
    setIsProcessing(true);
    setStep('analyzing');
    
    // Simulate complex AI processing time
    setTimeout(() => {
      const result: AnalysisResult = {
        status: 'Bunting',
        confidence: 92.4,
        estimatedAge: '185 Hari (Trimester 2)',
        morphologyFindings: [
          'Pembesaran Abdomen Lateral Kanan',
          'Penurunan Ambing (Udder Dropping)',
          'Postur Lordosis Terdeteksi'
        ],
        thermalFindings: [
          'Peningkatan Suhu Arteri Mamaria (+1.2°C)',
          'Distribusi Panas Terpusat pada Area Uterus'
        ],
        type: scanType === 'hybrid' ? 'Hybrid' : (scanType === 'visual' ? 'Visual' : 'Thermal')
      };
      
      onAnalysisComplete(result);
      setStep('result');
      setIsProcessing(false);
      toast.success('Analisis AI Selesai!');
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[110] max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">AI Pregnancy Scan</h2>
                  <p className="text-xs font-bold text-slate-400">Analisis Morfologi & Termografi</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {step === 'selection' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-500 mb-2 italic">Pilih metode deteksi untuk akurasi terbaik:</p>
                
                <button 
                  onClick={() => handleStartAnalysis('hybrid')}
                  className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-3xl text-left relative overflow-hidden group active:scale-[0.98] transition-all"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Scan className="w-5 h-5 text-emerald-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Recommended</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Hybrid AI Analysis (A+B)</h3>
                    <p className="text-emerald-50/70 text-xs leading-relaxed">Gabungkan Citra Visual & Termal untuk akurasi {'>'}95%.</p>
                  </div>
                  <BrainCircuit className="absolute right-[-10%] bottom-[-10%] w-32 h-32 text-white/10" />
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleStartAnalysis('visual')}
                    className="bg-white border-2 border-slate-100 p-5 rounded-3xl text-left hover:border-emerald-200 transition-all active:scale-[0.98]"
                  >
                    <Camera className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="text-slate-800 font-bold text-sm mb-1">Citra Visual</h3>
                    <p className="text-slate-400 text-[10px]">Analisis Morfologi & Abdomen</p>
                  </button>
                  <button 
                    onClick={() => handleStartAnalysis('thermal')}
                    className="bg-white border-2 border-slate-100 p-5 rounded-3xl text-left hover:border-red-200 transition-all active:scale-[0.98]"
                  >
                    <Thermometer className="w-8 h-8 text-red-500 mb-3" />
                    <h3 className="text-slate-800 font-bold text-sm mb-1">Termografi</h3>
                    <p className="text-slate-400 text-[10px]">Analisis Suhu Infrared</p>
                  </button>
                </div>
              </div>
            )}

            {step === 'uploading' && (
              <div className="space-y-6">
                <div className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Unggah Foto/Video Sapi</h3>
                  <p className="text-sm text-slate-400 mb-6">Pastikan sapi terlihat dari sisi samping atau belakang untuk hasil maksimal.</p>
                  <button 
                    onClick={simulateAnalysis}
                    className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold text-sm active:scale-95 transition-all"
                  >
                    Mulai Scan Sekarang
                  </button>
                </div>
              </div>
            )}

            {step === 'analyzing' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 border-4 border-emerald-500/20 rounded-full animate-ping absolute inset-0" />
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center relative z-10">
                    <BrainCircuit className="w-16 h-16 text-emerald-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Memproses Citra...</h3>
                <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <p className="text-sm font-medium text-slate-400">AI sedang menganalisis perubahan abdomen dan pola termal arteri mamaria.</p>
              </div>
            )}

            {step === 'result' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 rounded-[32px] p-6 text-center border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Hasil Prediksi AI</p>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">Bunting</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-200/50 px-3 py-1 rounded-full">Confidence: 92.4%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <Scan className="w-5 h-5 text-emerald-500" /> Analisis Morfologi
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['Pembesaran Abdomen Lateral Kanan', 'Penurunan Ambing (Udder Dropping)'].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-600">{f}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-black text-slate-800 flex items-center gap-2 mt-6">
                    <Thermometer className="w-5 h-5 text-red-500" /> Analisis Termografi
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-600">Suhu Arteri Mamaria: +1.2°C (Normal)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-red-100">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-600">Pola Panas Uterus Terdeteksi</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-slate-800 text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
                >
                  Simpan ke Riwayat Sapi
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
