import express from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import vehicleRouter from "./routes/vehicle-route";
import driverRouter from "./routes/driver-route";
import tripRouter from "./routes/trip-route";
import maintenanceRouter from "./routes/maintainance-route";
import fuelExpenseRouter from "./routes/fuel-expenses-route";
import reportsRouter from "./routes/reports-route";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.use("api/vehicles", vehicleRouter);
app.use("api/drivers", driverRouter);
app.use("api/trips", tripRouter);
app.use("api/maintenance", maintenanceRouter);
app.use("api/fuel-expenses", fuelExpenseRouter);
app.use("api/reports", reportsRouter);

app.get("/", (req, res) => {
  res.json(`Welcome to the TransitOps backend website - Hacker !!
        Congo To catch the Project backend route 👏🏻👏🏻👏🏻👏🏻
      `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});