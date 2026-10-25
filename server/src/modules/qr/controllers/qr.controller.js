import QRCode from 'qrcode';
import envConfig from '../../../config/env.config.js';
import urlModel from '../../../models/url.model.js';

/**
 * POST /api/qr
 * Reads req.shortenedUrl (set by shortenUrl middleware),
 * generates a QR data URL with qrcode, and returns QR metadata.
 */
export async function createQr(req, res) {
    try {
        const newUrl = req.shortenedUrl;
        const serverUrl = envConfig.SERVER_URL.replace(/\/$/, '');
        const fullShortUrl = `${serverUrl}/${newUrl.shortUrl}`;

        // The URL to encode in the QR — includes ?ref=qr for scan tracking
        const qrTargetUrl = `${fullShortUrl}?ref=qr`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrTargetUrl, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        return res.status(201).json({
            message: 'QR code created successfully',
            data: {
                id: newUrl._id,
                originalUrl: newUrl.originalUrl,
                shortUrl: newUrl.shortUrl,
                fullShortUrl,
                qrTargetUrl,
                qrCodeDataUrl,
                qrGenerated: true,
                clicks: newUrl.clicks || 0,
                qrScans: newUrl.qrScans || 0,
                createdAt: newUrl.createdAt,
            },
        });
    } catch (err) {
        console.error('Error in createQr controller:', err);
        return res.status(500).json({ error: 'Failed to generate QR code' });
    }
}

/**
 * GET /api/qr
 * Returns all URLs that were created via the QR flow.
 */
export async function getAllQrUrls(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
        }

        const urls = await urlModel
            .find({ user: userId, qrGenerated: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'QR URLs fetched successfully',
            data: { urls },
        });
    } catch (err) {
        console.error('Error fetching QR URLs:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
