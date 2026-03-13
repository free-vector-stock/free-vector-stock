/**
 * Thumbnail Generation Utility
 * Cloudflare Workers compatible - no external dependencies
 * Returns original JPEG buffer as thumbnail (resizing not available in CF Workers without sharp)
 */

export async function generateThumbnail(jpegBuffer, maxWidth = 400) {
    try {
        // Cloudflare Workers does not support sharp or canvas
        // Return original buffer as-is; thumbnail is served directly
        return jpegBuffer;
    } catch (e) {
        console.error('Thumbnail generation failed:', e);
        return jpegBuffer;
    }
}

export function getThumbnailKey(category, id) {
    return `${category}/${id}/${id}-thumb.jpg`;
}

export function getOriginalKey(category, id) {
    return `${category}/${id}/${id}.jpg`;
}
