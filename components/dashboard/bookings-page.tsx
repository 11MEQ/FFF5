"use client"

import { useState } from "react"
import BookingsList from "@/components/bookings/bookings-list"
import BookingForm from "@/components/bookings/booking-form"

export default function BookingsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1)
    setShowForm(false)
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">الحجوزات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + حجز جديد
        </button>
      </div>

      {showForm && <BookingForm onClose={() => setShowForm(false)} onSave={handleSave} />}
      <BookingsList key={refreshKey} />
    </div>
  )
}
