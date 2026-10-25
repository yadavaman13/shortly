import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/user.model.js';
import envConfig from './env.config.js';

export function initializePassport() {
    // Only configure Google strategy if credentials are present
    if (!envConfig.GOOGLE_CLIENT_ID || !envConfig.GOOGLE_CLIENT_SECRET) {
        console.warn('Google OAuth credentials not configured. Google login will be disabled.');
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: envConfig.GOOGLE_CLIENT_ID,
                clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
                callbackURL: envConfig.GOOGLE_CALLBACK_URL,
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error('No email found in Google profile'), null);
                    }

                    // Check if a user with this googleId already exists
                    let user = await userModel.findOne({ googleId: profile.id });

                    if (user) {
                        // Returning Google user — update profile picture if changed
                        if (profile.photos?.[0]?.value && user.profilePicture !== profile.photos[0].value) {
                            user.profilePicture = profile.photos[0].value;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Check if a user with same email exists (registered via local)
                    user = await userModel.findOne({ email });

                    if (user) {
                        // Link Google account to existing local user
                        user.googleId = profile.id;
                        user.authProvider = 'google';
                        if (profile.photos?.[0]?.value) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create a brand new user from Google profile
                    const newUser = await userModel.create({
                        username: profile.displayName || email.split('@')[0],
                        email,
                        googleId: profile.id,
                        authProvider: 'google',
                        profilePicture: profile.photos?.[0]?.value || null,
                    });

                    return done(null, newUser);
                } catch (err) {
                    return done(err, null);
                }
            },
        ),
    );
}
