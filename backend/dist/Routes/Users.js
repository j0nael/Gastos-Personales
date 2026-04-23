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
exports.usersrouter = void 0;
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../Middleware/AuthMiddleware");
const User_1 = __importDefault(require("../Models/User"));
exports.usersrouter = express_1.default.Router();
exports.usersrouter.get("/balance", AuthMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ balance: user.balance });
    }
    catch (_a) {
        res.status(500).json({ message: "Error al obtener saldo" });
    }
}));
exports.usersrouter.get("/details", AuthMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al obtener el usuario" });
    }
}));
//# sourceMappingURL=Users.js.map