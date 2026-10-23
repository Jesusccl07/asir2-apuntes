/* Sustituto de window.claude para GitHub Pages: ofrece use("db") y use("user") con la misma API que
   usaban los tests dentro de Claude. Guarda en localStorage y, si hay Firebase configurado, sincroniza
   con Firestore (REST) para tener ranking compartido. También registra historial y tiempo de estudio. */
(function(){
  if(window.claude && window.claude.use) return;
  var LS={db:'asir.db',user:'asir.user',hist:'asir.hist',time:'asir.time'};
  function rd(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  var user=rd(LS.user,null);
  if(!user){user={id:'u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36),name:''};wr(LS.user,user)}
  var cfg=(window.ASIR_CONFIG||{}).firebase;
  var m=(location.pathname.match(/temas\/([^/]+)\/([^/.]+)/)||[]);
  var ctx={subject:m[1]||'',topic:m[2]||''};

  /* ---- backend remoto (Firestore REST) ---- */
  var base=cfg?'https://firestore.googleapis.com/v1/projects/'+cfg.projectId+'/databases/(default)/documents':null;
  function enc(v){
    if(v===null||v===undefined)return{nullValue:null};
    if(typeof v==='boolean')return{booleanValue:v};
    if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};
    if(typeof v==='string')return{stringValue:v};
    if(Array.isArray(v))return{arrayValue:{values:v.map(enc)}};
    var f={};Object.keys(v).forEach(function(k){f[k]=enc(v[k])});return{mapValue:{fields:f}};
  }
  function dec(v){
    if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;
    if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;
    if('arrayValue'in v)return(v.arrayValue.values||[]).map(dec);
    if('mapValue'in v){var o={},f=v.mapValue.fields||{};Object.keys(f).forEach(function(k){o[k]=dec(f[k])});return o}
    return null;
  }
  function fields(d){var o={};Object.keys(d.fields||{}).forEach(function(k){o[k]=dec(d.fields[k])});return o}
  function rUrl(p){return base+'/'+p+'?key='+cfg.apiKey}
  var remote={
    list:function(col,n){return fetch(base+'/'+col+'?pageSize='+(n||300)+'&key='+cfg.apiKey).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
      return(j.documents||[]).map(function(d){return{id:d.name.split('/').pop(),data:fields(d)}})})},
    get:function(p){return fetch(rUrl(p)).then(function(r){if(r.status===404)return null;if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){return d?fields(d):null})},
    set:function(p,data){var f={};Object.keys(data).forEach(function(k){f[k]=enc(data[k])});return fetch(rUrl(p),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:f})}).then(function(r){if(!r.ok)throw new Error(r.status)})},
    del:function(p){return fetch(rUrl(p),{method:'DELETE'}).then(function(r){if(!r.ok)throw new Error(r.status)})}
  };

  /* ---- base de datos ---- */
  var all=rd(LS.db,{});
  function save(){wr(LS.db,all)}
  function snapDoc(id,data){return{id:id,exists:true,data:function(){return JSON.parse(JSON.stringify(data))}}}
  function noDoc(id){return{id:id,exists:false,data:function(){return undefined}}}
  function logHist(col,id,data){
    if(id!==user.id)return;
    var h=rd(LS.hist,[]);h.push({t:Date.now(),col:col,subject:ctx.subject,topic:ctx.topic,data:data});
    if(h.length>800)h=h.slice(-800);wr(LS.hist,h);
  }
  var listeners=[];
  function notify(col){listeners.forEach(function(l){if(l.col===col)l.fire()})}
  function mix(col,rows){
    var out={};rows.forEach(function(r){out[r.id]=r.data});
    var loc=all[col]||{};Object.keys(loc).forEach(function(id){if(!(id in out)&&id===user.id)out[id]=loc[id]});
    return out;
  }
  function docRef(path){
    var p=path.split('/'),col=p[0],id=p[1];
    function local(){var v=(all[col]||{})[id];return v?snapDoc(id,v):noDoc(id)}
    return{
      get:function(){
        if(base)return remote.get(path).then(function(d){return d?snapDoc(id,d):local()}).catch(local);
        return Promise.resolve(local());
      },
      set:function(data){
        data=JSON.parse(JSON.stringify(data));
        (all[col]=all[col]||{})[id]=data;save();logHist(col,id,data);notify(col);
        return base?remote.set(path,data).then(function(){notify(col)}):Promise.resolve();
      },
      update:function(patch){var self=this;return this.get().then(function(s){return self.set(Object.assign({},s.exists?s.data():{},patch))})},
      delete:function(){if(all[col])delete all[col][id];save();notify(col);return base?remote.del(path).then(function(){notify(col)}):Promise.resolve()}
    };
  }
  function collection(col){
    var lim=300;
    function load(){
      if(base)return remote.list(col,lim).then(function(rows){var o=mix(col,rows);all[col]=Object.assign({},all[col],o);save();return o});
      return Promise.resolve(all[col]||{});
    }
    function toSnap(o){var docs=Object.keys(o).slice(0,lim).map(function(id){return snapDoc(id,o[id])});return{docs:docs,size:docs.length,empty:!docs.length,forEach:function(f){docs.forEach(f)}}}
    var q={
      limit:function(n){lim=n;return q},
      get:function(){return load().then(toSnap)},
      onSnapshot:function(cb,err){
        var dead=false,l={col:col,fire:function(){if(!dead)load().then(function(r){if(!dead)cb(toSnap(r))},function(e){err&&err(e)})}};
        listeners.push(l);setTimeout(l.fire,0);
        var timer=base?setInterval(function(){if(document.visibilityState==='visible')l.fire()},45000):null;
        return function(){dead=true;if(timer)clearInterval(timer);listeners=listeners.filter(function(x){return x!==l})};
      }
    };
    return q;
  }
  var db={collection:collection,doc:docRef};
  /* sube mis puntuaciones guardadas en este navegador para aparecer en el ranking aunque jugara antes de activarlo */
  if(base){try{
    var last=+(localStorage.getItem('asir.synced')||0);
    if(Date.now()-last>6*3600*1000){
      var jobs=[];Object.keys(all).forEach(function(c){var d=all[c]&&all[c][user.id];if(d)jobs.push(remote.set(c+'/'+user.id,d))});
      if(jobs.length)Promise.all(jobs).then(function(){localStorage.setItem('asir.synced',String(Date.now()))}).catch(function(){});
    }
  }catch(e){}}
  var userApi={
    id:function(){return Promise.resolve(user.id)},
    can:function(){return Promise.resolve(true)},
    isOwner:function(){return Promise.resolve(false)},
    me:function(){return Promise.resolve({id:user.id,name:user.name||''})},
    profiles:function(ids){var o={};Object.keys(all).forEach(function(c){Object.keys(all[c]).forEach(function(id){var d=all[c][id];if(ids.indexOf(id)>=0&&(d.nick||d.alias))o[id]={name:d.nick||d.alias}})});return Promise.resolve(o)}
  };
  window.claude={use:function(n){return Promise.resolve(n==='db'?db:n==='user'?userApi:null)}};

  /* ---- tiempo de estudio por tema ---- */
  if(ctx.subject){
    var start=Date.now(),vis=document.visibilityState==='visible',acc=0;
    var flush=function(){
      if(vis)acc+=Date.now()-start;start=Date.now();
      if(acc<3000)return;var t=rd(LS.time,{}),k=ctx.subject+'/'+ctx.topic,d=new Date().toISOString().slice(0,10);
      t[k]=t[k]||{total:0,days:{}};t[k].total+=acc;t[k].days[d]=(t[k].days[d]||0)+acc;wr(LS.time,t);acc=0;
    };
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){flush();vis=false}else{vis=true;start=Date.now()}});
    window.addEventListener('pagehide',flush);setInterval(flush,30000);
  }
})();
