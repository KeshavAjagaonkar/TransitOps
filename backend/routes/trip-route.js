
import {Router} from "express";

const tripRouter = Router();

tripRouter.use(requireAuth);
 
tripRouter.get("/", tripController.listTrips);
tripRouter.get("/:id", tripController.getTrip);
 
// Drivers create/manage trips per the spec ("Driver: Creates trips...")
tripRouter.post("/", requireRole("Dispatcher", "Driver", "FleetManager"), tripController.createTrip);
tripRouter.patch("/:id", requireRole("Dispatcher", "Driver", "FleetManager"), tripController.updateTrip);
tripRouter.post("/:id/dispatch", requireRole("Dispatcher", "Driver", "FleetManager"), tripController.dispatchTrip);
tripRouter.post("/:id/complete", requireRole("Dispatcher", "Driver", "FleetManager"), tripController.completeTrip);
tripRouter.post("/:id/cancel", requireRole("Dispatcher", "Driver", "FleetManager"), tripController.cancelTrip);

export default tripRouter;