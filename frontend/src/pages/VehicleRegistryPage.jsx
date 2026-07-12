import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/react'
import { canAccess, formatRole } from '../lib/roleAccess'
import { createVehicle, loadVehicles, normalizeVehicle } from '../lib/backendResources'

export default function VehicleRegistryPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchReg, setSearchReg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({
    regNo: '',
    nameModel: '',
    type: 'Van',
    capacity: '500 kg',
    odometer: '0',
    acqCost: '0',
  })

  const canCreateVehicle = canAccess(role, 'canCreateVehicle')

  useEffect(() => {
    let cancelled = false

    loadVehicles()
      .then((items) => {
        if (!cancelled) {
          setVehicles(items)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesType = filterType === 'All' || vehicle.type === filterType
      const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus
      const matchesSearch = searchReg.trim() === '' || vehicle.regNo.toLowerCase().includes(searchReg.toLowerCase())

      return matchesType && matchesStatus && matchesSearch
    })
  }, [filterStatus, filterType, searchReg, vehicles])

  const handleCreateVehicle = async (event) => {
    event.preventDefault()

    if (!canCreateVehicle) return

    setError('')

    const payload = {
      regNo: draft.regNo,
      nameModel: draft.nameModel,
      type: draft.type,
      maxCapacityKg: Number.parseFloat(draft.capacity),
      odometer: Number.parseFloat(draft.odometer),
      acquisitionCost: Number.parseFloat(draft.acqCost),
    }

    try {
      const created = await createVehicle(payload)
      setVehicles((current) => [normalizeVehicle(created), ...current])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save the vehicle to the backend.')
    } finally {
      setDraft({ regNo: '', nameModel: '', type: 'Van', capacity: '500 kg', odometer: '0', acqCost: '0' })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Title & Actions Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Registry</h1>
          <p className="text-xs text-gray-500 mt-1">{formatRole(role)} workspace</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm">
          {error}
        </div>
      )}

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

        {canCreateVehicle && (
          <button
            onClick={() => setShowForm((current) => !current)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-500/20 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {showForm ? 'Close Form' : 'Add Vehicle'}
          </button>
        )}
      </div>

      {showForm && canCreateVehicle && (
        <form onSubmit={handleCreateVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <input value={draft.regNo} onChange={(event) => setDraft({ ...draft, regNo: event.target.value })} placeholder="Registration number" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <input value={draft.nameModel} onChange={(event) => setDraft({ ...draft, nameModel: event.target.value })} placeholder="Name / model" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>
          <input value={draft.capacity} onChange={(event) => setDraft({ ...draft, capacity: event.target.value })} placeholder="Capacity" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <input value={draft.odometer} onChange={(event) => setDraft({ ...draft, odometer: event.target.value })} placeholder="Odometer" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <input value={draft.acqCost} onChange={(event) => setDraft({ ...draft, acqCost: event.target.value })} placeholder="Acquisition cost" className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <button type="submit" className="md:col-span-3 justify-self-start px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all duration-150 cursor-pointer">
            Save Vehicle
          </button>
        </form>
      )}

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
              {loading ? (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={7}>Loading vehicles from the backend...</td>
                </tr>
              ) : visibleVehicles.length === 0 ? (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={7}>No vehicles found.</td>
                </tr>
              ) : visibleVehicles.map((row) => (
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
