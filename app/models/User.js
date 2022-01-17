import mongoose from 'mongoose';
import validator from 'validator';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is Required'],
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
        },
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.methods.hashPassword = async function () {
    const hash = await argon2.hash(this.password);

    this.password = hash;
};

userSchema.methods.verifyPassword = async function (password) {
    const result = await argon2.verify(this.password, password);

    return result;
};

const User = mongoose.model('User', userSchema);

export default User;
