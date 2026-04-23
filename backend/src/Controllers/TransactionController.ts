import { Response } from "express";
import Transaction from "../Models/Transaction";
import User from "../Models/User";
import { category_transaction, type_transaction } from "../Models/Enums";
import { AuthRequest } from "../Middleware/AuthMiddleware";

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, type } = req.body;

    if (type === type_transaction.income) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: amount } });
    } else if (type === type_transaction.expense) {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
    }

    const transaction = new Transaction({
      user: req.userId,
      amount,
      category,
      type
    });
    await transaction.save();

    res.status(201).json(transaction);
  } catch {
    res.status(500).json({ message: "Error al crear transacción" });
  }
};

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, category, type } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { user: req.userId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, Date>).$lte = end;
      }
    }

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    const result: PaginatedResult<unknown> = {
      data: transactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al obtener transacciones" });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!transaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }
    res.json(transaction);
  } catch {
    res.status(500).json({ message: "Error al obtener transacción" });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, type } = req.body;

    const oldTransaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!oldTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    if (oldTransaction.type === type_transaction.income) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: -oldTransaction.amount } });
    } else if (oldTransaction.type === type_transaction.expense) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: oldTransaction.amount } });
    }

    if (type === type_transaction.income) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: amount } });
    } else if (type === type_transaction.expense) {
      const user = await User.findById(req.userId);
      if (!user || user.balance < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, category, type },
      { new: true }
    );

    res.json(transaction);
  } catch {
    res.status(500).json({ message: "Error al actualizar transacción" });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!transaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    if (transaction.type === type_transaction.income) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: -transaction.amount } });
    } else if (transaction.type === type_transaction.expense) {
      await User.findByIdAndUpdate(req.userId, { $inc: { balance: transaction.amount } });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: "Transacción eliminada" });
  } catch {
    res.status(500).json({ message: "Error al eliminar transacción" });
  }
};