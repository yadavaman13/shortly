import mongoose from 'mongoose';
import urlModel from '../../../models/url.model.js';
import generateCode from '../../../utils/generateCode.js';
import envConfig from '../../../config/env.config.js';

export async function createShortenUrl(req, res) {
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

        const newUrl = await urlModel.create({
            originalUrl: url.trim(),
            shortUrl: shortCode,
        });

        const serverUrl = envConfig.SERVER_URL.replace(/\/$/, '');
        const fullShortUrl = `${serverUrl}/${newUrl.shortUrl}`;

        return res.status(201).json({
            message: 'shorten url created successfully',
            data: {
                id: newUrl._id,
                originalUrl: newUrl.originalUrl,
                shortUrl: newUrl.shortUrl,
                fullShortUrl,
                clicks: newUrl.clicks,
                createdAt: newUrl.createdAt,
            },
        });
    } catch (err) {
        console.error('Error creating shortened URL:', err);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

export async function redirectUrl(req, res) {
    try {
        const { shortCode } = req.params;

        if (!shortCode) {
            return res.status(400).json({
                error: 'Please provide a short code',
            });
        }

        if (shortCode === 'favicon.ico') {
            return res.status(204).end();
        }

        const urlDoc = await urlModel.findOneAndUpdate(
            { shortUrl: shortCode },
            { $inc: { clicks: 1 } },
            { new: true },
        );

        if (!urlDoc) {
            return res.status(404).json({
                error: 'Short URL not found',
            });
        }

        return res.redirect(urlDoc.originalUrl);
    } catch (err) {
        console.error('Error during redirection:', err);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

export async function getAllUrls(req, res) {
    try {
        const { search, q } = req.query;
        const queryTerm = (search || q || '').trim();

        let filter = {};
        if (queryTerm) {
            // Escape regex special characters to prevent regex injection
            const escaped = queryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escaped, 'i');
            filter = {
                $or: [{ shortUrl: searchRegex }, { originalUrl: searchRegex }],
            };
        }

        const urls = await urlModel.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'URLs fetched successfully',
            data: {
                urls,
            },
        });
    } catch (err) {
        console.error('Error fetching URLs:', err);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

//get url by id and shorturl
export async function getUrlById(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'Enter url Id or short code',
            });
        }

        let url = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            url = await urlModel.findById(id);
        }

        if (!url) {
            url = await urlModel.findOne({ shortUrl: id });
        }

        if (!url) {
            return res.status(404).json({
                error: 'No url exists with this Id or short code',
            });
        }

        return res.status(200).json({
            message: 'url fetched successfully',
            data: {
                url,
            },
        });
    } catch (err) {
        console.error('Error fetching URL:', err);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

//delete url by id and shorturl
export async function deleteUrl(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'Please enter an id or short code',
            });
        }

        let url = null;

        //check by id
        if (mongoose.Types.ObjectId.isValid(id)) {
            url = await urlModel.findByIdAndDelete(id);
        }

        //check for shorturl
        if (!url) {
            url = await urlModel.findOneAndDelete({ shortUrl: id });
        }

        if (!url) {
            return res.status(404).json({
                error: 'No url exists with this id and shorturl',
            });
        }

        return res.status(200).json({
            message: 'Url deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting URL:', err);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}
