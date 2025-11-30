"use client"

import { useState, useEffect } from "react"

function getTotal(arr: any[], key: string) {
  return arr.reduce((sum, item) => sum + (item[key] || 0), 0)
}

function filterByPeriod(arr: any[], dateKey: string, period: string, from?: string, to?: string) {
  if (period === "all") return arr;
  const now = new Date();
  let start: Date, end: Date;
  if (period === "day") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(start); end.setDate(start.getDate() + 1);
  } else if (period === "week") {
    const day = now.getDay();
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    end = new Date(start); end.setDate(start.getDate() + 7);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (period === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  } else if (period === "custom" && from && to) {
    start = new Date(from);
    end = new Date(to);
    end.setDate(end.getDate() + 1);
  } else {
    return arr;
  }
  return arr.filter(item => {
    const d = new Date(item[dateKey]);
    return d >= start && d < end;
  });
}


export default function FinanceStatsPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [period, setPeriod] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")

  useEffect(() => {
    setExpenses(JSON.parse(localStorage.getItem("expenses") || "[]"))
    setPurchases(JSON.parse(localStorage.getItem("purchases") || "[]"))
    setBookings(JSON.parse(localStorage.getItem("bookings") || "[]"))
  }, [])

  const filteredExpenses = filterByPeriod(expenses, "date", period, from, to)
  const filteredPurchases = filterByPeriod(purchases, "date", period, from, to)
  const filteredBookings = filterByPeriod(bookings, "start_time", period, from, to)

  const totalExpenses = getTotal(filteredExpenses, "amount")
  const totalPurchases = getTotal(filteredPurchases, "amount")
  const totalRevenue = getTotal(filteredBookings, "cost")
  const netProfit = totalRevenue - totalExpenses - totalPurchases

  // Drinks stock & sales per day
  const drinksByDay = (() => {
    // load drinks and bookings from storage
    const drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
    const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    // compute date range based on period / custom
    const dates: Date[] = [];
    const now = new Date();
    if (period === "all") {
      // default: last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    } else if (period === "day") {
      dates.push(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    } else if (period === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    } else if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    } else if (period === "custom" && from && to) {
      const start = new Date(from);
      const end = new Date(to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    }

    // helper to format YYYY-MM-DD
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    // precompute total sold per drink across all bookings
    const totalSoldMap: Record<string, number> = {};
    allBookings.forEach((b: any) => {
      if (!b.selected_drinks) return;
      Object.entries(b.selected_drinks).forEach(([did, qty]) => {
  const q = typeof qty === 'number' ? qty : Number(qty || 0);
        totalSoldMap[did] = (totalSoldMap[did] || 0) + q;
      });
    });

    return dates.map(date => {
      const dateKey = fmt(date);
      // sum sold for each drink on that date and cumulative up to that date
      const soldOnMap: Record<string, number> = {};
      const cumulativeMap: Record<string, number> = {};

      allBookings.forEach((b: any) => {
        if (!b.selected_drinks) return;
        const bDate = b.start_time ? (b.start_time.split ? b.start_time.split('T')[0] : new Date(b.start_time).toISOString().split('T')[0]) : '';
        Object.entries(b.selected_drinks).forEach(([did, qty]) => {
          const q = typeof qty === 'number' ? qty : Number(qty || 0);
          // sold on the exact day
          if (bDate === dateKey) {
            soldOnMap[did] = (soldOnMap[did] || 0) + q;
          }
        });
      });

      // compute cumulative up to date (inclusive)
      allBookings.forEach((b: any) => {
        if (!b.selected_drinks) return;
        const bDate = b.start_time ? (b.start_time.split ? b.start_time.split('T')[0] : new Date(b.start_time).toISOString().split('T')[0]) : '';
        if (bDate > dateKey) return;
        Object.entries(b.selected_drinks).forEach(([did, qty]) => {
    const q = typeof qty === 'number' ? qty : Number(qty || 0);
          cumulativeMap[did] = (cumulativeMap[did] || 0) + q;
        });
      });

      const rows = drinks.map((dr: any) => {
        const totalSold = totalSoldMap[dr.id] || 0;
        const cumulative = cumulativeMap[dr.id] || 0;
        const soldOn = soldOnMap[dr.id] || 0;
        let remaining: number | string = dr.unlimited ? 'غير محدود' : (dr.quantity ?? 0);
        if (typeof remaining === 'number') {
          // reconstruct remaining at end of this date by adding back sales that occurred after this date
          // remaining_at_date = current_quantity + (total_sold_total - cumulative_up_to_date)
          const currentQty = dr.quantity ?? 0;
          remaining = Math.max(currentQty + (totalSold - cumulative), 0);
        }
        return {
          id: dr.id,
          name: dr.name,
          remaining,
          sold: soldOn,
        };
      });

      return {
        date: dateKey,
        rows,
      };
    });
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">إحصائيات الشؤون المالية</h2>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="font-medium">تصفية حسب:</label>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-border rounded-lg p-2">
          <option value="all">الكل</option>
          <option value="day">اليوم</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
          <option value="year">هذا العام</option>
          <option value="custom">فترة مخصصة</option>
        </select>
        {period === "custom" && (
          <>
            <label className="font-medium">من</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-border rounded-lg p-2" />
            <label className="font-medium">إلى</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-border rounded-lg p-2" />
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">إجمالي الإيرادات (الجلسات)</h3>
          <p className="text-2xl font-bold text-success">{totalRevenue} جنيه</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">إجمالي المصروفات</h3>
          <p className="text-2xl font-bold text-danger">{totalExpenses} جنيه</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">إجمالي المشتريات</h3>
          <p className="text-2xl font-bold text-warning">{totalPurchases} جنيه</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-primary">صافي الربح</h3>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-success" : "text-danger"}`}>{netProfit} جنيه</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm mb-8">
        <div className="mb-2 text-sm text-text-secondary">عدد المصروفات: {filteredExpenses.length}</div>
        <h3 className="text-lg font-bold mb-4 text-primary">تفاصيل المصروفات</h3>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="px-2 py-1 text-right font-semibold text-text">النوع</th>
              <th className="px-2 py-1 text-right font-semibold text-text">المبلغ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">التاريخ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">لا توجد مصروفات بعد.</td></tr>
            ) : (
              filteredExpenses.map((exp: any) => (
                <tr key={exp.id}>
                  <td className="px-2 py-1 text-right text-text font-medium">{exp.type}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.amount}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.date}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mb-2 text-sm text-text-secondary">عدد المشتريات: {filteredPurchases.length}</div>
        <h3 className="text-lg font-bold mb-4 text-primary">تفاصيل المشتريات</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="px-2 py-1 text-right font-semibold text-text">الصنف</th>
              <th className="px-2 py-1 text-right font-semibold text-text">المبلغ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">التاريخ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">لا توجد مشتريات بعد.</td></tr>
            ) : (
              filteredPurchases.map((pur: any) => (
                <tr key={pur.id}>
                  <td className="px-2 py-1 text-right text-text font-medium">{pur.item}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.amount}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.date}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mb-2 text-sm text-text-secondary">عدد الإيرادات (الجلسات): {filteredBookings.length}</div>
        <h3 className="text-lg font-bold mb-4 text-primary">تفاصيل الإيرادات (الجلسات)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary border-b border-border">
                <th className="px-2 py-1 text-right font-semibold text-text">الاسم</th>
                <th className="px-2 py-1 text-right font-semibold text-text">رقم الهاتف</th>
                <th className="px-2 py-1 text-right font-semibold text-text">وقت البداية</th>
                <th className="px-2 py-1 text-right font-semibold text-text">وقت النهاية</th>
                <th className="px-2 py-1 text-right font-semibold text-text">المشروبات</th>
                <th className="px-2 py-1 text-right font-semibold text-text">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-text-secondary">لا توجد جلسات بعد.</td></tr>
              ) : (
                filteredBookings.map((bk: any) => {
                  const drinksText = bk.selected_drinks 
                    ? Object.entries(bk.selected_drinks)
                        .map(([drinkId, qty]: [string, any]) => {
                          const drink = JSON.parse(localStorage.getItem("drinks") || "[]").find((d: any) => d.id === drinkId);
                          return drink ? `${drink.name} (${qty})` : `المشروب ${drinkId} (${qty})`;
                        })
                        .join(", ")
                    : "-";
                  
                  const startTime = bk.start_time ? new Date(bk.start_time).toLocaleString('ar-EG') : "-";
                  const endTime = bk.end_time ? new Date(bk.end_time).toLocaleString('ar-EG') : "-";
                  
                  return (
                    <tr key={bk.id}>
                      <td className="px-2 py-1 text-right text-text font-medium">{bk.name}</td>
                      <td className="px-2 py-1 text-right text-text">{bk.phone || "-"}</td>
                      <td className="px-2 py-1 text-right text-text text-xs">{startTime}</td>
                      <td className="px-2 py-1 text-right text-text text-xs">{endTime}</td>
                      <td className="px-2 py-1 text-right text-text text-xs">{drinksText}</td>
                      <td className="px-2 py-1 text-right text-text">{bk.cost}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 text-primary">مبيعات ومخزون المشروبات حسب اليوم</h3>
          {drinksByDay.length === 0 ? (
            <p className="text-text-secondary">لا توجد بيانات تواريخ للعرض.</p>
          ) : (
            drinksByDay.map((day: any) => (
              <div key={day.date} className="mb-4 bg-bg-secondary/50 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">التاريخ: {new Date(day.date).toLocaleDateString()}</div>
                  <div className="text-sm text-text-secondary">إجمالي مشروبات مباعة في اليوم: {day.rows.reduce((s: number, r: any) => s + (r.sold || 0), 0)}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg-secondary border-b border-border">
                        <th className="px-2 py-1 text-right font-semibold text-text">الصنف</th>
                        <th className="px-2 py-1 text-right font-semibold text-text">المتبقي في المخزون</th>
                        <th className="px-2 py-1 text-right font-semibold text-text">تم البيع في اليوم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.rows.map((r: any) => (
                        <tr key={r.id}>
                          <td className="px-2 py-1 text-right text-text font-medium">{r.name}</td>
                          <td className="px-2 py-1 text-right text-text">{typeof r.remaining === 'number' ? r.remaining : r.remaining}</td>
                          <td className="px-2 py-1 text-right text-text">{r.sold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
