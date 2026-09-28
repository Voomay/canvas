// Lightweight, reusable neighbourhood kit inspired by the supplied Khayelitsha references.
// The same road coordinates drive the game navigation and this rendered surface.
export function buildKhayelitsha(api){
 const {THREE,scene,box,sphere,cylinder,mesh,label,tree,plant,taxi,streetLamp,communityField,partyPosters,batchScenery,cutMaterial,VERTICAL,HORIZONTAL,ward}=api;
 const siteC=ward===87;let seed=siteC?8771:1819;
 const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const palette=[0x258d91,0xc9a345,0xa55e3c,0x648477,0x477e9d,0xc48c6c];
 const materials=[],geometries=[];
 function surface(kind,color){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#'+color.toString(16).padStart(6,'0');c.fillRect(0,0,128,128);
  if(kind==='metal'){for(let x=0;x<128;x+=8){c.fillStyle='#ffffff35';c.fillRect(x,0,2,128);c.fillStyle='#182a2a55';c.fillRect(x+3,0,2,128)}for(let i=0;i<28;i++){c.fillStyle=i%2?'#9a472b66':'#d0804755';c.fillRect(rand()*128,rand()*128,1+rand()*5,4+rand()*25)}}
  else if(kind==='brick'){c.strokeStyle='#d3c0a9';c.lineWidth=1.3;for(let y=0;y<128;y+=12){c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke();for(let x=(y/12)%2?0:12;x<128;x+=24){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+12);c.stroke()}}}
  else{for(let y=0;y<128;y+=16){c.fillStyle='#182b3040';c.fillRect(0,y,128,2)}for(let i=0;i<50;i++){c.fillStyle='#c1b49545';c.fillRect(rand()*128,rand()*128,rand()*20,1)}}
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const isMetal=kind==='metal';const m=new THREE.MeshStandardMaterial({map:t,roughness:isMetal?.38:kind==='wood'?.72:.88,metalness:isMetal?.72:.04,color:0xffffff});materials.push(m);return m;
 }
 const walls=palette.map((color,i)=>surface(i===2?'brick':i===4?'wood':'metal',color));
 const roof=surface('metal',0x9cabae),rustRoof=surface('metal',0x98735c),fence=surface('metal',0x9ba19a);
 const unitBox=new THREE.BoxGeometry(1,1,1);geometries.push(unitBox);
 function block(w,h,d,mat,x,y,z,parent){const m=mesh(unitBox,mat,parent);m.scale.set(w,h,d);m.position.set(x,y,z);return m}
 function windowUnit(x,y,z,parent){block(.9,.88,.09,0xc8ccc2,x,y,z,parent);block(.72,.7,.11,0x263f4c,x,y,z+.035,parent);block(.035,.74,.14,0xd7d5c3,x,y,z+.07,parent);block(.77,.035,.14,0xd7d5c3,x,y,z+.075,parent);for(const dx of [-.23,.23])block(.025,.76,.15,0x677674,x+dx,y,z+.09,parent)}
 function roofUnit(parent,w,d,height,rust=false){const half=w/2+.23,rise=.48,angle=Math.atan2(rise,half),span=Math.hypot(half,rise);for(const side of [-1,1]){const panel=block(span,.09,d+.55,rust?rustRoof:roof,side*half/2,height+rise/2,0,parent);panel.rotation.z=-side*angle;}block(.1,.1,d+.58,0x7c898b,0,height+rise+.02,0,parent);for(const side of [-1,1])block(.09,.13,d+.58,0x625342,side*half,height-.01,0,parent)}
 function tank(parent,x,z){cylinder(.49,.49,1.7,0x235f4c,x,.93,z,parent,12);cylinder(.38,.49,.19,0x2b725b,x,1.85,z,parent,12);for(const y of [.3,.65,1,1.35,1.65])cylinder(.505,.505,.055,0x42806a,x,y,z,parent,12);block(.12,.3,.12,0x273f3b,x,.2,z+.5,parent)}
 function fenceRun(parent,x,z,length,side=false){const panel=block(length,.9,.07,fence,x,.67,z,parent);if(side)panel.rotation.y=Math.PI/2;for(const p of [-1,1])block(.085,1.2,.085,0x765b3d,x+(side?0:p*length/2),.65,z+(side?p*length/2:0),parent)}
 function washing(parent){for(const x of [-1.5,1.5])block(.055,1.85,.055,0x685540,x,1,-2.8,parent);block(3,.022,.022,0x4d5551,0,1.85,-2.8,parent);for(let i=0;i<5;i++){const shirt=block(.43,.55,.025,[0xe7dfc9,0xd57853,0x4b9db2,0xddb851,0xe8e3d4][i],-1.16+i*.57,1.54,-2.8,parent);shirt.rotation.z=(i%2?1:-1)*.06}}
 function home(x,z,index,side){const g=new THREE.Group();g.name='khayelitsha-home-'+index;g.userData.homeType=index%6;scene.add(g);g.position.set(x,0,z);g.rotation.y=-side*Math.PI/2;
  const w=4.4,d=3.8,h=index%3===0?2.4:2.65;block(6.6,.07,8.2,0xbda780,0,.02,0,g);block(w+.16,.24,d+.15,0x8d8a78,0,.2,0,g);block(w,h,d,walls[index%6],0,h/2+.25,0,g);roofUnit(g,w,d,h+.28,index%3===0);
  block(.93,1.94,.1,0xd8c9a3,-.58,1.21,d/2+.055,g);block(.78,1.82,.13,0x71523c,-.58,1.16,d/2+.1,g);for(let a=-.83;a<-.25;a+=.14)block(.019,1.78,.14,0x4e4236,a,1.16,d/2+.105,g);sphere(.035,0xd1af63,-.3,1.2,2.02,g);
  windowUnit(1.14,1.64,1.94,g);const sideWindow=new THREE.Group();sideWindow.position.set(-2.24,0,0);sideWindow.rotation.y=-Math.PI/2;g.add(sideWindow);windowUnit(0,1.62,0,sideWindow);
  block(1.22,.16,.8,0xa7a293,-.58,.23,2.2,g);block(1.4,.12,.4,0xa7a293,-.58,.13,2.7,g);
  const awning=block(1.62,.075,1.2,index%2?roof:rustRoof,-.55,2.35,2.35,g);awning.rotation.x=.1;
  if(index%3===1){for(const px of [-1.29,.21])block(.065,2.3,.065,0x826242,px,1.15,2.85,g)}
  if(index%4===0){const extension=block(1.55,1.8,2.1,fence,2.35,1.1,-.6,g);block(1.8,.1,2.4,roof,2.35,2.04,-.6,g);block(.6,1.45,.1,0x69553c,2.35,.91,.49,g)}
  fenceRun(g,-2.22,3.85,2);fenceRun(g,2.05,3.85,2.25);fenceRun(g,-3.25,0,7.7,true);fenceRun(g,3.25,0,7.7,true);
  for(const px of [-1.11,-.82,-.53,-.24,.05,.34,.63])block(.04,.87,.045,0x675b47,px,.61,3.85,g);block(1.82,.045,.05,0x675b47,-.24,.94,3.85,g);
  if(index%2===0)tank(g,2.3,2.7);else washing(g);
  if(index%3===0){const dishGeo=new THREE.SphereGeometry(.32,10,6,0,Math.PI*2,0,.65);geometries.push(dishGeo);const dish=mesh(dishGeo,0xddddca,g);dish.position.set(1.3,h+.55,-1);dish.rotation.x=-.4;block(.035,.7,.035,0x61675e,1.3,h+.3,-1,g)}
  for(const px of [-2.3,1.8]){cylinder(.18,.13,.3,0x9c6441,px,.23,3.13,g,8);sphere(.25,0x658441,px,.61,3.13,g)}
  return g;
 }
 // Reuse the navigation grid so the roads, taps, minimap, and AI stay aligned.
 scene.background=new THREE.Color(0x93c9e4);
 scene.fog=new THREE.Fog(0x9ac5e2,120,360);
 const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=256;const gctx=groundCanvas.getContext('2d');gctx.fillStyle='#b8a688';gctx.fillRect(0,0,256,256);for(let i=0;i<12000;i++){const v=Math.floor(130+Math.random()*85);gctx.fillStyle=`rgba(${v},${Math.floor(v*.92)},${Math.floor(v*.75)},.16)`;gctx.fillRect(Math.random()*256,Math.random()*256,1.5,1.5)}const groundTex=new THREE.CanvasTexture(groundCanvas);groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(24,24);groundTex.colorSpace=THREE.SRGBColorSpace;const ground=cutMaterial(0xffffff,groundTex,.92,.02);
 const roadCanvas=document.createElement('canvas');roadCanvas.width=roadCanvas.height=512;const rctx=roadCanvas.getContext('2d');rctx.fillStyle='#464c50';rctx.fillRect(0,0,512,512);for(let i=0;i<35000;i++){const v=Math.floor(70+Math.random()*140);rctx.fillStyle=`rgba(${v},${v},${v},.16)`;rctx.fillRect(Math.random()*512,Math.random()*512,1.2,1.2)}rctx.fillStyle='rgba(22,26,28,.14)';rctx.fillRect(70,0,110,512);rctx.fillRect(330,0,110,512);const roadTex=new THREE.CanvasTexture(roadCanvas);roadTex.wrapS=roadTex.wrapT=THREE.RepeatWrapping;roadTex.repeat.set(3,16);roadTex.colorSpace=THREE.SRGBColorSpace;const road=cutMaterial(0xffffff,roadTex,.78,.12),paint=cutMaterial(0xe2dfce,null,.85,.05),paving=0xc2b7a2;
 const vastGround=box(700,.4,700,ground,0,-.32,-15);vastGround.receiveShadow=true;
 box(94,.2,150,ground,0,-.22,-15);
 for(const x of VERTICAL){box(8.4,.1,136,road,x,-.005,-15);for(let z=-82;z<53;z+=1.3){if(HORIZONTAL.some(v=>Math.abs(z-v)<5.4)||((x===0||x===24)&&z>-55&&z<-47))continue;for(const side of [-1,1]){box(1.8,.18,1.26,paving,x+side*5.2,.11,z);box(.16,.25,1.26,0xd9cfb7,x+side*4.31,.14,z)}}for(let z=-81;z<52;z+=4){if(HORIZONTAL.some(v=>Math.abs(z-v)<6))continue;box(.13,.012,1.65,paint,x,.057,z)}}
 for(const z of HORIZONTAL){box(62,.1,8.4,road,0,.002,z);for(let x=-30;x<31;x+=1.3){if(VERTICAL.some(v=>Math.abs(x-v)<5.4))continue;for(const side of [-1,1])box(1.26,.18,1.8,paving,x,.11,z+side*5.2)}for(let x=-29;x<30;x+=4){if(VERTICAL.some(v=>Math.abs(x-v)<5.4))continue;box(1.65,.012,.13,paint,x,.06,z)}for(const x of VERTICAL)for(const side of [-1,1])for(let i=-3;i<=3;i++){box(.45,.012,1.15,paint,x+i,.063,z+side*5.45);box(1.15,.012,.45,paint,x+side*5.45,.063,z+i)}}
 let index=0;
 for(const roadX of VERTICAL)for(const side of [-1,1])for(const z of [-76,-50,-24,2,28,50]){if(z===-50&&((roadX===0&&side===1)||(roadX===24&&side===-1)))continue;home(roadX+side*9,z,index++,side);if(index%3===0)tree(roadX+side*9,z-6,.85)}
 if(siteC)for(const z of [-72,-46,-20,6,32,49])home(-40,z,index++,1);
 // Site C has denser corner stalls; Harare keeps an open market and exercise field.
 for(const [x,z,name] of [[8.8,-5,'SISONKE SPAZA'],[-32,-31,siteC?'SITE C MARKET':'KUYASA MARKET']]){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);block(4,2.45,3,siteC?walls[4]:walls[1],0,1.28,0,g);roofUnit(g,4,3,2.54,true);block(3.4,1.55,.08,0x233d3e,0,1.05,1.54,g);label(name,'#f1c953','#17414b',3.8,.5,g,0,2.35,1.59,45);const a=block(4.5,.08,1.3,0x427a65,0,2,2,g);a.rotation.x=.12;for(let i=0;i<6;i++){block(.4,.45,.4,[0xdab15b,0xb57843,0x88a14e][i%3],-1.4+i*.56,.35,2.5,g)}}
 for(const x of VERTICAL)for(const z of [-72,-21,31]){streetLamp(x-5.8,z);const pole=new THREE.Group();pole.position.set(x+5.9,0,z+5);scene.add(pole);block(.13,6,.13,0x6c5035,0,3,0,pole);block(1.8,.1,.13,0x66543b,0,5.6,0,pole);const pts=[];for(let i=0;i<=16;i++)pts.push(new THREE.Vector3(x+5.9,5.7-Math.sin(i/16*Math.PI)*.55,z+5+i/16*20));const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x3f423a}));scene.add(wire);geometries.push(wire.geometry);materials.push(wire.material)}
 // Drainage channel and pedestrian bridges sit outside the playable street boundary.
 box(3.2,.08,135,0x756a4c,39,-.05,-15);box(1.8,.035,135,new THREE.MeshStandardMaterial({color:0x657e73,roughness:.32,metalness:.1}),39,.012,-15);
 for(const z of [-64,-12,40]){for(let i=0;i<8;i++)box(3.8,.1,.24,0x998363,39,.2,z-1+i*.28);for(const x of [37.3,40.7])box(.07,.8,2.2,0x79674e,x,.58,z)}
 // Small surface damage and drain grates; playable repair crises are added by the game.
 const diskGeo=new THREE.CircleGeometry(1,12);geometries.push(diskGeo);for(const [x,z] of [[-1,-31],[25,22],[-25,-57],[1,34]]){const patch=mesh(diskGeo,cutMaterial(0x3f443f));patch.rotation.x=-Math.PI/2;patch.position.set(x,.062,z);patch.scale.set(.62,.43,1);for(let i=0;i<5;i++)box(.045,.02,.6,0x3e423e,x+Math.cos(i*1.3)*.58,.065,z+Math.sin(i*1.3)*.5)}
 for(const [x,z] of [[3.8,-29],[-27.8,18],[27.8,-62]]){box(.6,.018,.9,0x343b3b,x,.066,z);for(let i=0;i<5;i++)box(.48,.025,.045,0x85897c,x,.08,z-.34+i*.16)}
 communityField();partyPosters();taxi(-27,-4,0);taxi(3.5,21,Math.PI);batchScenery();
 scene.userData.khayelitsha={homes:index,variant:siteC?'Site C':'Harare & Kuyasa',roadTypes:['straight','T junction','four-way crossing'],materials,dispose(){for(const m of materials){m.map?.dispose();m.dispose()}for(const g of geometries)g.dispose()}};
}
