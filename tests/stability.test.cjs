const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('stopping while camera permission is pending releases the late stream', async () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const start = html.match(/    async function startWithConstraints\(label,constraints\)\{[\s\S]*?\n    \}/)[0];
  const stop = html.match(/    function stopCamera\(\)\{[^\n]+/)[0];
  let resolveCamera, stopped = 0, played = 0;
  const context = {
    cameraRequest:0, stream:null, video:{play(){played++}},
    navigator:{mediaDevices:{getUserMedia:()=>new Promise(resolve=>{resolveCamera=resolve})}},
    updateDiag(){}, setLastError(){}, updateCapturePresetInfo(){}, log(){}, $:()=>({})
  };
  const opening = vm.runInNewContext(start+'\n'+stop+'\nstartWithConstraints("Rear",{})',context);
  context.stopCamera();
  resolveCamera({getTracks:()=>[{stop(){stopped++}}]});
  await opening;
  assert.equal(stopped,1);
  assert.equal(played,0);
  assert.equal(context.stream,null);
});

test('capture clears UI and preserves previous shots on interruption or save failure', async () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const source = html.match(/    async function autoCapture\(\)\{[\s\S]*?\n    \}/)[0];
  for (const failure of ['disconnect', 'storage', 'none']) {
    const elements = new Map();
    const saved = [];
    const camera = {active:true};
    const context = vm.createContext({
      stream:camera, capturing:false, getSelectedPreset:()=>({rotation:1}),
      $:id=>{
        if(!elements.has(id))elements.set(id,{style:{}});
        return elements.get(id);
      },
      setTimeout:callback=>callback(), performance:{now:()=>0},
      updateCapturePresetInfo(){}, beep(){}, buzz(){}, captureQualityText:()=> '',
      captureCameraPhoto:async label=>{
        if(failure==='disconnect')camera.active=false;
        return {label};
      },
      setShots:shots=>{
        if(failure==='storage')return false;
        saved.push(...shots);
        return true;
      }
    });
    await vm.runInContext(source+'\nautoCapture()',context);
    assert.equal(context.capturing,false);
    assert.equal(elements.get('countdown').style.display,'none');
    assert.equal(saved.length,failure==='none'?4:0);
    assert.match(elements.get('captureStatus').textContent,failure==='none'?/Capture complete/:/Previous captures are unchanged/);
  }
});

test('offline shell survives server failures and unrelated caches survive activation', async () => {
  const handlers = {}, removed = [], shell = new Response('app shell');
  let network = async ()=>new Response('failure',{status:503});
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{
    URL, Response, fetch:request=>network(request),
    self:{registration:{scope:'https://example.test/app/'},clients:{claim(){}},addEventListener:(name,fn)=>{handlers[name]=fn}},
    caches:{
      keys:async()=>['other-app','item-posting-assistant-shell-old'],
      delete:async key=>removed.push(key),
      match:async()=>shell
    }
  });
  let result;
  handlers.activate({waitUntil:promise=>{result=promise}});
  await result;
  assert.deepEqual(removed,['item-posting-assistant-shell-old']);
  const navigate=()=>handlers.fetch({request:{url:'https://example.test/app/',method:'GET',mode:'navigate'},respondWith:promise=>{result=promise}});
  navigate();
  assert.equal(await result,shell);
  network=async()=>{throw new Error('offline')};
  navigate();
  assert.equal(await result,shell);
});
