import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV == 'production';

if (!process.env.DATABASE_URL) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: DATABASE_URL');
}

if (!process.env.JWT_SECRET) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: JWT_SECRET');
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: GOOGLE_CLIENT_ID');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: GOOGLE_CLIENT_SECRET');
}

if (!process.env.GOOGLE_CALLBACK_URL) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: GOOGLE_CALLBACK_URL');
}

if (!process.env.CLIENT_URL) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: CLIENT_URL');
}

const envConfig = {
    //  Server configuration keys
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    IS_PRODUCTION: isProduction,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',

    // Client URL
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default envConfig;
