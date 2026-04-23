import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User";
import env from "../Config/env";
import { AuthRequest } from "../Middleware/AuthMiddleware";

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance } });
  } catch {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};