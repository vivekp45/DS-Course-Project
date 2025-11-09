// Simple UI Navigation
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
document.getElementById('startBtn').addEventListener('click',()=>show('menu'));
document.querySelectorAll('[data-back]').forEach(btn=>btn.addEventListener('click',()=>show('menu')));
document.querySelectorAll('.btn.option').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.target)));

// Linear system size toggle
const sizeSel = document.getElementById('linSize');
const row3Wrap = document.getElementById('row3Wrap');
sizeSel.addEventListener('change',()=>{
  row3Wrap.classList.toggle('hidden', sizeSel.value !== '3');
});

// ---------- Expression Solver (client-side demo) ----------
// Shunting Yard + Postfix evaluation in JS (for UI demo only)
function tokenize(expr){
  const tokens=[]; let i=0;
  while(i<expr.length){
    const c=expr[i];
    if(/\s/.test(c)){ i++; continue; }
    if(/[0-9.]/.test(c)){
      let j=i; while(j<expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({t:'num',v:parseFloat(expr.slice(i,j))}); i=j; continue;
    }
    if(/[a-zA-Z_]/.test(c)){
      let j=i; while(j<expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      tokens.push({t:'var',v:expr.slice(i,j)}); i=j; continue;
    }
    if('+-*/^()'.includes(c)){
      tokens.push({t:'op',v:c}); i++; continue;
    }
    throw new Error('Invalid char: '+c);
  }
  return tokens;
}
function prec(op){ return op==='^'?4: (op==='*'||op==='/')?3: (op==='+'||op==='-')?2:0; }
function infixToPostfix(tokens){
  const out=[], st=[];
  for(const tk of tokens){
    if(tk.t==='num' || tk.t==='var') out.push(tk);
    else if(tk.t==='op'){
      if(tk.v==='(') st.push(tk);
      else if(tk.v===')'){
        while(st.length && st[st.length-1].v!=='(') out.push(st.pop());
        if(!st.length) throw new Error('Mismatched )');
        st.pop();
      }else{
        while(st.length && st[st.length-1].t==='op' && st[st.length-1].v!=='(' &&
              (prec(st[st.length-1].v) > prec(tk.v) || (prec(st[st.length-1].v)===prec(tk.v) && tk.v!=='^'))){
          out.push(st.pop());
        }
        st.push(tk);
      }
    }
  }
  while(st.length){
    const top=st.pop();
    if(top.v==='('||top.v===')') throw new Error('Mismatched parentheses');
    out.push(top);
  }
  return out;
}
function evalPostfix(pf, env){
  const st=[];
  for(const tk of pf){
    if(tk.t==='num') st.push(tk.v);
    else if(tk.t==='var'){
      if(!(tk.v in env)) throw new Error('Missing value for '+tk.v);
      st.push(env[tk.v]);
    }else{
      const b=st.pop(), a=st.pop();
      switch(tk.v){
        case '+': st.push(a+b); break;
        case '-': st.push(a-b); break;
        case '*': st.push(a*b); break;
        case '/': st.push(a/b); break;
        case '^': st.push(Math.pow(a,b)); break;
      }
    }
  }
  if(st.length!==1) throw new Error('Bad expression');
  return st[0];
}
function parseEnv(s){
  const env={};
  if(!s.trim()) return env;
  for(const pair of s.split(',')){
    const [k,v]=pair.split('=').map(x=>x.trim());
    if(!k||v===undefined) continue;
    env[k]=parseFloat(v);
  }
  return env;
}
document.getElementById('evalExpr').addEventListener('click', ()=>{
  const expr=document.getElementById('exprInput').value;
  const vars=parseEnv(document.getElementById('varsInput').value);
  const out=document.getElementById('exprOutput');
  try{
    const toks=tokenize(expr);
    const pf=infixToPostfix(toks);
    const val=evalPostfix(pf, vars);
    out.textContent='Postfix: '+pf.map(t=>t.v??t.t).join(' ')+'\nValue = '+val.toFixed(6);
  }catch(e){
    out.textContent='Error: '+e.message;
  }
});

// ---------- Polynomial Solver (UI demo using formulas / Newton) ----------
function solveQuadratic(a,b,c){
  const d=b*b-4*a*c;
  if(d<0) return [];
  if(d===0) return [(-b)/(2*a)];
  const s=Math.sqrt(d);
  return [(-b+s)/(2*a), (-b-s)/(2*a)];
}
function newtonRoots(coeffs, maxIter=100, tol=1e-9){
  // coeffs: highest to lowest
  const n=coeffs.length-1;
  function f(x){
    let y=0; for(let i=0;i<coeffs.length;i++) y = y*x + coeffs[i];
    return y;
  }
  function df(x){
    let y=0; for(let i=0;i<n;i++) y = y*x + coeffs[i]*(coeffs.length-1-i);
    return y;
  }
  const roots=[];
  const guesses=[-5,-2,-1,-0.5,0,0.5,1,2,5,10,-10];
  for(const g of guesses){
    let x=g;
    for(let k=0;k<maxIter;k++){
      const fx=f(x), dfx=df(x);
      if(Math.abs(dfx)<1e-12) break;
      const nx=x-fx/dfx;
      if(Math.abs(nx-x)<tol) { x=nx; break; }
      x=nx;
    }
    if(Number.isFinite(x)){
      // deflate
      let val=f(x);
      if(Math.abs(val)<1e-5){
        let unique=true;
        for(const r of roots) if(Math.abs(r-x)<1e-4) unique=false;
        if(unique) roots.push(x);
      }
    }
  }
  return roots.slice(0,coeffs.length-1);
}
document.getElementById('solvePoly').addEventListener('click', ()=>{
  const deg=parseInt(document.getElementById('degSelect').value,10);
  const coeffs=document.getElementById('coeffs').value.split(',').map(s=>parseFloat(s.trim())).filter(x=>!Number.isNaN(x));
  const out=document.getElementById('polyOutput');
  try{
    if(coeffs.length!==deg+1) throw new Error('Need exactly '+(deg+1)+' coefficients.');
    let roots=[];
    if(deg===2){
      const [a,b,c]=coeffs;
      roots=solveQuadratic(a,b,c);
    }else{
      roots=newtonRoots(coeffs);
    }
    out.textContent = roots.length? ('Roots ≈ '+roots.map(r=>r.toFixed(6)).join(', ')) : 'No real roots found (UI demo).';
  }catch(e){
    out.textContent='Error: '+e.message;
  }
});

// ---------- Linear Solver (Gaussian elimination in JS for demo) ----------
function solve2(a){
  const [[a11,a12,b1],[a21,a22,b2]]=a;
  const det=a11*a22-a12*a21;
  if(Math.abs(det)<1e-12) return null;
  const x=(b1*a22-b2*a12)/det;
  const y=(a11*b2-a21*b1)/det;
  return [x,y];
}
function solve3(a){
  // 3x3 Gaussian elimination
  const M=a.map(r=>r.slice());
  const n=3;
  for(let col=0;col<n;col++){
    // pivot
    let piv=col;
    for(let r=col+1;r<n;r++) if(Math.abs(M[r][col])>Math.abs(M[piv][col])) piv=r;
    if(Math.abs(M[piv][col])<1e-12) return null;
    if(piv!==col) [M[piv],M[col]]=[M[col],M[piv]];
    const p=M[col][col];
    for(let j=col;j<=n;j++) M[col][j]/=p;
    for(let r=0;r<n;r++){
      if(r===col) continue;
      const f=M[r][col];
      for(let j=col;j<=n;j++) M[r][j]-=f*M[col][j];
    }
  }
  return [M[0][3],M[1][3],M[2][3]];
}
document.getElementById('solveLinear').addEventListener('click', ()=>{
  const out=document.getElementById('linOutput');
  try{
    const size=parseInt(document.getElementById('linSize').value,10);
    const r1=document.getElementById('r1').value.split(',').map(s=>parseFloat(s.trim()));
    const r2=document.getElementById('r2').value.split(',').map(s=>parseFloat(s.trim()));
    if(size===2){
      if(r1.length!==3||r2.length!==3) throw new Error('Each row must have 3 numbers.');
      const ans=solve2([r1,r2]);
      out.textContent = ans? ('x ≈ '+ans[0].toFixed(6)+', y ≈ '+ans[1].toFixed(6)) : 'No unique solution.';
    }else{
      const r3=document.getElementById('r3').value.split(',').map(s=>parseFloat(s.trim()));
      if(r1.length!==4||r2.length!==4||r3.length!==4) throw new Error('Each row must have 4 numbers.');
      const ans=solve3([r1,r2,r3]);
      out.textContent = ans? ('x ≈ '+ans[0].toFixed(6)+', y ≈ '+ans[1].toFixed(6)+', z ≈ '+ans[2].toFixed(6)) : 'No unique solution.';
    }
  }catch(e){
    out.textContent='Error: '+e.message;
  }
});

