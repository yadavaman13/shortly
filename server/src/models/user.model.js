import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'password is required'],
    },
    email: {
        type: String,
        required: [true, 'password is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
});

const userModel = mongoose.model('users', userSchema);

export default userModel;
