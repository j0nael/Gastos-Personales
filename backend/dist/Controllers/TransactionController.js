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
exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.createTransaction = void 0;
const Transaction_1 = __importDefault(require("../Models/Transaction"));
const User_1 = __importDefault(require("../Models/User"));
const Enums_1 = require("../Models/Enums");
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, category, type } = req.body;
        if (type === Enums_1.type_transaction.income) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: amount } });
        }
        else if (type === Enums_1.type_transaction.expense) {
            const user = yield User_1.default.findById(req.userId);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
        }
        const transaction = new Transaction_1.default({
            user: req.userId,
            amount,
            category,
            type
        });
        yield transaction.save();
        res.status(201).json(transaction);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al crear transacción" });
    }
});
exports.createTransaction = createTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, startDate, endDate, category, type } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;
        const filter = { user: req.userId };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }
        if (category) {
            filter.category = category;
        }
        if (type) {
            filter.type = type;
        }
        const [transactions, total] = yield Promise.all([
            Transaction_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Transaction_1.default.countDocuments(filter)
        ]);
        const result = {
            data: transactions,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        };
        res.json(result);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al obtener transacciones" });
    }
});
exports.getTransactions = getTransactions;
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield Transaction_1.default.findOne({ _id: req.params.id, user: req.userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }
        res.json(transaction);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al obtener transacción" });
    }
});
exports.getTransactionById = getTransactionById;
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, category, type } = req.body;
        const oldTransaction = yield Transaction_1.default.findOne({ _id: req.params.id, user: req.userId });
        if (!oldTransaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }
        if (oldTransaction.type === Enums_1.type_transaction.income) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: -oldTransaction.amount } });
        }
        else if (oldTransaction.type === Enums_1.type_transaction.expense) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: oldTransaction.amount } });
        }
        if (type === Enums_1.type_transaction.income) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: amount } });
        }
        else if (type === Enums_1.type_transaction.expense) {
            const user = yield User_1.default.findById(req.userId);
            if (!user || user.balance < amount) {
                return res.status(400).json({ message: "Saldo insuficiente" });
            }
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
        }
        const transaction = yield Transaction_1.default.findByIdAndUpdate(req.params.id, { amount, category, type }, { new: true });
        res.json(transaction);
    }
    catch (_a) {
        res.status(500).json({ message: "Error al actualizar transacción" });
    }
});
exports.updateTransaction = updateTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield Transaction_1.default.findOne({ _id: req.params.id, user: req.userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }
        if (transaction.type === Enums_1.type_transaction.income) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: -transaction.amount } });
        }
        else if (transaction.type === Enums_1.type_transaction.expense) {
            yield User_1.default.findByIdAndUpdate(req.userId, { $inc: { balance: transaction.amount } });
        }
        yield Transaction_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Transacción eliminada" });
    }
    catch (_a) {
        res.status(500).json({ message: "Error al eliminar transacción" });
    }
});
exports.deleteTransaction = deleteTransaction;
//# sourceMappingURL=TransactionController.js.map