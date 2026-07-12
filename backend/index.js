import express from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.get("/", (req, res) => {
  res.json(`Welcome to the TransitOps backend website - Hacker !!
        Congo To catch the Project backend route 👏🏻👏🏻👏🏻👏🏻
      `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});