import { api } from './axiosInstance'


const asDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const formatVehicleStatus = (status) => {
  if (status === 'OnTrip') return { label: 'On Trip', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' }
  if (status === 'InShop') return { label: 'In Shop', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
  if (status === 'Retired') return { label: 'Retired', className: 'bg-red-500/15 text-red-400 border-red-500/20' }
  return { label: 'Available', className: 'bg-green-500/15 text-green-400 border-green-500/20' }
}

const formatDriverStatus = (status) => {
  if (status === 'OnTrip') return { label: 'On Trip', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' }
  if (status === 'Suspended') return { label: 'Suspended', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
  if (status === 'OffDuty') return { label: 'Off Duty', className: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
  return { label: 'Available', className: 'bg-green-500/15 text-green-400 border-green-500/20' }
}

const formatTripStatus = (status) => {
  if (status === 'Completed') return { label: 'Completed', className: 'bg-green-500/15 text-green-400 border-green-500/20' }
  if (status === 'Cancelled') return { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/20' }
  if (status === 'Dispatched') return { label: 'Dispatched', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' }
  return { label: 'Draft', className: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
}

export function normalizeVehicle(vehicle) {
  const status = formatVehicleStatus(vehicle.status)
  const rawType = vehicle.type ?? vehicle.vehicleType ?? 'Van'
  const capacity = vehicle.capacity ?? vehicle.maxCapacityKg
  return {
    id: vehicle.id ?? vehicle.regNo,
    regNo: vehicle.regNo,
    nameModel: vehicle.nameModel,
    type: rawType,
    capacity: vehicle.capacity ?? (capacity != null ? `${capacity >= 1000 ? `${capacity / 1000} Ton` : `${capacity} kg`}` : '0 kg'),
    odometer: vehicle.odometer?.toLocaleString?.() ?? String(vehicle.odometer ?? '0'),
    acqCost: vehicle.acquisitionCost?.toLocaleString?.() ?? String(vehicle.acquisitionCost ?? '0'),
    status: status.label,
    statusColor: status.className,
  }
}

export function normalizeDriver(driver) {
  const status = formatDriverStatus(driver.status)
  return {
    id: driver.id,
    name: driver.name,
    licenseNo: driver.licenseNo,
    category: driver.category ?? driver.licenseCategory ?? 'LMV',
    expiry: driver.expiry ?? (driver.licenseExpiry ? asDateInput(driver.licenseExpiry) : '12/2028'),
    expiryClass: driver.expiryClass ?? 'text-gray-400',
    contact: driver.contact ?? '—',
    completion: driver.completion ?? `${driver.safetyScore ?? 100}%`,
    safety: status.label,
    safetyColor: status.className,
    status: status.label,
    statusColor: status.className,
  }
}

export function normalizeTrip(trip) {
  const status = formatTripStatus(trip.status)
  return {
    id: trip.id ?? trip.tripCode,
    code: trip.code ?? trip.tripCode,
    route: trip.route ?? `${trip.source ?? 'Unknown'} ➔ ${trip.destination ?? 'Unknown'}`,
    vehicleDriver: trip.vehicleDriver ?? `${trip.vehicle?.nameModel ?? 'Unassigned'} / ${trip.driver?.name?.toUpperCase?.() ?? 'UNASSIGNED'}`,
    status: status.label,
    statusClass: status.className,
    detail: trip.detail ?? `${trip.plannedDistanceKm ?? '—'} km`,
  }
}

export async function loadDashboardKpis() {
  try {
    const response = await api.get('/reports/dashboard/kpis')
    const data = response.data

    if (Array.isArray(data)) return data
    if (Array.isArray(data?.kpis)) return data.kpis
    return []
  } catch {
    return []
  }
}

export async function loadVehicles() {
  try {
    const response = await api.get('/vehicles')
    const data = response.data

    if (Array.isArray(data)) return data.map(normalizeVehicle)
    if (Array.isArray(data?.vehicles)) return data.vehicles.map(normalizeVehicle)
    return []
  } catch {
    return []
  }
}

export async function getVehicle(vehicleId) {
  const response = await api.get(`/vehicles/${vehicleId}`)
  return response.data
}

export async function createVehicle(payload) {
  const response = await api.post('/vehicles', payload)
  return response.data
}

export async function updateVehicle(vehicleId, payload) {
  const response = await api.patch(`/vehicles/${vehicleId}`, payload)
  return response.data
}

export async function deleteVehicle(vehicleId) {
  const response = await api.delete(`/vehicles/${vehicleId}`)
  return response.data
}

export async function loadDrivers() {
  try {
    const response = await api.get('/drivers')
    const data = response.data

    if (Array.isArray(data)) return data.map(normalizeDriver)
    if (Array.isArray(data?.drivers)) return data.drivers.map(normalizeDriver)
    return []
  } catch {
    return []
  }
}

export async function createDriver(payload) {
  const response = await api.post('/drivers', payload)
  return response.data
}

export async function updateDriverStatus(driverId, status) {
  const response = await api.patch(`/drivers/${driverId}/status`, { status })
  return response.data
}

export async function loadTrips() {
  try {
    const response = await api.get('/trips')
    const data = response.data

    if (Array.isArray(data)) return data.map(normalizeTrip)
    if (Array.isArray(data?.trips)) return data.trips.map(normalizeTrip)
    return []
  } catch {
    return []
  }
}

export async function createTrip(payload) {
  const response = await api.post('/trips', payload)
  return response.data
}

export async function dispatchTrip(tripId) {
  const response = await api.post(`/trips/${tripId}/dispatch`)
  return response.data
}

export async function retireVehicle(vehicleId) {
  const response = await api.delete(`/vehicles/${vehicleId}`)
  return response.data
}

export async function loadVehicleCostReport() {
  try {
    const response = await api.get('/reports/vehicle-costs') // fixed: was /reports/reports/vehicle-costs
    const data = response.data
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.report)) return data.report
    return []
  } catch {
    return []
  }
}

export async function exportVehicleCostCsv() {
  const response = await api.get('/reports/vehicle-costs/export.csv', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'vehicle-cost-report.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}