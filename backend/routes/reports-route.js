
import {Router} from "express";
import { authMiddleware } from "../middleware/auth";

const reportsRouter = Router();


reportsRouter.use(authMiddleware);
 
reportsRouter.get("/dashboard/kpis", reportsController.getDashboardKpis);
 
reportsRouter.get(
  "/reports/vehicle-costs",
  requireRole("FinancialAnalyst", "FleetManager"),
  reportsController.getVehicleCostReport
);
reportsRouter.get(
  "/reports/vehicle-costs/export.csv",
  requireRole("FinancialAnalyst", "FleetManager"),
  reportsController.exportVehicleCostCsv
);


export default reportsRouter;