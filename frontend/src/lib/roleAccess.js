const ROLE_CONFIG = {
  FleetManager: {
    label: 'Fleet Manager',
    homePath: '/fleet',
    permissions: {
      canCreateVehicle: true,
      canUpdateVehicle: true,
      canDeleteVehicle: true,
      canCreateDriver: true,
      canCreateTrip: true,
      canManageDriverStatus: true,
      canViewFleet: true,
      canViewDrivers: true,
      canViewTrips: true,
      canViewCostReports: true, // added
    },
  },
  Dispatcher: {
    label: 'Dispatcher',
    homePath: '/trips',
    permissions: {
      canCreateVehicle: false,
      canUpdateVehicle: false,
      canDeleteVehicle: false,
      canCreateDriver: false,
      canCreateTrip: true,
      canManageDriverStatus: false,
      canViewFleet: false,
      canViewDrivers: false,
      canViewTrips: true,
      canViewCostReports: false, // added
    },
  },
  SafetyOfficer: {
    label: 'Safety Officer',
    homePath: '/drivers',
    permissions: {
      canCreateVehicle: false,
      canUpdateVehicle: false,
      canDeleteVehicle: false,
      canCreateDriver: false,
      canCreateTrip: false,
      canManageDriverStatus: true,
      canViewFleet: false,
      canViewDrivers: true,
      canViewTrips: false,
      canViewCostReports: false, // added
    },
  },
  FinancialAnalyst: {
    label: 'Financial Analyst',
    homePath: '/dashboard',
    permissions: {
      canCreateVehicle: false,
      canUpdateVehicle: false,
      canDeleteVehicle: false,
      canCreateDriver: false,
      canCreateTrip: false,
      canManageDriverStatus: false,
      canViewFleet: true,
      canViewDrivers: true,
      canViewTrips: true,
      canViewCostReports: true, // added
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