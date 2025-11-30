"use client"

import { useState, useMemo } from "react"
import { Trash2, Edit2 } from "lucide-react"
import { getBookings, deleteBooking } from "@/lib/storage"

export default function BookingsList() {
  const bookings = getBookings()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.phone.includes(searchTerm),
    )
  }, [bookings, searchTerm])

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm" dir="rtl">
      <div className="p-6 border-b border-border">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-right"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-text">الاسم</th>
              <th className="px-6 py-3 text-sm font-semibold text-text">رقم الهاتف</th>
              <th className="px-6 py-3 text-sm font-semibold text-text">المدة</th>
              <th className="px-6 py-3 text-sm font-semibold text-text">التكلفة</th>
              <th className="px-6 py-3 text-sm font-semibold text-text">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-bg-secondary transition-colors">
                <td className="px-6 py-4 text-sm text-text">{booking.name}</td>
                <td className="px-6 py-4 text-sm text-text">{booking.phone}</td>
                <td className="px-6 py-4 text-sm text-text">{booking.duration} ساعة</td>
                <td className="px-6 py-4 text-sm font-semibold text-text">${booking.cost}</td>
                <td className="px-6 py-4 text-sm flex justify-end gap-2">
                  <button className="p-2 text-text-secondary hover:text-primary transition-colors" title="تعديل">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="p-2 text-text-secondary hover:text-danger transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">لا توجد حجوزات</p>
        </div>
      )}
    </div>
  )
}
