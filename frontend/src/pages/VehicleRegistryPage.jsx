import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/react'
import { z } from 'zod'
import { canAccess, formatRole } from '../lib/roleAccess'
import { createVehicle, deleteVehicle, getVehicle, loadVehicles, updateVehicle } from '../lib/backendResources'
import Modal from '../components/Modal'
import { FormField, FieldClass } from '../components/FormField'
import { useZodForm } from '../lib/useZodForm'

const VEHICLE_TYPES = ['Van', 'Truck', 'Mini']
// These must match the *labels* normalizeVehicle actually produces
// (spaced strings), since that's what row.status contains after loadVehicles().
const STATUS_LABELS = ['Available', 'On Trip', 'In Shop', 'Retired']
const STATUS_TO_API = {
  Available: 'Available',
  'On Trip': 'OnTrip',
  'In Shop': 'InShop',
  Retired: 'Retired',
}
const STATUS_FROM_API = {
  Available: 'Available',
  OnTrip: 'On Trip',
  InShop: 'In Shop',
  Retired: 'Retired',
}

const vehicleSchema = z.object({
  regNo: z.string().trim().min(1, 'Registration number is required')
    .regex(/^[A-Za-z0-9-\s]+$/, 'Only letters, numbers, spaces and hyphens allowed'),
  nameModel: z.string().trim().min(1, 'Name / model is required'),
  type: z.enum(VEHICLE_TYPES, { errorMap: () => ({ message: 'Select a valid type' }) }),
  maxCapacityKg: z.coerce.number({ invalid_type_error: 'Capacity must be a number' })
    .positive('Capacity must be greater than 0'),
  odometer: z.coerce.number({ invalid_type_error: 'Odometer must be a number' })
    .min(0, 'Odometer cannot be negative'),
  acquisitionCost: z.coerce.number({ invalid_type_error: 'Acquisition cost must be a number' })
    .min(0, 'Acquisition cost cannot be negative'),
  region: z.string().trim().optional(),
})

const emptyDraft = {
  regNo: '', nameModel: '', type: 'Van', maxCapacityKg: '', odometer: '0', acquisitionCost: '', region: '',
}

export default function VehicleRegistryPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const canCreateVehicle = canAccess(role, 'canCreateVehicle')
  const canUpdateVehicle = canAccess(role, 'canUpdateVehicle')
  const canDeleteVehicle = canAccess(role, 'canDeleteVehicle')

  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchReg, setSearchReg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detailVehicle, setDetailVehicle] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [editVehicle, setEditVehicle] = useState(null)
  const [editError, setEditError] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  const { values: draft, updateField, fieldErrors, formError, submitting, handleSubmit, reset } =
    useZodForm(vehicleSchema, emptyDraft)

  // Single source of truth for pulling the vehicle list — called on
  // mount, and again after any create/retire so the UI always reflects
  // exactly what the backend has, instead of trusting a mutation's
  // response payload or patching local state by hand.
  const refreshVehicles = async () => {
    setRefreshing(true)
    try {
      const items = await loadVehicles()
      setVehicles(items)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    loadVehicles()
      .then((items) => { if (!cancelled) setVehicles(items) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const visibleVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = filterType === 'All' || v.type === filterType
      const matchesStatus = filterStatus === 'All' || v.status === filterStatus
      const matchesSearch = searchReg.trim() === '' || v.regNo.toLowerCase().includes(searchReg.toLowerCase())
      return matchesType && matchesStatus && matchesSearch
    })
  }, [filterStatus, filterType, searchReg, vehicles])

  const openForm = () => { reset(); setShowForm(true) }

  const openVehicleDetail = async (vehicleId) => {
    setDetailVehicle(null)
    setDetailError('')
    setDetailLoading(true)
    try {
      const vehicle = await getVehicle(vehicleId)
      setDetailVehicle(vehicle)
    } catch (err) {
      setDetailError(err.response?.data?.error || 'Failed to load vehicle details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const openVehicleEdit = async (vehicleId) => {
    setEditError('')
    setDetailError('')
    try {
      const vehicle = await getVehicle(vehicleId)
      setEditVehicle({
        ...vehicle,
        status: STATUS_FROM_API[vehicle.status] ?? vehicle.status ?? 'Available',
        maxCapacityKg: vehicle.maxCapacityKg ?? '',
        odometer: vehicle.odometer ?? '',
        acquisitionCost: vehicle.acquisitionCost ?? '',
        region: vehicle.region ?? '',
      })
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to load vehicle for editing.')
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    await createVehicle(data)
    setShowForm(false)
    await refreshVehicles()
  })

  const onUpdateVehicle = async () => {
    if (!editVehicle) return
    setEditSubmitting(true)
    setEditError('')
    try {
      await updateVehicle(editVehicle.id, {
        regNo: editVehicle.regNo,
        nameModel: editVehicle.nameModel,
        type: editVehicle.type,
        maxCapacityKg: Number(editVehicle.maxCapacityKg),
        odometer: Number(editVehicle.odometer),
        acquisitionCost: Number(editVehicle.acquisitionCost),
        region: editVehicle.region || null,
        status: STATUS_TO_API[editVehicle.status] ?? editVehicle.status,
      })
      setEditVehicle(null)
      await refreshVehicles()
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update vehicle.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const onDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    try {
      await deleteVehicle(vehicleId)
      await refreshVehicles()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete vehicle.')
    }
  }

  const tableLoading = loading || refreshing

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Registry</h1>
        <p className="text-xs text-gray-500 mt-1">
          {formatRole(role)} workspace • {vehicles.length} assets
          {refreshing && <span className="ml-2 text-indigo-400">Refreshing…</span>}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-900/60">
        <div className="flex flex-wrap items-center gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50">
            <option value="All">Type: All</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50">
            <option value="All">Status: All</option>
            {STATUS_LABELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Search reg. no..." value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>

        {canCreateVehicle && (
          <button onClick={openForm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Vehicle
          </button>
        )}
      </div>

      <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 tracking-wider">
                <th className="pb-3">REG. NO.</th>
                <th className="pb-3">NAME/MODEL</th>
                <th className="pb-3">TYPE</th>
                <th className="pb-3">CAPACITY</th>
                <th className="pb-3">ODOMETER</th>
                <th className="pb-3">ACQ. COST</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800/40">
              {tableLoading ? (
                <tr><td className="py-6 text-gray-500" colSpan={8}>Loading vehicles...</td></tr>
              ) : visibleVehicles.length === 0 ? (
                <tr><td className="py-6 text-gray-500" colSpan={8}>No vehicles found.</td></tr>
              ) : visibleVehicles.map((row) => (
                <tr key={row.id} className="hover:bg-gray-900/30">
                  <td className="py-4 font-mono font-semibold text-gray-300">{row.regNo}</td>
                  <td className="py-4 text-gray-300">{row.nameModel}</td>
                  <td className="py-4 text-gray-400">{row.type}</td>
                  {/* capacity/odometer/acqCost are pre-formatted strings from normalizeVehicle */}
                  <td className="py-4 text-gray-400">{row.capacity}</td>
                  <td className="py-4 text-gray-400">{row.odometer} km</td>
                  <td className="py-4 text-gray-400">₹ {row.acqCost}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openVehicleDetail(row.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        View
                      </button>
                      {canUpdateVehicle && row.status !== 'Retired' && (
                        <button
                          onClick={() => openVehicleEdit(row.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteVehicle && (
                        <button
                          onClick={() => onDeleteVehicle(row.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs leading-relaxed">
        <strong>Rule:</strong> Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher selection.
      </div>

      <Modal open={showForm && canCreateVehicle} onClose={() => setShowForm(false)} title="Add Vehicle">
        <form onSubmit={onSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm">
              {formError}
            </div>
          )}

          <FormField label="Registration number" error={fieldErrors.regNo}>
            <input value={draft.regNo} onChange={(e) => updateField('regNo', e.target.value.toUpperCase())}
              placeholder="e.g. MH04AB1234" className={FieldClass(fieldErrors.regNo)} />
          </FormField>

          <FormField label="Name / model" error={fieldErrors.nameModel}>
            <input value={draft.nameModel} onChange={(e) => updateField('nameModel', e.target.value)}
              placeholder="e.g. Tata Ace" className={FieldClass(fieldErrors.nameModel)} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" error={fieldErrors.type}>
              <select value={draft.type} onChange={(e) => updateField('type', e.target.value)}
                className={FieldClass(fieldErrors.type)}>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>

            <FormField label="Region" error={fieldErrors.region}>
              <input value={draft.region} onChange={(e) => updateField('region', e.target.value)}
                placeholder="e.g. North, West" className={FieldClass(fieldErrors.region)} />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Capacity (kg)" error={fieldErrors.maxCapacityKg}>
              <input value={draft.maxCapacityKg} onChange={(e) => updateField('maxCapacityKg', e.target.value)}
                placeholder="500" inputMode="decimal" className={FieldClass(fieldErrors.maxCapacityKg)} />
            </FormField>
            <FormField label="Odometer (km)" error={fieldErrors.odometer}>
              <input value={draft.odometer} onChange={(e) => updateField('odometer', e.target.value)}
                placeholder="0" inputMode="decimal" className={FieldClass(fieldErrors.odometer)} />
            </FormField>
            <FormField label="Acq. cost (₹)" error={fieldErrors.acquisitionCost}>
              <input value={draft.acquisitionCost} onChange={(e) => updateField('acquisitionCost', e.target.value)}
                placeholder="0" inputMode="decimal" className={FieldClass(fieldErrors.acquisitionCost)} />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all cursor-pointer">
              {submitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(detailVehicle) || detailLoading || Boolean(detailError)} onClose={() => { setDetailVehicle(null); setDetailError('') }} title="Vehicle Details">
        {detailLoading ? (
          <p className="text-sm text-gray-400">Loading vehicle details...</p>
        ) : detailError ? (
          <p className="text-sm text-red-400">{detailError}</p>
        ) : detailVehicle ? (
          <div className="space-y-3 text-sm text-gray-300">
            <div><span className="text-gray-500">Reg. No.</span> {detailVehicle.regNo}</div>
            <div><span className="text-gray-500">Name/Model.</span> {detailVehicle.nameModel}</div>
            <div><span className="text-gray-500">Type.</span> {detailVehicle.type}</div>
            <div><span className="text-gray-500">Capacity.</span> {detailVehicle.maxCapacityKg ?? detailVehicle.capacity}</div>
            <div><span className="text-gray-500">Odometer.</span> {detailVehicle.odometer}</div>
            <div><span className="text-gray-500">Acquisition Cost.</span> {detailVehicle.acquisitionCost}</div>
            <div><span className="text-gray-500">Region.</span> {detailVehicle.region || '—'}</div>
            <div><span className="text-gray-500">Status.</span> {detailVehicle.status}</div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(editVehicle)} onClose={() => setEditVehicle(null)} title="Edit Vehicle">
        {editVehicle && (
          <div className="space-y-4">
            {editError && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-300 text-sm">
                {editError}
              </div>
            )}
            <FormField label="Registration number">
              <input value={editVehicle.regNo} onChange={(e) => setEditVehicle({ ...editVehicle, regNo: e.target.value.toUpperCase() })} className={FieldClass(false)} />
            </FormField>
            <FormField label="Name / model">
              <input value={editVehicle.nameModel} onChange={(e) => setEditVehicle({ ...editVehicle, nameModel: e.target.value })} className={FieldClass(false)} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type">
                <select value={editVehicle.type} onChange={(e) => setEditVehicle({ ...editVehicle, type: e.target.value })} className={FieldClass(false)}>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Status">
                <select value={editVehicle.status} onChange={(e) => setEditVehicle({ ...editVehicle, status: e.target.value })} className={FieldClass(false)}>
                  {STATUS_LABELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Capacity (kg)">
                <input value={editVehicle.maxCapacityKg} onChange={(e) => setEditVehicle({ ...editVehicle, maxCapacityKg: e.target.value })} className={FieldClass(false)} />
              </FormField>
              <FormField label="Odometer (km)">
                <input value={editVehicle.odometer} onChange={(e) => setEditVehicle({ ...editVehicle, odometer: e.target.value })} className={FieldClass(false)} />
              </FormField>
              <FormField label="Acq. cost (₹)">
                <input value={editVehicle.acquisitionCost} onChange={(e) => setEditVehicle({ ...editVehicle, acquisitionCost: e.target.value })} className={FieldClass(false)} />
              </FormField>
            </div>
            <FormField label="Region">
              <input value={editVehicle.region || ''} onChange={(e) => setEditVehicle({ ...editVehicle, region: e.target.value })} className={FieldClass(false)} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditVehicle(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={onUpdateVehicle} disabled={editSubmitting} className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all cursor-pointer">
                {editSubmitting ? 'Updating...' : 'Update Vehicle'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}