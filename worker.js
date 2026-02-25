export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const adminKey = env.ADMIN_KEY;

    // 1. Veritabanı Okuma (GET /api/database)
    if (url.pathname === "/api/database" && request.method === "GET") {
      const data = await env.VECTOR_DB.get("all_vectors");
      return new Response(data || "[]", {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Veritabanı Güncelleme (POST /api/database)
    if (url.pathname === "/api/database" && request.method === "POST") {
      const providedKey = request.headers.get("X-Admin-Key");
      if (providedKey !== adminKey) return new Response("Unauthorized", { status: 401 });

      const newEntries = await request.json();
      let currentData = JSON.parse(await env.VECTOR_DB.get("all_vectors") || "[]");

      newEntries.forEach(entry => {
        const idx = currentData.findIndex(item => item.name === entry.name && item.category === entry.category);
        if (idx > -1) {
          currentData[idx] = { ...entry, downloads: currentData[idx].downloads || 0 };
        } else {
          currentData.push(entry);
        }
      });

      currentData.sort((a, b) => new Date(b.date) - new Date(a.date));
      await env.VECTOR_DB.put("all_vectors", JSON.stringify(currentData));
      return new Response("OK");
    }

    // 3. Dosya Yükleme (POST /api/upload)
    if (url.pathname === "/api/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const category = formData.get("category");
      const key = formData.get("key");

      if (key !== adminKey) return new Response("Unauthorized", { status: 401 });
      if (!file) return new Response("No file", { status: 400 });

      const fileName = file.name;
      const path = `assets/${category}/${fileName}`;

      // R2'ye yükle
      await env.VECTOR_BUCKET.put(path, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      return new Response("Uploaded");
    }

    // 4. İndirme Sayısı Artırma (POST /api/download)
    if (url.pathname === "/api/download" && request.method === "POST") {
      const name = url.searchParams.get("name");
      let currentData = JSON.parse(await env.VECTOR_DB.get("all_vectors") || "[]");
      const idx = currentData.findIndex(item => item.name === name);

      if (idx > -1) {
        currentData[idx].downloads = (currentData[idx].downloads || 0) + 1;
        await env.VECTOR_DB.put("all_vectors", JSON.stringify(currentData));
      }
      return new Response("OK");
    }

    // 5. Statik Dosyaları Sunma (Assets)
    if (url.pathname.startsWith("/assets/")) {
      const path = url.pathname.substring(1); // "assets/..."
      const object = await env.VECTOR_BUCKET.get(path);

      if (object === null) return new Response("Not Found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body, { headers });
    }

    // Diğer istekleri Pages'e (index.html, admin.html) yönlendir
    return env.ASSETS.fetch(request);
  }
};