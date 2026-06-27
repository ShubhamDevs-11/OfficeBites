const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
            trim: true,
        },
        itemPhoto: {
            type: String,
            required: true,
        },
        itemPrice: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    { timestamps: true },
);

const Menu = mongoose.model("menu", menuSchema);
module.exports = Menu;