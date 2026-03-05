/**
 * Admin Bulk Upload API Handler
 * Processes bulk vector uploads with advanced analysis and validation
 */

const ADMIN_PASSWORD = "vector2026";

const VALID_CATEGORIES = [
  "Abstract",
  "Animals/Wildlife",
  "The Arts",
  "Backgrounds/Textures",
  "Beauty/Fashion",
  "Buildings/Landmarks",
  "Business/Finance",
  "Celebrities",
  "Drink",
  "Education",
  "Font",
  "Food",
  "Healthcare/Medical",
  "Holidays",
  "Icon",
  "Industrial",
  "Interiors",
  "Logo",
  "Miscellaneous",
  "Nature",
  "Objects",
  "Parks/Outdoor",
  "People",
  "Religion",
  "Science",
  "Signs/Symbols",
  "Sports/Recreation",
  "Technology",
  "Transportation",
  "Vintage"
];

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

function generateSeoSlug(title) {
  if (!title || title.trim() === "") return null;
  
  const titleStr = title.toString().trim();
  const slug = titleStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return slug ? `free-vector-${slug}` : null;
}

/**
 * Analyze ZIP file contents
 */
async function analyzeZipContents(zipBuffer) {
  try {
    // Simple ZIP analysis - check for common vector file types
    const zipStr = new TextDecoder().decode(zipBuffer);
    
    return {
      hasEps: zipStr.includes('.eps') || zipStr.includes('.EPS'),
      hasSvg: zipStr.includes('.svg') || zipStr.includes('.SVG'),
      hasAi: zipStr.includes('.ai') || zipStr.includes('.AI'),
      hasJpeg: zipStr.includes('.jpg') || zipStr.includes('.jpeg') || zipStr.includes('.JPG') || zipStr.includes('.JPEG'),
      analyzed: true
    };
  } catch (e) {
    return { error: e.message, analyzed: false };
  }
}

/**
 * Validate metadata
 */
function validateMetadata(metadata) {
  const required = ['title', 'category', 'description', 'keywords'];
  const missing = [];
  const issues = [];
  
  for (const field of required) {
    if (!metadata[field]) {
      missing.push(field);
    } else if (Array.isArray(metadata[field]) && metadata[field].length === 0) {
      missing.push(field);
    }
  }
  
  if (metadata.category && !VALID_CATEGORIES.includes(metadata.category)) {
    issues.push(`Invalid category: ${metadata.category}`);
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    issues,
    hasAllFields: missing.length === 0
  };
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const formData = await context.request.formData();

    const action = new URL(context.request.url).searchParams.get("action");

    // Single file upload (existing behavior)
    if (action !== "bulk-analyze") {
      const jsonFile = formData.get("json");
      const jpegFile = formData.get("jpeg");
      const zipFile = formData.get("zip");

      if (!jsonFile || !jpegFile || !zipFile) {
        return new Response(JSON.stringify({ error: "Missing files" }), { status: 400, headers });
      }

      const metadata = JSON.parse(await jsonFile.text());
      
      let slug = null;
      if (metadata.title && metadata.title.trim()) {
        slug = generateSeoSlug(metadata.title);
      }
      if (!slug) {
        const filename = jsonFile.name.replace(/\.json$/, "");
        slug = generateSeoSlug(filename) || filename;
      }

      const category = metadata.category || "Miscellaneous";
      if (!VALID_CATEGORIES.includes(category)) {
        return new Response(JSON.stringify({ error: `Invalid category: ${category}` }), { status: 400, headers });
      }
      
      if (!slug || slug === "free-vector-") {
        return new Response(JSON.stringify({ error: "Title is required to generate a valid slug" }), { status: 400, headers });
      }

      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

      const existing = allVectors.find(v => v.name === slug);
      if (existing) return new Response(JSON.stringify({ error: "DUPLICATE" }), { status: 409, headers });

      await r2.put(`assets/${category}/${slug}.jpg`, await jpegFile.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
      await r2.put(`assets/${category}/${slug}.zip`, await zipFile.arrayBuffer(), { httpMetadata: { contentType: "application/zip" } });

      const vectorRecord = {
        name: slug,
        category,
        title: metadata.title || slug,
        description: metadata.description || "",
        keywords: metadata.keywords || [],
        date: new Date().toISOString().split("T")[0],
        downloads: 0,
        fileSize: `${(zipFile.size / (1024 * 1024)).toFixed(1)} MB`
      };

      allVectors.unshift(vectorRecord);
      await kv.put("all_vectors", JSON.stringify(allVectors));

      return new Response(JSON.stringify({ success: true, message: `Uploaded: ${slug}` }), { status: 200, headers });
    }

    // Bulk analyze action
    if (action === "bulk-analyze") {
      const results = [];
      
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("file_")) {
          const file = value;
          const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            issues: []
          };

          // Check file type
          const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase();
          if (!['.json', '.jpg', '.jpeg', '.zip'].includes(ext)) {
            fileInfo.status = 'error';
            fileInfo.issues.push('Unsupported file type');
          }

          results.push(fileInfo);
        }
      }

      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
    }
  });
}
