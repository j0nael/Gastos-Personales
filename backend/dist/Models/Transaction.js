"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Enums_1 = require("./Enums");
const transactionSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: Object.values(Enums_1.category_transaction), required: true },
    type: { type: String, enum: Object.values(Enums_1.type_transaction), required: true }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)("Transaction", transactionSchema);
//# sourceMappingURL=Transaction.js.map