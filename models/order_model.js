const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        items: [
            {
                itemName: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity must be at least 1"],
                },
                price: {
                    type: Number,
                    required: true,
                    min: [0, "Price cannot be negative"],
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total amount cannot be negative"],
        },
        office: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "office",
            required: true,
        },
        deliveryAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        deliveredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;