import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// All visual assets are procedural. One shared cube, batched by material.
const palette = {
  stone:['#bdc1ac','#cbd0ba','#a9b09a','#d5d6c2'],
  paving:['#d0cfb6','#c5c6af','#dad8c1','#bdbfa9'],
  wood:['#543c2b','#634330','#78523a'],
  red:['#a44332','#b74d37','#913a2f','#c05a3f'],
  jade:['#33695c','#3e7867','#4c8973','#286052','#5b927a'],
  gold:['#c89746','#dbaa51','#bc853d','#e1b962'],
  leaf:['#4b7051','#587e56','#67865a','#78935e','#3d6248'],
  grass:['#889963','#8d9e6a','#96a575','#7d925b'],
  pink:['#d19a90','#e3b4a5','#c68783'],
  water:['#639b95','#70aaa2','#81b7aa'],
};
let seed=713;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function pick(colors){return colors[Math.floor(random()*colors.length)];}
const batches = new Map();
function box(x,y,z,w,h,d,color,kind='solid'){
  if(!batches.has(kind))batches.set(kind,[]);
  batches.get(kind).push({x,y,z,w,h,d,color});
}
function vox(x,y,z,color,size=.7){box(x,y,z,size,size,size,color);}
function tiles(x,z,w,d,y=.13,step=1.8){
  for(let a=-w/2+step/2;a<w/2;a+=step)for(let b=-d/2+step/2;b<d/2;b+=step)
    box(x+a,y,z+b,step-.07,.2,step-.07,pick(palette.paving));
}
function stairs(x,z,width,height=1.8,n=5){
  for(let k=0;k<n;k++)box(x,(k+1)*height/n/2,z-k*.65,width,(k+1)*height/n,.7,pick(palette.stone));
}
function railing(x,y,z,w,d){
  for(const side of [-1,1]){
    box(x+side*w/2,y+.85,z,.24,.22,d,'#e0ddc8');
    for(let b=-d/2;b<=d/2;b+=2.2){
      box(x+side*w/2,y+.5,z+b,.33,1,.33,'#cbd0b9');
      vox(x+side*w/2,y+1.09,z+b,'#e2dfc7',.43);
    }
  }
  for(const side of [-1,1]){
    for(let a=-w/2;a<=w/2;a+=2.2){
      if(side===1&&Math.abs(a)<3.3)continue;
      box(x+a,y+.5,z+side*d/2,.33,1,.33,'#cbd0b9');
      vox(x+a,y+1.09,z+side*d/2,'#e2dfc7',.43);
      if(side===-1||Math.abs(a)>5)box(x+a,y+.85,z+side*d/2,2,.22,.24,'#e0ddc8');
    }
  }
}

// A tiled hip roof: a long ridge, quantized concave slope and lifted corners.
function roof(x,y,z,w,d,rise,colors=palette.jade,ridgeRatio=.48){
  const unit=.65,nx=Math.ceil(w/unit),nz=Math.ceil(d/unit);
  const sx=w/nx,sz=d/nz,halfW=w/2,halfD=d/2,ridge=halfW*ridgeRatio;
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
    const a=(i+.5)*sx-halfW,b=(j+.5)*sz-halfD;
    const t=Math.min(1,Math.max(Math.abs(b)/halfD,(Math.abs(a)-ridge)/(halfW-ridge)));
    const corner=Math.pow(Math.abs(a)/halfW,7)*Math.pow(Math.abs(b)/halfD,7)*2.2;
    const height=Math.round((rise*Math.pow(1-t,1.7)+corner)/.32)*.32;
    const border=i===0||j===0||i===nx-1||j===nz-1;
    box(x+a,y+height,z+b,sx+.025,.55,sz+.025,border?pick(palette.gold):pick(colors));
    // Slim raised seams strengthen the tiled silhouette without textures.
    if(i%2===0&&!border)box(x+a,y+height+.29,z+b,.1,.1,sz+.02,colors[1]);
  }
  for(let a=-ridge;a<=ridge;a+=.56){
    box(x+a,y+rise+.5,z,.57,.52,.65,pick(palette.gold));
    if(Math.abs(a)>ridge-1.1)vox(x+a,y+rise+1,z,palette.gold[3],.5);
  }
  for(const s of [-1,1]){
    // Ridge beasts and upturned finials, deliberately block-built.
    for(let k=0;k<3;k++)box(x+s*(ridge+.3+k*.35),y+rise+.7+k*.32,z,.48,.45,.55,palette.gold[k]);
    for(const v of [-1,1]){
      for(let k=0;k<3;k++)vox(x+s*(halfW-.2+k*.22),y+1+k*.35,z+v*(halfD-.2+k*.16),palette.gold[3],.42);
    }
  }
}
function bracket(x,y,z){
  box(x,y,z,1.2,.28,.7,'#d49e5c');
  box(x,y+.33,z,1.8,.28,.55,'#905335');
  box(x,y+.63,z,2.15,.25,.8,'#d0a26a');
  box(x,y+.93,z,.55,.33,1.65,'#a83f2e');
}
function windowPanel(x,y,z,w,h){
  box(x,y,z,w,h,.16,'#393e30');
  for(let a=-w/2;a<=w/2+.01;a+=.55)box(x+a,y,z+.12,.09,h,.12,'#b18d58');
  for(let b=-h/2;b<=h/2+.01;b+=.6)box(x,y+b,z+.14,w,.09,.12,'#b18d58');
  box(x,y-h/2-.13,z,w+.24,.22,.4,'#d5bd86');
}
function lantern(x,y,z){
  box(x,y+.85,z,.08,.7,.08,'#493a28');
  box(x,y,z,.75,1.05,.75,'#d05a36','glow');
  box(x,y+.59,z,.9,.18,.9,'#c59b50');
  box(x,y-.59,z,.9,.16,.9,'#c59b50');
  box(x,y-.95,z,.15,.58,.15,'#c1974f');
  for(const a of [-.32,.32])box(x+a,y,z+.39,.06,1.1,.06,'#e7ac51');
}
function hall(x,z,w,d,height,main=false){
  const base=main?2.05:1.45;
  box(x,.35,z,w+3.5,.7,d+3.8,'#a9b09b');
  box(x,base/2+.25,z,w+2.8,base,d+3.2,'#c5c8b1');
  box(x,base+.3,z,w+3.3,.4,d+3.7,'#dedcc6');
  stairs(x,z+d/2+4.3,main?9:5.5,base+.45,6);
  if(main)railing(x,base+.5,z,w+2.5,d+3.2);
  const wallY=base+height/2+.5;
  // A recessed wall leaves a real columned porch at the front.
  box(x,wallY,z-.55,w-1,height,d-2.5,pick(palette.red));
  box(x,base+.75,z+d/2-1.6,w-.5,.5,.5,'#673c29');
  box(x,base+height+.35,z,w+1,.5,d+.8,'#65472e');
  const count=main?7:4;
  for(let i=0;i<count;i++){
    const a=-w/2+1+i*(w-2)/(count-1);
    for(const b of [-d/2+.8,d/2-.3]){
      box(x+a,wallY,z+b,.6,height+.3,.6,'#aa3f2d');
      box(x+a,base+.7,z+b,.94,.5,.94,'#d2c5a2');
      bracket(x+a,base+height-.05,z+b);
    }
  }
  for(let i=0;i<count-1;i++){
    const a=-w/2+1+(i+.5)*(w-2)/(count-1),front=z+d/2-1.72;
    windowPanel(x+a,wallY+.15,front,(w-2)/(count-1)-.7,height*.53);
  }
  const doorW=main?3.1:2.1;
  box(x,base+2.1,z+d/2-1.57,doorW,3.4,.24,'#592e24');
  for(const s of [-1,1]){
    box(x+s*doorW/4,base+2.1,z+d/2-1.4,.09,3.3,.09,'#cf9950');
    for(let k=0;k<4;k++)for(let j=0;j<3;j++)vox(x+s*(.25+j*.34),base+.9+k*.65,z+d/2-1.35,'#d5a953',.12);
    lantern(x+s*(main?5.8:3.5),base+height-.5,z+d/2+.15);
  }
  box(x,base+height-.7,z+d/2+.13,main?5.6:3.8,1.15,.35,'#2d5750');
  box(x,base+height-.08,z+d/2+.15,main?5.85:4,.12,.45,'#d3a45a');
  if(main){
    roof(x,base+height+1.0,z,w+6,d+6,4.5,palette.gold,.56);
    // The smaller upper pavilion gives the main hall a distinct double eave.
    box(x,base+height+4,z,w-6,3.2,d-4,'#a24430');
    for(let a=-w/2+4;a<w/2-2;a+=3.4)windowPanel(x+a,base+height+4,z+(d-4)/2+.1,2.2,1.5);
    roof(x,base+height+5.6,z,w+1,d+1.3,4.1,palette.gold,.58);
  }else roof(x,base+height+1.1,z,w+4,d+4,3.8,palette.jade,.4);
}
function gate(){
  const z=30,w=18;
  box(0,.55,z,22,1.1,9,'#c7c8b1');stairs(0,z+7,11,1.1,4);
  for(const x of [-8,-3,3,8]){
    box(x,4.6,z,.85,7.2,.85,'#a14431');bracket(x,7.9,z);
    box(x,1.35,z,1.25,.5,1.25,'#d7d3b9');
  }
  for(const x of [-8,8])box(x,4,z-.55,2.5,5.8,3.4,'#a24532');
  box(0,7.5,z,w,1,3.8,'#9b422c');
  box(0,7.3,z+2.1,4,1.4,.3,'#27584c');
  roof(0,8.6,z,23,9.5,3.4,palette.jade,.55);
  for(const x of [-5.6,5.6])lantern(x,6,z+2.1);
}
function tower(x,z){
  box(x,.5,z,10,1,10,'#c6c8b1');stairs(x,z+7,4,1.1,4);
  for(let floor=0;floor<5;floor++){
    const y=1+floor*4.45,w=7.3-floor*.65;
    box(x,y+1.7,z,w,3.3,w,'#c5b083');
    box(x,y+.2,z,w+.7,.35,w+.7,'#9b5038');
    for(const a of [-1,1])for(const b of [-1,1]){
      box(x+a*(w/2-.25),y+1.8,z+b*(w/2-.25),.45,3.3,.45,'#a43e2b');
    }
    windowPanel(x,y+1.8,z+w/2+.05,1.4,2);
    box(x-w/2-.06,y+1.8,z,.12,1.8,1.3,'#534934');
    box(x+w/2+.06,y+1.8,z,.12,1.8,1.3,'#534934');
    roof(x,y+3.55,z,w+3.1,w+3.1,1.55,palette.jade,.01);
  }
  for(let k=0;k<5;k++)box(x,25.1+k*.5,z,.8-k*.12,.5,.8-k*.12,palette.gold[3]);
}
function pine(x,z,scale=1){
  const h=7*scale;
  box(x,h/2,z,.8*scale,h,.8*scale,pick(palette.wood));
  for(let tier=0;tier<4;tier++){
    const r=(3.3-tier*.55)*scale,y=(3+tier*1.6)*scale;
    for(let a=-r;a<=r;a+=.9*scale)for(let b=-r;b<=r;b+=.9*scale){
      if(Math.abs(a)+Math.abs(b)>r*1.55||random()<.06)continue;
      box(x+a,y+Math.floor(random()*2)*.35*scale,z+b,1.08*scale,.85*scale,1.08*scale,pick(palette.leaf));
    }
  }
}
function blossom(x,z){
  box(x,2.4,z,.75,4.8,.75,'#6a5039');
  box(x+.8,4.2,z,2.1,.5,.5,'#6a5039');
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)for(let c=0;c<3;c++){
    if(a*a+b*b+(c-1)**2>6.8||random()<.15)continue;
    vox(x+a*.85,5+c*.8,z+b*.85,pick(palette.pink),1);
  }
}
function stoneLamp(x,z){
  box(x,.25,z,1.3,.5,1.3,'#c3c6b0');box(x,1.2,z,.5,1.8,.5,'#afb9a0');
  box(x,2.35,z,1.05,1,1.05,'#c8ceb5');
  box(x,2.4,z+.54,.55,.5,.04,'#e2bc6d','glow');
  box(x,2.4,z-.54,.55,.5,.04,'#e2bc6d','glow');
  box(x,3,z,1.55,.35,1.55,'#6c8573');vox(x,3.35,z,'#7e9380',.75);
}
function lion(x,z,flip){
  box(x,.45,z,1.9,.9,2.6,'#bcc1ac');box(x,1.15,z,1.5,.5,2.1,'#d5d5bb');
  for(const a of [-.45,.45])box(x+a,1.75,z+.5,.45,.9,.6,'#a7b29d');
  box(x,2.1,z-.2,1.3,1.4,1.4,'#b7c1a8');
  box(x,3,z+.4,1.5,1.35,1.3,'#bdc8ad');
  box(x,2.8,z+1.12,1,.45,.6,'#cbd1b6');
  for(const a of [-.48,.48])vox(x+a,3.15,z+1.08,'#5e7060',.18);
  for(const a of [-.66,.66])vox(x+a,3.62,z+.4,'#adbba0',.5);
  vox(x+flip*.5,1.8,z+1.1,'#94a68e',.65);
  box(x,2.4,z-.95,.35,.4,1,'#b6c2a6');
}
function pond(x,z){
  box(x,.16,z,10,.38,12,'#b2b9a1');
  box(x,.39,z,8.9,.13,10.9,'#679d93','water');
  for(let a=-4;a<=4;a+=1)for(let b=-5;b<=5;b++){
    if(Math.abs(a)===4||Math.abs(b)===5)box(x+a,.56,z+b,.96,.45,.96,pick(palette.stone));
  }
  for(let k=0;k<8;k++){
    const a=(random()-.5)*7,b=(random()-.5)*8;
    box(x+a,.49,z+b,.7,.08,.7,'#6f8b55');
    if(k%3===0)vox(x+a,.65,z+b,'#e0b1a2',.26);
  }
  for(let k=-4;k<=4;k++)box(x+k,.51,z+2, .45,.025,.08,'#acc6b1');
}

function createWorld(scene){
  // Terraced earth is intentionally visible along the edge of the diorama.
  box(0,-2.1,0,96,3.7,89,'#9d9c78');
  box(0,-.45,0,96,.65,89,'#b4ba91');
  for(let x=-47;x<48;x+=2)for(let z=-43;z<44;z+=2)box(x,0,z,1.98,.3,1.98,pick(palette.grass));
  for(let x=-47;x<48;x+=2){
    for(const z of [-44.6,44.6])box(x,-1.8,z,1.95,2.1+random()*.8,.4,pick(['#9b9b76','#aaa681','#8f9471']));
  }
  for(let z=-43;z<44;z+=2)for(const x of [-48,48])box(x,-1.7,z,.4,2.4,1.95,pick(['#9b9b76','#aaa681','#8f9471']));
  // Boundary walls with glazed caps. The southern wall stops at the gate.
  for(const x of [-42,42]){
    box(x,1.6,-2,1,3.2,73,'#c3b99a');box(x,3.35,-2,1.5,.38,74,'#587360');
    for(let z=-38;z<=34;z+=6)box(x,1.8,z,1.45,3.6,1.45,'#ae6046');
  }
  box(0,1.6,-38,85,3.2,1,'#c3b99a');box(0,3.35,-38,86,.38,1.5,'#587360');
  for(const s of [-1,1]){
    box(s*27.2,1.6,32,29.6,3.2,1,'#c3b99a');box(s*27.2,3.35,32,30,.38,1.5,'#587360');
    for(let a=14;a<43;a+=7)box(s*a,1.8,32,1.4,3.6,1.5,'#ad644c');
  }
  tiles(0,1,38,29);
  tiles(0,28,8,33);
  tiles(0,-17,10,11);
  tiles(0,-3,68,5);
  // Inlaid borders emphasize the processional axis.
  for(const x of [-4.3,4.3])box(x,.28,24,.23,.12,40,'#aaac8c');
  for(const x of [-19.7,19.7])box(x,.28,0,.3,.12,29,'#9da38b');
  for(const z of [-14.5,14.5])box(0,.28,z,39.5,.12,.3,'#9da38b');
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){
    if(Math.abs(i)+Math.abs(j)===3)box(i*1.2,.27,2+j*1.2,1.12,.08,1.12,'#a8b09a');
  }
  hall(0,-23,27,15,7.3,true);
  hall(-28,-1,12,17,5.4);hall(28,-1,12,17,5.4);
  tower(-32,-25);tower(32,-25);gate();
  lion(-7.2,36,1);lion(7.2,36,-1);
  pond(-17,22);pond(17,22);
  // A squat ceremonial bronze incense burner in the inner courtyard.
  box(0,.45,-7,4,.65,3,'#c3c4ac');
  for(const a of [-.8,.8])box(a,1.15,-7,.35,1,.35,'#4f7566');
  box(0,1.8,-7,2.5,1,1.65,'#4e7767');box(0,2.5,-7,3.2,.4,2.2,'#68856a');
  for(const a of [-1.5,1.5])box(a,2.05,-7,.35,1.1,.4,'#a98c4b');
  for(const s of [-1,1]){
    for(const z of [-11,8,26])stoneLamp(s*7,z);
    for(const [x,z,k] of [[36,20,1.2],[33,11,.9],[37,-12,.95],[21,-33,.8],[44,-31,.8],[44,28,.8],[36,38,.75]])pine(s*x,z,k);
    blossom(s*28,22);blossom(s*17,-33);
    // Hedges and planted islands frame the open stone courtyard.
    for(const z of [10,-13]){
      box(s*31,.4,z,13,.65,3,'#bdc0a1');
      for(let x=-5;x<=5;x++)box(s*31+x,1,z,1,.9,1.9,pick(palette.leaf));
    }
    for(let k=0;k<22;k++){
      const x=s*(11+random()*28),z=35+random()*7;
      if(Math.abs(x)<10)continue;
      vox(x,.4,z,pick(['#a4ac74','#b9b983','#d8c594']),.3+random()*.3);
    }
  }
  // A few block stones keep the landscaped edges from feeling too regular.
  for(const s of [-1,1])for(const [x,z] of [[36,27],[22,34],[39,-33]]){
    box(s*x,.65,z,1.8,1.2,1.6,'#a1ac92');box(s*x+.5,1.3,z+.1,1.1,.7,1.1,'#b3bba0');
  }
  let count=0;
  const cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  const meshes=[];
  for(const [kind,instances] of batches){
    const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:kind==='water'?.3:.86,metalness:kind==='water'?.15:0});
    if(kind==='glow'){material.emissive=new THREE.Color('#ff993d');material.emissiveIntensity=.35;}
    const mesh=new THREE.InstancedMesh(cube,material,instances.length);
    instances.forEach((b,i)=>{
      dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(b.color));
    });
    mesh.instanceMatrix.needsUpdate=true;
    mesh.instanceColor.needsUpdate=true;
    mesh.castShadow=kind==='solid';mesh.receiveShadow=true;
    mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh);count+=instances.length;
  }
  batches.clear();return {count,meshes};
}

function boot(){
  const mount=document.getElementById('scene');
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
  mount.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','中国古建体素院落，可拖动旋转');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#eeece3');
  const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,1,700);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.07;controls.autoRotateSpeed=.4;
  controls.minPolarAngle=.24;controls.maxPolarAngle=Math.PI/2.25;
  controls.minDistance=45;controls.maxDistance=320;controls.zoomSpeed=.85;
  controls.screenSpacePanning=false;controls.maxTargetRadius=22;
  controls.cursor.set(0,5,0);
  const homeDirection=new THREE.Vector3(1.03,.96,1.36).normalize();
  function reset(){
    const aspect=innerWidth/innerHeight;
    // Frustum-based fit with room for the title and bottom controls.
    const distance=Math.max(192,87/(Math.tan(THREE.MathUtils.degToRad(17))*Math.min(aspect,1.8)));
    controls.maxDistance=Math.max(320,distance*1.35);
    controls.target.set(0,4,0);camera.position.copy(controls.target).addScaledVector(homeDirection,distance);
    camera.updateProjectionMatrix();controls.update();
  }
  reset();
  const ambient=new THREE.HemisphereLight('#fff5de','#89946a',2.35);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff0cc',3.1);sun.position.set(-45,75,45);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:210});
  sun.shadow.normalBias=.12;sun.shadow.bias=-.00015;sun.target.position.set(0,0,0);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight('#e1ede1',.6);fill.position.set(35,30,-45);scene.add(fill);
  const world=createWorld(scene);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.ShadowMaterial({color:'#4b6045',opacity:.12}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-4.15;floor.receiveShadow=true;scene.add(floor);
  renderer.shadowMap.needsUpdate=true;

  let dusk=false,frames=0,lastSample=performance.now(),lastTime=lastSample,fps=0;
  const rotate=document.getElementById('rotate'),light=document.getElementById('light');
  function toggleRotate(){controls.autoRotate=!controls.autoRotate;rotate.setAttribute('aria-pressed',String(controls.autoRotate));}
  function toggleLight(){
    dusk=!dusk;document.body.classList.toggle('dusk',dusk);light.setAttribute('aria-pressed',String(dusk));
    document.getElementById('light-label').textContent=dusk?'暮色 · 18:30':'晨光 · 07:30';
    document.getElementById('light-button-label').textContent=dusk?'晨光':'暮色';
    document.getElementById('sun-icon').textContent=dusk?'☾':'☀';
    scene.background.set(dusk?'#3c4a55':'#eeece3');
    ambient.color.set(dusk?'#b2c2e1':'#fff5de');ambient.groundColor.set(dusk?'#697367':'#89946a');ambient.intensity=dusk?1.4:2.35;
    sun.color.set(dusk?'#ffc587':'#fff0cc');sun.intensity=dusk?2.2:3.1;
    sun.position.set(dusk?-65:-45,dusk?28:75,45);fill.intensity=dusk?.4:.6;
    renderer.toneMappingExposure=dusk?1:1.22;
    const lanternMesh=world.meshes.find(m=>m.material.emissive?.getHex()===0xff993d);
    if(lanternMesh)lanternMesh.material.emissiveIntensity=dusk?1:.35;
    renderer.shadowMap.needsUpdate=true;
  }
  rotate.addEventListener('click',toggleRotate);light.addEventListener('click',toggleLight);
  document.getElementById('reset').addEventListener('click',()=>{controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');reset();});
  const info=document.getElementById('info'),panel=document.getElementById('info-panel');
  function showInfo(show){panel.hidden=!show;info.setAttribute('aria-expanded',String(show));}
  info.addEventListener('click',()=>showInfo(panel.hidden));
  document.getElementById('close-info').addEventListener('click',()=>showInfo(false));
  document.addEventListener('keydown',e=>{
    if(e.target.closest('button,input,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.code==='Space'){e.preventDefault();toggleRotate();}
    if(e.code==='KeyL')toggleLight();
    if(e.code==='KeyR'){controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');reset();}
    if(e.code==='Escape')showInfo(false);
  });
  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);reset();
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('status').hidden=false;document.getElementById('status').textContent='图形上下文已暂停，正在恢复…';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{renderer.shadowMap.needsUpdate=true;document.getElementById('status').hidden=true;});
  const stats={ready:true,voxelCount:world.count,buildings:6,fps:0,drawCalls:0,triangles:0,threeRevision:THREE.REVISION};
  const diagnostics=document.createElement('output');
  diagnostics.id='render-diagnostics';diagnostics.hidden=true;
  document.body.appendChild(diagnostics);
  // Read-only diagnostics for reproducible browser verification.
  Object.defineProperty(window,'__QINGQUE__',{value:{stats,getCamera:()=>camera.position.toArray(),getTarget:()=>controls.target.toArray(),getMode:()=>dusk?'dusk':'morning'},writable:false});
  renderer.setAnimationLoop(now=>{
    const delta=Math.min((now-lastTime)/1000,.05);lastTime=now;
    if(document.hidden)return;
    controls.update(delta);renderer.render(scene,camera);
    document.getElementById('compass-needle').style.transform=`rotate(${-THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
    frames++;
    if(now-lastSample>1000){
      fps=frames*1000/(now-lastSample);frames=0;lastSample=now;
      stats.fps=Math.round(fps);stats.drawCalls=renderer.info.render.calls;stats.triangles=renderer.info.render.triangles;
      diagnostics.textContent=JSON.stringify({...stats,mode:dusk?'dusk':'morning',camera:camera.position.toArray()});
    }
  });
  document.getElementById('status').hidden=true;
}
try{boot();}catch(error){
  console.error(error);const status=document.getElementById('status');
  status.className='fatal';status.textContent='无法启动三维场景。请使用支持 WebGL 2 的新版 Chrome / Edge / Firefox，并开启浏览器图形加速。';
}
