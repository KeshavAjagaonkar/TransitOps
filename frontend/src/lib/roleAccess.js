const ROLE_CONFIG = {
  FleetManager: {
    label: 'Fleet Manager',
    homePath: '/fleet',
    permissions: {
      canCreateVehicle: true,
      canCreateDriver: true,
      canCreateTrip: true,
      canManageDriverStatus: true,
      canViewFleet: true,
      canViewDrivers: true,
      canViewTrips: true,
    },
  },
  Dispatcher: {
    label: 'Dispatcher',
    homePath: '/trips',
    permissions: {
      canCreateVehicle: false,
      canCreateDriver: false,
      canCreateTrip: true,
      canManageDriverStatus: false,
      canViewFleet: false,
      canViewDrivers: false,
      canViewTrips: true,
    },
  },
  SafetyOfficer: {
    label: 'Safety Officer',
    homePath: '/drivers',
    permissions: {
      canCreateVehicle: false,
      canCreateDriver: false,
      canCreateTrip: false,
      canManageDriverStatus: true,
      canViewFleet: false,
      canViewDrivers: true,
      canViewTrips: false,
    },
  },
  FinancialAnalyst: {
    label: 'Financial Analyst',
    homePath: '/',
    permissions: {
      canCreateVehicle: false,
      canCreateDriver: false,
      canCreateTrip: false,
      canManageDriverStatus: false,
      canViewFleet: false,
      canViewDrivers: false,
      canViewTrips: false,
    },
  },
}

export function normalizeRole(role) {
  return ROLE_CONFIG[role] ? role : 'Dispatcher'
}

export function getRoleConfig(role) {
  return ROLE_CONFIG[normalizeRole(role)]
}

export function getRoleLabel(role) {
  return getRoleConfig(role).label
}

export function getRoleHomePath(role) {
  return getRoleConfig(role).homePath
}

export function canAccess(role, permission) {
  return Boolean(getRoleConfig(role).permissions[permission])
}

export function formatRole(role) {
  const normalized = normalizeRole(role)
  return normalized.replace(/([A-Z])/g, ' $1').trim()
}