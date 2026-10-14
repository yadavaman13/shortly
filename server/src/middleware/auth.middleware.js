import jwt from 'jsonwebtoken';
import blacklistTokenModel from '../models/blacklist.model.js';
import envConfig from '../config/env.config.js';

export async function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: 'token not provided',
        });
    }

    try {
        const isTokenBlacklisted = await blacklistTokenModel.findOne({
            token,
        });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'token is invalid',
            });
        }

        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }
}

