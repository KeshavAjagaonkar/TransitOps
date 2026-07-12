
import {Router} from "express";

const maintenanceRouter = Router();

maintenanceRouter.use(requireAuth);
 
maintenanceRouter.get("/", maintenanceController.listMaintenance);
maintenanceRouter.post("/", requireRole("FleetManager"), maintenanceController.createMaintenance);
maintenanceRouter.patch("/:id/close", requireRole("FleetManager"), maintenanceController.closeMaintenance);

export default maintenanceRouter;