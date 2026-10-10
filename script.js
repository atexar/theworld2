/* Atexar: dependency-free interactions and deliberately bounded ambient motion. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const EMAIL = 'Vedanshdubey@atexar.in';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  try { paused = reduced.matches || localStorage.getItem('atexar-motion') === 'paused'; } catch (_) {}
  const menu = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu +'; mobileNav.hidden = true; };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? 'Close −' : 'Menu +'; mobileNav.hidden = !open;
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });
  window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));

  const progress = $('.progress');
  let scrollPending = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0}%`;
    scrollPending = false;
  };
  addEventListener('scroll', () => { if(!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();
  if ('IntersectionObserver' in window && !paused) {
    document.body.classList.add('js-motion');
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); reveal.unobserve(e.target); }
    }), {threshold:0.08});
    $$('.reveal').forEach(el => reveal.observe(el));
  }

  const signals = [
    ['01 / Make the value clear.', 'A focused message attracts the right interest and passes the buyer’s context into sales.'],
    ['02 / Give the next step an owner.', 'Qualification, buyer context, and a clear follow-up keep an opportunity from getting lost between conversations.'],
    ['03 / Coordinate the routine work.', 'Bounded workflows prepare, organise, and route tasks, with human review at the agreed decision points.'],
    ['04 / Learn from the whole journey.', 'Shared definitions connect activity to outcomes and help the team choose a useful next action.']
  ];
  $$('[data-signal]').forEach(button => button.addEventListener('click', () => {
    $$('[data-signal]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const [title, text] = signals[Number(button.dataset.signal)];
    $('#signal-copy h3').textContent = title; $('#signal-copy p').textContent = text;
  }));
  const phases = [
    ['01 / PROPOSED FOUNDATION', 'Define the problem worth solving.', ['Clarify the target customer and the workflow friction.', 'Map data, tools, handoffs, and current ownership.', 'Define a focused pilot and acceptance criteria.'], 'Readiness gate: a specific problem, an accountable owner, and an agreed first scope.'],
    ['02 / PROPOSED FOCUSED PILOTS', 'Prove one useful loop.', ['Build a bounded first workflow with agreed inputs and outputs.', 'Review real examples, missing information, and exception cases.', 'Measure task quality and effort against the starting point.'], 'Readiness gate: repeatable useful output, understood exceptions, and a documented handover.'],
    ['03 / PROPOSED CONNECTED WORKFLOWS', 'Carry context across the handoff.', ['Connect validated workflows only where the access and interfaces allow it.', 'Align lead definitions, task ownership, and follow-up rules.', 'Create a shared review of workflow health and outcomes.'], 'Readiness gate: reliable handoffs, clear data ownership, and evidence that the connection adds value.'],
    ['04 / PROPOSED UNIFIED PLATFORM', 'Build the shared operating layer.', ['Identify the recurring patterns across validated engagements.', 'Prioritise reusable capabilities and a coherent Genesis experience.', 'Define product access, support, and release criteria before launch.'], 'Readiness gate: validated recurring needs, stable capability boundaries, and a supported product scope.']
  ];
  $$('[data-phase]').forEach(button => button.addEventListener('click', () => {
    $$('[data-phase]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const [label,title,items,note] = phases[Number(button.dataset.phase)];
    const panel = $('#phase-panel');
    panel.querySelector('.eyebrow').textContent = label; panel.querySelector('h3').textContent = title;
    panel.querySelector('ul').replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    panel.querySelector('.note').textContent = note;
  }));

  const form = $('#brief-form');
  if (form) {
    const interest = new URLSearchParams(location.search).get('interest');
    if ([...form.elements.interest.options].some(o => o.value === interest)) form.elements.interest.value = interest;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = form.elements;
      const topic = f.interest.options[f.interest.selectedIndex].text;
      const subject = 'Atexar enquiry — ' + topic;
      const body = `Hello Vedansh,\n\nName: ${f.name.value.trim()}\nEmail: ${f.email.value.trim()}\nCompany / website: ${f.company.value.trim() || 'Not specified'}\nInterest: ${topic}\n\nOur current challenge:\n${f.message.value.trim()}\n\nBest,\n${f.name.value.trim()}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      $('#form-status').textContent = `Your email draft is ready to open. If no email app appears, copy your brief and email ${EMAIL}. Your message has not been sent by this website.`;
    });
    $('#brief-fields').disabled = false;
  }
  $('#copy-email')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); $('#copy-status').textContent = 'Email address copied.'; }
    catch (_) { $('#copy-status').textContent = `Please select and copy: ${EMAIL}`; }
  });

  // Galaxy: pre-render the dense starfield once, then composite it at a capped frame rate.
  const galaxy = $('#galaxy');
  const ctx = galaxy?.getContext('2d');
  const sky = document.createElement('canvas');
  const skyCtx = sky.getContext('2d');
  let w = 1, h = 1, dpr = 1, clock = 0, last = 0, animationId = 0;
  let pointerX = 0, pointerY = 0;
  let stars = [];
  let seed = 83291;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function makeSky() {
    if (!ctx || !skyCtx) return;
    w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    galaxy.width = Math.round(w*dpr); galaxy.height = Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    sky.width = Math.round(w*dpr); sky.height = Math.round(h*dpr); skyCtx.setTransform(dpr,0,0,dpr,0,0);
    seed = 83291;
    const cx = w*.65, cy = h*.44, reach = Math.max(w,h)*.75;
    skyCtx.clearRect(0,0,w,h);
    skyCtx.save(); skyCtx.translate(cx,cy); skyCtx.rotate(-.43);
    // A warm galactic core, cool dust clouds, and a slightly offset dark dust lane.
    for (let i=0;i<32;i++) {
      const x=(random()-.5)*reach*2, y=(random()-.5)*h*.12;
      const radius=60+random()*145;
      const g=skyCtx.createRadialGradient(x,y,0,x,y,radius);
      const color = i%3===0 ? '168,171,117' : i%2 ? '94,121,142' : '119,103,142';
      g.addColorStop(0,`rgba(${color},0.055)`); g.addColorStop(1,`rgba(${color},0)`);
      skyCtx.fillStyle=g; skyCtx.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    const count = w<700 ? 1250 : 2800;
    for (let i=0;i<count;i++) {
      const x=(random()-.5)*reach*2.2;
      const y=(random()+random()+random()-1.5)*h*.095;
      const central=1-Math.min(1,Math.abs(x)/reach);
      const alpha=.06+random()*.42;
      skyCtx.fillStyle=`rgba(${i%4===0?'215,225,170':'207,220,236'},${alpha})`;
      skyCtx.beginPath();skyCtx.arc(x,y,(.25+random()*.65)*(1+central*.3),0,Math.PI*2);skyCtx.fill();
    }
    skyCtx.restore();
    stars=Array.from({length:w<700?65:145},()=>({x:random()*w,y:random()*h,r:.3+random()*1.05,a:.2+random()*.6,p:random()*Math.PI*2}));
    drawSky();
  }
  function drawSky() {
    if(!ctx || !skyCtx) return;
    ctx.clearRect(0,0,w,h);
    ctx.save(); ctx.translate(w/2+pointerX*5,h/2+pointerY*3);ctx.rotate(Math.sin(clock*.025)*.018);ctx.drawImage(sky,-w/2,-h/2,w,h);ctx.restore();
    stars.forEach(s=>{ctx.globalAlpha=s.a*(.7+.3*Math.sin(clock*.6+s.p));ctx.fillStyle='#dbe5cf';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;
  }
  const sculpture=$('#sculpture'), art=sculpture?.getContext('2d');
  const mesh=art && window.AtexarSculpture ? window.AtexarSculpture.makeMesh(80,13) : null;
  let artW=0,artH=0,artVisible=true;
  function sizeArt(){
    if(!art || !mesh) return;
    const box=sculpture.getBoundingClientRect();artW=box.width;artH=box.height;
    const scale=Math.min(devicePixelRatio||1,1.35);sculpture.width=Math.round(artW*scale);sculpture.height=Math.round(artH*scale);art.setTransform(scale,0,0,scale,0,0);
    drawArt();document.body.classList.add('sculpture-ready');
  }
  function drawArt(){if(art&&mesh)window.AtexarSculpture.render(art,mesh,artW,artH,Math.sin(clock*.15)*.32+pointerX*.12,pointerY*.12);}
  if(sculpture && 'IntersectionObserver' in window) new IntersectionObserver(entries=>{artVisible=entries[0].isIntersecting;}).observe(sculpture);
  addEventListener('pointermove',e=>{if(!paused){pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5;}},{passive:true});
  function frame(now){
    if(paused||document.hidden){animationId=0;return;}
    if(now-last>40){clock+=Math.min((now-last)/1000,.05);last=now;drawSky();if(artVisible)drawArt();}
    animationId=requestAnimationFrame(frame);
  }
  function syncMotion(){
    document.body.classList.toggle('motion-paused',paused);
    $$('.motion-toggle').forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.textContent=paused?'Resume motion ▶':'Pause motion Ⅱ';});
    cancelAnimationFrame(animationId);animationId=0;
    if(!paused&&!document.hidden){last=performance.now();animationId=requestAnimationFrame(frame);}
  }
  $$('.motion-toggle').forEach(b=>b.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('atexar-motion',paused?'paused':'on');}catch(_){}syncMotion();}));
  reduced.addEventListener('change',e=>{paused=e.matches;syncMotion();});
  document.addEventListener('visibilitychange',syncMotion);
  let resizeId;
  addEventListener('resize',()=>{clearTimeout(resizeId);resizeId=setTimeout(()=>{makeSky();sizeArt();updateProgress();},150);});
  makeSky();sizeArt();syncMotion();
})();
