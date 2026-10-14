import userModel from '../../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import envConfig from '../../../config/env.config.js';

export async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'username, email and password are required',
            });
        }

        const usernameExists = await userModel.findOne({ username });

        if (usernameExists) {
            return res.status(400).json({
                message: 'username already exists',
            });
        }

        const emailExists = await userModel.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                message: 'user already exists with this email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: 'user registration successfull',
            data: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.log('Error registering user', err);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'email and password both are required for login',
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'No user exists with this email',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Entered password is incorrect',
            });
        }

        const token = jwt.sign({ id: user._id }, envConfig.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token);

        return res.status(200).json({
            message: 'Login successfull',
            data: {
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.log('Error logging In', err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}
