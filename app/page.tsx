'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  MonitorPlay,
  ArrowLeftFromLine,
  DoorOpen,
  School2,
  Computer,
  Stethoscope,
  UtensilsCrossed,
  BusFront,
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

interface KeyLog {
  id?: number;
  user_name: string;
  key_name: string;
  action: 'borrow' | 'return';
  created_at: string;
}

interface Room {
  id: string;
  name: string;
  status: 'available' | 'borrowed' | 'pending';
  borrowedBy: string;
  borrowDate: string;
  returnDate: string;
  returnedBy: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  borrowedRooms: number;
  lastBorrow: string;
}

interface RoomUsage {
  id: string;
  name: string;
  usageCount: number;
  percentage: number;
}

const ROOM_MASTER_NAMES: string[] = [
  'ห้องทฤษฎี1',
  'ห้องทฤษฎี2',
  'ห้องทฤษฎี3',
  'ห้องทฤษฎี4',
  'ห้องทฤษฎี5',
  'ห้องคอม',
  'ห้องพยาบาล',
  'ห้องพักครู',
  'ห้องอาหาร',
  'รถโรงเรียน',
];

const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-08 09:00',
  },
  {
    id: 'U002',
    name: 'สมหญิง สวยงาม',
    email: 'somying@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-07 14:30',
  },
  {
    id: 'U003',
    name: 'วิชัย มั่นคง',
    email: 'vichai@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-08 10:00',
  },
  {
    id: 'U004',
    name: 'นิดา ใจบุญ',
    email: 'nida@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-08 08:00',
  },
  {
    id: 'U005',
    name: 'อนุชา ศรีสวัสดิ์',
    email: 'anucha@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-06 13:00',
  },
  {
    id: 'U006',
    name: 'ธีรพล เจริญสุข',
    email: 'theeraphol@example.com',
    borrowedRooms: 1,
    lastBorrow: '2025-12-08 11:30',
  },
  {
    id: 'U007',
    name: 'สุรชัย ศรีสุข',
    email: 'surachai@example.com',
    borrowedRooms: 0,
    lastBorrow: '2025-12-05 10:00',
  },
  {
    id: 'U008',
    name: 'ศิรินทร์ ดวงใจ',
    email: 'sirintra@example.com',
    borrowedRooms: 0,
    lastBorrow: '2025-12-04 15:00',
  },
  {
    id: 'U009',
    name: 'กฤษณ์ สิทธิ์',
    email: 'krit@example.com',
    borrowedRooms: 0,
    lastBorrow: '2025-12-03 09:30',
  },
  {
    id: 'U010',
    name: 'ปรีชา ศรีสวัสดิ์',
    email: 'preecha@example.com',
    borrowedRooms: 0,
    lastBorrow: '2025-12-02 14:00',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'borrowed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getRoomIcon(name: string) {
  if (name.startsWith('ห้องทฤษฎี')) {
    // ห้องเรียนทั่วไป – ใช้โทนเขียวอมฟ้า
    return <School2 className="h-4 w-4 text-emerald-300" />;
  }
  if (name === 'ห้องคอม') {
    // ห้องคอม – ใช้โทนฟ้า
    return <Computer className="h-4 w-4 text-sky-300" />;
  }
  if (name === 'ห้องพยาบาล') {
    // พยาบาล – ใช้โทนชมพู
    return <Stethoscope className="h-4 w-4 text-rose-300" />;
  }
  if (name === 'ห้องพักครู') {
    // ห้องพักครู – ใช้โทนม่วง
    return <School2 className="h-4 w-4 text-violet-300" />;
  }
  if (name === 'ห้องอาหาร') {
    // ห้องอาหาร – ใช้โทนส้ม
    return <UtensilsCrossed className="h-4 w-4 text-amber-300" />;
  }
  if (name === 'รถโรงเรียน') {
    // รถโรงเรียน – ใช้โทนเหลืองสด
    return <BusFront className="h-4 w-4 text-yellow-300" />;
  }

  // ค่าเริ่มต้น – ประตูห้องสีฟ้าอ่อน
  return <DoorOpen className="h-4 w-4 text-cyan-300" />;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'available':
      return 'ว่าง';
    case 'borrowed':
      return 'ยืมแล้ว';
    case 'pending':
      return 'รอคืน';
    default:
      return status;
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'available':
      return 'text-emerald-300';
    case 'borrowed':
      return 'text-sky-300';
    case 'pending':
      return 'text-amber-200';
    default:
      return 'text-slate-200';
  }
}

function buildRoomsFromLogs(logs: KeyLog[]): Room[] {
  const byKey = new Map<string, Room>();

  // เริ่มจากรายการห้องหลัก 10 ห้องทั้งหมดเป็นสถานะว่าง
  ROOM_MASTER_NAMES.forEach((name, index) => {
    const id = `R${(index + 1).toString().padStart(3, '0')}`;
    byKey.set(name, {
      id,
      name,
      status: 'available',
      borrowedBy: '-',
      borrowDate: '-',
      returnDate: '-',
      returnedBy: '-',
    });
  });

  if (!logs || logs.length === 0) {
    return Array.from(byKey.values());
  }
  const sorted = [...logs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  sorted.forEach((log) => {
    // ถ้า log.key_name ไม่ตรงกับชื่อใน ROOM_MASTER_NAMES จะข้าม เพื่อกันข้อมูลแปลกๆ ไม่ให้กระทบ
    if (!byKey.has(log.key_name)) {
      return;
    }

    const room = byKey.get(log.key_name)!;
    if (log.action === 'borrow') {
      room.status = 'borrowed';
      room.borrowedBy = log.user_name || '-';
      room.borrowDate = new Date(log.created_at).toLocaleString('th-TH');
      room.returnDate = '-';
      room.returnedBy = '-';
    } else if (log.action === 'return') {
      room.status = 'available';
      room.returnDate = new Date(log.created_at).toLocaleString('th-TH');
      room.returnedBy = log.user_name || '-';
      if (room.borrowedBy === '-') {
        room.borrowedBy = log.user_name || '-';
      }
    }
  });

  return Array.from(byKey.values());
}

function buildRoomUsageFromLogs(logs: KeyLog[]): RoomUsage[] {
  const usageMap = new Map<string, number>();

  logs
    .filter((log) => log.action === 'borrow')
    .forEach((log) => {
      const current = usageMap.get(log.key_name) ?? 0;
      usageMap.set(log.key_name, current + 1);
    });

  const entries = Array.from(usageMap.entries());
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

  return entries
    .map(([name, count], index) => ({
      id: `R${(index + 1).toString().padStart(3, '0')}`,
      name,
      usageCount: count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.usageCount - a.usageCount);
}

function buildDailyUsageFromLogs(logs: KeyLog[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]; // อา..เสาร์ (จะ map ภายหลังให้เป็น จันทร์..อาทิตย์)

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  logs
    .filter((log) => log.action === 'borrow')
    .forEach((log) => {
      const d = new Date(log.created_at);
      if (d < monday || d > sunday) {
        return;
      }
      const day = d.getDay();
      counts[day] += 1;
    });

  // ปรับลำดับให้เริ่มที่ จันทร์ (1) ไปจนถึง อาทิตย์ (0)
  return [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'users' | 'history'>('rooms');

  const [logs, setLogs] = useState<KeyLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomUsage, setRoomUsage] = useState<RoomUsage[]>([]);
  const [dailyUsageCounts, setDailyUsageCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | 'ALL'>('ALL');
  const [tvMode, setTvMode] = useState(false);

  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const borrowedCount = rooms.filter((r) => r.status === 'borrowed').length;
  const pendingCount = rooms.filter((r) => r.status === 'pending').length;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const isFirstRender = useRef(true);
  const lastCountsRef = useRef({
    available: availableCount,
    borrowed: borrowedCount,
    pending: pendingCount,
  });
  const lastLatestLogTimeRef = useRef<string | null>(null);

  function triggerToast(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  }

  useEffect(() => {
    const last = lastCountsRef.current;
    const changed =
      last.available !== availableCount ||
      last.borrowed !== borrowedCount ||
      last.pending !== pendingCount;

    if (isFirstRender.current) {
      // ครั้งแรกให้แค่เซ็ตค่าอ้างอิง ไม่ต้อง toast
      isFirstRender.current = false;
    } else if (changed) {
      triggerToast('มีการอัปเดตข้อมูลการใช้กุญแจล่าสุด');
    }

    if (changed) {
      lastCountsRef.current = {
        available: availableCount,
        borrowed: borrowedCount,
        pending: pendingCount,
      };
    }
  }, [availableCount, borrowedCount, pendingCount]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setError('Supabase env ไม่ถูกต้อง (กรุณาตรวจสอบ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
          setLoading(false);
          return;
        }

        const res = await fetch(`${supabaseUrl}/rest/v1/key_logs?select=*&order=created_at.desc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (!res.ok) {
          throw new Error(`ดึงข้อมูล Supabase ไม่สำเร็จ (${res.status})`);
        }

        const data: KeyLog[] = await res.json();

        // เรียงจากรายการล่าสุดไปเก่าสุด เผื่อในอนาคตเราเปลี่ยน query ฝั่ง Supabase
        const sortedLogs = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setLogs(sortedLogs);
        setRooms(buildRoomsFromLogs(sortedLogs));
        setRoomUsage(buildRoomUsageFromLogs(sortedLogs));
        setDailyUsageCounts(buildDailyUsageFromLogs(sortedLogs));

        // ตรวจว่ามี "รายการล่าสุด" ใหม่กว่าเดิมไหม ถ้ามีให้แสดง toast พร้อมชื่อผู้ใช้และชื่อห้อง
        const latestLog = sortedLogs[0];
        const latestLogTime = latestLog?.created_at ?? null;
        if (
          latestLogTime &&
          lastLatestLogTimeRef.current &&
          latestLogTime !== lastLatestLogTimeRef.current
        ) {
          const userName = latestLog?.user_name || '-';
          const roomName = latestLog?.key_name || '-';
          const actionLabel = latestLog?.action === 'borrow' ? 'ยืมกุญแจ' : 'คืนกุญแจ';
          triggerToast(`${userName} ${actionLabel} ${roomName}`);
        }
        lastLatestLogTimeRef.current = latestLogTime;
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase');
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let sakuraInstance: any = null;

    const head = document.head || document.getElementsByTagName('head')[0];

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/sakura-js/dist/sakura.min.css';
    head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/sakura-js/dist/sakura.min.js';
    script.async = true;
    script.onload = () => {
      const SakuraGlobal: any = (window as any).Sakura;
      if (typeof SakuraGlobal === 'function') {
        sakuraInstance = new SakuraGlobal('body');
      } else {
        console.error('sakura-js global Sakura not found on window');
      }
    };
    script.onerror = (e) => {
      console.error('Failed to load sakura-js script from CDN', e);
    };
    head.appendChild(script);

    return () => {
      if (sakuraInstance && typeof sakuraInstance.stop === 'function') {
        sakuraInstance.stop(true);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  // Build user history summary from logs
  const userHistoryMap = new Map<
    string,
    {
      userName: string;
      totalBorrows: number;
      totalReturns: number;
      lastActivity: string;
    }
  >();

  logs.forEach((log: KeyLog) => {
    const key = log.user_name || '-';
    const existing =
      userHistoryMap.get(key) ||
      ({
        userName: key,
        totalBorrows: 0,
        totalReturns: 0,
        lastActivity: log.created_at,
      } as const as {
        userName: string;
        totalBorrows: number;
        totalReturns: number;
        lastActivity: string;
      });

    const updated = { ...existing };

    if (log.action === 'borrow') {
      updated.totalBorrows += 1;
    } else if (log.action === 'return') {
      updated.totalReturns += 1;
    }

    if (new Date(log.created_at).getTime() > new Date(updated.lastActivity).getTime()) {
      updated.lastActivity = log.created_at;
    }

    userHistoryMap.set(key, updated);
  });

  const userHistoryList = Array.from(userHistoryMap.values()).sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  const filteredLogs: KeyLog[] = (
    selectedUser === 'ALL'
      ? logs
      : logs.filter((log: KeyLog) => log.user_name === selectedUser)
  ).slice(0, 80);

  // Donut chart data for key status
  const statusChartData = {
    labels: ['ว่าง', 'ยืมแล้ว', 'รอคืน'],
    datasets: [
      {
        data: [availableCount, borrowedCount, pendingCount],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
        borderColor: ['#059669', '#1d4ed8', '#d97706'],
        borderWidth: 2,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.label + ': ' + context.parsed + ' ห้อง';
          },
        },
      },
      datalabels: {
        color: '#ffffff',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        formatter: function (value: any, context: any) {
          const label = context.chart.data.labels[context.dataIndex];
          return value + '\n(' + label + ')';
        },
        anchor: 'center' as const,
        align: 'center' as const,
      },
    },
  };

  // Daily usage data for bar chart (highlight current day in orange)
  const today = new Date();
  const jsDay = today.getDay(); // 0=Sun .. 6=Sat
  const todayIndexInLabels = jsDay === 0 ? 6 : jsDay - 1; // map to [Mon..Sun] index

  const dailyBarColors = Array(7)
    .fill('#3b82f6')
    .map((color, index) => (index === todayIndexInLabels ? '#f97316' : color));

  const dailyUsageData = {
    labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
    datasets: [
      {
        label: 'จำนวนครั้งที่ยืม',
        data: dailyUsageCounts,
        backgroundColor: dailyBarColors,
        borderColor: '#1d4ed8',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const dailyUsageOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.dataset.label + ': ' + context.parsed.y + ' ครั้ง';
          },
        },
      },
      datalabels: {
        color: '#ffffff',
        font: {
          size: 12,
          weight: 'bold' as const,
        },
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 4,
        formatter: function (value: any) {
          return value;
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-rose-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/80 px-5 py-2 shadow-lg shadow-rose-900/40 border border-rose-700/70">
                <span className="text-2xl">🔑</span>
                <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-rose-100 drop-shadow-sm">
                  Interpattanasat Key Management
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                ระบบติดตามการยืม-คืนกุญแจห้องเรียนและทรัพย์สินของโรงเรียนแบบเรียลไทม์
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Dashboard สถานะล่าสุดจาก Supabase</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="text-sm text-slate-400">วันที่: {new Date().toLocaleDateString('th-TH')}</p>
                <p className="text-sm text-slate-400">เวลา: {new Date().toLocaleTimeString('th-TH')}</p>
              </div>
              <button
                onClick={() => setTvMode((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full border border-blue-500/60 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 shadow-sm hover:bg-blue-500/20"
              >
                {tvMode ? (
                  <>
                    <ArrowLeftFromLine className="mr-1 h-4 w-4" />
                    <span>กลับโหมดปกติ</span>
                  </>
                ) : (
                  <>
                    <MonitorPlay className="mr-1 h-4 w-4" />
                    <span>โหมดทีวี (แสดงบนจอใหญ่)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-slate-200">
            กำลังโหลดข้อมูลจาก Supabase...
          </div>
        )}

        {/* TV Mode Layout */}
        {tvMode && !loading && !error && (
          <div className="space-y-8">
            {/* Summary cards + donut chart for TV */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-600/90 p-6 text-white shadow-xl">
                  <p className="text-sm font-medium uppercase tracking-wide opacity-90">ห้องว่าง</p>
                  <p className="mt-2 text-4xl font-extrabold">{availableCount}</p>
                </div>
                <div className="rounded-2xl bg-sky-600/90 p-6 text-white shadow-xl">
                  <p className="text-sm font-medium uppercase tracking-wide opacity-90">กำลังใช้งาน</p>
                  <p className="mt-2 text-4xl font-extrabold">{borrowedCount}</p>
                </div>
                <div className="rounded-2xl bg-amber-500/90 p-6 text-white shadow-xl">
                  <p className="text-sm font-medium uppercase tracking-wide opacity-90">รอคืน</p>
                  <p className="mt-2 text-4xl font-extrabold">{pendingCount}</p>
                </div>
              </div>
             
            </div>

            {/* Big room status + donut for TV in two columns */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Left: room status cards inside its own container */}
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl">
                <h2 className="mb-4 text-2xl font-bold text-white">สถานะห้อง (โหมดทีวี)</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {rooms.map((room) => {
                    const isAvailable = room.status === 'available';
                    const isBorrowed = room.status === 'borrowed';
                    const isPending = room.status === 'pending';

                    const cardBg = isAvailable
                      ? 'from-emerald-600/80 via-emerald-700/80 to-emerald-800/90'
                      : isBorrowed
                      ? 'from-sky-600/80 via-sky-700/80 to-sky-800/90'
                      : 'from-amber-500/80 via-amber-600/80 to-amber-700/90';

                    return (
                      <div
                        key={room.id}
                        className={`flex h-full flex-col justify-between rounded-2xl bg-linear-to-br ${cardBg} p-4 text-white shadow-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-sm uppercase tracking-wide opacity-90">
                              {getRoomIcon(room.name)}
                            </div>
                            <p className="text-xl font-extrabold leading-tight">{room.name}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                              room.status
                            )}`}
                          >
                            {getStatusLabel(room.status)}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-100/80">ยืมโดย</span>
                            <span className="font-semibold text-white">{room.borrowedBy}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-100/80">
                            <span>เวลา/วันที่ยืม</span>
                            <span className="text-right text-slate-100/80">{room.borrowDate}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/10">
                            <span className="text-slate-100/80">คืนโดย</span>
                            <span className="font-semibold text-white">{room.returnedBy}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-100/80">
                            <span>เวลา/วันที่คืน</span>
                            <span className="text-right text-slate-100/80">{room.returnDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: donut + room list as separate column */}
              <div className="mx-auto w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-white shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">ภาพรวมสถานะ (โดนัท)</h2>
                <div className="flex flex-col items-stretch gap-8 xl:flex-row">
                  <div className="flex items-center justify-center xl:flex-3">
                    <div className="w-80 h-80 md:w-104 md:h-104 max-w-full">
                      <Doughnut data={statusChartData} options={statusChartOptions} />
                    </div>
                  </div>
                  <div className="xl:flex-2 flex-1 space-y-1 pr-2 text-sm">
                    {rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between gap-3 py-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              room.status === 'available'
                                ? 'bg-emerald-400'
                                : room.status === 'borrowed'
                                ? 'bg-sky-400'
                                : 'bg-amber-300'
                            }`}
                          />
                          <span className="text-slate-100/90">{room.name}</span>
                        </div>
                        <span className={`whitespace-nowrap font-medium ${getStatusTextColor(room.status)}`}>
                          {getStatusLabel(room.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Normal dashboard layout (non-TV mode) */}
        {!tvMode && (
          <>
            {/* History Tab */}
            {activeTab === 'history' && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveTab('rooms');
                  setSelectedUser('ALL');
                }}
                className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 shadow-sm hover:border-blue-500 hover:text-blue-300"
              >
                ← ย้อนกลับไปหน้าสถานะห้อง
              </button>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">รายชื่อผู้ใช้ที่เคยยืมกุญแจ</h2>
                <button
                  onClick={() => setSelectedUser('ALL')}
                  className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                    selectedUser === 'ALL'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300'
                  }`}
                >
                  แสดงทั้งหมด
                </button>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {userHistoryList.map((user) => (
                  <button
                    key={user.userName}
                    onClick={() => setSelectedUser(user.userName)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      selectedUser === user.userName
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{user.userName}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          อัปเดตล่าสุด:{' '}
                          {new Date(user.lastActivity).toLocaleString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-300">
                        <p>ยืม {user.totalBorrows} ครั้ง</p>
                        <p>คืน {user.totalReturns} ครั้ง</p>
                      </div>
                    </div>
                  </button>
                ))}
                {userHistoryList.length === 0 && (
                  <p className="text-sm text-slate-400">ยังไม่มีประวัติการยืมในระบบ</p>
                )}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  ประวัติการยืมย้อนหลัง
                </h2>
                <p className="text-xs text-slate-400">
                  แสดงสูงสุด {filteredLogs.length} รายการล่าสุด
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-800">
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                          ผู้ใช้
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                          ห้อง / กุญแจ
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                          กิจกรรม
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                          เวลา
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredLogs.map((log) => (
                        <tr key={`${log.id}-${log.created_at}`} className="hover:bg-slate-700/40">
                          <td className="px-4 py-3 text-slate-200">{log.user_name || '-'}</td>
                          <td className="px-4 py-3 text-slate-300">{log.key_name || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                log.action === 'borrow'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {log.action === 'borrow' ? 'ยืมกุญแจ' : 'คืนกุญแจ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(log.created_at).toLocaleString('th-TH')}
                          </td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-sm text-slate-400"
                          >
                            ยังไม่มีข้อมูลประวัติการยืม
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/60 bg-red-900/40 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-linear-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">ห้องว่าง</p>
                    <p className="mt-2 text-3xl font-bold">{availableCount}</p>
                  </div>
                  <div className="text-5xl opacity-20">✓</div>
                </div>
              </div>
              <div className="rounded-lg bg-linear-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">ยืมแล้ว</p>
                    <p className="mt-2 text-3xl font-bold">{borrowedCount}</p>
                  </div>
                  <div className="text-5xl opacity-20">📋</div>
                </div>
              </div>
              <div className="rounded-lg bg-linear-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">รอคืน</p>
                    <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
                  </div>
                  <div className="text-5xl opacity-20">⏳</div>
                </div>
              </div>
            </div>

        {/* Charts Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">📊 สถานะกุญแจห้อง</h2>
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <Doughnut data={statusChartData} options={statusChartOptions} />
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">📈 การใช้แต่ละวัน (สัปดาห์นี้)</h2>
            <div className="h-80">
              <Bar data={dailyUsageData} options={dailyUsageOptions} />
            </div>
          </div>
        </div>

        

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            📍 สถานะห้อง (10 ห้อง)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            👥 ผู้ใช้งาน (10 คน)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🕘 ประวัติการยืมย้อนหลัง
          </button>
        </div>

        {/* Rooms Tab */
        }
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">ห้อง</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">สถานะ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">ยืมโดย</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">คืนโดย</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">วันที่ยืม</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">วันที่คืน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{room.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                              room.status
                            )}`}
                          >
                            {getStatusLabel(room.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{room.borrowedBy}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{room.returnedBy}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{room.borrowDate}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{room.returnDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

            {/* Most Used Rooms Ranking */}
            <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-white">🏆 อันดับห้องที่ถูกใช้งานมากที่สุด</h2>
              <div className="space-y-3">
                {roomUsage.map((room, index) => {
                  const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                  return (
                    <div key={room.id} className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-yellow-400 w-8">{medalEmoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{room.name}</span>
                          <span className="text-sm text-slate-400">{room.usageCount} ครั้ง</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-linear-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${room.percentage * 5}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{room.percentage}% ของการใช้งานทั้งหมด</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 shadow-lg hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-3xl">👤</div>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">ห้องที่ยืม:</span>
                    <span className="text-lg font-bold text-blue-400">{user.borrowedRooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">ยืมครั้งล่าสุด:</span>
                    <span className="text-sm text-slate-300">{user.lastBorrow}</span>
                  </div>
                </div>
                {user.borrowedRooms > 0 && (
                  <div className="mt-4 rounded bg-blue-500/20 px-3 py-2 text-xs text-blue-300">
                    ⚠️ มีห้องที่ยืมอยู่
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {showToast && toastMessage && (
          <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-emerald-500/60 bg-slate-900/95 px-4 py-3 text-sm text-emerald-100 shadow-xl">
            <div className="mt-0.5 text-lg">🔔</div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-300">อัปเดตข้อมูลแล้ว</p>
              <p className="mt-0.5 text-emerald-100/90">{toastMessage}</p>
            </div>
          </div>
        )}
        </>
      )}
      </main>
    </div>
  );
}
