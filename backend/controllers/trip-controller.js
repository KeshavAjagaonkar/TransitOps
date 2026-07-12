import { prisma } from "../lib/prisma.js";
import {
  badRequest,
  normalizeStatus,
  parseFloatValue,
  serializeTrip,
  VALID_TRIP_STATUSES,
} from "../lib/operations.js";

async function nextTripCode() {
  const count = await prisma.trip.count();
  return `TR${String(count + 1).padStart(3, "0")}`;
}

async function findTripOr404(id, res) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });

  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return null;
  }

  return trip;
}

export async function listTrips(req, res, next) {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true, driver: true },
    });
    res.json(trips.map(serializeTrip));
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await findTripOr404(req.params.id, res);
    if (!trip) return;
    res.json(serializeTrip(trip));
  } catch (err) {
    next(err);
  }
}

export async function createTrip(req, res, next) {
  try {
    const { source, destination, cargoWeightKg, plannedDistanceKm, vehicleId, driverId, status } = req.body;

    if (!source || !destination || cargoWeightKg == null || plannedDistanceKm == null) {
      return res.status(400).json({ error: "source, destination, cargoWeightKg and plannedDistanceKm are required" });
    }

    const created = await prisma.trip.create({
      data: {
        tripCode: await nextTripCode(),
        source,
        destination,
        cargoWeightKg: parseFloatValue(cargoWeightKg, "cargoWeightKg"),
        plannedDistanceKm: parseFloatValue(plannedDistanceKm, "plannedDistanceKm"),
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        createdById: req.user.id,
        status: normalizeStatus(status, VALID_TRIP_STATUSES, "status") ?? "Draft",
      },
      include: { vehicle: true, driver: true },
    });

    res.status(201).json(serializeTrip(created));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = await findTripOr404(req.params.id, res);
    if (!trip) return;

    const data = {};
    const { source, destination, cargoWeightKg, plannedDistanceKm, vehicleId, driverId, status } = req.body;

    if (source != null) data.source = source;
    if (destination != null) data.destination = destination;
    if (cargoWeightKg != null) data.cargoWeightKg = parseFloatValue(cargoWeightKg, "cargoWeightKg");
    if (plannedDistanceKm != null) data.plannedDistanceKm = parseFloatValue(plannedDistanceKm, "plannedDistanceKm");
    if (vehicleId !== undefined) data.vehicleId = vehicleId || null;
    if (driverId !== undefined) data.driverId = driverId || null;
    if (status != null) data.status = normalizeStatus(status, VALID_TRIP_STATUSES, "status");

    const updated = await prisma.trip.update({
      where: { id: trip.id },
      data,
      include: { vehicle: true, driver: true },
    });

    res.json(serializeTrip(updated));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function dispatchTrip(req, res, next) {
  try {
    const trip = await findTripOr404(req.params.id, res);
    if (!trip) return;

    const updated = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "Dispatched", dispatchedAt: new Date() },
      include: { vehicle: true, driver: true },
    });

    res.json(serializeTrip(updated));
  } catch (err) {
    next(err);
  }
}

export async function completeTrip(req, res, next) {
  try {
    const trip = await findTripOr404(req.params.id, res);
    if (!trip) return;

    const updated = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "Completed", completedAt: new Date() },
      include: { vehicle: true, driver: true },
    });

    res.json(serializeTrip(updated));
  } catch (err) {
    next(err);
  }
}

export async function cancelTrip(req, res, next) {
  try {
    const trip = await findTripOr404(req.params.id, res);
    if (!trip) return;

    const updated = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "Cancelled", cancelledAt: new Date() },
      include: { vehicle: true, driver: true },
    });

    res.json(serializeTrip(updated));
  } catch (err) {
    next(err);
  }
}
