// src/pages/MaintenancePage.jsx
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { api } from '../lib/axiosInstance'

export default function MaintenancePage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || 'Dispatcher'
  const isFleetManager = role === 'FleetManager'
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [serviceType, setServiceType] = useState('Oil Change')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchRecordsAndVehicles = async () => {
    try {
      const [recordsRes, vehiclesRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/vehicles'),
      ])
      setRecords(recordsRes.data)
      setVehicles(vehiclesRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching maintenance data:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecordsAndVehicles()
  }, [])

  // Filter only vehicles that are not retired
  const activeVehiclesList = vehicles.filter(v => v.status !== 'Retired')

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedVehicle || !serviceType || !cost || !date) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      await api.post('/maintenance', {
        vehicleId: selectedVehicle,
        serviceType,
        cost: parseFloat(cost),
        date: new Date(date).toISOString(),
        status: 'Active',
      })
      // Reset form
      setSelectedVehicle('')
      setCost('')
      // Refresh
      fetchRecordsAndVehicles()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log maintenance record.')
    }
  }

  const handleCloseLog = async (recordId) => {
    try {
      await api.patch(`/maintenance/${recordId}/close`)
      fetchRecordsAndVehicles()
    } catch (err) {
      console.error('Error closing maintenance record:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading maintenance queue...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance Logs</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column: Log Service Record Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400">Log Service Record</h2>

            {!isFleetManager ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-950 border border-gray-800 flex items-center justify-center mx-auto text-gray-500 text-lg">
                  🔒
                </div>
                <p className="text-xs text-gray-400 font-medium">Read-Only View</p>
                <p className="text-[11px] text-gray-500 leading-normal max-w-xs mx-auto">
                  Logging and closing active maintenance shop logs is restricted to **Fleet Managers**.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Vehicle Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">VEHICLE *</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  >
                    <option value="">Select vehicle to service</option>
                    {activeVehiclesList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nameModel} ({v.regNo}) — Status: {v.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Type */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">SERVICE TYPE *</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="E.g. Oil Change, Engine Repair, Tyre Replace"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">COST (₹) *</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="E.g. 2500"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">DATE *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Status Display (Active by default) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">STATUS</label>
                  <input
                    type="text"
                    value="Active"
                    className="w-full bg-gray-950/60 border border-gray-900 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm text-center bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all duration-150 cursor-pointer"
                >
                  Save Log
                </button>
              </form>
            )}

            {/* Transitions info */}
            <div className="space-y-2 text-xs border-t border-gray-800/60 pt-4">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-green-400 font-medium">Available</span>
                <span>➔ logging active record ➔</span>
                <span className="text-amber-500 font-medium">In Shop</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-amber-500 font-medium">In Shop</span>
                <span>➔ closing record ➔</span>
                <span className="text-green-400 font-medium">Available</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Service Logs List */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6 flex flex-col justify-between min-h-[500px]">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400 mb-6">Service Logs</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                      <th className="pb-3">VEHICLE</th>
                      <th className="pb-3">SERVICE TYPE</th>
                      <th className="pb-3">COST</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-800/40">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                          No service records registered.
                        </td>
                      </tr>
                    ) : (
                      records.map((row) => {
                        const isCompleted = row.status === 'Completed'
                        const statusClass = isCompleted
                          ? 'bg-green-500/15 text-green-400 border-green-500/20'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/20'

                        return (
                          <tr key={row.id} className="hover:bg-gray-900/30">
                            <td className="py-4 font-semibold text-gray-300">
                              {row.vehicle?.nameModel || '—'}
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{row.vehicle?.regNo || '—'}</p>
                            </td>
                            <td className="py-4 text-gray-400">{row.serviceType}</td>
                            <td className="py-4 text-gray-400">₹ {row.cost?.toLocaleString()}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
                                {row.status === 'Active' ? 'In Shop' : row.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {!isCompleted && isFleetManager ? (
                                <button
                                  onClick={() => handleCloseLog(row.id)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-all cursor-pointer shadow-sm"
                                >
                                  Complete
                                </button>
                              ) : !isCompleted ? (
                                <span className="text-xs text-gray-500 italic">No actions</span>
                              ) : (
                                <span className="text-xs text-green-400 font-semibold">Done</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 italic leading-normal">
              * Note: In Shop vehicles are removed from the active trip assignment dispatch pool.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
