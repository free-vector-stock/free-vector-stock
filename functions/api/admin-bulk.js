/**
 * Admin Bulk Upload API Handler
 * Enhanced: Retry system, upload logging, hash-based duplicate detection
 * Processes bulk vector uploads with advanced analysis and validation
 */

const ADMIN_PASSWORD = "vector2026";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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

function normalizeCategory(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const exact = VALID_CATEGORIES.find(c => c.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  const firstWord = s.split(/[/\s]/)[0].toLowerCase();
  const startsWith = VALID_CATEGORIES.find(c => c.toLowerCase().startsWith(firstWord) && firstWord.length >= 4);
  if (startsWith) return startsWith;
  const threshold = s.length <= 6 ? 2 : 3;
  let best = null, bestDist = Infinity;
  for (const cat of VALID_CATEGORIES) {
    const d1 = levenshtein(s.toLowerCase(), cat.toLowerCase());
    if (d1 < bestDist) { bestDist = d1; best = cat; }
    const catFirst = cat.split(/[/\s]/)[0].toLowerCase();
    const d2 = levenshtein(s.toLowerCase(), catFirst);
    if (d2 < bestDist) { bestDist = d2; best = cat; }
  }
  return (best && bestDist <= threshold) ? best : null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function simpleHash(buffer) {
  const bytes = new Uint8Array(buffer);
  let hash = 2166136261;
  for (let i = 0; i < Math.min(bytes.length, 65536); i++) {
    hash ^= bytes[i];
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadWithRetry(r2, key, buffer, metadata, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await r2.put(key, buffer, { httpMetadata: metadata });
      const check = await r2.head(key);
      if (check) return { success: true, attempt };
      throw new Error("Upload verification failed");
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  return { success: false, error: lastError?.message, attempts: retries };
}

async function logUploadEvent(kv, event) {
  try {
    const logKey = `upload-log-${new Date().toISOString().split('T')[0]}`;
    const logsRaw = await kv.get(logKey);
    const logs = logsRaw ? JSON.parse(logsRaw) : [];
    logs.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    await kv.put(logKey, JSON.stringify(logs));
  } catch (e) {
    console.error("Log error:", e);
  }
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

function validateTitle(title) {
  if (!title || String(title).trim() === "") {
    return { valid: false, reason: "Title is required." };
  }
  const t = String(title).trim();
  if (/^\d+$/.test(t)) {
    return { valid: false, reason: "Title cannot consist only of numbers." };
  }
  if (/\d{5,}/.test(t)) {
    return { valid: false, reason: "Title contains numeric file ID codes. Please use a descriptive title." };
  }
  const wordCount = t.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 3) {
    return { valid: false, reason: `Title must contain at least 3 words. Current: "${t}" (${wordCount} word${wordCount !== 1 ? 's' : ''}).` };
  }
  return { valid: true };
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

      let metadata;
      try {
        metadata = JSON.parse(await jsonFile.text());
      } catch (e) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          status: "error",
          reason: "json_parse_error",
          error: e.message
        });
        return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), { status: 400, headers });
      }
      
      const getField = (obj, field) => {
        const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
        return key ? obj[key] : null;
      };
      
      const title = getField(metadata, "title");
      const keywords = getField(metadata, "keywords");
      let category = getField(metadata, "category");
      
      const titleCheck = validateTitle(title);
      if (!titleCheck.valid) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          status: "error",
          reason: "invalid_title",
          error: titleCheck.reason
        });
        return new Response(JSON.stringify({ error: "Title validation failed: " + titleCheck.reason }), { status: 400, headers });
      }
      
      if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          status: "error",
          reason: "missing_keywords"
        });
        return new Response(JSON.stringify({ error: "Keywords are required" }), { status: 400, headers });
      }
      
      let resolvedCategory = null;
      if (category) {
        resolvedCategory = normalizeCategory(String(category));
      }
      if (!resolvedCategory) {
        const prefix = jsonFile.name.split(/[-_\s]/)[0];
        resolvedCategory = normalizeCategory(prefix);
      }
      if (!resolvedCategory) {
        resolvedCategory = "Miscellaneous";
      }
      
      let slug = null;
      if (title && String(title).trim()) {
        slug = generateSeoSlug(title);
      }
      if (!slug) {
        const filename = jsonFile.name.replace(/\.json$/, "");
        slug = generateSeoSlug(filename) || filename;
      }
      
      if (!slug || slug === "free-vector-") {
        return new Response(JSON.stringify({ error: "Title is required to generate a valid slug" }), { status: 400, headers });
      }

      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

      const existing = allVectors.find(v => v.name === slug);
      if (existing) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          slug,
          category: resolvedCategory,
          status: "duplicate"
        });
        return new Response(JSON.stringify({ error: "DUPLICATE" }), { status: 409, headers });
      }

      const jpegBuffer = await jpegFile.arrayBuffer();
      const zipBuffer = await zipFile.arrayBuffer();
      const jpegHash = simpleHash(jpegBuffer);
      
      const hashDuplicate = allVectors.find(v => v.imageHash === jpegHash);
      if (hashDuplicate) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          slug,
          category: resolvedCategory,
          status: "duplicate",
          reason: "hash_duplicate"
        });
        return new Response(JSON.stringify({ error: "DUPLICATE" }), { status: 409, headers });
      }

      const jpgUpload = await uploadWithRetry(r2, `assets/${resolvedCategory}/${slug}.jpg`, jpegBuffer, { contentType: "image/jpeg" });
      if (!jpgUpload.success) {
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          slug,
          category: resolvedCategory,
          status: "error",
          reason: "jpg_upload_failed",
          error: jpgUpload.error
        });
        return new Response(JSON.stringify({ error: "JPEG upload failed: " + jpgUpload.error }), { status: 500, headers });
      }

      const zipUpload = await uploadWithRetry(r2, `assets/${resolvedCategory}/${slug}.zip`, zipBuffer, { contentType: "application/zip" });
      if (!zipUpload.success) {
        try {
          await r2.delete(`assets/${resolvedCategory}/${slug}.jpg`);
        } catch (_) {}
        await logUploadEvent(kv, {
          file_name: jsonFile.name,
          slug,
          category: resolvedCategory,
          status: "error",
          reason: "zip_upload_failed",
          error: zipUpload.error
        });
        return new Response(JSON.stringify({ error: "ZIP upload failed: " + zipUpload.error }), { status: 500, headers });
      }

      const vectorRecord = {
        name: slug,
        category: resolvedCategory,
        title: String(title).trim(),
        description: getField(metadata, "description") || "",
        keywords: Array.isArray(keywords) ? keywords : String(keywords).split(",").map(k => k.trim()).filter(Boolean),
        date: new Date().toISOString().split("T")[0],
        downloads: 0,
        fileSize: `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`,
        imageHash: jpegHash
      };

      allVectors.unshift(vectorRecord);
      await kv.put("all_vectors", JSON.stringify(allVectors));

      await logUploadEvent(kv, {
        file_name: jsonFile.name,
        slug,
        category: resolvedCategory,
        status: "success",
        file_size: zipBuffer.byteLength
      });

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
