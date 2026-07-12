import { prisma } from "../lib/prisma.js";
import {
  badRequest,
  normalizeStatus,
  parseDateValue,
  parseFloatValue,
  serializeDriver,
  VALID_DRIVER_STATUSES,
  VALID_LICENSE_CATEGORIES,
} from "../lib/operations.js";

async function findDriverOr404(id, res) {
  const driver = await prisma.driver.findFirst({ where: { id, deletedAt: null } });
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return null;
  }
  return driver;
}

export async function listDrivers(req, res, next) {
  try {
    const drivers = await prisma.driver.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
    res.json(drivers.map(serializeDriver));
  } catch (err) {
    next(err);
  }
}

export async function getDispatchPool(req, res, next) {
  try {
    const drivers = await prisma.driver.findMany({
      where: { deletedAt: null, status: "Available" },
      orderBy: { createdAt: "desc" },
    });
    res.json(drivers.map(serializeDriver));
  } catch (err) {
    next(err);
  }
}

export async function getExpiringLicenses(req, res, next) {
  try {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + 3);

    const drivers = await prisma.driver.findMany({
      where: {
        deletedAt: null,
        licenseExpiry: { lte: threshold },
      },
      orderBy: { licenseExpiry: "asc" },
    });

    res.json(drivers.map(serializeDriver));
  } catch (err) {
    next(err);
  }
}

export async function getDriver(req, res, next) {
  try {
    const driver = await findDriverOr404(req.params.id, res);
    if (!driver) return;
    res.json(serializeDriver(driver));
  } catch (err) {
    next(err);
  }
}

export async function createDriver(req, res, next) {
  try {
    const { name, contact, licenseNo, licenseCategory, licenseExpiry, safetyScore, status } = req.body;

    if (!name || !contact || !licenseNo || !licenseCategory || !licenseExpiry) {
      return res.status(400).json({ error: "name, contact, licenseNo, licenseCategory and licenseExpiry are required" });
    }

    if (!VALID_LICENSE_CATEGORIES.includes(licenseCategory)) {
      throw badRequest(`licenseCategory must be one of [${VALID_LICENSE_CATEGORIES.join(", ")}]`);
    }

    const created = await prisma.driver.create({
      data: {
        name,
        contact,
        licenseNo,
        licenseCategory,
        licenseExpiry: parseDateValue(licenseExpiry, "licenseExpiry"),
        safetyScore: safetyScore != null ? Math.max(0, Math.min(100, Number.parseInt(safetyScore, 10))) : 100,
        status: normalizeStatus(status, VALID_DRIVER_STATUSES, "status") ?? "Available",
      },
    });

    res.status(201).json(serializeDriver(created));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function updateDriver(req, res, next) {
  try {
    const driver = await findDriverOr404(req.params.id, res);
    if (!driver) return;

    const data = {};
    const { name, contact, licenseNo, licenseCategory, licenseExpiry, safetyScore, status } = req.body;

    if (name != null) data.name = name;
    if (contact != null) data.contact = contact;
    if (licenseNo != null) data.licenseNo = licenseNo;
    if (licenseCategory != null) {
      if (!VALID_LICENSE_CATEGORIES.includes(licenseCategory)) throw badRequest(`licenseCategory must be one of [${VALID_LICENSE_CATEGORIES.join(", ")}]`);
      data.licenseCategory = licenseCategory;
    }
    if (licenseExpiry != null) data.licenseExpiry = parseDateValue(licenseExpiry, "licenseExpiry");
    if (safetyScore != null) data.safetyScore = Math.max(0, Math.min(100, Number.parseInt(safetyScore, 10)));
    if (status != null) data.status = normalizeStatus(status, VALID_DRIVER_STATUSES, "status");

    const updated = await prisma.driver.update({ where: { id: driver.id }, data });
    res.json(serializeDriver(updated));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function updateDriverStatus(req, res, next) {
  try {
    const driver = await findDriverOr404(req.params.id, res);
    if (!driver) return;

    const { status } = req.body;
    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { status: normalizeStatus(status, VALID_DRIVER_STATUSES, "status") },
    });

    res.json(serializeDriver(updated));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

export async function deleteDriver(req, res, next) {
  try {
    const driver = await findDriverOr404(req.params.id, res);
    if (!driver) return;

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { deletedAt: new Date(), status: "OffDuty" },
    });

    res.json(serializeDriver(updated));
  } catch (err) {
    next(err);
  }
}
