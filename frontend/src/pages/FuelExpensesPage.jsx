import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { api } from '../lib/axiosInstance'

export default function FuelExpensesPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || 'Dispatcher'
  const isFleetManager = role === 'FleetManager'
  const isFinancialAnalyst = role === 'FinancialAnalyst'
  const canLogCosts = isFleetManager || isFinancialAnalyst
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFuelModal, setShowFuelModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [error, setError] = useState('')

  // Fuel Form states
  const [fuelVehicle, setFuelVehicle] = useState('')
  const [fuelTrip, setFuelTrip] = useState('')
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0])
  const [fuelLiters, setFuelLiters] = useState('')
  const [fuelCost, setFuelCost] = useState('')

  // Expense Form states
  const [expVehicle, setExpVehicle] = useState('')
  const [expTrip, setExpTrip] = useState('')
  const [expType, setExpType] = useState('Toll')
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    try {
      const [fuelRes, expRes, vehiclesRes, tripsRes, maintRes] = await Promise.all([
        api.get('/fuel-expenses/fuel-logs'),
        api.get('/fuel-expenses/expenses'),
        api.get('/vehicles'),
        api.get('/trips'),
        api.get('/maintenance'),
      ])
      setFuelLogs(fuelRes.data)
      setExpenses(expRes.data)
      setVehicles(vehiclesRes.data)
      setTrips(tripsRes.data)
      setMaintenance(maintRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching logs:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogFuel = async (e) => {
    e.preventDefault()
    setError('')

    if (!fuelVehicle || !fuelDate || !fuelLiters || !fuelCost) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      await api.post('/fuel-expenses/fuel-logs', {
        vehicleId: fuelVehicle,
        tripId: fuelTrip || null,
        date: new Date(fuelDate).toISOString(),
        liters: parseFloat(fuelLiters),
        cost: parseFloat(fuelCost),
      })
      setShowFuelModal(false)
      // Reset form
      setFuelVehicle('')
      setFuelTrip('')
      setFuelLiters('')
      setFuelCost('')
      // Refresh
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log fuel consumption.')
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setError('')

    if (!expVehicle || !expAmount || !expDate || !expType) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      await api.post('/fuel-expenses/expenses', {
        vehicleId: expVehicle,
        tripId: expTrip || null,
        type: expType,
        amount: parseFloat(expAmount),
        date: new Date(expDate).toISOString(),
      })
      setShowExpenseModal(false)
      // Reset form
      setExpVehicle('')
      setExpTrip('')
      setExpType('Toll')
      setExpAmount('')
      // Refresh
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense entry.')
    }
  }

  // Calculations
  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.cost, 0)
  const totalMaintCost = maintenance.reduce((sum, item) => sum + item.cost, 0)
  const totalOperationalCost = totalFuelCost + totalMaintCost

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading fuel and expense logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 select-none">
      
      {/* 1. Fuel Logs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Fuel logs</h2>
          {canLogCosts && (
            <button
              onClick={() => setShowFuelModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
            >
              + Log Fuel
            </button>
          )}
        </div>

        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                  <th className="pb-3">VEHICLE</th>
                  <th className="pb-3">DATE</th>
                  <th className="pb-3">LITERS</th>
                  <th className="pb-3">FUEL COST</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800/40 text-gray-300">
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">No fuel logs recorded.</td>
                  </tr>
                ) : (
                  fuelLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-900/30">
                      <td className="py-4 font-semibold">{row.vehicle?.nameModel || '—'}</td>
                      <td className="py-4 text-gray-400">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-4 text-gray-400">{row.liters} L</td>
                      <td className="py-4 text-gray-400">₹ {row.cost?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Other Expenses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Other Expenses (Toll / Misc)</h2>
          {canLogCosts && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
            >
              + Add Expense
            </button>
          )}
        </div>

        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                  <th className="pb-3">TRIP</th>
                  <th className="pb-3">VEHICLE</th>
                  <th className="pb-3">TOLL</th>
                  <th className="pb-3">OTHER</th>
                  <th className="pb-3">MAINT. (LINKED)</th>
                  <th className="pb-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800/40 text-gray-300">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">No expenses logged.</td>
                  </tr>
                ) : (
                  expenses.map((row) => {
                    const toll = row.type === 'Toll' ? row.amount : 0
                    const other = row.type === 'Other' ? row.amount : 0
                    // Linked maintenance logic if any (optional display)
                    const linkedMaint = totalMaintCost

                    return (
                      <tr key={row.id} className="hover:bg-gray-900/30">
                        <td className="py-4 font-mono font-semibold">{row.trip?.tripCode || '—'}</td>
                        <td className="py-4 text-gray-400">{row.vehicle?.nameModel || '—'}</td>
                        <td className="py-4 text-gray-400">₹ {toll?.toLocaleString() || 0}</td>
                        <td className="py-4 text-gray-400">₹ {other?.toLocaleString() || 0}</td>
                        <td className="py-4 text-gray-400">₹ 0</td>
                        <td className="py-4 text-right font-bold text-gray-300">₹ {row.amount?.toLocaleString()}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Operational Cost Summary Row */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-5 mt-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT.
            </span>
            <span className="text-2xl font-bold text-amber-500">
              ₹ {totalOperationalCost?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Fuel Log Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Fuel Consumption</h2>
              <button onClick={() => setShowFuelModal(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl text-center">{error}</div>}

            <form onSubmit={handleLogFuel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">VEHICLE *</label>
                <select
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.nameModel} ({v.regNo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">TRIP (OPTIONAL)</label>
                <select
                  value={fuelTrip}
                  onChange={(e) => setFuelTrip(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">No trip link</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.tripCode} ({t.source} ➔ {t.destination})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">DATE *</label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">LITERS *</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  placeholder="E.g. 42"
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">FUEL COST (₹) *</label>
                <input
                  type="number"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="E.g. 3150"
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold cursor-pointer">Log Fuel</button>
                <button type="button" onClick={() => setShowFuelModal(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Expense Entry</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl text-center">{error}</div>}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">VEHICLE *</label>
                <select
                  value={expVehicle}
                  onChange={(e) => setExpVehicle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.nameModel} ({v.regNo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">TRIP (OPTIONAL)</label>
                <select
                  value={expTrip}
                  onChange={(e) => setExpTrip(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">No trip link</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.tripCode} ({t.source} ➔ {t.destination})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">EXPENSE TYPE *</label>
                <select
                  value={expType}
                  onChange={(e) => setExpType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Toll">Toll</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">AMOUNT (₹) *</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="E.g. 120"
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">DATE *</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold cursor-pointer">Log Expense</button>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
