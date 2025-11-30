"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { getUserSubscriptions } from "@/lib/storage"

interface NewClientPackageFormProps {
  onClose: () => void
  onSelectClient: (client: any) => void
}

export default function NewClientPackageForm({ onClose, onSelectClient }: NewClientPackageFormProps) {
  const packageClients = useMemo(() => {
    const clients = getUserSubscriptions()
    return clients.map((client) => ({
      ...client,
      package_hours_remaining: client.package_hours_remaining ?? 0,
    }))
  }, [])

  const [selectedClient, setSelectedClient] = useState<string>("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedClient) {
      setError("من فضلك اختر عميلًا")
      return
    }

    const client = packageClients.find((c) => c.id === selectedClient)
    if (!client) {
      setError("العميل غير موجود")
      return
    }

    onSelectClient(client)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">اختر عميل لديه باقة</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">{error}</div>}

          {packageClients.length === 0 ? (
            <div className="p-4 bg-bg-secondary rounded-lg text-center">
              <p className="text-text-secondary">لا يوجد عملاء لديهم باقات نشطة</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text mb-2">اختر العميل *</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">اختر عميل...</option>
                {packageClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.packageName} ({(client.package_hours_remaining ?? 0).toFixed(1)} ساعة متبقية)
                  </option>
                ))}
              </select>

              {selectedClient && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="space-y-2">
                    {packageClients.map(
                      (client) =>
                        client.id === selectedClient && (
                          <div key={client.id}>
                            <p className="text-sm">
                              <span className="font-medium text-text">الاسم:</span> {client.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-text">رقم الهاتف:</span> {client.phone}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-text">اسم الباقة:</span> {client.packageName}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-black">الساعات المتبقية:</span>{" "}
                              <span className="text-black font-bold">
                                {(client.package_hours_remaining ?? 0).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text hover:bg-bg-secondary rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedClient}
              className="px-4 py-2 bg-accent-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              بدء الجلسة
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
