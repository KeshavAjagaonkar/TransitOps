import { prisma } from "../lib/prisma.js";
import {
  badRequest,
  notFound,
  normalizeStatus,
  parseFloatValue,
  serializeVehicle,
  VALID_VEHICLE_STATUSES,
  VALID_VEHICLE_TYPES,
} from "../lib/operations.js";

function toVehicleWhere() {
  return { deletedAt: null };
}

export async function listVehicles(req, res, next) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: toVehicleWhere(),
      orderBy: { createdAt: "desc" },
    });

    res.json(vehicles.map(serializeVehicle));
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(serializeVehicle(vehicle));
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(req, res, next) {
  try {
    const { regNo, nameModel, type, maxCapacityKg, odometer = 0, acquisitionCost, region, status } = req.body;

    if (!regNo || !nameModel || !type || acquisitionCost == null || maxCapacityKg == null) {
      return res.status(400).json({ error: "regNo, nameModel, type, maxCapacityKg and acquisitionCost are required" });
    }

    if (!VALID_VEHICLE_TYPES.includes(type)) {
      throw badRequest(`type must be one of [${VALID_VEHICLE_TYPES.join(", ")}]`);
    }

    const normalizedStatus = normalizeStatus(status, VALID_VEHICLE_STATUSES, "status") ?? "Available";

    const created = await prisma.vehicle.create({
      data: {
        regNo,
        nameModel,
        type,
        maxCapacityKg: parseFloatValue(maxCapacityKg, "maxCapacityKg"),
        odometer: parseFloatValue(odometer, "odometer"),
        acquisitionCost: parseFloatValue(acquisitionCost, "acquisitionCost"),
        region: region || null,
        status: normalizedStatus,
      },
    });

    res.status(201).json(serializeVehicle(created));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function updateVehicle(req, res, next) {
  try {
    const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: "Vehicle not found" });

    const data = {};
    const { regNo, nameModel, type, maxCapacityKg, odometer, acquisitionCost, region, status } = req.body;

    if (regNo != null) data.regNo = regNo;
    if (nameModel != null) data.nameModel = nameModel;
    if (type != null) {
      if (!VALID_VEHICLE_TYPES.includes(type)) throw badRequest(`type must be one of [${VALID_VEHICLE_TYPES.join(", ")}]`);
      data.type = type;
    }
    if (maxCapacityKg != null) data.maxCapacityKg = parseFloatValue(maxCapacityKg, "maxCapacityKg");
    if (odometer != null) data.odometer = parseFloatValue(odometer, "odometer");
    if (acquisitionCost != null) data.acquisitionCost = parseFloatValue(acquisitionCost, "acquisitionCost");
    if (region != null) data.region = region;
    if (status != null) data.status = normalizeStatus(status, VALID_VEHICLE_STATUSES, "status");

    const updated = await prisma.vehicle.update({ where: { id: existing.id }, data });
    res.json(serializeVehicle(updated));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function deleteVehicle(req, res, next) {
  try {
    const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: "Vehicle not found" });

    const updated = await prisma.vehicle.update({
      where: { id: existing.id },
      data: { deletedAt: new Date(), status: "Retired" },
    });

    res.json(serializeVehicle(updated));
  } catch (err) {
    next(err);
  }
}
