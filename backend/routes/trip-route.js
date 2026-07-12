
import {Router} from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import * as tripController from "../controllers/trip-controller.js";

const tripRouter = Router();

tripRouter.use(authMiddleware);
 
tripRouter.get("/", tripController.listTrips);
tripRouter.get("/:id", tripController.getTrip);
 
// Drivers create/manage trips per the spec ("Driver: Creates trips...")
tripRouter.post("/", requireRole("Dispatcher", "FleetManager"), tripController.createTrip);
tripRouter.patch("/:id", requireRole("Dispatcher", "FleetManager"), tripController.updateTrip);
tripRouter.post("/:id/dispatch", requireRole("Dispatcher", "FleetManager"), tripController.dispatchTrip);
tripRouter.post("/:id/complete", requireRole("Dispatcher", "FleetManager"), tripController.completeTrip);
tripRouter.post("/:id/cancel", requireRole("Dispatcher", "FleetManager"), tripController.cancelTrip);

export default tripRouter;