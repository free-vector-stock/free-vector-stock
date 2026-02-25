export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    // Senin panelinde KV ismi VECTOR_KV olarak gorunuyor ama içi VECTOR_DB'ye bagli.
    // Garanti olsun diye ikisini de sirayla kontrol ediyoruz.
    const kv = context.env.VECTOR_KV || context.env.VECTOR_DB;
    
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV Bağlantısı Yok" }), { status: 500, headers });
    }

    const data = await kv.get("vectors_data");

    // Eger veritabaninda bilgi varsa onu gonder, yoksa bos bir liste gonder
    return new Response(data || JSON.stringify({ "vectors": [] }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
