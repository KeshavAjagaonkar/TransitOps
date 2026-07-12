// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'

export default function SettingsPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || 'Dispatcher'
  const isFleetManager = role === 'FleetManager'

  // Save settings in localStorage since there are no settings endpoints in backend
  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4')
  const [currency, setCurrency] = useState('INR (Rs)')
  const [distanceUnit, setDistanceUnit] = useState('Kilometers')
  const [savedAlert, setSavedAlert] = useState(false)

  useEffect(() => {
    const savedDepot = localStorage.getItem('depotName')
    const savedCurrency = localStorage.getItem('currency')
    const savedUnit = localStorage.getItem('distanceUnit')

    if (savedDepot) setDepotName(savedDepot)
    if (savedCurrency) setCurrency(savedCurrency)
    if (savedUnit) setDistanceUnit(savedUnit)
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('depotName', depotName)
    localStorage.setItem('currency', currency)
    localStorage.setItem('distanceUnit', distanceUnit)

    setSavedAlert(true)
    setTimeout(() => setSavedAlert(false), 2500)
  }

  // RBAC Configuration Matrix
  const rbacMatrix = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuel: '—', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', drivers: '—', trips: '✓', fuel: '—', analytics: '—' },
    { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'View', fuel: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'View', drivers: '—', trips: '—', fuel: '✓', analytics: '✓' },
  ]

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & RBAC</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column: General Depot Settings */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400">General Settings</h2>

            {!isFleetManager ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-950 border border-gray-800 flex items-center justify-center mx-auto text-gray-500 text-lg">
                  🔒
                </div>
                <p className="text-xs text-gray-400 font-medium">Read-Only View</p>
                <div className="text-left bg-gray-950/40 border border-gray-900 rounded-xl p-4 space-y-2 text-xs text-gray-400 max-w-xs mx-auto">
                  <p><strong>Depot:</strong> {depotName}</p>
                  <p><strong>Currency:</strong> {currency}</p>
                  <p><strong>Distance Unit:</strong> {distanceUnit}</p>
                </div>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-normal">
                  Editing depot settings requires **Fleet Manager** permissions.
                </p>
              </div>
            ) : (
              <>
                {savedAlert && (
                  <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-400 text-xs rounded-xl text-center">
                    Settings saved successfully!
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Depot Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">DEPOT NAME</label>
                    <input
                      type="text"
                      value={depotName}
                      onChange={(e) => setDepotName(e.target.value)}
                      placeholder="E.g. Gandhinagar Depot GJ4"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                      required
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">CURRENCY</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="INR (Rs)">INR (Rs)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                    </select>
                  </div>

                  {/* Distance Unit */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">DISTANCE UNIT</label>
                    <select
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="Kilometers">Kilometers (km)</option>
                      <option value="Miles">Miles (mi)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm text-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all duration-150 cursor-pointer"
                  >
                    Save changes
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Column: RBAC Policy Table */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400 mb-6">
                Role-Based Access (RBAC)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                      <th className="pb-3">ROLE</th>
                      <th className="pb-3">FLEET</th>
                      <th className="pb-3">DRIVERS</th>
                      <th className="pb-3">TRIPS</th>
                      <th className="pb-3">FUEL/EXP.</th>
                      <th className="pb-3">ANALYTICS</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-800/40 text-gray-300">
                    {rbacMatrix.map((row) => (
                      <tr key={row.role} className="hover:bg-gray-900/30">
                        <td className="py-4 font-semibold text-gray-200">{row.role}</td>
                        <td className="py-4 text-gray-400">{row.fleet}</td>
                        <td className="py-4 text-gray-400">{row.drivers}</td>
                        <td className="py-4 text-gray-400">{row.trips}</td>
                        <td className="py-4 text-gray-400">{row.fuel}</td>
                        <td className="py-4 text-gray-400">{row.analytics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
