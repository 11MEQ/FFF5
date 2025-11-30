"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { initializeDefaultAdmin } from "@/lib/storage"

interface LoginPageProps {
  onLogin: (user: any) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "staff">("admin")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // تهيئة المدير الافتراضي إذا لزم الأمر
      initializeDefaultAdmin()

      // الحصول على جميع المستخدمين من التخزين المحلي
      const admins = JSON.parse(localStorage.getItem("admins") || "[]")

      // البحث عن المستخدم المطابق
      const user = admins.find((u: any) => u.username === username && u.password === password && u.role === role)

      if (user) {
        onLogin({
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        })
      } else {
        setError("اسم المستخدم أو كلمة المرور أو الدور غير صحيح")
      }
    } catch (err) {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* الشعار / العنوان */}
        <div className="text-center mb-8">
          <div className="py-4 px-2 bg-white rounded-lg mb-4">
            <h1 className="text-3xl font-bold text-black mb-2">HUB CLUB</h1>
            <h2 className="">WorkSpace System</h2>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-text mb-6 flex justify-center items-center">تسجيل الدخول</h2>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
              <label className=" text-sm font-medium text-text mb-2 flex">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="  flex text-sm font-medium text-text mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="flex text-sm font-medium text-text mb-2">الدور</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="admin">مدير</option>
                <option value="staff">موظف</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
