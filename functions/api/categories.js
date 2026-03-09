/**
 * GET /api/categories
 * Returns list of all categories with vector counts, sorted A-Z
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
};

// New categories list from şartname.txt
const ALL_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        if (!kv) {
            const categories = ALL_CATEGORIES.map(name => ({ name, count: 0 }));
            return new Response(JSON.stringify({ categories, total: 0 }), {
                status: 200,
                headers: CORS_HEADERS
            });
        }

        const allVectorsRaw = await kv.get("all_vectors");
        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

        const categoryCounts = {};
        for (const v of allVectors) {
            const cat = v.category || "Miscellaneous";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        const categories = ALL_CATEGORIES.map(name => ({
            name,
            count: categoryCounts[name] || 0
        }));

        // Also add any categories from KV that aren't in predefined list (for compatibility)
        for (const [name, count] of Object.entries(categoryCounts)) {
            if (!ALL_CATEGORIES.includes(name)) {
                categories.push({ name, count });
            }
        }

        // Sort A-Z
        categories.sort((a, b) => a.name.localeCompare(b.name));

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
