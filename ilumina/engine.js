/** Akari rules. Cells: -2 white, -1 unnumbered wall, 0..4 numbered wall. */
export function topology(cells,size){
 const adjacent=i=>[i%size?i-1:-1,i%size<size-1?i+1:-1,i>=size?i-size:-1,i<cells.length-size?i+size:-1].filter(j=>j>=0);
 const visible=cells.map((c,i)=>{
  if(c!==-2)return [];
  const out=[i],x=i%size,y=Math.floor(i/size);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   for(let a=x+dx,b=y+dy;a>=0&&a<size&&b>=0&&b<size;a+=dx,b+=dy){
    const j=b*size+a;if(cells[j]!==-2)break;out.push(j);
   }
  }return out;
 });
 return {visible,adjacent};
}
export function inspect(cells,size,lamps){
 const {visible,adjacent}=topology(cells,size),lit=new Set(),conflicts=new Set(),badClues=[];
 for(const i of lamps){if(cells[i]!==-2)continue;for(const j of visible[i]){lit.add(j);if(j!==i&&lamps.includes(j)){conflicts.add(i);conflicts.add(j);}}}
 cells.forEach((c,i)=>{if(c>=0&&adjacent(i).filter(j=>lamps.includes(j)).length!==c)badClues.push(i);});
 const dark=cells.flatMap((c,i)=>c===-2&&!lit.has(i)?[i]:[]);
 const valid=lamps.every(i=>Number.isInteger(i)&&cells[i]===-2)&&new Set(lamps).size===lamps.length;
 return {lit:[...lit],conflicts:[...conflicts],badClues,dark,won:valid&&!dark.length&&!conflicts.size&&!badClues.length};
}
