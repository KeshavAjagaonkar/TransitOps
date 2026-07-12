import { useState } from 'react'

const DRIVERS = [
  { name: 'Alex', licenseNo: 'DL-88213', category: 'LMV', expiry: '12/2028', expiryClass: 'text-gray-400', contact: '98765xxxxx', completion: '96%', safety: 'Available', safetyColor: 'bg-green-500/15 text-green-400 border-green-500/20', status: 'Available', statusColor: 'bg-green-500/15 text-green-400 border-green-500/20' },
  { name: 'John', licenseNo: 'DL-44120', category: 'HMV', expiry: '03/2025 EXPIRED', expiryClass: 'text-red-400 font-semibold', contact: '98220xxxxx', completion: '81%', safety: 'Suspended', safetyColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20', status: 'Suspended', statusColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { name: 'Priya', licenseNo: 'DL-77031', category: 'LMV', expiry: '08/2026', expiryClass: 'text-gray-400', contact: '99110xxxxx', completion: '99%', safety: 'On Trip', safetyColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20', status: 'On Trip', statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { name: 'Suresh', licenseNo: 'DL-90045', category: 'HMV', expiry: '01/2027', expiryClass: 'text-gray-400', contact: '97440xxxxx', completion: '88%', safety: 'Available', safetyColor: 'bg-green-500/15 text-green-400 border-green-500/20', status: 'Off Duty', statusColor: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
]

export default function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState(null)

  return (
    <div className="space-y-6 select-none">
      {/* Title & Actions Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Drivers & Safety Profiles</h1>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-900/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Driver:</span>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search driver profile..."
              className="pl-9 pr-4 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-150"
            />
          </div>
        </div>

        {/* Add Driver Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-500/20 transition-all duration-150 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Driver
        </button>
      </div>

      {/* Master Driver Table */}
      <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                <th className="pb-3">DRIVER</th>
                <th className="pb-3">LICENSE NO.</th>
                <th className="pb-3">CATEGORY</th>
                <th className="pb-3">EXPIRY</th>
                <th className="pb-3">CONTACT</th>
                <th className="pb-3">TRIP COMPL.</th>
                <th className="pb-3">SAFETY</th>
                <th className="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800/40">
              {DRIVERS.map((row) => (
                <tr
                  key={row.name}
                  onClick={() => setSelectedDriver(row)}
                  className={`hover:bg-gray-900/30 cursor-pointer transition-all duration-150 ${selectedDriver?.name === row.name ? 'bg-indigo-600/5' : ''}`}
                >
                  <td className="py-4 font-semibold text-gray-300 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                      {row.name[0]}
                    </div>
                    {row.name}
                  </td>
                  <td className="py-4 font-mono text-gray-300">{row.licenseNo}</td>
                  <td className="py-4 text-gray-400">{row.category}</td>
                  <td className={`py-4 ${row.expiryClass}`}>{row.expiry}</td>
                  <td className="py-4 text-gray-400">{row.contact}</td>
                  <td className="py-4 text-gray-400">{row.completion}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.safetyColor}`}>
                      {row.safety}
                    </span>
                  </td>
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

      {/* Toggle Status Actions */}
      {selectedDriver && (
        <div className="bg-gray-900/30 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-4 animate-fade-in">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Toggle Status for: <span className="text-white normal-case">{selectedDriver.name}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-150 cursor-pointer">
              Available
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-150 cursor-pointer">
              On Trip
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-500/15 border border-gray-500/30 text-gray-400 hover:bg-gray-500 hover:text-white transition-all duration-150 cursor-pointer">
              Off Duty
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-150 cursor-pointer">
              Suspended
            </button>
          </div>
        </div>
      )}

      {/* Rule Alert Footer */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs leading-relaxed">
        <strong>Rule:</strong> Expired license or Suspended status → blocked from trip assignment selection list.
      </div>
    </div>
  )
}
