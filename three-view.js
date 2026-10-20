/* InNav interactive 3D overview. Pure Canvas 2D software projection of real 3D geometry;
 * no CDN, WebGL, download or third-party dependency is required. */
(() => {
'use strict';
let orbit={yaw:-0.78,pitch:0.68,scale:1.6,panX:0,panY:0};
let mode='orbit';
let fly={x:500,y:420,z:1250,yaw:0,pitch:-.26,speed:32};
let activeDispose=null,activeRender=null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,(n>>8)&255,n&255].map(v=>Math.round(clamp(v*k,0,255))).join(',')})`};
function mount(canvas,model,callbacks={}) {
 if(!canvas)return;
 if(activeDispose){activeDispose();activeDispose=null;}
 canvas.tabIndex=0;
 const context=canvas.getContext('2d');
 if(!context){canvas.replaceWith(Object.assign(document.createElement('p'),{textContent:'3D canvas is not supported in this browser.'}));return;}
 let down=null,hits=[];
 const floors=model.floors.filter(f=>f.id===model.activeFloor); // Focus on selected floor only; no overwhelming multi-floor extrusion.
 const elev=f=> 0; // local scene coordinate: selected floor always at comfortable viewing height.
 const height=95;
 const maxY=Math.max(270,...floors.map(f=>elev(f)+height));
 const center={x:500,y:48,z:325};
 function project(x,y,z){if(mode==='fly'){const W=canvas.clientWidth,H=canvas.clientHeight;const dx=x-fly.x,dy=y-fly.y,dz=z-fly.z;const cy=Math.cos(fly.yaw),sy=Math.sin(fly.yaw),cp=Math.cos(fly.pitch),sp=Math.sin(fly.pitch);const right=dx*cy+dz*sy,up=-dx*sy*sp+dy*cp-dz*cy*sp,depth=dx*sy*cp+dy*sp-dz*cy*cp;const scale=Math.min(W,H)*1.15/Math.max(16,depth);return {x:W/2+right*scale,y:H/2-up*scale,depth};}const a=orbit.yaw,p=orbit.pitch;let X=x-center.x,Y=y-center.y,Z=z-center.z;const xx=X*Math.cos(a)-Z*Math.sin(a),zz=X*Math.sin(a)+Z*Math.cos(a);const yy=Y*Math.cos(p)-zz*Math.sin(p),depth=Y*Math.sin(p)+zz*Math.cos(p);const W=canvas.clientWidth,H=canvas.clientHeight;
 const perspective=1200/(1200+depth*.45);const fit=Math.min(W/1500,H/1000)*orbit.scale*perspective;
 return {x:W/2+xx*fit+orbit.panX,y:H/2-yy*fit+orbit.panY,depth};}
 const plan=(x,y,h)=>project(x,h, y);
 function face(points,fill,stroke='#a4b6c5',width=1){context.beginPath();points.forEach((v,i)=>{let p=plan(...v);i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y)});context.closePath();context.fillStyle=fill;context.fill();if(stroke){context.strokeStyle=stroke;context.lineWidth=width;context.stroke()}}
 function line(points,color,width=3){context.beginPath();points.forEach((v,i)=>{let p=plan(...v);i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y)});context.strokeStyle=color;context.lineWidth=width;context.lineCap='round';context.lineJoin='round';context.stroke()}
 function marker(x,z,y,color,label){const p=plan(x,z,y);context.beginPath();context.arc(p.x,p.y,5.3,0,Math.PI*2);context.fillStyle=color;context.fill();context.lineWidth=1.7;context.strokeStyle='#fff';context.stroke();if(label){context.font='600 11px Arial,sans-serif';context.textAlign='left';context.fillStyle='#273c56';context.fillText(label,p.x+9,p.y-7)}}
 function render(){const dpr=Math.min(devicePixelRatio||1,2),W=canvas.clientWidth,H=canvas.clientHeight;if(!W||!H)return;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,W,H);
 const g=context.createLinearGradient(0,0,0,H);g.addColorStop(0,'#eaf0f5');g.addColorStop(1,'#cad7e3');context.fillStyle=g;context.fillRect(0,0,W,H);
 hits=[];
 // Painter order: lower slabs first, then corresponding volumes and graph.
 floors.forEach(fl=>{let y=elev(fl),selected=fl.id===model.activeFloor;
 const outline=(model.boundary?.length?model.boundary:[[0,0],[1000,0],[1000,650],[0,650]]);
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];face([[a[0],a[1],y-11],[b[0],b[1],y-11],[b[0],b[1],y],[a[0],a[1],y]],'#9cadbc','#768a9e',.8);}
 face(outline.map(v=>[v[0],v[1],y]),selected?'#eef3f9':'#d9e5ee',selected?'#d97706':'#8fa5b6',selected?3:1);
 for(let x=0;x<=1000;x+=100)line([[x,0,y+1],[x,650,y+1]],'#cfdae5',.65);
 for(let z=0;z<=650;z+=100)line([[0,z,y+1],[1000,z,y+1]],'#cfdae5',.65);
 const rooms=model.rooms.filter(r=>r.floorId===fl.id).sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2));
 rooms.forEach(r=>{let x=+r.x||0,z=+r.y||0,w=Math.max(10,+r.w||10),h=Math.max(10,+r.h||10),wall=y+Math.min(95,Math.max(45,95));let isSelected=model.selection?.id===r.id,base=isSelected?'#d97706':r.type==='Hallway'?'#9fbed2':'#79a6c9';
 const A=[x,z,y+2],B=[x+w,z,y+2],C=[x+w,z+h,y+2],D=[x,z+h,y+2],E=[x,z,wall],F=[x+w,z,wall],G=[x+w,z+h,wall],H=[x,z+h,wall];
 face([A,B,F,E],shade(base,.8));face([B,C,G,F],shade(base,.65));face([D,A,E,H],shade(base,.74));face([C,D,H,G],shade(base,.88));face([E,F,G,H],shade(base,1.15),isSelected?'#d97706':'#7693ad',isSelected?3:1);
 const label=plan(x+w/2,z+h/2,wall+5);context.fillStyle='#142942';context.font='bold 11px Arial,sans-serif';context.textAlign='center';context.fillText(String(r.name).slice(0,22),label.x,label.y-7);
 const corners=[[E,F,G,H].map(v=>plan(...v))];hits.push({type:'room',id:r.id,poly:corners[0]});
 });
 (model.fixtures||[]).filter(o=>o.floorId===fl.id).forEach(o=>{const ch=o.type==='lift'?'↕':o.type==='door'?'◫':o.type==='escalator'?'↗':'▤';const c=o.type==='door'?'#d97706':o.type==='escalator'?'#8e63d0':'#146dca';const t=plan(o.x,o.y,y+104);context.beginPath();context.arc(t.x,t.y,12,0,Math.PI*2);context.fillStyle=c;context.fill();context.strokeStyle='#fff';context.lineWidth=2;context.stroke();context.fillStyle='#fff';context.textAlign='center';context.font='bold 17px Arial';context.fillText(ch,t.x,t.y+6);hits.push({type:'fixture',id:o.id,center:t})});
 if(model.showGraph){const nodeById=new Map(model.nodes.map(n=>[n.id,n]));const pairs=new Set((model.route?.ids||[]).slice(1).map((id,i)=>[id,model.route.ids[i]].sort().join('|')));
 model.edges.forEach(edge=>{let a=nodeById.get(edge.a),b=nodeById.get(edge.b);if(!a||!b)return;if(a.floorId!==fl.id||b.floorId!==fl.id)return; const fy=id=>14;line([[a.x,a.y,fy(a.floorId)],[b.x,b.y,fy(b.floorId)]],pairs.has([edge.a,edge.b].sort().join('|'))?'#0066ff':'#4a93c7',pairs.has([edge.a,edge.b].sort().join('|'))?5:2.2)});
 model.nodes.filter(n=>n.floorId===fl.id).forEach(n=>marker(n.x,n.y,y+15,(model.route?.ids||[]).includes(n.id)?'#0066ff':'#347aab',null));}
 if(model.showPOI)model.pois.filter(p=>p.floorId===fl.id&&p.visible!==false).forEach(po=>{const mark=plan(po.x,po.y,y+110);line([[po.x,po.y,y+10],[po.x,po.y,y+110]],'#1d68ce',2);marker(po.x,po.y,y+110,'#0066ff',po.name);hits.push({type:'poi',id:po.id,center:mark})});
 const title=plan(70,40,y+130);context.textAlign='left';context.font='bold 13px Arial,sans-serif';context.fillStyle=selected?'#a65f05':'#455d70';context.fillText(fl.name+' · '+fl.elevation+'m',title.x,title.y);
 });
 if(!floors.length){context.fillStyle='#34465b';context.font='15px Arial';context.fillText('No visible floors. Enable a floor in the Properties panel.',28,48)}
 }
 function inside(poly,p){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)hit=!hit}return hit}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{canvas.focus();if(mode==='fly'&&e.button!==2)return;if(mode==='orbit'&&e.button!==0)return;down={x:e.clientX,y:e.clientY,ox:orbit.yaw,oy:orbit.pitch,px:orbit.panX,py:orbit.panY,fx:fly.yaw,fy:fly.pitch,shift:e.shiftKey,moved:false};canvas.setPointerCapture(e.pointerId)};
 canvas.onpointermove=e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>3)down.moved=true;if(mode==='fly'){fly.yaw=down.fx+dx*.004;fly.pitch=clamp(down.fy-dy*.004,-1.38,1.38);}else if(down.shift){orbit.panX=down.px+dx;orbit.panY=down.py+dy;}else{orbit.yaw=down.ox+dx*.008;orbit.pitch=clamp(down.oy+dy*.006,.16,1.38)}render()};
 canvas.onpointerup=e=>{if((!down||!down.moved)&&e.button===0){const rect=canvas.getBoundingClientRect(),p={x:e.clientX-rect.left,y:e.clientY-rect.top};const hit=[...hits].reverse().find(h=>h.center?Math.hypot(h.center.x-p.x,h.center.y-p.y)<18:inside(h.poly,p));if(hit)callbacks.select?.(hit.type,hit.id)}down=null};
 canvas.onwheel=e=>{e.preventDefault();if(mode==='fly'){const amt=e.deltaY<0?fly.speed:-fly.speed;fly.x+=Math.sin(fly.yaw)*amt;fly.z-=Math.cos(fly.yaw)*amt;fly.y+=Math.sin(fly.pitch)*amt}else{orbit.scale=clamp(orbit.scale*Math.exp(-e.deltaY*.001),.35,3.5)}render()};
 canvas.onkeydown=e=>{if(mode!=='fly')return;const k=e.key.toLowerCase(),step=fly.speed*(e.shiftKey?3:1);if(!['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(k))return;e.preventDefault();if(k==='w'||k==='arrowup'){fly.x+=Math.sin(fly.yaw)*step;fly.z-=Math.cos(fly.yaw)*step}if(k==='s'||k==='arrowdown'){fly.x-=Math.sin(fly.yaw)*step;fly.z+=Math.cos(fly.yaw)*step}if(k==='a'||k==='arrowleft'){fly.x-=Math.cos(fly.yaw)*step;fly.z-=Math.sin(fly.yaw)*step}if(k==='d'||k==='arrowright'){fly.x+=Math.cos(fly.yaw)*step;fly.z+=Math.sin(fly.yaw)*step}if(k==='q')fly.y-=step;if(k==='e')fly.y+=step;render()};
 const resize=new ResizeObserver(render);resize.observe(canvas);activeRender=render;render();activeDispose=()=>{resize.disconnect();canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onwheel=canvas.onkeydown=canvas.oncontextmenu=null};return activeDispose;
}
window.InNav3D={mount,setMode(next){if(next==='orbit'||next==='fly'){mode=next;activeRender?.()};},reset(){orbit={yaw:-.78,pitch:.68,scale:1.6,panX:0,panY:0};fly={x:500,y:420,z:1250,yaw:0,pitch:-.26,speed:32}}};
})();