import { prisma } from "../lib/prisma.js";
import { badRequest, parseFloatValue, VALID_MAINTENANCE_STATUSES } from "../lib/operations.js";

export async function listMaintenance(req, res, next) {
  try {
    const records = await prisma.maintenanceLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
}

export async function createMaintenance(req, res, next) {
  try {
    const { vehicleId, serviceType, cost, date, status } = req.body;

    if (!vehicleId || !serviceType || cost == null || !date) {
      return res.status(400).json({ error: "vehicleId, serviceType, cost and date are required" });
    }

    const created = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId,
          serviceType,
          cost: parseFloatValue(cost, "cost"),
          date: new Date(date),
          status: VALID_MAINTENANCE_STATUSES.includes(status) ? status : "Active",
        },
        include: { vehicle: true },
      });

      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: "InShop" } });
      return log;
    });

    res.status(201).json(created);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function closeMaintenance(req, res, next) {
  try {
    const maintenance = await prisma.maintenanceLog.findUnique({ where: { id: req.params.id }, include: { vehicle: true } });
    if (!maintenance) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.update({
        where: { id: maintenance.id },
        data: { status: "Completed" },
        include: { vehicle: true },
      });

      await tx.vehicle.update({ where: { id: maintenance.vehicleId }, data: { status: "Available" } });
      return log;
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
