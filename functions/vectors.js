export async function onRequest(context) {
  try {
    // Cloudflare KV'den verileri çekiyoruz
    const data = await context.env.VECTOR_KV.get("vectors_data");

    // Eğer veritabanı boşsa siteye hata vermemesi için boş bir liste gönderiyoruz
    if (!data) {
      return new Response(JSON.stringify({ "vectors": [] }), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Veri varsa doğrudan gönderiyoruz (ekstra tırnak kullanmadan)
    return new Response(data, {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
