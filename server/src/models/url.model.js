import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            index: true,
        },
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        clicks: {
            type: Number,
            default: 0,
        },
        qrGenerated: {
            type: Boolean,
            default: false,
        },
        qrScans: {
            type: Number,
            default: 0,
        },
        editHistory: [
            {
                previousUrl: { type: String, required: true },
                changedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    },
);

const urlModel = mongoose.model('urls', urlSchema);

export default urlModel;
