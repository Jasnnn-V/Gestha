import React, { useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { Bell, AlertTriangle, Calendar, Info } from 'lucide-react';

interface Cow {
  id: string;
  name: string;
  tagId: string;
  inseminationDate: Date;
  dueDate: Date;
}

interface NotificationSystemProps {
  cows: Cow[];
}

interface NotificationRule {
  daysBeforeDue: number;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: (cowName: string, days: number) => string;
  icon: typeof Bell;
}

const NOTIFICATION_RULES: NotificationRule[] = [
  {
    daysBeforeDue: 30,
    type: 'info',
    title: 'Pengingat 1 Bulan',
    message: (name, days) => `${name} akan melahirkan dalam ${days} hari. Mulai persiapan kandang kelahiran.`,
    icon: Info,
  },
  {
    daysBeforeDue: 14,
    type: 'info',
    title: 'Pengingat 2 Minggu',
    message: (name, days) => `${name} akan melahirkan dalam ${days} hari. Pantau tanda-tanda melahirkan lebih intensif.`,
    icon: Calendar,
  },
  {
    daysBeforeDue: 7,
    type: 'warning',
    title: 'Peringatan 1 Minggu',
    message: (name, days) => `${name} akan melahirkan dalam ${days} hari! Siapkan peralatan kelahiran dan nomor dokter hewan.`,
    icon: Bell,
  },
  {
    daysBeforeDue: 3,
    type: 'warning',
    title: 'Peringatan 3 Hari',
    message: (name, days) => `${name} akan melahirkan dalam ${days} hari! Pisahkan dari kawanan dan pantau 24 jam.`,
    icon: AlertTriangle,
  },
  {
    daysBeforeDue: 1,
    type: 'critical',
    title: 'ALERT KRITIS - H-1',
    message: (name, days) => `${name} akan melahirkan BESOK! Aktifkan monitoring kamera 24 jam dan siaga penuh.`,
    icon: AlertTriangle,
  },
  {
    daysBeforeDue: 0,
    type: 'critical',
    title: 'WAKTU MELAHIRKAN!',
    message: (name) => `${name} DIPERKIRAKAN MELAHIRKAN HARI INI! Jangan tinggalkan kandang tanpa pengawasan.`,
    icon: AlertTriangle,
  },
];

// Check-up reminder every 2 weeks
const CHECKUP_INTERVAL_DAYS = 14;

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ cows }) => {
  useEffect(() => {
    // Check notifications on mount and set up periodic checks
    checkAndSendNotifications();

    // Check every hour
    const interval = setInterval(checkAndSendNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cows]);

  const checkAndSendNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    cows.forEach((cow) => {
      const daysUntilDue = differenceInDays(cow.dueDate, today);
      const pregnancyDays = differenceInDays(today, cow.inseminationDate);

      // Birth notifications
      NOTIFICATION_RULES.forEach((rule) => {
        if (daysUntilDue === rule.daysBeforeDue) {
          sendNotification(rule, cow.name, daysUntilDue);
        }
      });

      // Check-up reminders every 2 weeks
      if (pregnancyDays > 0 && pregnancyDays % CHECKUP_INTERVAL_DAYS === 0 && daysUntilDue > 7) {
        toast.info(`Pengingat Check-up: Waktunya pemeriksaan rutin ${cow.name}`, {
          duration: 8000,
          icon: <Calendar className="w-5 h-5" />,
          description: `Sudah ${pregnancyDays} hari sejak inseminasi. Lakukan foto scan untuk update kondisi.`,
        });
      }
    });
  };

  const sendNotification = (rule: NotificationRule, cowName: string, days: number) => {
    const Icon = rule.icon;

    switch (rule.type) {
      case 'critical':
        toast.error(rule.title, {
          duration: 15000,
          icon: <Icon className="w-6 h-6" />,
          description: rule.message(cowName, days),
        });
        // Send email notification would go here
        break;
      case 'warning':
        toast.warning(rule.title, {
          duration: 10000,
          icon: <Icon className="w-5 h-5" />,
          description: rule.message(cowName, days),
        });
        break;
      case 'info':
        toast.info(rule.title, {
          duration: 8000,
          icon: <Icon className="w-5 h-5" />,
          description: rule.message(cowName, days),
        });
        break;
    }
  };

  return null; // This is a system component, no UI
};

// Notification Center Component for viewing all alerts
export const NotificationCenter: React.FC<{ cows: Cow[] }> = ({ cows }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAlerts = cows
    .map((cow) => {
      const daysUntilDue = differenceInDays(cow.dueDate, today);
      const nextAlert = NOTIFICATION_RULES.find((rule) => daysUntilDue <= rule.daysBeforeDue);
      return { cow, daysUntilDue, nextAlert };
    })
    .filter((item) => item.nextAlert && item.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-black text-black uppercase italic tracking-tighter">Notifikasi Mendatang</h3>
      {upcomingAlerts.length > 0 ? (
        <div className="space-y-3">
          {upcomingAlerts.map(({ cow, daysUntilDue, nextAlert }) => {
            if (!nextAlert) return null;
            const Icon = nextAlert.icon;
            return (
              <div
                key={cow.id}
                className={`p-4 rounded-[24px] border-4 flex items-start gap-4 ${
                  nextAlert.type === 'critical'
                    ? 'bg-black text-white border-black'
                    : nextAlert.type === 'warning'
                    ? 'bg-white border-black'
                    : 'bg-white border-black/20'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 ${
                    nextAlert.type === 'critical'
                      ? 'bg-white text-black'
                      : nextAlert.type === 'warning'
                      ? 'bg-black text-white'
                      : 'bg-black/10 text-black'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wide opacity-60 mb-1">{nextAlert.title}</p>
                  <p className="text-sm font-bold mb-2">{nextAlert.message(cow.name, daysUntilDue)}</p>
                  <p className="text-xs font-black uppercase opacity-40">TAG: {cow.tagId}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border-4 border-dashed border-black/10 rounded-[32px] p-8 text-center">
          <Bell className="w-16 h-16 text-black/20 mx-auto mb-4" />
          <p className="text-sm font-black text-black/40 uppercase">Tidak ada notifikasi kritis</p>
        </div>
      )}
    </div>
  );
};
