import { body, param, validationResult } from 'express-validator';

/**
 * Runs all validation rules collected by express-validator and short-circuits
 * with a structured 422 response if any rule fails.
 *
 * Usage: place `handleValidationErrors` as the last item in the middleware
 * chain (after all the rule arrays), before the controller function.
 */
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: 'Validation failed',
            details: errors.array().map((e) => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }

    next();
}

/**
 * Validation rules for POST /api/url (create shortened URL).
 *
 * Rules:
 *  - url      : required, must be a valid http/https URI, max 2048 chars
 *  - alias    : optional, 4–20 alphanumeric chars (letters, digits, hyphens)
 *  - expiresIn: optional, integer number of hours between 1 and 8760 (1 year)
 */
export const validateCreateUrl = [
    body('url')
        .notEmpty()
        .withMessage('url is required')
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage('url must start with http:// or https:// and be a valid URL')
        .isLength({ max: 2048 })
        .withMessage('url must not exceed 2048 characters'),

    body('alias')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('alias must be between 4 and 20 characters')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('alias may only contain letters, digits, and hyphens'),

    body('expiresIn')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1, max: 8760 })
        .withMessage('expiresIn must be an integer number of hours between 1 and 8760')
        .toInt(),

    handleValidationErrors,
];

/**
 * Validation rules for routes that accept a MongoDB ObjectId or short code
 * as the :id URL parameter.
 */
export const validateIdParam = [
    param('id')
        .notEmpty()
        .withMessage('id parameter is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('id parameter is too long'),

    handleValidationErrors,
];

/**
 * Validation rules for the :shortCode URL parameter (redirect routes).
 */
export const validateShortCodeParam = [
    param('shortCode')
        .notEmpty()
        .withMessage('shortCode parameter is required')
        .isLength({ min: 4, max: 20 })
        .withMessage('shortCode must be between 4 and 20 characters')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('shortCode may only contain letters, digits, and hyphens'),

    handleValidationErrors,
];

/**
 * Validation rule for user registration
 */
export const validateRegister = [
    body('username')
        .notEmpty()
        .withMessage('username is required')
        .trim(),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('enter a valid email'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be of 8 length'),

    handleValidationErrors,
];

/**
 * Validation rule for user login
 */
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('enter a valid email'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be of length 8'),

    handleValidationErrors,
];