import express from 'express';
import {
    getMeController,
    loginUserController,
    logoutUserController,
    registerUserController,
} from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../../../middleware/validate.middleware.js';

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @desc user registration
 * @access Private
 */
authRouter.post('/register', validateRegister, registerUserController);

/**
 * @route POST /api/auth/login
 * @desc user login
 * @access Private
 */
authRouter.post('/login', validateLogin, loginUserController);

/**
 * @route POST /api/auth/logout
 * @desc logout
 * @access Private
 */
authRouter.post('/logout', logoutUserController);

/**
 * @route POST /api/auth/me
 * @desc getme
 * @access Private
 */
authRouter.get('/me', getMeController);

export default authRouter;
