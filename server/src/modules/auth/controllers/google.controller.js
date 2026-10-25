import passport from 'passport';
import jwt from 'jsonwebtoken';
import envConfig from '../../../config/env.config.js';

/**
 * Initiates the Google OAuth flow.
 * Redirects the user to Google's consent screen.
 */
export function googleAuthInitiate(req, res, next) {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })(req, res, next);
}

/**
 * Handles the callback from Google after user consent.
 * Creates a JWT, sets it as a cookie, and redirects to the client app.
 */
export function googleAuthCallback(req, res, next) {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            console.error('Google OAuth error:', err);
            return res.redirect(
                `${envConfig.CLIENT_URL}/login?error=oauth_failed`,
            );
        }

        // Generate JWT — same format as the existing loginUserController
        const token = jwt.sign(
            { id: user._id },
            envConfig.JWT_SECRET,
            { expiresIn: '7d' },
        );

        // Set the JWT as an httpOnly cookie — matches existing auth flow
        res.cookie('token', token, {
            httpOnly: true,
            secure: envConfig.IS_PRODUCTION,
            sameSite: envConfig.IS_PRODUCTION ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to client-side callback page
        res.redirect(`${envConfig.CLIENT_URL}/auth/callback?success=true`);
    })(req, res, next);
}
