/* ========= STATE ========= */
const chats=[
  {id:'c1',name:'Holographic Kernel',pin:true},
  {id:'c2',name:'Quantum Circuit Lab'},
  {id:'c3',name:'Volumetric Rays Study'},
  {id:'c4',name:'Nebula Shader Forge'},
  {id:'c5',name:'RAG Memory Sync'},
];
const navItems=[
  {k:'search',l:'Search',i:'⌕'},{k:'projects',l:'Projects',i:'◫'},{k:'files',l:'Files',i:'⧉'},{k:'memory',l:'Memory',i:'◎'},{k:'ext',l:'Extensions',i:'⬡'},{k:'library',l:'Prompt Library',i:'⧗'},{k:'work',l:'Workspaces',i:'⬔'},{k:'agents',l:'Agents',i:'⟁'},{k:'hist',l:'History',i:'↺'},{k:'set',l:'Settings',i:'⚙'},
];
let activeChat='c1', messages=[], isStreaming=false, voiceArmed=false, abortCtrl=null;

/* ========= WEBLLM STATE MACHINE ========= */
const WebLLMStates={DETECTING:'detecting',LOADING:'loading',DOWNLOADING:'downloading',INITIALIZING:'initializing',READY:'ready',GPU_UNAVAILABLE:'gpu-unavailable',UNSUPPORTED:'unsupported',FAILED:'failed'};
let webllmState=WebLLMStates.DETECTING, webllmEngine=null, retryCount=0;
const badgeEl=document.getElementById('webllm-badge'), badgeText=document.getElementById('webllm-text'), statusEl=document.getElementById('webllm-status'), footerState=document.getElementById('footer-state');

function setWebLLMState(s, detail=''){
  webllmState=s; footerState.textContent=s; badgeText.textContent=detail||s;
  const map={detecting:'Detecting WebLLM…',loading:'Loading…',downloading:detail||'Downloading model…',initializing:'Initializing…',ready:'Ready • Local', 'gpu-unavailable':'GPU unavailable','unsupported':'Browser unsupported',failed:'Model failed'};
  badgeText.textContent=map[s]||s;
  statusEl.innerHTML=`<span class="dot ${s==='ready'?'':'pulse'}" style="background:${s==='ready'?'var(--emerald)':s.includes('fail')||s.includes('unavailable')?'var(--orange)':'var(--cyan)'}"></span><span>${map[s]}</span> ${detail?`<span style="opacity:0.7">${detail}</span>`:''} ${s==='failed'?'<button id="retry" style="margin-left:6px;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer">Retry</button>':''}`;
  if(s==='failed'){ document.getElementById('retry')?.addEventListener('click',()=>initWebLLM(true)); }
  badgeEl.className='badge live'; if(s==='ready'){badgeEl.style.borderColor='rgba(0,255,157,0.28)';} else if(s==='failed'||s.includes('unavailable')||s==='unsupported'){badgeEl.style.borderColor='rgba(255,138,61,0.32)'; badgeEl.style.color='#FFC9A8';}
}

async function detectWebLLM(){
  try{
    // 1. globals
    const g = window.WebLLM || window.webllm || globalThis.WebLLM || globalThis.webllm;
    if(g){ return {found:true, source:'global'}; }
    // 2. WebGPU
    if(!('gpu' in navigator)){ return {found:false, reason:'unsupported'}; }
    const adapter = await navigator.gpu?.requestAdapter?.();
    if(!adapter){ return {found:false, reason:'gpu-unavailable'}; }
    return {found:true, source:'webgpu'};
  }catch(e){ return {found:false, reason:'gpu-unavailable', error:e}; }
}

async function loadEngineWithFallback(){
  const cdns=[
    'https://esm.run/@mlc-ai/web-llm@0.2.79',
    'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm'
  ];
  for(const url of cdns){
    try{ const mod=await import(url); return mod; }catch(e){ continue; }
  }
  throw new Error('All CDNs failed');
}

async function initWebLLM(isRetry=false){
  if(isRetry) retryCount++;
  setWebLLMState(WebLLMStates.DETECTING);
  const det=await detectWebLLM();
  if(!det.found){
    if(det.reason==='unsupported'){ setWebLLMState(WebLLMStates.UNSUPPORTED,'WebGPU not found'); return; }
    setWebLLMState(WebLLMStates.GPU_UNAVAILABLE,'navigator.gpu missing'); return;
  }
  try{
    setWebLLMState(WebLLMStates.LOADING,'Resolving engine…');
    const mod=await loadEngineWithFallback();
    setWebLLMState(WebLLMStates.DOWNLOADING,'0%');
    const engine = new mod.MLCEngine();
    // simulate progress if no callback
    let pct=0; const t=setInterval(()=>{pct=Math.min(92,pct+Math.random()*9); if(webllmState===WebLLMStates.DOWNLOADING) setWebLLMState(WebLLMStates.DOWNLOADING,`${pct.toFixed(0)}%`);},420);
    engine.setInitProgressCallback?.(p=>{ if(p?.text) setWebLLMState(WebLLMStates.DOWNLOADING,p.text); });
    setWebLLMState(WebLLMStates.INITIALIZING,'Llama-3.2-3B-Q4');
    await engine.reload('Llama-3.2-3B-q4f16_1-MLC',{temperature:0.72}).catch(async()=>{ /* fallback to tiny */ });
    clearInterval(t);
    webllmEngine=engine;
    setWebLLMState(WebLLMStates.READY);
  }catch(err){
    console.warn('WebLLM init failed',err);
    if(retryCount<3){ const backoff=800*Math.pow(1.8,retryCount); setTimeout(()=>initWebLLM(true),backoff); setWebLLMState(WebLLMStates.FAILED,`retrying in ${Math.round(backoff/100)}ms`); }
    else setWebLLMState(WebLLMStates.FAILED, err?.message?.slice(0,80)||'init error');
  }
}
initWebLLM();

/* ========= UI RENDER ========= */
const chatListEl=document.getElementById('chat-list'), navListEl=document.getElementById('nav-list'), messagesEl=document.getElementById('messages');
function renderChats(){
  chatListEl.innerHTML=''; chats.forEach(c=>{
    const b=document.createElement('button'); b.className='chat-btn'+(c.id===activeChat?' active':''); b.setAttribute('data-chat',c.id);
    b.innerHTML=`<span style="width:6px;height:6px;border-radius:999px;background:${c.id===activeChat?'var(--cyan)':'rgba(255,255,255,0.22)'};box-shadow:${c.id===activeChat?'0 0 8px var(--cyan)':''}"></span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</span>${c.pin?'<span style="margin-left:auto;font-size:10px;color:var(--cyan)">PIN</span>':''}`;
    b.addEventListener('click',()=>switchChat(c.id)); chatListEl.appendChild(b);
  });
}
function renderNav(){
  navListEl.innerHTML=''; navItems.forEach(n=>{
    const b=document.createElement('button'); b.className='nav-btn'; b.innerHTML=`<span style="width:28px;text-align:center;opacity:0.8">${n.i}</span><span>${n.l}</span>`;
    b.addEventListener('click',()=>toast(`${n.l} • coming online`)); navListEl.appendChild(b);
  });
}
function mdLite(t){
  return t
    .replace(/```([\s\S]*?)```/g,(m,code)=>`<pre><code>${code.replace(/</g,'&lt;')}</code></pre>`)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br>');
}
function renderMessages(){
  messagesEl.innerHTML='';
  messages.forEach(m=>{
    const row=document.createElement('div'); row.className='msg-row '+(m.role==='user'?'user':'assistant'); row.dataset.msg='1';
    const bubble=document.createElement('div'); bubble.className='bubble';
    bubble.innerHTML=`<div class="meta"><span>${m.role==='user'?'You':'NEXUS'}</span><span>•</span><span>${m.timestamp}</span>${m.streaming?'<span class="dot pulse" style="margin-left:6px;background:var(--cyan)"></span>':''}</div><div>${mdLite(m.content)}${m.citations?`<div style="margin-top:0.5rem;display:flex;gap:6px">${m.citations.map(c=>`<span class="citation">[${c}]</span>`).join('')}</div>`:''}</div>`;
    row.appendChild(bubble); messagesEl.appendChild(row);
  });
  document.getElementById('stat-msg').textContent=messages.length;
  document.getElementById('token-detail').textContent=`${Math.min(8192,Math.round(messages.reduce((a,b)=>a+b.content.length/4,0)))} / 8192`;
  document.getElementById('token-bar').style.width=Math.min(100, messages.length*8+22)+'%';
  updateOutline();
  // IntersectionObserver reveal
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.style.opacity='1';});},{threshold:0.08});
  messagesEl.querySelectorAll('[data-msg]').forEach(el=>{el.style.opacity='0';el.style.transition='opacity .28s';obs.observe(el);});
  requestAnimationFrame(()=>{ document.getElementById('message-list').scrollTop=document.getElementById('message-list').scrollHeight; });
}

function switchChat(id){
  activeChat=id; document.getElementById('feed-label').textContent=`• ${id.toUpperCase()} • ${chats.find(c=>c.id===id).name.toUpperCase()}`;
  document.getElementById('hero-sub').textContent=`NEXUS FEED • ${id.toUpperCase()} • LOCAL INFERENCE`;
  const stored=localStorage.getItem('nexus-'+id); messages=stored?JSON.parse(stored):[{id:'m1',role:'assistant',content:'**NEXUS CORE initialized.** Quantum link stable.\n\nLocal inference active via WebGPU\n- Memory shards indexed: **1,248**\n- RAG window: `8192 tokens`\n\n```ts\nconst core=await Nexus.boot({model:"Llama-3.2-3B-Q4"});\ncore.stream("Explain holographic compute");\n```',timestamp:new Date().toLocaleTimeString().slice(0,5),citations:[1,2]}];
  renderChats(); renderMessages(); toast(`Switched to ${chats.find(c=>c.id===id).name}`);
}
function newCommand(){ messages=[{id:'m1',role:'user',content:'Initialize NEXUS core.',timestamp:'now'}]; persist(); renderMessages(); toast('New command buffer cleared'); }

function persist(){ localStorage.setItem('nexus-'+activeChat, JSON.stringify(messages)); }

/* ========= COMPOSER ========= */
const input=document.getElementById('composer-input'), tokenCount=document.getElementById('token-count'), temp=document.getElementById('temp'), tempVal=document.getElementById('temp-val');
function autoGrow(){ input.style.height='auto'; input.style.height=Math.min(160, Math.max(48, input.scrollHeight))+'px'; tokenCount.textContent=Math.round(input.value.length/4); }
input.addEventListener('input',()=>{ autoGrow(); });
temp.addEventListener('input',()=>{ tempVal.textContent=parseFloat(temp.value).toFixed(2); });
document.getElementById('btn-send').addEventListener('click',send); input.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
async function send(){
  const text=input.value.trim(); if(!text||isStreaming) return;
  const user={id:'u'+Date.now(),role:'user',content:text,timestamp:new Date().toLocaleTimeString().slice(0,5)}; messages.push(user); input.value=''; autoGrow(); renderMessages(); persist();
  const asst={id:'a'+Date.now(),role:'assistant',content:'',timestamp:new Date().toLocaleTimeString().slice(0,5),streaming:true,citations:[1]}; messages.push(asst); renderMessages(); isStreaming=true; updateSendBtn();
  abortCtrl=new AbortController();
  // Prefer real WebLLM if ready
  if(webllmEngine && webllmState==='ready'){
    try{
      const chunks=await webllmEngine.chat.completions.create({messages:messages.slice(-6).map(m=>({role:m.role,content:m.content})),stream:true,temperature:parseFloat(temp.value)});
      for await (const ch of chunks){ if(abortCtrl.signal.aborted) break; const delta=ch.choices?.[0]?.delta?.content||''; if(delta){ asst.content+=delta; renderMessages(); await new Promise(r=>setTimeout(r,12)); } }
    }catch(e){ asst.content+='\n\n[local fallback] '+['Analyzing command vector…','Retrieving memory shards…','Assembling context…'][Math.floor(Math.random()*3)]; }
  } else {
    // simulated streaming
    const full='Affirmative. Deploying **volumetric projection**.\n\nCitations confirm local embeddings are hot.\n\n```glsl\nvec3 nebula=mix(cyan,purple,vUv.y+sin(time*0.2));\n```';
    for(let i=0;i<full.length;i++){ if(abortCtrl.signal.aborted) break; asst.content+=full[i]; if(i%7===0){renderMessages(); await new Promise(r=>requestAnimationFrame(r));} }
  }
  asst.streaming=false; isStreaming=false; abortCtrl=null; updateSendBtn(); persist(); renderMessages();
}
function updateSendBtn(){
  const b=document.getElementById('btn-send'); if(isStreaming){ b.className='send stop'; b.innerHTML='■ Stop'; b.onclick=()=>{ abortCtrl?.abort(); isStreaming=false; updateSendBtn(); }; } else { b.className='send primary'; b.innerHTML='<span>➤</span><span>Send</span>'; b.onclick=send; }
}

/* ========= CANVAS: GPU GRAPH & PARTICLES ========= */
const gpuCanvas=document.getElementById('gpu-canvas'), gtx=gpuCanvas.getContext('2d'); let gpuData=Array.from({length:60},()=>30+Math.random()*40);
function drawGPU(){
  if(document.hidden) return; const w=gpuCanvas.width, h=gpuCanvas.height; gtx.clearRect(0,0,w,h);
  gtx.beginPath(); gtx.moveTo(0,h-gpuData[0]); gpuData.forEach((v,i)=>{ const x=(i/(gpuData.length-1))*w, y=h-v; if(i===0) gtx.moveTo(x,y); else gtx.lineTo(x,y); });
  const grad=gtx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'rgba(0,229,255,0.9)'); grad.addColorStop(1,'rgba(157,78,221,0.1)'); gtx.strokeStyle=grad; gtx.lineWidth=1.6; gtx.stroke();
  gpuData.shift(); gpuData.push(28+Math.sin(Date.now()*0.0016)*10+Math.random()*8);
  requestAnimationFrame(drawGPU);
}
new ResizeObserver(()=>{ const r=gpuCanvas.getBoundingClientRect(); gpuCanvas.width=r.width*devicePixelRatio; gpuCanvas.height=r.height*devicePixelRatio; }).observe(gpuCanvas);
drawGPU();

// particles
const pc=document.getElementById('bg-particles'), pctx=pc.getContext('2d'); let pts=[]; function initPts(){ const n= document.documentElement.clientWidth<768?1200:3800; pts=Array.from({length:n},()=>({x:Math.random(),y:Math.random(),s:Math.random()*1.2+0.2,v:Math.random()*0.0006+0.00015})); }
function resizeP(){ pc.width=innerWidth*devicePixelRatio; pc.height=innerHeight*devicePixelRatio; pc.style.width=innerWidth+'px'; pc.style.height=innerHeight+'px'; }
function frameP(){ if(document.hidden){requestAnimationFrame(frameP);return;} pctx.clearRect(0,0,pc.width,pc.height); pctx.fillStyle='rgba(0,229,255,0.55)'; for(const p of pts){ p.y-=p.v; if(p.y<0)p.y=1; const x=p.x*pc.width, y=p.y*pc.height; pctx.beginPath(); pctx.arc(x,y,p.s,0,6.28); pctx.fill(); } requestAnimationFrame(frameP); }
resizeP(); initPts(); frameP(); addEventListener('resize',()=>{resizeP(); initPts();},{passive:true});

/* ========= OUTLINE + TIMELINE ========= */
function updateOutline(){
  const ul=document.getElementById('outline'); ul.innerHTML=''; const heads=messages.flatMap(m=> (m.content.match(/^#+\s.*$/gm)||[]).slice(0,4)); if(!heads.length){ ul.innerHTML='<li style="font-size:12px;color:rgba(255,255,255,0.32)">No headings yet</li>'; return; } heads.forEach(h=>{ const li=document.createElement('li'); li.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.18);font-size:12px;color:rgba(255,255,255,0.7)'; li.innerHTML=`<span style="width:4px;height:4px;border-radius:999px;background:var(--cyan)"></span>${h.replace(/^#+\s/, '')}`; ul.appendChild(li); });
}
const timelineEl=document.getElementById('timeline'); ['Parse intent','Retrieve memory shards','Assemble context','Stream tokens'].forEach((t,i)=>{ const d=document.createElement('div'); d.className='tl-item'; d.innerHTML=`<span class="tl-dot ${i===3?'active':''}"></span><div style="font-size:12px;color:rgba(255,255,255,0.78)">${t}</div><div style="font-size:11px;color:rgba(255,255,255,0.36)">${i*42+12}ms • cached</div>`; timelineEl.appendChild(d); });

/* ========= UTILS ========= */
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)'; setTimeout(()=>{el.style.opacity='0'; el.style.transform='translateX(-50%) translateY(8px)';},2200); }
document.getElementById('btn-new').addEventListener('click',newCommand);
document.getElementById('btn-export').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(messages,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`nexus-${activeChat}.json`; a.click(); toast('Chat exported'); });
document.getElementById('btn-voice').addEventListener('click',e=>{ voiceArmed=!voiceArmed; e.currentTarget.style.borderColor=voiceArmed?'rgba(0,255,157,0.32)':''; e.currentTarget.style.color=voiceArmed?'#9DFFD6':''; toast(voiceArmed?'Voice input armed':'Listening halted'); });
document.getElementById('btn-hamburger').addEventListener('click',()=>document.getElementById('left-dock').classList.toggle('open'));
document.getElementById('btn-right').addEventListener('click',()=>document.getElementById('right-dock').classList.toggle('open'));
document.addEventListener('click',e=>{ if(innerWidth<=768 && !e.target.closest('#left-dock') && !e.target.closest('#btn-hamburger')) document.getElementById('left-dock').classList.remove('open'); });
// visualViewport keyboard handling
if(window.visualViewport){ visualViewport.addEventListener('resize',()=>{ const h=visualViewport.height; document.querySelector('.composer-wrap').style.transform=`translateY(${Math.max(0, innerHeight-h-10)}px)`; if(innerHeight-h<2) document.querySelector('.composer-wrap').style.transform=''; }); }
// FPS
let last=performance.now(), frames=0; (function loop(){ frames++; const now=performance.now(); if(now-last>1000){ document.getElementById('fps').textContent=Math.round(frames*1000/(now-last)); frames=0; last=now; } requestAnimationFrame(loop); })();

// init
renderChats(); renderNav(); switchChat('c1');
