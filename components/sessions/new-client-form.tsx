"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { startSession, getUserOrCreate } from "@/lib/storage"

interface NewClientFormProps {
  onClose: () => void
  onSave: () => void
}

export default function NewClientForm({ onClose, onSave }: NewClientFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const users = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("users") || "[]") : [];
  const filteredUsers = name.length > 0 ? users.filter((u: any) => u.name.toLowerCase().includes(name.toLowerCase())) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !phone) {
      setError("يجب إدخال الاسم ورقم الهاتف")
      return
    }

    setIsLoading(true)
    try {
      const user = getUserOrCreate(phone, name)

      startSession({
        name,
        phone,
        college,
        notes,
      })
      onSave()
    } catch (err) {
      setError("فشل في بدء الجلسة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">بدء جلسة جديدة</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text mb-2">الاسم *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="اسم العميل"
              autoComplete="off"
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onFocus={() => name.length > 0 && setShowDropdown(true)}
            />
            <div style={{ position: "relative" }}>
              {filteredUsers.length > 0 && showDropdown && (
                <div className="absolute z-10 bg-white border border-border rounded-lg shadow-lg mt-1 w-full max-h-40 overflow-auto">
                  {filteredUsers.map((u: any) => (
                    <div
                      key={u.id}
                      className="px-4 py-2 cursor-pointer hover:bg-bg-secondary text-sm text-text"
                      onMouseDown={() => {
                        setName(u.name);
                        setPhone(u.phone);
                        setCollege(u.college || "");
                        setShowDropdown(false);
                      }}
                    >
                      {u.name} <span className="text-xs text-text-secondary">({u.phone})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">رقم الهاتف *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">الكلية / الجهة</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="اختياري"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="ملاحظات اختيارية"
            />
          </div>

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
              disabled={isLoading}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "جارٍ البدء..." : "بدء الجلسة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
