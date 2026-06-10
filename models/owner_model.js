const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ownerSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be proper"],
        },
        password: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
        isVerified: { 
            type: Boolean,
            default: false }
    },
    { timestamps: true },
);

//HASHING PASSWORD
ownerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const hash = await bcrypt.hash(this.password,parseInt(process.env.BCRYPT_SALT_ROUNDS));
    this.password = hash;
    next();
});
//VERIFYING PASSWORD
ownerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

//LOGIN ATTEMPT ,FAILURE AND RESET
ownerSchema.methods.recordLoginFailure = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MS = 15 * 60 * 1000;
    this.loginAttempts += 1;

    if (this.loginAttempts >= MAX_ATTEMPTS) {
        this.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await this.save();
};
ownerSchema.methods.resetLoginAttempts = async function () {
    if (this.loginAttempts !== 0 || this.lockUntil != null) {
        this.loginAttempts = 0;
        this.lockUntil = null;

        await this.save();
    }
};
const owner = mongoose.model("owner", ownerSchema);
module.exports = owner;