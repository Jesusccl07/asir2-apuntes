/* ASO · Tema 2 — lógica de la página: navegación, laboratorios, práctica y test con rachas */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rd=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=window.T2_QUESTIONS||[], TOP=window.T2_TOPICS||{}, SCR=window.T2_SCRIPTS||{};

/* ───── utilidades visuales ───── */
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function confetti(n=70){if(reduce)return;const cs=['#34d399','#60a5fa','#a78bfa','#fbbf24','#fb7185','#f472b6'];
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='confetti';d.style.left=Math.random()*100+'vw';d.style.background=cs[i%cs.length];
    d.style.animationDuration=(1.6+Math.random()*1.6)+'s';d.style.animationDelay=Math.random()*.4+'s';d.style.borderRadius=Math.random()>.5?'50%':'2px';
    document.body.appendChild(d);setTimeout(()=>d.remove(),3800)}}
function copyText(txt,btn){const done=()=>{if(btn){const o=btn.textContent;btn.textContent='¡Copiado!';btn.classList.add('ok');setTimeout(()=>{btn.textContent=o;btn.classList.remove('ok')},1400)}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,()=>fallback());else fallback();
  function fallback(){const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();done()}}

/* ───── tema claro/oscuro ───── */
const root=document.documentElement,savedTheme=rd('t2.theme',null);
if(savedTheme)root.dataset.theme=savedTheme;
$('#themeBtn').onclick=()=>{const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;root.dataset.theme=dark?'light':'dark';wr('t2.theme',root.dataset.theme)};

/* ───── racha de días ───── */
const today=new Date().toISOString().slice(0,10);
const days=rd('t2.days',[]);if(days[days.length-1]!==today){days.push(today);wr('t2.days',days.slice(-400))}
function dayStreak(){let n=0,d=new Date();const set=new Set(rd('t2.days',[]));while(set.has(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}return n}
(()=>{const n=dayStreak();$('#dsN').textContent=n;$('#dayStreak b').textContent=n===1?'día':'días'})();

/* ───── resaltado de Bash ───── */
const KW='if|then|elif|else|fi|for|while|until|do|done|case|esac|in|function|local|export|return|exit|break|continue|read|echo|printf|shift|declare|unset|readonly|clear|test|true|false|let|source';
const RX=new RegExp('(^#!.*$)|((?:^|(?<=\\s))#.*$)|("(?:\\\\.|[^"\\\\])*")|(\'[^\']*\')|(\\$\\{[^}]+\\}|\\$\\(\\(|\\$\\(|\\$[A-Za-z_][A-Za-z0-9_]*|\\$[0-9#?@*$!])|\\b('+KW+')\\b|(\\b\\d+(?:\\.\\d+)?\\b)|(&&|\\|\\||;;|\\[\\[|\\]\\]|\\|)','g');
function hlLine(line){let out='',last=0,m;RX.lastIndex=0;
  while((m=RX.exec(line))){if(m[0]===''){RX.lastIndex++;continue}
    out+=esc(line.slice(last,m.index));const t=m[0];
    const cls=m[1]?'k-sb':m[2]?'k-com':(m[3]||m[4])?'k-str':m[5]?'k-var':m[6]?'k-kw':m[7]?'k-num':'k-op';
    out+='<span class="'+cls+'">'+esc(t)+'</span>';last=m.index+t.length}
  return out+esc(line.slice(last))}
function hl(code,lines){return code.split('\n').map((l,i)=>(lines?'<span class="ln">'+(i+1)+'</span>':'')+hlLine(l)).join('\n')}
function codeBlock(code,fn,opts={}){
  return '<div class="code"><div class="ch"><span class="dots"><i></i><i></i><i></i></span><span class="fn">'+esc(fn||'bash')+'</span><button class="copy" type="button">Copiar</button></div><pre>'+hl(code,opts.lines)+'</pre></div>'}
function enhanceCode(el){if(el.dataset.done)return;el.dataset.done=1;const pre=$('pre',el);const raw=pre.textContent;
  if(!el.hasAttribute('data-nohl'))pre.innerHTML=hl(raw);
  const h=document.createElement('div');h.className='ch';h.innerHTML='<span class="dots"><i></i><i></i><i></i></span><span class="fn">'+esc(el.dataset.fn||'bash')+'</span><button class="copy" type="button">Copiar</button>';
  el.insertBefore(h,pre);el.dataset.raw=raw}
document.addEventListener('click',e=>{const b=e.target.closest('.copy');if(!b)return;const c=b.closest('.code');
  const txt=c.dataset.raw||$('pre',c).innerText.replace(/^\s*\d+ /gm,'');copyText(txt,b)});
$$('.code').forEach(enhanceCode);

/* ───── revelar al hacer scroll ───── */
const rvObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rvObs.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
function watchRv(scope=document){$$('.rv:not(.in)',scope).forEach(el=>reduce?el.classList.add('in'):rvObs.observe(el))}

/* ───── navegación entre vistas ───── */
const views=['teoria','practica','test'];
function movePill(){const a=$('.tabs a[aria-current="page"]'),p=$('#pill');if(!a)return;p.style.left=a.offsetLeft+'px';p.style.width=a.offsetWidth+'px'}
let curView=null;
function route(){const h=(location.hash||'#teoria').slice(1);
  let v=views.includes(h)?h:h.startsWith('t-')?'teoria':h.startsWith('p-')?'practica':h.startsWith('test')?'test':'teoria';
  if(v!==curView){views.forEach(x=>$('#v-'+x).classList.toggle('on',x===v));$$('.tabs a').forEach(a=>a.setAttribute('aria-current',a.dataset.v===v?'page':'false'));
    curView=v;movePill();if(v==='test')Test.home();if(!views.includes(h)){const t=document.getElementById(h);t&&setTimeout(()=>t.scrollIntoView({behavior:reduce?'auto':'smooth'}),60)}else scrollTo({top:0,behavior:'auto'});watchRv()}
  else if(!views.includes(h)){const t=document.getElementById(h);t&&t.scrollIntoView({behavior:reduce?'auto':'smooth'})}}
addEventListener('hashchange',route);addEventListener('resize',movePill);document.fonts&&document.fonts.ready.then(movePill);
if(window.ResizeObserver)$$('.tabs a').forEach(a=>new ResizeObserver(movePill).observe(a));

/* ───── hero: terminal que escribe ───── */
(function typer(){const el=$('#typer');const L=[
  ['p','$ ','cat aso_t02_sh_e01a_clementejesus.sh'],['o','','#!/bin/bash\necho "¡Hola a todos y a todas!"\nexit 0'],
  ['p','$ ','chmod +x *.sh && ./aso_t02_sh_e01a_clementejesus.sh'],['o','','¡Hola a todos y a todas!'],
  ['p','$ ','for i in {1..3}; do echo "Tema $i"; done'],['o','','Tema 1\nTema 2\nTema 3'],
  ['p','$ ','echo "scale=2; 4*a(1)*2*2/1" | bc -l'],['o','','12.56'],['c','','# ¿Listo para el test? 🔥']];
  if(reduce){el.innerHTML=L.map(([t,p,s])=>t==='p'?'<span class="p">'+p+'</span>'+esc(s):'<span class="'+t+'">'+esc(s)+'</span>').join('\n')+'\n<span class="cursor"></span>';return}
  let i=0,html='';const cur='<span class="cursor"></span>';
  function line(){if(i>=L.length){setTimeout(()=>{html='';i=0;line()},4200);return}
    const [t,p,s]=L[i++];if(t==='p'){let k=0;const pre=html+'<span class="p">'+p+'</span>';(function ty(){el.innerHTML=pre+esc(s.slice(0,k))+cur;if(k++<s.length)setTimeout(ty,28+Math.random()*40);else{html=pre+esc(s)+'\n';setTimeout(line,350)}})()}
    else{html+='<span class="'+t+'">'+esc(s)+'</span>\n';el.innerHTML=html+cur;setTimeout(line,550)}}
  line()})();
$('#nQ').textContent=Q.length;

/* ───── índice de teoría + progreso de lectura ───── */
const secs=$$('#theory .sec'),read=new Set(rd('t2.read',[]));
$('#tocNav').innerHTML=secs.map((s,i)=>'<a href="#'+s.id+'" data-id="'+s.id+'"><b><span>'+(i+1)+'</span></b>'+esc(s.dataset.title)+'</a>').join('');
$('#mtoc').innerHTML=secs.map((s,i)=>'<a href="#'+s.id+'">'+(i+1)+'. '+esc(s.dataset.title)+'</a>').join('');
function paintRead(){$$('#tocNav a').forEach(a=>a.classList.toggle('read',read.has(a.dataset.id)));$('#readN').textContent=read.size;$('#readBar').style.width=(read.size/secs.length*100)+'%'}
paintRead();
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#tocNav a').forEach(a=>a.classList.toggle('active',a.dataset.id===e.target.id))}),{rootMargin:'-30% 0px -60% 0px'});
secs.forEach(s=>{spy.observe(s);const end=document.createElement('div');end.style.height='1px';s.appendChild(end);
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting&&$('#v-teoria').classList.contains('on')){if(!read.has(s.id)){read.add(s.id);wr('t2.read',[...read]);paintRead();if(read.size===secs.length){toast('🎓 ¡Has leído toda la teoría!');confetti()}}o.disconnect()}})).observe(end)});

/* ───── ventajas ───── */
$('#ventajas').innerHTML=[['🔁','Eliminar tareas repetitivas','Varios comandos en un único script.'],['⏱️','Ahorrar tiempo','Se repite tantas veces como haga falta, sin errores.'],['🗂️','Organizar el trabajo','Una secuencia lógica y reutilizable.'],['🎛️','Usar parámetros','El comportamiento cambia en cada ejecución.'],['🧩','Simplificar lo complejo','Agrupar muchas órdenes en un ejecutable.'],['♻️','Reutilizar código','Para otros usuarios, si tienen permisos y el mismo entorno.'],['🧱','Incorporar funciones','Bloques de código reutilizables.'],['⏰','Programar ejecuciones','Automáticas con cron.'],['🐞','Depurar errores','Analizar la ejecución para corregir fallos.']]
  .map(([i,t,d],k)=>'<div class="card hov" style="--c:'+['#0c9a6a','#1a6fd6','#6a48d6','#c76a05','#d93b55','#0e7bbd'][k%6]+'"><div class="ic">'+i+'</div><h4>'+t+'</h4><p>'+d+'</p></div>').join('');

/* ───── caracteres especiales (tarjetas que giran) ───── */
$('#flips').innerHTML=[['#','comentario','Lo que va detrás se ignora. <code>#!</code> en la línea 1 es el shebang.'],[';','separador','Varios comandos en una línea: <code>echo A; echo B</code>'],['.','incluir','<code>. funciones.sh</code> carga el código en la shell actual.'],['$','variable','Accede al valor: <code>echo "$fecha"</code>'],['$( )','sust. comando','Ejecuta y pone la salida: <code>fecha=$(date)</code>'],['` `','sust. antigua','<code>fecha=`date`</code>. Mejor <code>$( )</code>.'],['~','home','Directorio personal: <code>/home/profesoru</code>'],['&amp;','2º plano','<code>geany f.sh &amp;</code> deja libre el terminal.'],['\\','escape','<code>echo "100\\$"</code> → 100$'],["' '",'literal','<code>\'$PWD\'</code> sale tal cual, sin expandir.'],['" "','expande','<code>"$PWD"</code> → la ruta. Agrupa los espacios.'],['[ ]','test','<code>[ "$n" -eq 1 ]</code>, con espacios dentro.'],['[[ ]]','test Bash','Extras: <code>&lt;</code> sin escapar y <code>=~</code>.'],['{ }','llaves','<code>{1..5}</code> y <code>${var}</code>.'],['$(( ))','aritmética','<code>echo $((5+1))</code> → 6'],['$?','código salida','0 = OK. Distinto de 0 = error.']]
  .map(([c,n,d],i)=>'<button class="flip" type="button" style="--c:'+['#0c9a6a','#1a6fd6','#6a48d6','#c76a05','#d93b55','#0e7bbd'][i%6]+'"><div class="in"><div class="fa"><b>'+c+'</b><span>'+n+'</span></div><div class="fb"><strong>'+n+'</strong>'+d+'</div></div></button>').join('');
$$('.flip').forEach(f=>f.onclick=()=>f.classList.toggle('on'));

/* ───── anatomía del script ───── */
$$('.anat li').forEach(li=>{const on=v=>{$$('.anat [data-a="'+li.dataset.a+'"]').forEach(x=>x.classList.toggle('hl',v))};li.onmouseenter=()=>on(true);li.onmouseleave=()=>on(false);li.onfocus=()=>on(true);li.tabIndex=0;li.onblur=()=>on(false)});

/* ───── segmentados ───── */
function seg(id,cb){const s=$(id);$$('button',s).forEach(b=>b.onclick=()=>{$$('button',s).forEach(x=>x.setAttribute('aria-pressed',x===b));cb&&cb(b.dataset.v)});return()=>$('button[aria-pressed="true"]',s).dataset.v}

/* lab: ejecutar */
const exP=seg('#exPerm'),exS=seg('#exSheb'),exB=seg('#exBody');
$$('#labExec [data-run]').forEach(b=>b.onclick=()=>{const how=b.dataset.run,perm=exP()==='1',sh=exS(),body=exB();
  const cmd={bash:'bash script.sh',sh:'sh script.sh',name:'script.sh',dot:'./script.sh'}[how];
  const ok=body==='for'?'0\n1\n2\n3':'¡Hola a todos y a todas!';
  const bad=n=>'<span class="e">'+n+': 2: Syntax error: Bad for loop variable</span>';
  let r;
  if(how==='bash')r=ok;
  else if(how==='sh')r=body==='for'?bad('script.sh'):ok;
  else if(how==='name')r='<span class="e">script.sh: orden no encontrada</span>\n<span class="d"># el directorio actual no está en $PATH</span>';
  else if(!perm)r='<span class="e">bash: ./script.sh: Permiso denegado</span>\n<span class="d"># falta chmod +x</span>';
  else r=(sh==='sh'&&body==='for')?bad('./script.sh')+'\n<span class="d"># el shebang #!/bin/sh usa dash, que no entiende for ((…))</span>':ok+'\n<span class="d"># usa el intérprete del shebang: '+(sh==='sh'?'dash':'bash')+'</span>';
  $('#exOut').innerHTML='<span class="p">$</span> '+cmd+'\n'+r});

/* lab: $? */
$$('[data-ec]').forEach(b=>b.onclick=()=>{const [c,code]=b.dataset.ec.split('|');
  const outs={'ls ~':'Descargas  Documentos  Escritorio  aso_sh_40_clemente_j','ls directorio_inventado':'<span class="e">ls: no se puede acceder a \'directorio_inventado\': No existe el archivo o el directorio</span>','true':'','false':'','noexiste':'<span class="e">noexiste: orden no encontrada</span>'};
  $('#ecOut').innerHTML='<span class="p">$</span> '+esc(c)+'\n'+(outs[c]?outs[c]+'\n':'')+'<span class="p">$</span> echo $?\n<span class="'+(code==='0'?'p':'y')+'">'+code+'</span>'+(code==='127'?'  <span class="d"># 127 = orden no encontrada</span>':'')});

/* lab: comillas */
function quotes(){const v=$('#qVal').value,words=v.trim().split(/\s+/).filter(Boolean);
  const test=!v.trim()?'<span class="e">bash: [: =: se esperaba un operador unario</span>':words.length>1?'<span class="e">bash: [: demasiados argumentos</span>':'<span class="d">(funciona, por suerte)</span>';
  $('#qOut').innerHTML=[['echo "Hola $nombre"','Hola '+esc(v)],["echo 'Hola $nombre'",'Hola $nombre'],['echo Hola $nombre','Hola '+esc(words.join(' '))+'  <span class="d"># '+(words.length+1)+' argumentos: los espacios repetidos se pierden</span>'],['echo "Hola ${nombre}!"','Hola '+esc(v)+'!'],['echo Hola \\$nombre','Hola $nombre'],['echo "Hoy: $(date +%A)"','Hoy: '+new Date().toLocaleDateString('es-ES',{weekday:'long'})],['[ $nombre = "x" ]  (sin comillas)',test]]
    .map(([c,o])=>'<span class="p">$</span> '+esc(c)+'\n'+o).join('\n')}
$('#qVal').oninput=quotes;quotes();

/* lab: read */
const rV=seg('#rVars',readLab);
function readLab(){const n=+rV(),w=$('#rIn').value.trim().split(/\s+/).filter(Boolean),names='abcde'.split('').slice(0,n);
  $('#rOut').innerHTML=names.map((x,i)=>{const val=i<n-1?(w[i]||''):w.slice(i).join(' ');return '<div class="param"><small>$'+x+'</small>'+(val?esc(val):'<i style="opacity:.5">vacía</i>')+'</div>'}).join('')}
$('#rIn').oninput=readLab;readLab();

/* lab: shift */
function shWords(s){const out=[];let m;const re=/"([^"]*)"|'([^']*)'|(\S+)/g;while((m=re.exec(s)))out.push(m[1]!=null?m[1]:m[2]!=null?m[2]:m[3]);return out}
let shP=[];
function shRender(){$('#shParams').innerHTML=shP.length?shP.map((p,i)=>'<div class="param"><small>$'+(i+1)+'</small>'+esc(p)+'</div>').join(''):'<span class="muted" style="padding:6px">Ya no quedan parámetros.</span>';
  $('#shInfo').innerHTML='$# = <span class="y">'+shP.length+'</span>   $1 = <span class="p">'+esc(shP[0]||'')+'</span>   "$*" = "'+esc(shP.join(' '))+'"';$('#shBtn').disabled=!shP.length}
$('#shLoad').onclick=()=>{shP=shWords($('#shIn').value);shRender()};
$('#shBtn').onclick=()=>{const f=$('#shParams .param');if(!f)return;f.classList.add('out-l');setTimeout(()=>{shP.shift();shRender()},reduce?0:320)};
$('#shLoad').click();

/* lab: calculadora Bash vs bc */
function dec(s){s=s.trim();if(!/^-?\d+(\.\d+)?$/.test(s))return null;const neg=s[0]==='-';s=s.replace('-','');const [a,b='']=s.split('.');return{v:BigInt((neg?'-':'')+a+b),s:b.length}}
const P10=n=>10n**BigInt(n);
function fmt(v,s){const neg=v<0n;let a=(neg?-v:v).toString().padStart(s+1,'0');let r=s?a.slice(0,-s)+'.'+a.slice(-s):a;if(r.startsWith('0.'))r=r.slice(1);return(neg&&v!==0n?'-':'')+r}
function bc(A,op,B,S){if(op==='+'||op==='-'){const s=Math.max(A.s,B.s),a=A.v*P10(s-A.s),b=B.v*P10(s-B.s);return fmt(op==='+'?a+b:a-b,s)}
  if(op==='*'){const s=A.s+B.s,full=A.v*B.v,ts=Math.min(s,Math.max(S,A.s,B.s));return fmt(full/P10(s-ts),ts)}
  if(op==='/'){if(B.v===0n)return null;const num=A.v*P10(S+B.s),den=B.v*P10(A.s);return fmt(num/den,S)}
  return'—'}
function calc(){const a=$('#cA').value,b=$('#cB').value,op=$('#cOp').value,S=Math.max(0,Math.min(20,parseInt($('#cS').value)||0));
  const isInt=x=>/^-?\d+$/.test(x.trim());let bash;
  if(!isInt(a)||!isInt(b)){const bad=!isInt(a)?a:b;bash='<span class="e">bash: '+esc(a)+' '+esc(op)+' '+esc(b)+': error sintáctico: operador aritmético no válido (el elemento de error es "'+esc((bad.match(/\.\d*/)||[bad])[0])+'")</span>'}
  else{const x=BigInt(a),y=BigInt(b);if((op==='/'||op==='%')&&y===0n)bash='<span class="e">bash: '+esc(a)+' '+op+' '+esc(b)+': división por 0 (el elemento de error es "'+esc(b)+'")</span>';
    else bash='<span class="y">'+String(op==='+'?x+y:op==='-'?x-y:op==='*'?x*y:op==='/'?x/y:x%y)+'</span>'+(op==='/'?'  <span class="d"># división entera: se quitan los decimales</span>':'')}
  const A=dec(a),B=dec(b);let bcr;
  if(!A||!B)bcr='<span class="e">(standard_in) 1: syntax error</span>';
  else if(op==='%')bcr='<span class="d"># el resto con reales no tiene sentido en este tema</span>';
  else{const r=bc(A,op,B,S);bcr=r===null?'<span class="e">Runtime error (func=(main), adr=…): Divide by zero</span>':'<span class="y">'+r+'</span>'+(r.startsWith('.')||r.startsWith('-.')?'  <span class="d"># bc no escribe el 0 inicial</span>':'')}
  $('#cOut').innerHTML='<span class="p">$</span> echo $(('+esc(a)+' '+esc(op)+' '+esc(b)+'))\n'+bash+'\n<span class="p">$</span> echo "scale='+S+'; '+esc(a)+' '+esc(op)+' '+esc(b)+'" | bc\n'+bcr}
['#cA','#cB','#cOp','#cS'].forEach(s=>$(s).addEventListener('input',calc));calc();

/* lab: tests de ficheros */
const FT={f:'efrw',x:'efrwx',d:'edrwx',l:'efhrw',n:''};
const fSel=seg('#fSel',fileLab);
function fileLab(){const has=FT[fSel()];$('#fOut').innerHTML=[['e','existe'],['f','fichero regular'],['d','directorio'],['h','enlace simb.'],['r','lectura'],['w','escritura'],['x','ejecución']]
  .map(([k,t])=>'<div class="'+(has.includes(k)?'y':'n')+'">-'+k+' '+(has.includes(k)?'✓':'✗')+'<small>'+t+'</small></div>').join('')}
fileLab();

/* lab: case */
function globRe(p){return new RegExp('^(?:'+p.split('|').map(alt=>{let r='';for(let i=0;i<alt.length;i++){const c=alt[i];
  if(c==='*')r+='.*';else if(c==='?')r+='.';else if(c==='['){const j=alt.indexOf(']',i+1);if(j<0){r+='\\[';continue}let cls=alt.slice(i+1,j);if(cls[0]==='!')cls='^'+cls.slice(1);r+='['+cls.replace(/\\/g,'\\\\')+']';i=j}
  else r+=c.replace(/[.+^${}()|\\]/g,'\\$&')}return r}).join('|')+')$')}
function caseLab(){const p=$('#csP').value,v=$('#csV').value;let ok;try{ok=globRe(p).test(v)}catch(e){ok=null}
  $('#csOut').innerHTML='<span class="d">case "'+esc(v)+'" in</span>\n    '+esc(p)+')  '+(ok===null?'<span class="e">patrón no válido</span>':ok?'<span class="p">✓ coincide → se ejecuta este bloque</span>':'<span class="e">✗ no coincide → se prueba el siguiente patrón</span>')+'\n<span class="d">esac</span>'}
$('#csP').oninput=caseLab;$('#csV').oninput=caseLab;caseLab();

/* lab: regex */
function rxLab(){const v=$('#rxIn').value;$('#rxOut').innerHTML=[['^-?[0-9]+$','entero',/^-?[0-9]+$/],['^[0-9]+$','entero ≥ 0',/^[0-9]+$/],['^-?[0-9]+([.][0-9]+)?$','real',/^-?[0-9]+([.][0-9]+)?$/],['-z','vacía',null]]
  .map(([r,t,re])=>{const ok=re?re.test(v):v==='';return '<div class="'+(ok?'y':'n')+'" style="font-size:.78rem">'+(ok?'✓ ':'✗ ')+esc(t)+'<small>'+esc(r)+'</small></div>'}).join('')}
$('#rxIn').oninput=rxLab;rxLab();

/* lab: bucles */
const lpM=seg('#lpMode');$('#lpCells').innerHTML=[...Array(10)].map((_,i)=>'<div class="cell">'+i+'</div>').join('');
let lpBusy=false;
$('#lpRun').onclick=()=>{if(lpBusy)return;lpBusy=true;const mode=lpM(),cells=$$('#lpCells .cell'),out=[];cells.forEach(c=>c.className='cell');$('#lpOut').innerHTML='';let i=0;
  (function step(){cells.forEach(c=>c.classList.remove('cur'));if(i>=10){end();return}const c=cells[i];c.classList.add('cur');
    if(i===5&&mode==='break'){c.classList.add('stop');for(let k=6;k<10;k++)cells[k].style.opacity=.3;out.push('<span class="e">break → sale del bucle</span>');i=10}
    else if(i===5&&mode==='continue'){c.classList.add('skip');out.push('<span class="y">continue → se salta el 5</span>');i++}
    else{c.classList.add('on');out.push(String(i));i++}
    $('#lpOut').innerHTML=out.join('\n');setTimeout(step,reduce?0:330)})();
  function end(){$('#lpOut').innerHTML=out.join('\n')+(mode==='break'?'\nBucle terminado.':'');setTimeout(()=>{cells.forEach(c=>c.style.opacity='');lpBusy=false},400)}};

/* arrays */
$('#arrCells').innerHTML=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Sept.','Octubre','Nov.','Dic.'].map((m,i)=>'<div style="text-align:center"><div class="cell" style="width:auto;padding:0 10px;font-size:.78rem" tabindex="0" title="${meses['+i+']}">'+m+'</div><small class="muted" style="font-family:var(--f-m);font-size:.7rem">['+i+']</small></div>').join('');
$$('#arrCells .cell').forEach(c=>{c.onmouseenter=c.onfocus=()=>c.classList.add('on');c.onmouseleave=c.onblur=()=>c.classList.remove('on')});

/* lab: ámbito */
const SC=[['unaVariableGlobal','export',true],['unaVariable','sin local',true],['otraVariable','local',false],['otraMas','sin local',true],['unaVarNum','read',true]];
$('#scVars').innerHTML=SC.map(([n,t])=>'<button class="tchip" type="button" aria-pressed="false" data-n="'+n+'">$'+n+' <i>'+t+'</i></button>').join('');
$$('#scVars .tchip').forEach(b=>b.onclick=()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true'));
$('#scCheck').onclick=()=>{let ok=0;SC.forEach(([n,,v])=>{const b=$('#scVars [data-n="'+n+'"]'),sel=b.getAttribute('aria-pressed')==='true';if(sel===v)ok++;b.style.borderColor=sel===v?'var(--acc)':'var(--rose)';b.style.boxShadow='0 0 0 2px '+(sel===v?'var(--acc)':'var(--rose)')});
  $('#scRes').innerHTML=ok===5?'<b style="color:var(--acc)">¡Perfecto! Solo otraVariable (local) se pierde.</b>':'<b style="color:var(--rose)">'+ok+'/5.</b> <span class="muted">Pista: solo <code>local</code> limita el ámbito.</span>';if(ok===5)confetti(40)};

/* ═════════════ PRÁCTICA ═════════════ */
const DATOS=[['TuID','40'],['MV clonada','SHELLMV5XU2440'],['Usuario de la MV','profesoru'],['Carpeta','~/aso_sh_40_clemente_j'],['IP Windows (ASO_HO)','192.168.40.201'],['IP Xubuntu (enp0s9)','192.168.40.202'],['Servidor DHCP','192.168.40.200'],['Rango DHCP','192.168.40.202 – .205'],['Instantánea','i01_limpia_shell'],['Scripts','aso_t02_sh_eXX_clementejesus.sh'],['GitHub del profe','amontorosi'],['SSH','ssh profesoru@192.168.40.202']];
$('#datos').innerHTML=DATOS.map(([k,v])=>'<div class="dato"><div><span>'+esc(k)+'</span><b>'+esc(v)+'</b></div><button type="button" aria-label="Copiar '+esc(k)+'" data-copy="'+esc(v)+'">⧉</button></div>').join('');
$$('#datos [data-copy]').forEach(b=>b.onclick=()=>{copyText(b.dataset.copy);toast('Copiado: '+b.dataset.copy)});

const W={vb:['w-vb','VirtualBox'],win:['w-win','Windows'],xu:['w-xu','Xubuntu'],vs:['w-vs','VS Code'],gh:['w-gh','GitHub']};
const PH=[
 {t:'Clonar y preparar la MV',c:'#7a4cc2',s:[
  ['c1','vb','Clonar la MV','Clic derecho en MV5XU2440 → Clonar → nombre SHELLMV5XU2440 → Clonación completa. O desde PowerShell:','VBoxManage clonevm "MV5XU2440" --name "SHELLMV5XU2440" --mode all --register'],
  ['c2','gh','Cuenta de GitHub','Mientras clona: entra en github.com con tu cuenta profesional (la que usas como portfolio), o crea una.',''],
  ['c3','vb','Red: quitar la red interna y activar NAT','Con la MV apagada: Configuración → Red.','VBoxManage modifyvm "SHELLMV5XU2440" --nic1 nat'],
  ['c4','xu','Instalar Geany, Git y el servidor SSH','Arranca, entra con profesoru y abre un terminal (Ctrl+Alt+T).','sudo apt update\nsudo apt install geany geany-plugins\nsudo apt install git openssh-server'],
  ['c5','xu','Crear la carpeta de trabajo','Aquí irán todos los scripts del tema (más adelante será un repositorio Git).','mkdir ~/aso_sh_40_clemente_j\ncd ~/aso_sh_40_clemente_j'],
  ['c6','xu','Actualizar en una pestaña 2','Ctrl+Mayús+T abre una pestaña nueva. Cuando termine, ciérrala.','sudo apt update\nsudo apt upgrade'],
  ['c7','xu','Ver las shells y hacer e01a/e01b','Comprueba en Geany: Documento → codificación UTF-8 y fin de línea LF.','cat /etc/shells\ngeany aso_t02_sh_e01a_clementejesus.sh &\nbash aso_t02_sh_e01a_clementejesus.sh\n./aso_t02_sh_e01a_clementejesus.sh     # Permiso denegado\nchmod +x aso_t02_sh_e01a_clementejesus.sh\n./aso_t02_sh_e01a_clementejesus.sh\necho $PATH']]},
 {t:'Red Host-Only',c:'#1a6fd6',s:[
  ['h1','win','VS Code y extensiones locales','Instala o actualiza VS Code (64 bits) y añade Remote - SSH e Indent Rainbow.','code --install-extension ms-vscode-remote.remote-ssh\ncode --install-extension oderwat.indent-rainbow'],
  ['h2','vb','Borrar las redes Host-Only antiguas','VirtualBox → Archivo → Herramientas → Administrador de red → Host-only. Borra también sus tarjetas en ncpa.cpl (solo las de VirtualBox).','VBoxManage list hostonlyifs'],
  ['h3','vb','Crear la red Host-Only','Adaptador manual 192.168.40.201/24 y servidor DHCP habilitado: .200, del .202 al .205.','VBoxManage hostonlyif create\nVBoxManage hostonlyif ipconfig "VirtualBox Host-Only Ethernet Adapter" --ip 192.168.40.201 --netmask 255.255.255.0\nVBoxManage dhcpserver add --interface="VirtualBox Host-Only Ethernet Adapter" --server-ip=192.168.40.200 --netmask=255.255.255.0 --lower-ip=192.168.40.202 --upper-ip=192.168.40.205 --enable'],
  ['h4','win','Renombrar la tarjeta a ASO_HO','Comprueba en ncpa.cpl que tiene la 192.168.40.201. Desde PowerShell como administrador:','Get-NetAdapter\nRename-NetAdapter -Name "Ethernet 3" -NewName "ASO_HO"'],
  ['h5','vb','Adaptadores de la MV','1: red interna · 2: NAT · 3: solo-anfitrión (la red nueva), con modo promiscuo «Permitir todo».','VBoxManage modifyvm "SHELLMV5XU2440" --nic1 intnet --nic2 nat --nic3 hostonly --hostonlyadapter3 "VirtualBox Host-Only Ethernet Adapter" --nicpromisc3 allow-all'],
  ['h6','xu','Renombrar la conexión del adaptador 3','Busca la conexión de enp0s9 (puede llamarse «Conexión cableada 1», 2 o 3).','nmcli connection show\nnmcli connection modify "Conexión cableada 1" connection.id "netplan-enp0s9"\nnmcli connection show'],
  ['h7','xu','Comprobar la IP y hacer ping','enp0s9 tiene que tener la 192.168.40.202.','ip a\nping -c 4 192.168.40.201'],
  ['h8','win','Ping desde Windows','Tiene que haber respuesta en los dos sentidos.','ping 192.168.40.202']]},
 {t:'Instantánea y SSH',c:'#0c9a6a',s:[
  ['s1','vb','Dejar solo el adaptador 3','Apaga la MV; el 1 y el 2 quedan desactivados.','VBoxManage modifyvm "SHELLMV5XU2440" --nic1 none --nic2 none'],
  ['s2','vb','Instantánea i01_limpia_shell','Con la MV apagada.','VBoxManage snapshot "SHELLMV5XU2440" take "i01_limpia_shell"'],
  ['s3','xu','Arrancar y repetir el ping','Comprueba que sigue habiendo comunicación entre Windows y Xubuntu.','ping -c 4 192.168.40.201'],
  ['s4','xu','Comprobar el servicio SSH','Tiene que salir «active (running)» y «enabled». Si no, actívalo:','systemctl status ssh\nsystemctl is-enabled ssh\nsudo systemctl enable ssh\nsudo systemctl start ssh'],
  ['s5','win','SSH desde PowerShell','La primera vez escribe yes y luego la contraseña.','ssh profesoru@192.168.40.202']]},
 {t:'VS Code con Remote - SSH',c:'#0e7bbd',s:[
  ['v1','vs','Conectarse a la MV','F1 → «Remote-SSH: Connect to Host…» → profesoru@192.168.40.202 → Linux → contraseña. Abajo a la izquierda debe salir «SSH: 192.168.40.202».','profesoru@192.168.40.202'],
  ['v2','vs','Comprobar en el terminal remoto','Terminal → Nuevo terminal (Ctrl+ñ).','hostname\nwhoami'],
  ['v3','vs','Extensiones en el entorno remoto','En la pestaña de extensiones, instálalas en «SSH: 192.168.40.202», no en Windows. ShellCheck, de momento, deshabilitada.','code --install-extension mads-hartmann.bash-ide-vscode\ncode --install-extension timonwong.shellcheck'],
  ['v4','vs','Scripts e02a y e02b','Crea los ficheros, dales permiso y ejecútalos.','cd ~/aso_sh_40_clemente_j\ntouch aso_t02_sh_e02a_clementejesus.sh\nchmod +x aso_t02_sh_e02a_clementejesus.sh\n./aso_t02_sh_e02a_clementejesus.sh\ntouch aso_t02_sh_e02b_clementejesus.sh\nchmod +x aso_t02_sh_e02b_clementejesus.sh\n./aso_t02_sh_e02b_clementejesus.sh'],
  ['v5','vs','Cerrar la conexión y apagar','Abajo a la izquierda → Close Remote Connection. Después apaga Xubuntu.','sudo poweroff']]},
 {t:'GitHub (más adelante)',c:'#24292f',s:[
  ['g1','xu','Convertir la carpeta en repositorio','Cuando lo diga el profe. Cambia TU_USUARIO por tu usuario de GitHub.','cd ~/aso_sh_40_clemente_j\ngit init\ngit config --global user.name "Jesús Clemente"\ngit config --global user.email "tu_correo_profesional"\ngit add .\ngit commit -m "Tema 2: scripts de Shell"\ngit branch -M main\ngit remote add origin https://github.com/TU_USUARIO/aso_sh_40_clemente_j.git\ngit push -u origin main'],
  ['g2','gh','Invitar al profe','En el repositorio: Settings → Collaborators → Add people → amontorosi.','amontorosi']]}];
const done=new Set(rd('t2.steps',[]));
const totalSteps=PH.reduce((a,p)=>a+p.s.length,0);
$('#phases').innerHTML=PH.map((p,pi)=>'<div class="phase rv"><div class="phase-h" style="--c:'+p.c+'"><div class="pn">'+(pi+1)+'</div><h2>'+esc(p.t)+'</h2><span class="pp" data-pp="'+pi+'"></span></div>'+
  p.s.map(([id,w,t,d,cmd])=>'<div class="step" data-id="'+id+'"><button class="chk" type="button" aria-label="Marcar '+esc(t)+'"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></button><div><h4><span class="where '+W[w][0]+'">'+W[w][1]+'</span>'+esc(t)+'</h4><p>'+esc(d)+'</p>'+(cmd?codeBlock(cmd,W[w][1]):'')+'</div></div>').join('')+'</div>').join('');
function paintSteps(){$$('.step').forEach(s=>s.classList.toggle('done',done.has(s.dataset.id)));const n=[...done].filter(id=>$('.step[data-id="'+id+'"]')).length;
  $('#pDone').textContent=n;$('#pTotal').textContent=totalSteps;$('#pRing').style.strokeDashoffset=182.2*(1-n/totalSteps);
  PH.forEach((p,i)=>{$('[data-pp="'+i+'"]').textContent=p.s.filter(s=>done.has(s[0])).length+'/'+p.s.length})}
$$('.step .chk').forEach(b=>b.onclick=()=>{const id=b.closest('.step').dataset.id;done.has(id)?done.delete(id):done.add(id);wr('t2.steps',[...done]);paintSteps();
  if(done.size===totalSteps){toast('🏆 ¡Entorno configurado al completo!');confetti()}});
$('#pReset').onclick=()=>{if(confirm('¿Desmarcar todos los pasos?')){done.clear();wr('t2.steps',[]);paintSteps()}};
paintSteps();

const CHEAT=[['ls -l /bin/sh','xu','Ver a qué shell apunta sh (dash en Ubuntu)'],['cat /etc/shells','xu','Ver las shells instaladas'],['chmod +x script.sh','xu','Dar permiso de ejecución'],['bash script.sh / ./script.sh','xu','Ejecutar con el intérprete o como programa'],['echo $PATH','xu','Ver dónde se buscan los comandos'],['sudo apt update && sudo apt upgrade','xu','Actualizar el sistema'],['sudo apt install geany geany-plugins git openssh-server','xu','Instalar las herramientas del tema'],['nmcli connection show','xu','Ver las conexiones de NetworkManager'],['nmcli connection modify "X" connection.id "netplan-enp0s9"','xu','Renombrar una conexión'],['ip a','xu','Ver las interfaces y sus IP'],['ping -c 4 192.168.40.201','xu','Probar la conexión con Windows'],['systemctl status ssh','xu','Estado del servicio SSH'],['systemctl is-enabled ssh','xu','¿Arranca solo? → enabled'],['sudo systemctl enable --now ssh','xu','Activarlo y arrancarlo a la vez'],['hostname -I','xu','Ver solo las IP (se usa en el e02b)'],['ssh profesoru@192.168.40.202','win','Conectarse a la MV desde PowerShell'],['ping 192.168.40.202','win','Probar la conexión con Xubuntu'],['ncpa.cpl','win','Abrir Conexiones de red (Win+R)'],['Rename-NetAdapter -Name "Ethernet 3" -NewName "ASO_HO"','win','Renombrar la tarjeta Host-Only (como admin)'],['Get-NetIPAddress -InterfaceAlias ASO_HO','win','Ver la IP de la tarjeta'],['VBoxManage list vms','vb','Listar las máquinas virtuales'],['VBoxManage list hostonlyifs','vb','Listar las redes Host-Only'],['VBoxManage list dhcpservers','vb','Ver la configuración del DHCP'],['VBoxManage dhcpserver restart --network=HostInterfaceNetworking-VirtualBox Host-Only Ethernet Adapter','vb','Reiniciar el DHCP si reparte IPs viejas'],['VBoxManage showvminfo "SHELLMV5XU2440" | findstr NIC','vb','Ver los adaptadores de la MV'],['VBoxManage snapshot "SHELLMV5XU2440" list','vb','Ver las instantáneas'],['VBoxManage startvm "SHELLMV5XU2440"','vb','Arrancar la MV'],['F1 → Remote-SSH: Connect to Host…','vs','Conectar VS Code a la MV']];
$('#cheat tbody').innerHTML=CHEAT.map(([c,w,d])=>'<tr><td><code style="white-space:normal;word-break:break-word">'+esc(c)+'</code></td><td><span class="where '+W[w][0]+'">'+W[w][1]+'</span></td><td>'+esc(d)+'</td></tr>').join('');

const EX=[
 ['e01a','Inicio','Primer script con #!/bin/bash','Mostrar «¡Hola a todos y a todas!». Probar a ejecutarlo con bash, sin ./, con ./ y después de chmod +x.','./aso_t02_sh_e01a_clementejesus.sh','¡Hola a todos y a todas!'],
 ['e01b','Inicio','El mismo saludo con #!/bin/sh','Ejecutarlo y explicar la diferencia entre #!/bin/sh (dash) y #!/bin/bash.','./aso_t02_sh_e01b_clementejesus.sh','Hola, mundo de nuevo'],
 ['e02a','Inicio','Datos personales','Nombre y apellidos, usuario (whoami), equipo (hostname) y fecha (date).','./aso_t02_sh_e02a_clementejesus.sh','Nombre y apellidos: Jesús Clemente\nUsuario: profesoru\nEquipo: SHELLMV5XU2440\nFecha y hora: …'],
 ['e02b','Inicio','Informe del sistema','Equipo, usuario, directorio actual, IP (hostname -I) y fecha.','./aso_t02_sh_e02b_clementejesus.sh','===== INFORME DEL SISTEMA =====\nEquipo: SHELLMV5XU2440\n…\nDirección IP: 192.168.40.202'],
 ['e03','Inicio','Caracteres especiales','Copiar el script de la captura y analizar #, ;, las comillas invertidas, el escape, $ y las variables de entorno.','./aso_t02_sh_e03_clementejesus.sh','Las comillas invertidas ejecutan date; con \\` se imprime el texto tal cual; \'$HOME\' sale literal.'],
 ['e04','Inicio','Ejecutar o incluir','Variables con distintos tipos de comillas; la línea 19 ejecuta el e03. Después cambiarla para que lo incluya con «.».','./aso_t02_sh_e04_clementejesus.sh','Si lo ejecuta, «¿Esta linea se muestra?» SÍ aparece. Si lo incluye, el exit 0 del e03 cierra todo y NO aparece.'],
 ['e05','Inicio','read con todo tipo de datos','Leer enteros, reales y cadenas con y sin espacios y comillas; read con varias variables.','./aso_t02_sh_e05_clementejesus.sh','read v12 v13 con «uno dos tres» → v12=uno y v13="dos tres"'],
 ['e06','Inicio','Parámetros y shift','Mostrar $0, $#, $* y $1 a $3; después recorrer los parámetros con shift.','./aso_t02_sh_e06_clementejesus.sh uno dos tres cuatro','El número de parámetros es: 4 … y después uno, dos, tres y cuatro, uno por línea'],
 ['e07','Aritmética','Operadores con enteros y reales','+ - * / % con $(( )); con reales falla. Después con bc -l. Probar la división entre cero.','./aso_t02_sh_e07_clementejesus.sh','17 / 5 = 3 (entera). Con 7.5: error de sintaxis. Con bc -l salen los decimales.'],
 ['e08','Aritmética','Comparar enteros y reales','Pedir ne1 y ne2 (-lt, -gt, -eq) y después nr1 y nr2 (con bc).','./aso_t02_sh_e08_clementejesus.sh','3 es menor que 7 · 2.5 es mayor que 2.25'],
 ['e09','Cadenas','Comparar cadenas con read','Indicar si la primera es menor, mayor o igual alfabéticamente. Casos: hola/ola, hola/Hola, 3/tres, 3/03…','./aso_t02_sh_e09_clementejesus.sh','hola < ola · hola < Hola (en español) · 3 > 03 · «hola con esp» = «hola con esp»'],
 ['e10','Cadenas','Comparar cadenas con parámetros','Lo mismo, pero con $1 y $2. Ojo: sin comillas, «hola con esp» son 3 parámetros.','./aso_t02_sh_e10_clementejesus.sh hola ola','Caso 6 sin comillas: $1=hola y $2=con → mayor'],
 ['e11','Ficheros','¿Son directorios?','Pedir dos rutas y decir cuáles son directorios (-d). Probar con rutas relativas y absolutas.','mkdir prueba1 prueba2 && ./aso_t02_sh_e11_clementejesus.sh','prueba1 y prueba2 son directorios.'],
 ['e12','Ficheros','Permisos de un fichero','Directorio + fichero: comprobar que existen y que es regular, y mostrar los permisos r/w/x.','touch prueba1/fich.txt; chmod 600 prueba1/fich.txt; ./aso_t02_sh_e12_clementejesus.sh prueba1 fich.txt','El fichero tiene permisos de lectura y escritura.'],
 ['e13','Bucles','Pares con while','Pedir un número ≥ 0 y mostrar los pares del 0 a N.','./aso_t02_sh_e13_clementejesus.sh','N=10 → 0 2 4 6 8 10'],
 ['e14','Bucles','Tabla de multiplicar','Pedir un número > 0 y mostrar su tabla.','./aso_t02_sh_e14_clementejesus.sh','7 x 1 = 7 … 7 x 10 = 70'],
 ['e15','Bucles','Contar ficheros y directorios','Un parámetro que sea un directorio; contar con for los ficheros y directorios del primer nivel.','./aso_t02_sh_e15_clementejesus.sh /etc','Directorios: … Archivos: …'],
 ['e15m1','Bucles','Modificación: segundo nivel','Contar también dentro de cada subdirectorio.','./aso_t02_sh_e15m1_clementejesus.sh /etc','Totales del primer y del segundo nivel'],
 ['e16','Bucles','Líneas con N palabras o más','Leer fich1 línea a línea y copiar en fich2 las que tengan N palabras o más (wc -w). Preguntar si se sobrescribe fich2.','printf "una\\nuna dos\\nuna dos tres\\n" > texto.txt; ./aso_t02_sh_e16_clementejesus.sh','Con N=2 → salida.txt: «una dos» y «una dos tres»'],
 ['e17','Bucles','Calculadora de 3 reales','Recibir 3 números, mostrar el menú s/r/m/d/q/0 con scale=4 y controlar la división entre cero.','./aso_t02_sh_e17_clementejesus.sh 10 2.5 3','d → 1.3333 (scale corta, no redondea)'],
 ['e18','Arrays','Ventas, gastos y beneficios','4 arrays: meses, ventas, gastos y beneficios. Beneficio de cada mes y del año.','./aso_t02_sh_e18_clementejesus.sh','Enero: … Beneficio anual: …'],
 ['e19','Arrays','¿Fecha válida?','Arrays con los días y los nombres de los meses; comprobar los años bisiestos y mostrar la fecha con el nombre del mes.','./aso_t02_sh_e19_clementejesus.sh','29/2/2024 → válida · 29/2/2023 → error'],
 ['e20_func','Funciones','Fichero de funciones','Funciones de la calculadora: mostrarMenu, sumar, restar, multiplicar y dividir.','(se incluye desde e20_main)',''],
 ['e20_main','Funciones','Main que incluye las funciones','Incluir con «.» el fichero de funciones; el menú se repite hasta salir.','./aso_t02_sh_e20_main_clementejesus.sh 10 2.5 3','El menú se repite hasta elegir q o 0'],
 ['e21','Funciones','Ámbito de las variables','Antes de ejecutarlo, pensar qué valor tendrá cada variable (export, global y local).','./aso_t02_sh_e21_clementejesus.sh','Después de invocar: Soy global · Soy una cadena… · (vacía: era local)'],
 ['e22','Funciones','Áreas y perímetros','Menú con funciones para el cuadrado, el rectángulo y la circunferencia (pi = 4*a(1)).','./aso_t02_sh_e22_clementejesus.sh','Radio 2 → Área 12.56 · Perímetro 12.56'],
 ['e23','Funciones','Múltiplos V1, V2, V3 y array','Múltiplos de 3 hasta 3000; después de NUM hasta LIMITE con validación, una cadena y un array.','./aso_t02_sh_e23_clementejesus.sh','NUM=7, LIMITE=50 → 7 14 21 28 35 42 49']];
const CATC={Inicio:'#0c9a6a',Aritmética:'#c76a05',Cadenas:'#d93b55',Ficheros:'#1a6fd6',Bucles:'#6a48d6',Arrays:'#0e7bbd',Funciones:'#7a4cc2'};
let exCat='Todos';
function paintEx(){$('#exFilter').innerHTML=['Todos',...Object.keys(CATC)].map(c=>'<button class="tchip" type="button" aria-pressed="'+(c===exCat)+'" data-c="'+c+'">'+c+'</button>').join('');
  $$('#exFilter button').forEach(b=>b.onclick=()=>{exCat=b.dataset.c;paintEx()});
  $('#exGrid').innerHTML=EX.filter(e=>exCat==='Todos'||e[1]===exCat).map(([id,cat,t,d])=>'<div class="card hov ex" style="--c:'+CATC[cat]+'"><span class="tag cat">'+cat+'</span><span class="exn">'+id.toUpperCase().replace('_',' ')+'</span><h4>'+esc(t)+'</h4><p>'+esc(d)+'</p><div class="actions"><button class="btn sm pri" type="button" data-ex="'+id+'">Ver solución</button></div></div>').join('');
  $$('[data-ex]').forEach(b=>b.onclick=()=>openEx(b.dataset.ex))}
function openEx(id){const e=EX.find(x=>x[0]===id),s=SCR[id];
  $('#modalBox').innerHTML='<button class="btn sm close" type="button" id="mClose">✕ Cerrar</button><span class="tag" style="--c:'+CATC[e[1]]+'">'+e[1]+'</span><h3 style="margin-top:8px">'+id.toUpperCase().replace('_',' ')+' · '+esc(e[2])+'</h3><p class="muted">'+esc(e[3])+'</p>'+
    (s?codeBlock(s.code.replace(/\n$/,''),s.file,{lines:true}):'<p>Script no disponible.</p>')+
    '<h4 style="margin:14px 0 4px">Cómo ejecutarlo</h4>'+codeBlock(e[4],'terminal')+(e[5]?'<div class="out" style="margin:0">'+esc(e[5])+'</div>':'');
  $$('#modalBox .code').forEach(c=>{const sc=s&&$('.fn',c).textContent===s.file;c.dataset.raw=sc?s.code:e[4]});
  $('#modal').classList.add('on');$('#mClose').focus();$('#mClose').onclick=closeModal}
function closeModal(){$('#modal').classList.remove('on')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
paintEx();
$$('.step .code').forEach((c,i)=>{const st=c.closest('.step'),id=st.dataset.id;const s=PH.flatMap(p=>p.s).find(x=>x[0]===id);c.dataset.raw=s[4]});

const QA=[
 ['¿Qué es un script o guion?','Un fichero de texto con una secuencia de órdenes que un intérprete (la shell) ejecuta una tras otra, sin necesidad de compilarlo.'],
 ['¿Qué ventajas tiene usar scripts para administrar un SO?','Automatizan las tareas repetitivas, ahorran tiempo, evitan errores humanos, permiten repetir lo mismo en muchos equipos, se pueden programar con cron, quedan documentados y aceptan parámetros, funciones, condiciones y bucles.'],
 ['¿Qué es un terminal?','El programa (un emulador de terminal, como Xfce Terminal) que muestra una ventana de texto donde se escriben las órdenes. No las interpreta: se las pasa a la shell.'],
 ['¿Qué es una shell o intérprete de comandos?','El programa que lee las órdenes, las interpreta y pide al sistema operativo que las ejecute. También es un lenguaje de programación.'],
 ['¿Qué es sh?','La Bourne Shell, la shell clásica de Unix. Hoy /bin/sh es la shell POSIX del sistema; en Ubuntu es un enlace a dash.'],
 ['¿Qué es Bash?','La Bourne-Again SHell del proyecto GNU (Brian Fox, licencia GPL). Es compatible con sh y añade arrays, [[ ]], {1..10}, $(( )), historial y autocompletado.'],
 ['¿Qué es POSIX?','Un estándar que define la interfaz de los sistemas tipo Unix, sus comandos y su shell, para que los scripts sean portables. Se basa en la Bourne Shell.'],
 ['¿Qué función tiene el shebang?','Es la primera línea (#!/bin/bash) e indica qué intérprete ejecuta el fichero cuando se lanza como programa con ./'],
 ['bash script.sh frente a ./script.sh','Con bash script.sh, bash lee el fichero como datos: solo hace falta permiso r y no se tiene en cuenta el shebang. Con ./script.sh se ejecuta como programa: hace falta el permiso x y se usa el intérprete del shebang.'],
 ['¿Qué significa tener permiso de ejecución?','Que el fichero se puede lanzar como un programa (el bit x, que se activa con chmod +x).'],
 ['¿Qué es la variable PATH?','La lista de directorios, separados por «:», donde la shell busca los comandos cuando se escribe solo su nombre.'],
 ['¿Por qué ls funciona sin ./ y mi script no?','Porque ls está en /usr/bin, que está en el PATH. El directorio actual no está en el PATH por seguridad.'],
 ['¿Qué pasaría si moviera el script a /usr/bin?','Se podría ejecutar desde cualquier sitio escribiendo solo su nombre (para copiarlo ahí haría falta sudo).'],
 ['Diferencia entre #!/bin/sh y #!/bin/bash','Con #!/bin/sh lo ejecuta dash (POSIX, rápida, sin extensiones). Con #!/bin/bash lo ejecuta Bash, con todas sus funciones.'],
 ['¿Qué permite hacer una red Host-Only?','Crear una red privada solo entre el anfitrión y las MVs, sin salida a Internet, para comunicarse (ping, SSH) de forma aislada.'],
 ['SSH desde PowerShell frente a SSH desde VS Code','PowerShell solo da un terminal remoto. VS Code instala un pequeño servidor en la MV (~/.vscode-server) y ofrece editor, explorador, terminal y extensiones que se ejecutan en la MV.'],
 ['¿Dónde están realmente los scripts creados desde VS Code?','En la MV Xubuntu (/home/profesoru/aso_sh_40_clemente_j). VS Code solo los edita a distancia.'],
 ['¿Hace falta VS Code instalado en Xubuntu?','No. Basta con el servidor SSH; la parte remota de VS Code se instala sola al conectarse.'],
 ['e04: ¿qué diferencia hay entre incluir y ejecutar?','Ejecutar (./x) crea un proceso hijo que no comparte variables, cuyo exit solo lo cierra a él y que necesita permiso x. Incluir (. x) mete el código en la shell actual: comparte variables y funciones y su exit cierra el script principal.'],
 ['e07: ¿qué ocurre al usar reales con $(( ))?','Error de sintaxis («operador aritmético no válido»): Bash solo opera con enteros. Hay que usar bc -l.'],
 ['e17: ¿cómo se comporta scale?','Fija los decimales del resultado de la división y corta, no redondea. En las sumas y restas se usan los decimales de los operandos. Con bc -l el valor por defecto es 20.']];
$('#qa').innerHTML=QA.map(([q,a])=>'<details class="qa"><summary>'+esc(q)+'</summary><div class="ans"><p>'+esc(a)+'</p></div></details>').join('');

/* ═════════════ TEST ═════════════ */
const Test=(function(){
  const LV=[[0,'Novato del prompt','🐣'],[120,'Aprendiz de echo','📢'],[300,'Domador de variables','🧮'],[600,'Maestro del if','🔀'],[1000,'Señor de los bucles','🔁'],[1600,'Arquitecto de funciones','🏗️'],[2400,'Ninja del shell','🥷'],[3400,'Gurú de Bash','🧙'],[4800,'Root','👑'],[6500,'Leyenda del kernel','🐧']];
  const BASE={1:10,2:20,3:30},LVN={1:'Fácil',2:'Medio',3:'Difícil'};
  const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 'q'+(h>>>0).toString(36)};
  const items=Q.map((q,i)=>({i,id:hash(q[2]+(q[6]||'')),t:q[0],l:q[1],q:q[2],o:q[3],a:q[4],e:q[5],c:q[6]}));
  let S=rd('t2.test',null)||{xp:0,best:0,ans:0,ok:0,qs:{},games:0,nick:'',bestNota:0};
  const save=()=>wr('t2.test',S);
  const cfg={lv:new Set([1,2,3]),tp:new Set(Object.keys(TOP)),n:10};
  let G=null;const R=$('#testRoot');
  function level(xp){let k=0;for(let i=0;i<LV.length;i++)if(xp>=LV[i][0])k=i;const cur=LV[k],nx=LV[k+1];return{k,name:cur[1],emo:cur[2],pct:nx?(xp-cur[0])/(nx[0]-cur[0])*100:100,next:nx?nx[0]-xp:0}}
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
  const pool=()=>items.filter(x=>cfg.lv.has(x.l)&&cfg.tp.has(x.t));
  const wrongs=()=>items.filter(x=>{const s=S.qs[x.id];return s&&s[1]>0&&s[2]===0});
  const MODES=[
    ['rapido','⚡','Práctica','Las preguntas que elijas abajo (nivel, bloques y cuántas), con corrección al momento.','#0c9a6a'],
    ['examen','🎯','Modo examen','30 preguntas mezcladas, 25 minutos y la nota al final. Sin pistas.','#1a6fd6'],
    ['super','❤️','Supervivencia','Preguntas sin fin hasta fallar 3. ¿Hasta dónde llega tu racha?','#d93b55'],
    ['flash','⏱️','Relámpago','60 segundos para acertar todas las que puedas. Cada acierto suma 3 s.','#c76a05'],
    ['fallos','🩹','Repasar fallos','Solo las preguntas que has fallado y aún no has acertado.','#6a48d6'],
    ['dificil','🔥','Solo difíciles','Las preguntas de nivel difícil de todos los bloques.','#0e7bbd']];
  function home(){if(G&&G.run)return;clearInterval(G&&G.tick);G=null;const L=level(S.xp),w=wrongs().length,mastered=items.filter(x=>{const s=S.qs[x.id];return s&&s[0]>0}).length;
    R.innerHTML='<div class="t-hero"><div><span class="eyebrow"><i></i> '+items.length+' preguntas · 3 niveles · 13 bloques</span><h1>Test y <span style="color:var(--amber)">preguntas rápidas</span></h1><p class="muted" style="margin:0;max-width:60ch">Acierta seguido para subir la racha 🔥 y el multiplicador de XP. Atajos: teclas <kbd>1</kbd>–<kbd>4</kbd> para responder y <kbd>Intro</kbd> para seguir.</p></div>'+
      '<div class="lvlcard"><div class="badge">'+L.emo+'</div><div><small>Nivel '+(L.k+1)+'</small><br><b>'+L.name+'</b><div class="xp"><i style="width:'+L.pct+'%"></i></div><small>'+S.xp+' XP'+(L.next?' · faltan '+L.next+' para el siguiente':' · ¡nivel máximo!')+'</small></div></div></div>'+
      '<div class="kpis"><div class="kpi"><b>🔥 '+S.best+'</b><span>mejor racha</span></div><div class="kpi"><b>'+(S.ans?Math.round(S.ok/S.ans*100):0)+'%</b><span>aciertos ('+S.ok+'/'+S.ans+')</span></div><div class="kpi"><b>'+mastered+'/'+items.length+'</b><span>preguntas dominadas</span></div><div class="kpi"><b>'+(S.bestNota?S.bestNota.toFixed(1):'—')+'</b><span>mejor nota de examen</span></div></div>'+
      '<div class="modes">'+MODES.map(([id,ic,t,d,c])=>'<button class="mode" type="button" data-m="'+id+'" style="--c:'+c+(id==='fallos'&&!w?';opacity:.5" disabled':'"')+'><div class="mi">'+ic+'</div><h4>'+t+'</h4><p>'+d+'</p><span class="mt">'+(id==='fallos'?w+' pendientes':id==='rapido'?'según la configuración':'EMPEZAR')+' →</span></button>').join('')+'</div>'+
      '<div class="cfg"><span class="lbl">Nivel</span><span class="topics" id="cLv">'+[1,2,3].map(l=>'<button class="tchip" type="button" data-l="'+l+'" aria-pressed="'+cfg.lv.has(l)+'">'+LVN[l]+' <i>'+items.filter(x=>x.l===l).length+'</i></button>').join('')+'</span>'+
      '<span class="lbl" style="margin-left:8px">Preguntas</span><span class="seg" id="cN">'+[10,20,40,0].map(n=>'<button type="button" data-v="'+n+'" aria-pressed="'+(cfg.n===n)+'">'+(n||'Todas')+'</button>').join('')+'</span>'+
      '<span class="lbl" style="width:100%">Bloques <button class="btn sm" type="button" id="cAll" style="margin-left:6px">Todos / ninguno</button> <span style="text-transform:none;letter-spacing:0;font-family:var(--f-b)" id="cCount"></span></span><span class="topics" id="cTp">'+Object.entries(TOP).map(([k,v])=>'<button class="tchip" type="button" data-t="'+k+'" aria-pressed="'+cfg.tp.has(k)+'">'+esc(v)+' <i>'+items.filter(x=>x.t===k).length+'</i></button>').join('')+'</span></div>'+
      '<h3 style="margin:26px 0 4px;font-size:1.2rem">Dominio por bloque</h3><p class="muted" style="margin:0;font-size:.88rem">% de preguntas del bloque que has acertado alguna vez.</p><div class="mastery">'+Object.entries(TOP).map(([k,v],i)=>{const its=items.filter(x=>x.t===k),m=its.filter(x=>{const s=S.qs[x.id];return s&&s[0]>0}).length,p=Math.round(m/its.length*100);
        return '<div class="mrow"><div><span>'+esc(v)+'</span><b>'+p+'%</b></div><div class="mb"><i style="width:'+p+'%;background:'+(p>=80?'var(--acc)':p>=40?'var(--amber)':'var(--rose)')+'"></i></div></div>'}).join('')+'</div>'+
      '<h3 style="margin:30px 0 8px;font-size:1.2rem">🏆 Ranking</h3><div class="row" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><label for="nick" class="muted" style="font-size:.88rem">Tu nombre en el ranking:</label><input id="nick" type="text" maxlength="20" value="'+esc(S.nick)+'" placeholder="Escribe tu nombre" style="font:inherit;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--ink)"></div><div id="rank" class="card" style="padding:6px 10px"><p class="muted" style="margin:8px">Cargando…</p></div>'+
      '<p class="muted" style="font-size:.8rem;margin-top:18px"><button class="btn sm" type="button" id="tReset">Borrar mi progreso del test</button></p>';
    $$('.mode',R).forEach(b=>b.onclick=()=>start(b.dataset.m));
    $$('#cLv .tchip').forEach(b=>b.onclick=()=>{const l=+b.dataset.l;cfg.lv.has(l)?cfg.lv.delete(l):cfg.lv.add(l);if(!cfg.lv.size)cfg.lv.add(l);b.setAttribute('aria-pressed',cfg.lv.has(l));cnt()});
    $$('#cTp .tchip').forEach(b=>b.onclick=()=>{const t=b.dataset.t;cfg.tp.has(t)?cfg.tp.delete(t):cfg.tp.add(t);b.setAttribute('aria-pressed',cfg.tp.has(t));cnt()});
    $('#cAll').onclick=()=>{const all=cfg.tp.size===Object.keys(TOP).length;cfg.tp=new Set(all?[]:Object.keys(TOP));$$('#cTp .tchip').forEach(b=>b.setAttribute('aria-pressed',cfg.tp.has(b.dataset.t)));cnt()};
    seg('#cN',v=>{cfg.n=+v});
    $('#nick').onchange=e=>{S.nick=e.target.value.trim().slice(0,20);save();toast('Nombre guardado')};
    $('#tReset').onclick=()=>{if(confirm('¿Borrar XP, rachas y estadísticas del test?')){S={xp:0,best:0,ans:0,ok:0,qs:{},games:0,nick:S.nick,bestNota:0};save();home()}};
    function cnt(){$('#cCount').textContent='→ '+pool().length+' preguntas disponibles'}
    cnt();ranking()}
  function start(m){let list,opts={mode:m,lives:null,time:null,instant:true,endless:false};
    if(m==='rapido'){list=shuffle(pool());if(cfg.n)list=list.slice(0,cfg.n)}
    else if(m==='examen'){const p=shuffle(items);list=[...p.filter(x=>x.l===1).slice(0,9),...p.filter(x=>x.l===2).slice(0,13),...p.filter(x=>x.l===3).slice(0,8)];list=shuffle(list);opts.time=25*60;opts.instant=false}
    else if(m==='super'){list=shuffle(pool());opts.lives=3;opts.endless=true}
    else if(m==='flash'){list=shuffle(items.filter(x=>x.l<3));opts.time=60;opts.endless=true;opts.flash=true}
    else if(m==='fallos'){list=shuffle(wrongs())}
    else if(m==='dificil'){list=shuffle(items.filter(x=>x.l===3))}
    if(!list.length){toast('No hay preguntas con esa configuración');return}
    G=Object.assign(opts,{list,k:0,ok:0,streak:0,best:0,xp:0,log:[],run:true,t0:Date.now()});
    if(G.time){G.left=G.time;G.tick=setInterval(()=>{G.left--;const t=$('#tTimer');if(t){t.textContent=fmtT(G.left);t.classList.toggle('low',G.left<=(G.flash?10:60))}if(G.left<=0){clearInterval(G.tick);finish()}},1000)}
    location.hash!=='#test'&&history.replaceState(null,'','#test');show()}
  const fmtT=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  const mult=()=>1+Math.min(4,Math.floor(G.streak/3))*.5;
  function show(){if(G.k>=G.list.length){if(G.endless&&G.mode==='super'){G.list=G.list.concat(shuffle(pool()))}else if(G.endless){G.list=G.list.concat(shuffle(items.filter(x=>x.l<3)))}else return finish()}
    const it=G.list[G.k],order=shuffle(it.o.map((o,i)=>i));G.order=order;G.answered=false;
    const total=G.endless?'∞':G.list.length;
    R.innerHTML='<div class="qwrap"><div class="qtop"><button class="btn sm" type="button" id="tQuit">✕ Salir</button><span class="qn">'+(G.k+1)+' / '+total+'</span>'+
      (G.endless?'':'<div class="qprog"><i style="width:'+(G.k/G.list.length*100)+'%"></i></div>')+
      (G.lives!=null?'<span class="lives">'+'❤️'.repeat(G.lives)+'🖤'.repeat(3-G.lives)+'</span>':'')+
      (G.time?'<span class="timer" id="tTimer">'+fmtT(G.left)+'</span>':'')+
      (G.instant?'<span class="mult" title="Multiplicador de XP">x'+mult()+'</span><span class="flame'+(G.streak>=3?' hot':'')+'" id="tFlame"><span class="f">🔥</span>'+G.streak+'</span>':'')+'</div>'+
      '<div class="qcard" id="qc"><div class="qmeta"><span class="tag lv'+it.l+'">'+LVN[it.l].toUpperCase()+'</span><span class="tag" style="--c:var(--violet)">'+esc(TOP[it.t])+'</span></div><h3>'+esc(it.q)+'</h3>'+(it.c?codeBlock(it.c,'script.sh'):'')+
      '<div class="opts">'+order.map((oi,n)=>'<button class="opt" type="button" data-oi="'+oi+'"><kbd>'+(n+1)+'</kbd><span>'+esc(it.o[oi])+'</span></button>').join('')+'</div><div id="tFb"></div>'+
      '<div class="qbar"><span class="hint">Teclas 1–'+order.length+' para responder · Intro para seguir</span><button class="btn pri" type="button" id="tNext" hidden>'+(G.instant?'Siguiente →':'Siguiente →')+'</button></div></div></div>';
    $$('.opt',R).forEach(b=>b.onclick=()=>answer(+b.dataset.oi,b));
    $('#tQuit').onclick=()=>{if(G.k===0||confirm('¿Salir? Se guardará lo que llevas.'))finish(true)};
    $('#tNext').onclick=next;
    $('#qc .code')&&($('#qc .code').dataset.raw=it.c)}
  function answer(oi,btn){if(G.answered||!G.run)return;G.answered=true;const it=G.list[G.k],good=oi===it.a;
    G.log.push({it,oi,good});S.ans++;const st=S.qs[it.id]||[0,0,0];good?st[0]++:st[1]++;st[2]=good?1:0;S.qs[it.id]=st;
    if(good){G.ok++;S.ok++;G.streak++;G.best=Math.max(G.best,G.streak);const g=Math.round(BASE[it.l]*(G.instant?mult():1));G.xp+=g;S.xp+=g;
      if(G.streak>S.best){S.best=G.streak}if(G.flash){G.left+=3}
      if(G.instant){floatXP('+'+g+' XP',btn);if([5,10,15,20,30,50].includes(G.streak)){toast('🔥 ¡Racha de '+G.streak+'!');confetti(G.streak>=10?90:45)}}}
    else{G.streak=0;if(G.lives!=null)G.lives--}
    save();
    if(G.instant){$$('.opt',R).forEach(b=>{b.disabled=true;const v=+b.dataset.oi;if(v===it.a)b.classList.add('ok');else if(v===oi)b.classList.add('ko');else b.classList.add('dim')});
      if(!good){$('#qc').classList.remove('shake');void $('#qc').offsetWidth;$('#qc').classList.add('shake')}
      $('#tFb').innerHTML='<div class="fb '+(good?'ok':'ko')+'"><span class="fi">'+(good?'✅':'❌')+'</span><div><b>'+(good?['¡Correcto!','¡Bien!','¡Exacto!','¡Eso es!'][Math.random()*4|0]:'Incorrecto · la buena es: '+esc(it.o[it.a]))+'</b><p>'+esc(it.e)+'</p></div></div>';
      const fl=$('#tFlame');if(fl){fl.innerHTML='<span class="f">🔥</span>'+G.streak;fl.classList.toggle('hot',G.streak>=3);fl.classList.remove('bump');void fl.offsetWidth;good&&fl.classList.add('bump')}
      $('.mult',R)&&($('.mult',R).textContent='x'+mult());
      if(G.lives!=null){$('.lives',R).textContent='❤️'.repeat(G.lives)+'🖤'.repeat(3-G.lives);if(G.lives<=0){$('#tNext').textContent='Ver resultados'}}
      if(G.flash){setTimeout(()=>{if(G&&G.run&&G.answered)next()},good?450:1300)}
      $('#tNext').hidden=false;$('#tNext').focus({preventScroll:true})}
    else{$$('.opt',R).forEach(b=>{b.disabled=true;if(b===btn)b.style.borderColor='var(--sky)';else b.classList.add('dim')});setTimeout(next,280)}}
  function next(){if(!G||!G.run)return;if(G.lives!=null&&G.lives<=0)return finish();G.k++;show()}
  function floatXP(t,el){if(reduce)return;const r=el.getBoundingClientRect(),d=document.createElement('div');d.className='xpfloat';d.textContent=t;d.style.left=(r.right-90)+'px';d.style.top=(r.top-6)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}
  function finish(quit){if(!G)return;clearInterval(G.tick);G.run=false;const n=G.log.length,ok=G.ok,nota=n?ok/n*10:0;S.games++;
    if(G.mode==='examen'&&!quit&&n)S.bestNota=Math.max(S.bestNota||0,nota);
    if(!G.instant){G.log.forEach(l=>{if(l.good){const g=BASE[l.it.l];G.xp+=g;S.xp+=g}})}
    save();
    if(n)persist(ok,n,nota);
    const C=2*Math.PI*86,msg=nota>=9?'¡Bestial! 🏆':nota>=7?'¡Muy bien! 💪':nota>=5?'Aprobado 👍':'A repasar un poco más 📚';
    R.innerHTML='<div class="res"><div class="big"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="86"/><circle class="fg" id="rRing" cx="100" cy="100" r="86" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/></svg><div><b id="rNota">0.0</b><span>sobre 10</span></div></div>'+
      '<h2>'+msg+'</h2><p class="muted">'+({rapido:'Práctica',examen:'Modo examen',super:'Supervivencia',flash:'Relámpago',fallos:'Repaso de fallos',dificil:'Solo difíciles'}[G.mode])+' · '+ok+' de '+n+' aciertos'+(quit?' (abandonado)':'')+'</p>'+
      '<div class="kpis"><div class="kpi"><b>+'+G.xp+'</b><span>XP ganada</span></div><div class="kpi"><b>🔥 '+G.best+'</b><span>mejor racha</span></div><div class="kpi"><b>'+Math.round((Date.now()-G.t0)/1000)+' s</b><span>tiempo</span></div><div class="kpi"><b>'+level(S.xp).emo+'</b><span>'+level(S.xp).name+'</span></div></div>'+
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn pri" type="button" id="rAgain">↻ Repetir modo</button>'+(G.log.some(l=>!l.good)?'<button class="btn" type="button" id="rWrong">🩹 Repetir mis fallos</button>':'')+'<button class="btn" type="button" id="rHome">⌂ Menú del test</button></div>'+
      '<div class="rev"><h3 style="margin:26px 0 10px;font-size:1.15rem">Revisión</h3><div class="seg" id="rF"><button type="button" data-v="ko" aria-pressed="true">Fallos</button><button type="button" data-v="all" aria-pressed="false">Todas</button></div><div id="rList" style="margin-top:12px"></div></div></div>';
    const draw=f=>{$('#rList').innerHTML=G.log.filter(l=>f==='all'||!l.good).map(l=>'<div class="ri'+(l.good?' c':'')+'"><b>'+esc(l.it.q)+'</b>'+(l.it.c?'<pre style="font:500 .8rem var(--f-m);background:var(--code-bg);color:var(--code-fg);padding:8px 10px;border-radius:8px;overflow:auto;margin:6px 0">'+esc(l.it.c)+'</pre>':'')+'<p>'+(l.good?'✅ '+esc(l.it.o[l.it.a]):'❌ Tu respuesta: <s>'+esc(l.it.o[l.oi])+'</s><br>✅ Correcta: <b>'+esc(l.it.o[l.it.a])+'</b>')+'</p><p>'+esc(l.it.e)+'</p></div>').join('')||'<p class="muted">¡Sin fallos! 🎉</p>'};
    draw('ko');seg('#rF',draw);
    const mode=G.mode,wrongList=G.log.filter(l=>!l.good).map(l=>l.it);
    $('#rAgain').onclick=()=>start(mode);$('#rHome').onclick=()=>{G=null;home()};
    $('#rWrong')&&($('#rWrong').onclick=()=>{G={mode:'fallos',list:shuffle(wrongList),k:0,ok:0,streak:0,best:0,xp:0,log:[],run:true,instant:true,t0:Date.now(),lives:null,time:null};show()});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#rRing').style.strokeDashoffset=C*(1-nota/10)}));
    if(reduce)$('#rNota').textContent=nota.toFixed(1);else{let t0;const an=ts=>{t0=t0||ts;const p=Math.min(1,(ts-t0)/1300),e=1-Math.pow(1-p,3);$('#rNota').textContent=(nota*e).toFixed(1);if(p<1)requestAnimationFrame(an)};requestAnimationFrame(an)}
    if(nota>=7&&n>=5)setTimeout(()=>confetti(110),500);
    scrollTo({top:0,behavior:reduce?'auto':'smooth'})}
  function persist(ok,n,nota){if(!window.claude||!claude.use)return;
    Promise.all([claude.use('db'),claude.use('user')]).then(([db,u])=>u.id().then(id=>db.doc('t2-ranking/'+id).get().then(snap=>{const prev=snap.exists?snap.data():{};
      return db.doc('t2-ranking/'+id).set({nick:S.nick||prev.nick||'Anónimo',score:ok,total:n,final:Math.round(nota*10)/10,best:Math.max(prev.best||0,Math.round(nota*10)/10),streak:Math.max(prev.streak||0,S.best),xp:S.xp,t:Date.now()})}))).catch(()=>{})}
  function ranking(){const box=$('#rank');if(!box)return;if(!window.claude||!claude.use){box.innerHTML='<p class="muted" style="margin:8px">Ranking no disponible.</p>';return}
    Promise.all([claude.use('db'),claude.use('user')]).then(([db,u])=>Promise.all([db.collection('t2-ranking').get(),u.id()])).then(([snap,me])=>{
      const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data())).sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,15);
      if(!$('#rank'))return;
      $('#rank').innerHTML=rows.length?'<table class="rank"><thead><tr><th>#</th><th>Nombre</th><th>XP</th><th>Mejor nota</th><th>🔥</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr class="'+(r.id===me?'me':'')+'"><td>'+(['🥇','🥈','🥉'][i]||i+1)+'</td><td>'+esc(r.nick||'Anónimo')+'</td><td>'+(r.xp||0)+'</td><td>'+(r.best!=null?r.best:'—')+'</td><td>'+(r.streak||0)+'</td></tr>').join('')+'</tbody></table>':'<p class="muted" style="margin:8px">Aún no hay partidas. ¡Juega una para aparecer!</p>'}).catch(()=>{$('#rank')&&($('#rank').innerHTML='<p class="muted" style="margin:8px">No se pudo cargar el ranking.</p>')})}
  addEventListener('keydown',e=>{if(curView!=='test'||!G||!G.run||e.target.matches('input,select,textarea'))return;
    if(/^[1-5]$/.test(e.key)){const b=$$('.opt',R)[+e.key-1];if(b&&!b.disabled){e.preventDefault();b.click()}}
    else if(e.key==='Enter'){const n=$('#tNext');if(n&&!n.hidden){e.preventDefault();next()}}});
  return{home}})();

route();watchRv();
})();
