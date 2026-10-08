import {buildKhayelitsha} from './khayelitsha.js';
import {holeLevel,standings,nearestSupporter,canHuntHole,canSwallowHole} from './gameplay.js';
import {GameMusic} from './music.js';
import * as THREE from './three.module.js';
import {logoTexture,logoFiles} from './party-logos.js';
import {reactionFor,everyday,cheerFor} from './dialogue.js';
import {VERTICAL,HORIZONTAL,inField,setCoastal,onRoad,nearestRoad,moveOnRoad,routeBetween,clearRoute,streetName} from './roads.js';
import {makeTree,makeShrub,makePalm,createWater,createBeach,buildHouse,buildWallSegment,wind,waterTime,limbGeo,fineSphere,hairCapGeo,torsoGeo,skirtGeo,shade,surfaceMat,scaledBox,glassMat,groundMaps} from './realism.js';
const $=s=>document.querySelector(s), TAU=Math.PI*2;
const PARTIES={PA:{color:0x19bd65,hex:'#65f395',name:'PA'},ANC:{color:0xf4cc25,hex:'#ffe65e',name:'ANC'},DA:{color:0x2464df,hex:'#6aa6ff',name:'DA'},EFF:{color:0xdc1420,hex:'#dc1420',name:'EFF'}};
Object.assign(PARTIES,{"ActionSA":{"color":0x087b42,"hex":"#00a651","name":"ActionSA"},"NCC":{"color":0x111111,"hex":"#e02227","name":"National Coloured Congress"},"FF+":{"color":14449700,"hex":"#ffb965","name":"Freedom Front Plus"},"MK":{"color":2382900,"hex":"#b2bd52","name":"uMkhonto weSizwe"},"GOOD":{"color":16022528,"hex":"#ffa451","name":"GOOD"},"PMC":{"color":13248832,"hex":"#ff8295","name":"People’s Movement for Change"}});
const music=new GameMusic(),surf=[];let builtWard=null,activeKeys=['PA','ANC','DA','EFF'],canAdvance=false;const wardWins={};
const keys=Object.keys(PARTIES), people=[], holes=[], particles=[], walkers=[], decorations=[];
let ward=18;
const WARDS={
  79:{name:'Mitchells Plain (Rocklands & Portland)',short:'Mitchells Plain',level:1,diff:'EASY',target:15,sub:'Rocklands & Portland · Street canvassing',x:0,z:7,crises:1},
  18:{name:'Khayelitsha (Harare & Kuyasa)',short:'Khayelitsha',level:2,diff:'EASY',target:18,sub:'Harare & Kuyasa · Community transport corridor',x:0,z:7,crises:2},
  82:{name:'Mitchells Plain (Tafelsig)',short:'Tafelsig',level:3,diff:'MEDIUM',target:20,sub:'Tafelsig · High turnout voter stronghold',x:0,z:-48,crises:2},
  87:{name:'Khayelitsha (Site C & Lingelethu)',short:'Site C Khayelitsha',level:4,diff:'MEDIUM',target:22,sub:'Site C · Dense spaza market alleys & halls',x:0,z:7,crises:3},
  44:{name:'Gugulethu (Klipfontein & NY Streets)',short:'Gugulethu',level:5,diff:'MEDIUM',target:25,sub:'Historic activist streets & bustling taxi rank',x:0,z:-48,crises:3},
  42:{name:'Manenberg & Heideveld',short:'Manenberg',level:6,diff:'HARD',target:25,sub:'Manenberg & Heideveld · High-stakes battleground',x:0,z:7,crises:4},
  116:{name:'Mitchells Plain (Beacon Valley & Eastridge)',short:'Beacon Valley',level:7,diff:'HARD',target:25,sub:'Beacon Valley & Eastridge · Vocal community rally',x:0,z:-48,crises:4},
  57:{name:'Woodstock & Salt River',short:'Woodstock',level:8,diff:'HARD',target:25,sub:'Woodstock & Salt River · Heritage & gentrification debates',x:-24,z:7,crises:3},
  115:{name:'Cape Town City Bowl & Foreshore',short:'City Bowl',level:9,diff:'HARD',target:25,sub:'City Bowl · Civic centres & commercial corridors',x:0,z:7,crises:4},
  54:{name:'Camps Bay & Sea Point',short:'Camps Bay & Coast',level:10,diff:'EXPERT',target:25,sub:'Camps Bay & Atlantic Seaboard · Opposition stronghold',x:-24,z:7,crises:5}
};
const WARD_ORDER=[79,18,82,87,44,42,116,57,115,54];
let selected='PA',state='start',remaining=60,elapsed=0,rallyUntil=0,rallyCooldown=0,lastTime=0,uiTime=0,sound=true,audioCtx,player,scene,renderer,camera,shadowLight;
let pointerTarget=null,dragging=false,stickInput={x:0,y:0},frame=0;
const isMobileDevice=()=>{if(typeof navigator==='undefined')return false;const ua=navigator.userAgent||'';const touch=navigator.maxTouchPoints>1;const small=window.innerWidth<=900||window.innerHeight<=600;return /Android|iPhone|iPad|iPod|Mobile|Silk|BlackBerry/i.test(ua)||(touch&&small)};const MOBILE=isMobileDevice();let renderClock=0;const crowdBatches=[];let crowdColorsDirty=true;
const speechBubbles=[],worldAnims=[];
let bubbleClock=0;
const holeUniform={value:Array.from({length:4},()=>new THREE.Vector3(1000,1000,1.075))};
const pressed=new Set(),raycaster=new THREE.Raycaster(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),clockPoint=new THREE.Vector3();
let seed=5927;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const range=(a,b)=>a+(b-a)*random();
const matCache=new Map(),geoCache=new Map();
function material(color,rough=0.7,metal=0){const key=`${color}:${rough}:${metal}`;if(!matCache.has(key))matCache.set(key,new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return matCache.get(key)}
function mesh(geo,color,parent=scene){const m=new THREE.Mesh(geo,typeof color==='object'?color:material(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(w,h,d,color,x,y,z,parent=scene){const key=`b${w},${h},${d}`;if(!geoCache.has(key))geoCache.set(key,new THREE.BoxGeometry(w,h,d));const m=mesh(geoCache.get(key),color,parent);m.position.set(x,y,z);return m}
function sphere(r,color,x,y,z,parent=scene,sx=1,sy=1,sz=1){const key='smooth-unit-sphere';if(!geoCache.has(key))geoCache.set(key,new THREE.SphereGeometry(1,24,16));const m=mesh(geoCache.get(key),color,parent);m.position.set(x,y,z);m.scale.set(r*sx,r*sy,r*sz);return m}
function cylinder(rt,rb,h,color,x,y,z,parent=scene,n=12){const key=`c${rt},${rb},${h},${n}`;if(!geoCache.has(key))geoCache.set(key,new THREE.CylinderGeometry(rt,rb,h,n));const m=mesh(geoCache.get(key),color,parent);m.position.set(x,y,z);return m}
const zeroMat=new THREE.Matrix4().makeScale(0,0,0);
function batchCrowd(){
  for(const b of crowdBatches){scene.remove(b.inst);b.inst.dispose();b.inst.material.dispose()}
  crowdBatches.length=0;
  const groups=new Map();
  for(const p of people)p.g.traverse(m=>{
    m.userData.actor=p;
    if(!m.isMesh||!m.material.isMeshStandardMaterial)return;
    let group=groups.get(m.geometry.id);
    if(!group){group={geometry:m.geometry,items:[]};groups.set(m.geometry.id,group)}
    group.items.push(m);
    m.visible=false
  });
  for(const group of groups.values()){
    const inst=new THREE.InstancedMesh(group.geometry,new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.52,metalness:0.06}),group.items.length);
    inst.castShadow=true;
    inst.receiveShadow=true;
    inst.frustumCulled=false;
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(inst);
    crowdBatches.push({inst,items:group.items})
  }
  crowdColorsDirty=true;
  updateCrowd()
}
function updateCrowd(){
  for(let pi=0; pi<people.length; pi++){
    people[pi].g.updateMatrixWorld(true);
  }
  for(let bi=0; bi<crowdBatches.length; bi++){
    const b=crowdBatches[bi];
    const len=b.items.length;
    for(let i=0; i<len; i++){
      const m=b.items[i];
      const actor=m.userData.actor;
      if(actor.state==='hidden'){
        b.inst.setMatrixAt(i, zeroMat);
      } else {
        b.inst.setMatrixAt(i, m.matrixWorld);
      }
      if(crowdColorsDirty){
        b.inst.setColorAt(i, m.material.color);
      }
    }
    b.inst.instanceMatrix.needsUpdate=true;
    if(crowdColorsDirty&&b.inst.instanceColor)b.inst.instanceColor.needsUpdate=true;
  }
  crowdColorsDirty=false;
}
function label(text,bg,fg,w,h,parent,x,y,z,size=80){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.fillStyle=fg;ctx.font=`800 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';const lines=text.split('\n');lines.forEach((line,i)=>ctx.fillText(line,256,128+(i-(lines.length-1)/2)*(size+8)));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide}));m.position.set(x,y,z);parent.add(m);return m}
const shirtMaps={};
function shirtTexture(p){
  const key=p||'N';
  if(shirtMaps[key])return shirtMaps[key];
  const c=document.createElement('canvas');c.width=512;c.height=512;
  const ctx=c.getContext('2d');
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.generateMipmaps=true;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.anisotropy=4;
  function drawBadge(img=null){
    ctx.clearRect(0,0,512,512);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    if(!p||p==='N'){t.needsUpdate=true;return}
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(256,256,240,0,TAU);ctx.fill();
    ctx.lineWidth=24;ctx.strokeStyle=PARTIES[p]?.hex||'#2464df';ctx.stroke();
    if(img&&img.complete&&img.naturalWidth){
      const pad=72,fit=Math.min((512-pad*2)/img.naturalWidth,(512-pad*2)/img.naturalHeight);
      const w=img.naturalWidth*fit,h=img.naturalHeight*fit;
      ctx.drawImage(img,(512-w)/2,(512-h)/2,w,h);
    }else{
      ctx.fillStyle=p==='ANC'?'#152124':(PARTIES[p]?.hex||'#152124');
      ctx.font='bold 160px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(p,256,256);
    }
    t.needsUpdate=true;
  }
  drawBadge();
  if(p&&logoFiles[p]){
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>drawBadge(img);
    img.src=logoFiles[p];
  }
  return shirtMaps[key]=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});
}
const SKIN_TONES=[0x754326,0x9b6038,0xc58a55,0x553525,0xac7650,0x3f281c,0xd3a074],PANTS_COLORS=[0x26384a,0x2b2b30,0x6d5f4a,0x3d4d5c,0x4a4036,0x1f2a36,0x59606b],SHOE_COLORS=[0x1b1b1d,0xe8e8e8,0x3b2a1e,0x2c3a5a,0x6a2d24];
function makePerson(x,z,party){
  const g=new THREE.Group();scene.add(g);g.position.set(x,.13,z);
  const pick=a=>a[Math.floor(random()*a.length)];
  const put=(geo,col,px,py,pz,parent,sx=1,sy=1,sz=1)=>{const m=mesh(geo,col,parent);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);return m};
  const skin=pick(SKIN_TONES),shirt=party?PARTIES[party].color:pick([0xe8e3d8,0xd69173,0x82a6a3,0x9aa0b5,0xc9b27a,0x6d7f95,0xb9574a]);
  const isFemale=random()>.48,build=range(.94,1.07),pantsC=pick(PANTS_COLORS),shoeC=pick(SHOE_COLORS),hasSkirt=isFemale&&random()>.38;
  const hairColor=pick([0x1b1816,0x231f1c,0x3a251b,0x4f3320,0x6b6358,0xa57e3f]),sph=fineSphere(),cap=hairCapGeo();
  const tw=(isFemale?.215:.255)*build,th=isFemale?.6:.63,td=isFemale?.14:.17;
  const upper=new THREE.Group();upper.position.set(0,.93,0);g.add(upper);
  const body=put(torsoGeo(isFemale),shirt,0,0,0,upper,tw,th,td);
  if(!hasSkirt)put(sph,pantsC,0,-.01,0,upper,(isFemale?.19:.172)*build,.125,isFemale?.125:.12);
  put(limbGeo(.05,.1),skin,0,th+.03,.004,upper);
  const head=new THREE.Group();head.position.set(0,th+.2,0);upper.add(head);
  put(sph,skin,0,0,0,head,.105,.145,.12);put(sph,skin,0,-.07,.014,head,.088,.085,.098);
  for(const s of [-1,1]){
    put(sph,skin,s*.103,-.005,-.005,head,.018,.034,.026);
    put(sph,0xf4f1ea,s*.04,.022,.103,head,.025,.016,.014);put(sph,0x1b1410,s*.04,.022,.114,head,.0125,.0125,.008);
    put(sph,isFemale?0x1f1a17:hairColor,s*.042,.054,.108,head,.03,.0075,.012);
  }
  put(sph,shade(skin,.9),0,-.022,.118,head,.02,.034,.03);put(sph,isFemale?0x9a4a4a:0x7a4440,0,-.07,.105,head,.034,.0085,.013);
  let doek=null,doek2=null,skirt=null;
  const hair=(sx,sy,sz,py=.005,pz=-.012,rx=-.15)=>{const m=put(cap,hairColor,0,py,pz,head,sx,sy,sz);m.rotation.x=rx;return m};
  if(isFemale){
    const st=Math.floor(random()*5);
    if(st===0){hair(.113,.158,.132);put(sph,hairColor,0,.1,-.1,head,.06,.06,.06)}
    else if(st===1){hair(.113,.158,.132);put(limbGeo(.026,.3),hairColor,0,-.13,-.115,head,1,1,1)}
    else if(st===2){put(sph,hairColor,0,.055,-.012,head,.155,.15,.15)}
    else if(st===3){hair(.115,.16,.136);for(const s of [-1,1])put(limbGeo(.03,.24),hairColor,s*.1,-.1,.0,head);put(limbGeo(.05,.26),hairColor,0,-.1,-.11,head)}
    else{const dc=party?PARTIES[party].color:pick([0xd95a32,0x2b8a78,0xdfa02b,0x933b7b,0x3d6ba2]);doek=put(sph,dc,0,.045,-.006,head,.118,.108,.135);doek2=put(sph,dc,.04,.13,.04,head,.064,.052,.062)}
    if(hasSkirt)skirt=put(skirtGeo(),party?PARTIES[party].color:pick([0x2f4b59,0xb8513b,0x3d7055,0x913b68,0xd4a034,0x2c333a]),0,.55,0,g,.82*build,.62,.72);
  }else{
    const st=Math.floor(random()*5);
    if(st===0||st===3)hair(.108,.15,.127,.006,-.01,-.1);
    else if(st===1)put(sph,hairColor,0,.05,-.01,head,.15,.145,.145);
    else if(st===2)hair(.114,.158,.134);
    if(random()>.74)put(sph,hairColor,0,-.083,.058,head,.083,.068,.066);
  }
  const arms=[],elbows=[],sx0=tw*.94+.045;
  for(const s of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(s*sx0,th-.07,0);upper.add(pivot);
    const sleeve=put(limbGeo(.058,.2),shirt,0,-.14,0,pivot);
    const elbow=new THREE.Group();elbow.position.set(0,-.27,0);pivot.add(elbow);
    put(limbGeo(.045,.18),skin,0,-.13,0,elbow);put(sph,skin,0,-.285,.008,elbow,.04,.055,.03);
    pivot.rotation.z=s*.12;arms.push({pivot,sleeve});elbows.push(elbow);
  }
  const legs=[],shins=[],legC=hasSkirt?skin:pantsC;
  for(const s of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(s*(isFemale?.095:.1)*build,.9,0);g.add(pivot);
    put(limbGeo(.088,.3),legC,0,-.22,0,pivot);
    const knee=new THREE.Group();knee.position.set(0,-.44,0);pivot.add(knee);
    put(limbGeo(.068,.3),legC,0,-.2,0,knee);put(sph,shoeC,0,-.44,.045,knee,.072,.05,.135);
    legs.push(pivot);shins.push(knee);
  }
  const zf=isFemale?.108:.157;
  const front=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3),shirtTexture(party));front.position.set(0,th*.52,zf);front.visible=!!party;upper.add(front);
  const back=front.clone();back.position.z=-zf;back.rotation.y=Math.PI;back.visible=!!party;upper.add(back);
  let badge=null;
  if(party&&logoFiles[party]){
    badge=new THREE.Sprite(new THREE.SpriteMaterial({map:logoTexture(party),depthTest:true}));
    badge.position.set(0,2.28,0);badge.scale.set(.48,.48,1);g.add(badge);
  }
  const p={g,body,upper,head,arms,elbows,legs,shins,front,back,skirt,doek,doek2,isFemale,party,state:'walk',phase:range(0,TAU),vx:0,vz:0,target:new THREE.Vector2(range(-4.1,4.1),range(-23,19)),speed:range(.35,.72),cool:0,anim:0,owner:null,skin,voted:false,loyal:false,stubborn:false,attempts:0,bubbleUntil:0,lane:null,route:[],pause:0,converted:false,voice:0,dialogueTurn:0,badge};
  people.push(p);return p;
}
function recolor(p,party){
  crowdColorsDirty=true;p.party=party;p.voted=!!party;
  const color=party?PARTIES[party].color:0xb5bcab;
  p.body.material=material(color);if(p.skirt)p.skirt.material=material(color);if(p.doek)p.doek.material=material(color);if(p.doek2)p.doek2.material=material(color);
  p.arms.forEach(a=>a.sleeve.material=material(color));
  p.front.material=p.back.material=shirtTexture(party);
  p.front.visible=p.back.visible=!!party;
  if(party&&logoFiles[party]){
    if(!p.badge){
      p.badge=new THREE.Sprite(new THREE.SpriteMaterial({map:logoTexture(party),depthTest:true}));
      p.badge.position.set(0,2.28,0);p.badge.scale.set(.48,.48,1);p.g.add(p.badge);
    }else{
      p.badge.material.map=logoTexture(party);p.badge.visible=true;
    }
  }else if(p.badge){
    p.badge.visible=false;
  }
}
let treeCount=0;
function tree(x,z,s=1){const g=makeTree('leafy',treeCount++);g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.y=treeCount*2.39996;scene.add(g);return g}
function plant(x,z){const g=makeShrub(treeCount++);g.position.set(x,0,z);g.scale.setScalar(1.15);g.rotation.y=treeCount*1.7;scene.add(g);return g}
function streetLamp(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(.09,.13,4.2,0x5e6b68,0,2.1,0,g,8);cylinder(.21,.3,.16,0x687471,0,.15,0,g,8);cylinder(.29,.17,.45,0xe5e5c8,0,4.3,0,g,6);cylinder(0,.37,.22,0x576465,0,4.62,0,g,8)}
function house(x,z,w,d,color,roofColor){
 const g=buildHouse({w,d,wall:color,roof:roofColor,seed:Math.floor(Math.abs(x*7+z*13))});g.position.set(x,0,z);scene.add(g);
 label(String(12+Math.floor(Math.abs(x+z))),'#d5cbb2','#4c534b',.32,.22,g,.67,2.35,d/2+.1,70);
 for(const a of [-1,1]){cylinder(.19,.13,.35,0xa45f3f,a*w*.39,.4,d/2+.6,g,12);const sh=makeShrub(Math.floor(Math.abs(x+z))+(a>0?1:0));sh.position.set(a*w*.39,.55,d/2+.6);sh.scale.setScalar(.8);g.add(sh)}
 return g;
}

function wall(x,z,length){const g=buildWallSegment(length);g.position.set(x,0,z);scene.add(g);return g}
function roundedBox(w,h,d,r,color,x,y,z,parent){const key=`round${w},${h},${d},${r}`;if(!geoCache.has(key)){const shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r*.3,bevelThickness:r,curveSegments:3});geo.translate(0,0,-d/2+r);geoCache.set(key,geo)}const m=mesh(geoCache.get(key),color,parent);m.position.set(x,y,z);return m}
function taxi(x, z, angle=0){
  const g = new THREE.Group();
  scene.add(g);
  g.position.set(x, 0, z);
  g.rotation.y = angle;

  // Ground contact ambient shadow
  const shadowGeo = new THREE.PlaneGeometry(2.3, 5.0);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x081014, transparent: true, opacity: 0.55, depthWrite: false });
  const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
  groundShadow.position.set(0, 0.02, 0);
  g.add(groundShadow);

  // Chassis base
  box(1.82, 0.22, 4.6, 0x1f2425, 0, 0.44, 0, g);

  // 1. Lower Van Body (White)
  roundedBox(1.98, 0.96, 4.72, 0.12, 0xf6f7f3, 0, 1.02, 0, g);

  // 2. Upper Passenger Cabin (White)
  roundedBox(1.92, 0.88, 4.25, 0.10, 0xf8f9f6, 0, 1.80, -0.16, g);

  // 3. High Roof Top (Curved Quantum high-roof)
  roundedBox(1.84, 0.26, 4.36, 0.12, 0xebebe8, 0, 2.26, -0.16, g);

  // Aerodynamic roof ribs
  for (const rx of [-0.55, 0, 0.55]) {
    box(0.04, 0.035, 4.0, 0xdededb, rx, 2.40, -0.16, g);
  }

  // 4. Sloped Front Nose (Quantum hood)
  roundedBox(1.94, 0.52, 0.65, 0.10, 0xf6f7f3, 0, 1.05, 2.38, g);

  // 5. Front Windshield (Tinted glass sloped backward)
  const glass = material(0x192832, 0.15);
  const windshield = roundedBox(1.72, 0.78, 0.08, 0.08, glass, 0, 1.82, 2.15, g);
  windshield.rotation.x = -0.22;

  // Front A-pillars (White frames alongside windshield)
  for (const side of [-1, 1]) {
    const pillar = box(0.08, 0.82, 0.08, 0xf4f5f1, side * 0.90, 1.82, 2.15, g);
    pillar.rotation.x = -0.22;
  }

  // Windshield wipers
  for (const wx of [-0.38, 0.36]) {
    const wiper = box(0.02, 0.34, 0.02, 0x1a1e20, wx, 1.62, 2.30, g);
    wiper.rotation.z = 0.52;
    wiper.rotation.x = -0.22;
  }

  // 6. Heavy-duty Black Front Bumper & Lower Valence
  roundedBox(2.00, 0.44, 0.46, 0.08, 0x1b1e20, 0, 0.58, 2.50, g);

  // Radiator Grille (Horizontal black bars)
  for (let i = 0; i < 2; i++) {
    box(1.08, 0.05, 0.08, 0x0f1112, 0, 0.92 + i * 0.11, 2.68, g);
  }

  // Yellow South African Registration Plate (Front)
  box(0.56, 0.18, 0.02, 0xf7c200, 0, 0.52, 2.74, g);
  label('CA 492-812', '#f7c200', '#111111', 0.52, 0.15, g, 0, 0.52, 2.75, 55);

  // 7. Headlight Assemblies (Halogen + Amber Indicators)
  for (const side of [-1, 1]) {
    // Crystal white headlight
    roundedBox(0.38, 0.22, 0.06, 0.04, 0xfffae8, side * 0.70, 0.98, 2.69, g);
    // Amber corner turn indicator
    roundedBox(0.18, 0.22, 0.06, 0.04, 0xff8c00, side * 0.90, 0.98, 2.68, g);

    // Fog light recesses in black bumper
    box(0.16, 0.12, 0.06, 0x0c0e0f, side * 0.75, 0.52, 2.72, g);
  }

  // 8. Large Black Side Mirrors
  for (const side of [-1, 1]) {
    box(0.16, 0.05, 0.06, 0x222627, side * 1.05, 1.62, 1.85, g);
    roundedBox(0.12, 0.28, 0.18, 0.04, 0x1a1e1f, side * 1.15, 1.68, 1.85, g);
    // Mirror glass reflective face
    box(0.01, 0.24, 0.14, 0xaaccd8, side * 1.08, 1.68, 1.85, g);
  }

  // 9. Side Windows & Doors
  for (const side of [-1, 1]) {
    // Front cab door window
    roundedBox(0.06, 0.65, 0.85, 0.06, glass, side * 0.99, 1.80, 1.45, g);
    // 3 Large Passenger Tinted Windows
    for (let i = 0; i < 3; i++) {
      roundedBox(0.06, 0.65, 0.96, 0.06, glass, side * 0.99, 1.80, 0.44 - i * 1.04, g);
      // Window frame rubber divider
      box(0.068, 0.05, 0.98, 0x4a5556, side * 0.995, 1.45, 0.44 - i * 1.04, g);
    }

    // Door handles
    box(0.04, 0.06, 0.22, 0x202425, side * 1.025, 1.35, 1.25, g);
    box(0.04, 0.06, 0.22, 0x202425, side * 1.025, 1.35, 0.25, g);

    // 10. AUTHENTIC SOUTH AFRICAN NATIONAL TAXI LIVERY STRIPES (Yellow, Green, Red, Blue)
    const stripeColors = [0xf7be00, 0x00883e, 0xdb1d1d, 0x0058b8];
    for (let c = 0; c < 4; c++) {
      box(0.026, 0.045, 3.9, stripeColors[c], side * 1.008, 1.26 - c * 0.052, -0.15, g);
    }
    // Rear side reflective yellow chevron marker
    box(0.026, 0.048, 1.7, 0xf7be00, side * 1.008, 1.38, -1.25, g);

    // 11. Realistic 3D Wheels & Wheel Arches
    for (const zz of [-1.45, 1.45]) {
      // Black rubber tire
      const tire = cylinder(0.41, 0.41, 0.25, 0x141718, side * 0.98, 0.41, zz, g, 20);
      tire.rotation.z = Math.PI / 2;
      // Steel rim
      const rim = cylinder(0.25, 0.25, 0.265, 0x252a2c, side * 1.00, 0.41, zz, g, 14);
      rim.rotation.z = Math.PI / 2;
      // Chrome center hubcap
      const hub = cylinder(0.10, 0.10, 0.28, 0xc2cbcd, side * 1.015, 0.41, zz, g, 10);
      hub.rotation.z = Math.PI / 2;
      // Wheel arch body flare
      const arch = mesh(new THREE.TorusGeometry(0.48, 0.055, 6, 20, Math.PI), 0xdbe0dc, g);
      arch.position.set(side * 1.01, 0.42, zz);
      arch.rotation.y = Math.PI / 2;
    }
  }

  // 12. Rear Facia & Details
  // Rear window
  roundedBox(1.62, 0.70, 0.06, 0.06, glass, 0, 1.80, -2.32, g);
  // Rear black bumper step
  roundedBox(1.98, 0.26, 0.32, 0.06, 0x1b1e20, 0, 0.56, -2.42, g);

  // Vertical rear tail light clusters (Left & Right)
  for (const side of [-1, 1]) {
    // Red brake light (top)
    box(0.15, 0.36, 0.06, 0xd41111, side * 0.88, 1.40, -2.39, g);
    // Amber turn signal (mid)
    box(0.15, 0.18, 0.06, 0xff8c00, side * 0.88, 1.06, -2.39, g);
    // White reverse light (bottom)
    box(0.15, 0.12, 0.06, 0xffffff, side * 0.88, 0.88, -2.39, g);
  }

  // Rear yellow registration plate
  box(0.55, 0.18, 0.02, 0xf7c200, 0, 0.86, -2.40, g);
  label('CA 492-812', '#f7c200', '#111111', 0.52, 0.15, g, 0, 0.86, -2.41, 55).rotation.y = Math.PI;

  // Rear EMERGENCY EXIT text
  label('EMERGENCY EXIT', '#e8e8e8', '#111111', 0.85, 0.14, g, 0, 1.50, -2.36, 44).rotation.y = Math.PI;

  return g;
}

function shop(){const g=new THREE.Group();scene.add(g);g.position.set(8.2,0,-3);box(5,3.1,4.3,0xe9d9b6,0,1.65,0,g);box(5.4,.2,4.65,0x888d86,0,3.3,0,g);for(let i=0;i<18;i++)box(.026,.04,4.7,0xa9aaa0,-2.5+i*.29,3.42,0,g);box(5.1,.65,.18,0xa94130,0,2.92,2.24,g);label('SPAZA SHOP','#a94130','#fff5d6',4.6,.6,g,0,2.92,2.345,63);box(4.5,2.05,.15,0x334844,0,1.25,2.2,g);for(let i=0;i<8;i++)for(let j=0;j<4;j++)box(.23,.24,.12,[0xcb5a3a,0xe8c24b,0x7aaabb,0xbcb08d][(i+j)%4],-1.8+i*.52,.5+j*.4,2.3,g);for(let i=-2;i<=2;i++)box(.09,2.1,.14,0x564736,i,.99,2.43,g);const awning=box(5.1,.13,1.05,0xd5a64e,0,2.42,2.76,g);awning.rotation.x=.15;box(5.1,.28,.09,0xe5b95a,0,2.27,3.23,g);for(const x of [-2.4,2.4])box(.06,2.27,.06,0x706147,x,1.13,3.18,g);label('GOOD\nPEOPLE\nLIVE HERE','#e9d9b6','#354741',1.8,2, g,2.515,1.72,.1,60).rotation.y=Math.PI/2;return g}
function cutMaterial(color,map=null,roughness=0.8,metalness=0.08,bump=null){const m=new THREE.MeshStandardMaterial({color,map,roughness,metalness,bumpMap:bump,bumpScale:bump?2.2:0});m.userData.holeCutout=true;m.onBeforeCompile=shader=>{shader.uniforms.streetHoles=holeUniform;shader.vertexShader='varying vec2 streetXZ;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstreetXZ=(modelMatrix*vec4(transformed,1.0)).xz;');shader.fragmentShader='uniform vec3 streetHoles[4];\nvarying vec2 streetXZ;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfor(int h=0;h<4;h++){if(distance(streetXZ,streetHoles[h].xy)<streetHoles[h].z)discard;}');};m.customProgramCacheKey=()=> 'street-hole-growth-v4';return m;}
function mountain(){
 new THREE.TextureLoader().load('./table-mountain.jpg',t=>{if(ward===54){t.dispose();return}t.colorSpace=THREE.SRGBColorSpace;scene.background=t;frameMountain()},undefined,()=>{});
}
function frameMountain(){if(!scene.background?.isTexture)return;const t=scene.background;t.repeat.set(Math.min(1,(innerWidth/innerHeight)/(1971/798)*.60),.60);t.offset.set((1-t.repeat.x)/2,0)}
function batchScenery(){scene.updateMatrixWorld(true);const groups=new Map();scene.traverse(m=>{if(!m.isMesh||!m.visible||!m.material.isMeshStandardMaterial||m.material.userData.holeCutout)return;const key=m.geometry.id+':'+m.material.id;let group=groups.get(key);if(!group){group={geo:m.geometry,mat:m.material,items:[]};groups.set(key,group)}group.items.push(m)});for(const group of groups.values()){if(group.items.length<3)continue;const inst=new THREE.InstancedMesh(group.geo,group.mat,group.items.length);group.items.forEach((m,i)=>{inst.setMatrixAt(i,m.matrixWorld);m.removeFromParent()});inst.castShadow=group.items[0].castShadow;inst.receiveShadow=true;inst.computeBoundingSphere();scene.add(inst)}}
function streetSign(x,z,text,angle=0){cylinder(.045,.055,3.5,0x5c6a67,x,1.75,z);const sign=label(text,'#245b51','#fff9dc',2.2,.38,scene,x,3.35,z+.08,43);sign.rotation.y=angle;}
function bench(x,z,angle=0){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);g.rotation.y=angle;for(const a of [-.36,0,.36])box(1.8,.1,.27,0x976e42,0,.68,a,g);for(const h of [.98,1.26])box(1.8,.19,.08,0x9b7546,0,h,-.4,g);for(const xx of [-.67,.67]){box(.08,.74,.7,0x394c43,xx,.36,0,g);box(.07,.95,.07,0x394c43,xx,.86,-.42,g)}}
function communityField(){
 const grass=cutMaterial(0x7ca259),sand=cutMaterial(0xc8b58c),white=cutMaterial(0xe5e4cf);
 box(16,.07,15,grass,12,.011,-51.5);box(24,.08,5.8,sand,12,-.006,-51);
 box(13,.085,14,grass,12,.003,-51.5);
 for(const x of [5.6,18.4])box(.06,.01,12.8,white,x,.057,-51.5);for(const z of [-57.9,-45.1])box(12.8,.01,.06,white,12,.057,z);
 const center=mesh(new THREE.RingGeometry(1.62,1.68,48),white);center.rotation.x=-Math.PI/2;center.position.set(12,.06,-51.5);center.castShadow=false;
 for(const z of [-58,-45]){for(const x of [10.5,13.5])cylinder(.045,.045,1.7,0xe5e3d4,x,.9,z);box(3.1,.07,.07,0xe5e3d4,12,1.75,z)}
 // Outdoor exercise bars along the edge leave the middle of the field open.
 for(const x of [18.8,21])cylinder(.055,.055,2.7,0x326d67,x,1.4,-56.7);box(2.3,.07,.07,0xe2b75f,19.9,2.77,-56.7);
 for(const z of [-57,-54.5]){box(1.6,.12,.55,0x966e42,6.1,.56,z);for(const x of [5.5,6.7])box(.08,.52,.4,0x445e52,x,.27,z)}
 for(const [x,name,color] of [[7,'FRESH FRUIT',0xd59143],[17,'VETKOEK',0xa94e3c]]){const g=new THREE.Group();g.position.set(x,0,-44.3);scene.add(g);box(2.5,.12,1.3,0x987b4d,0,.85,0,g);for(const xx of [-1.1,1.1])for(const zz of [-.5,.5])box(.07,.84,.07,0x6e654c,xx,.42,zz,g);for(const xx of [-1.2,1.2])box(.055,2.3,.055,0x6c7059,xx,1.15,-.55,g);const canopy=box(2.8,.09,1.8,color,0,2.35,0,g);canopy.rotation.x=-.08;label(name,'#eee0bd','#3d4934',2.3,.43,g,0,2.18,.92,42);for(let i=0;i<12;i++)sphere(.115,x<10?[0x96b63a,0xe1af35,0xc66c3a][i%3]:0xb77932,-.92+(i%4)*.6,1.04,-.33+Math.floor(i/4)*.3,g)}
 bench(21,-47,Math.PI/2);tree(21,-59,1.1);tree(4,-59,1.05);streetSign(-5.8,-51,'COMMUNITY FIELD');streetSign(5.8,-69.3,'CEDAR STREET');streetSign(-5.8,45.4,'SCHOOL LANE');
}

function partyPosters(){keys.forEach((p,i)=>{const x=i%2?-5.6:5.6,z=-72+i*12;cylinder(.035,.045,3.2,0x657773,x,1.6,z);box(1.3,1.65,.09,0xfff9e8,x,2.2,z);const sign=mesh(new THREE.PlaneGeometry(1.13,1.13),new THREE.MeshBasicMaterial({map:logoTexture(p),transparent:true,side:THREE.DoubleSide}));sign.position.set(x,2.4,z+.052);label(p,'#fff9e8','#163c32',1.2,.32,scene,x,1.65,z+.06,54)})}
function palm(x,z,s=1,lean=.12,leanRot=0){const g=makePalm(lean,leanRot,Math.floor(Math.abs(x*3+z)));g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.y=leanRot;scene.add(g);return g}
function coastalTree(x,z,s=1){const g=makeTree('coastal',Math.floor(Math.abs(z))%5);g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.y=Math.abs(z)*1.7;scene.add(g);return g}
function apartment(x,z,floors=3,tone=0xeee6d7){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const w=6.4,d=7,h=floors*2.45;{const body=mesh(scaledBox(w,h,d,3,true),surfaceMat('plaster',tone),g);body.position.set(0,h/2,0)}box(w+.5,.22,d+.5,0xf7f2e7,0,h+.1,0,g);box(2,.8,1.6,0xb6baba,1.7,h+.5,-1.5,g);for(let f=0;f<floors;f++){const y=1.25+f*2.45;for(const xx of [-1.6,1.6]){box(2.4,1.65,.07,glassMat(),xx,y,d/2+.03,g);box(.06,1.68,.1,0xe1e7dd,xx,y,d/2+.08,g);box(2.75,.17,1.05,0xf8f3e7,xx,y-.87,d/2+.4,g);box(2.75,.75,.06,0x9fc3c7,xx,y-.37,d/2+.91,g);box(2.82,.05,.07,0xe9e9dc,xx,y+.03,d/2+.94,g)}for(const side of [-1,1])for(const zz of [-2,1]){box(.07,1.25,1.9,glassMat(),side*(w/2+.04),y,zz,g);box(.09,.05,1.9,0xe2e7df,side*(w/2+.09),y,zz,g)}}box(1.1,2,.08,0x566f69,0,1,d/2+.07,g);for(const xx of [-2.6,2.6]){box(.6,.5,.6,0xc7b99e,xx,.3,4.25,g);sphere(.43,0x648557,xx,.9,4.25,g)}g.rotation.y=Math.PI/2;return g}
function coastEnvironment(){
 scene.background=new THREE.Color(0x8bd5ef);scene.fog=new THREE.Fog(0xa8dce7,105,280);
 const sandTex=(rx,ry)=>{const t=surfaceMat('sand',0xf0dcae).map.clone();t.repeat.set(rx,ry);t.needsUpdate=true;return t};
  box(180,.2,320,cutMaterial(0xbcc0a2),50,-.24,-65);scene.add(createBeach({xFrom:-330,xTo:-40,zFrom:-310,zTo:150,waterY:-.1,shoreX:-57,slope:.025}));const sea=createWater({width:300,depth:470,x:-190,y:-.1,z:-80,mode:'sea',shoreX:-57,segX:60,segZ:110});scene.add(sea);box(28,.12,185,cutMaterial(0xffffff,sandTex(5,30)),-37,-.045,-15);box(8,.11,185,cutMaterial(0xffffff,sandTex(2,30)),-49,-.05,-15);
 // Shoreline foam is now rendered inside the water shader.
 const road=cutMaterial(0x68777e),line=cutMaterial(0xeee9d1),walk=cutMaterial(0xd7ccba);
 for(const x of VERTICAL){box(8.4,.1,136,road,x,-.005,-15);for(const side of [-1,1])box(2.1,.12,136,walk,x+side*5.25,.05,-15);for(let z=-80;z<53;z+=4)if(!HORIZONTAL.some(v=>Math.abs(z-v)<5))box(.13,.012,1.6,line,x,.055,z)}
 for(const z of HORIZONTAL){box(62,.11,8.4,road,0,.006,z);box(17,.08,6,cutMaterial(0xd9cda9),-38,.005,z);for(let x=-29;x<30;x+=4)if(!VERTICAL.some(v=>Math.abs(x-v)<5))box(1.6,.012,.13,line,x,.07,z)}
 for(const z of [-76,-51,-25,0,25,50]){apartment(-14.8,z,2+(Math.abs(z)%2),0xf4eee2);apartment(32.8,z,3,0xe3e6dd);if(z!==-51)apartment(10.8,z,2,0xe0cebb)}
 box(.25,.75,134,0xeae6d8,-28.6,.35,-15);for(let z=-80;z<52;z+=4){box(.32,.85,.32,0xdcd8ca,-28.6,.42,z)}
 for(const rz of [-25,14]){box(4.5,.12,3.2,0xc29b68,-30.5,.12,rz);box(.12,.8,3.2,0xa88252,-32.5,.45,rz)}
 for(let z=-77;z<52;z+=12){palm(-30,z,range(.95,1.15),.14,(z%5)*1.2);palm(-45,z+5,range(1.0,1.2),.18,(z%4)*1.5);bench(-27.2,z+4,Math.PI/2);streetLamp(-18.3,z+2)}
 for(let z=-65;z<45;z+=22){coastalTree(-13.5,z,1.15)}
 const lg=new THREE.Group();scene.add(lg);lg.position.set(-43,0,5);for(const x of [-.8,.8])for(const z of [-.8,.8])cylinder(.06,.07,2.8,0xc5a882,x,1.4,z,lg);box(2.4,.15,2.4,0xd84436,0,2.85,0,lg);box(2.2,1.4,2.2,0xf4efe3,0,3.6,0,lg);const lgr=box(2.6,.18,2.6,0xd84436,0,4.35,0,lg);lgr.rotation.x=.08;label('RESCUE 54','#d84436','#ffffff',1.8,.4,lg,0,3.5,1.15,50);
 const vbZ=-32;cylinder(.05,.05,2.4,0xdcd2b6,-39,1.2,vbZ-3.5);cylinder(.05,.05,2.4,0xdcd2b6,-39,1.2,vbZ+3.5);box(.03,.7,7,0xf7f4e8,-39,1.7,vbZ);
 for(let z=-70;z<45;z+=16){const x=-37+(Math.abs(z)%3)*2;cylinder(.04,.05,2.2,0xe9dfc0,x,1.1,z);const shade=mesh(new THREE.ConeGeometry(1.85,.7,10),z%2?0xe6a459:0x4faec4);shade.position.set(x,2.35,z);box(1.2,.04,2.1,0xe8a178,x+2,.035,z+1);box(1.2,.04,2.1,0x5ebac6,x-2,.035,z-1);sphere(.24,0xdf382b,x+1.6,.26,z-1.4)}
 for(let i=0;i<14;i++){const rock=mesh(new THREE.DodecahedronGeometry(1.6+(i%4)*.5,1),0x8e8c82);rock.position.set(-47+((i%3)-1)*2.2,.55,-80+i*10.5);rock.scale.set(1.4,.75,1.2)}
 for(let i=0;i<9;i++){const peak=mesh(new THREE.IcosahedronGeometry(18,1),i%2?0x829991:0x8f9e91);peak.position.set(72+i*9,7,-110+i*5);peak.scale.set(1.05,1.3+(i%3)*.22,1.3)}
 taxi(-18.4,5,.02);streetSign(-29,7,'BEACH PROMENADE');streetSign(-18,-18,'CAMPS BAY');streetSign(5,-43,'OCEAN VIEW');communityField();partyPosters();batchScenery();
}
function refreshLocation(){
  const coast=ward===54;
  const wInfo=WARDS[ward]||{name:'Ward '+ward,short:'Ward '+ward};
  $('#location strong').textContent=wInfo.short||wInfo.name;$('#location span').textContent=ward===18?'HARARE & KUYASA':ward===87?'SITE C · MARKET STREETS':'CAPE TOWN · WARD '+ward;
  $('#map').setAttribute('aria-label',coast?'Beach to the west, three coastal roads and a community field.':'Three main roads, five side streets and a community field.')
}
function nextWard(){
  const idx=WARD_ORDER.indexOf(ward);
  return WARD_ORDER[(idx+1)%WARD_ORDER.length];
}
function advanceWard(){
  if(!canAdvance)return;
  ward=nextWard();
  document.querySelectorAll('[data-ward]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.ward)===ward)));
  if($('#start-target-label'))$('#start-target-label').innerHTML='<b>1:00</b> ROUND';
  const wInfo=WARDS[ward];
  if($('#start-diff-tag'))$('#start-diff-tag').innerHTML='<b>'+(wInfo?wInfo.diff:'EASY')+'</b>';
  start();
}

function environment(){
 scene.background=new THREE.Color(0x7cbee9);scene.fog=new THREE.Fog(0x9ac5e2,120,360);scene.add(new THREE.HemisphereLight(0xd9efff,0x817156,1.4));shadowLight=new THREE.DirectionalLight(0xfffaea,3.4);shadowLight.position.set(-24,34,18);shadowLight.castShadow=!MOBILE;shadowLight.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048);Object.assign(shadowLight.shadow.camera,{left:-32,right:32,top:34,bottom:-34,near:.5,far:115});shadowLight.shadow.normalBias=.025;shadowLight.shadow.bias=-.0001;scene.add(shadowLight);scene.add(shadowLight.target);const bounceLight=new THREE.DirectionalLight(0xd9b380,.7);bounceLight.position.set(0,-1,0);scene.add(bounceLight);
 if(ward===54){coastEnvironment();return}
 if(ward===18||ward===87){buildKhayelitsha({THREE,scene,box,sphere,cylinder,mesh,label,tree,plant,taxi,streetLamp,communityField,partyPosters,batchScenery,cutMaterial,VERTICAL,HORIZONTAL,ward});mountain();return}
 const gm=groundMaps(0xaaa486,[60,60],5,.1),gmat=cutMaterial(0xffffff,gm.map,.95,.02,gm.bump);const vastGround=box(700,.4,700,gmat,0,-.32,-15);vastGround.receiveShadow=true;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#646d70';ctx.fillRect(0,0,256,256);for(let i=0;i<20000;i++){const v=Math.floor(range(65,190));ctx.fillStyle=`rgba(${v},${v},${v},.19)`;ctx.fillRect(random()*256,random()*256,range(.5,1.5),range(.5,1.5))}const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,18);tex.colorSpace=THREE.SRGBColorSpace;const asphalt=cutMaterial(0xffffff,tex,.8,.08,tex),marking=cutMaterial(0xe6dfc9),curb=material(0xd9d0bc),paving=material(0xc2b6a0);
 for(const x of VERTICAL){box(8.4,.1,136,asphalt,x,-.005,-15);for(let z=-82;z<53;z+=1.1){if(HORIZONTAL.some(v=>Math.abs(z-v)<5.3)||((x===0||x===24)&&z>-55&&z<-47))continue;for(const side of [-1,1]){box(2.1,.24,1.07,paving,x+side*5.25,.13,z);box(.19,.32,1.07,curb,x+side*4.27,.16,z);box(.08,.012,.75,marking,x+side*4.12,.055,z)}}for(let z=-81;z<52;z+=4){if(HORIZONTAL.some(v=>Math.abs(z-v)<5.7))continue;box(.12,.012,1.6,marking,x,.055,z)}}
 for(const z of HORIZONTAL){box(62,.1,8.4,asphalt,0,.001,z);for(let x=-30;x<31;x+=1.1){if(VERTICAL.some(v=>Math.abs(x-v)<5.3))continue;for(const side of [-1,1]){box(1.07,.24,2.1,paving,x,.13,z+side*5.25);box(1.07,.32,.19,curb,x,.16,z+side*4.27)}}for(let x=-29;x<30;x+=4){if(VERTICAL.some(v=>Math.abs(x-v)<5.2))continue;box(1.6,.012,.12,marking,x,.065,z)}for(const x of VERTICAL)for(const dz of [-5.1,5.1])for(let i=-3;i<=3;i++)box(.5,.018,1.1,marking,x+i,.065,z+dz)}
 const colors=[0x3e8bc3,0xe4b65d,0x89a477,0xd68670,0xc4bd86,0x73a9b2],roofs=[0x8e999e,0xa75a43,0x76888c];let n=0;
 for(const roadX of VERTICAL)for(const side of [-1,1])for(const z of [-77,-51,-25,-4,5.5,24,51]){const x=roadX+side*8.85;if((roadX===0&&side===1&&z===-4)||(z===-51&&((roadX===0&&side===1)||(roadX===24&&side===-1))))continue;const home=house(x,z,5.1,5.3,colors[n%6],roofs[n%3]);home.rotation.y=-side*Math.PI/2;wall(roadX+side*6.7,z,5.5);if(n%2===0)tree(roadX+side*12.1,z-1,range(.95,1.25));plant(roadX+side*6.3,z+2.5);n++}
 shop();taxi(5.8,3.6,-.06);taxi(-28.2,-3,.04);taxi(-28.2,3,.04);
 for(const x of VERTICAL)for(const z of [-75,-49,-22,-5,7,24,51])streetLamp(x-5.8,z);
 for(const [x,z,name] of [[-5.6,-6.7,'SPAZA ST'],[5.7,-17.2,'MARKET ST'],[-18.3,19.5,'PROTEA LANE'],[-29.5,-6.6,'TAXI RANK'],[29.5,8.6,'MOUNTAIN VIEW']])streetSign(x,z,name);
 bench(-29.7,8.5,Math.PI/2);bench(29.5,4,-Math.PI/2);bench(-6,3,Math.PI/2);
 for(const [x,z] of [[-6,9],[6,21],[-29,-19],[29,-3]]){box(.06,3.2,.06,0x7d8780,x,1.65,z);label('YOUR\nVOTE\nMATTERS','#eee6cf','#30463c',1,1.45,scene,x,2.43,z+.05,56);box(1,.1,.05,0x39885c,x,1.72,z+.08);box(1,.06,.05,0xd3ad40,x,1.84,z+.08)}
 for(const [x,z] of [[-6,-2],[6,7],[-29,6],[29,21]]){box(.58,.96,.6,0x37634f,x,.6,z);box(.67,.11,.68,0x547b50,x,1.12,z)}
 // A taxi shelter, barber's board and laundry make the side streets distinct.
 const shelter=new THREE.Group();shelter.position.set(-30.3,0,6);scene.add(shelter);for(const x of [-.6,.6])for(const z of [-1,1])box(.07,2.4,.07,0x426258,x,1.2,z,shelter);box(1.65,.14,2.6,0x3c7869,0,2.46,0,shelter);label('TAXI RANK','#2f6a59','#fff5d2',1.45,.4,shelter,0,2.2,1.1,42);
 label('FRESH CUTS\nBARBER','#d0d6c1','#234443',2,.95,scene,25.1,2.5,21.3,49);
 for(const x of [-12,12]){box(.04,2,.04,0x857858,x,1,1);box(.04,2,.04,0x857858,x,1,6);box(.015,.015,5,0x6e7167,x,2,3.5);for(let i=0;i<4;i++)box(.025,.73,.64,[0xe6c582,0xf0e8d5,0x6fa0ae,0xbc7767][i],x,1.65,1.6+i*1.1)}
 communityField();mountain();partyPosters();batchScenery();
}

let glowTexture;function makeHole(party,x,z,isPlayer=false){const g=new THREE.Group();scene.add(g);g.position.set(x,.062,z);const color=PARTIES[party].color;const dark=mesh(new THREE.CircleGeometry(1.12,64),new THREE.MeshBasicMaterial({color:0x041311}),g);dark.rotation.x=-Math.PI/2;dark.position.y=-2.2;dark.castShadow=false;dark.receiveShadow=false;
 const inner=mesh(new THREE.RingGeometry(.78,1.1,64),new THREE.MeshBasicMaterial({color:0x08241c}),g);inner.rotation.x=-Math.PI/2;inner.position.y=-.05;inner.castShadow=false;
 const throat=mesh(new THREE.CylinderGeometry(1.1,.78,2.15,48,1,true),new THREE.MeshBasicMaterial({color:0x061612,side:THREE.BackSide}),g);throat.position.y=-1.08;throat.castShadow=false;
 const ring=mesh(new THREE.TorusGeometry(1.13,.065,8,64),new THREE.MeshBasicMaterial({color}),g);ring.rotation.x=Math.PI/2;ring.position.y=.018;ring.castShadow=false;
 if(!glowTexture){const c=document.createElement('canvas');c.width=c.height=128;const ct=c.getContext('2d');const gr=ct.createRadialGradient(64,64,25,64,64,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.45,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');ct.fillStyle=gr;ct.fillRect(0,0,128,128);glowTexture=new THREE.CanvasTexture(c)}
 const glow=mesh(new THREE.PlaneGeometry(3.8,3.8),new THREE.MeshBasicMaterial({map:glowTexture,color,transparent:true,depthWrite:false,opacity:.7,blending:THREE.AdditiveBlending}),g);glow.rotation.x=-Math.PI/2;glow.position.y=.015;glow.castShadow=false;
 const c=document.createElement('canvas');c.width=256;c.height=100;const ct=c.getContext('2d');ct.fillStyle='#133732ee';ct.beginPath();ct.roundRect(3,3,250,84,18);ct.fill();ct.strokeStyle=PARTIES[party].hex;ct.lineWidth=3;ct.stroke();ct.fillStyle=PARTIES[party].hex;ct.textAlign='center';ct.font='bold 42px Arial';ct.fillText(isPlayer?'YOU · '+party:party,128,59,234);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sign.position.set(0,2,0);sign.scale.set(isPlayer?2.35:1.55,isPlayer?.92:.61,1);g.add(sign);const logo=mesh(new THREE.CircleGeometry(.93,64),new THREE.MeshBasicMaterial({map:logoTexture(party),transparent:true,side:THREE.DoubleSide,toneMapped:false}),g);logo.rotation.x=-Math.PI/2;logo.position.y=.04;logo.castShadow=false;logo.receiveShadow=false;
 const h={g,party,isPlayer,ring,glow,sign,logo,dark,throat,radius:1.075,capacity:1,capturing:0,mode:'active',shieldUntil:0,defeatTime:0,target:null,wait:0,busy:false,route:[],repath:0,mapAngle:0};holes.push(h);return h}
function burst(x,z,color){for(let i=0;i<(MOBILE?5:12);i++){const m=mesh(new THREE.SphereGeometry(.045,4,4),new THREE.MeshBasicMaterial({color}));m.castShadow=false;m.position.set(x,.3,z);particles.push({m,v:new THREE.Vector3(range(-1.5,1.5),range(1.4,3),range(-1.5,1.5)),life:.8})}}
let lastHoverSound=0;
function beep(freq=500){
  if(!sound)return;
  try{
    audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
    const now=audioCtx.currentTime,o=audioCtx.createOscillator(),gain=audioCtx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(freq,now);
    o.frequency.exponentialRampToValueAtTime(freq*1.5,now+.12);
    gain.gain.setValueAtTime(.2,now);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.2);
    o.connect(gain);gain.connect(audioCtx.destination);
    o.start(now);o.stop(now+.21);
    o.onended=()=>{try{o.disconnect();gain.disconnect()}catch(_){}}
  }catch(_){}
}
function uiHoverSound(){
  if(!sound)return;
  try{
    const now=performance.now();
    if(now-lastHoverSound<85)return;
    lastHoverSound=now;
    audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
    const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(880,t);
    o.frequency.exponentialRampToValueAtTime(1150,t+.03);
    g.gain.setValueAtTime(.035,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.035);
    o.connect(g);g.connect(audioCtx.destination);
    o.start(t);o.stop(t+.04);
    o.onended=()=>{try{o.disconnect();g.disconnect()}catch(_){}}
  }catch(_){}
}
function uiSelectSound(){
  if(!sound)return;
  try{
    audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
    const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type='triangle';
    o.frequency.setValueAtTime(520,now);
    o.frequency.exponentialRampToValueAtTime(840,now+.08);
    g.gain.setValueAtTime(.12,now);
    g.gain.exponentialRampToValueAtTime(.0001,now+.1);
    o.connect(g);g.connect(audioCtx.destination);
    o.start(now);o.stop(now+.11);
    o.onended=()=>{try{o.disconnect();g.disconnect()}catch(_){}}
  }catch(_){}
}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>$('#toast').classList.remove('visible'),2400)}
function floatText(p){const pos=new THREE.Vector3(p.g.position.x,2.7,p.g.position.z).project(camera),el=document.createElement('div');el.className='floater';el.textContent='+1 VOTER';el.style.left=(pos.x*.5+.5)*innerWidth+'px';el.style.top=(-pos.y*.5+.5)*innerHeight+'px';$('#floating').append(el);setTimeout(()=>el.remove(),1400)}
function wardTarget(w = ward){return WARDS[w]?.target || 25;}
function getWardDifficulty(w = ward){
  const lvl = WARDS[w]?.level || 1;
  return {
    level: lvl,
    canvassSpeed: 0.90 + (lvl - 1) * 0.16,
    repathInterval: Math.max(0.24, 0.85 - (lvl - 1) * 0.065),
    chaseMult: 0.95 + (lvl - 1) * 0.13
  };
}
let confettiRaf=null,confettiParticles=[];
function fireConfetti(){
 const canvas=$('#confetti');if(!canvas)return;
 canvas.hidden=false;if(typeof requestAnimationFrame!=='function')return;
 const dpr=window.devicePixelRatio||1;
 canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const colors=[PARTIES[selected]?.hex||'#65f395','#ffdd40','#4c94ff','#ff5d5d','#ffffff','#ffd700','#00e5ff','#ff6090'];
 confettiParticles=Array.from({length:120},()=>({
   x:range(0,canvas.width),
   y:range(-canvas.height*0.5,0),
   w:range(10,20)*dpr,
   h:range(6,12)*dpr,
   vx:range(-2.5,2.5)*dpr,
   vy:range(3,8)*dpr,
   rot:range(0,TAU),
   vrot:range(-0.08,0.08),
   color:colors[Math.floor(random()*colors.length)],
   wobble:range(0,TAU),
   vwobble:range(0.06,0.12)
 }));
 let startT=performance.now();
 function step(t){
   if((t-startT)/1000>6){stopConfetti();return}
   ctx.clearRect(0,0,canvas.width,canvas.height);
   for(const p of confettiParticles){
     p.x+=p.vx+Math.sin(p.wobble)*1.8*dpr;
     p.y+=p.vy;
     p.wobble+=p.vwobble;
     p.rot+=p.vrot;
     if(p.y>canvas.height+30){
       p.y=-20;
       p.x=range(0,canvas.width);
     }
     ctx.save();
     ctx.translate(p.x,p.y);
     ctx.rotate(p.rot);
     ctx.fillStyle=p.color;
     ctx.fillRect(-p.w/2,-p.h/2,p.w*Math.cos(p.wobble),p.h);
     ctx.restore();
   }
   confettiRaf=requestAnimationFrame(step);
 }
 if(confettiRaf)cancelAnimationFrame(confettiRaf);
 confettiRaf=requestAnimationFrame(step);
}
function stopConfetti(){
 if(confettiRaf){cancelAnimationFrame(confettiRaf);confettiRaf=null}
 const canvas=$('#confetti');if(canvas){canvas.hidden=true;const ctx=canvas.getContext('2d');if(ctx&&ctx.clearRect)ctx.clearRect(0,0,canvas.width,canvas.height)}
}
function scores(){const out=Object.fromEntries(keys.map(p=>[p,0]));people.forEach(p=>{if(p.party&&p.voted)out[p.party]++});return out}
function updateUI(){
  const counts=scores();growHoles(counts);refreshTactics(counts);
  const wInfo=WARDS[ward]||{name:'Ward '+ward,short:'Ward '+ward,diff:'CAMPAIGN',level:1};
  $('#ward-label').textContent=`LVL ${wInfo.level} · ${wInfo.diff} · WARD ${ward}`;
  $('#count').textContent=counts[selected];
  const leadScore=Math.max(1,...activeKeys.map(p=>counts[p]));
  $('#progress').style.width=Math.min(100,(counts[selected]/Math.max(leadScore,15))*100)+'%';
  const scoreHTML=activeKeys.slice().sort((a,b)=>counts[b]-counts[a]).map(p=>`<div class="score-row ${p===selected?'you':''}" style="--p:${PARTIES[p].hex}"><img class="score-logo" src="${logoFiles[p]}" alt=""><b>${p}</b>${p===selected?'<em>YOU</em>':''}<strong>${counts[p]}</strong></div>`).join('');
  if(scoreHTML!==lastScoreHTML){$('#scores').innerHTML=scoreHTML;lastScoreHTML=scoreHTML}
  const secs=Math.max(0,Math.ceil(remaining));
  $('#timer').textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
  $('.timer').classList.toggle('urgent',secs<=15);
  $('#boost').disabled=elapsed<rallyCooldown;
  $('#boost-label').textContent=elapsed<rallyCooldown?Math.ceil(rallyCooldown-elapsed)+'s':'RALLY';
  if(state==='playing'&&remaining<=0&&!holes.some(h=>h.busy)){
    const maxVotes=Math.max(...activeKeys.map(p=>counts[p]));
    const topParties=activeKeys.filter(p=>counts[p]===maxVotes);
    const winner=topParties.length===1?topParties[0]:null;
    finish(winner);
  }
}
function chooseTarget(p){if(!p.lane)p.lane={axis:'z',center:0};if(p.lane.axis==='z')p.target.set(p.lane.center+range(-2.6,2.6),range(-79,49));else p.target.set(range(-28,28),p.lane.center+range(-2.6,2.6));p.route=[];}
function resetWorld(){
  lastScoreHTML='';lastAlertKey='';lastAlertAt=-20;threatParty=null;mapBase=null;cleanCrises();
  setCoastal(ward===54);
  if(builtWard!==ward){scene.userData.khayelitsha?.dispose();delete scene.userData.khayelitsha;if(scene.background?.isTexture)scene.background.dispose();scene.clear();surf.length=0;setupRealism(renderer,scene);environment();builtWard=ward}
  refreshLocation();
  const others=keys.filter(k=>k!==selected),offset=Math.max(0,WARD_ORDER.indexOf(ward))*3;
  activeKeys=[selected,...Array.from({length:3},(_,i)=>others[(offset+i)%others.length])];
  canAdvance=false;
  for(const p of people){scene.remove(p.g);p.front.geometry.dispose();if(p.badge){p.badge.material.map.dispose();p.badge.material.dispose()}}people.length=0;
  for(const h of holes){scene.remove(h.g);h.g.traverse(m=>{if(m.isMesh){m.geometry.dispose();m.material.dispose()}});h.sign.material.map.dispose();h.sign.material.dispose()}holes.length=0;
  for(const p of particles){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose()}particles.length=0;
  speechBubbles.forEach(b=>b.el.remove());speechBubbles.length=0;seed=6821;bubbleClock=0;
  const maxPeople = MOBILE ? 26 : ((ward===79||ward===18)?55:105);
  for(let i=0;i<maxPeople;i++){
    const axis=i<90?'z':'x',center=axis==='z'?VERTICAL[i%3]:HORIZONTAL[(i-90)%5],x=axis==='z'?center+range(-2.8,2.8):range(-28,28),z=axis==='z'?range(-79,49):center+range(-2.8,2.8);
    const party=i<32?activeKeys[i%4]:null,p=makePerson(x,z,party);
    p.lane={axis,center};p.voice=Math.floor(i/4)%8;p.loyal=i<8;p.stubborn=i>=8&&i<16;p.speed=range(.35,.6);p.pause=range(0,2);chooseTarget(p);
    if(p.loyal&&party){
      p.capTop=mesh(hairCapGeo(),PARTIES[party].color,p.head);p.capTop.position.set(0,.012,-.004);p.capTop.scale.set(.121,.14,.139);p.capTop.rotation.x=-.2;
      p.capBrim=mesh(fineSphere(),PARTIES[party].color,p.head);p.capBrim.position.set(0,.052,.13);p.capBrim.scale.set(.09,.009,.082);p.capBrim.rotation.x=.14;
    }
    if(!party&&i%3===0){const bag=box(.16,.26,.1,0xb8945d,.33,.62,.03,p.g);p.bag=bag;}
  }
  if(ward!==79)for(let i=0;i<12;i++){const p=makePerson(i<8?11+(i%4)*2:7+(i%2)*10,i<8?-56+Math.floor(i/4)*3:-46.7-Math.floor((i-8)/2)*2,null);p.lane={axis:'z',center:i%2?24:0};p.voice=i;p.activity=i<8?(i%2?'squats':'jacks'):'vendor';p.home=p.g.position.clone();p.g.rotation.y=i<8?.2:Math.PI;chooseTarget(p)}
  if(ward===54)for(let i=0;i<12;i++){const p=makePerson(-39+range(-3,3),-72+i*10,null);p.lane={axis:'z',center:-39};p.voice=i;chooseTarget(p)}
  player=makeHole(selected,WARDS[ward].x,WARDS[ward].z,true);
  activeKeys.filter(p=>p!==selected).forEach((p,i)=>makeHole(p,[-24,24,0][i],ward===82?[-53,-45,-72][i]:[-7,-3,-24][i]));
  pointerTarget=null;stickInput={x:0,y:0};pressed.clear();elapsed=0;rallyUntil=0;rallyCooldown=0;remaining=60;
  if($('#start-target-label'))$('#start-target-label').innerHTML='<b>1:00</b> ROUND';
  batchCrowd();syncHoles();setupCrises();
}
function syncHoles(){holes.forEach((h,i)=>{holeUniform.value[i].set(h.g.position.x,h.g.position.z,h.mode==='respawning'?0:h.radius*h.g.scale.x);const scale=h.radius/1.075;h.dark.scale.setScalar(scale);h.throat.scale.set(scale,1,scale);h.ring.scale.setScalar(scale);h.glow.scale.setScalar(scale);h.logo.scale.setScalar(scale*(h.busy?.02:1))})}
function growHoles(counts){for(const h of holes){if(h.mode!=='active')continue;const level=holeLevel(counts[h.party]);h.capacity=level.capacity;h.radius=h.busy?Math.max(h.radius,level.radius):level.radius;const safe=nearestRoad(h.g.position.x,h.g.position.z,h.radius+.12);h.g.position.x=safe.x;h.g.position.z=safe.z}syncHoles()}
function speak(p,text){if(p.bubbleUntil>elapsed)return;p.bubbleUntil=elapsed+6.5;while(speechBubbles.length>=3){speechBubbles.shift().el.remove()}const el=document.createElement('div');el.className='speech';el.textContent=text;el.style.borderColor=p.party?PARTIES[p.party].hex:'#ffebad';$('#speech-layer').append(el);speechBubbles.push({p,el,until:elapsed+5.5});}
function positionSpeech(){for(let i=speechBubbles.length-1;i>=0;i--){const b=speechBubbles[i];if(elapsed>b.until||state==='start'){b.el.remove();speechBubbles.splice(i,1);continue}const v=new THREE.Vector3(b.p.g.position.x,2.9,b.p.g.position.z).project(camera);b.el.style.display=v.z>1||v.z<0||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1?'none':'block';b.el.style.left=THREE.MathUtils.clamp((v.x*.5+.5)*innerWidth,105,innerWidth-105)+'px';b.el.style.top=THREE.MathUtils.clamp((-v.y*.5+.5)*innerHeight,160,innerHeight-130)+'px'}}
let mapBase=null,mapWard=null,mapLeader=null,threatParty=null,lastAlertKey='',lastAlertAt=-20,lastScoreHTML='';
function refreshTactics(counts){
 const ranks=standings(counts,activeKeys,selected);threatParty=ranks.threat;
 const notice=$('#rival-alert');
 if(threatParty){
   const n=counts[threatParty];
   const message=ranks.urgent?`<b>${threatParty}</b> leads with <b>${n}</b> votes · <em>Steal them!</em>`:`<b>${threatParty}</b> leads <b>${n}–${counts[selected]}</b> · <em>Catch up!</em>`;
   $('#rival-message').innerHTML=message;
   const logo=$('#alert-party-logo');if(logo&&logoFiles[threatParty])logo.src=logoFiles[threatParty];
   notice.style.setProperty('--rival',PARTIES[threatParty].hex);
   notice.classList.toggle('urgent',ranks.urgent);
   const key=threatParty+':'+ranks.urgent;
   if(key!==lastAlertKey){
     notice.hidden=false;
     notice.classList.add('visible');
     lastAlertKey=key;
     lastAlertAt=elapsed;
     clearTimeout(notice.dismissTimer);
     notice.dismissTimer=setTimeout(()=>{
       notice.classList.remove('visible');
       setTimeout(()=>{if(state==='playing')notice.hidden=true},250);
     },4500);
   }
 } else {
   notice.hidden=true;
   notice.classList.remove('visible');
   clearTimeout(notice.dismissTimer);
 }
 $('#map-leader').textContent=ranks.leader?ranks.leader+' leads · '+counts[ranks.leader]+' voters':'Ward tied · '+Math.max(...activeKeys.map(p=>counts[p]))+' voters';
 $('.neighbourhood-map').style.setProperty('--leader',ranks.leader?PARTIES[ranks.leader].hex:'#b8cdca');
 $('#hole-level').textContent=player.mode!=='active'?'REGROUPING · 0 VOTERS':(elapsed<player.shieldUntil?'SHIELD '+Math.ceil(player.shieldUntil-elapsed)+'s · ':'')+'CAMPAIGN LEVEL '+player.capacity+' · '+player.capacity+' AT ONCE'+(player.capacity<3?' · NEXT '+(player.capacity===1?12:18):'');
 return ranks;
}
function huntRival(){if(state!=='playing'||player.mode!=='active'||!threatParty)return;const target=nearestSupporter(people,threatParty,player.g.position);if(!target){toast('No available '+threatParty+' supporters nearby. Look for neutral voters.');return}pointerTarget=target.g.position.clone();player.route=routeBetween(player.g.position,nearestRoad(pointerTarget.x,pointerTarget.z,player.radius+.12));toast('Follow the gold route to '+threatParty+' voters.');drawMap();$('#rival-alert').classList.remove('visible');setTimeout(()=>{$('#rival-alert').hidden=true},250);}
let crises = [];
const CRISIS_TEMPLATES = [
  { id: 'pot1', type: 'pothole', x: 0, z: 14, reward: 2, label: '🚧 POTHOLE REPAIRED! +2 VOTES', shout: 'Finally someone patched this road!' },
  { id: 'water1', type: 'water', x: 24, z: -12, reward: 3, label: '💧 WATER LEAK FIXED! +3 VOTES', shout: 'Water leak repaired! You have my vote!' },
  { id: 'power1', type: 'power', x: -24, z: -38, reward: 3, label: '⚡ POWER RESTORED! +3 VOTES', shout: 'Eskom box fixed! Geen loadshedding!' },
  { id: 'pot2', type: 'pothole', x: -12, z: 26, reward: 2, label: '🚧 ROAD CRATER FIXED! +2 VOTES', shout: 'No more bent rims on our taxi route!' },
  { id: 'water2', type: 'water', x: 12, z: -64, reward: 3, label: '💧 MAIN WATER RESTORED! +3 VOTES', shout: 'Clean running water is back!' },
  { id: 'power2', type: 'power', x: 0, z: -64, reward: 3, label: '⚡ SUBSTATION RESTORED! +3 VOTES', shout: 'Power restored! Streetlights are on!' }
];
let _glowTex=null,_circleGeo=null,_ringGeo=null;
function crisisGlow(){
  if(_glowTex)return _glowTex;
  const c=document.createElement('canvas');c.width=c.height=64;
  const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.65)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);
  _glowTex=new THREE.CanvasTexture(c);_glowTex.colorSpace=THREE.SRGBColorSpace;return _glowTex;
}
function cleanCrises(){
  for(const c of crises){
    if(!c.group)continue;
    scene.remove(c.group);
    for(const d of c.own||[])d.dispose();
  }
  crises.length = 0;
}
function setupCrises(){
  cleanCrises();
  const count = Math.min(CRISIS_TEMPLATES.length, WARDS[ward]?.crises || 2);
  for(let i=0; i<count; i++){
    const t = CRISIS_TEMPLATES[i];
    crises.push(makeCrisis(t.id, t.type, t.x, t.z, t.reward, t.label, t.shout));
  }
  const activeCount = crises.filter(c => c.active).length;
  if($('#crisis-hud')){
    $('#crisis-hud').hidden = (activeCount === 0 || state !== 'playing');
    if($('#crisis-hud-text')) $('#crisis-hud-text').textContent = activeCount + ' Crises Active';
  }
}
// Flat, ground-hugging decal (cracks, wet patches, burn marks). Scaled ellipse so shapes look irregular, not round.
function flatDisc(group,own,r,sx,sz,rot,color,y,o={}){
  if(!_circleGeo)_circleGeo=new THREE.CircleGeometry(1,28);
  const mat=new THREE.MeshStandardMaterial({color,roughness:o.rough??.95,metalness:o.metal??0,transparent:o.opacity!==undefined,opacity:o.opacity??1,depthWrite:o.opacity===undefined,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  own.push(mat);
  const m=new THREE.Mesh(_circleGeo,mat);
  m.rotation.set(-Math.PI/2,0,rot);m.scale.set(r*sx,r*sz,1);m.position.set(o.x||0,y,o.z||0);
  m.receiveShadow=true;m.renderOrder=1;group.add(m);return m;
}
function makeParticles(own,group,n,color,size,opacity,additive){
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
  const mat=new THREE.PointsMaterial({color,size,map:crisisGlow(),transparent:true,opacity,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending});
  own.push(geo,mat);
  const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;group.add(pts);
  return {pts,geo,mat,n,vel:new Float32Array(n*3),life:new Float32Array(n)};
}
function trafficCone(group,x,z,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;group.add(g);
  box(.46,.04,.46,0x15181a,0,.02,0,g);
  cylinder(.045,.19,.62,0xff5a00,0,.35,0,g,14);
  cylinder(.088,.122,.13,0xf4f4f4,0,.42,0,g,14);
  cylinder(.118,.148,.09,0xf4f4f4,0,.26,0,g,14);
  return g;
}
function makeCrisis(id, type, x, z, reward, labelText, shout){
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  const own=[];
  const c={ id, type, x, z, reward, label: labelText, shout, active: true, group, own, phase: Math.random()*TAU };
  const rnd=()=>Math.random();
  if(type === 'pothole'){
    const hole=new THREE.Group();group.add(hole);
    // cracked, fractured asphalt halo -> rim -> deep hole -> muddy water
    flatDisc(hole,own,1.0,2.0,1.55,.25,0x3b4043,.022,{});
    flatDisc(hole,own,1.0,1.55,1.15,.5,0x1d2123,.027,{});
    flatDisc(hole,own,1.0,1.18,.8,.5,0x0b0d0e,.031,{});
    flatDisc(hole,own,1.0,.8,.52,-.3,0x050607,.035,{x:.12,z:-.05});
    c.puddle=flatDisc(hole,own,1.0,.62,.34,-.2,0x5b7384,.039,{rough:.04,metal:.35,opacity:.7,x:.1,z:-.04});
    const crackMat=material(0x15181a,1);
    for(let i=0;i<7;i++){
      const a=i/7*TAU+rnd()*.5,len=.8+rnd()*1.1;
      const k=box(len,.012,.05+rnd()*.04,0x15181a,Math.cos(a)*(1.1+len*.4),.03,Math.sin(a)*(.8+len*.3),hole);
      k.material=crackMat;k.rotation.y=-a+(rnd()-.5)*.35;k.castShadow=false;
    }
    for(let i=0;i<11;i++){ // loose broken asphalt chunks
      const a=rnd()*TAU,d=1.0+rnd()*.9,s=.1+rnd()*.2;
      const ch=box(s*1.5,s*.55,s,rnd()<.5?0x575c5f:0x474c4f,Math.cos(a)*d*1.2,.06,Math.sin(a)*d*.9,hole);
      ch.rotation.set((rnd()-.5)*.6,rnd()*TAU,(rnd()-.5)*.6);
    }
    c.crater=hole;
    const warn=new THREE.Group();group.add(warn);
    trafficCone(warn,-1.9,.9,.2);trafficCone(warn,1.95,-.5,-.4);trafficCone(warn,-.2,-1.5,.1);
    // striped road barrier
    for(const s of[-.8,.8]){box(.05,.55,.05,0x333a3e,s,.28,1.5,warn)}
    for(let i=0;i<6;i++)box(.29,.17,.035,i%2?0xf4f4f4:0xd32f2f,-.73+i*.292,.5,1.5,warn);
    for(let i=0;i<6;i++)box(.29,.17,.035,i%2?0xd32f2f:0xf4f4f4,-.73+i*.292,.3,1.5,warn);
    c.coneGroup=warn;
    // fresh patch revealed after repair
    const patch=box(2.5,.035,1.9,0x2a2d2f,.05,.03,0,group);patch.castShadow=false;patch.visible=false;c.patch=patch;
  } else if(type === 'water'){
    const trench=new THREE.Group();group.add(trench);
    flatDisc(trench,own,1.0,1.5,1.2,.3,0x2c2218,.022,{});               // excavated, soaked soil
    flatDisc(trench,own,1.0,1.1,.8,.3,0x1d1610,.026,{});
    for(let i=0;i<8;i++){const a=rnd()*TAU,d=.9+rnd()*.7,s=.12+rnd()*.2;const ch=box(s*1.5,s*.6,s,0x5a5e60,Math.cos(a)*d*1.2,.06,Math.sin(a)*d,trench);ch.rotation.set((rnd()-.5)*.5,rnd()*TAU,(rnd()-.5)*.4)}
    const pipeMat=material(0x7d868b,.45,.65);
    const pipe=cylinder(.13,.13,2.4,pipeMat,0,.14,0,trench,14);pipe.rotation.z=Math.PI/2;
    cylinder(.095,.095,.55,pipeMat,0,.4,0,trench,12);
    cylinder(.17,.17,.07,material(0x3a4146,.5,.6),0,.15,0,trench,14).rotation.z=Math.PI/2;
    cylinder(.14,.1,.06,material(0x9aa3a8,.35,.7),0,.69,0,trench,12); // broken stub
    c.puddle=flatDisc(group,own,1.0,1.9,1.55,.1,0x5ea6cf,.03,{rough:.03,metal:.3,opacity:.62});
    const ringMat=new THREE.MeshBasicMaterial({color:0xcfeeff,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
    if(!_ringGeo)_ringGeo=new THREE.RingGeometry(.9,1,40);
    own.push(ringMat);
    c.ripple=new THREE.Mesh(_ringGeo,ringMat);c.ripple.rotation.x=-Math.PI/2;c.ripple.position.y=.036;group.add(c.ripple);
    c.fx=makeParticles(own,group,64,0xd9f2ff,.34,.9,false);
    c.fx.pts.position.y=0;
    const jetMat=new THREE.MeshBasicMaterial({color:0xe3f6ff,transparent:true,opacity:.45,depthWrite:false});own.push(jetMat);
    c.geyser=new THREE.Mesh(new THREE.CylinderGeometry(.05,.17,2.0,10,1,true),jetMat);own.push(c.geyser.geometry);
    c.geyser.position.y=1.6;group.add(c.geyser);
    for(let i=0;i<64;i++)c.fx.life[i]=0;
    for(let s=0;s<40;s++)stepWaterLeak(c,.03);
    c.valve=cylinder(.2,.2,.12,0x2ecc71,0,.72,0,group,14);c.valve.visible=false;
  } else if(type === 'power'){
    const wood=material(0x6b4a30,.9);
    cylinder(.11,.16,6.4,wood,0,3.2,0,group,12);
    box(2.5,.13,.15,0x57402b,0,5.85,0,group);
    box(.12,.12,1.0,0x57402b,0,5.45,0,group).rotation.y=0;
    for(const sx of[-1,0,1]){cylinder(.045,.07,.22,0xcfd8dc,sx*1.0,6.02,0,group,8)}
    const tank=cylinder(.38,.38,.95,material(0x6e7a82,.5,.5),.58,4.9,0,group,16);
    cylinder(.38,.05,.14,0x59636a,.58,5.45,0,group,16);
    for(const sx of[.28,.58,.88])cylinder(.04,.04,.35,0x2b2f31,sx,5.7,0,group,8);
    // hazard sign
    const sign=box(.52,.52,.03,0xffd400,0,2.3,.17,group);sign.rotation.z=Math.PI/4;
    box(.09,.3,.035,0x121212,0,2.34,.19,group);box(.09,.08,.035,0x121212,0,2.07,.19,group);
    // status lamp
    const lampMat=new THREE.MeshBasicMaterial({color:0xff2b1c});own.push(lampMat);
    c.lamp=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),lampMat);own.push(c.lamp.geometry);c.lamp.position.set(.2,3.6,.14);group.add(c.lamp);
    // snapped live cable sagging to the road
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-1,5.8,0),new THREE.Vector3(-1.1,3.6,.25),new THREE.Vector3(-.5,1.4,.8),new THREE.Vector3(.3,.35,1.35),new THREE.Vector3(1.1,.06,1.1),new THREE.Vector3(1.8,.05,1.55),new THREE.Vector3(2.3,.05,1.2)]);
    const cableGeo=new THREE.TubeGeometry(curve,28,.04,6,false);own.push(cableGeo);
    c.cable=new THREE.Mesh(cableGeo,material(0x0c0d0e,.7));c.cable.castShadow=true;group.add(c.cable);
    c.burn=flatDisc(group,own,.7,1,.8,.4,0x0d0d0d,.024,{x:2.0,z:1.35});
    const spriteMat=new THREE.SpriteMaterial({map:crisisGlow(),color:0xfff0a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});own.push(spriteMat);
    c.glow=new THREE.Sprite(spriteMat);c.glow.scale.set(1.5,1.5,1.5);c.glow.position.set(2.1,.25,1.3);group.add(c.glow);
    c.fx=makeParticles(own,group,28,0xffc84a,.2,1,true);
    for(let i=0;i<28;i++){c.fx.life[i]=0;c.fx.pts.geometry.attributes.position.array[i*3+1]=-20}
    c.smoke=[];
    for(let i=0;i<4;i++){
      const m=new THREE.SpriteMaterial({map:crisisGlow(),color:0x4b5054,transparent:true,opacity:0,depthWrite:false});own.push(m);
      const s=new THREE.Sprite(m);s.position.set(2.1,.5,1.3);group.add(s);c.smoke.push({s,t:i*.8});
    }
  }
  // pulsing ground beacon + faint light pillar so objectives are easy to spot (esp. on small screens)
  const col=type==='water'?0x4fc3f7:type==='power'?0xffd54a:0xff7a33;
  const bMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});own.push(bMat);
  const ringGeo=new THREE.RingGeometry(2.45,2.75,48);own.push(ringGeo);
  c.beacon=new THREE.Mesh(ringGeo,bMat);c.beacon.rotation.x=-Math.PI/2;c.beacon.position.y=.05;group.add(c.beacon);
  const pMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});own.push(pMat);
  const pGeo=new THREE.CylinderGeometry(.14,.14,8,10,1,true);own.push(pGeo);
  c.pillar=new THREE.Mesh(pGeo,pMat);c.pillar.position.y=4;group.add(c.pillar);
  return c;
}
function stepWaterLeak(c,dt){
  const p=c.fx,a=p.geo.attributes.position.array;
  for(let i=0;i<p.n;i++){
    const k=i*3;p.life[i]-=dt;
    if(p.life[i]<=0||a[k+1]<.03){
      const ang=Math.random()*TAU,sp=Math.random()*1.5;
      a[k]=0;a[k+1]=.72;a[k+2]=0;
      p.vel[k]=Math.cos(ang)*sp;p.vel[k+1]=4.4+Math.random()*3.4;p.vel[k+2]=Math.sin(ang)*sp;
      p.life[i]=.7+Math.random()*1.2;
    }else{
      p.vel[k+1]-=9.8*dt;a[k]+=p.vel[k]*dt;a[k+1]+=p.vel[k+1]*dt;a[k+2]+=p.vel[k+2]*dt;
    }
  }
  p.geo.attributes.position.needsUpdate=true;
}
function stepSparks(c,dt,ms){
  const p=c.fx,a=p.geo.attributes.position.array;
  const flash=(Math.sin(ms*.031+c.phase)+Math.sin(ms*.0113)*.8)>.15;
  c.glow.material.opacity=flash?.55+Math.random()*.45:.06;
  c.glow.scale.setScalar(flash?1.1+Math.random()*1.1:.5);
  for(let i=0;i<p.n;i++){
    const k=i*3;p.life[i]-=dt;
    if(p.life[i]<=0){
      if(flash&&Math.random()<.6){
        a[k]=2.1;a[k+1]=.2;a[k+2]=1.3;
        const ang=Math.random()*TAU,sp=1+Math.random()*2.6;
        p.vel[k]=Math.cos(ang)*sp;p.vel[k+1]=1.8+Math.random()*3.2;p.vel[k+2]=Math.sin(ang)*sp;
        p.life[i]=.25+Math.random()*.4;
      }else a[k+1]=-20;
    }else{p.vel[k+1]-=10*dt;a[k]+=p.vel[k]*dt;a[k+1]+=p.vel[k+1]*dt;a[k+2]+=p.vel[k+2]*dt;if(a[k+1]<.02){a[k+1]=.02;p.vel[k+1]*=-.3}}
  }
  p.geo.attributes.position.needsUpdate=true;
  for(const sm of c.smoke){
    sm.t+=dt*.55;if(sm.t>3.2)sm.t=0;
    const u=sm.t/3.2;sm.s.position.set(2.1+u*.8,.4+u*3.2,1.3+u*.3);
    sm.s.scale.setScalar(.6+u*2.4);sm.s.material.opacity=.32*(1-u)*Math.min(1,u*8);
  }
  c.lamp.visible=Math.sin(ms*.012)>-.3;
}
function resolveCrisisVisual(c){
  if(c.beacon)c.beacon.visible=false;
  if(c.pillar)c.pillar.visible=false;
  if(c.type==='pothole'){
    c.crater.visible=false;c.coneGroup.visible=false;c.patch.visible=true;
  }else if(c.type==='water'){
    c.geyser.visible=false;c.fx.pts.visible=false;c.valve.visible=true;
    c.puddle.scale.multiplyScalar(.55);c.puddle.material.opacity=.3;c.ripple.visible=false;
  }else if(c.type==='power'){
    c.glow.visible=false;c.fx.pts.visible=false;c.cable.visible=false;c.burn.visible=false;
    for(const sm of c.smoke)sm.s.visible=false;
    c.lamp.visible=true;c.lamp.material.color.setHex(0x24e082);
  }
}
function updateCrises(dt, ms){
  for(const c of crises){
    if(!c.active) continue;
    const t=ms*.001+c.phase;
    if(c.beacon){const s=1+Math.sin(t*4)*.08;c.beacon.scale.set(s,s,s);c.beacon.material.opacity=.4+Math.sin(t*4)*.18;c.pillar.material.opacity=.12+Math.sin(t*3)*.05}
    if(c.type === 'water'){
      stepWaterLeak(c,dt);
      c.geyser.scale.set(1+Math.sin(ms*.021)*.18,1+Math.sin(ms*.013)*.14,1+Math.cos(ms*.021)*.18);
      const u=(t*.9)%1;
      c.ripple.scale.setScalar(.7+u*2.3);c.ripple.material.opacity=.5*(1-u);
      const ps=1+Math.sin(t*2.2)*.03;c.puddle.scale.x=1.9*ps;c.puddle.scale.y=1.55*ps;
    } else if(c.type === 'power'){
      stepSparks(c,dt,ms);
    }
    if(state === 'playing' && player && player.mode === 'active'){
      const d = Math.hypot(player.g.position.x - c.x, player.g.position.z - c.z);
      if(d < player.radius + 1.8){
        c.active = false;
        resolveCrisisVisual(c);
        if(sound) music.cue('pop');
        toast(c.label);
        const neutrals = people.filter(p => !p.party && !p.voted);
        neutrals.sort((a,b) => Math.hypot(a.g.position.x - c.x, a.g.position.z - c.z) - Math.hypot(b.g.position.x - c.x, b.g.position.z - c.z));
        const converted = neutrals.slice(0, c.reward);
        converted.forEach(p => {
          recolor(p, selected);
          p.voted = true;
          speak(p, c.shout);
        });
        const el = document.createElement('div');
        el.className = 'floater';
        el.textContent = c.label;
        el.style.left = (innerWidth / 2) + 'px';
        el.style.top = (innerHeight * 0.38) + 'px';
        el.style.color = '#ffd700';
        $('#floating').append(el);
        setTimeout(() => el.remove(), 1600);
        updateUI();
        drawMap();
        const activeCount = crises.filter(cr => cr.active).length;
        if($('#crisis-hud-text')) $('#crisis-hud-text').textContent = activeCount > 0 ? (activeCount + ' Crises to Fix') : 'All Crises Resolved! 🎉';
        if(activeCount === 0) setTimeout(() => { if($('#crisis-hud')) $('#crisis-hud').hidden = true; }, 3500);
      }
    }
  }
}
function mapPoint(x,z){
  const cx = ward === 54 ? -10 : 0, cz = -12, scale = 2.05;
  return { x: 128 + (x - cx) * scale, y: 128 + (z - cz) * scale };
}
function drawMap(){
  const c=$('#map'),ctx=c.getContext('2d'),counts=scores(),ranks=standings(counts,activeKeys,selected),leader=ranks.leader;
  if(!mapBase||mapWard!==ward||mapLeader!==leader){
    mapBase=document.createElement('canvas');mapBase.width=256;mapBase.height=256;const b=mapBase.getContext('2d');
    b.save();
    b.beginPath();b.arc(128,128,125,0,TAU);b.clip();
    b.fillStyle='#0a1318';b.fillRect(0,0,256,256);
    b.strokeStyle='rgba(255,255,255,0.07)';b.lineWidth=1.2;
    b.beginPath();b.arc(128,128,48,0,TAU);b.stroke();
    b.beginPath();b.arc(128,128,88,0,TAU);b.stroke();
    b.beginPath();b.arc(128,128,124,0,TAU);b.stroke();
    b.strokeStyle='rgba(255,255,255,0.18)';b.lineWidth=1;
    b.beginPath();
    b.moveTo(128,5);b.lineTo(128,14);
    b.moveTo(128,242);b.lineTo(128,251);
    b.moveTo(5,128);b.lineTo(14,128);
    b.moveTo(242,128);b.lineTo(251,128);
    b.stroke();
    const rect=(x,z,w,d,color)=>{const p=mapPoint(x,z);b.fillStyle=color;b.fillRect(p.x,p.y,w*2.05,d*2.05)};
    if(ward===54){
      rect(-54,-75,14,130,'#104968');
      rect(-40,-75,12,130,'#c2a56c');
    }
    for(const x of [-34,-12,12,34])for(const z of [-76,-50,-24,1,26,50]){
      if(ward===54&&x===-34)continue;
      if(x===12&&z===-50)continue;
      rect(x-3,z-4,6,8,'#14222b');
    }
    b.lineCap='round';b.lineJoin='round';
    b.strokeStyle='#050a0e';b.lineWidth=13.5;
    for(const x of VERTICAL){const a=mapPoint(x,-68),e=mapPoint(x,44);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    for(const z of HORIZONTAL){const a=mapPoint(ward===54?-40:-34,z),e=mapPoint(34,z);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    b.strokeStyle='#273843';b.lineWidth=8;
    for(const x of VERTICAL){const a=mapPoint(x,-68),e=mapPoint(x,44);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    for(const z of HORIZONTAL){const a=mapPoint(ward===54?-40:-34,z),e=mapPoint(34,z);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    b.strokeStyle='rgba(255,255,255,0.2)';b.lineWidth=1.2;b.setLineDash([3,4]);
    for(const x of VERTICAL){const a=mapPoint(x,-67),e=mapPoint(x,43);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    for(const z of HORIZONTAL){const a=mapPoint(ward===54?-39:-33,z),e=mapPoint(33,z);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(e.x,e.y);b.stroke()}
    b.setLineDash([]);
    if(ward!==54){
      rect(4,-58,16,14,'#1b5034');
      const fp=mapPoint(4,-51);
      b.fillStyle='rgba(20,50,30,0.88)';b.fillRect(fp.x-2,fp.y-12,42,14);
      b.fillStyle='#bdf5cb';b.font='bold 9px Arial';b.fillText('⚽ FIELD',fp.x+2,fp.y-2);
    }
    rect(6,-5,6,6,'#6b3c18');
    const sp=mapPoint(6,3);
    b.fillStyle='rgba(50,30,15,0.88)';b.fillRect(sp.x-2,sp.y-12,44,14);
    b.fillStyle='#fedda2';b.font='bold 9px Arial';b.fillText('🏪 SPAZA',sp.x+2,sp.y-2);
    b.fillStyle='#ff3b30';b.beginPath();b.moveTo(228,12);b.lineTo(233,22);b.lineTo(223,22);b.closePath();b.fill();
    b.fillStyle='#ffffff';b.font='bold 10px Arial';b.fillText('N',225,33);
    b.restore();
    mapWard=ward;mapLeader=leader;
  }
  ctx.clearRect(0,0,256,256);
  ctx.save();
  ctx.beginPath();ctx.arc(128,128,125,0,TAU);ctx.clip();
  ctx.drawImage(mapBase,0,0);
  if(player.route?.length){
    ctx.strokeStyle='#ffd700';ctx.lineWidth=3.5;ctx.setLineDash([4,4]);ctx.beginPath();let p=mapPoint(player.g.position.x,player.g.position.z);ctx.moveTo(p.x,p.y);for(const n of player.route){p=mapPoint(n.x,n.z);ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.setLineDash([]);
  }
  for(const c of crises){
    if(!c.active) continue;
    const cp = mapPoint(c.x, c.z);
    ctx.save();ctx.translate(cp.x, cp.y);
    const pulse = 1 + Math.sin(performance.now() * 0.009) * 0.25;
    const color = c.type === 'water' ? '#4fc3f7' : c.type === 'power' ? '#ffd700' : '#ff7733';
    ctx.strokeStyle = color; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 6 * pulse, 0, TAU); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, TAU); ctx.fill();
    ctx.restore();
  }
  for(const p of people){
    if(p.state==='hidden'||p.state==='fall')continue;const xy=mapPoint(p.g.position.x,p.g.position.z);
    ctx.fillStyle=p.party?PARTIES[p.party].hex:'#a4d8cf';ctx.beginPath();ctx.arc(xy.x,xy.y,p.party===threatParty?3:1.6,0,TAU);ctx.fill();
  }
  for(const h of holes){
    if(h.mode!=='active'||h.isPlayer)continue;const p=mapPoint(h.g.position.x,h.g.position.z);
    ctx.fillStyle=PARTIES[h.party].hex;ctx.strokeStyle='#070c0e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,5,0,TAU);ctx.fill();ctx.stroke();
  }
  if(player&&player.mode==='active'){
    const p=mapPoint(player.g.position.x,player.g.position.z);
    ctx.save();ctx.translate(p.x,p.y);
    const ang=player.mapAngle??0;ctx.rotate(ang);
    ctx.beginPath();ctx.moveTo(0,-9.5);ctx.lineTo(6.5,7);ctx.lineTo(0,3.5);ctx.lineTo(-6.5,7);ctx.closePath();
    ctx.strokeStyle='#070c0e';ctx.lineWidth=3.5;ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.fill();
    ctx.fillStyle=PARTIES[player.party].hex;ctx.beginPath();ctx.arc(0,1.2,2.2,0,TAU);ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  $('#street-name').textContent=ward===54?(player.g.position.x<-28?'Beach promenade':'Camps Bay'):(ward===18||ward===87)?(inField(player.g.position.x,player.g.position.z)?'Community Field':(ward===18?'Kuyasa':'Site C')+' · '+streetName(player.g.position.x,player.g.position.z)):streetName(player.g.position.x,player.g.position.z);
  c.setAttribute('aria-label','Ward '+ward+'. '+(leader?leader+' leads.':'Tied standings.')+' White arrow: you. Coloured dots: voters. Gold line: route.');
}
function mapNavigate(e){
  if(state!=='playing'||player.mode!=='active')return;
  const r=$('#map').getBoundingClientRect(),x=(e.clientX-r.left)/r.width*256,y=(e.clientY-r.top)/r.height*256;
  const cx=ward===54?-10:0,cz=-12,scale=2.05;
  pointerTarget=new THREE.Vector3((x-128)/scale+cx,0,(y-128)/scale+cz);
  player.route=routeBetween(player.g.position,nearestRoad(pointerTarget.x,pointerTarget.z,player.radius+.12));
  drawMap();
}
function setupVictoryShare(party, wardNum, wardMeta, votes){
  const shareBox = $('#victory-share-box');
  if(!shareBox) return;
  const wardTitle = (wardMeta?.short || wardMeta?.name || ('Ward ' + wardNum));
  const shareText = `🇿🇦 VICTORY ALERT! Our party ${party} just won Ward ${wardNum} (${wardTitle}) in Cape Town with ${votes} voters! Canvass your own ward in Canvassing SA: ${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const waBtn = $('#share-whatsapp');
  if(waBtn) waBtn.onclick = () => { uiSelectSound(); window.open(whatsappUrl, '_blank', 'noopener,noreferrer'); };

  const twBtn = $('#share-twitter');
  if(twBtn) twBtn.onclick = () => { uiSelectSound(); window.open(twitterUrl, '_blank', 'noopener,noreferrer'); };

  const copyBtn = $('#share-copy');
  const copyText = $('#copy-btn-text');
  if(copyBtn){
    copyBtn.onclick = async () => {
      uiSelectSound();
      try {
        await navigator.clipboard.writeText(shareText);
        if(copyText) copyText.textContent = 'Copied! ✓';
        toast('Announcement copied to clipboard! Share it with your branches.');
        setTimeout(() => { if(copyText) copyText.textContent = 'Copy Text'; }, 2200);
      } catch(err){
        toast('Ready to share: ' + shareText.slice(0, 45) + '…');
      }
    };
  }

  const nativeBtn = $('#share-native');
  if(nativeBtn){
    if(navigator.share){
      nativeBtn.hidden = false;
      nativeBtn.onclick = () => {
        uiSelectSound();
        navigator.share({
          title: `Our party ${party} won Ward ${wardNum}!`,
          text: shareText,
          url: window.location.href
        }).catch(() => {});
      };
    } else {
      nativeBtn.hidden = true;
    }
  }
}
function start(){
  music.enable(sound);stopConfetti();if($('#end-party-badge'))$('#end-party-badge').hidden=true;$('#next-ward').hidden=true;$('#retry-ward').hidden=true;if($('#victory-share-box'))$('#victory-share-box').hidden=true;resetWorld();state='playing';$('#game').classList.add('playing');$('#start').hidden=true;$('#start').style.display='none';$('#location').hidden=true;$('#hud').hidden=false;$('#pause').hidden=false;$('#sound').hidden=true;$('#modal').hidden=true;$('#your-party').textContent='YOU · '+selected;$('#status').textContent=ward===54?'Explore the beach and promenade. Caps mean loyal.':'Caps mean loyal. Explore the side streets.';if($('#crisis-hud'))$('#crisis-hud').hidden=(crises.length===0);updateUI();drawMap();toast('1:00 RUSH! Rally the MOST voters in 1 minute to win Ward '+ward+'!');beep(360);
}
function finish(winner){
 const tally=scores();
 const maxVotes=Math.max(...activeKeys.map(p=>tally[p]));
 const topParties=activeKeys.filter(p=>tally[p]===maxVotes);
 if(winner===undefined||winner===null){
   winner=topParties.length===1?topParties[0]:null;
 }
 state='ended';$('#game').classList.remove('playing');$('#hud').hidden=true;$('#pause').hidden=true;$('#sound').hidden=true;$('#modal').hidden=false;$('#resume').hidden=true;speechBubbles.forEach(b=>b.el.remove());speechBubbles.length=0;
 if(winner&&logoFiles[winner]){if($('#end-party-badge')){$('#end-party-badge').hidden=false;$('#end-party-logo').src=logoFiles[winner];$('#end-party-badge').style.setProperty('--party-win',PARTIES[winner]?.hex||'#65f395');}}else{if($('#end-party-badge'))$('#end-party-badge').hidden=true;}
 canAdvance=winner===selected;
 if(canAdvance){
   wardWins[ward]=selected;
   const wardInfo=WARDS[ward]||{name:'Ward '+ward,short:'Ward '+ward};
   $('#end-eyebrow').textContent='WARD '+ward+' · 1-MINUTE TIME ATTACK VICTORY!';
   $('#end-title').textContent='Our party '+selected+' won Ward '+ward+' ('+(wardInfo.short||wardInfo.name)+')!';
   $('#end-copy').textContent='You rallied '+tally[selected]+' voters in 1 minute—the most in the ward!';
   $('#end-copy').hidden=false;
   $('#next-ward').hidden=false;
   $('#next-ward').textContent='Continue to '+WARDS[nextWard()].name+' →';
   $('#retry-ward').hidden=true;
   if($('#victory-share-box'))$('#victory-share-box').hidden=false;
   setupVictoryShare(selected,ward,wardInfo,tally[selected]);
   fireConfetti();
   music.cue('win');
 } else {
   $('#end-eyebrow').textContent='WARD '+ward+' · TIME EXPIRED';
   if(winner){
     $('#end-title').textContent=winner+' won Ward '+ward+' with '+tally[winner]+' voters!';
     $('#end-copy').textContent='You had '+tally[selected]+' voters. The competition was faster—canvass quicker next round!';
   } else {
     $('#end-title').textContent='Ward '+ward+' tied with '+maxVotes+' voters!';
     $('#end-copy').textContent='Time ran out with no clear majority. Play again to take the lead!';
   }
   $('#end-copy').hidden=false;
   $('#next-ward').hidden=true;
   $('#retry-ward').hidden=false;
   $('#retry-ward').textContent='Try again →';
   if($('#victory-share-box'))$('#victory-share-box').hidden=true;
   stopConfetti();
   music.cue('lose');
 }
 $('#end-score').innerHTML='<div class="end-number">'+(winner?tally[winner]:maxVotes)+'<small> top voters</small></div><div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">Your score: <b>'+tally[selected]+' voters</b> in 1:00</div>';
 $('#restart').textContent='Choose party or ward';
}
function pause(){
 if(state!=='playing')return;$('#next-ward').hidden=true;$('#retry-ward').hidden=true;if($('#victory-share-box'))$('#victory-share-box').hidden=true;state='paused';pressed.clear();stickInput={x:0,y:0};$('#stick').style.transform='';pointerTarget=null;$('#hud').hidden=true;$('#sound').hidden=false;$('#modal').hidden=false;if($('#end-party-badge'))$('#end-party-badge').hidden=true;$('#end-eyebrow').textContent='TAKE A BREATHER';$('#end-title').textContent='Street on pause.';$('#end-copy').textContent='Your neighbours will be right here.';$('#end-score').innerHTML='';$('#resume').hidden=false;$('#restart').textContent='Choose a party';
}
function resumeGame(){
 if(state!=='paused')return;state='playing';$('#game').classList.add('playing');$('#hud').hidden=false;$('#modal').hidden=true;$('#sound').hidden=true;lastTime=performance.now();
}
function rally(){if(state!=='playing'||player.mode!=='active'||elapsed<rallyCooldown)return;rallyUntil=elapsed+3.8;rallyCooldown=elapsed+11;beep(280);toast('Rally time! Nearby voters are coming over.');burst(player.g.position.x,player.g.position.z,PARTIES[selected].color)}
function capture(p,h){
 if(h.mode!=='active'||p.state!=='walk'||p.cool>0||h.capturing>=h.capacity)return;
 if(p.party===h.party){
   if(h.isPlayer&&p.cool<=0){
     speak(p,cheerFor(h.party));
     p.cool=4.5;
     $('#status').textContent='Already '+h.party+'! Canvass undecided or rival voters.';
   }
   return;
 }
 if(p.loyal||(p.stubborn&&p.attempts===0)){p.attempts++;p.state='resist';p.anim=0;p.cool=5;p.owner=h;const dx=p.g.position.x-h.g.position.x,dz=p.g.position.z-h.g.position.z,len=Math.hypot(dx,dz)||1;p.escape={x:dx/len||1,z:dz/len};h.wait=.75;
 if(h.isPlayer){speak(p,reactionFor(p,h.party));$('#status').textContent=p.loyal?'Loyal supporter. Try someone else.':'Not convinced yet. Try again in a moment.';beep(180)}return;}
  p.activity=null;p.g.scale.setScalar(1);p.legs.forEach(l=>l.rotation.z=0);p.state='stumble';p.anim=0;p.owner=h;p.captureOffsetX=h.capacity>1?Math.cos(h.capturing*TAU/h.capacity)*h.radius*.27:0;p.captureOffsetZ=h.capacity>1?Math.sin(h.capturing*TAU/h.capacity)*h.radius*.27:0;p.captureX=h.g.position.x+p.captureOffsetX;p.captureZ=h.g.position.z+p.captureOffsetZ;p.fromX=p.g.position.x;p.fromZ=p.g.position.z;h.capturing++;h.busy=true;h.wait=0.55;
  if(h.isPlayer){music.cue('suck');if(!p.party&&random()<.4)speak(p,everyday[Math.floor(random()*everyday.length)])}
}
function updatePeople(dt,t,active){
 for(let pi=0; pi<people.length; pi++){
  const p=people[pi];
  p.cool=Math.max(0,p.cool-dt);
  if(p.owner&&['stumble','fall','hidden'].includes(p.state)){
    p.captureX=p.owner.g.position.x+(p.captureOffsetX||0);
    p.captureZ=p.owner.g.position.z+(p.captureOffsetZ||0);
  }
  if(p.state==='resist'){
    p.anim+=dt;const a=Math.min(1,p.anim/.7);
    p.g.rotation.y=Math.atan2(p.owner.g.position.x-p.g.position.x,p.owner.g.position.z-p.g.position.z);
    p.g.rotation.z=Math.sin(a*TAU*2)*.13*(1-a);
    p.arms[0].pivot.rotation.x=p.arms[1].pivot.rotation.x=-1.25;
    p.legs[0].rotation.z=-.25;p.legs[1].rotation.z=.25;
    if(a>.2)moveOnRoad(p.g.position,p.escape.x*dt*1.9,p.escape.z*dt*1.9,.6);
    if(a===1){p.state='walk';p.g.rotation.z=0;p.legs.forEach(l=>l.rotation.z=0);chooseTarget(p);p.pause=1}
    continue;
  }
  if(p.state==='stumble'){
    p.anim+=dt;const a=Math.min(1,p.anim/.13);
    p.g.position.x=THREE.MathUtils.lerp(p.fromX,p.captureX,a);
    p.g.position.z=THREE.MathUtils.lerp(p.fromZ,p.captureZ,a);
    p.g.rotation.x=-.18*Math.sin(a*Math.PI);
    p.arms[0].pivot.rotation.z=-1.9*a;p.arms[1].pivot.rotation.z=1.9*a;
    p.legs.forEach((l,i)=>l.rotation.x=(i?1:-1)*.55*a);
    if(a===1){p.state='fall';p.anim=0}
    continue;
  }
  if(p.state==='fall'){
    p.anim+=dt;const a=Math.min(1,p.anim/.22);
    p.g.position.x=p.captureX;p.g.position.z=p.captureZ;
    p.g.position.y=.13-2.65*a*a;
    const s=Math.max(0.01, 1 - 0.7*a);
    p.g.scale.set(s, 1 + 0.3*a, s);
    p.arms[0].pivot.rotation.z=-2.5;p.arms[1].pivot.rotation.z=2.5;
    if(a===1){
      p.state='hidden';p.anim=0;
      p.g.scale.set(0,0,0);
      p.front.visible=false;p.back.visible=false;
      if(p.badge)p.badge.visible=false;
    }
    continue;
  }
  if(p.state==='hidden'){
    p.anim+=dt;
    p.g.scale.set(0,0,0);
    p.front.visible=false;p.back.visible=false;
    if(p.badge)p.badge.visible=false;
    if(p.anim>.08){
      recolor(p,p.owner.party);p.converted=true;p.state='pop';p.anim=0;
      const angle=range(0,TAU);p.exitAngle=angle;
      p.popStartX=p.owner.g.position.x;p.popStartZ=p.owner.g.position.z;
      p.landing=nearestRoad(p.popStartX+Math.cos(angle)*(p.owner.radius+1.2),p.popStartZ+Math.sin(angle)*(p.owner.radius+1.2),.55);
      p.g.rotation.y=Math.atan2(p.landing.x-p.popStartX,p.landing.z-p.popStartZ);
      burst(p.popStartX,p.popStartZ,PARTIES[p.party].color);
      if(p.owner.isPlayer)music.cue('pop');
    }
    continue;
  }
  if(p.state==='pop'){
    p.anim+=dt;const a=Math.min(1,p.anim/.36);
    p.g.scale.setScalar(1);
    p.front.visible=true;p.back.visible=true;
    if(p.badge)p.badge.visible=true;
    const startX=p.popStartX??p.captureX, startZ=p.popStartZ??p.captureZ;
    p.g.position.x=THREE.MathUtils.lerp(startX,p.landing.x,a);
    p.g.position.z=THREE.MathUtils.lerp(startZ,p.landing.z,a);
    p.g.position.y=.13+2.8*Math.sin(a*Math.PI);
    p.g.rotation.z=0;
    p.arms[0].pivot.rotation.z=-1.8;p.arms[1].pivot.rotation.z=1.8;
    if(a===1){
      p.state='land';p.anim=0;
      p.owner.capturing=Math.max(0,p.owner.capturing-1);
      p.owner.busy=p.owner.capturing>0;
      if(p.owner.isPlayer){floatText(p);$('#status').textContent='New voter! Keep exploring the neighbourhood.'}
      updateUI();
    }
    continue;
  }
  if(p.state==='land'){
    p.anim+=dt;const a=Math.min(1,p.anim/.14);
    const squash=Math.sin(a*Math.PI)*.22;
    p.g.scale.set(1+squash, 1-squash, 1+squash);
    p.g.position.y=.13;
    p.arms.forEach((arm,i)=>arm.pivot.rotation.z=(i?1:-1)*(1.8*(1-a)+.15));
    if(a===1){p.state='walk';p.cool=5;p.g.scale.setScalar(1);p.pause=.2;chooseTarget(p)}
    continue;
  }
  if(p.activity&&!p.converted){
    const wave=(Math.sin(t*3+p.phase)+1)/2;
    p.g.position.x=p.home.x;p.g.position.z=p.home.z;
    if(p.activity==='jacks'){
      p.arms.forEach((a,i)=>{a.pivot.rotation.z=(i?1:-1)*(.2+wave*2.3);a.pivot.rotation.x=0});
      p.legs.forEach((l,i)=>{l.rotation.z=(i?1:-1)*wave*.35;l.rotation.x=0});
      p.g.position.y=.13+Math.sin(wave*Math.PI)*.14;
    }else if(p.activity==='squats'){
      p.g.scale.y=1-wave*.2;p.g.position.y=.13;
      p.arms.forEach(a=>a.pivot.rotation.x=-.9);
      p.legs.forEach(l=>l.rotation.x=wave*.35);
    }else{
      p.g.position.y=.13;p.arms[1].pivot.rotation.z=.3+Math.sin(t*2+p.phase)*.25;
    }
    if(active&&remaining>0&&p.cool===0){
      for(let hi=0; hi<holes.length; hi++){
        const h=holes[hi];
        if(h.mode==='active'){
          const hdx=p.g.position.x-h.g.position.x, hdz=p.g.position.z-h.g.position.z;
          const hr=h.radius*.92;
          if(hdx*hdx+hdz*hdz < hr*hr){
            if(p.party===h.party){
              if(h.isPlayer&&p.cool<=0){
                speak(p,cheerFor(h.party));p.cool=4.5;
                $('#status').textContent='Already '+h.party+'! Canvass undecided or rival voters.';
              }
              break;
            }
            if(h.capturing<h.capacity){capture(p,h);break;}
          }
        }
      }
    }
    continue;
  }
  p.pause=Math.max(0,p.pause-dt);let target={x:p.target.x,z:p.target.y},speed=p.speed;
  const pPlayerDx=p.g.position.x-player.g.position.x, pPlayerDz=p.g.position.z-player.g.position.z;
  const rallying=active&&elapsed<rallyUntil&&!p.loyal&&(!p.voted||p.party!==selected)&&(pPlayerDx*pPlayerDx+pPlayerDz*pPlayerDz<72.25);
  if(rallying){
    if(!p.rallyPathTime||p.rallyPathTime<elapsed){
      p.route=routeBetween(p.g.position,player.g.position);
      p.rallyPathTime=elapsed+.6;
    }
    if(p.route.length)target=p.route[0];speed=2.2;p.pause=0;
  }else p.route=[];
  const dx=target.x-p.g.position.x,dz=target.z-p.g.position.z,dSq=dx*dx+dz*dz;
  if(dSq<.16){
    if(rallying)p.route.shift();
    else{chooseTarget(p);p.pause=range(.2,1.2)}
  }else if(p.pause===0){
    const d=Math.sqrt(dSq);
    const oldX=p.g.position.x, oldZ=p.g.position.z;
    moveOnRoad(p.g.position,dx/d*speed*dt,dz/d*speed*dt,.6);
    const movedSq=(p.g.position.x-oldX)**2+(p.g.position.z-oldZ)**2;
    if(movedSq<0.00001*dt){
      p.stuck=(p.stuck||0)+dt;
      if(p.stuck>0.8){chooseTarget(p);p.stuck=0}
    }else{
      p.stuck=0;
      const facing=Math.atan2(dx,dz),turn=Math.atan2(Math.sin(facing-p.g.rotation.y),Math.cos(facing-p.g.rotation.y));
      p.g.rotation.y+=turn*Math.min(1,dt*9);
      p.phase+=dt*speed*7;
    }
  }
  const isWalking=p.pause===0&&dSq>=.16;
  if(isWalking){
    const ph=p.phase,s0=Math.sin(ph),c0=Math.cos(ph),amp=THREE.MathUtils.clamp(speed*.62,.3,.64);
    p.legs[0].rotation.x=s0*amp;p.legs[1].rotation.x=-s0*amp;
    p.shins[0].rotation.x=Math.max(0,-c0)*amp*1.6+.05;p.shins[1].rotation.x=Math.max(0,c0)*amp*1.6+.05;
    p.arms.forEach((a,i)=>{const ang=(i?s0:-s0)*amp*.8;a.pivot.rotation.x=ang;a.pivot.rotation.z=(i===0?-1:1)*.1;p.elbows[i].rotation.x=-(.18+Math.max(0,-ang)*.95)});
    p.upper.rotation.y=-s0*.15*amp/.45;p.upper.rotation.z=s0*.028;p.upper.rotation.x=.045+amp*.11;p.upper.position.x=s0*.014;
    p.head.rotation.y=s0*.1*amp/.45;p.head.rotation.x=-.04-amp*.1;
    p.g.position.y=.13+Math.abs(c0)*.034-.012;
  }else{
    const k=Math.min(1,dt*10),lp=THREE.MathUtils.lerp,u=p.upper;
    p.legs.forEach(l=>l.rotation.x=lp(l.rotation.x,0,k));p.shins.forEach(s=>s.rotation.x=lp(s.rotation.x,0,k));
    p.arms.forEach((a,i)=>{a.pivot.rotation.x=lp(a.pivot.rotation.x,0,k);a.pivot.rotation.z=lp(a.pivot.rotation.z,(i===0?-1:1)*.1,k);p.elbows[i].rotation.x=lp(p.elbows[i].rotation.x,-.14-Math.sin(t*1.3+p.phase+i)*.025,k)});
    u.rotation.x=lp(u.rotation.x,Math.sin(t*1.6+p.phase)*.012,k);u.rotation.y=lp(u.rotation.y,Math.sin(t*.5+p.phase)*.05,k);u.rotation.z=lp(u.rotation.z,0,k);u.position.x=lp(u.position.x,0,k);
    p.head.rotation.y=lp(p.head.rotation.y,Math.sin(t*.45+p.phase*2)*.4,k*.35);p.head.rotation.x=lp(p.head.rotation.x,Math.sin(t*.7+p.phase)*.04,k);
    p.g.position.y=lp(p.g.position.y,.13+Math.sin(t*2+p.phase)*.006,Math.min(1,dt*8));
  }
  if(active&&remaining>0&&p.cool===0){
    for(let hi=0; hi<holes.length; hi++){
      const h=holes[hi];
      if(h.mode==='active'){
        const hdx=p.g.position.x-h.g.position.x, hdz=p.g.position.z-h.g.position.z;
        const hr=h.radius*.92;
        if(hdx*hdx+hdz*hdz < hr*hr){
          if(p.party===h.party){
            if(h.isPlayer&&p.cool<=0){
              speak(p,cheerFor(h.party));p.cool=4.5;
              $('#status').textContent='Already '+h.party+'! Canvass undecided or rival voters.';
            }
            break;
          }
          if(h.capturing<h.capacity){capture(p,h);break;}
        }
      }
    }
  }
 }
}
function resetSupporters(h){
 for(const p of people){
  if(p.party===h.party){recolor(p,null);p.loyal=false;p.stubborn=false;p.attempts=0;if(p.badge)p.badge.visible=false;if(p.capTop)p.capTop.scale.setScalar(0);if(p.capBrim)p.capBrim.scale.setScalar(0)}
  if(p.owner===h&&p.state!=='walk'){const safe=nearestRoad(p.g.position.x,p.g.position.z,.65);p.g.position.set(safe.x,.13,safe.z);p.g.rotation.set(0,0,0);p.g.scale.setScalar(1);p.legs.forEach(l=>l.rotation.set(0,0,0));p.arms.forEach((a,i)=>a.pivot.rotation.set(0,0,i?.15:-.15));p.state='walk';p.anim=0;p.cool=3;p.owner=null;p.pause=.3;p.converted=!!p.party;chooseTarget(p)}
 }
 h.capturing=0;h.busy=false;h.target=null;h.prey=null;h.route=[];h.capacity=1;crowdColorsDirty=true;
}
function swallowHole(winner,loser){
 if(!canSwallowHole(winner,loser,elapsed))return false;
 loser.mode='swallowing';loser.eatenBy=winner;loser.defeatTime=0;loser.defeatFrom=loser.g.position.clone();resetSupporters(loser);
 if(loser.isPlayer){pointerTarget=null;player.route=[];$('#status').textContent=winner.party+' swallowed your campaign! All voters lost! Rebuild fast & swallow them!';toast('⚠️ '+winner.party+' SWALLOWED YOUR CAMPAIGN! All voters reset to 0! Rally fast to grow bigger & take revenge!');music.cue('lose')}
 else if(winner.isPlayer){toast('🏆 VICTORY SWALLOW! You swallowed '+loser.party+' and wiped out their campaign!');music.cue('win')}
 burst(loser.g.position.x,loser.g.position.z,PARTIES[winner.party].color);updateUI();return true;
}
function respawnHole(h){
 const spots=VERTICAL.flatMap(x=>[-74,-45,-20,8,43].map(z=>({x,z})));const active=holes.filter(other=>other!==h&&other.mode==='active');
 const clearance=p=>active.length?Math.min(...active.map(other=>Math.hypot(p.x-other.g.position.x,p.z-other.g.position.z))):100;
 spots.sort((a,b)=>clearance(b)-clearance(a));const spot=spots[0];h.g.position.set(spot.x,.062,spot.z);h.g.scale.setScalar(1);h.g.visible=true;h.mode='active';h.radius=holeLevel(0).radius;h.capacity=1;h.capturing=0;h.busy=false;h.shieldUntil=elapsed+5;h.repath=0;h.wait=0;h.eatenBy=null;h.target=null;h.route=[];
 if(h.isPlayer){pointerTarget=null;$('#status').textContent='Back in! 5-second shield. Build your voters again.';toast('Fresh rally · 5 seconds of protection')}
}
function updateHoleBattles(dt){
 for(const h of holes){if(h.mode==='active')continue;h.defeatTime+=dt;if(h.defeatTime<.7){const a=h.defeatTime/.7;h.g.position.lerpVectors(h.defeatFrom,h.eatenBy.g.position,a);h.g.scale.setScalar(Math.max(.015,1-a));h.g.position.y=.062-.45*a}else{h.mode='respawning';h.g.visible=false}if(h.defeatTime>=2.2)respawnHole(h)}
 const candidates=holes.slice().sort((a,b)=>b.radius-a.radius);for(const big of candidates)for(const small of candidates)if(canSwallowHole(big,small,elapsed))swallowHole(big,small);
}

function findBestTarget(h){
  let best=null, minDistSq=Infinity;
  const hx=h.g.position.x, hz=h.g.position.z;
  for(let i=0; i<people.length; i++){
    const p=people[i];
    if(p.party===h.party||p.state!=='walk'||p.cool>0||p.loyal)continue;
    const dx=p.g.position.x-hx, dz=p.g.position.z-hz, dSq=dx*dx+dz*dz;
    if(dSq<minDistSq){minDistSq=dSq;best=p}
  }
  return best;
}

function findBestPrey(h, huntRange){
  let best=null, minDistSq=huntRange*huntRange;
  const hx=h.g.position.x, hz=h.g.position.z;
  for(let i=0; i<holes.length; i++){
    const other=holes[i];
    if(other===h||!canHuntHole(h,other,elapsed))continue;
    const dx=other.g.position.x-hx, dz=other.g.position.z-hz, dSq=dx*dx+dz*dz;
    if(dSq<minDistSq){minDistSq=dSq;best=other}
  }
  return best;
}

function moveHoles(dt){
 let vx=0,vz=0;const dx=(pressed.has('d')||pressed.has('arrowright')?1:0)-(pressed.has('a')||pressed.has('arrowleft')?1:0)+stickInput.x,dy=(pressed.has('s')||pressed.has('arrowdown')?1:0)-(pressed.has('w')||pressed.has('arrowup')?1:0)+stickInput.y;
 if(Math.hypot(dx,dy)>.08){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0);right.y=0;right.normalize();const down=new THREE.Vector3().crossVectors(right,new THREE.Vector3(0,1,0));vx=right.x*dx+down.x*dy;vz=right.z*dx+down.z*dy;pointerTarget=null;player.route=[]}else if(pointerTarget&&player.route.length){const target=player.route[0];vx=target.x-player.g.position.x;vz=target.z-player.g.position.z;if(vx*vx+vz*vz<.0324){player.route.shift();if(!player.route.length)pointerTarget=null;vx=vz=0}}
 const len=Math.hypot(vx,vz);if(len>0&&player.mode==='active'){player.mapAngle=Math.atan2(vx,vz);moveOnRoad(player.g.position,vx/len*8.5*dt*Math.min(1,len),vz/len*8.5*dt*Math.min(1,len),player.radius+.12);}
 const diff=getWardDifficulty(ward);
 for(let hi=0; hi<holes.length; hi++){
  const h=holes[hi];
  if(h.mode!=='active')continue;
  h.ring.material.color.set(elapsed<h.shieldUntil?0xffffff:PARTIES[h.party].color);h.sign.material.opacity=elapsed<h.shieldUntil?.65+Math.sin(elapsed*9)*.3:1;h.logo.material.opacity=THREE.MathUtils.lerp(h.logo.material.opacity,h.busy?0:1,Math.min(1,dt*16));h.ring.scale.setScalar(h.radius/1.075*(1+Math.sin(elapsed*(h.busy?14:3))*(h.busy?.045:.018)));h.glow.material.opacity=.6+Math.sin(elapsed*2)*.13;
  if(h.isPlayer)continue;
  if(player&&player.mode==='active'&&elapsed>h.shieldUntil&&elapsed>player.shieldUntil&&h.radius>=player.radius*1.15){
    const hPlayerDx=h.g.position.x-player.g.position.x, hPlayerDz=h.g.position.z-player.g.position.z;
    if(hPlayerDx*hPlayerDx+hPlayerDz*hPlayerDz<324&&elapsed>(h.lastWarnTime||0)+8){
      h.lastWarnTime=elapsed;toast('⚠️ DANGER: '+h.party+' is BIGGER than you! Evade them or they will swallow your voters!')
    }
  }
  h.wait-=dt;h.repath-=dt;
  const huntRange=18+Math.max(0,h.radius-1.075)*38;
  const prey=(h.prey&&canHuntHole(h,h.prey,elapsed)&&h.g.position.distanceToSquared(h.prey.g.position)<(huntRange*1.3)**2)
    ? h.prey
    : findBestPrey(h, huntRange);
  if(h.prey!==prey){h.prey=prey;h.repath=0;h.target=null}
  if(prey){
    const chaseSpeed=Math.min(5.2,(2.4+(h.radius-1.075)*1.6)*diff.chaseMult);
    if(h.repath<=0){h.route=routeBetween(h.g.position,prey.g.position);h.repath=Math.max(0.2,diff.repathInterval*0.6)}
    const next=h.route[0];
    if(next){
      const dx=next.x-h.g.position.x,dz=next.z-h.g.position.z,dSq=dx*dx+dz*dz;
      if(dSq<.04)h.route.shift();
      else{const d=Math.sqrt(dSq);moveOnRoad(h.g.position,dx/d*chaseSpeed*dt,dz/d*chaseSpeed*dt,h.radius+.12)}
    }
    continue;
  }
  if(!h.target||h.target.party===h.party||h.target.state!=='walk'||h.target.cool>0||h.target.loyal){
    h.target=findBestTarget(h);h.repath=0;if(!h.target)continue;
  }
  if(h.repath<=0){h.route=routeBetween(h.g.position,h.target.g.position);h.repath=diff.repathInterval}
  if(!h.route.length)continue;
  const target=h.route[0],dx=target.x-h.g.position.x,dz=target.z-h.g.position.z,dSq=dx*dx+dz*dz;
  if(dSq<.04)h.route.shift();
  else{const d=Math.sqrt(dSq);moveOnRoad(h.g.position,dx/d*diff.canvassSpeed*dt,dz/d*diff.canvassSpeed*dt,h.radius+.12);}
 }
 updateHoleBattles(dt);syncHoles();
}

let qualityScale=1,perfAcc=0,perfN=0,perfCool=0;
function resize(){
  frameMountain();
  renderer.setSize(innerWidth,innerHeight);
  const maxDpr=MOBILE?1.0:1.5;
  const dpr=Math.min(window.devicePixelRatio||1,maxDpr)*qualityScale;
  renderer.setPixelRatio(dpr);
  camera.aspect=innerWidth/innerHeight;
  camera.fov=innerWidth<701?50:47;
  camera.updateProjectionMatrix();
}
const cameraTarget=new THREE.Vector3(),camGoal=new THREE.Vector3();
function updateCamera(dt){const mobile=innerWidth<701;const z=state==='start'?WARDS[ward].z-3:player.g.position.z,x=state==='start'?WARDS[ward].x+(mobile?0:-3):player.g.position.x;camGoal.set(x,0,z);cameraTarget.lerp(camGoal,Math.min(1,dt*3));camera.position.set(cameraTarget.x+(mobile?5:9),12.5,cameraTarget.z+(mobile?24:26));camera.lookAt(cameraTarget.x,1,cameraTarget.z-10);camera.updateMatrixWorld();shadowLight.position.set(cameraTarget.x-24,34,cameraTarget.z+18);shadowLight.target.position.set(cameraTarget.x,0,cameraTarget.z-5);shadowLight.target.updateMatrixWorld()}
function animate(ms){requestAnimationFrame(animate);if(document.hidden)return;if((state==='paused'||state==='ended')&&ms-renderClock<150)return;renderClock=ms;const raw=(ms-lastTime)/1000,dt=Math.min(raw,.05)||.016;lastTime=ms;frame++;if(state==='playing'||state==='start'){perfAcc+=raw;perfN++;if(perfN>=40){const avg=perfAcc/perfN;perfAcc=0;perfN=0;if(perfCool>0)perfCool--;else if(avg>.026&&qualityScale>.6){qualityScale=Math.max(.6,qualityScale-.15);perfCool=3;resize()}else if(avg<.0185&&qualityScale<1){qualityScale=Math.min(1,qualityScale+.1);perfCool=6;resize()}}}
 wind.value=ms*.001;waterTime.value=ms*.001;music.tick(state==='playing',ward);if(state!=='paused')for(const item of surf){item.wave.position.x=item.x+Math.sin(ms*.0007+item.phase)*1.1;item.wave.material.opacity=.32+Math.sin(ms*.0007+item.phase)*.2}
 if(state==='playing'){remaining=Math.max(0,remaining-Math.min(raw||dt,.5));elapsed+=dt;moveHoles(dt);updatePeople(dt,ms/1000,true);updateCrises(dt,ms);uiTime+=dt;if(uiTime>.2){uiTime=0;updateUI();drawMap()}}
 else if(state==='start')updatePeople(dt,ms/1000,false);
 if(state!=='paused'&&state!=='ended'){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=4*dt;p.m.position.addScaledVector(p.v,dt);p.m.scale.setScalar(Math.max(0,p.life));if(p.life<=0){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();particles.splice(i,1)}}updateCamera(dt)}if(state==='playing'||state==='start')updateCrowd();positionSpeech();renderer.render(scene,camera)
}

function pointFromEvent(e){const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);if(raycaster.ray.intersectPlane(groundPlane,clockPoint))pointerTarget=clockPoint.clone();if(pointerTarget)player.route=routeBetween(player.g.position,nearestRoad(pointerTarget.x,pointerTarget.z,player.radius+.12))}
$('#hunt-rival').addEventListener('click',huntRival);$('#map').addEventListener('pointerdown',e=>{e.stopPropagation();mapNavigate(e)});
$('#party-select').innerHTML=keys.map(p=>'<button data-party="'+p+'" style="--p:'+PARTIES[p].hex+'" class="party '+(p===selected?'selected':'')+'" aria-pressed="'+(p===selected)+'"><img class="party-logo" src="'+logoFiles[p]+'" alt="'+p+' logo"><strong>'+p+'</strong><span>'+PARTIES[p].name+'</span></button>').join('');
$('#party-select').addEventListener('pointerover',e=>{if(e.target.closest('[data-party]'))uiHoverSound();});
$('#party-select').addEventListener('click',e=>{const b=e.target.closest('[data-party]');if(!b)return;uiSelectSound();selected=b.dataset.party;document.documentElement.style.setProperty('--accent',PARTIES[selected].hex);document.documentElement.style.setProperty('--party','#'+PARTIES[selected].color.toString(16).padStart(6,'0'));document.querySelectorAll('[data-party]').forEach(btn=>{btn.classList.toggle('selected',btn===b);btn.setAttribute('aria-pressed',String(btn===b))});if(state==='start'){resetWorld();updateUI()}});
$('#ward-select').addEventListener('pointerover',e=>{if(e.target.closest('[data-ward]'))uiHoverSound();});
$('#ward-select').addEventListener('click',e=>{const b=e.target.closest('[data-ward]');if(!b)return;uiSelectSound();ward=Number(b.dataset.ward);document.querySelectorAll('[data-ward]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.ward)===ward)));if($('#start-target-label'))$('#start-target-label').innerHTML='<b>1:00</b> ROUND';if($('#start-diff-tag'))$('#start-diff-tag').innerHTML='<b>'+(WARDS[ward]?.diff||'MEDIUM')+'</b>';resetWorld()});$('#next-ward').addEventListener('click',advanceWard);$('#retry-ward')?.addEventListener('click',()=>{stopConfetti();$('#modal').hidden=true;start()});
$('#play').addEventListener('pointerover',()=>uiHoverSound());
$('#play').addEventListener('click',()=>{uiSelectSound();start();});$('#pause').addEventListener('click',()=>{if(state==='playing')pause();else if(state==='paused')resumeGame()});$('#resume').addEventListener('click',resumeGame);$('#restart').addEventListener('click',()=>{state='start';$('#game').classList.remove('playing');$('#modal').hidden=true;$('#hud').hidden=true;$('#pause').hidden=true;$('#sound').hidden=true;$('#start').hidden=false;$('#start').style.display='';$('#location').hidden=false;resetWorld()});$('#boost').addEventListener('click',rally);$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound .off-line').hidden=sound;$('#sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');music.enable(sound).then(ok=>{sound=ok;$('#sound .off-line').hidden=sound})});$('#close-rival-alert')?.addEventListener('click',()=>{const a=$('#rival-alert');a.classList.remove('visible');clearTimeout(a.dismissTimer);setTimeout(()=>{a.hidden=true},250)});
$('#toggle-standings')?.addEventListener('click',e=>{e.stopPropagation();const b=$('.leaderboard');b.classList.toggle('collapsed');$('#toggle-standings').textContent=b.classList.contains('collapsed')?'🏆':'▾'});
$('.leaderboard')?.addEventListener('click',()=>{const b=$('.leaderboard');if(b.classList.contains('collapsed')){b.classList.remove('collapsed');$('#toggle-standings').textContent='▾'}});
$('#toggle-map')?.addEventListener('click',e=>{e.stopPropagation();const m=$('.neighbourhood-map');m.classList.toggle('collapsed');$('#toggle-map').textContent=m.classList.contains('collapsed')?'🗺️':'▾'});
$('.neighbourhood-map')?.addEventListener('click',()=>{const m=$('.neighbourhood-map');if(m.classList.contains('collapsed')){m.classList.remove('collapsed');$('#toggle-map').textContent='▾'}});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)&&state==='playing'){e.preventDefault();pressed.add(k);if(k===' ')rally()}if(k==='escape'){if(state==='playing')pause();else if(state==='paused')$('#resume').click()}});window.addEventListener('keyup',e=>pressed.delete(e.key.toLowerCase()));window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
const joy=$('#joystick');let joyId=null;function stickMove(e){if(e.pointerId!==joyId)return;const r=joy.getBoundingClientRect(),max=r.width*.38;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y);if(d>max){x=x/d*max;y=y/d*max;d=max}const norm=d/max;const speedMult=norm<0.08?0:Math.min(1,(norm-0.08)/0.5);stickInput={x:d>0?(x/d)*speedMult:0,y:d>0?(y/d)*speedMult:0};$('#stick').style.transform=`translate(${x}px,${y}px)`;pointerTarget=null}joy.addEventListener('pointerdown',e=>{if(state!=='playing')return;joyId=e.pointerId;joy.setPointerCapture(joyId);stickMove(e)});joy.addEventListener('pointermove',stickMove);function stickEnd(){joyId=null;stickInput={x:0,y:0};$('#stick').style.transform=''}joy.addEventListener('pointerup',stickEnd);joy.addEventListener('pointercancel',stickEnd);
let envMapTexture=null;
function setupRealism(rend,scn){
 if(!rend||!scn||MOBILE)return;
 if(!envMapTexture){
  try{
   const pmrem=new THREE.PMREMGenerator(rend);pmrem.compileEquirectangularShader();
   const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');
   const grad=ctx.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#1a508b');grad.addColorStop(.35,'#4a8bc6');grad.addColorStop(.48,'#a2ccee');grad.addColorStop(.50,'#dbebf7');grad.addColorStop(.53,'#6f573d');grad.addColorStop(1,'#2d2014');
   ctx.fillStyle=grad;ctx.fillRect(0,0,1024,512);
   const sunGrad=ctx.createRadialGradient(280,130,0,280,130,160);sunGrad.addColorStop(0,'rgba(255,255,255,1)');sunGrad.addColorStop(.12,'rgba(255,250,220,.9)');sunGrad.addColorStop(.35,'rgba(255,225,170,.45)');sunGrad.addColorStop(1,'rgba(255,220,160,0)');
   ctx.fillStyle=sunGrad;ctx.fillRect(0,0,1024,512);
   const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const rt=pmrem.fromEquirectangular(tex);envMapTexture=rt.texture;tex.dispose();pmrem.dispose();
  }catch(err){console.warn('Realism env map error:',err)}
 }
 if(envMapTexture)scn.environment=envMapTexture;
}
try{scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,400);renderer=new THREE.WebGLRenderer({canvas:$('#scene'),antialias:!MOBILE,powerPreference:'high-performance',stencil:false});renderer.shadowMap.enabled=true;renderer.shadowMap.type=MOBILE?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;setupRealism(renderer,scene);resetWorld();resize();cameraTarget.set(0,0,1);updateCamera(1);$('#play').disabled=false;$('#play').textContent='START CANVASSING  ›';requestAnimationFrame(animate);renderer.domElement.style.touchAction='none';renderer.domElement.addEventListener('pointerdown',e=>{if(state!=='playing')return;dragging=true;renderer.domElement.setPointerCapture(e.pointerId);pointFromEvent(e)});renderer.domElement.addEventListener('pointermove',e=>{if(dragging&&state==='playing')pointFromEvent(e)});renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);window.addEventListener('resize',resize);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('#error').hidden=false;$('#error').textContent='The 3D view was interrupted. Reload this page to return to the street.'});
 // A read-only snapshot helps verify the actual game state in browser QA.
 window.finish=finish;window.start=start;window.pause=pause;window.resumeGame=resumeGame;window.fireConfetti=fireConfetti;window.capturePerson=(i)=>capture(people[i],player);window.findNeutralPerson=()=>people.findIndex(p=>!p.party&&!p.loyal&&p.state==='walk');
  window.voterStreetSnapshot=()=>({state,ward,selected,activeKeys,wardWins,sound,remaining,elapsed,scores:scores(),player:{x:player.g.position.x,z:player.g.position.z,radius:player.radius,capacity:player.capacity,capturing:player.capturing,mode:player.mode,shieldUntil:player.shieldUntil},street:streetName(player.g.position.x,player.g.position.z),people:people.map(p=>({party:p.party,loyal:p.loyal,state:p.state,x:p.g.position.x,z:p.g.position.z})),drawCalls:renderer.info.render.calls});
}catch(error){console.error(error);$('#error').hidden=false;$('#error').textContent='This game needs WebGL to show the 3D neighbourhood. Please open it in a recent Chrome, Edge, Safari, or Firefox browser with graphics acceleration enabled.';$('#play').textContent='3D graphics unavailable'}




