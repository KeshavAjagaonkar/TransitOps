import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/react'
import { canAccess, formatRole } from '../lib/roleAccess'
import { createTrip, dispatchTrip, loadTrips, normalizeTrip } from '../lib/backendResources'

const AVAILABLE_VEHICLES = [
  { id: 'v1', name: 'VAN-05', capacity: 500 },
  { id: 'v2', name: 'TRUCK-12', capacity: 5000 },
  { id: 'v3', name: 'MINI-08', capacity: 1000 },
]

const AVAILABLE_DRIVERS = [
  { id: 'd1', name: 'Alex' },
  { id: 'd2', name: 'Priya' },
  { id: 'd3', name: 'Suresh' },
]

export default function TripsPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const [source, setSource] = useState('Gandhinagar Depot')
  const [destination, setDestination] = useState('Ahmedabad Hub')
  const [selectedVehicle, setSelectedVehicle] = useState('v1')
  const [selectedDriver, setSelectedDriver] = useState('d1')
  const [cargoWeight, setCargoWeight] = useState(700)
  const [distance, setDistance] = useState(38)
  const [liveTrips, setLiveTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const activeVehicleObj = AVAILABLE_VEHICLES.find((v) => v.id === selectedVehicle)
  const isOverweight = activeVehicleObj ? cargoWeight > activeVehicleObj.capacity : false
  const overweightDiff = activeVehicleObj ? cargoWeight - activeVehicleObj.capacity : 0
  const canCreateTrip = canAccess(role, 'canCreateTrip')

  useEffect(() => {
    let cancelled = false

    loadTrips()
      .then((items) => {
        if (!cancelled) {
          setLiveTrips(items)
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

  const visibleTrips = useMemo(() => liveTrips, [liveTrips])

  const handleDispatch = async () => {
    if (!canCreateTrip || isOverweight) return

    setError('')

    const payload = {
      source,
      destination,
      cargoWeightKg: cargoWeight,
      plannedDistanceKm: distance,
      vehicleId: selectedVehicle,
      driverId: selectedDriver,
    }

    try {
      const created = await createTrip(payload)
      const trip = normalizeTrip(created)
      setLiveTrips((current) => [trip, ...current])
      await dispatchTrip(created.id || created.tripCode)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save the trip to the backend.')
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Trip Dispatcher</h1>
        <p className="text-xs text-gray-500 mt-1">{formatRole(role)} workspace</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Left Column: Create Trip Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            
            {/* Trip Lifecycle Indicator */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trip Lifecycle</p>
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0"></div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-gray-950 flex items-center justify-center text-xs font-bold shadow-md shadow-green-500/25">
                    ✓
                  </div>
                  <span className="text-[10px] text-green-400 font-semibold mt-1">Draft</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/25">
                    ●
                  </div>
                  <span className="text-[10px] text-blue-400 font-semibold mt-1">Dispatched</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-xs font-bold">
                    ○
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">Completed</span>
                </div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-xs font-bold">
                    ○
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">Cancelled</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-800/60" />

            {/* Create Trip Form */}
            <div className="space-y-4">
              <h2 className="text-md font-bold uppercase tracking-wider text-xs text-gray-400">Create Trip</h2>

              {/* Source */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">SOURCE</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">DESTINATION</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Vehicle Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">VEHICLE (AVAILABLE ONLY)</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                >
                  {AVAILABLE_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} - {v.capacity >= 1000 ? `${v.capacity / 1000} Ton` : `${v.capacity} kg`} capacity
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">DRIVER (AVAILABLE ONLY)</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                >
                  {AVAILABLE_DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cargo Weight */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">CARGO WEIGHT (KG)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Planned Distance */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">PLANNED DISTANCE (KM)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Overweight Validation Alert */}
              {isOverweight && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/25 text-red-400 text-xs space-y-1">
                  <p className="font-semibold">Vehicle Capacity: {activeVehicleObj.capacity} kg</p>
                  <p className="font-semibold">Cargo Weight: {cargoWeight} kg</p>
                  <p className="font-bold mt-1">
                    ❌ Capacity exceeded by {overweightDiff} kg — dispatch blocked
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleDispatch}
                  disabled={isOverweight}
                  className={`
                    w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-150
                    ${!canCreateTrip || isOverweight
                      ? 'bg-gray-800/30 text-gray-600 border border-gray-800/40 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 cursor-pointer'
                    }
                  `}
                >
                  {canCreateTrip ? 'Dispatch' : 'View Only'}
                </button>
                <button className="w-full py-3 rounded-xl font-bold text-sm text-gray-400 border border-gray-800 bg-transparent hover:bg-gray-900 transition-all duration-150 cursor-pointer">
                  Cancel
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Live Board */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6 flex flex-col justify-between min-h-125">
            <div>
              <h2 className="text-md font-bold uppercase tracking-wider text-xs text-gray-400 mb-6">Live Board</h2>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="py-6 text-gray-500">Loading trips from the backend...</div>
                ) : visibleTrips.length === 0 ? (
                  <div className="py-6 text-gray-500">No trips found.</div>
                ) : visibleTrips.map((trip) => (
                  <div
                    key={trip.code}
                    className="p-5 bg-gray-950 border border-gray-900/60 rounded-2xl flex items-center justify-between hover:border-gray-800 transition-all duration-150"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{trip.code}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs font-semibold text-indigo-400">{trip.vehicleDriver}</span>
                      </div>
                      <p className="text-xs text-gray-400">{trip.route}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${trip.statusClass}`}>
                        {trip.status}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">{trip.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-600 italic leading-normal">
              * On Complete: final odometer ➔ fuel log ➔ expenses logs compiled automatically. Vehicle & Driver status reset back to Available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
