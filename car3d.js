/* Builds a 3D car out of CSS boxes: an instructor and a learner sit inside. */
(function(){
  var car=document.getElementById('car'); if(!car) return;
  function box(o){
    var w=o.w,h=o.h,d=o.d,el=document.createElement('div');
    el.className='b';
    el.style.cssText='width:'+w+'px;height:'+h+'px;left:'+(-w/2)+'px;top:'+(-h/2)+'px;transform:translate3d('+(o.x||0)+'px,'+(o.y||0)+'px,'+(o.z||0)+'px)';
    var T={
      front:[w,h,0,0,'translateZ('+d/2+'px)'],
      back:[w,h,0,0,'rotateY(180deg) translateZ('+d/2+'px)'],
      right:[d,h,(w-d)/2,0,'rotateY(90deg) translateZ('+w/2+'px)'],
      left:[d,h,(w-d)/2,0,'rotateY(-90deg) translateZ('+w/2+'px)'],
      top:[w,d,0,(h-d)/2,'rotateX(90deg) translateZ('+h/2+'px)'],
      bottom:[w,d,0,(h-d)/2,'rotateX(-90deg) translateZ('+h/2+'px)']
    };
    for(var k in o.f){
      var t=T[k],f=document.createElement('i');
      f.style.cssText='width:'+t[0]+'px;height:'+t[1]+'px;left:'+t[2]+'px;top:'+t[3]+'px;transform:'+t[4]+';'+o.f[k];
      if(o.txt&&o.txt[k]) f.innerHTML=o.txt[k];
      el.appendChild(f);
    }
    car.appendChild(el); return el;
  }
  var red='linear-gradient(180deg,#ff6a6f 0%,#e63946 45%,#9f1620 100%)';
  var redEnd='background:linear-gradient(180deg,#d82d3a,#8e131c);border-radius:10px';
  var glass='background:linear-gradient(160deg,rgba(200,230,255,.5),rgba(70,110,160,.34));border:3px solid #c92c38;';

  /* ground shadow */
  var sh=document.createElement('div'); sh.className='shadow'; car.appendChild(sh);

  /* body */
  box({w:300,h:46,d:130,x:0,y:0,z:0,f:{
    front:'background:'+red+',linear-gradient(transparent 56%,rgba(255,255,255,.45) 56% 62%,transparent 62%);background-blend-mode:normal;border-radius:14px;box-shadow:inset 0 -8px 14px rgba(0,0,0,.25)',
    back:'background:'+red+';border-radius:14px;box-shadow:inset 0 -8px 14px rgba(0,0,0,.25)',
    right:redEnd,left:redEnd,
    top:'background:linear-gradient(90deg,#ff7a7e,#e63946 60%,#cf2a37);border-radius:14px',
    bottom:'background:#2a0a0e'}});
  /* cabin with glass */
  box({w:150,h:42,d:116,x:-18,y:-44,z:0,f:{
    front:glass+'border-radius:18px 46px 0 0',
    back:glass+'border-radius:46px 18px 0 0',
    right:glass+'border-radius:12px',left:glass+'border-radius:12px',
    top:'background:rgba(140,185,235,.28);border:3px solid #c92c38;border-radius:12px'}});
  /* learner "L" plate on roof */
  box({w:26,h:3,d:22,x:-18,y:-67,z:0,f:{top:'background:#fff;border:2px solid #d62839;color:#d62839;font:700 15px/18px Arial;text-align:center;border-radius:3px'},txt:{top:'L'}});
  /* bumpers + lights */
  box({w:8,h:12,d:126,x:150,y:15,z:0,f:{right:'background:#2b2f3c;border-radius:6px',front:'background:#2b2f3c',back:'background:#2b2f3c',top:'background:#3a3f50'}});
  box({w:8,h:12,d:126,x:-150,y:15,z:0,f:{left:'background:#2b2f3c;border-radius:6px',front:'background:#2b2f3c',back:'background:#2b2f3c',top:'background:#3a3f50'}});
  [-42,42].forEach(function(z){
    box({w:4,h:9,d:24,x:151,y:-6,z:z,f:{right:'background:#fff6c8;box-shadow:0 0 14px 4px rgba(255,240,160,.8);border-radius:4px',front:'background:#e8dc9a',back:'background:#e8dc9a',top:'background:#e8dc9a'}});
    box({w:4,h:9,d:24,x:-151,y:-6,z:z,f:{left:'background:#ff3b3b;box-shadow:0 0 12px 3px rgba(255,60,60,.7);border-radius:4px',front:'background:#a11',back:'background:#a11',top:'background:#a11'}});
  });
  /* number plates on front and back (uses assets/numberplate.jpeg if you add it) */
  function plate(x,face){
    var f={};
    f[face]='background:#fff;border:1.5px solid #222;border-radius:3px;color:#111;font:700 7px/11px Arial,sans-serif;text-align:center;overflow:hidden;box-sizing:border-box';
    var t={};t[face]='PDS 0000';
    return box({w:2,h:14,d:44,x:x,y:14,z:0,f:f,txt:t}).querySelector('i');
  }
  var plates=[plate(156,'right'),plate(-156,'left')];
  (function tryExt(list){
    if(!list.length)return;
    var ext=list[0],im=new Image();
    im.onload=function(){plates.forEach(function(p){p.innerHTML='';p.style.border='0';p.style.background='url(assets/numberplate.'+ext+') center/100% 100% no-repeat'})};
    im.onerror=function(){tryExt(list.slice(1))};
    im.src='assets/numberplate.'+ext;
  })(['jpeg','jpg','png','webp']);
  /* wheels: stacked discs for thickness */
  [[-95,1],[95,1],[-95,-1],[95,-1]].forEach(function(p){
    var g=document.createElement('div'); g.className='b';
    g.style.cssText='left:0;top:0;width:0;height:0;transform:translate3d('+p[0]+'px,22px,'+(p[1]*58)+'px)';
    for(var i=-8;i<=8;i+=4){
      var disc=document.createElement('i');
      disc.style.cssText='position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;transform:translateZ('+i+'px);background:radial-gradient(circle,#d7dbe4 0 24%,#2a2d38 25% 52%,#12141a 53%)';
      g.appendChild(disc);
    }
    car.appendChild(g);
  });
  /* people: billboards that always face the viewer */
  function person(cls,z){
    var f=document.createElement('div'); f.className='fig '+cls;
    f.style.transform='translate3d(14px,-40px,'+z+'px)';
    f.innerHTML='<div class="fig-in"><div class="head"></div><div class="torso"></div></div>';
    car.appendChild(f);
  }
  person('learner',-26);  /* learner at the wheel */
  person('coach',26);     /* instructor beside */
})();
