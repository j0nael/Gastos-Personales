"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionrouter = void 0;
const express_1 = __importDefault(require("express"));
const TransactionController_1 = require("../Controllers/TransactionController");
const AuthMiddleware_1 = require("../Middleware/AuthMiddleware");
exports.transactionrouter = express_1.default.Router();
exports.transactionrouter.post("/", AuthMiddleware_1.authMiddleware, TransactionController_1.createTransaction);
exports.transactionrouter.get("/", AuthMiddleware_1.authMiddleware, TransactionController_1.getTransactions);
exports.transactionrouter.get("/:id", AuthMiddleware_1.authMiddleware, TransactionController_1.getTransactionById);
exports.transactionrouter.put("/:id", AuthMiddleware_1.authMiddleware, TransactionController_1.updateTransaction);
exports.transactionrouter.delete("/:id", AuthMiddleware_1.authMiddleware, TransactionController_1.deleteTransaction);
//# sourceMappingURL=Transactions.js.map