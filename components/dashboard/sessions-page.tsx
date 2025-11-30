"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import ActiveSessionsList from "@/components/sessions/active-sessions-list"
import NewClientForm from "@/components/sessions/new-client-form"
import NewClientPackageForm from "@/components/sessions/new-client-package-form"
import { startSession } from "@/lib/storage"

export default function SessionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1)
    setShowForm(false)
    setShowPackageForm(false)
  }

  const handleSelectPackageClient = (client: any) => {
    startSession({
      name: client.name,
      phone: client.phone,
      college: client.college || "",
      notes: `الباقة: ${client.packageName}`,
      user_id: client.id,
      is_package_session: true,
    })
    handleSave()
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">الجلسات النشطة</h1>
          <p className="text-text-secondary mt-1">إدارة جلسات العمل الجارية للعملاء في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPackageForm(true)}
            className="flex items-center gap-2 bg-accent-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            عميل جديد من باقة
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            عميل جديد
          </button>
        </div>
      </div>

      <ActiveSessionsList key={refreshKey} />

      {showForm && <NewClientForm onClose={() => setShowForm(false)} onSave={handleSave} />}
      {showPackageForm && (
        <NewClientPackageForm onClose={() => setShowPackageForm(false)} onSelectClient={handleSelectPackageClient} />
      )}
    </div>
  )
}
