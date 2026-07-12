import { prisma } from "../lib/prisma.js";

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export async function getDashboardKpis(req, res, next) {
  try {
    const [vehicles, drivers, trips] = await Promise.all([
      prisma.vehicle.findMany({ where: { deletedAt: null } }),
      prisma.driver.findMany({ where: { deletedAt: null } }),
      prisma.trip.findMany(),
    ]);

    const activeVehicles = vehicles.filter((vehicle) => vehicle.status === "Available" || vehicle.status === "OnTrip").length;
    const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "Available").length;
    const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === "InShop").length;
    const activeTrips = trips.filter((trip) => trip.status === "Dispatched").length;
    const pendingTrips = trips.filter((trip) => trip.status === "Draft").length;
    const driversOnDuty = drivers.filter((driver) => driver.status === "OnTrip" || driver.status === "Available").length;
    const utilization = vehicles.length ? formatPercent((activeVehicles / vehicles.length) * 100) : "0%";

    res.json([
      { label: "ACTIVE VEHICLES", value: String(activeVehicles).padStart(2, "0"), border: "border-l-4 border-l-blue-500" },
      { label: "AVAILABLE VEHICLES", value: String(availableVehicles).padStart(2, "0"), border: "border-l-4 border-l-green-500" },
      { label: "VEHICLES IN MAINTENANCE", value: String(maintenanceVehicles).padStart(2, "0"), border: "border-l-4 border-l-amber-500" },
      { label: "ACTIVE TRIPS", value: String(activeTrips).padStart(2, "0"), border: "border-l-4 border-l-sky-500" },
      { label: "PENDING TRIPS", value: String(pendingTrips).padStart(2, "0"), border: "border-l-4 border-l-indigo-500" },
      { label: "DRIVERS ON DUTY", value: String(driversOnDuty).padStart(2, "0"), border: "border-l-4 border-l-emerald-500" },
      { label: "FLEET UTILIZATION", value: utilization, border: "border-l-4 border-l-purple-500" },
    ]);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleCostReport(req, res, next) {
  try {
    const [vehicles, maintenanceLogs, fuelLogs, expenses] = await Promise.all([
      prisma.vehicle.findMany({ where: { deletedAt: null } }),
      prisma.maintenanceLog.findMany(),
      prisma.fuelLog.findMany(),
      prisma.expense.findMany(),
    ]);

    console.log('maintenanceLogs total rows:', maintenanceLogs.length, maintenanceLogs.slice(0, 3))
    console.log('fuelLogs total rows:', fuelLogs.length, fuelLogs.slice(0, 3))
    console.log('expenses total rows:', expenses.length, expenses.slice(0, 3))
    console.log('vehicle ids:', vehicles.map(v => v.id))

    const rows = vehicles.map((vehicle) => {
      const vehicleMaintenance = maintenanceLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.cost, 0);
      const vehicleFuel = fuelLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.cost, 0);
      const vehicleExpenses = expenses.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.amount, 0);

      return {
        vehicleId: vehicle.id,
        regNo: vehicle.regNo,
        nameModel: vehicle.nameModel,
        maintenanceCost: vehicleMaintenance,
        fuelCost: vehicleFuel,
        expenseCost: vehicleExpenses,
        totalCost: vehicleMaintenance + vehicleFuel + vehicleExpenses,
      };
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function exportVehicleCostCsv(req, res, next) {
  try {
    const rows = await getVehicleCostRows();
    const csv = [
      ["regNo", "nameModel", "maintenanceCost", "fuelCost", "expenseCost", "totalCost"].join(","),
      ...rows.map((row) => [row.regNo, row.nameModel, row.maintenanceCost, row.fuelCost, row.expenseCost, row.totalCost].join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=vehicle-cost-report.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getVehicleCostRows() {
  const [vehicles, maintenanceLogs, fuelLogs, expenses] = await Promise.all([
    prisma.vehicle.findMany({ where: { deletedAt: null } }),
    prisma.maintenanceLog.findMany(),
    prisma.fuelLog.findMany(),
    prisma.expense.findMany(),
  ]);

  return vehicles.map((vehicle) => {
    const maintenanceCost = maintenanceLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.cost, 0);
    const fuelCost = fuelLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.cost, 0);
    const expenseCost = expenses.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + entry.amount, 0);

    return {
      vehicleId: vehicle.id,
      regNo: vehicle.regNo,
      nameModel: vehicle.nameModel,
      maintenanceCost,
      fuelCost,
      expenseCost,
      totalCost: maintenanceCost + fuelCost + expenseCost,
    };
  });
}
