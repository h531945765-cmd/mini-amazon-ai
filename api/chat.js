/**
 * Optional live AI API endpoint for Vercel deployments.
 * Keep OPENAI_API_KEY only in Vercel's server-side environment variables.
 * Without a key, frontend automatically uses an honest rule-based demo assistant.
 */
module.exports = async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI_NOT_CONFIGURED'});
  try{
    const {message,catalog}=req.body||{};
    if(typeof message!=='string'||message.trim().length<1||message.length>500)return res.status(400).json({error:'Invalid message'});
    if(!Array.isArray(catalog)||catalog.length>100)return res.status(400).json({error:'Invalid catalog'});
    const safeCatalog=catalog.map(p=>({name:String(p.name||'').slice(0,80),category:String(p.category||'').slice(0,40),price:Number(p.price)||0,rating:Number(p.rating)||0,description:String(p.description||'').slice(0,300)}));
    const instructions=`You are the shopping assistant inside MiniAmazon, a student's DEMO store in Saudi Arabia. Be concise, helpful, and natural. Answer in the user's language (Arabic or English). You MUST ONLY recommend products present in this sample catalog, and MUST use the exact name and price shown. All prices are in SAR. Interpret constraints such as category and prices under 300 SAR. You may compare catalog prices and ratings accurately. When asked for seller descriptions, generate a polished but honest description using only the available product facts, and do not invent specifications. Distinguish sample demo data from real Amazon listings. If a request is unavailable, say so. No real orders or payments. CATALOG (JSON): ${JSON.stringify(safeCatalog)}`;
    const abort=new AbortController();const kill=setTimeout(()=>abort.abort(),13000);
    let response;
    try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions,input:message,store:false,max_output_tokens:550}),signal:abort.signal})}finally{clearTimeout(kill)}
    const data=await response.json();
    if(!response.ok){console.error('AI upstream error',response.status);return res.status(502).json({error:'AI_PROVIDER_UNAVAILABLE'})}
    const output=(data.output||[]).flatMap(i=>i.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n').trim();
    if(!output)return res.status(502).json({error:'EMPTY_AI_RESPONSE'});
    return res.status(200).json({reply:output});
  }catch(err){console.error('AI request issue',err.name);return res.status(503).json({error:'AI_TEMPORARILY_UNAVAILABLE'})}
};
