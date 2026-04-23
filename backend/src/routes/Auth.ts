import express from "express";
import { register, login, getProfile, updateProfile } from "../Controllers/AuthController";
import { authMiddleware } from "../Middleware/AuthMiddleware";

export const authrouter = express.Router();

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.get("/profile", authMiddleware, getProfile);
authrouter.put("/profile", authMiddleware, updateProfile);