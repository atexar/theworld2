/* Shared procedural artwork renderer: browser canvas and static fallback use the same mesh. */
(function (root) {
  const TAU = Math.PI * 2;
  const norm = v => { const s = Math.hypot(...v)||1; return v.map(x=>x/s); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function curve(t) { return [(Math.sin(t)+2*Math.sin(2*t))*.77,(Math.cos(t)-2*Math.cos(2*t))*.77,-Math.sin(3*t)*.72]; }
  function makeMesh(rows=140, cols=20) {
    const points=[];
    for(let i=0;i<rows;i++){
      const t=i/rows*TAU, c=curve(t), n=curve(t+.001), tangent=norm(n.map((v,k)=>v-c[k]));
      const a=norm(cross(tangent,[0,0,1])), b=norm(cross(tangent,a));
      for(let j=0;j<cols;j++){const v=j/cols*TAU;points.push(c.map((p,k)=>p+.47*(a[k]*Math.cos(v)+b[k]*Math.sin(v))));}
    }
    const faces=[];
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)faces.push([i*cols+j,((i+1)%rows)*cols+j,((i+1)%rows)*cols+(j+1)%cols,i*cols+(j+1)%cols]);
    return {points,faces};
  }
  function render(ctx,mesh,w,h,angle=0,tilt=0){
    ctx.clearRect(0,0,w,h);
    const ax=.36+tilt*.3, ay=-.57+angle, az=-.27;
    const points=mesh.points.map(p=>{let[x,y,z]=p;[y,z]=[y*Math.cos(ax)-z*Math.sin(ax),y*Math.sin(ax)+z*Math.cos(ax)];[x,z]=[x*Math.cos(ay)+z*Math.sin(ay),-x*Math.sin(ay)+z*Math.cos(ay)];[x,y]=[x*Math.cos(az)-y*Math.sin(az),x*Math.sin(az)+y*Math.cos(az)];return[x,y,z];});
    const scale=Math.min(w,h)*.157;
    const faces=mesh.faces.map(face=>({ids:face,z:face.reduce((s,i)=>s+points[i][2],0)/4})).sort((a,b)=>a.z-b.z);
    for(const face of faces){
      const p=face.ids.map(i=>points[i]);
      const n=norm(cross(p[1].map((x,i)=>x-p[0][i]),p[3].map((x,i)=>x-p[0][i])));
      const shine=Math.pow(Math.max(0,n[0]*-.45+n[1]*-.5+n[2]*.74),28);
      const band=Math.pow(Math.max(0,Math.cos(n[1]*5+n[0]*1.3)),10);
      const light=.12+.4*Math.abs(n[2])+.9*band+1.4*shine;
      const lime=Math.max(0,Math.min(1,(-n[0]*.6+n[1]*.45+.25)));
      const rgb=[(173+40*lime)*light,(189+60*lime)*light,(193-130*lime)*light].map(v=>Math.min(255,Math.round(v)));
      ctx.fillStyle=`rgb(${rgb.join(',')})`;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;
      ctx.beginPath();p.forEach(([x,y,z],i)=>{const perspective=8.5/(8.5-z);const X=w/2+x*scale*perspective,Y=h/2+y*scale*perspective; i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
  const api={makeMesh,render};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtexarSculpture=api;
})(typeof window!=='undefined'?window:globalThis);
