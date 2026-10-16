import urlModel from '../models/url.model.js';
import generateCode from '../utils/generateCode.js';

/**
 * Middleware factory: shortenUrl
 *
 * Reads `req.body.url`, generates a collision-safe 6-char short code,
 * persists the URL record to MongoDB, and attaches the result
 * to `req.shortenedUrl` for downstream controllers.
 *
 * @param {Object} options
 * @param {boolean} [options.qrGenerated=false] - Mark this URL as QR-generated
 *
 * @example
 * // URL shortening route (existing flow):
 * router.post('/', validate, shortenUrl(), respondShortenedUrl);
 *
 * // QR generation route (new flow):
 * router.post('/', validate, shortenUrl({ qrGenerated: true }), createQr);
 */
export function shortenUrl(options = {}) {
    return async (req, res, next) => {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    error: 'Please enter an URL',
                });
            }

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return res.status(400).json({
                    error: 'Please enter a valid URL',
                });
            }

            if (url.length > 2048) {
                return res.status(400).json({
                    error: 'url is too long',
                });
            }

            // Generate collision-safe short code
            let shortCode = generateCode();
            let attempts = 0;
            while (await urlModel.findOne({ shortUrl: shortCode })) {
                shortCode = generateCode();
                attempts++;
                if (attempts > 5) {
                    return res.status(500).json({
                        error: 'Failed to generate unique short code, please try again',
                    });
                }
            }

            // Persist the URL record
            const newUrl = await urlModel.create({
                originalUrl: url.trim(),
                shortUrl: shortCode,
                qrGenerated: options.qrGenerated || false,
            });

            // Attach to request for downstream controllers
            req.shortenedUrl = newUrl;

            next();
        } catch (err) {
            console.error('Error in shortenUrl middleware:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
}
