import * as THREE from './three.module.js';
export const logoFiles={PA:'./logos/PA.png',ANC:'./logos/ANC.png',DA:'./logos/DA.svg',EFF:'./logos/EFF.png',ActionSA:'./logos/ActionSA.png',NCC:'./logos/NCC.png','FF+':'./logos/FF.png',MK:'./logos/MK.png',GOOD:'./logos/GOOD.png',PMC:'./logos/PMC.png'};
const textures={};
export function logoTexture(party){if(textures[party])return textures[party];const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures[party]=texture;
 function paint(img){ctx.clearRect(0,0,512,512);ctx.fillStyle=party==='DA'?'#0874bd':party==='ActionSA'?'#ffffff':party==='EFF'?'#dc1420':party==='NCC'?'#0b0d0e':'#fffdf3';ctx.beginPath();ctx.arc(256,256,250,0,Math.PI*2);ctx.fill();if(img){const fit=Math.min(460/img.width,460/img.height);ctx.drawImage(img,(512-img.width*fit)/2,(512-img.height*fit)/2,img.width*fit,img.height*fit)}else{ctx.fillStyle=party==='DA'||party==='EFF'||party==='NCC'?'white':'#203a34';ctx.textAlign='center';ctx.font='bold 120px Arial';ctx.fillText(party,256,295)}texture.needsUpdate=true;}
 paint();const image=new Image();image.onload=()=>paint(image);image.onerror=()=>console.warn('Party logo could not load:',party);image.src=logoFiles[party];return texture;
}
