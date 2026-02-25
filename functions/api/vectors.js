export async function onRequest(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  try {
    const kv = context.env.VECTOR_KV || context.env.VECTOR_DB;
    if (!kv) return new Response(JSON.stringify({ error: "KV Yok" }), { status: 500, headers });
    
    const data = await kv.get("vectors_data");
    return new Response(data || JSON.stringify({ "vectors": [] }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
