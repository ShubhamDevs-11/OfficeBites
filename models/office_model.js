const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema(
    {
        officeName: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        assignedAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null,
        },
    },
    { timestamps: true },
);

const Office = mongoose.model("office", officeSchema);
module.exports = Office;