
import {Router} from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import * as maintenanceController from "../controllers/maintenance-controller.js";

const maintenanceRouter = Router();

maintenanceRouter.use(authMiddleware);
 
maintenanceRouter.get("/", maintenanceController.listMaintenance);
maintenanceRouter.post("/", requireRole("FleetManager"), maintenanceController.createMaintenance);
maintenanceRouter.patch("/:id/close", requireRole("FleetManager"), maintenanceController.closeMaintenance);

export default maintenanceRouter;