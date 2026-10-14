import userModel from '../../../models/user.model.js';
import bcrypt from 'bcrypt';

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
            message: "Internal Server Error"
        })
    }
}
