"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authrouter = void 0;
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../Controllers/AuthController");
const AuthMiddleware_1 = require("../Middleware/AuthMiddleware");
exports.authrouter = express_1.default.Router();
exports.authrouter.post("/register", AuthController_1.register);
exports.authrouter.post("/login", AuthController_1.login);
exports.authrouter.get("/profile", AuthMiddleware_1.authMiddleware, AuthController_1.getProfile);
exports.authrouter.put("/profile", AuthMiddleware_1.authMiddleware, AuthController_1.updateProfile);
//# sourceMappingURL=Auth.js.map