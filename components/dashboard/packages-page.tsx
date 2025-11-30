"use client"

import { useState } from "react"
import PackagesList from "@/components/packages/packages-list"
import PackageForm from "@/components/packages/package-form"

export default function PackagesPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">الباقات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + إضافة باقة جديدة
        </button>
      </div>

      {showForm && (
        <PackageForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            setRefreshKey((prev) => prev + 1)
            setShowForm(false)
          }}
        />
      )}
      <PackagesList key={refreshKey} />
    </div>
  )
}
