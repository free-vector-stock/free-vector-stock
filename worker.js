// ===========================
// CLOUDFLARE WORKER API
// ===========================
// Deploy this to Cloudflare Workers
// Configure R2 and KV bindings in wrangler.toml

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Public API Routes
            if (path === '/api/vectors' && request.method === 'GET') {
                return handleGetVectors(env, corsHeaders);
            }

            if (path.match(/^\/api\/vectors\/\d+$/) && request.method === 'GET') {
                const id = path.split('/').pop();
                return handleGetVector(id, env, corsHeaders);
            }

            if (path === '/api/categories' && request.method === 'GET') {
                return handleGetCategories(env, corsHeaders);
            }

            // Admin Routes (Protected)
            if (path.startsWith('/api/admin/')) {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                        status: 401,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                const token = authHeader.substring(7);
                const isValid = await validateToken(token, env);

                if (!isValid) {
                    return new Response(JSON.stringify({ error: 'Invalid token' }), {
                        status: 401,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                // Admin endpoints
                if (path === '/api/admin/upload' && request.method === 'POST') {
                    return handleUploadVector(request, env, corsHeaders);
                }

                if (path === '/api/admin/vectors' && request.method === 'GET') {
                    return handleAdminGetVectors(env, corsHeaders);
                }

                if (path.match(/^\/api\/admin\/vectors\/\d+$/) && request.method === 'DELETE') {
                    const id = path.split('/').pop();
                    return handleDeleteVector(id, env, corsHeaders);
                }

                if (path === '/api/admin/stats' && request.method === 'GET') {
                    return handleGetStats(env, corsHeaders);
                }

                if (path === '/api/admin/activity' && request.method === 'GET') {
                    return handleGetActivity(env, corsHeaders);
                }

                if (path === '/api/admin/categories' && request.method === 'GET') {
                    return handleAdminGetCategories(env, corsHeaders);
                }

                if (path === '/api/admin/categories' && request.method === 'POST') {
                    return handleAddCategory(request, env, corsHeaders);
                }

                if (path.match(/^\/api\/admin\/categories\/\d+$/) && request.method === 'DELETE') {
                    const id = path.split('/').pop();
                    return handleDeleteCategory(id, env, corsHeaders);
                }

                if (path === '/api/admin/settings' && request.method === 'POST') {
                    return handleSaveSettings(request, env, corsHeaders);
                }
            }

            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};

// ===========================
// PUBLIC API HANDLERS
// ===========================

async function handleGetVectors(env, corsHeaders) {
    try {
        const vectors = await env.KV.get('vectors:all', 'json');
        return new Response(JSON.stringify({ vectors: vectors || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch vectors' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleGetVector(id, env, corsHeaders) {
    try {
        const vector = await env.KV.get(`vector:${id}`, 'json');
        if (!vector) {
            return new Response(JSON.stringify({ error: 'Vector not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(vector), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch vector' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleGetCategories(env, corsHeaders) {
    try {
        const categories = await env.KV.get('categories:all', 'json');
        return new Response(JSON.stringify({ categories: categories || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

// ===========================
// ADMIN HANDLERS
// ===========================

async function handleUploadVector(request, env, corsHeaders) {
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const category = formData.get('category');
        const keywords = formData.get('keywords').split(',').map(k => k.trim());
        const fileSize = formData.get('fileSize');
        const thumbnail = formData.get('thumbnail');
        const zipFile = formData.get('zipFile');

        // Generate unique ID
        const id = `${category.toLowerCase().replace(/\//g, '-')}-${Date.now()}`;

        // Upload thumbnail to R2
        const thumbnailKey = `thumbnails/${id}.jpg`;
        const thumbnailUrl = await uploadToR2(env, thumbnailKey, thumbnail);

        // Upload ZIP file to R2
        const zipKey = `vectors/${id}.zip`;
        const zipUrl = await uploadToR2(env, zipKey, zipFile);

        // Create vector object
        const vector = {
            id,
            title,
            description,
            category,
            keywords,
            fileSize,
            thumbnail: thumbnailUrl,
            zipFile: zipUrl,
            uploadDate: new Date().toISOString(),
        };

        // Store in KV
        await env.KV.put(`vector:${id}`, JSON.stringify(vector));

        // Update vectors list
        const vectors = await env.KV.get('vectors:all', 'json') || [];
        vectors.push(vector);
        await env.KV.put('vectors:all', JSON.stringify(vectors));

        // Log activity
        await logActivity(env, `Vector uploaded: ${title}`);

        return new Response(JSON.stringify({ success: true, vector }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleAdminGetVectors(env, corsHeaders) {
    try {
        const vectors = await env.KV.get('vectors:all', 'json');
        return new Response(JSON.stringify({ vectors: vectors || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch vectors' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleDeleteVector(id, env, corsHeaders) {
    try {
        // Delete from KV
        await env.KV.delete(`vector:${id}`);

        // Update vectors list
        const vectors = await env.KV.get('vectors:all', 'json') || [];
        const filtered = vectors.filter(v => v.id !== id);
        await env.KV.put('vectors:all', JSON.stringify(filtered));

        // Log activity
        await logActivity(env, `Vector deleted: ${id}`);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Delete failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleGetStats(env, corsHeaders) {
    try {
        const vectors = await env.KV.get('vectors:all', 'json') || [];
        const categories = await env.KV.get('categories:all', 'json') || [];

        const stats = {
            totalVectors: vectors.length,
            totalCategories: categories.length,
            totalStorage: vectors.reduce((sum, v) => sum + (v.fileSize ? parseInt(v.fileSize) : 0), 0),
            recentUploads: vectors.filter(v => {
                const uploadDate = new Date(v.uploadDate);
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return uploadDate > sevenDaysAgo;
            }).length,
        };

        return new Response(JSON.stringify(stats), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleGetActivity(env, corsHeaders) {
    try {
        const activities = await env.KV.get('activities', 'json') || [];
        return new Response(JSON.stringify({ activities: activities.slice(-20) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch activity' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleAdminGetCategories(env, corsHeaders) {
    try {
        const categories = await env.KV.get('categories:all', 'json');
        return new Response(JSON.stringify({ categories: categories || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleAddCategory(request, env, corsHeaders) {
    try {
        const data = await request.json();
        const id = `category-${Date.now()}`;

        const category = {
            id,
            name: data.name,
            description: data.description,
            createdAt: new Date().toISOString(),
        };

        // Store in KV
        await env.KV.put(`category:${id}`, JSON.stringify(category));

        // Update categories list
        const categories = await env.KV.get('categories:all', 'json') || [];
        categories.push(category);
        await env.KV.put('categories:all', JSON.stringify(categories));

        // Log activity
        await logActivity(env, `Category added: ${data.name}`);

        return new Response(JSON.stringify({ success: true, category }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Add category failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleDeleteCategory(id, env, corsHeaders) {
    try {
        await env.KV.delete(`category:${id}`);

        const categories = await env.KV.get('categories:all', 'json') || [];
        const filtered = categories.filter(c => c.id !== id);
        await env.KV.put('categories:all', JSON.stringify(filtered));

        await logActivity(env, `Category deleted: ${id}`);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Delete failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

async function handleSaveSettings(request, env, corsHeaders) {
    try {
        const data = await request.json();
        await env.KV.put('settings', JSON.stringify(data));

        await logActivity(env, 'Settings updated');

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Save settings failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

// ===========================
// UTILITIES
// ===========================

async function uploadToR2(env, key, file) {
    try {
        const buffer = await file.arrayBuffer();
        await env.R2.put(key, buffer, {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // Return public URL
        return `https://${env.R2_DOMAIN}/${key}`;
    } catch (error) {
        console.error('R2 upload error:', error);
        throw error;
    }
}

async function validateToken(token, env) {
    try {
        // In production, verify JWT token
        const storedToken = await env.KV.get('admin:token');
        return token === storedToken;
    } catch (error) {
        return false;
    }
}

async function logActivity(env, action) {
    try {
        const activities = await env.KV.get('activities', 'json') || [];
        activities.push({
            action,
            timestamp: new Date().toISOString(),
        });
        await env.KV.put('activities', JSON.stringify(activities.slice(-100)));
    } catch (error) {
        console.error('Activity log error:', error);
    }
}
