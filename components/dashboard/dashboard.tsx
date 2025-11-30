"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import TopBar from "@/components/layout/top-bar"
import DashboardHome from "@/components/dashboard/dashboard-home"
import SessionsPage from "@/components/dashboard/sessions-page"
import PackagesPage from "@/components/dashboard/packages-page"
import PackageClientsPage from "@/components/dashboard/package-clients-page"
import DrinksPage from "@/components/dashboard/drinks-page"
import UserSubscriptionsPage from "@/components/dashboard/user-subscriptions-page"
import ReportsPage from "@/components/dashboard/reports-page"
import SettingsPage from "@/components/dashboard/settings-page"
import dynamic from "next/dynamic"
import ExpensesPage from "@/components/expenses"
import PurchasesPage from "@/components/purchases"
import FinanceStatsPage from "@/components/finance"

interface DashboardProps {
  user: any
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const NotesPage = dynamic(() => import("@/components/notes/notes-page"), { ssr: false })

  const renderPage = () => {
    switch (currentPage) {
      case "sessions":
        return <SessionsPage /> // صفحة الجلسات
      case "packages":
        return <PackagesPage /> // صفحة الباقات
      case "package-clients":
        return <PackageClientsPage /> // صفحة عملاء الباقات
      case "drinks":
        return <DrinksPage /> // صفحة المشروبات
      case "subscriptions":
        return <UserSubscriptionsPage /> // صفحة الاشتراكات
      case "reports":
        return <ReportsPage user={user} /> // صفحة التقارير
      case "settings":
        return <SettingsPage user={user} /> // صفحة الإعدادات
      case "notes":
        return <NotesPage /> // صفحة الملاحظات
      case "expenses":
        return <ExpensesPage /> // صفحة المصروفات
      case "purchases":
        return <PurchasesPage /> // صفحة المشتريات
      case "finance":
        return <FinanceStatsPage /> // صفحة إحصائيات المالية
      default:
        return <DashboardHome /> // الصفحة الرئيسية للوحة التحكم
    }
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* الشريط الجانبي */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userRole={user.role}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* الشريط العلوي */}
        <TopBar
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* محتوى الصفحة */}
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
