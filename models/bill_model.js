const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative"],
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending",
        },
        paidAt: {
            type: Date,
            default: null,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        office: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "office",
            required: true,
        },
    },
    { timestamps: true },
);

const Bill = mongoose.model("bill", billSchema);
module.exports = Bill;