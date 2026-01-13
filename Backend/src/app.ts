import express from "express";
import { userRoutes } from "./routes/user.routes";
import { errorHandler } from "./routes/errorHandler";
export const app = express();

app.use(express.json());
app.use("/user", userRoutes);
app.use(errorHandler);