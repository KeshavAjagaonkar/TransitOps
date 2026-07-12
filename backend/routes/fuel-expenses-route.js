
import {Router} from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { fuelController, expenseController } from "../controllers/fuel-expense-controller.js";

const fuelExpenseRouter = Router();

fuelExpenseRouter.use(authMiddleware);
 
fuelExpenseRouter.get("/fuel-logs", fuelController.listFuelLogs);
fuelExpenseRouter.post("/fuel-logs", requireRole("FleetManager", "Driver"), fuelController.createFuelLog);
 
fuelExpenseRouter.get("/expenses", expenseController.listExpenses);
fuelExpenseRouter.post("/expenses", requireRole("FleetManager", "Driver"), expenseController.createExpense);

export default fuelExpenseRouter;