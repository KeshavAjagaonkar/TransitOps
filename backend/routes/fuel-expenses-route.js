
import {Router} from "express";
import { authMiddleware } from "../middleware/auth";

const fuelExpenseRouter = Router();


fuelExpenseRouter.use(authMiddleware);
 
fuelExpenseRouter.get("/fuel-logs", fuelController.listFuelLogs);
fuelExpenseRouter.post("/fuel-logs", requireRole("FleetManager", "Driver"), fuelController.createFuelLog);
 
fuelExpenseRouter.get("/expenses", expenseController.listExpenses);
fuelExpenseRouter.post("/expenses", requireRole("FleetManager", "Driver"), expenseController.createExpense);


export default fuelExpenseRouter;