const OPENAI_RESPONSES_URL='https://api.openai.com/v1/responses';
const MAX_PHOTOS=4;
const MAX_COMPARABLE_SCREENSHOTS=8;
const MAX_BODY_BYTES=6*1024*1024;
const ALLOWED_FIELDS=['brand','model','itemType','category','color','dimensions','material','condition','testedStatus','accessories','missingParts','flaws','keywords','fbTitle'];
const COMPARABLE_HOSTS=['ebay.com','facebook.com','mercari.com','offerup.com'];

function corsHeaders(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=String(env.ALLOWED_ORIGIN||'').trim();
  const allowOrigin=!allowed||allowed==='*'||origin===allowed?(origin||'*'):'';
  return {
    'Access-Control-Allow-Origin':allowOrigin,
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin'
  }
}

function json(request,env,status,payload){
  return new Response(JSON.stringify(payload),{status,headers:{...corsHeaders(request,env),'Content-Type':'application/json;charset=UTF-8','Cache-Control':'no-store'}})
}

function isAllowedOrigin(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=String(env.ALLOWED_ORIGIN||'').trim();
  return !allowed||allowed==='*'||origin===allowed
}

function responseOutputText(response){
  for(const item of response?.output||[]){
    for(const content of item?.content||[]){
      if(content?.type==='output_text'&&content.text)return content.text
    }
  }
  return ''
}

function decodeHtml(value=''){
  return String(value).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function metaContent(html,key){
  const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns=[new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,'i'),new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,'i')];
  for(const pattern of patterns){const match=html.match(pattern);if(match)return decodeHtml(match[1])}
  return ''
}

function comparableMarketplace(host){
  if(host.endsWith('ebay.com'))return 'eBay Active';
  if(host.endsWith('facebook.com'))return 'Facebook Marketplace';
  if(host.endsWith('mercari.com'))return 'Mercari';
  if(host.endsWith('offerup.com'))return 'OfferUp';
  return 'Other'
}

async function lookupComparable(request,env,body){
  let target;
  try{target=new URL(String(body?.url||''))}catch{return json(request,env,400,{error:'Paste a valid marketplace listing URL.'})}
  if(target.protocol!=='https:')return json(request,env,400,{error:'Comparable lookup requires an HTTPS URL.'});
  const host=target.hostname.toLowerCase().replace(/^www\./,'');
  if(!COMPARABLE_HOSTS.some(allowed=>host===allowed||host.endsWith('.'+allowed)))return json(request,env,400,{error:'Comparable lookup supports eBay, Facebook Marketplace, Mercari, and OfferUp URLs only.'});
  const upstream=await fetch(target.href,{headers:{'User-Agent':'Mozilla/5.0 (compatible; ItemPostingAssistant/1.0)','Accept':'text/html,application/xhtml+xml'}});
  if(!upstream.ok)return json(request,env,502,{error:`Marketplace returned HTTP ${upstream.status}. Enter the visible price manually.`});
  const html=(await upstream.text()).slice(0,1200000);
  const title=metaContent(html,'og:title')||metaContent(html,'twitter:title')||decodeHtml((html.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'');
  const price=metaContent(html,'product:price:amount')||metaContent(html,'og:price:amount')||metaContent(html,'twitter:data1')||'';
  return json(request,env,200,{contractVersion:'comparable-url-v1',marketplace:comparableMarketplace(host),url:target.href,title:String(title||'').slice(0,240),price:String(price||'').match(/[0-9]+(?:\.[0-9]{1,2})?/)?.[0]||''})
}

function recognitionSchema(){
  return {
    type:'object',
    additionalProperties:false,
    required:['notes','suggestions'],
    properties:{
      notes:{type:'string'},
      suggestions:{
        type:'array',
        maxItems:14,
        items:{
          type:'object',
          additionalProperties:false,
          required:['field','value','reason'],
          properties:{
            field:{type:'string',enum:ALLOWED_FIELDS},
            value:{type:'string'},
            reason:{type:'string'}
          }
        }
      }
    }
  }
}

function comparableScreenshotSchema(){
  return {
    type:'object',
    additionalProperties:false,
    required:['listings'],
    properties:{
      listings:{
        type:'array',
        maxItems:MAX_COMPARABLE_SCREENSHOTS,
        items:{
          type:'object',
          additionalProperties:false,
          required:['screenshotIndex','marketplace','title','price','notes'],
          properties:{
            screenshotIndex:{type:'integer'},
            marketplace:{type:'string',enum:['Facebook Marketplace','eBay Sold','eBay Active','Mercari','OfferUp','Other']},
            title:{type:'string'},
            price:{type:'string'},
            notes:{type:'string'}
          }
        }
      }
    }
  }
}

async function recognizeComparableScreenshot(request,env,body){
  const screenshots=(Array.isArray(body?.screenshots)?body.screenshots:[]).slice(0,MAX_COMPARABLE_SCREENSHOTS).filter(s=>/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(s?.dataUrl||'')));
  if(!screenshots.length)return json(request,env,400,{error:'Include one or more compressed listing screenshots.'});
  const prompt=`Read these ${screenshots.length} resale-marketplace listing screenshots. Return one result for each screenshot in the same index order. Extract the marketplace, visible listing title, visible item price, and a short note with useful visible context such as condition, sold status, or shipping. Do not invent hidden details. Return an empty string for a field that is not clearly visible.`;
  const content=[{type:'input_text',text:prompt},...screenshots.flatMap((s,index)=>[{type:'input_text',text:`Screenshot index ${index}: ${String(s.fileName||'listing screenshot').slice(0,120)}`},{type:'input_image',image_url:s.dataUrl,detail:'auto'}])];
  const upstream=await fetch(OPENAI_RESPONSES_URL,{method:'POST',headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({
    model:env.OPENAI_MODEL||'gpt-5.4-mini',
    input:[{role:'user',content}],
    text:{format:{type:'json_schema',name:'comparable_screenshot',strict:true,schema:comparableScreenshotSchema()}}
  })});
  const response=await upstream.json();
  if(!upstream.ok)return json(request,env,502,{error:'OpenAI screenshot recognition failed.',upstreamStatus:upstream.status,upstreamError:response?.error?.message||'Unknown upstream error'});
  let parsed;
  try{parsed=JSON.parse(responseOutputText(response))}catch{return json(request,env,502,{error:'OpenAI returned an unreadable screenshot-recognition response.'})}
  return json(request,env,200,{provider:'openai-responses-api',model:env.OPENAI_MODEL||'gpt-5.4-mini',listings:Array.isArray(parsed.listings)?parsed.listings:[]})
}

export default {
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(request,env)});
    if(request.method!=='POST')return json(request,env,405,{error:'Use POST for item recognition.'});
    if(!isAllowedOrigin(request,env))return json(request,env,403,{error:'Origin is not allowed.'});
    const contentLength=Number(request.headers.get('Content-Length')||0);
    if(contentLength>MAX_BODY_BYTES)return json(request,env,413,{error:'Recognition payload is too large.'});
    let body;
    try{body=await request.json()}catch{return json(request,env,400,{error:'Expected a JSON request body.'})}
    if(JSON.stringify(body).length>MAX_BODY_BYTES)return json(request,env,413,{error:'Recognition payload is too large.'});
    if(body?.contractVersion==='comparable-url-v1')return lookupComparable(request,env,body);
    if(!env.OPENAI_API_KEY)return json(request,env,500,{error:'Relay is missing OPENAI_API_KEY.'});
    if(body?.contractVersion==='comparable-screenshot-v1')return recognizeComparableScreenshot(request,env,body);
    if(body?.contractVersion!=='item-recognition-v1')return json(request,env,400,{error:'Unsupported recognition contract.'});
    const photos=(Array.isArray(body.photos)?body.photos:[]).slice(0,MAX_PHOTOS).filter(p=>/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(p?.dataUrl||'')));
    if(!photos.length)return json(request,env,400,{error:'Include at least one base64 listing photo.'});
    const item=body.item&&typeof body.item==='object'?body.item:{};
    const prompt=`Review these resale listing photos and the seller-entered item fields. Return only well-supported suggestions. Be cautious: do not invent an exact model number, included accessory, flaw, or tested status unless the photos or seller fields support it. Use concise Facebook Marketplace wording.

Seller-entered item fields:
${JSON.stringify(item,null,2)}`;
    const content=[{type:'input_text',text:prompt},...photos.map(p=>({type:'input_image',image_url:p.dataUrl,detail:'auto'}))];
    const upstream=await fetch(OPENAI_RESPONSES_URL,{method:'POST',headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({
      model:env.OPENAI_MODEL||'gpt-5.4-mini',
      input:[{role:'user',content}],
      text:{format:{type:'json_schema',name:'item_recognition',strict:true,schema:recognitionSchema()}}
    })});
    const response=await upstream.json();
    if(!upstream.ok)return json(request,env,502,{error:'OpenAI recognition request failed.',upstreamStatus:upstream.status,upstreamError:response?.error?.message||'Unknown upstream error'});
    let parsed;
    try{parsed=JSON.parse(responseOutputText(response))}catch{return json(request,env,502,{error:'OpenAI returned an unreadable recognition response.'})}
    return json(request,env,200,{provider:'openai-responses-api',model:env.OPENAI_MODEL||'gpt-5.4-mini',notes:String(parsed.notes||''),suggestions:Array.isArray(parsed.suggestions)?parsed.suggestions:[]})
  }
};
