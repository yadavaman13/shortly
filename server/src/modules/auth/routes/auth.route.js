import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @desc user registration
 * @access Private
 */
authRouter.post('/register', registerUser);

/**
 * @route POST /api/auth/login
 * @desc user login
 * @access Private
 */
authRouter.post('/login', loginUser);

/**
 * @route POST /api/auth/logout
 * @desc logout
 * @access Private
 */
authRouter.post('/logout', logoutUser)

export default authRouter;
