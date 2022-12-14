const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    friends: {
        type: [String],
    },
    refreshToken: {
        type: String,
        default: undefined,
    },
    refreshTokenExpiry: {
        type: Number,
        default: undefined,
    },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return;
    try {
        this.password += process.env.PASSWORD_PEPPER;
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePasswords = async function (loginPassword) {
    try {
        return await bcrypt.compare(loginPassword, this.password);
    } catch (error) {
        throw new Error(error.message);
    }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
