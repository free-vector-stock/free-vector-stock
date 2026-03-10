/**
 * GET /api/asset?key=filename.jpg
 * Serves files from R2 bucket.
 * Fixed: Search in category-specific folders.
 */

export async function onRequestGet(context) {
    try {
        const r2 = context.env.VECTOR_ASSETS;
        if (!r2) return new Response("R2 not configured", { status: 500 });

        const url = new URL(context.request.url);
        const key = url.searchParams.get("key");

        if (!key) return new Response("Missing key parameter", { status: 400 });

        // Decode URL-encoded key
        const decodedKey = decodeURIComponent(key);
        let object = null;

        // Try to find file in any category folder
        let r2Key = decodedKey;
        if (!decodedKey.includes('/')) {
            // If no folder specified, search in all category folders
            const categories = ['abstract', 'animals', 'the-arts', 'backgrounds', 'fashion', 'buildings', 'business', 'celebrities', 'education', 'food', 'drink', 'medical', 'holidays', 'industrial', 'interiors', 'miscellaneous', 'nature', 'objects', 'outdoor', 'people', 'religion', 'science', 'symbols', 'sports', 'technology', 'transportation', 'vintage', 'logo', 'font', 'icon'];
            for (const cat of categories) {
                const testKey = `${cat}/${decodedKey}`;
                const testObj = await r2.get(testKey);
                if (testObj) {
                    object = testObj;
                    break;
                }
            }
            
            // Fallback to old "icon/" folder if not found in category folders
            if (!object) {
                const iconKey = `icon/${decodedKey}`;
                const iconObj = await r2.get(iconKey);
                if (iconObj) object = iconObj;
            }
        } else {
            object = await r2.get(r2Key);
        }

        if (!object) {
            // Placeholder for missing images
            if (decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg") || decodedKey.endsWith(".png")) {
                return Response.redirect("https://placehold.co/400x300/f5f5f5/999?text=Preview", 302);
            }
            return new Response("File not found", { status: 404 });
        }

        const isZip = decodedKey.endsWith(".zip");
        const isJpeg = decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg");

        const headers = {
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"
        };

        if (isZip) {
            headers["Content-Type"] = "application/zip";
            const downloadName = decodedKey.split('/').pop();
            headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
        } else if (isJpeg) {
            headers["Content-Type"] = "image/jpeg";
        } else {
            headers["Content-Type"] = object.httpMetadata?.contentType || "application/octet-stream";
        }

        if (object.size) headers["Content-Length"] = String(object.size);

        return new Response(object.body, { status: 200, headers });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
