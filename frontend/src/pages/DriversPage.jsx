import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { api } from '../lib/axiosInstance'

export default function DriversPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || 'Dispatcher'
  const isFleetManager = role === 'FleetManager'
  const isSafetyOfficer = role === 'SafetyOfficer'
  const canToggleStatus = isFleetManager || isSafetyOfficer
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [error, setError] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [licenseCategory, setLicenseCategory] = useState('LMV')
  const [licenseExpiry, setLicenseExpiry] = useState('')
  const [safetyScore, setSafetyScore] = useState('100')

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers')
      setDrivers(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching drivers:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const handleAddDriver = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !contact || !licenseNo || !licenseCategory || !licenseExpiry) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      await api.post('/drivers', {
        name,
        contact,
        licenseNo,
        licenseCategory,
        licenseExpiry: new Date(licenseExpiry).toISOString(),
        safetyScore: parseInt(safetyScore, 10),
        status: 'Available',
      })
      setShowAddModal(false)
      // Reset form
      setName('')
      setContact('')
      setLicenseNo('')
      setLicenseCategory('LMV')
      setLicenseExpiry('')
      setSafetyScore('100')
      // Refresh list
      fetchDrivers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create driver record.')
    }
  }

  const handleStatusToggle = async (status) => {
    if (!selectedDriver) return
    try {
      const res = await api.patch(`/drivers/${selectedDriver.id}/status`, { status })
      // Update selected driver state & list
      setSelectedDriver(res.data)
      fetchDrivers()
    } catch (err) {
      console.error('Error updating driver status:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this driver?')) return
    try {
      await api.delete(`/drivers/${id}`)
      setSelectedDriver(null)
      fetchDrivers()
    } catch (err) {
      console.error('Error deleting driver:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading drivers profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      {/* Title & Actions Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Drivers & Safety Profiles</h1>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-900/60">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Active Roster: <span className="text-white normal-case">{drivers.length} Drivers</span>
        </div>

        {/* Add Driver Button */}
        {isFleetManager && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-500/20 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Driver
          </button>
        )}
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
                <th className="pb-3">SAFETY SCORE</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800/40">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-sm">
                    No drivers registered.
                  </td>
                </tr>
              ) : (
                drivers.map((row) => {
                  const safetyColor =
                    row.safetyScore >= 85
                      ? 'text-green-400 font-semibold'
                      : row.safetyScore >= 70
                      ? 'text-amber-400'
                      : 'text-red-400'

                  const statusColor =
                    row.status === 'Available'
                      ? 'bg-green-500/15 text-green-400 border-green-500/20'
                      : row.status === 'OnTrip'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                      : row.status === 'Suspended'
                      ? 'bg-red-500/15 text-red-400 border-red-500/20'
                      : 'bg-gray-500/15 text-gray-400 border-gray-500/20'

                  const isExpired = new Date(row.licenseExpiry) < new Date()

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedDriver(row)}
                      className={`hover:bg-gray-900/30 cursor-pointer transition-all duration-150 ${selectedDriver?.id === row.id ? 'bg-indigo-600/5' : ''}`}
                    >
                      <td className="py-4 font-semibold text-gray-300 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                          {row.name[0]?.toUpperCase()}
                        </div>
                        {row.name}
                      </td>
                      <td className="py-4 font-mono text-gray-300">{row.licenseNo}</td>
                      <td className="py-4 text-gray-400">{row.licenseCategory}</td>
                      <td className={`py-4 ${isExpired ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                        {new Date(row.licenseExpiry).toLocaleDateString()}
                        {isExpired && ' (EXPIRED)'}
                      </td>
                      <td className="py-4 text-gray-400">{row.contact}</td>
                      <td className={`py-4 ${safetyColor}`}>{row.safetyScore} / 100</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {isFleetManager ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(row.id)
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 italic">No actions</span>
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

      {/* Toggle Status Actions */}
      {selectedDriver && selectedDriver.status !== 'Retired' && canToggleStatus && (
        <div className="bg-gray-900/30 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Toggle Status for: <span className="text-white normal-case font-bold">{selectedDriver.name}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusToggle('Available')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              Available
            </button>
            <button
              onClick={() => handleStatusToggle('OnTrip')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              On Trip
            </button>
            <button
              onClick={() => handleStatusToggle('OffDuty')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-500/10 border border-gray-500/25 text-gray-400 hover:bg-gray-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              Off Duty
            </button>
            <button
              onClick={() => handleStatusToggle('Suspended')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              Suspended
            </button>
          </div>
        </div>
      )}

      {/* Rule Alert Footer */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs leading-relaxed">
        <strong>Rule:</strong> Expired license or Suspended status → blocked from trip assignment selection list.
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Register Driver Profile</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-gray-400 font-medium">FULL NAME *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Alex Mercer"
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">CONTACT NO. *</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="E.g. 98765xxxxx"
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">LICENSE NO. *</label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value.toUpperCase())}
                    placeholder="E.g. DL-88213"
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">CATEGORY *</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">LICENSE EXPIRY *</label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-gray-400 font-medium">INITIAL SAFETY SCORE (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                >
                  Register Driver
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
