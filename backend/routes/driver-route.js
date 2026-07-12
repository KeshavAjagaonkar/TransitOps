
import {Router} from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import * as driverController from "../controllers/driver-controller.js";

const driverRouter = Router();

driverRouter.use(authMiddleware);
 
driverRouter.get("/", driverController.listDrivers);
driverRouter.get("/dispatch-pool", driverController.getDispatchPool);
driverRouter.get("/expiring-licenses", requireRole("SafetyOfficer", "FleetManager"), driverController.getExpiringLicenses);
driverRouter.get("/:id", driverController.getDriver);
 
driverRouter.post("/", requireRole("FleetManager"), driverController.createDriver);
driverRouter.patch("/:id", requireRole("FleetManager"), driverController.updateDriver);
driverRouter.patch("/:id/status", requireRole("SafetyOfficer"), driverController.updateDriverStatus);
driverRouter.delete("/:id", requireRole("FleetManager"), driverController.deleteDriver);

export default driverRouter;