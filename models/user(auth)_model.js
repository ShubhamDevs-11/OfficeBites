const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be proper"],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "client", "deliveryAgent"],
            required: true,
        },
        companyName: {
            type: String,
            default: null,
        },
        office: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "office",
            default: null,
        },
        phone: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
            trim: true,
        },

        // shared
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: false,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

// HASHING PASSWORD
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// VERIFYING PASSWORD
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// RECORD LOGIN FAILURE
userSchema.methods.recordLoginFailure = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MS = 15 * 60 * 1000;
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_ATTEMPTS) {
        this.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
    await this.save();
};

// RESET LOGIN ATTEMPTS
userSchema.methods.resetLoginAttempts = async function () {
    if (this.loginAttempts !== 0 || this.lockUntil != null) {
        this.loginAttempts = 0;
        this.lockUntil = null;
        await this.save();
    }
};

const User = mongoose.model("user", userSchema);
module.exports = User;