import { useEffect, useState } from 'react'
import { loadDashboardKpis } from '../lib/backendResources'

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    region: 'All',
  })
  const [kpis, setKpis] = useState([])

  useEffect(() => {
    let cancelled = false

    loadDashboardKpis().then((items) => {
      if (!cancelled) setKpis(items)
    })

    return () => {
      cancelled = true
    }
  }, [])

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
            <option value="Available">Available</option>
            <option value="OnTrip">On Trip</option>
            <option value="InShop">In Shop</option>
            <option value="Retired">Retired</option>
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
        {kpis.length === 0 ? (
          <div className="col-span-full p-5 rounded-2xl bg-gray-900/60 border border-gray-900/60 text-gray-500 text-sm">
            No KPI data returned yet.
          </div>
        ) : (
          kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`p-5 rounded-2xl bg-gray-900/60 border border-gray-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between ${kpi.border}`}
            >
              <p className="text-[10px] font-bold text-gray-500 tracking-wider mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Split Section: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-6">Recent Trips</h2>
          <p className="text-sm text-gray-500">Trip history loads from the backend trip route.</p>
        </div>

        {/* Vehicle Status Progress bars */}
        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Vehicle Status</h2>
            <p className="text-sm text-gray-500">Vehicle status distribution is computed from the backend KPI feed.</p>
          </div>

          <p className="text-[11px] text-gray-600 leading-normal mt-6">
            * Statistics are live calculations compiled across fleet operations, active transits, and workshop maintenance queues.
          </p>
        </div>
      </div>
    </div>
  )
}
