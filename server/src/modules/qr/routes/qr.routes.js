import express from 'express';
import { createQr, getAllQrUrls } from '../controllers/qr.controller.js';
import { validateCreateUrl } from '../../../middleware/validate.middleware.js';
import { shortenUrl } from '../../../middleware/shortenUrl.middleware.js';
import { createUrlLimiter } from '../../../middleware/rateLimit.middleware.js';
import { authUser } from '../../../middleware/auth.middleware.js';

const qrRouter = express.Router();

/**
 * POST /api/qr
 * Pipeline: auth → rate limit → validate URL → shorten (middleware) → QR controller
 *
 * The shortenUrl middleware auto-creates the short code and persists the URL
 * record with qrGenerated: true before the QR controller runs.
 */
qrRouter.post(
    '/',
    authUser,
    createUrlLimiter,
    validateCreateUrl,
    shortenUrl({ qrGenerated: true }),
    createQr,
);

/**
 * GET /api/qr
 * Returns all URLs created through the QR flow.
 */
qrRouter.get('/', authUser, getAllQrUrls);

export default qrRouter;
