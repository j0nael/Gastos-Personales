"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./Config/env"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
const Auth_1 = require("./Routes/Auth");
const Transactions_1 = require("./Routes/Transactions");
const Users_1 = require("./Routes/Users");
app.use("/auth", Auth_1.authrouter);
app.use("/transactions", Transactions_1.transactionrouter);
app.use("/users", Users_1.usersrouter);
mongoose_1.default.connect(env_1.default.MONGO_URI)
    .then(() => console.log("Conectado a MongoDB"))
    .catch((err) => console.error("Error al conectar a MongoDB:", err));
exports.default = app;
//# sourceMappingURL=server.js.map