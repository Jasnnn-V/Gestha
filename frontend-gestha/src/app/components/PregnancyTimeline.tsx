import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, AlertCircle, Calendar, Activity, Heart, Baby } from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PregnancyTimelineProps {
  inseminationDate: Date;
  dueDate: Date;
  cowName: string;
}

interface Milestone {
  day: number;
  title: string;
  description: string;
  icon: typeof Calendar;
  category: 'trimester1' | 'trimester2' | 'trimester3' | 'birth';
  importance: 'normal' | 'important' | 'critical';
  actions: string[];
}

const PREGNANCY_MILESTONES: Milestone[] = [
  {
    day: 0,
    title: 'Inseminasi Buatan',
    description: 'Pembuatan dimulai melalui IB',
    icon: Heart,
    category: 'trimester1',
    importance: 'important',
    actions: ['Catat tanggal IB dengan akurat', 'Berikan pakan berkualitas tinggi'],
  },
  {
    day: 30,
    title: 'Deteksi Dini Kehamilan',
    description: 'Periode optimal untuk scan AI pertama',
    icon: Activity,
    category: 'trimester1',
    importance: 'critical',
    actions: ['Lakukan AI pregnancy scan', 'Konfirmasi status kehamilan', 'Mulai pakan bunting jika positif'],
  },
  {
    day: 60,
    title: 'Konfirmasi Kehamilan',
    description: 'Verifikasi kehamilan dan perkembangan embrio',
    icon: Check,
    category: 'trimester1',
    importance: 'important',
    actions: ['Scan ulang untuk konfirmasi', 'Evaluasi kondisi tubuh', 'Sesuaikan nutrisi'],
  },
  {
    day: 90,
    title: 'Akhir Trimester 1',
    description: 'Organ vital janin mulai terbentuk',
    icon: Calendar,
    category: 'trimester1',
    importance: 'normal',
    actions: ['Evaluasi kondisi kesehatan', 'Cek berat badan induk', 'Tambah protein 12-14%'],
  },
  {
    day: 120,
    title: 'Pertengahan Trimester 2',
    description: 'Pertumbuhan janin meningkat pesat',
    icon: Activity,
    category: 'trimester2',
    importance: 'normal',
    actions: ['Monitor perut membesar', 'Tingkatkan energi pakan', 'Berikan mineral Ca dan P'],
  },
  {
    day: 150,
    title: 'Puncak Pertumbuhan Janin',
    description: 'Janin berkembang sangat cepat',
    icon: Heart,
    category: 'trimester2',
    importance: 'important',
    actions: ['Pakan dengan energi tinggi', 'Suplemen vitamin A, D, E', 'Hindari stress'],
  },
  {
    day: 180,
    title: 'Akhir Trimester 2',
    description: 'Memasuki fase akhir kehamilan',
    icon: Calendar,
    category: 'trimester2',
    importance: 'normal',
    actions: ['Cek kondisi ambing', 'Monitor gerakan janin', 'Tingkatkan protein 16-18%'],
  },
  {
    day: 210,
    title: 'Awal Trimester 3',
    description: 'Periode kritis menjelang kelahiran',
    icon: AlertCircle,
    category: 'trimester3',
    importance: 'important',
    actions: ['Pantau lebih intensif', 'Persiapan kandang kelahiran', 'Vaksinasi jika perlu'],
  },
  {
    day: 240,
    title: 'Persiapan Kelahiran',
    description: 'Ambing mulai membesar dan penuh',
    icon: Activity,
    category: 'trimester3',
    importance: 'critical',
    actions: ['Isolasi dari kawanan', 'Siapkan peralatan kelahiran', 'Nomor dokter hewan siaga'],
  },
  {
    day: 260,
    title: 'Fase Pre-Calving',
    description: 'Tanda-tanda kelahiran mulai muncul',
    icon: AlertCircle,
    category: 'trimester3',
    importance: 'critical',
    actions: ['Monitoring 24 jam', 'Cek ligamen panggul', 'Amati perilaku gelisah'],
  },
  {
    day: 276,
    title: 'Siaga Penuh H-7',
    description: 'Kelahiran bisa terjadi kapan saja',
    icon: Baby,
    category: 'birth',
    importance: 'critical',
    actions: ['Aktifkan kamera CCTV', 'Jangan tinggalkan tanpa pengawasan', 'Alat kelahiran siap pakai'],
  },
  {
    day: 283,
    title: 'Perkiraan Kelahiran',
    description: 'Hari perkiraan lahir (HPL)',
    icon: Baby,
    category: 'birth',
    importance: 'critical',
    actions: ['Siaga penuh 24/7', 'Dokter hewan on-call', 'Pantau kontraksi'],
  },
];

export const PregnancyTimeline: React.FC<PregnancyTimelineProps> = ({
  inseminationDate,
  dueDate,
  cowName,
}) => {
  const today = new Date();
  const currentDay = differenceInDays(today, inseminationDate);
  const totalDays = 283;
  const progressPercentage = Math.min(100, Math.max(0, (currentDay / totalDays) * 100));

  const getCurrentTrimester = () => {
    if (currentDay < 90) return 1;
    if (currentDay < 180) return 2;
    if (currentDay < 283) return 3;
    return 3;
  };

  const currentTrimester = getCurrentTrimester();

  const getCategoryColor = (category: Milestone['category']) => {
    switch (category) {
      case 'trimester1':
        return 'bg-black/5 border-black/20';
      case 'trimester2':
        return 'bg-black/10 border-black/30';
      case 'trimester3':
        return 'bg-black/20 border-black/40';
      case 'birth':
        return 'bg-black text-white border-black';
      default:
        return 'bg-white border-black/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-black text-white rounded-[40px] p-8 relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute top-0 right-0 text-[200px] opacity-10 font-black">
          {currentTrimester}
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">
            Timeline Kehamilan {cowName}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase opacity-60 mb-1">Hari Ke-</p>
              <p className="text-3xl font-black">{currentDay}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase opacity-60 mb-1">Trimester</p>
              <p className="text-3xl font-black">{currentTrimester}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase opacity-60 mb-1">Sisa Hari</p>
              <p className="text-3xl font-black">{Math.max(0, 283 - currentDay)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase opacity-60 mb-1">HPL</p>
              <p className="text-xl font-black">{format(dueDate, 'd MMM yyyy', { locale: id })}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-widest">Progress Kehamilan</span>
              <span className="text-xs font-black">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-white"
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white border-4 border-black rounded-[40px] p-6 lg:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h4 className="text-xl font-black text-black uppercase italic tracking-tighter mb-6">
          Milestone Kehamilan (9 Bulan)
        </h4>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-black/10" />

          <div className="space-y-6">
            {PREGNANCY_MILESTONES.map((milestone, index) => {
              const milestoneDate = addDays(inseminationDate, milestone.day);
              const isPast = currentDay >= milestone.day;
              const isCurrent = currentDay >= milestone.day && (index === PREGNANCY_MILESTONES.length - 1 || currentDay < PREGNANCY_MILESTONES[index + 1].day);
              const Icon = milestone.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute left-0 w-12 h-12 rounded-[16px] flex items-center justify-center border-4 z-10",
                    isPast ? "bg-black border-black" : "bg-white border-black/20",
                    isCurrent && "ring-4 ring-black/20 scale-110"
                  )}>
                    {isPast ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-black/40" />
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div className={cn(
                    "rounded-[24px] p-5 border-4 transition-all",
                    getCategoryColor(milestone.category),
                    isCurrent && "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]",
                    !isPast && "opacity-60"
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-black uppercase px-2 py-1 rounded-full",
                            milestone.category === 'birth' ? "bg-white text-black" : "bg-black/10 text-black/60"
                          )}>
                            Hari {milestone.day}
                          </span>
                          {milestone.importance === 'critical' && (
                            <span className="text-xs font-black uppercase px-2 py-1 rounded-full bg-black text-white">
                              Kritis
                            </span>
                          )}
                        </div>
                        <h5 className={cn(
                          "text-lg font-black uppercase italic mb-1",
                          milestone.category === 'birth' ? "text-white" : "text-black"
                        )}>
                          {milestone.title}
                        </h5>
                        <p className={cn(
                          "text-sm font-bold",
                          milestone.category === 'birth' ? "text-white/80" : "text-black/60"
                        )}>
                          {milestone.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xs font-black",
                          milestone.category === 'birth' ? "text-white/60" : "text-black/40"
                        )}>
                          {format(milestoneDate, 'd MMM', { locale: id })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {milestone.actions.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-black/10">
                        <p className={cn(
                          "text-xs font-black uppercase mb-2",
                          milestone.category === 'birth' ? "text-white/60" : "text-black/40"
                        )}>
                          Tindakan:
                        </p>
                        <ul className="space-y-1.5">
                          {milestone.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-bold">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                                milestone.category === 'birth' ? "bg-white" : "bg-black"
                              )} />
                              <span className={milestone.category === 'birth' ? "text-white" : "text-black"}>
                                {action}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isCurrent && (
                      <div className={cn(
                        "mt-4 pt-4 border-t-2 flex items-center gap-2",
                        milestone.category === 'birth' ? "border-white/20" : "border-black/10"
                      )}>
                        <Activity className={cn(
                          "w-4 h-4 animate-pulse",
                          milestone.category === 'birth' ? "text-white" : "text-black"
                        )} />
                        <span className={cn(
                          "text-xs font-black uppercase",
                          milestone.category === 'birth' ? "text-white" : "text-black"
                        )}>
                          Fase Saat Ini
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trimester Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { trim: 1, days: '0-90', title: 'Trimester 1', subtitle: 'Pembentukan Organ' },
          { trim: 2, days: '91-180', title: 'Trimester 2', subtitle: 'Pertumbuhan Pesat' },
          { trim: 3, days: '181-283', title: 'Trimester 3', subtitle: 'Persiapan Lahir' },
        ].map((item) => (
          <div
            key={item.trim}
            className={cn(
              "rounded-[24px] p-6 border-4 transition-all",
              currentTrimester === item.trim
                ? "bg-black text-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                : "bg-white text-black border-black/20"
            )}
          >
            <div className="text-5xl font-black mb-2">{item.trim}</div>
            <h5 className="text-lg font-black uppercase italic mb-1">{item.title}</h5>
            <p className={cn(
              "text-xs font-bold mb-2",
              currentTrimester === item.trim ? "text-white/60" : "text-black/60"
            )}>
              {item.subtitle}
            </p>
            <p className={cn(
              "text-xs font-black uppercase",
              currentTrimester === item.trim ? "text-white/40" : "text-black/40"
            )}>
              Hari {item.days}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
