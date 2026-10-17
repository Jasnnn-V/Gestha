import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Filter,
  Calendar as CalendarIcon,
  AlertTriangle,
  TrendingUp,
  Settings as SettingsIcon,
  ChevronRight,
  Info,
  Scan,
  Camera,
  LayoutDashboard,
  BookOpen,
  PieChart,
  X
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { differenceInDays, addDays, subDays } from 'date-fns';

import { CowCard } from './components/CowCard';
import { BottomNav, AddButton } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { AddCowModal } from './components/AddCowModal';
import { StatCard } from './components/StatCard';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { AIScanner, AnalysisResult } from './components/AIScanner';
import { AdvancedAIScanner } from './components/AdvancedAIScanner';
import { CowMascot } from './components/CowMascot';
import { BarnSystem } from './components/BarnSystem';
import { AdvancedCamera } from './components/AdvancedCamera';
import { NewDetectionFlow } from './components/NewDetectionFlow';
import { Dashboard } from './components/Dashboard';
import { Education } from './components/Education';
import { NotificationSystem } from './components/NotificationSystem';
import { CalvingCalendar } from './components/CalvingCalendar';
import { PregnancyTimeline } from './components/PregnancyTimeline';
import { Login } from './components/Login';
import { Register } from './components/Register';

// Mock Data
const INITIAL_COWS = [
  {
    id: '1',
    name: 'Brahman Super',
    tagId: 'BR-99',
    inseminationDate: subDays(new Date(), 276), // 7 days left
    status: 'critical' as const,
    urgency: 'high' as const,
    signs: ['Gelisah', 'Ambing membesar']
  },
  {
    id: '2',
    name: 'Limousin 02',
    tagId: 'LM-45',
    inseminationDate: subDays(new Date(), 265), // 18 days left
    status: 'warning' as const,
    urgency: 'low' as const,
    signs: []
  },
  {
    id: '3',
    name: 'Simental Putih',
    tagId: 'SM-12',
    inseminationDate: subDays(new Date(), 120), // Mid pregnancy
    status: 'normal' as const,
    urgency: 'low' as const,
    signs: []
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cows, setCows] = useState(INITIAL_COWS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAdvancedScannerOpen, setIsAdvancedScannerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isNewDetectionOpen, setIsNewDetectionOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCow, setSelectedCow] = useState<typeof INITIAL_COWS[0] | null>(null);
  const [selectedCowName, setSelectedCowName] = useState('Simental 01');
  const [searchQuery, setSearchQuery] = useState('');

  // ... rest of the states

  // Calculate statistics
  const criticalCount = cows.filter(c => differenceInDays(addDays(new Date(c.inseminationDate), 283), new Date()) <= 7).length;
  const warningCount = cows.filter(c => {
    const days = differenceInDays(addDays(new Date(c.inseminationDate), 283), new Date());
    return days > 7 && days <= 21;
  }).length;

  const handleAddCow = (data: { name: string; tagId: string; date: string }) => {
    const newCow = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      tagId: data.tagId,
      inseminationDate: new Date(data.date),
      status: 'normal' as const,
      urgency: 'low' as const,
      signs: []
    };
    setCows([newCow, ...cows]);
    toast.success('Sapi berhasil ditambahkan ke monitoring!');
  };

  const handleScanComplete = (result: any) => {
    if (result.isPregnant) {
      toast.success(`Deteksi Positif! Confidence: ${result.confidence}%`);
      // Auto add to monitoring if needed
    } else {
      toast.info('Hasil: Tidak Hamil');
    }
  };

  const handleViewTimeline = (cow: typeof INITIAL_COWS[0]) => {
    setSelectedCow(cow);
    setIsTimelineOpen(true);
  };

  const handleViewCalendar = () => {
    setIsCalendarOpen(true);
  };

  // Prepare cows data with due dates for calendar and notifications
  const cowsWithDueDates = cows.map(cow => ({
    ...cow,
    dueDate: addDays(cow.inseminationDate, 283)
  }));

  const filteredCows = cows.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tagId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-center" richColors />

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setIsAddModalOpen(true)}
          onCameraClick={() => setIsCameraOpen(true)}
          onScanClick={() => setIsAdvancedScannerOpen(true)}
          criticalCount={criticalCount}
        />
      </div>

      {/* Main Content Area with offset for sidebar on desktop */}
      <div className="lg:ml-80">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b-8 border-black shadow-xl relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-black rounded-full opacity-5" />
          <div className="absolute bottom-[-20px] left-[10%] w-32 h-32 bg-black rounded-full opacity-5" />
          <div className="absolute top-10 right-[30%] w-20 h-20 bg-black rounded-full opacity-5" />

          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-black text-black leading-tight tracking-tighter uppercase italic mb-2">
                  {activeTab === 'dashboard' && 'Dashboard Monitoring'}
                  {activeTab === 'home' && 'Data Ternak'}
                  {activeTab === 'cows' && 'Sistem Kandang'}
                  {activeTab === 'education' && 'Edukasi Peternakan'}
                  {activeTab === 'settings' && 'Pengaturan Sistem'}
                </h2>
                <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">
                  Sistem Monitoring Kehamilan Sapi Real-time
                </p>
              </div>
              <div className="flex gap-3">
                <Bell className="w-6 h-6 text-black" />
                <SettingsIcon className="w-6 h-6 text-black" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 relative z-10">
              <StatCard label="Kritis" value={criticalCount} icon={AlertTriangle} color="red" />
              <StatCard label="Peringatan" value={warningCount} icon={Bell} color="yellow" />
              <StatCard label="Total Sapi" value={cows.length} icon={TrendingUp} color="emerald" />
              <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  placeholder="CARI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-2 text-xs font-black placeholder:text-black/30 focus:outline-none uppercase tracking-widest"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header - Hidden on Desktop */}
        <header className="lg:hidden bg-white px-6 pt-16 pb-8 rounded-b-[64px] border-b-8 border-black shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-black rounded-full opacity-10" />
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black rounded-full opacity-5" />
          <div className="absolute top-20 left-[40%] w-16 h-16 bg-black rounded-full opacity-5" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex gap-4 items-center">
              <div className="bg-black p-1 rounded-full shadow-lg">
                <CowMascot size={72} mood={criticalCount > 0 ? 'alert' : 'happy'} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-black leading-tight tracking-tighter uppercase italic">GESTHA</h1>
                <p className="text-[10px] font-black text-black/40 flex items-center gap-1 uppercase tracking-[0.2em]">
                  AI CATTLE WATCHER
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCameraOpen(true)}
                className="w-14 h-14 bg-black rounded-[24px] flex items-center justify-center shadow-xl border-2 border-white/20"
              >
                <Camera className="w-7 h-7 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAdvancedScannerOpen(true)}
                className="w-14 h-14 bg-white rounded-[24px] flex items-center justify-center shadow-xl border-2 border-black"
              >
                <Scan className="w-7 h-7 text-black" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <StatCard label="Kritis" value={criticalCount} icon={AlertTriangle} color="red" />
            <StatCard label="Sapi" value={cows.length} icon={TrendingUp} color="emerald" />
          </div>

          <div className="relative z-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
            <input
              type="text"
              placeholder="CARI ID SAPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 border-2 border-black rounded-[24px] py-4 pl-14 pr-4 text-xs font-black placeholder:text-black/30 focus:outline-none focus:bg-white transition-all uppercase tracking-widest"
            />
          </div>
        </header>

        <main className="px-6 lg:px-8 lg:max-w-7xl lg:mx-auto mt-8 pb-32 lg:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard cows={cowsWithDueDates} />
        )}

        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Urgent Alert Banner */}
            {criticalCount > 0 && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] relative overflow-hidden border-4 border-black"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Peringatan Kritis</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black italic uppercase leading-tight mb-2">
                    {criticalCount} Sapi akan melahirkan!
                  </h3>
                  <p className="text-[10px] text-white/60 font-black uppercase leading-relaxed tracking-wider">
                    Aktifkan kamera monitoring segera.
                  </p>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] opacity-20 transform rotate-12">
                  <AlertTriangle className="w-32 h-32" />
                </div>
              </motion.div>
            )}

            {/* Main List */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic">Daftar Pantauan</h2>
                <button className="text-[10px] font-black text-black uppercase tracking-widest flex items-center bg-black/5 px-4 py-2 rounded-full border border-black/10">
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {filteredCows.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCows.map((cow) => (
                    <CowCard
                      key={cow.id}
                      cow={cow}
                      onClick={(c) => {
                        handleViewTimeline(c);
                        toast.info(`Membuka Timeline untuk ${c.name}`);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-16 text-center border-4 border-dashed border-black/10 flex flex-col items-center">
                  <CowMascot size={160} mood="sleepy" />
                  <p className="text-black font-black mt-6 tracking-tight uppercase text-sm italic">Wah, kandang masih kosong!</p>
                  <p className="text-black/30 text-[10px] font-black uppercase mt-1 px-8 leading-relaxed tracking-widest">
                    Ketuk tombol "Tambah Sapi Baru" untuk mulai memantau.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'cows' && <BarnSystem />}

        {activeTab === 'education' && (
          <Education currentTrimester={selectedCow ?
            Math.min(3, Math.floor(differenceInDays(new Date(), selectedCow.inseminationDate) / 90) + 1) :
            1
          } />
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-32 h-32 bg-black rounded-[40px] flex items-center justify-center shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
              <SettingsIcon className="w-16 h-16 text-white animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter">Sistem Gestha</h2>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-2">Versi 2.0.4 Enterprise</p>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <div className="lg:hidden">
        <AddButton onClick={() => setIsAddModalOpen(true)} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <AddCowModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCow}
      />

      <AIScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAnalysisComplete={(res) => {
          console.log('Analysis result:', res);
        }}
      />

      <NewDetectionFlow 
        isOpen={isNewDetectionOpen}
        onClose={() => setIsNewDetectionOpen(false)}
        cows={cows}
      />

      <AdvancedCamera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title={activeTab === 'home' ? selectedCowName : "CCTV Kandang Utama"}
      />

      <AdvancedAIScanner
        isOpen={isAdvancedScannerOpen}
        onClose={() => setIsAdvancedScannerOpen(false)}
        onComplete={handleScanComplete}
      />

      <NotificationSystem cows={cowsWithDueDates} />

      {/* Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={() => setIsCalendarOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <CalvingCalendar
                cows={cowsWithDueDates}
                onDateClick={(date, cows) => {
                  toast.info(`${cows.length} sapi akan melahirkan pada ${date.toLocaleDateString('id-ID')}`);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Modal */}
      <AnimatePresence>
        {isTimelineOpen && selectedCow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsTimelineOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl py-8"
            >
              <div className="relative">
                <button
                  onClick={() => setIsTimelineOpen(false)}
                  className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-black"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
                <PregnancyTimeline
                  inseminationDate={selectedCow.inseminationDate}
                  dueDate={addDays(selectedCow.inseminationDate, 283)}
                  cowName={selectedCow.name}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
