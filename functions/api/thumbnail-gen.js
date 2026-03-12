/**
 * Thumbnail Generation Utility using Sharp
 * Generates real JPEG thumbnails with max width of 400-512px
 */

import sharp from "sharp";

export async function generateThumbnail(jpegBuffer, maxWidth = 400) {
    try {
        // Use sharp to resize the image to thumbnail size
        // Preserve aspect ratio, quality 80
        const thumbBuffer = await sharp(jpegBuffer)
            .resize(maxWidth, maxWidth, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        
        return thumbBuffer;
    } catch (e) {
        console.error('Thumbnail generation failed:', e);
        // Fallback: return original buffer if generation fails
        return jpegBuffer;
    }
}

export function getThumbnailKey(category, id) {
    return `${category}/${id}/${id}-thumb.jpg`;
}

export function getOriginalKey(category, id) {
    return `${category}/${id}/${id}.jpg`;
}
