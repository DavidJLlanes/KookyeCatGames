export const DIRS=[1,2,4,8];
export function rotate(mask){return ((mask<<1)&15)|(mask>>3);}
export function options(mask){const result=[mask];for(let m=rotate(mask);m!==mask;m=rotate(m))result.push(m);return result;}
export function neighbor(i,d,n){const x=i%n,y=Math.floor(i/n);return d===0?(y?i-n:-1):d===1?(x<n-1?i+1:-1):d===2?(y<n-1?i+n:-1):(x?i-1:-1);}
export function connected(tiles,n){const seen=new Set([0]),q=[0];for(let k=0;k<q.length;k++)for(let d=0;d<4;d++){const j=neighbor(q[k],d,n);if(j>=0&&(tiles[q[k]]&DIRS[d])&&(tiles[j]&DIRS[(d+2)%4])&&!seen.has(j)){seen.add(j);q.push(j);}}return seen;}
export function solve(tiles,n,limit=2){
 let visits=0;const solutions=[];
 function search(domains){if(++visits>50000)throw Error('Solver search limit');
 let changed=true;while(changed){changed=false;for(let i=0;i<domains.length;i++){const next=domains[i].filter(m=>DIRS.every((bit,d)=>{const j=neighbor(i,d,n);return j<0?!(m&bit):domains[j].some(other=>!!(m&bit)===!!(other&DIRS[(d+2)%4]));}));if(!next.length)return;if(next.length!==domains[i].length){domains[i]=next;changed=true;}}}
 let index=-1;for(let i=0;i<domains.length;i++)if(domains[i].length>1&&(index<0||domains[i].length<domains[index].length))index=i;
 if(index<0){const solution=domains.map(a=>a[0]);if(connected(solution,n).size===n*n)solutions.push(solution);return;}
 for(const value of domains[index]){const copy=domains.map(a=>a.slice());copy[index]=[value];search(copy);if(solutions.length>=limit)return;}
 }
 search(tiles.map(options));return{solutions,visits};
}
