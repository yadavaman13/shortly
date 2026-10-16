import express from 'express';
import {
    respondShortenedUrl,
    getAllUrls,
    getUrlById,
    updateUrl,
    deleteUrl,
    redirectUrl,
} from '../controllers/url.controller.js';
import {
    validateCreateUrl,
    validateUpdateUrl,
    validateIdParam,
    validateShortCodeParam,
} from '../../../middleware/validate.middleware.js';
import { createUrlLimiter, redirectLimiter } from '../../../middleware/rateLimit.middleware.js';
import { authUser } from '../../../middleware/auth.middleware.js';
import { shortenUrl } from '../../../middleware/shortenUrl.middleware.js';

const urlRouter = express.Router();

/**
 * @route   POST /api/url
 * @desc    Create a shortened URL
 * @access  Protected
 * @rateLimit 10 requests/minute per IP
 * @pipeline validate → shortenUrl middleware → respond
 */
urlRouter.post('/', authUser, createUrlLimiter, validateCreateUrl, shortenUrl(), respondShortenedUrl);

/**
 * @route   GET /api/url
 * @desc    Get all shortened URLs
 * @access  Public
 */
urlRouter.get('/', authUser, getAllUrls);

/**
 * @route   GET /api/url/redirect/:shortCode
 * @desc    Redirect to the original URL by short code
 * @access  Public
 * @rateLimit 60 requests/minute per IP
 */
urlRouter.get('/redirect/:shortCode', authUser, redirectLimiter, validateShortCodeParam, redirectUrl);

/**
 * @route   GET /api/url/:id
 * @desc    Get a single URL by MongoDB ID or short code
 * @access  Public
 */
urlRouter.get('/:id', authUser, validateIdParam, getUrlById);

/**
 * @route   PATCH /api/url/:id
 * @desc    Update destination originalUrl (Resilient QR)
 * @access  Protected
 */
urlRouter.patch('/:id', authUser, validateUpdateUrl, updateUrl);

/**
 * @route   DELETE /api/url/:id
 * @desc    Delete a URL by MongoDB ID or short code
 * @access  Public
 */
urlRouter.delete('/:id', authUser, validateIdParam, deleteUrl);

export default urlRouter;
