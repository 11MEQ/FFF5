"use client"

import { useState, useEffect } from "react"

interface Purchase {
  id: string
  item: string
  amount: number
  date: string
  notes?: string
}

const PURCHASE_ITEMS = [
  "شاي",
  "قهوة",
  "بيبسي",
  "ماء",
  "أخرى"
]

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [item, setItem] = useState("")
  const [customItem, setCustomItem] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("purchases")
    setPurchases(stored ? JSON.parse(stored) : [])
  }, [])

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!item || !amount || !date || (item === "أخرى" && !customItem)) {
      setError("يرجى ملء جميع الحقول الأساسية")
      return
    }
    const newPurchase: Purchase = {
      id: "purchase_" + Date.now(),
      item: item === "أخرى" ? customItem : item,
      amount: Number(amount),
      date,
      notes
    }
    const updated = [...purchases, newPurchase]
    setPurchases(updated)
    localStorage.setItem("purchases", JSON.stringify(updated))
    setItem("")
    setCustomItem("")
    setAmount("")
    setDate("")
    setNotes("")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">المشتريات الشهرية</h2>
      <form onSubmit={handleAddPurchase} className="bg-white rounded-lg border border-border p-6 mb-8 shadow-sm space-y-4">
        {error && <div className="p-3 bg-danger/10 border border-danger rounded text-danger text-sm">{error}</div>}
        <div>
          <label className="block mb-2 text-sm font-medium">الصنف</label>
          <select value={item} onChange={e => setItem(e.target.value)} className="w-full border border-border rounded-lg p-2">
            <option value="">اختر الصنف</option>
            {PURCHASE_ITEMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
            {item === "أخرى" && (
              <input
                type="text"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
                className="w-full border border-border rounded-lg p-2 mt-2"
                placeholder="اكتب اسم الصنف هنا"
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
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-semibold">إضافة المشتريات</button>
      </form>
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-primary">سجل المشتريات</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="px-2 py-1 text-right font-semibold text-text">الصنف</th>
              <th className="px-2 py-1 text-right font-semibold text-text">المبلغ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">التاريخ</th>
              <th className="px-2 py-1 text-right font-semibold text-text">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">لا توجد مشتريات بعد.</td></tr>
            ) : (
              purchases.map(pur => (
                <tr key={pur.id}>
                  <td className="px-2 py-1 text-right text-text font-medium">{pur.item}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.amount}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.date}</td>
                  <td className="px-2 py-1 text-right text-text">{pur.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
