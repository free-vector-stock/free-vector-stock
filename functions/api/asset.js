/**
 * GET /api/asset?key=filename.jpg
 * Serves files from R2 bucket (Flat structure)
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

        const object = await r2.get(decodedKey);

        if (!object) {
            // Placeholder for missing images
            if (decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg") || decodedKey.endsWith(".png")) {
                return Response.redirect("https://placehold.co/400x300/f5f5f5/999999?text=Preview", 302);
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
            headers["Content-Disposition"] = `attachment; filename="${decodedKey}"`;
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
