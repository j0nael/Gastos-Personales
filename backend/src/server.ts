import "source-map-support/register";
import morgan from "morgan";
import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import env from "./Config/env";
import { authrouter } from "./Routes/Auth";
import { transactionrouter } from "./Routes/Transactions";
import { usersrouter } from "./Routes/Users";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



app.use("/auth", authrouter);
app.use("/transactions", transactionrouter);
app.use("/users", usersrouter);

mongoose.connect(env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

export default app;