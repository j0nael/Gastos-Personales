import express from "express";
import { authMiddleware, AuthRequest } from "../Middleware/AuthMiddleware";
import User from "../Models/User";
import { Response } from "express";

export const usersrouter = express.Router();

usersrouter.get("/balance", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ balance: user.balance });
  } catch {
    res.status(500).json({ message: "Error al obtener saldo" });
  }
});

usersrouter.get("/details", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
});
