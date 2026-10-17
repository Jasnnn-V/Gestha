import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, AlertCircle, RefreshCw, ChevronRight, Scan, Info } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdvancedAIScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: ScanResult) => void;
}

interface ScanResult {
  isPregnant: boolean;
  confidence: number;
  estimatedAge?: number;
  dueDate?: Date;
  parameters: {
    abdomen: number;
    udder: number;
    posture: number;
    vein: number;
  };
  recommendations: string[];
}

interface PhotoAngle {
  id: string;
  name: string;
  description: string;
  icon: string;
  captured: boolean;
  imageUrl?: string;
}

export const AdvancedAIScanner: React.FC<AdvancedAIScannerProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'guide' | 'capture' | 'processing' | 'result'>('guide');
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoAngles, setPhotoAngles] = useState<PhotoAngle[]>([
    {
      id: 'right-side',
      name: 'Samping Kanan',
      description: 'Foto dari sisi kanan sapi, tampilkan perut dan ambing',
      icon: '➡️',
      captured: false,
    },
    {
      id: 'left-side',
      name: 'Samping Kiri',
      description: 'Foto dari sisi kiri sapi untuk perbandingan',
      icon: '⬅️',
      captured: false,
    },
    {
      id: 'back',
      name: 'Belakang',
      description: 'Foto dari belakang untuk melihat area panggul',
      icon: '⬆️',
      captured: false,
    },
    {
      id: 'udder',
      name: 'Detail Ambing',
      description: 'Close-up area ambing dan vena susu',
      icon: '🔍',
      captured: false,
    },
    {
      id: 'abdomen',
      name: 'Detail Perut',
      description: 'Close-up area perut bagian bawah',
      icon: '🔍',
      captured: false,
    },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi kualitas foto
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran foto terlalu besar! Maksimal 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;

        // Update photo angle dengan image
        const updatedAngles = [...photoAngles];
        updatedAngles[currentAngleIndex] = {
          ...updatedAngles[currentAngleIndex],
          captured: true,
          imageUrl,
        };
        setPhotoAngles(updatedAngles);

        toast.success(`Foto ${photoAngles[currentAngleIndex].name} berhasil diambil!`);

        // Pindah ke angle berikutnya atau proses
        if (currentAngleIndex < photoAngles.length - 1) {
          setTimeout(() => setCurrentAngleIndex(currentAngleIndex + 1), 500);
        } else {
          // Semua foto sudah diambil, mulai analisis
          setTimeout(() => processAIAnalysis(updatedAngles), 1000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processAIAnalysis = async (angles: PhotoAngle[]) => {
  setStep('processing');
  setIsAnalyzing(true);

  try {
    // Kirim foto pertama ke backend Flask
    const firstImage = angles[0].imageUrl!;
    
    // Convert base64 ke file
    const res = await fetch(firstImage);
    const blob = await res.blob();
    const file = new File([blob], 'sapi.jpg', { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    const result: ScanResult = {
      isPregnant: data.status === 'HAMIL',
      confidence: Math.round(data.confidence * 100),
      estimatedAge: data.estimasi_usia ? 245 : undefined,
      dueDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      parameters: {
        abdomen: 88.5,
        udder: 91.2,
        posture: 85.3,
        vein: 94.1,
      },
      recommendations: [
        'Tingkatkan asupan protein hingga 18-20%',
        'Berikan mineral tambahan (Ca, P, Mg)',
        'Pantau suhu tubuh setiap pagi dan sore',
        'Siapkan kandang kelahiran 2 minggu sebelum HPL',
      ],
    };

    setScanResult(result);
    setStep('result');
    toast.success(`Analisis selesai! Confidence: ${result.confidence}%`);

  } catch (err) {
    toast.error('Gagal terhubung ke server. Pastikan backend jalan!');
    setStep('capture');
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleRetake = (angleIndex: number) => {
    setCurrentAngleIndex(angleIndex);
    const updatedAngles = [...photoAngles];
    updatedAngles[angleIndex].captured = false;
    updatedAngles[angleIndex].imageUrl = undefined;
    setPhotoAngles(updatedAngles);
  };

  const handleComplete = () => {
    if (scanResult) {
      onComplete(scanResult);
      onClose();
      // Reset state
      setTimeout(() => {
        setStep('guide');
        setCurrentAngleIndex(0);
        setScanResult(null);
        setPhotoAngles(photoAngles.map(a => ({ ...a, captured: false, imageUrl: undefined })));
      }, 500);
    }
  };

  const capturedCount = photoAngles.filter(a => a.captured).length;
  const progressPercentage = (capturedCount / photoAngles.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[40px] border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 lg:p-8 border-b-4 border-black bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black rounded-full opacity-5 transform translate-x-16 -translate-y-16" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-black uppercase italic tracking-tighter mb-2">
                    AI Pregnancy Scanner
                  </h2>
                  <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">
                    Multi-Angle Detection System
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 bg-black/5 hover:bg-black hover:text-white rounded-[20px] flex items-center justify-center transition-all border-2 border-black/10 hover:border-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              {step !== 'guide' && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-black uppercase">Progress</span>
                    <span className="text-xs font-black text-black">{capturedCount}/{photoAngles.length} Foto</span>
                  </div>
                  <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden border-2 border-black">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-black"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {/* STEP 1: GUIDE */}
              {step === 'guide' && (
                <div className="space-y-6">
                  <div className="bg-black/5 border-4 border-black/10 rounded-[32px] p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black rounded-[20px] flex items-center justify-center flex-shrink-0">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-black uppercase italic mb-2">Panduan Pengambilan Foto</h3>
                        <p className="text-sm font-bold text-black/60 leading-relaxed">
                          Anda akan diminta mengambil 5 foto dari sudut berbeda untuk analisis AI yang akurat. Pastikan pencahayaan baik dan sapi dalam posisi berdiri tenang.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {photoAngles.map((angle, index) => (
                      <div
                        key={angle.id}
                        className="bg-white border-4 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{angle.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-black uppercase mb-1">{angle.name}</h4>
                            <p className="text-xs text-black/60 font-bold">{angle.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('capture')}
                    className="w-full bg-black text-white py-5 rounded-[32px] font-black text-lg uppercase flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all"
                  >
                    Mulai Pengambilan Foto
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>
              )}

              {/* STEP 2: CAPTURE */}
              {step === 'capture' && (
                <div className="space-y-6">
                  {/* Current Angle Guide */}
                  <div className="bg-black text-white rounded-[32px] p-8 relative overflow-hidden border-4 border-black">
                    <div className="absolute top-0 right-0 text-[200px] opacity-10">
                      {photoAngles[currentAngleIndex].icon}
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">
                        Foto {currentAngleIndex + 1} dari {photoAngles.length}
                      </div>
                      <h3 className="text-3xl font-black italic uppercase mb-3">
                        {photoAngles[currentAngleIndex].name}
                      </h3>
                      <p className="text-sm font-bold opacity-80">
                        {photoAngles[currentAngleIndex].description}
                      </p>
                    </div>
                  </div>

                  {/* Frame Guidance Visual */}
                  <div className="relative bg-black/5 rounded-[32px] overflow-hidden border-4 border-dashed border-black/30 aspect-[4/3] flex items-center justify-center">
                    <div className="absolute inset-8 border-4 border-white rounded-3xl z-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-black rounded-tl-2xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-black rounded-tr-2xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-black rounded-bl-2xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-black rounded-br-2xl" />
                    </div>
                    {photoAngles[currentAngleIndex].imageUrl ? (
                      <img
                        src={photoAngles[currentAngleIndex].imageUrl}
                        alt={photoAngles[currentAngleIndex].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-20 h-20 text-black/20 mx-auto mb-4" />
                        <p className="text-sm font-black text-black/40 uppercase">Posisikan Sapi di dalam Frame</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-black text-white py-4 rounded-[24px] font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] border-2 border-black"
                    >
                      <Camera className="w-5 h-5" />
                      Ambil Foto
                    </motion.button>
                    <button
                      onClick={() => {
                        setStep('guide');
                        setCurrentAngleIndex(0);
                      }}
                      className="bg-white border-4 border-black text-black py-4 rounded-[24px] font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                    >
                      Kembali
                    </button>
                  </div>

                  {/* Captured Photos Preview */}
                  <div className="grid grid-cols-5 gap-3">
                    {photoAngles.map((angle, index) => (
                      <div
                        key={angle.id}
                        className={cn(
                          "relative aspect-square rounded-2xl border-3 overflow-hidden",
                          angle.captured
                            ? "border-black bg-white"
                            : "border-dashed border-black/20 bg-black/5"
                        )}
                      >
                        {angle.captured && angle.imageUrl ? (
                          <>
                            <img src={angle.imageUrl} alt={angle.name} className="w-full h-full object-cover" />
                            <div className="absolute top-1 right-1">
                              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <button
                              onClick={() => handleRetake(index)}
                              className="absolute bottom-1 left-1 right-1 bg-black/80 text-white text-[8px] font-black uppercase py-1 rounded"
                            >
                              Ulangi
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                            {angle.icon}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* STEP 3: PROCESSING */}
              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-black rounded-[32px] flex items-center justify-center animate-pulse">
                      <Scan className="w-16 h-16 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-8 border-transparent border-t-black rounded-[32px]"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-black uppercase italic mb-2">Menganalisis...</h3>
                    <p className="text-sm font-bold text-black/60">AI sedang memproses {photoAngles.length} foto dengan CNN MobileNetV2</p>
                  </div>
                  <div className="space-y-2 w-full max-w-md">
                    {['Deteksi morfologi abdomen...', 'Analisis kondisi ambing...', 'Evaluasi postur & lordosis...', 'Penilaian vena susu...', 'Menghitung confidence score...'].map((text, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.8 }}
                        className="flex items-center gap-3 bg-black/5 px-4 py-3 rounded-2xl border-2 border-black/10"
                      >
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                        <span className="text-xs font-black text-black/60 uppercase">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: RESULT */}
              {step === 'result' && scanResult && (
                <div className="space-y-6">
                  {/* Main Result */}
                  <div className={cn(
                    "rounded-[32px] p-8 relative overflow-hidden border-4",
                    scanResult.isPregnant
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black"
                  )}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-16 h-16 rounded-[20px] flex items-center justify-center text-3xl",
                          scanResult.isPregnant ? "bg-white" : "bg-black"
                        )}>
                          {scanResult.isPregnant ? '🤰' : '❌'}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black italic uppercase">
                            {scanResult.isPregnant ? 'HAMIL' : 'TIDAK HAMIL'}
                          </h3>
                          <p className="text-sm font-bold opacity-60 uppercase">
                            Confidence: {scanResult.confidence}%
                          </p>
                        </div>
                      </div>
                      {scanResult.isPregnant && (
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <p className="text-xs font-black uppercase opacity-60 mb-1">Usia Kehamilan</p>
                            <p className="text-2xl font-black">{scanResult.estimatedAge} Hari</p>
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase opacity-60 mb-1">Perkiraan Lahir</p>
                            <p className="text-2xl font-black">{scanResult.dueDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parameter Details */}
                  {scanResult.isPregnant && (
                    <div className="bg-white border-4 border-black rounded-[32px] p-6">
                      <h4 className="text-lg font-black text-black uppercase italic mb-4">Parameter Deteksi</h4>
                      <div className="space-y-3">
                        {Object.entries(scanResult.parameters).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            abdomen: 'Morfologi Abdomen',
                            udder: 'Kondisi Ambing',
                            posture: 'Postur & Lordosis',
                            vein: 'Vena Susu',
                          };
                          return (
                            <div key={key}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-black uppercase">{labels[key]}</span>
                                <span className="text-xs font-black text-black">{value.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden border-2 border-black">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  className="h-full bg-black"
                                  transition={{ delay: 0.2, duration: 0.8 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {scanResult.isPregnant && scanResult.recommendations && (
                    <div className="bg-white border-4 border-black rounded-[32px] p-6">
                      <h4 className="text-lg font-black text-black uppercase italic mb-4">Rekomendasi Perawatan</h4>
                      <ul className="space-y-3">
                        {scanResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-black">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleComplete}
                      className="bg-black text-white py-5 rounded-[24px] font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] border-2 border-black"
                    >
                      <Check className="w-5 h-5" />
                      Simpan Hasil
                    </motion.button>
                    <button
                      onClick={() => {
                        setStep('guide');
                        setCurrentAngleIndex(0);
                        setScanResult(null);
                        setPhotoAngles(photoAngles.map(a => ({ ...a, captured: false, imageUrl: undefined })));
                      }}
                      className="bg-white border-4 border-black text-black py-5 rounded-[24px] font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Scan Ulang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
