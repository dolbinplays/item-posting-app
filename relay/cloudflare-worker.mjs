const OPENAI_RESPONSES_URL='https://api.openai.com/v1/responses';
const MAX_PHOTOS=4;
const MAX_BODY_BYTES=6*1024*1024;
const ALLOWED_FIELDS=['brand','model','itemType','category','color','dimensions','material','condition','testedStatus','accessories','missingParts','flaws','keywords','fbTitle'];

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

export default {
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(request,env)});
    if(request.method!=='POST')return json(request,env,405,{error:'Use POST for item recognition.'});
    if(!isAllowedOrigin(request,env))return json(request,env,403,{error:'Origin is not allowed.'});
    if(!env.OPENAI_API_KEY)return json(request,env,500,{error:'Relay is missing OPENAI_API_KEY.'});
    const contentLength=Number(request.headers.get('Content-Length')||0);
    if(contentLength>MAX_BODY_BYTES)return json(request,env,413,{error:'Recognition payload is too large.'});
    let body;
    try{body=await request.json()}catch{return json(request,env,400,{error:'Expected a JSON request body.'})}
    if(JSON.stringify(body).length>MAX_BODY_BYTES)return json(request,env,413,{error:'Recognition payload is too large.'});
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
