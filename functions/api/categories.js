/**
 * GET /api/categories
 * Returns list of all categories with vector counts, sorted A-Z
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
};

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        if (!kv) {
            return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers: CORS_HEADERS });
        }

        const allVectorsRaw = await kv.get("all_vectors");
        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

        // Count by category
        const categoryCounts = {};
        for (const v of allVectors) {
            const cat = v.category || "Miscellaneous";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        // Sort A-Z
        const categories = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return new Response(JSON.stringify({ categories, total: allVectors.length }), {
            status: 200,
            headers: CORS_HEADERS
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
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
