/**
 * GET /api/download?slug=xxx
 * Increments download counter and serves ZIP file from R2
 * Fixed: Search in category-specific folders.
 */

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        const r2 = context.env.VECTOR_ASSETS;

        if (!kv || !r2) {
            return new Response("Service not configured", { status: 500 });
        }

        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return new Response("Missing slug parameter", { status: 400 });
        }

        // Find ZIP file in category-specific folder
        const allVectorsRaw = await kv.get("all_vectors");
        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
        const vector = allVectors.find(v => v.name === slug);
        
        let object = null;
        if (vector) {
            const categoryFolder = vector.category.replace(/\s+/g, '-').toLowerCase();
            object = await r2.get(`${categoryFolder}/${slug}.zip`);
        }
        
        // Fallback: search in all category folders if not found via KV metadata
        if (!object) {
            const categories = ['abstract', 'animals', 'the-arts', 'backgrounds', 'fashion', 'buildings', 'business', 'celebrities', 'education', 'food', 'drink', 'medical', 'holidays', 'industrial', 'interiors', 'miscellaneous', 'nature', 'objects', 'outdoor', 'people', 'religion', 'science', 'symbols', 'sports', 'technology', 'transportation', 'vintage', 'logo', 'font', 'icon', 'icon'];
            for (const cat of categories) {
                const testKey = `${cat}/${slug}.zip`;
                const testObj = await r2.get(testKey);
                if (testObj) {
                    object = testObj;
                    break;
                }
            }
        }
        
        if (!object) {
            return new Response("ZIP file not found in storage", { status: 404 });
        }

        // Increment download counter
        context.waitUntil((async () => {
            try {
                const freshRaw = await kv.get("all_vectors");
                if (freshRaw) {
                    const freshVectors = JSON.parse(freshRaw);
                    const idx = freshVectors.findIndex(v => v.name === slug);
                    if (idx !== -1) {
                        freshVectors[idx].downloads = (freshVectors[idx].downloads || 0) + 1;
                        await kv.put("all_vectors", JSON.stringify(freshVectors));
                    }
                }
            } catch (e) {
                console.error("Counter update failed:", e);
            }
        })());

        const headers = {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(slug)}.zip`,
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        if (object.size) {
            headers["Content-Length"] = String(object.size);
        }

        return new Response(object.body, { status: 200, headers });

    } catch (e) {
        console.error("Download error:", e);
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400"
        }
    });
}
