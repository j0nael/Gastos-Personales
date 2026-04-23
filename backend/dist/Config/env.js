"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "default_secret_key"
};
if (!env.MONGO_URI) {
    throw new Error("MONGO_URI no está definida en el .env");
}
exports.default = env;
//# sourceMappingURL=env.js.map