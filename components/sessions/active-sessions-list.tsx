"use client"

import { useState, useEffect } from "react"
import { Clock, Phone, MapPin } from "lucide-react"
import { getActiveSessions, getDrinks, updateActiveSessionDrinks } from "@/lib/storage"
import EndSessionModal from "./end-session-modal"

export default function ActiveSessionsList() {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [drinksList, setDrinksList] = useState<any[]>([]);

  useEffect(() => {
  setActiveSessions(getActiveSessions());
  setDrinksList(getDrinks());
  }, [refreshKey]);

  const handleSessionEnded = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedSession(null)
  }

  if (activeSessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <Clock className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
        <p className="text-text-secondary">لا توجد جلسات نشطة حالياً</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          placeholder="ابحث بالاسم..."
          className="w-full max-w-md px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSessions
          .filter(session => session.name.toLowerCase().includes(searchName.toLowerCase()))
          .map((session) => {
            const startTime = new Date(session.start_time);
            const now = new Date();
            const elapsedMs = now.getTime() - startTime.getTime();
            const elapsedTotalMinutes = Math.floor(elapsedMs / (1000 * 60));
            const elapsedHours = Math.floor(elapsedTotalMinutes / 60);
            const elapsedMinutes = elapsedTotalMinutes % 60;
            const elapsedDisplay = elapsedHours > 0 ? `${elapsedHours} س ${elapsedMinutes} د` : `${elapsedMinutes} د`;

            // Drinks state for this session
            const sessionDrinks = session.selected_drinks || {};
            const drinksTotal = session.drinks_total || 0;

            const handleAddDrink = (drinkId: string) => {
              const updatedDrinks = { ...sessionDrinks };
              updatedDrinks[drinkId] = (updatedDrinks[drinkId] || 0) + 1;
              const total = Object.values(updatedDrinks).reduce((sum: any, count: any) => sum + count, 0);
              updateActiveSessionDrinks(session.id, updatedDrinks, total);
              setRefreshKey((prev) => prev + 1);
            };

            return (
              <div
                key={session.id}
                className="bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-text">{session.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                      <Phone className="w-4 h-4" />
                      {session.phone}
                    </div>
                  </div>
                </div>

                {session.college && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <MapPin className="w-4 h-4" />
                    {session.college}
                  </div>
                )}

                <div className="bg-bg-secondary rounded p-3 mb-4">
                  <div className="text-xs text-text-secondary mb-1">مدة الجلسة</div>
                  <div className="text-lg font-bold text-primary">{elapsedDisplay}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    وقت البدء: {startTime.toLocaleTimeString()}
                  </div>
                </div>
                

                {/* Drinks Management */}
                <div className="mb-4">
                  <div className="font-semibold mb-2">المشروبات المضافة للجلسة</div>
                  <div className="mb-2 text-sm">إجمالي المشروبات: <span className="font-bold">{drinksTotal}</span></div>
                  <div className="flex flex-wrap gap-2">
                    {drinksList.map((drink) => (
                      <button
                        key={drink.id}
                        onClick={() => handleAddDrink(drink.id)}
                        className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded text-primary text-xs font-medium"
                      >
                        {drink.name} ({sessionDrinks[drink.id] || 0})
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSession(session)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إنهاء الجلسة
                </button>
              </div>
            );
          })}
      </div>

      {selectedSession && (
        <EndSessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSessionEnded={handleSessionEnded}
        />
      )}
    </>
  )
}
