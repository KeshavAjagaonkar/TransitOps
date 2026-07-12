export const VALID_ROLES = ["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"];

export const VALID_VEHICLE_TYPES = ["Van", "Truck", "Mini"];
export const VALID_VEHICLE_STATUSES = ["Available", "OnTrip", "InShop", "Retired"];
export const VALID_DRIVER_STATUSES = ["Available", "OnTrip", "OffDuty", "Suspended"];
export const VALID_LICENSE_CATEGORIES = ["LMV", "HMV"];
export const VALID_TRIP_STATUSES = ["Draft", "Dispatched", "Completed", "Cancelled"];
export const VALID_MAINTENANCE_STATUSES = ["Active", "Completed"];
export const VALID_EXPENSE_TYPES = ["Toll", "Other"];

export function badRequest(message) {
  return { status: 400, message };
}

export function notFound(message) {
  return { status: 404, message };
}

export function parseFloatValue(value, fieldName) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw badRequest(`${fieldName} must be a number`);
  }
  return parsed;
}

export function parseDateValue(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${fieldName} must be a valid date`);
  }
  return date;
}

export function normalizeStatus(value, allowedValues, fieldName) {
  if (!value) return undefined;
  if (!allowedValues.includes(value)) {
    throw badRequest(`${fieldName} must be one of [${allowedValues.join(", ")}]`);
  }
  return value;
}

export function serializeVehicle(vehicle) {
  return {
    id: vehicle.id,
    regNo: vehicle.regNo,
    nameModel: vehicle.nameModel,
    type: vehicle.type,
    maxCapacityKg: vehicle.maxCapacityKg,
    capacity: vehicle.maxCapacityKg,
    odometer: vehicle.odometer,
    acquisitionCost: vehicle.acquisitionCost,
    region: vehicle.region,
    status: vehicle.status,
    deletedAt: vehicle.deletedAt,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  };
}

export function serializeDriver(driver) {
  return {
    id: driver.id,
    name: driver.name,
    contact: driver.contact,
    licenseNo: driver.licenseNo,
    licenseCategory: driver.licenseCategory,
    licenseExpiry: driver.licenseExpiry,
    safetyScore: driver.safetyScore,
    status: driver.status,
    deletedAt: driver.deletedAt,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
}

export function serializeTrip(trip) {
  return {
    id: trip.id,
    tripCode: trip.tripCode,
    code: trip.tripCode,
    source: trip.source,
    destination: trip.destination,
    cargoWeightKg: trip.cargoWeightKg,
    plannedDistanceKm: trip.plannedDistanceKm,
    actualDistanceKm: trip.actualDistanceKm,
    revenue: trip.revenue,
    finalOdometer: trip.finalOdometer,
    fuelConsumedLiters: trip.fuelConsumedLiters,
    status: trip.status,
    dispatchedAt: trip.dispatchedAt,
    completedAt: trip.completedAt,
    cancelledAt: trip.cancelledAt,
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    createdById: trip.createdById,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    vehicle: trip.vehicle ? serializeVehicle(trip.vehicle) : null,
    driver: trip.driver ? serializeDriver(trip.driver) : null,
  };
}
