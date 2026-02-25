export async function onRequest(context) {
  try {
    // 1. İhtimal: Veri "vectors_data" adıyla kaydedilmiş olabilir
    let data = await context.env.VECTOR_KV.get("vectors_data");
    
    // 2. İhtimal: Veri sadece "vectors" adıyla kaydedilmiş olabilir (Admin panelinin versiyonuna göre değişir)
    if (!data) {
      data = await context.env.VECTOR_KV.get("vectors");
    }

    if (!data) {
      return new Response(JSON.stringify({ "vectors": [] }), {
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(data, {
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
