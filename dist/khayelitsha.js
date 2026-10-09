import {surfaceMat,stdMat,glassMat,scaledBox,corrugatedPanel,bx,cyl,sph,rng,gableGeo,makeShrub,createWater,groundMaps} from './realism.js';
// Lightweight, reusable neighbourhood kit inspired by the supplied Khayelitsha references.
// The same road coordinates drive the game navigation and this rendered surface.
export function buildKhayelitsha(api){
 const {THREE,scene,box,sphere,cylinder,mesh,label,tree,plant,taxi,streetLamp,communityField,partyPosters,batchScenery,cutMaterial,VERTICAL,HORIZONTAL,ward,buildPerimeterWalls}=api;
 const siteC=ward===87;let seed=siteC?8771:1819;
 const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const palette=[0x258d91,0xc9a345,0xa55e3c,0x648477,0x477e9d,0xc48c6c];
 const materials=[],geometries=[];
 const R=rng(siteC?8771:1819);
  const wallKinds=[['metal',0x258d91,.35],['metal',0xc9a345,.3],['brick',0xa55e3c],['metal',0x648477,.4],['wood',0x477e9d],['metal',0xc48c6c,.5]];
  const walls=wallKinds.map(([k,c,rust])=>surfaceMat(k,c,k==='metal'?{rust}:{}));
  const roof=surfaceMat('metal',0x9cabae,{rust:.2,double:true}),rustRoof=surfaceMat('metal',0x98735c,{rust:.9,rustColor:0x6b3318,double:true}),fence=surfaceMat('metal',0x9ba19a,{rust:.7});
  const dirt=surfaceMat('dirt',0xbda780),woodM=surfaceMat('wood',0x71523c),postM=surfaceMat('wood',0x765b3d),concrete=surfaceMat('plaster',0x9a978a),steel=stdMat(0x3a3f42,.5,.6),trim=stdMat(0xd8d3c0,.6),brass=stdMat(0xd1af63,.3,.9),curtain=stdMat(0xd8c9a8,.95);
  const tankM=stdMat(0x1f4a3b,.42,.05),tankRib=stdMat(0x2d6552,.5),rockM=stdMat(0x8a8780,.95),tireM=stdMat(0x1b1c1d,.9);
  const rockGeo=new THREE.IcosahedronGeometry(.17,1),tireGeo=new THREE.TorusGeometry(.27,.09,8,18);geometries.push(rockGeo,tireGeo);
  const unitBox=new THREE.BoxGeometry(1,1,1);geometries.push(unitBox);
  function block(w,h,d,mat,x,y,z,parent){const m=mesh(unitBox,mat,parent);m.scale.set(w,h,d);m.position.set(x,y,z);return m}
  const put=(geo,mat,x,y,z,parent,cast=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m};
  function windowUnit(x,y,z,parent){
   put(bx(.98,.96,.1),trim,x,y,z,parent);
   put(bx(.88,.86,.05),glassMat(),x,y,z+.045,parent,false);
   put(bx(.88,.86,.02),curtain,x,y,z+.015,parent,false);
   put(bx(.03,.82,.07),trim,x,y,z+.07,parent,false);put(bx(.84,.03,.07),trim,x,y,z+.07,parent,false);
   put(bx(1.16,.07,.2),concrete,x,y-.54,z+.07,parent);put(bx(1.1,.07,.09),trim,x,y+.54,z+.04,parent);
   for(let i=-2;i<=2;i++)put(bx(.016,.84,.02),steel,x+i*.17,y,z+.12,parent,false);
   for(const h of [-.26,.26])put(bx(.86,.018,.022),steel,x,y+h,z+.12,parent,false)}
  function gableFill(parent,w,d,y,rise,mat){for(const s of [-1,1]){const gm=put(gableGeo(w,rise,2.2),mat,0,y,s*(d/2+.003),parent);if(s<0)gm.rotation.y=Math.PI}}
  function roofUnit(parent,w,d,height,rust=false){
   const half=w/2+.23,rise=.48,angle=Math.atan2(rise,half),span=Math.hypot(half,rise);
   for(const side of [-1,1]){const panel=put(corrugatedPanel(span,d+.55,.1,.026),rust?rustRoof:roof,side*half/2,height+rise/2,0,parent);panel.rotation.z=-side*angle;
    put(bx(.05,.13,d+.58),postM,side*half,height-.03,0,parent);
    for(let k=0;k<3;k++){const px=side*(.35+R()*(half-.65)),pz=(R()-.5)*(d-.3),ry=height+rise*(1-Math.abs(px)/half)+.09;const rock=put(rockGeo,rockM,px,ry,pz,parent);rock.rotation.set(R()*3,R()*3,R()*3);rock.scale.set(1+R()*.7,.7+R()*.5,1+R()*.7)}
    if(rust&&side===1){const t=put(tireGeo,tireM,side*half*.55,height+rise*.45+.1,d*.18,parent);t.rotation.x=Math.PI/2;t.rotation.y=-side*angle}}
   put(cyl(.06,.06,d+.6,8),steel,0,height+rise+.04,0,parent).rotation.x=Math.PI/2}
  function tank(parent,x,z){
   put(bx(1.1,.1,1.1),concrete,x,.12,z,parent);for(const px of [-.4,.4])for(const pz of [-.4,.4])put(bx(.16,.3,.16),surfaceMat('brick',0xa66a50),x+px,.3,z+pz,parent);
   put(cyl(.5,.5,1.7,22),tankM,x,1.12,z,parent);put(cyl(.3,.5,.22,22),tankM,x,2.08,z,parent);put(cyl(.1,.12,.1,12),tankRib,x,2.24,z,parent);
   for(const y of [.55,.9,1.25,1.6])put(cyl(.512,.512,.05,22),tankRib,x,y,z,parent);
   put(cyl(.03,.03,.5,8),steel,x,.52,z+.58,parent).rotation.x=Math.PI/2;put(bx(.1,.1,.1),steel,x,.52,z+.5,parent)}
  function fenceRun(parent,x,z,length,side=false){const panel=put(scaledBox(length,.9,.07,1.6),fence,x,.67,z,parent);if(side)panel.rotation.y=Math.PI/2;for(const p of [-1,1])put(bx(.09,1.2,.09),postM,x+(side?0:p*length/2),.65,z+(side?p*length/2:0),parent)}
  function washing(parent){const pc=[0xe7dfc9,0xd57853,0x4b9db2,0xddb851,0xe8e3d4];for(const x of [-1.5,1.5])put(bx(.055,1.85,.055),postM,x,1,-2.8,parent);put(cyl(.008,.008,3,5),steel,0,1.84,-2.8,parent).rotation.z=Math.PI/2;for(let i=0;i<5;i++){const c=put(bx(.43,.55,.012),stdMat(pc[i],.95,0,{side:THREE.DoubleSide}),-1.16+i*.57,1.54,-2.8,parent);c.rotation.z=(i%2?1:-1)*.05}}
  function home(x,z,index,side){const g=new THREE.Group();g.name='khayelitsha-home-'+index;g.userData.homeType=index%6;scene.add(g);g.position.set(x,0,z);g.rotation.y=-side*Math.PI/2;
   const w=4.4,d=3.8,h=index%3===0?2.4:2.65,wallM=walls[index%6];
   put(scaledBox(6.6,.07,8.2,3),dirt,0,.02,0,g,false);put(scaledBox(w+.16,.24,d+.15,1.5),concrete,0,.2,0,g);
   put(scaledBox(w,h,d,2.2,true),wallM,0,h/2+.25,0,g);gableFill(g,w,d,h+.25,.5,wallM);
   for(const sx of [-1,1])for(const sz of [-1,1])put(bx(.09,h,.09),postM,sx*(w/2+.005),h/2+.25,sz*(d/2+.005),g);
   roofUnit(g,w,d,h+.28,index%3===0);
   put(bx(.98,1.98,.1),trim,-.58,1.22,d/2+.045,g);put(scaledBox(.8,1.84,.07,1),woodM,-.58,1.17,d/2+.1,g);put(bx(.5,.38,.03),woodM,-.58,1.55,d/2+.14,g);put(bx(.5,.38,.03),woodM,-.58,.85,d/2+.14,g);put(sph(.035,10,8),brass,-.3,1.2,d/2+.15,g);
   put(bx(.3,.38,.14),stdMat(0xd6d6cc,.6),-1.4,1.5,d/2+.07,g);put(cyl(.012,.012,.7,6),steel,-1.4,2.15,d/2+.05,g);
   windowUnit(1.14,1.64,d/2+.05,g);const sideWindow=new THREE.Group();sideWindow.position.set(-w/2,0,0);sideWindow.rotation.y=-Math.PI/2;g.add(sideWindow);windowUnit(0,1.62,.05,sideWindow);
   put(scaledBox(1.3,.18,.8,1.2),concrete,-.58,.23,d/2+.4,g);put(scaledBox(1.5,.12,.4,1.2),concrete,-.58,.13,d/2+.82,g);
   const awn=put(corrugatedPanel(1.2,1.7,.1,.024),index%2?roof:rustRoof,-.55,2.42,d/2+.62,g);awn.rotation.y=Math.PI/2;awn.rotation.z=.1;
   for(const px of [-1.35,.25])put(bx(.07,2.35,.07),postM,px,1.2,d/2+1.2,g);
   if(index%4===0){put(scaledBox(1.55,1.8,2.1,1.6),fence,w/2+.2,1.1,-.6,g);const er=put(corrugatedPanel(1.9,2.4,.1,.024),roof,w/2+.2,2.08,-.6,g);er.rotation.z=.08;put(bx(.6,1.45,.1),woodM,w/2+.2,.91,.49,g)}
   put(cyl(.07,.07,.9,10),steel,-w/2+.4,h+.95,-d/2+.8,g);put(cyl(.13,.04,.14,10),steel,-w/2+.4,h+1.45,-d/2+.8,g);
   fenceRun(g,-2.22,3.85,2);fenceRun(g,2.05,3.85,2.25);fenceRun(g,-3.25,0,7.7,true);fenceRun(g,3.25,0,7.7,true);
   for(const px of [-1.11,-.82,-.53,-.24,.05,.34,.63])put(bx(.045,.87,.045),postM,px,.61,3.85,g);put(bx(1.82,.045,.05),postM,-.24,.94,3.85,g);
   if(index%2===0)tank(g,2.3,2.7);else washing(g);
   if(index%3===0){const dishGeo=sph(.32,12,8);const dish=put(dishGeo,stdMat(0xddddca,.5,.3),1.3,h+.9,-1,g);dish.scale.set(1,.25,1);dish.rotation.x=-.9;put(cyl(.018,.018,.7,6),steel,1.3,h+.6,-1,g)}
   for(const px of [-2.3,1.8]){put(cyl(.2,.14,.32,12),surfaceMat('brick',0x9c6441),px,.25,3.13,g);const sh=makeShrub(index+(px>0?1:0));sh.position.set(px,.38,3.13);sh.scale.setScalar(.72);g.add(sh)}
   return g}
 // Reuse the navigation grid so the roads, taps, minimap, and AI stay aligned.
 scene.background=new THREE.Color(0x93c9e4);
 scene.fog=new THREE.Fog(0x9ac5e2,120,360);
 const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=256;const gctx=groundCanvas.getContext('2d');gctx.fillStyle='#b8a688';gctx.fillRect(0,0,256,256);for(let i=0;i<12000;i++){const v=Math.floor(130+Math.random()*85);gctx.fillStyle=`rgba(${v},${Math.floor(v*.92)},${Math.floor(v*.75)},.16)`;gctx.fillRect(Math.random()*256,Math.random()*256,1.5,1.5)}const groundTex=new THREE.CanvasTexture(groundCanvas);groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(24,24);groundTex.colorSpace=THREE.SRGBColorSpace;const gmaps=groundMaps(0xb8a688,[60,60],1819,.22),ground=cutMaterial(0xffffff,gmaps.map,.95,.02,gmaps.bump);
 const roadCanvas=document.createElement('canvas');roadCanvas.width=roadCanvas.height=512;const rctx=roadCanvas.getContext('2d');rctx.fillStyle='#464c50';rctx.fillRect(0,0,512,512);for(let i=0;i<35000;i++){const v=Math.floor(70+Math.random()*140);rctx.fillStyle=`rgba(${v},${v},${v},.16)`;rctx.fillRect(Math.random()*512,Math.random()*512,1.2,1.2)}rctx.fillStyle='rgba(22,26,28,.14)';rctx.fillRect(70,0,110,512);rctx.fillRect(330,0,110,512);const roadTex=new THREE.CanvasTexture(roadCanvas);roadTex.wrapS=roadTex.wrapT=THREE.RepeatWrapping;roadTex.repeat.set(3,16);roadTex.colorSpace=THREE.SRGBColorSpace;const road=cutMaterial(0xffffff,roadTex,.78,.12,roadTex),paint=cutMaterial(0xe2dfce,null,.85,.05),paving=0xc2b7a2;
 const vastGround=box(700,.4,700,ground,0,-.32,-15);vastGround.receiveShadow=true;
 for(const x of VERTICAL){box(8.4,.1,136,road,x,-.005,-15);for(let z=-82;z<53;z+=1.3){if(HORIZONTAL.some(v=>Math.abs(z-v)<5.4)||((x===0||x===24)&&z>-55&&z<-47))continue;for(const side of [-1,1]){box(1.8,.18,1.26,paving,x+side*5.2,.11,z);box(.16,.25,1.26,0xd9cfb7,x+side*4.31,.14,z)}}for(let z=-81;z<52;z+=4){if(HORIZONTAL.some(v=>Math.abs(z-v)<6))continue;box(.13,.012,1.65,paint,x,.057,z)}}
 for(const z of HORIZONTAL){box(62,.1,8.4,road,0,.002,z);for(let x=-30;x<31;x+=1.3){if(VERTICAL.some(v=>Math.abs(x-v)<5.4))continue;for(const side of [-1,1])box(1.26,.18,1.8,paving,x,.11,z+side*5.2)}for(let x=-29;x<30;x+=4){if(VERTICAL.some(v=>Math.abs(x-v)<5.4))continue;box(1.65,.012,.13,paint,x,.06,z)}for(const x of VERTICAL)for(const side of [-1,1])for(let i=-3;i<=3;i++){box(.45,.012,1.15,paint,x+i,.063,z+side*5.45);box(1.15,.012,.45,paint,x+side*5.45,.063,z+i)}}
 let index=0;
 for(const roadX of VERTICAL)for(const side of [-1,1])for(const z of [-76,-50,-24,2,28,50]){if(z===-50&&((roadX===0&&side===1)||(roadX===24&&side===-1)))continue;home(roadX+side*9,z,index++,side);if(index%3===0 && Math.abs(roadX+side*9) < 28 && z > -60 && z < 35)tree(roadX+side*9,z-6,.85)}
 if(siteC)for(const z of [-72,-46,-20,6,32,49])home(-40,z,index++,1);
 // Site C has denser corner stalls; Harare keeps an open market and exercise field.
 for(const [x,z,name] of [[8.8,-5,'SISONKE SPAZA'],[-32,-31,siteC?'SITE C MARKET':'KUYASA MARKET']]){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);put(scaledBox(4,2.45,3,2.2,true),siteC?walls[4]:walls[1],0,1.28,0,g);roofUnit(g,4,3,2.54,true);block(3.4,1.55,.08,0x233d3e,0,1.05,1.54,g);label(name,'#f1c953','#17414b',3.8,.5,g,0,2.35,1.59,45);const a=block(4.5,.08,1.3,0x427a65,0,2,2,g);a.rotation.x=.12;for(let i=0;i<6;i++){block(.4,.45,.4,[0xdab15b,0xb57843,0x88a14e][i%3],-1.4+i*.56,.35,2.5,g)}}
 for(const x of VERTICAL)for(const z of [-72,-21,31]){streetLamp(x-5.8,z);const pole=new THREE.Group();pole.position.set(x+5.9,0,z+5);scene.add(pole);block(.13,6,.13,0x6c5035,0,3,0,pole);block(1.8,.1,.13,0x66543b,0,5.6,0,pole);const pts=[];for(let i=0;i<=16;i++)pts.push(new THREE.Vector3(x+5.9,5.7-Math.sin(i/16*Math.PI)*.55,z+5+i/16*20));const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x3f423a}));scene.add(wire);geometries.push(wire.geometry);materials.push(wire.material)}
 // Drainage channel and pedestrian bridges sit outside the playable street boundary.
 box(3.2,.08,135,0x756a4c,39,-.05,-15);{const canal=createWater({width:2.5,depth:135,x:39,y:.014,z:-15,mode:'channel',deep:0x445f50,shallow:0x6a8566,flow:[0,1],opacity:.84,segX:2,segZ:110});scene.add(canal);geometries.push(canal.geometry)}
 for(const z of [-64,-12,40]){for(let i=0;i<8;i++)box(3.8,.1,.24,0x998363,39,.2,z-1+i*.28);for(const x of [37.3,40.7])box(.07,.8,2.2,0x79674e,x,.58,z)}
 // Small surface damage and drain grates; playable repair crises are added by the game.
 const diskGeo=new THREE.CircleGeometry(1,12);geometries.push(diskGeo);for(const [x,z] of [[-1,-31],[25,22],[-25,-57],[1,34]]){const patch=mesh(diskGeo,cutMaterial(0x3f443f));patch.rotation.x=-Math.PI/2;patch.position.set(x,.062,z);patch.scale.set(.62,.43,1);for(let i=0;i<5;i++)box(.045,.02,.6,0x3e423e,x+Math.cos(i*1.3)*.58,.065,z+Math.sin(i*1.3)*.5)}
 for(const [x,z] of [[3.8,-29],[-27.8,18],[27.8,-62]]){box(.6,.018,.9,0x343b3b,x,.066,z);for(let i=0;i<5;i++)box(.48,.025,.045,0x85897c,x,.08,z-.34+i*.16)}
 communityField();partyPosters();taxi(-27,-4,0);taxi(3.5,21,Math.PI);
 if(buildPerimeterWalls)buildPerimeterWalls(false,true);
 batchScenery();
 scene.userData.khayelitsha={homes:index,variant:siteC?'Site C':'Harare & Kuyasa',roadTypes:['straight','T junction','four-way crossing'],materials,dispose(){for(const m of materials){m.map?.dispose();m.dispose()}for(const g of geometries)g.dispose()}};
}
