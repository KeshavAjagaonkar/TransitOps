import { prisma } from "../lib/prisma.js";
import { parseFloatValue, VALID_EXPENSE_TYPES } from "../lib/operations.js";

export const fuelController = {
  listFuelLogs: async (req, res, next) => {
    try {
      const records = await prisma.fuelLog.findMany({ orderBy: { createdAt: "desc" }, include: { vehicle: true, trip: true } });
      res.json(records);
    } catch (err) {
      next(err);
    }
  },
  createFuelLog: async (req, res, next) => {
    try {
      const { vehicleId, tripId, date, liters, cost } = req.body;
      if (!vehicleId || !date || liters == null || cost == null) {
        return res.status(400).json({ error: "vehicleId, date, liters and cost are required" });
      }

      const record = await prisma.fuelLog.create({
        data: {
          vehicleId,
          tripId: tripId || null,
          date: new Date(date),
          liters: parseFloatValue(liters, "liters"),
          cost: parseFloatValue(cost, "cost"),
        },
        include: { vehicle: true, trip: true },
      });

      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }
};

export const expenseController = {
  listExpenses: async (req, res, next) => {
    try {
      const records = await prisma.expense.findMany({ orderBy: { createdAt: "desc" }, include: { vehicle: true, trip: true } });
      res.json(records);
    } catch (err) {
      next(err);
    }
  },
  createExpense: async (req, res, next) => {
    try {
      const { vehicleId, tripId, type, amount, date } = req.body;
      if (!vehicleId || !type || amount == null || !date) {
        return res.status(400).json({ error: "vehicleId, type, amount and date are required" });
      }

      if (!VALID_EXPENSE_TYPES.includes(type)) {
        return res.status(400).json({ error: `type must be one of [${VALID_EXPENSE_TYPES.join(", ")}]` });
      }

      const record = await prisma.expense.create({
        data: {
          vehicleId,
          tripId: tripId || null,
          type,
          amount: parseFloatValue(amount, "amount"),
          date: new Date(date),
        },
        include: { vehicle: true, trip: true },
      });

      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }
};
