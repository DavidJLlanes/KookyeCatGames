import {topology} from '../ilumina/engine.js';
/** Exact binary CSP, stops after two solutions to certify uniqueness. */
export function solve(cells,size,limit=2){
 const {visible,adjacent}=topology(cells,size);
 const whites=cells.flatMap((c,i)=>c===-2?[i]:[]);
 const constraints=[];
 for(const i of whites)constraints.push({ids:visible[i],min:1,max:Infinity});
 for(const i of whites)for(const j of visible[i])if(j>i)constraints.push({ids:[i,j],min:0,max:1});
 cells.forEach((c,i)=>{if(c>=0)constraints.push({ids:adjacent(i).filter(j=>cells[j]===-2),min:c,max:c});});
 const solutions=[];let nodes=0,branches=0;
 function visit(state){
  nodes++;let changed=true;
  while(changed){
   changed=false;
   for(const c of constraints){
    const yes=c.ids.filter(i=>state[i]===1).length,unknown=c.ids.filter(i=>state[i]===-1);
    if(yes>c.max||yes+unknown.length<c.min)return;
    const value=yes===c.max?0:yes+unknown.length===c.min?1:null;
    if(value!==null)for(const i of unknown){state[i]=value;changed=true;}
   }
  }
  const candidates=whites.filter(i=>state[i]===-1);
  if(!candidates.length){solutions.push(whites.filter(i=>state[i]===1));return;}
  branches++;
  candidates.sort((a,b)=>visible[b].length-visible[a].length);
  for(const value of [0,1]){const next=state.slice();next[candidates[0]]=value;visit(next);if(solutions.length>=limit)return;}
 }
 visit(cells.map(c=>c===-2?-1:0));
 return {solutions,nodes,branches};
}
