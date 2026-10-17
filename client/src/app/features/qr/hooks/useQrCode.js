import { useCallback } from 'react';
import QRCode from 'qrcode';

/**
 * Custom hook for client-side QR code rendering and downloading
 */
export function useQrCode() {
    /**
     * Generates an SVG string representation of the QR code
     * @param {string} text - URL or text to encode
     * @param {object} [options]
     * @returns {Promise<string>} SVG markup
     */
    const generateQrSvg = useCallback(async (text, options = {}) => {
        if (!text) return '';
        return await QRCode.toString(text, {
            type: 'svg',
            width: options.size || 300,
            margin: options.margin ?? 2,
            color: {
                dark: options.foreground || '#000000',
                light: options.background || '#ffffff',
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'H',
        });
    }, []);

    /**
     * Generates a Data URL (PNG) representation of the QR code
     * @param {string} text - URL or text to encode
     * @param {object} [options]
     * @returns {Promise<string>} Data URL
     */
    const generateQrDataUrl = useCallback(async (text, options = {}) => {
        if (!text) return '';
        return await QRCode.toDataURL(text, {
            width: options.size || 512,
            margin: options.margin ?? 2,
            color: {
                dark: options.foreground || '#000000',
                light: options.background || '#ffffff',
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'H',
        });
    }, []);

    /**
     * Downloads a PNG data URL
     */
    const downloadPng = useCallback((dataUrl, filename = 'shortly-qr.png') => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    /**
     * Downloads an SVG string as an .svg file
     */
    const downloadSvg = useCallback((svgString, filename = 'shortly-qr.svg') => {
        if (!svgString) return;
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    return {
        generateQrSvg,
        generateQrDataUrl,
        downloadPng,
        downloadSvg,
    };
}

export default useQrCode;
