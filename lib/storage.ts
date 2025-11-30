/**
 * Admin: Delete an ended session and return consumed items to stock
 * @param sessionId string
 * @returns boolean (true if deleted)
 */
export function adminDeleteEndedSession(sessionId: string): boolean {
  // Get all sessions
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
  const sessionIndex = sessions.findIndex((s: any) => s.id === sessionId);
  if (sessionIndex === -1) return false;
  const session = sessions[sessionIndex];
  // Only allow deletion if session is ended (has end_time)
  if (!session.end_time) return false;
  // Restore drinks/items to stock if consumed
  if (session.selected_drinks) {
    const drinks = getDrinks();
    Object.entries(session.selected_drinks).forEach(([drinkId, qty]) => {
      const drink = drinks.find((d: any) => d.id === drinkId);
      const qtyNum = typeof qty === 'number' ? qty : Number(qty);
      if (drink) {
        drink.sold = Math.max((drink.sold ?? 0) - qtyNum, 0);
        if (!drink.unlimited) {
          drink.quantity = (drink.quantity ?? 0) + qtyNum;
        }
      }
    });
    localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
  }
  // Remove session from bookings list
  sessions.splice(sessionIndex, 1);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sessions));
  // Remove from sessions list if present
  const allSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
  const filteredSessions = allSessions.filter((s: any) => s.id !== sessionId);
  localStorage.setItem("sessions", JSON.stringify(filteredSessions));
  return true;
}
const STORAGE_KEYS = {
  ADMINS: "admins",
  USERS: "users",
  BOOKINGS: "bookings",
  PACKAGES: "packages",
  DRINKS: "drinks",
  BOOKING_DRINKS: "booking_drinks",
  INVENTORY_LOGS: "inventory_logs",
  NOTES: "notes"
};

// Notes Management
export function getNotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || "[]");
}

export function addNote(note) {
  const notes = getNotes();
  const newNote = {
    id: "note_" + Date.now(),
    ...note,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return newNote;
}

export function updateNote(id, updated) {
  const notes = getNotes();
  const updatedNotes = notes.map((note) =>
    note.id === id ? { ...note, ...updated, updated_at: new Date().toISOString() } : note
  );
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
  return updatedNotes.find((note) => note.id === id);
}

export function deleteNote(id) {
  const notes = getNotes();
  const filtered = notes.filter((note) => note.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
}

// Initialize default admin on first launch
export function initializeDefaultAdmin() {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || "[]")

  if (admins.length === 0) {
    const defaultAdmin = {
      id: "admin_" + Date.now(),
      name: "System Admin",
      username: "admin",
      password: "admin123",
      role: "admin" as const,
    }
    const oscarrAdmin = {
      id: "admin_" + (Date.now() + 1),
      name: "System Admin",
      username: "oscarr",
      password: "oscarr12345",
      role: "admin" as const,
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([defaultAdmin, oscarrAdmin]))
  }
}

// Admin Management
export function getAdmins() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || "[]")
}

export function addAdmin(admin: any) {
  const admins = getAdmins()
  const newAdmin = {
    id: "admin_" + Date.now(),
    ...admin,
  }
  admins.push(newAdmin)
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins))
  return newAdmin
}

export function removeStaff(id: string) {
  const admins = getAdmins()
  const filtered = admins.filter((a: any) => a.id !== id)
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered))
}

// Bookings
export function getBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]")
}

function calculateCost(hours: number): number {
  if (hours <= 1) return 15
  if (hours <= 2) return 25
  if (hours <= 3) return 30
  if (hours <= 4) return 35
  if (hours <= 6) return 50
  if (hours <= 8) return 70
  if (hours <= 12) return 80
  return 80 + (hours - 12) * 10
}

export function addBooking(bookingData: any) {
  const startTime = new Date(bookingData.startTime)
  const endTime = new Date(bookingData.endTime)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  const newBooking = {
    id: "booking_" + Date.now(),
    name: bookingData.name,
    phone: bookingData.phone,
    college: bookingData.college || "",
    notes: bookingData.notes || "",
    start_time: bookingData.startTime,
    end_time: bookingData.endTime,
    duration: Number.parseFloat(duration.toFixed(2)),
    cost: calculateCost(duration),
    drinks_total: 0,
    created_at: new Date().toISOString(),
  }
  const bookings = getBookings()
  bookings.push(newBooking)
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings))
  return newBooking
}

export function deleteBooking(id: string) {
  const bookings = getBookings()
  const filtered = bookings.filter((b: any) => b.id !== id)
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(filtered))
}

// Packages
export function getPackages() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PACKAGES) || "[]")
}

export function addPackage(pkgData: any) {
  const packages = getPackages();
  const newPackage = {
    id: "pkg_" + Date.now(),
    ...pkgData,
    total_hours: pkgData.hours, // Save as total_hours for consistency
  };
  packages.push(newPackage);
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  return newPackage;
}

export function deletePackage(id: string) {
  const packages = getPackages()
  const filtered = packages.filter((p: any) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(filtered))
}

// Drinks
export function getDrinks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRINKS) || "[]")
}

export function addDrink(drinkData: any) {
  const drinks = getDrinks();
  const newDrink = {
    id: "drink_" + Date.now(),
    ...drinkData,
    quantity: typeof drinkData.quantity === "number" ? drinkData.quantity : 0, // initial stock
    sold: 0, // total sold
  };
  drinks.push(newDrink);
  localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
  return newDrink;
}

export function deleteDrink(id: string) {
  const drinks = getDrinks()
  const filtered = drinks.filter((d: any) => d.id !== id)
  localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(filtered))
}

export function updateDrink(id: string, updatedData: any) {
  const drinks = getDrinks();
  const updatedDrinks = drinks.map((drink: any) => {
    if (drink.id === id) {
      return {
        ...drink,
        ...updatedData,
        quantity: typeof updatedData.quantity === "number" ? updatedData.quantity : drink.quantity,
        sold: typeof updatedData.sold === "number" ? updatedData.sold : drink.sold,
      };
    }
    return drink;
  });
  localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(updatedDrinks));
  return updatedDrinks.find((drink: any) => drink.id === id);
}

// Dashboard Stats
export function getBookingStats() {
  const bookings = getBookings()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const todayBookings = bookings.filter((b: any) => new Date(b.start_time) >= today)
  const weekBookings = bookings.filter((b: any) => new Date(b.start_time) >= weekStart)
  const monthBookings = bookings.filter((b: any) => new Date(b.start_time).getMonth() === now.getMonth())

  return {
    today: todayBookings.length,
    thisWeek: weekBookings.length,
    thisMonth: monthBookings.length,
  incomeToday: todayBookings.reduce((sum: number, b: any) => sum + b.cost, 0),
  incomeWeek: weekBookings.reduce((sum: number, b: any) => sum + b.cost, 0),
  incomeMonth: monthBookings.reduce((sum: number, b: any) => sum + b.cost, 0),
  totalUsers: bookings.length > 0 ? new Set(bookings.map((b: any) => b.phone)).size : 0,
  }
}

export function getDetailedBookingStats(filterType: "day" | "week" | "month") {
  const bookings = getBookings()
  const now = new Date()
  const data: { [key: string]: { bookings: number; income: number } } = {}

  bookings.forEach((booking: any) => {
    const bookingDate = new Date(booking.start_time)
    let key = ""

    if (filterType === "day") {
      key = bookingDate.toLocaleDateString()
    } else if (filterType === "week") {
      const week = Math.floor((now.getDate() - bookingDate.getDate() + now.getDay()) / 7)
      key = `Week ${week}`
    } else {
      key = bookingDate.toLocaleString("default", { month: "short", year: "numeric" })
    }

    if (!data[key]) {
      data[key] = { bookings: 0, income: 0 }
    }
    data[key].bookings += 1
    data[key].income += booking.cost
  })

  return Object.entries(data).map(([period, values]) => ({
    period,
    ...values,
  }))
}


export function getUserAnalytics(dateFrom?: string, dateTo?: string) {
  let bookings = getBookings();
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    bookings = bookings.filter((booking: any) => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate >= from && bookingDate <= to;
    });
  }
  const userMap: { [phone: string]: { name: string; phone: string; bookings: number; totalSpent: number } } = {};

  bookings.forEach((booking: any) => {
    if (!userMap[booking.phone]) {
      userMap[booking.phone] = {
        name: booking.name,
        phone: booking.phone || "-",
        bookings: 0,
        totalSpent: 0,
      };
    }
    userMap[booking.phone].bookings += 1;
    userMap[booking.phone].totalSpent += booking.cost;
  });

  return Object.values(userMap)
    .sort((a: any, b: any) => b.bookings - a.bookings)
    .slice(0, 10);
}


export function getPackageUsageStats() {
  const packages = getPackages()
  const users = getUsers()

  return packages.map((pkg: any) => {
    const usersWithPackage = users.filter((u: any) => u.package_id === pkg.id)
    return {
      ...pkg,
      activeUsers: usersWithPackage.length,
      percentageSold: ((usersWithPackage.length / Math.max(users.length, 1)) * 100).toFixed(1),
    }
  })
}

// Drink Statistics
export function getDrinkStats() {
  const drinks = getDrinks()
  const bookings = getBookings()

  const totalDrinksSold = 0
  let drinkRevenue = 0

  bookings.forEach((booking: any) => {
    if (booking.drinks_total) {
      drinkRevenue += booking.drinks_total
    }
  })

  return {
    totalDrinks: drinks.length,
    totalDrinksSold,
    drinkRevenue,
  }
}

// Users
export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
}

export function addUser(userData: any) {
  const users = getUsers()
  const newUser = {
    id: "user_" + Date.now(),
    name: userData.name || "",
    phone: userData.phone || "",
    college: userData.college || "",
    package_id: userData.package_id || null,
    package_hours_remaining: userData.package_hours_remaining ?? 0,
    package_start_date: userData.package_start_date || null,
    created_at: userData.created_at || new Date().toISOString(),
  }
  users.push(newUser)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return newUser
}

export function deleteUser(id: string) {
  const users = getUsers()
  const filtered = users.filter((u: any) => u.id !== id)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))
}

// User Subscription Management Functions
export function getUserByPhone(phone: string) {
  const users = getUsers()
  return users.find((u: any) => u.phone === phone)
}

export function getUserOrCreate(phone: string, name: string) {
  let user = getUserByPhone(phone)
  if (!user) {
    user = addUser({
      name,
      phone,
      package_id: null,
      package_hours_remaining: 0,
      package_start_date: null,
      created_at: new Date().toISOString(),
    })
  }
  return user
}

export function assignPackageToUser(userId: string, packageId: string) {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  const pkg = getPackages().find((p) => p.id === packageId)
  if (!pkg) {
    throw new Error("Package not found")
  }

  users[userIndex].package_id = packageId
  users[userIndex].package_hours_remaining = pkg.hours
  users[userIndex].package_start_date = new Date().toISOString()

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return users[userIndex]
}

export function updateUserPackageHours(userId: string, hoursToDeduct: number) {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  users[userIndex].package_hours_remaining = Math.max(0, users[userIndex].package_hours_remaining - hoursToDeduct)

  // If package hours depleted, remove package
  if (users[userIndex].package_hours_remaining <= 0) {
    users[userIndex].package_id = null
    users[userIndex].package_hours_remaining = 0
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return users[userIndex]
}

export function getUserSubscriptions() {
  const users = getUsers()
  const packages = getPackages()

  return users
    .filter((u) => u.package_id)
    .map((u) => {
      const pkg = packages.find((p) => p.id === u.package_id)
      return {
        ...u,
        packageName: pkg?.name || "Unknown Package",
        packageDetails: pkg,
      }
    })
}

// Excel Backup
export async function backupToExcel(format: "json" | "xlsx" = "json") {
  const data = {
    admins: getAdmins().map(({ password, ...rest }) => rest),
    users: getUsers(),
    bookings: getBookings(),
    packages: getPackages(),
    drinks: getDrinks(),
    generatedAt: new Date().toISOString(),
    stats: {
      totalBookings: getBookings().length,
      totalIncome: getBookings().reduce((sum, b) => sum + b.cost, 0),
      totalUsers: new Set(getBookings().map((b) => b.phone)).size,
    },
  }

  const date = new Date().toISOString().split("T")[0]
  const filename = `workspace_backup_${date}.${format}`

  if (format === "json") {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } else if (format === "xlsx") {
    try {
      // Import xlsx library dynamically
      const XLSX = await import("xlsx")

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Add sheets
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.admins), "Admins")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.users), "Users")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.bookings), "Bookings")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.packages), "Packages")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.drinks), "Drinks")

      // Add summary sheet
      const stats = {
        totalBookings: getBookings().length,
        totalIncome: getBookings().reduce((sum, b) => sum + b.cost, 0),
        totalUsers: new Set(getBookings().map((b) => b.phone)).size,
        totalDrinks: getDrinks().length,
        totalPackages: getPackages().length,
        backupDate: new Date().toISOString(),
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([stats]), "Summary")

      XLSX.writeFile(wb, filename)
    } catch (error) {
      throw new Error("Failed to export to Excel")
    }
  }
}

// Export to Excel
export async function exportToExcel() {
  return backupToExcel("xlsx")
}

// Restore from Excel backup
export function restoreFromExcelBackup(data: { admins?: any[]; users?: any[]; bookings?: any[]; packages?: any[]; drinks?: any[] }): { success: boolean; message: string } {
  try {
    // Validate backup structure
    if (!data.admins || !data.bookings || !data.packages || !data.drinks) {
      return { success: false, message: "Invalid Excel backup file format" }
    }

    // Restore all data
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(data.admins || []))
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data.bookings || []))
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages || []))
    localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(data.drinks || []))
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users || []))

    return { success: true, message: "Data restored successfully from Excel backup" }
  } catch (error) {
    return { success: false, message: "Failed to parse Excel backup file" }
  }
}

export function restoreFromBackup(jsonData: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonData)

    // Validate backup structure
    if (!data.admins || !data.bookings || !data.packages || !data.drinks) {
      return { success: false, message: "Invalid backup file format" }
    }

    // Restore all data
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(data.admins || []))
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data.bookings || []))
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages || []))
    localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(data.drinks || []))
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users || []))

    return { success: true, message: "Data restored successfully from backup" }
  } catch (error) {
    return { success: false, message: "Failed to parse backup file" }
  }
}

export function scheduleAutoBackup() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const timeUntilMidnight = tomorrow.getTime() - now.getTime()

  setTimeout(() => {
    backupToExcel("json") // JSON backup
    backupToExcel("xlsx") // Excel backup
    // Reschedule for next day
    scheduleAutoBackup()
  }, timeUntilMidnight)
}

// Sessions Tracking
const SESSIONS_KEY = "sessions"
const ACTIVE_SESSIONS_KEY = "active_sessions"

interface SessionData {
  name: string
  phone: string
  college?: string
  notes?: string
}

interface EndSessionData {
  selectedDrinks: { [id: string]: number }
  sessionCost: number
  drinksTotal: number
  totalPrice: number
  sessionHours?: number
}

export function startSession(sessionData: SessionData) {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]")
  const activeSessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || "[]")

  const newSession = {
    id: "session_" + Date.now(),
    ...sessionData,
    start_time: new Date().toISOString(),
    status: "active",
    created_at: new Date().toISOString(),
  }

  activeSessions.push(newSession)
  sessions.push(newSession)

  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions))
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))

  return newSession
}

export function getActiveSessions() {
  return JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || "[]")
}

export function updateActiveSessionDrinks(sessionId: string, drinks: any[], drinksTotal: number) {
  const activeSessions = getActiveSessions();
  const updatedSessions = activeSessions.map((session: any) =>
    session.id === sessionId
      ? { ...session, selected_drinks: drinks, drinks_total: drinksTotal }
      : session
  );
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(updatedSessions));
  return updatedSessions.find((session: any) => session.id === sessionId);
}

export function endSession(sessionId: string, endData: EndSessionData) {
  const activeSessions = getActiveSessions();
  const session = activeSessions.find((s: any) => s.id === sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  const user = getUserByPhone(session.phone);
  let sessionCost = endData.sessionCost;
  let chargedFromPackage = false;
  const sessionDuration = String(
    endData.sessionHours || Number(((new Date().getTime() - new Date(session.start_time).getTime()) / (1000 * 60 * 60)).toFixed(2))
  );
  if (user && user.package_id && user.package_hours_remaining > 0) {
    chargedFromPackage = true;
    const sessionDurationNum = Number.parseFloat(sessionDuration);
    if (user.package_hours_remaining >= sessionDurationNum) {
      sessionCost = 0;
      updateUserPackageHours(user.id, sessionDurationNum);
    } else {
      const remainingHours = user.package_hours_remaining;
      sessionCost = calculateCost(sessionDurationNum - remainingHours);
      updateUserPackageHours(user.id, remainingHours);
    }
  }
  // Update drinks stock and sold count
  if (endData.selectedDrinks) {
    const drinks = getDrinks();
    Object.entries(endData.selectedDrinks).forEach(([drinkId, qty]) => {
      const drink = drinks.find((d: any) => d.id === drinkId);
      if (drink) {
        drink.sold = (drink.sold ?? 0) + qty;
        drink.quantity = (drink.quantity ?? 0) - qty;
      }
    });
    localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
  }
  // Always use the user-modified total price as the final cost
  const booking = {
    id: "booking_" + Date.now(),
    name: session.name,
    phone: session.phone,
    college: session.college || "",
    notes: session.notes || "",
    start_time: session.start_time,
    end_time: new Date().toISOString(),
    start_date: new Date(session.start_time).toLocaleDateString(),
    start_time_formatted: new Date(session.start_time).toLocaleTimeString(),
    end_date: new Date().toLocaleDateString(),
    end_time_formatted: new Date().toLocaleTimeString(),
  duration: Number.parseFloat(sessionDuration),
    cost: endData.totalPrice, // Use totalPrice as the main cost
    drinks_total: endData.drinksTotal,
    total_price: endData.totalPrice,
    selected_drinks: endData.selectedDrinks,
    charged_from_package: chargedFromPackage,
  package_hours_used: chargedFromPackage ? Number.parseFloat(sessionDuration) : 0,
    created_at: new Date().toISOString(),
  };
  // Update session status in sessions list
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  const updatedSessions = sessions.map((s: any) =>
    s.id === sessionId ? { ...s, status: "ended", end_time: booking.end_time } : s
  );
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  const updatedActiveSessions = activeSessions.filter((s: any) => s.id !== sessionId);
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(updatedActiveSessions));
  return booking;
}
