import express from "express";
import { userRoutes } from "./routes/user.routes";
import { errorHandler } from "./utils/errorHandler";
export const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/user", userRoutes);
