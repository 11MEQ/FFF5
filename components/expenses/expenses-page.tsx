"use client"

import { useState, useEffect } from "react"

interface Expense {
  id: string
  type: string
  amount: number
  date: string
  notes?: string
}

const EXPENSE_TYPES = [
  "مياه",
  "كهرباء",
  "غاز",
  "انترنت",
  "أخرى"
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [type, setType] = useState("")
  const [customType, setCustomType] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("expenses")
    setExpenses(stored ? JSON.parse(stored) : [])
  }, [])

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!type || !amount || !date || (type === "أخرى" && !customType)) {
      setError("يرجى ملء جميع الحقول الأساسية")
      return
    }
    const newExpense: Expense = {
      id: "expense_" + Date.now(),
      type: type === "أخرى" ? customType : type,
      amount: Number(amount),
      date,
      notes
    }
    const updated = [...expenses, newExpense]
    setExpenses(updated)
    localStorage.setItem("expenses", JSON.stringify(updated))
  setType("")
  setCustomType("")
  setAmount("")
  setDate("")
  setNotes("")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">المصروفات الشهرية</h2>
      <form onSubmit={handleAddExpense} className="bg-white rounded-lg border border-border p-6 mb-8 shadow-sm space-y-4">
        {error && <div className="p-3 bg-danger/10 border border-danger rounded text-danger text-sm">{error}</div>}
        <div>
          <label className="block mb-2 text-sm font-medium">نوع المصروف</label>
          <select value={type} onChange={e => { setType(e.target.value); if (e.target.value !== "أخرى") setCustomType(""); }} className="w-full border border-border rounded-lg p-2">
            <option value="">اختر نوع المصروف</option>
            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {type === "أخرى" && (
            <input
              type="text"
              value={customType}
              onChange={e => setCustomType(e.target.value)}
              className="w-full border border-border rounded-lg p-2 mt-2"
              placeholder="اكتب نوع المصروف هنا"
            />
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">المبلغ (جنيه)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-border rounded-lg p-2" placeholder="مثلاً: 500" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">التاريخ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-border rounded-lg p-2" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">ملاحظات</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-border rounded-lg p-2" placeholder="اختياري" />
        </div>
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-semibold">إضافة المصروف</button>
      </form>
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-primary">سجل المصروفات</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="px-2 py-1 text-right font-semibold text-text">النوع</th>
              <th className="px-2 py-1 text-right font-semibold text-text">المبلغ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">التاريخ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">لا توجد مصروفات بعد.</td></tr>
            ) : (
              expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="px-2 py-1 text-right text-text font-medium">{exp.type}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.amount}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.date}</td>
                  <td className="px-2 py-1 text-right text-text">{exp.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
