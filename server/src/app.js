import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import urlRouter from './modules/url/routes/url.routes.js';
import { redirectUrl } from './modules/url/controllers/url.controller.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import authRouter from './modules/auth/routes/auth.route.js';

const app = express();

const publicPath = path.join(import.meta.dirname, 'public');

app.use(express.static(publicPath));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(globalLimiter);

// API routes
app.use('/api/url', urlRouter);
app.use('/api/auth', authRouter);

// Short code redirection
app.get('/:shortCode', redirectUrl);

// For SPA
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
    }
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            next();
        }
    });
});

export default app;
