import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { api } from '../lib/axiosInstance'

export default function TripsPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || 'Dispatcher'
  const isDispatcher = role === 'Dispatcher'
  const isFleetManager = role === 'FleetManager'
  const canManageTrips = isDispatcher || isFleetManager
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [distance, setDistance] = useState('')

  const fetchTripsAndAssets = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
        api.get('/drivers'),
      ])
      setTrips(tripsRes.data)
      setVehicles(vehiclesRes.data)
      setDrivers(driversRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching trips/assets:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTripsAndAssets()
  }, [])

  // Filter available assets
  const availableVehicles = vehicles.filter((v) => v.status === 'Available')
  const availableDrivers = drivers.filter((d) => {
    const isExpired = new Date(d.licenseExpiry) < new Date()
    return d.status === 'Available' && !isExpired
  })

  // Form validation checks
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicle)
  const isOverweight =
    selectedVehicleObj && cargoWeight ? parseFloat(cargoWeight) > selectedVehicleObj.maxCapacityKg : false
  const overweightDiff =
    selectedVehicleObj && cargoWeight ? parseFloat(cargoWeight) - selectedVehicleObj.maxCapacityKg : 0

  const handleCreateDraft = async (e) => {
    e.preventDefault()
    setError('')

    if (!source || !destination || !cargoWeight || !distance || !selectedVehicle || !selectedDriver) {
      setError('Please fill in all fields.')
      return
    }

    try {
      await api.post('/trips', {
        source,
        destination,
        cargoWeightKg: parseFloat(cargoWeight),
        plannedDistanceKm: parseFloat(distance),
        vehicleId: selectedVehicle,
        driverId: selectedDriver,
        status: 'Draft',
      })
      // Reset form
      setSource('')
      setDestination('')
      setSelectedVehicle('')
      setSelectedDriver('')
      setCargoWeight('')
      setDistance('')
      // Refresh
      fetchTripsAndAssets()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip draft.')
    }
  }

  const handleDispatch = async (tripId) => {
    try {
      await api.post(`/trips/${tripId}/dispatch`)
      fetchTripsAndAssets()
    } catch (err) {
      console.error('Error dispatching trip:', err)
    }
  }

  const handleComplete = async (tripId) => {
    try {
      await api.post(`/trips/${tripId}/complete`)
      fetchTripsAndAssets()
    } catch (err) {
      console.error('Error completing trip:', err)
    }
  }

  const handleCancel = async (tripId) => {
    try {
      await api.post(`/trips/${tripId}/cancel`)
      fetchTripsAndAssets()
    } catch (err) {
      console.error('Error cancelling trip:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading trip records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Trip Dispatcher</h1>
      </div>

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

            {!canManageTrips ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-950 border border-gray-800 flex items-center justify-center mx-auto text-gray-500 text-lg">
                  🔒
                </div>
                <p className="text-xs text-gray-400 font-medium">Read-Only View</p>
                <p className="text-[11px] text-gray-500 leading-normal max-w-xs mx-auto">
                  Trips creation and dispatch management actions are restricted to **Dispatchers** and **Fleet Managers**.
                </p>
              </div>
            ) : (
              /* Create Trip Form */
              <form onSubmit={handleCreateDraft} className="space-y-4">
                <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400">Create Trip Draft</h2>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* Source */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">SOURCE *</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="E.g. Gandhinagar Depot"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">DESTINATION *</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="E.g. Ahmedabad Hub"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Vehicle Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">VEHICLE (AVAILABLE ONLY) *</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  >
                    <option value="">Select an available vehicle</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nameModel} (Capacity: {v.maxCapacityKg >= 1000 ? `${v.maxCapacityKg / 1000} Ton` : `${v.maxCapacityKg} kg`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">DRIVER (AVAILABLE ONLY) *</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  >
                    <option value="">Select an available driver</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cargo Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">CARGO WEIGHT (KG) *</label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="E.g. 700"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Planned Distance */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">PLANNED DISTANCE (KM) *</label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="E.g. 38"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                {/* Overweight Validation Alert */}
                {isOverweight && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/25 text-red-400 text-xs space-y-1">
                    <p className="font-semibold">Vehicle Capacity: {selectedVehicleObj.maxCapacityKg} kg</p>
                    <p className="font-semibold">Cargo Weight: {cargoWeight} kg</p>
                    <p className="font-bold mt-1">
                      ❌ Capacity exceeded by {overweightDiff} kg — dispatch blocked
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isOverweight || !selectedVehicle || !selectedDriver}
                    className={`
                      w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-150
                      ${isOverweight || !selectedVehicle || !selectedDriver
                        ? 'bg-gray-800/30 text-gray-600 border border-gray-800/40 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 cursor-pointer'
                      }
                    `}
                  >
                    Create Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSource('')
                      setDestination('')
                      setSelectedVehicle('')
                      setSelectedDriver('')
                      setCargoWeight('')
                      setDistance('')
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm text-gray-400 border border-gray-800 bg-transparent hover:bg-gray-900 transition-all duration-150 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>

        {/* Right Column: Live Board */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm space-y-6 flex flex-col justify-between min-h-[500px]">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider text-xs text-gray-400 mb-6">Live Board</h2>
              
              <div className="space-y-4">
                {trips.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-12">No active transits logged.</p>
                ) : (
                  trips.map((trip) => {
                    let statusClass = 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                    if (trip.status === 'Dispatched') statusClass = 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                    if (trip.status === 'Completed') statusClass = 'bg-green-500/15 text-green-400 border-green-500/20'
                    if (trip.status === 'Cancelled') statusClass = 'bg-red-500/15 text-red-400 border-red-500/20'

                    return (
                      <div
                        key={trip.id}
                        className="p-5 bg-gray-950 border border-gray-900/60 rounded-2xl flex items-center justify-between hover:border-gray-800 transition-all duration-150"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{trip.tripCode}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs font-semibold text-indigo-400">
                              {trip.vehicle?.nameModel || 'Unassigned'} / {trip.driver?.name || 'Unassigned'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {trip.source} ➔ {trip.destination}
                          </p>
                        </div>

                        {/* Interactive Board Action Buttons based on status */}
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-2">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
                              {trip.status}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {canManageTrips ? (
                              <>
                                {trip.status === 'Draft' && (
                                  <button
                                    onClick={() => handleDispatch(trip.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                  >
                                    Dispatch
                                  </button>
                                )}

                                {trip.status === 'Dispatched' && (
                                  <>
                                    <button
                                      onClick={() => handleComplete(trip.id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() => handleCancel(trip.id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-500 italic">No actions</span>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })
                )}
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
