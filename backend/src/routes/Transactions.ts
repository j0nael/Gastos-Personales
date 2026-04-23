import express from "express";
import { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction } from "../Controllers/TransactionController";
import { authMiddleware } from "../Middleware/AuthMiddleware";

export const transactionrouter = express.Router();

transactionrouter.post("/", authMiddleware, createTransaction);
transactionrouter.get("/", authMiddleware, getTransactions);
transactionrouter.get("/:id", authMiddleware, getTransactionById);
transactionrouter.put("/:id", authMiddleware, updateTransaction);
transactionrouter.delete("/:id", authMiddleware, deleteTransaction);