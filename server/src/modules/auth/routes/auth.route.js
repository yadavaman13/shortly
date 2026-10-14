import express from 'express';
import { registerUser } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @desc user registration
 * @access Private
 */
authRouter.post('/register', registerUser);

export default authRouter;
