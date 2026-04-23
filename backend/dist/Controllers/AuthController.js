"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../Models/User"));
const env_1 = __importDefault(require("../Config/env"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está registrado" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({ name, email, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    }
    catch (_a) {
        res.status(500).json({ message: "Error al registrar usuario" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, env_1.default.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance } });
    }
    catch (_a) {
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al obtener perfil" });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        const user = yield User_1.default.findByIdAndUpdate(req.userId, { name, email }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
});
exports.updateProfile = updateProfile;
//# sourceMappingURL=AuthController.js.map