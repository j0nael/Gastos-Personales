import express from "express";

export const taskrouter = express.Router();

taskrouter.get("/", (req, res) =>{
    res.json("probando");
})
