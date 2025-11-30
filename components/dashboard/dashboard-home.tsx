
"use client"
// TopDrinksTable component
function TopDrinksTable() {
  let topDrinks: any[] = [];
  if (typeof window !== "undefined") {
    const drinks = JSON.parse(window.localStorage.getItem("drinks") || "[]");
    topDrinks = drinks
      .filter((d: any) => !d.unlimited)
      .sort((a: any, b: any) => (b.sold ?? 0) - (a.sold ?? 0))
      .slice(0, 3);
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-bg-secondary border-b border-border">
          <th className="px-2 py-1 text-right font-semibold text-text">الاسم</th>
          <th className="px-2 py-1 text-right font-semibold text-text">تم البيع</th>
        </tr>
      </thead>
      <tbody>
        {topDrinks.length === 0 ? (
          <tr><td colSpan={2} className="text-center py-4 text-text-secondary">لا يوجد عناصر</td></tr>
        ) : (
          topDrinks.map((d: any, idx: any) => (
            <tr key={d.id || idx}>
              <td className="px-2 py-1 text-right text-text font-medium">{d.name}</td>
              <td className="px-2 py-1 text-right text-text">{d.sold ?? 0}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react"
import { getBookingStats, getDrinkStats, getNotes, getUserAnalytics } from "@/lib/storage"
// TopCustomersTable component
function TopCustomersTable() {
  let topCustomers: any[] = [];
  if (typeof window !== "undefined") {
    topCustomers = getUserAnalytics().slice(0, 3);
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-bg-secondary border-b border-border">
          <th className="px-2 py-1 text-right font-semibold text-text">الاسم</th>
          <th className="px-2 py-1 text-right font-semibold text-text">الهاتف</th>
          <th className="px-2 py-1 text-right font-semibold text-text">الحجوزات</th>
        </tr>
      </thead>
      <tbody>
        {topCustomers.length === 0 ? (
          <tr><td colSpan={3} className="text-center py-4 text-text-secondary">لا يوجد عملاء</td></tr>
        ) : (
          topCustomers.map((c: any, idx: any) => (
            <tr key={c.phone || idx}>
              <td className="px-2 py-1 text-right text-text font-medium">{c.name}</td>
              <td className="px-2 py-1 text-right text-text">{c.phone}</td>
              <td className="px-2 py-1 text-right text-text">{c.bookings}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

import { useState, useMemo } from "react"

function DashboardHome() {
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [notesCollapsed, setNotesCollapsed] = useState(true)
  const todayBookings = useMemo(() => {
    if (typeof window === "undefined") return [];
    const bookingsRaw = window.localStorage.getItem("bookings");
    if (!bookingsRaw) return [];
    const bookings = JSON.parse(bookingsRaw);
    const now = new Date();
    // Calculate start and end of 'today' as 8:30AM to next day 8:30AM
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30, 0, 0);
    let end = new Date(start);
    end.setDate(start.getDate() + 1);
    // If current time is before 8:30AM, shift window to previous day
    if (now < start) {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    }
    return bookings.filter((b: any) => {
      const bookingDate = new Date(b.start_time);
      return bookingDate >= start && bookingDate < end;
    });
  }, []);

  const drinksList = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("drinks") || "[]") : [];
  // Only use todayBookings for stats cards
  // Fetch notes from localStorage
  const notes = typeof window !== "undefined" ? getNotes() : [];

  // Count users in todayBookings
  const todayUserCount = (() => {
    const names = todayBookings.map((b: any) => b.name).filter(Boolean);
    return Array.from(new Set(names)).length;
  })();

  // Calculate stats for only todayBookings
  const todayBookingsCount = todayBookings.length;
  const todayIncome = todayBookings.reduce((sum: number, b: any) => sum + (b.total_price ?? b.cost ?? 0), 0);

  const drinkStats = getDrinkStats()

  // Chart data can still use full stats if needed, but cards use todayBookings only

  const COLORS = ["#0052cc", "#ffd700", "#4d7fff", "#ccaa00"]

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* ملاحظات وبطاقات الإحصائيات جنبًا إلى جنب */}
      <div className="flex flex-row gap-4 mb-6">
        {/* بطاقات الإحصائيات */}
        <div className="flex flex-row flex-auto gap-4">
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow min-h-[220px] flex flex-col justify-between self-stretch w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">حجوزات اليوم</p>
                <p className="text-3xl font-bold text-text">{todayBookingsCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow min-h-[220px] flex flex-col justify-between self-stretch w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">إيرادات اليوم</p>
                <p className="text-3xl font-bold text-text">${todayIncome}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-dark" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow min-h-[220px] flex flex-col justify-between self-stretch w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">إجمالي المستخدمين (حجوزات اليوم)</p>
                <p className="text-3xl font-bold text-text">{todayUserCount}</p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* كل الملاحظات - Collapsible & Top Customers */}
        <div className="flex flex-row gap-4">
          {/* Notes Collapsible */}
          <div className="w-[500px]">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">كل الملاحظات</h3>
                <button
                  className="bg-primary text-white px-3 py-1 rounded text-sm"
                  onClick={() => setNotesCollapsed(!notesCollapsed)}
                >
                  {notesCollapsed ? "عرض الكل" : "إخفاء"}
                </button>
              </div>
              {notes.length === 0 ? (
                <p className="text-text-secondary">لا توجد ملاحظات بعد.</p>
              ) : (
                <div className={`space-y-4 transition-all duration-300 ${notesCollapsed ? "max-h-32 overflow-hidden" : "max-h-[600px] overflow-auto"}`}>
                  {notes
                    .slice() // copy array
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((note: any) => (
                      <div key={note.id} className="border border-border rounded-lg p-4 bg-bg-secondary">
                        <h4 className="font-semibold mb-1 text-primary">{note.title}</h4>
                        <p className="mb-2 text-text">{note.content}</p>
                        <span className="text-xs text-text-secondary">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          {/* Top 3 Customers Box */}
          <div className="w-[300px] flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm flex flex-col h-full">
              <h3 className="text-lg font-bold text-text mb-4">أفضل العملاء حسب عدد الحجوزات</h3>
              <TopCustomersTable />
            </div>
          </div>
           <div className="w-[300px] flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm flex flex-col h-full">
              <h3 className="text-lg font-bold text-text mb-4">الأكثر مبيعاً (مشروبات/عناصر)</h3>
              <TopDrinksTable />
            </div>
           </div>
            
        </div>
{/* export default DashboardHome; */}

  {/* جدول حجوزات اليوم */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-text mb-4">حجوزات اليوم</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الاسم</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">وقت الابتداء</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">وقت الانتهاء</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الساعات</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">المشروبات</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الإجمالي</th>
              </tr>
              
            </thead>
            <tbody className="divide-y divide-border">
              {todayBookings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-text-secondary">لا توجد حجوزات اليوم.</td></tr>
              ) : (
                todayBookings.map((b: any, idx: number) => {
                  const start = new Date(b.start_time);
                  let end = b.end_time ? new Date(b.end_time) : new Date();
                  // If end is before start, assume booking went past midnight — advance end by days until it's after start
                  while (end < start) {
                    end = new Date(end.getTime());
                    end.setDate(end.getDate() + 1);
                  }
                  const elapsedTotalMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
                  const hours = Math.floor(elapsedTotalMinutes / 60);
                  const minutes = elapsedTotalMinutes % 60;
                  const minutesPadded = String(minutes).padStart(2, "0");
                  const durationDisplay = hours > 0 ? `${hours} س ${minutesPadded} د` : `${minutesPadded} د`;

                  return (
                  <tr key={b.id || idx} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-4 py-2 text-sm text-text font-medium">{b.name}</td>
                    <td className="px-4 py-2 text-sm text-text">{new Date(b.start_time).toLocaleTimeString()}</td>
                    <td className="px-4 py-2 text-sm text-text">{b.end_time ? new Date(b.end_time).toLocaleTimeString() : "-"}</td>
                    <td className="px-4 py-2 text-sm text-text">{durationDisplay}</td>
                    <td className="px-4 py-2 text-sm text-text">{
                      b.selected_drinks
                        ? Object.entries(b.selected_drinks)
                            .map(([drinkId, qty]) => {
                              const drink = drinksList.find((d: any) => d.id === drinkId);
                              return drink ? `${drink.name}: ${qty}` : `${drinkId}: ${qty}`;
                            })
                            .join(", ")
                        : "-"
                    }</td>
                    <td className="px-4 py-2 text-sm text-text">${b.total_price?.toFixed ? b.total_price.toFixed(2) : b.total_price}</td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome;
