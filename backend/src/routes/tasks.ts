import express from "express";
import mongoose from "mongoose";
import env from "../Config/env";

export const taskrouter = express.Router();

taskrouter.get("/", async (req, res) =>{
    try
    {
        await mongoose.connect(env.MONGO_URI);
        res.json("funciono bien");
    }
    catch
    {
        res.status(500).json("Fallo")
        console.log("Falle");
    }
})
