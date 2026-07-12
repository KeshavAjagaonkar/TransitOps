import { useState } from 'react'

const KPI_LIST = [
  { label: 'ACTIVE VEHICLES', value: '53', border: 'border-l-4 border-l-blue-500' },
  { label: 'AVAILABLE VEHICLES', value: '42', border: 'border-l-4 border-l-green-500' },
  { label: 'VEHICLES IN MAINTENANCE', value: '05', border: 'border-l-4 border-l-amber-500' },
  { label: 'ACTIVE TRIPS', value: '18', border: 'border-l-4 border-l-sky-500' },
  { label: 'PENDING TRIPS', value: '09', border: 'border-l-4 border-l-indigo-500' },
  { label: 'DRIVERS ON DUTY', value: '26', border: 'border-l-4 border-l-emerald-500' },
  { label: 'FLEET UTILIZATION', value: '81%', border: 'border-l-4 border-l-purple-500' },
]

const RECENT_TRIPS = [
  { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20', eta: '45 min' },
  { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', statusColor: 'bg-green-500/15 text-green-400 border-green-500/20', eta: '—' },
  { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', statusColor: 'bg-sky-500/15 text-sky-400 border-sky-500/20', eta: '1h 10m' },
  { trip: 'TR004', vehicle: '—', driver: '—', status: 'Draft', statusColor: 'bg-gray-500/15 text-gray-400 border-gray-500/20', eta: 'Awaiting vehicle' },
]

const VEHICLE_STATUSES = [
  { label: 'Available', percent: 65, color: 'bg-green-500' },
  { label: 'On Trip', percent: 20, color: 'bg-blue-500' },
  { label: 'In Shop', percent: 10, color: 'bg-amber-500' },
  { label: 'Retired', percent: 5, color: 'bg-red-500' },
]

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    region: 'All',
  })

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
        {KPI_LIST.map((kpi) => (
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
                  <th className="pb-3">ETA</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800/40">
                {RECENT_TRIPS.map((row) => (
                  <tr key={row.trip} className="hover:bg-gray-900/30">
                    <td className="py-4 font-semibold text-gray-300">{row.trip}</td>
                    <td className="py-4 text-gray-400">{row.vehicle}</td>
                    <td className="py-4 text-gray-400">{row.driver}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress bars */}
        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Vehicle Status</h2>
            <div className="space-y-5">
              {VEHICLE_STATUSES.map((status) => (
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
