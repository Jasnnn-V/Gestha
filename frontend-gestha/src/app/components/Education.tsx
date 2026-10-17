import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  ChevronRight,
  Heart,
  Stethoscope,
  Apple,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Droplet,
  Thermometer,
  Baby
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EducationProps {
  currentTrimester?: number;
}

export const Education: React.FC<EducationProps> = ({ currentTrimester = 1 }) => {
  const [selectedPhase, setSelectedPhase] = useState(currentTrimester);

  const trimesterContent = [
    {
      trimester: 1,
      title: 'Trimester 1 (0-90 Hari)',
      subtitle: 'Fase Pembentukan Organ',
      color: 'bg-black',
      topics: [
        {
          title: 'Nutrisi Awal Kehamilan',
          icon: Apple,
          content: [
            'Protein: 12-14% dari total pakan',
            'Energi: 2.4-2.6 Mcal/kg',
            'Kalsium (Ca): 0.6-0.7%',
            'Fosfor (P): 0.4-0.5%',
            'Vitamin A: 5000 IU/kg pakan',
          ],
        },
        {
          title: 'Pemeriksaan Rutin',
          icon: Stethoscope,
          content: [
            'Konfirmasi kehamilan hari ke-30 dengan AI scan',
            'Cek kondisi tubuh (BCS) target: 3.0-3.5',
            'Pantau nafsu makan dan perilaku',
            'Vaksinasi sesuai jadwal',
          ],
        },
        {
          title: 'Manajemen Kandang',
          icon: Heart,
          content: [
            'Pastikan kandang bersih dan kering',
            'Suhu ideal: 18-24°C',
            'Ventilasi yang baik',
            'Hindari stress dan keramaian',
          ],
        },
      ],
    },
    {
      trimester: 2,
      title: 'Trimester 2 (91-180 Hari)',
      subtitle: 'Fase Pertumbuhan Pesat',
      color: 'bg-black/80',
      topics: [
        {
          title: 'Nutrisi Pertumbuhan',
          icon: Apple,
          content: [
            'Protein: 14-16% (tingkatkan bertahap)',
            'Energi: 2.6-2.8 Mcal/kg',
            'Mineral blok dengan Ca dan P',
            'Tambahkan suplemen Mg dan Na',
            'Vitamin E: 300-500 IU/hari',
          ],
        },
        {
          title: 'Monitoring Kesehatan',
          icon: Stethoscope,
          content: [
            'Pemeriksaan rutin setiap 2 minggu',
            'Pantau pertambahan berat badan (0.5-0.7 kg/hari)',
            'Cek perut membesar secara visual',
            'Monitor gerakan janin (mulai terlihat)',
          ],
        },
        {
          title: 'Aktivitas & Gerak',
          icon: Heart,
          content: [
            'Biarkan bergerak bebas, jangan dikurung terlalu sempit',
            'Hindari aktivitas berat (mengangkut beban)',
            'Sediakan air minum ad libitum',
            'Akses ke area teduh',
          ],
        },
      ],
    },
    {
      trimester: 3,
      title: 'Trimester 3 (181-283 Hari)',
      subtitle: 'Fase Persiapan Kelahiran',
      color: 'bg-black',
      topics: [
        {
          title: 'Nutrisi Pra-Kelahiran',
          icon: Apple,
          content: [
            'Protein: 16-18% (puncak kebutuhan)',
            'Energi: 2.8-3.0 Mcal/kg',
            'Tingkatkan Ca hingga 0.8% (untuk laktasi)',
            'Kurangi pakan 7 hari sebelum lahir (cegah milk fever)',
            'Berikan pakan serat tinggi',
          ],
        },
        {
          title: 'Tanda-Tanda Melahirkan',
          icon: Baby,
          content: [
            'Ambing membesar dan tegang (2-3 minggu sebelumnya)',
            'Ligamen panggul melonggar (24-48 jam)',
            'Perilaku gelisah, mengais-ngais tanah',
            'Vulva membengkak dan lendir keluar',
            'Suhu tubuh turun 0.5-1°C',
          ],
        },
        {
          title: 'Persiapan Kandang Kelahiran',
          icon: Heart,
          content: [
            'Isolasi dari kawanan 2 minggu sebelum HPL',
            'Kandang luas min. 12-15 m²',
            'Alas jerami bersih dan kering',
            'Peralatan: handuk, iodine, timbangan',
            'Nomor dokter hewan siaga',
          ],
        },
      ],
    },
  ];

  const currentContent = trimesterContent.find(t => t.trimester === selectedPhase) || trimesterContent[0];

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Edukasi Peternakan</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mt-1">Panduan Lengkap Per Fase Kehamilan</p>
      </header>

      {/* Phase Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {trimesterContent.map((phase) => (
          <motion.button
            key={phase.trimester}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPhase(phase.trimester)}
            className={cn(
              "p-6 rounded-[32px] border-4 text-left transition-all",
              selectedPhase === phase.trimester
                ? "bg-black text-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
                : "bg-white text-black border-black/20 hover:border-black/40"
            )}
          >
            <div className="text-5xl font-black mb-2">{phase.trimester}</div>
            <h4 className="text-lg font-black uppercase italic mb-1">{phase.title}</h4>
            <p className={cn(
              "text-xs font-bold",
              selectedPhase === phase.trimester ? "text-white/60" : "text-black/60"
            )}>
              {phase.subtitle}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {currentContent.topics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-4 border-black rounded-[32px] p-6 lg:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter">{topic.title}</h4>
                  <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">
                    Trimester {currentContent.trimester}
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {topic.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-black">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <QuickRefCard
          icon={Leaf}
          title="Pakan Hijau"
          value="40-50 kg/hari"
          subtitle="Rumput segar"
        />
        <QuickRefCard
          icon={Apple}
          title="Konsentrat"
          value="2-3 kg/hari"
          subtitle={`Trimester ${selectedPhase}`}
        />
        <QuickRefCard
          icon={Droplet}
          title="Air Minum"
          value="60-80 L/hari"
          subtitle="Ad libitum"
        />
        <QuickRefCard
          icon={Thermometer}
          title="Suhu Ideal"
          value="18-24°C"
          subtitle="Kandang"
        />
      </div>

      {/* SOP Download */}
      <div className="bg-black text-white rounded-[32px] p-8 flex items-center justify-between">
        <div>
          <h4 className="text-xl font-black uppercase italic mb-2">SOP Monitoring Lengkap</h4>
          <p className="text-sm font-bold text-white/60">Download panduan lengkap per trimester</p>
        </div>
        <button 
               onClick={() => {
               const link = document.createElement('a');
              link.href = '/src/imports/pkmpites.pdf';
             link.download = 'SOP-Monitoring-GESTHA.pdf';
             link.click();
            }}
            className="bg-white text-black px-6 py-4 rounded-[20px] font-black text-sm uppercase flex items-center gap-2 hover:translate-x-1 transition-transform">
          <BookOpen className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({ icon: Icon, label, count, color }: any) => (
  <div className={cn("p-6 rounded-[32px] border-4 border-black", color)}>
    <Icon className="w-8 h-8 mb-4" />
    <p className="font-black uppercase italic text-sm mb-1">{label}</p>
    <p className="text-[8px] font-bold text-black/40 uppercase">{count}</p>
  </div>
);

const TipItem = ({ title, desc, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-5 bg-white border-2 border-black rounded-[24px] hover:translate-x-1 transition-transform cursor-pointer">
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-black text-xs uppercase leading-none mb-1">{title}</h4>
        <p className="text-[8px] font-bold text-black/40 uppercase leading-none">{desc}</p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-black/20" />
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QuickRefCard = ({ icon: Icon, title, value, subtitle }: any) => (
  <div className="bg-white border-4 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
    <Icon className="w-8 h-8 text-black mb-3" />
    <p className="text-xs font-black text-black/40 uppercase mb-1">{title}</p>
    <p className="text-2xl font-black text-black mb-1">{value}</p>
    <p className="text-xs font-bold text-black/60">{subtitle}</p>
  </div>
);
