import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
    },
    password: {
        type: String,
        required: false, // Not required for Google OAuth users
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
        default: null,
        sparse: true,
    },
    profilePicture: {
        type: String,
        default: null,
    },
});

const userModel = mongoose.model('users', userSchema);

export default userModel;
