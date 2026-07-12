
import {Router} from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import * as reportsController from "../controllers/reports-controller.js";

const reportsRouter = Router();

reportsRouter.use(authMiddleware);
 
reportsRouter.get("/dashboard/kpis", reportsController.getDashboardKpis);
 
reportsRouter.get(
  "/vehicle-costs",
  requireRole("FinancialAnalyst", "FleetManager"),
  reportsController.getVehicleCostReport
);
reportsRouter.get(
  "/vehicle-costs/export.csv",
  requireRole("FinancialAnalyst", "FleetManager"),
  reportsController.exportVehicleCostCsv
);

export default reportsRouter;