import { useState, useEffect } from 'react'
import { api } from '../lib/axiosInstance'

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    region: 'All',
  })

  const [kpis, setKpis] = useState([])
  const [recentTrips, setRecentTrips] = useState([])
  const [allTrips, setAllTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        const [kpiRes, tripsRes, vehiclesRes] = await Promise.all([
          api.get('/reports/dashboard/kpis'),
          api.get('/trips'),
          api.get('/vehicles')
        ])

        if (!active) return

        setKpis(kpiRes.data)
        setAllTrips(tripsRes.data)
        setRecentTrips(tripsRes.data.slice(0, 5))
        setVehicles(vehiclesRes.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => { active = false }
  }, [])

  // Calculate vehicle status distribution dynamically from live vehicle list
  const totalVehicles = vehicles.length || 1
  const vehicleStats = [
    { label: 'Available', count: vehicles.filter(v => v.status === 'Available').length, color: 'bg-green-500' },
    { label: 'On Trip', count: vehicles.filter(v => v.status === 'OnTrip').length, color: 'bg-blue-500' },
    { label: 'In Shop', count: vehicles.filter(v => v.status === 'InShop').length, color: 'bg-amber-500' },
    { label: 'Retired', count: vehicles.filter(v => v.status === 'Retired').length, color: 'bg-red-500' },
  ].map(s => ({
    ...s,
    percent: Math.round((s.count / totalVehicles) * 100)
  }))

  // Apply filters locally on the trips and KPIs
  const filteredTrips = recentTrips.filter(trip => {
    if (filters.status !== 'All' && trip.status !== filters.status) return false
    if (filters.type !== 'All' && trip.vehicle?.type !== filters.type) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading dashboard statistics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-900/60">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters:</span>
        
        {/* Vehicle Type Dropdown */}
        <div className="flex flex-col">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">Vehicle Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Region Dropdown */}
        <div className="flex flex-col">
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">Region: All</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`p-5 rounded-2xl bg-gray-900/60 border border-gray-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between ${kpi.border}`}
          >
            <p className="text-[10px] font-bold text-gray-500 tracking-wider mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Split Section: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-6">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                  <th className="pb-3">TRIP</th>
                  <th className="pb-3">VEHICLE</th>
                  <th className="pb-3">DRIVER</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">ETA / DATE</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800/40">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                      No recent trips found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((row) => {
                    const statusClass =
                      row.status === 'Completed'
                        ? 'bg-green-500/15 text-green-400 border-green-500/20'
                        : row.status === 'Dispatched'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                        : row.status === 'Cancelled'
                        ? 'bg-red-500/15 text-red-400 border-red-500/20'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/20'

                    return (
                      <tr key={row.id} className="hover:bg-gray-900/30">
                        <td className="py-4 font-semibold text-gray-300">{row.tripCode}</td>
                        <td className="py-4 text-gray-400">{row.vehicle?.nameModel || '—'}</td>
                        <td className="py-4 text-gray-400">{row.driver?.name || '—'}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-400">
                          {row.status === 'Dispatched' ? 'In transit' : row.status === 'Completed' ? 'Completed' : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress bars */}
        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Vehicle Status</h2>
            <div className="space-y-5">
              {vehicleStats.map((status) => (
                <div key={status.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">{status.label}</span>
                    <span className="text-white font-bold">{status.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800/40">
                    <div
                      className={`h-full rounded-full ${status.color}`}
                      style={{ width: `${status.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-600 leading-normal mt-6">
            * Statistics are live calculations compiled across fleet operations, active transits, and workshop maintenance queues.
          </p>
        </div>
      </div>
    </div>
  )
}
