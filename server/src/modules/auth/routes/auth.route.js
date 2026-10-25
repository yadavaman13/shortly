import express from 'express';
import {
    getMeController,
    loginUserController,
    logoutUserController,
    registerUserController,
} from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../../../middleware/validate.middleware.js';
import { googleAuthInitiate, googleAuthCallback } from '../controllers/google.controller.js';

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

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth 2.0 login flow
 * @access Public
 */
authRouter.get('/google', googleAuthInitiate);

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback — creates JWT cookie and redirects to client
 * @access Public (called by Google redirect)
 */
authRouter.get('/google/callback', googleAuthCallback);

export default authRouter;

