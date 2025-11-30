"use client"

import { Menu, LogOut, Bell } from "lucide-react"

interface TopBarProps {
  user: any
  onLogout: () => void
  onMenuClick: () => void
}

export default function TopBar({ user, onLogout, onMenuClick }: TopBarProps) {
  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-text" />
        </button>
        <h2 className="text-xl font-bold text-text">مرحبًا، {user.name}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* زر الإشعارات (اختياري للتفعيل لاحقًا)
        <button className="relative p-2 hover:bg-bg-secondary rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-text" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        */}

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-text">{user.name}</p>
            <p className="text-xs text-text-secondary capitalize">
              {user.role === "admin" ? "مدير" : user.role === "staff" ? "موظف" : user.role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-danger/10 text-danger rounded-lg transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
