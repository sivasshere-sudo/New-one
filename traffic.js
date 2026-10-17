/* Tiny cars drive along the page edges: left lane goes top-to-bottom, right lane bottom-to-top.
   They stop at the white line on red/yellow and move again on green. */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS=['#ffc247','#4fb3ff','#ff7a7a','#7be0a4','#eef2fb','#b79cff','#ffa94d'];
  var G=6000,Y=1500,R=5500,CYC=G+Y+R,GAP=8,VMAX=95;
  function phase(t){var m=((t%CYC)+CYC)%CYC;return m<G?'green':(m<G+Y?'yellow':'red')}
  var lanes=[];

  function makeLane(side,dir,offset,count){
    var el=document.createElement('div');el.className='lane '+side;el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="road"><div class="stop"></div></div><div class="light"><i class="lamp r"></i><i class="lamp y"></i><i class="lamp g"></i></div>';
    document.body.appendChild(el);
    var L={el:el,dir:dir,off:offset,stop:el.querySelector('.stop'),light:el.querySelector('.light'),
           lamps:{red:el.querySelector('.r'),yellow:el.querySelector('.y'),green:el.querySelector('.g')},cars:[],ph:''};
    for(var i=0;i<count;i++){
      var c=document.createElement('div');c.className='tcar '+(dir>0?'down':'up');
      c.style.background=COLORS[(i*3+(dir>0?0:2))%COLORS.length];
      el.appendChild(c);
      L.cars.push({el:c,y:0,v:0,vm:VMAX*(.8+Math.random()*.3)});
    }
    lanes.push(L);
  }
  var mobile=window.innerWidth<=700, n=mobile?3:4;
  makeLane('left',1,0,n);
  makeLane('right',-1,G/2+1000,n);

  var H,len;
  function layout(first){
    H=window.innerHeight;len=lanes[0].cars[0].el.offsetHeight;
    lanes.forEach(function(L){
      L.stopY=L.dir>0?H*.40:H*.60;
      L.stop.style.top=L.stopY+'px';
      L.light.style.top=(L.dir>0?L.stopY-L.light.offsetHeight-6:L.stopY+6)+'px';
      if(first){
        L.cars.forEach(function(c,i){
          var base=(i+.35)/L.cars.length*(H+len*2)-len;
          c.y=L.dir>0?base:H-base-len;
        });
      }
    });
  }
  layout(true);addEventListener('resize',function(){layout(false)});

  function setLamps(L,ph){
    if(L.ph===ph)return;L.ph=ph;
    for(var k in L.lamps)L.lamps[k].classList.toggle('on',k===ph);
  }
  function draw(L){L.cars.forEach(function(c){c.el.style.transform='translate3d(0,'+c.y.toFixed(1)+'px,0)'})}

  function step(L,dt,now){
    var ph=phase(now+L.off);setLamps(L,ph);
    var dir=L.dir,order=L.cars.slice().sort(function(a,b){return dir>0?b.y-a.y:a.y-b.y});
    order.forEach(function(c,k){
      var lead=k?order[k-1]:null;
      var front=dir>0?c.y+len:c.y;
      var d=Infinity;
      if(ph!=='green'){
        if(dir>0?front<=L.stopY+.5:front>=L.stopY-.5) d=dir>0?L.stopY-front:front-L.stopY;
      }
      if(lead){
        var g=dir>0?lead.y-front-GAP:c.y-(lead.y+len)-GAP;
        if(g<d)d=g;
      }
      if(d<0)d=0;
      var target=Math.min(c.vm,d*2.6);
      c.v+=(target-c.v)*Math.min(1,dt*4);
      var move=c.v*dt; if(move>d)move=d;
      c.y+=dir*move;
      /* leave the page -> re-enter behind the last car */
      if(dir>0&&c.y>H+12){
        var minY=Math.min.apply(null,L.cars.filter(function(o){return o!==c}).map(function(o){return o.y}));
        c.y=Math.min(minY-len-GAP-30-Math.random()*90,-len-4);c.v=0;
      }else if(dir<0&&c.y<-len-12){
        var maxY=Math.max.apply(null,L.cars.filter(function(o){return o!==c}).map(function(o){return o.y}));
        c.y=Math.max(maxY+len+GAP+30+Math.random()*90,H+4);c.v=0;
      }
    });
    draw(L);
  }

  var last=performance.now(),t0=last;
  if(reduce){lanes.forEach(function(L){setLamps(L,'green');draw(L)});return}
  function frame(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    lanes.forEach(function(L){step(L,dt,now-t0)});
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
