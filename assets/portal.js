/* Utilidades comunes del portal: iconos, transiciones, efectos de tarjetas, barra superior */
(function(){
  var ICONS={
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
    code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    rocket:'<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-5-5 6-6z"/><circle cx="15" cy="9" r="1.5"/>',
    term:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9l3 3-3 3M12 15h5"/>',
    net:'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-6 5M12 11.5l6 5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    db:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
  };
  function icon(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n]||ICONS.code)+'</svg>'}
  var ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var subjects=window.ASIR.subjects;
  function find(slug){return subjects.filter(function(s){return s.slug===slug})[0]}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* fondo + barra superior */
  function chrome(active){
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="aurora"><i></i><i></i><i></i></div><div class="grid-bg"></div><div class="curtain" id="curtain"></div>'+
      '<header class="nav"><a class="brand" href="index.html"><b>'+icon('code').replace('<svg','<svg width="20" height="20" style="color:#fff"')+'</b><span>ASIR 2</span></a>'+
      '<nav class="links"><a class="pill'+(active==='home'?' on':'')+'" href="index.html">Asignaturas</a><a class="pill'+(active==='perfil'?' on':'')+'" href="perfil.html">Mi progreso</a></nav></header>');
  }

  /* transición de cortina */
  function curtainIn(){
    var c=document.getElementById('curtain');if(!c)return;
    if(sessionStorage.getItem('asir.curtain')){c.style.setProperty('--cc',sessionStorage.getItem('asir.curtain'));sessionStorage.removeItem('asir.curtain');c.classList.add('down')}
    document.body.classList.add('entering');
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||a.target||e.metaKey||e.ctrlKey||e.shiftKey||/^(https?:|#|mailto:)/.test(a.getAttribute('href')))return;
    var c=document.getElementById('curtain');if(!c||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    e.preventDefault();var col=getComputedStyle(a).getPropertyValue('--c').trim()||'#7c7bff';
    c.style.setProperty('--cc',col);c.classList.add('up');
    try{sessionStorage.setItem('asir.curtain',col)}catch(x){}
    setTimeout(function(){location.href=a.href},430);
  });
  window.addEventListener('pageshow',function(e){if(e.persisted){var c=document.getElementById('curtain');if(c)c.className='curtain'}});

  /* aparición escalonada + luz que sigue al ratón + inclinación 3D */
  function animate(sel,step){
    var els=[].slice.call(document.querySelectorAll(sel));
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.08});
    els.forEach(function(el,i){el.style.transitionDelay=(i*step)+'ms';io.observe(el)});
    setTimeout(function(){els.forEach(function(el){el.style.transitionDelay='0ms'})},els.length*step+900);
  }
  function fx(sel,tilt){
    document.querySelectorAll(sel).forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        el.style.setProperty('--mx',x+'px');el.style.setProperty('--my',y+'px');
        if(tilt&&e.pointerType==='mouse')el.style.transform='rotateX('+(((y/r.height)-.5)*-8)+'deg) rotateY('+(((x/r.width)-.5)*8)+'deg) translateY(-6px)';
      });
      el.addEventListener('pointerleave',function(){el.style.transform=''});
    });
  }
  /* contador animado */
  function count(el,to,suffix){
    var t0=performance.now(),d=900;suffix=suffix||'';
    (function f(t){var p=Math.min(1,(t-t0)/d),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=v+suffix;if(p<1)requestAnimationFrame(f)})(t0);
  }
  /* datos de usuario */
  function rd(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  window.Portal={icon:icon,ARROW:ARROW,find:find,esc:esc,chrome:chrome,curtainIn:curtainIn,animate:animate,fx:fx,count:count,rd:rd,subjects:subjects};
})();
