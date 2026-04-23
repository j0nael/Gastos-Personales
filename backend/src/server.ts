import "source-map-support/register";
import morgan from "morgan";
import express from "express";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

import { taskrouter } from "./Routes/tasks";

app.use("/tasks",taskrouter);

export default app;