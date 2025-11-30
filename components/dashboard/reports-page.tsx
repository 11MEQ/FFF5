"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useState, useMemo } from "react"
import { getDetailedBookingStats, getUserAnalytics, getPackageUsageStats, getBookingStats } from "@/lib/storage"
import { adminDeleteEndedSession } from "@/lib/storage"
import { TrendingUp, Users, DollarSign } from "lucide-react"

interface ReportsPageProps {
  user?: any
}

export default function ReportsPage({ user }: ReportsPageProps) {
  // جلب قائمة المشروبات للاستخدام في العرض
  const drinksList = useMemo(() => {
    let drinks = window.localStorage.getItem("drinks");
    if (!drinks) return [];
    return JSON.parse(drinks);
  }, []);
  const [filterType, setFilterType] = useState<"day" | "week" | "month">("month");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [bookingsList, setBookingsList] = useState<any[]>(() => {
    let bookings = window.localStorage.getItem("bookings");
    return bookings ? JSON.parse(bookings) : [];
  });

  // تصفية بيانات الرسم حسب النوع ونطاق التاريخ
  const chartData = useMemo(() => {
    let data = getDetailedBookingStats(filterType);
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      data = data.filter((item: any) => {
        const itemDate = new Date(item.period);
        return itemDate >= from && itemDate <= to;
      });
    }
    return data;
  }, [filterType, dateFrom, dateTo]);

  const userAnalytics = useMemo(() => {
    // Patch: ensure phone is included in user object
    return getUserAnalytics(dateFrom, dateTo).map((user: any) => ({
      ...user,
      phone: user.phone || "-"
    }));
  }, [dateFrom, dateTo]);
  const packageStats = useMemo(() => getPackageUsageStats(), []);
  const bookingStats = getBookingStats();

  const COLORS = ["#0052cc", "#ffd700", "#4d7fff", "#ccaa00", "#28a745", "#dc3545", "#17a2b8", "#ff6b6b"];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalBookingsInPeriod = chartData.reduce((sum, item) => sum + item.bookings, 0);
  const avgBookingValue = totalBookingsInPeriod > 0 ? (totalRevenue / totalBookingsInPeriod).toFixed(2) : "0";

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-text">التقارير والإحصائيات</h1>
        <div className="flex gap-2 items-center">
          {(["day", "week", "month"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type ? "bg-primary text-white" : "bg-bg-secondary text-text hover:bg-bg-tertiary"
              }`}
            >
              {type === "day" ? "يومي" : type === "week" ? "أسبوعي" : "شهري"}
            </button>
          ))}
          <span className="mx-2 text-text-secondary">|</span>
          <label className="text-sm text-text-secondary mr-2">من:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-2 py-1 border border-border rounded"
          />
          <label className="text-sm text-text-secondary mx-2">إلى:</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-2 py-1 border border-border rounded"
          />
        </div>
      </div>

      {/* الإحصاءات المختصرة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold text-text">${totalRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent-dark" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">إجمالي الحجوزات</p>
              <p className="text-3xl font-bold text-text">{totalBookingsInPeriod}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">عدد المستخدمين الفريدين</p>
              <p className="text-3xl font-bold text-text">{bookingStats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* أفضل العملاء حسب عدد الحجوزات */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text mb-4">أفضل العملاء حسب عدد الحجوزات ({filterType === "week" ? "أسبوع" : filterType === "month" ? "شهر" : "يوم"})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الاسم</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">رقم الهاتف</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">عدد الحجوزات</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">إجمالي الإنفاق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userAnalytics.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-text-secondary">لا يوجد عملاء في الفترة المحددة.</td></tr>
              ) : (
                userAnalytics.map((user, idx) => (
                  <tr key={idx} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-4 py-2 text-sm text-text font-medium">{user.name}</td>
                    <td className="px-4 py-2 text-sm text-text">{user.phone || "-"}</td>
                    <td className="px-4 py-2 text-sm text-text">{user.bookings}</td>
                    <td className="px-4 py-2 text-sm text-text">${user.totalSpent.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول جميع الحجوزات */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm mt-6">
        <div className="mb-2 text-sm text-text-secondary">عدد الحجوزات: {(() => {
          let filtered = bookingsList;
          if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            filtered = filtered.filter((b: any) => {
              const bookingDate = new Date(b.start_time);
              return bookingDate >= from && bookingDate <= to;
            });
          }
          return filtered.length;
        })()}</div>
        <h3 className="text-lg font-bold text-text mb-4">كل الحجوزات</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الاسم</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">التاريخ</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">وقت البدء</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">وقت الانتهاء</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">الساعات</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">المشروبات</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-text">السعر الكلي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(() => {
                let filtered = bookingsList;
                if (dateFrom && dateTo) {
                  const from = new Date(dateFrom);
                  const to = new Date(dateTo);
                  filtered = filtered.filter((b: any) => {
                    const bookingDate = new Date(b.start_time);
                    return bookingDate >= from && bookingDate <= to;
                  });
                  
                }
                return filtered.map((b: any, idx: number) => {
                  const isEnded = !!b.end_time;
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
                      <td className="px-4 py-2 text-sm text-text">{new Date(b.start_time).toLocaleDateString()}</td>
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
                      <td className="px-4 py-2 text-sm text-text">
                        {isEnded && user?.role === "admin" && (
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            onClick={() => {
                              if (window.confirm("هل أنت متأكد من حذف هذه الجلسة؟ سيتم إعادة العناصر المستهلكة للمخزون.")) {
                                adminDeleteEndedSession(b.id);
                                // Update local state and storage
                                const updated = bookingsList.filter((bk: any) => bk.id !== b.id);
                                setBookingsList(updated);
                                window.localStorage.setItem("bookings", JSON.stringify(updated));
                              }
                            }}
                          >حذف الجلسة</button>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* أداء الباقات */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text mb-4">أداء الباقات</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">اسم الباقة</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">النوع</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">السعر</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">المستخدمون النشطون</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">نسبة الاستخدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packageStats.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-text">{pkg.name}</td>
                  <td className="px-6 py-4 text-sm capitalize text-text">{pkg.type}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-text">${pkg.price}</td>
                  <td className="px-6 py-4 text-sm text-text">{pkg.activeUsers} مستخدم</td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(Number.parseFloat(pkg.percentageSold), 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
