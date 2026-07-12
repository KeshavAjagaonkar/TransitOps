
import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import * as vehicleController from "../controllers/vehicle-controller.js";

const vehicleRouter = Router();

vehicleRouter.use(authMiddleware);

vehicleRouter.get("/", vehicleController.listVehicles);
vehicleRouter.get("/:id", vehicleController.getVehicle);
vehicleRouter.post("/", requireRole("FleetManager"), vehicleController.createVehicle);
vehicleRouter.patch("/:id", requireRole("FleetManager"), vehicleController.updateVehicle);
vehicleRouter.delete("/:id", requireRole("FleetManager"), vehicleController.deleteVehicle);

export default vehicleRouter;