"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Download, Plus, Trash2, Upload, AlertCircle, FileUp } from "lucide-react"
import { backupToExcel, getAdmins, addAdmin, removeStaff, restoreFromBackup, exportToExcel } from "@/lib/storage"

interface SettingsPageProps {
  user: any
}

export default function SettingsPage({ user }: SettingsPageProps) {
  // Export to Excel handler
  const handleExcelExport = async () => {
    setIsExporting(true);
    setError("");
    setBackupMessage("");
    try {
      await exportToExcel();
      setBackupMessage("تم تصدير البيانات إلى Excel بنجاح!");
    } catch (err) {
      setError("حدث خطأ أثناء التصدير إلى Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Restore backup handler
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setBackupMessage("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = restoreFromBackup(data);
      if (result.success) {
        setBackupMessage("تم استعادة البيانات بنجاح!");
        setAdmins(getAdmins());
      } else {
        setError(result.message || "فشل في استعادة البيانات.");
      }
    } catch (err) {
      setError("ملف النسخة الاحتياطية غير صالح.");
    }
  };

  // Add admin handler
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!newAdminName || !newAdminUsername || !newAdminPassword) {
      setAdminError("يرجى ملء جميع الحقول.");
      return;
    }
    if (admins.some((a) => a.username === newAdminUsername)) {
      setAdminError("اسم المستخدم موجود بالفعل.");
      return;
    }
    addAdmin({
      name: newAdminName,
      username: newAdminUsername,
      password: newAdminPassword,
      role: "admin",
    });
    setAdmins(getAdmins());
    setNewAdminName("");
    setNewAdminUsername("");
    setNewAdminPassword("");
    setAdminError("");
  };

  // Remove admin handler
  const handleRemoveAdmin = (id: string) => {
    removeStaff(id);
    setAdmins(getAdmins());
  };

  // Add staff handler
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newStaffName || !newStaffUsername || !newStaffPassword) {
      setError("يرجى ملء جميع الحقول.");
      return;
    }
    if (admins.some((a) => a.username === newStaffUsername)) {
      setError("اسم المستخدم موجود بالفعل.");
      return;
    }
    addAdmin({
      name: newStaffName,
      username: newStaffUsername,
      password: newStaffPassword,
      role: "staff",
    });
    setAdmins(getAdmins());
    setNewStaffName("");
    setNewStaffUsername("");
    setNewStaffPassword("");
  };

  // Remove staff handler
  const handleRemoveStaff = (id: string) => {
    removeStaff(id);
    setAdmins(getAdmins());
  };
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminUsername, setNewAdminUsername] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [adminError, setAdminError] = useState("")
  const [admins, setAdmins] = useState<any[]>([])
  const [newStaffName, setNewStaffName] = useState("")
  const [newStaffUsername, setNewStaffUsername] = useState("")
  const [newStaffPassword, setNewStaffPassword] = useState("")
  const [error, setError] = useState("")
  const [backupMessage, setBackupMessage] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAdmins(getAdmins())
    const darkMode = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(darkMode)
  }, [])

  const handleBackup = async () => {
    setIsLoading(true);
    setError("");
    setBackupMessage("");
    try {
      await backupToExcel("json");
      setBackupMessage("تم إنشاء النسخة الاحتياطية بنجاح!");
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء النسخة الاحتياطية.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <h1 className="text-2xl font-bold text-text">الإعدادات</h1>

      {/* Backup Section */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-bold text-text mb-4">النسخ الاحتياطي وتصدير البيانات</h2>
        <p className="text-sm text-text-secondary mb-4">
          يمكنك نسخ بياناتك احتياطيًا بصيغة JSON أو Excel. يتم إنشاء نسخة احتياطية تلقائيًا كل يوم عند منتصف الليل، ويمكنك أيضًا استعادة البيانات من ملف تم تصديره مسبقًا.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-danger/10 border border-danger rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {backupMessage && (
          <div className="mb-4 p-4 bg-success/10 border border-success rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-success text-sm">{backupMessage}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={handleBackup}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {isLoading ? "جاري إنشاء النسخة الاحتياطية..." : "نسخ احتياطي بصيغة JSON"}
          </button>

          <button
            onClick={handleExcelExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-info hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FileUp className="w-5 h-5" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              className="hidden"
              id="restore-backup"
              ref={fileInputRef}
              onChange={handleRestoreBackup}
            />
            <label
              htmlFor="restore-backup"
              className="flex items-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-text font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              استعادة النسخة الاحتياطية
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info">
          <p className="text-xs text-info">
            <strong>جدول النسخ التلقائي:</strong> يوميًا الساعة 12:00 منتصف الليل. يمكنك أيضًا تشغيل النسخ يدويًا في أي وقت، واستعادة البيانات عن طريق رفع ملف النسخة الاحتياطية السابق.
          </p>
        </div>
      </div>

      {/* Staff Management */}
      {user.role === "admin" && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-bold text-text mb-4">إدارة حسابات المسؤولين</h2>
          <form onSubmit={handleAddAdmin} className="mb-6 p-4 bg-bg-secondary rounded-lg space-y-3">
            <h3 className="font-semibold text-text">إضافة مسؤول جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="الاسم الكامل"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors col-span-1 md:col-span-2"
              >
                <Plus className="w-5 h-5" />
                إضافة مسؤول
              </button>
            </div>
            {adminError && <p className="text-danger text-sm mt-2">{adminError}</p>}
          </form>

          <div className="space-y-2 mb-8">
            <h3 className="font-semibold text-text mb-3">المسؤولون الحاليون</h3>
            {admins.filter((a: any) => a.role === "admin").length === 0 ? (
              <p className="text-sm text-text-secondary p-4 bg-bg-secondary rounded-lg">لا يوجد حسابات مسؤولين بعد.</p>
            ) : (
              admins
                .filter((a: any) => a.role === "admin")
                .map((admin: any) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-text">{admin.name}</p>
                      <p className="text-sm text-text-secondary">@{admin.username}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      disabled={["admin", "oscarr"].includes(admin.username)}
                      title={(["admin", "oscarr"].includes(admin.username)) ? "لا يمكن حذف حساب المسؤول الافتراضي" : "حذف المسؤول"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
            )}
          </div>

          <h2 className="text-lg font-bold text-text mb-4">إدارة حسابات الموظفين</h2>

          <form onSubmit={handleAddStaff} className="mb-6 p-4 bg-bg-secondary rounded-lg space-y-3">
            <h3 className="font-semibold text-text">إضافة موظف جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="الاسم الكامل"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={newStaffUsername}
                onChange={(e) => setNewStaffUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="password"
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors col-span-1 md:col-span-2"
              >
                <Plus className="w-5 h-5" />
                إضافة موظف
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="font-semibold text-text mb-3">الموظفون الحاليون</h3>
            {admins.filter((a) => a.role === "staff").length === 0 ? (
              <p className="text-sm text-text-secondary p-4 bg-bg-secondary rounded-lg">لا يوجد موظفون بعد.</p>
            ) : (
              admins
                .filter((a) => a.role === "staff")
                .map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-text">{staff.name}</p>
                      <p className="text-sm text-text-secondary">@{staff.username}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStaff(staff.id)}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
            )}
          </div>

          <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning">
            <p className="text-xs text-warning">
              <strong>ملاحظة:</strong> يمكن للموظفين إدارة الحجوزات والباقات والمخزون فقط، ولا يمكنهم الوصول إلى الإعدادات أو حذف البيانات.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
