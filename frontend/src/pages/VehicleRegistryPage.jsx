import { useState } from 'react'

const VEHICLES = [
  { regNo: 'GJ01AB4521', nameModel: 'VAN-05', type: 'Van', capacity: '500 kg', odometer: '74,000', acqCost: '6,20,000', status: 'Available', statusColor: 'bg-green-500/15 text-green-400 border-green-500/20' },
  { regNo: 'GJ01AB9981', nameModel: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', odometer: '182,000', acqCost: '24,50,000', status: 'On Trip', statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { regNo: 'GJ01AB1120', nameModel: 'MINI-03', type: 'Mini', capacity: '1 Ton', odometer: '66,000', acqCost: '4,10,000', status: 'In Shop', statusColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { regNo: 'GJ01AB0081', nameModel: 'VAN-09', type: 'Van', capacity: '750 kg', odometer: '241,900', acqCost: '5,90,000', status: 'Retired', statusColor: 'bg-red-500/15 text-red-400 border-red-500/20' },
]

export default function VehicleRegistryPage() {
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchReg, setSearchReg] = useState('')

  return (
    <div className="space-y-6 select-none">
      {/* Title & Actions Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Registry</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-900/60">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search reg. no..."
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-150"
            />
          </div>
        </div>

        {/* Add Vehicle Button (Orange) */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-500/20 transition-all duration-150 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {/* Master Table */}
      <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                <th className="pb-3">REG. NO. (UNIQUE)</th>
                <th className="pb-3">NAME/MODEL</th>
                <th className="pb-3">TYPE</th>
                <th className="pb-3">CAPACITY</th>
                <th className="pb-3">ODOMETER</th>
                <th className="pb-3">ACQ. COST</th>
                <th className="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800/40">
              {VEHICLES.map((row) => (
                <tr key={row.regNo} className="hover:bg-gray-900/30">
                  <td className="py-4 font-mono font-semibold text-gray-300">{row.regNo}</td>
                  <td className="py-4 text-gray-300">{row.nameModel}</td>
                  <td className="py-4 text-gray-400">{row.type}</td>
                  <td className="py-4 text-gray-400">{row.capacity}</td>
                  <td className="py-4 text-gray-400">{row.odometer} km</td>
                  <td className="py-4 text-gray-400">₹ {row.acqCost}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Alert Footer */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs leading-relaxed">
        <strong>Rule:</strong> Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher selection.
      </div>
    </div>
  )
}
