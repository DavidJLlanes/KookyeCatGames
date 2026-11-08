export const SIZE=6,RED='R';
export function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||1;}
function random(seed){const next=(Math.imul(seed,1664525)+1013904223)>>>0;return[next,next/4294967296];}
const baseCars=()=>[
 {id:'R',name:'Coche rojo',axis:'h',len:2,x:4,y:2,color:'red'},
 {id:'A',name:'Furgoneta',axis:'v',len:2,x:0,y:0,color:'blue'},
 {id:'B',name:'Taxi',axis:'v',len:2,x:1,y:0,color:'gold'},
 {id:'C',name:'Coche verde',axis:'v',len:2,x:2,y:0,color:'mint'},
 {id:'D',name:'Coche violeta',axis:'v',len:2,x:3,y:0,color:'purple'},
 {id:'E',name:'Coche turquesa',axis:'v',len:2,x:5,y:3,color:'cyan'},
 {id:'F',name:'Autobús',axis:'h',len:3,x:0,y:3,color:'orange'},
 {id:'G',name:'Coche rosa',axis:'h',len:3,x:0,y:4,color:'pink'},
 {id:'H',name:'Coche azul',axis:'h',len:2,x:0,y:5,color:'navy'},
 {id:'I',name:'Coche amarillo',axis:'h',len:2,x:3,y:5,color:'lime'}
];
function occupant(cars,x,y,except){return cars.find(c=>c.id!==except&&x>=c.x&&x<c.x+(c.axis==='h'?c.len:1)&&y>=c.y&&y<c.y+(c.axis==='v'?c.len:1));}
export function moveVehicle(cars,id,direction){
 const car=cars.find(c=>c.id===id);if(!car||![-1,1].includes(direction))return null;
 const nx=car.x+(car.axis==='h'?direction:0),ny=car.y+(car.axis==='v'?direction:0);
 const endX=nx+(car.axis==='h'?car.len:1)-1,endY=ny+(car.axis==='v'?car.len:1)-1;
 if(nx<0||ny<0||endX>=SIZE||endY>=SIZE)return null;
 const checkX=direction<0?nx+(car.axis==='h'?0:0):endX;
 const checkY=direction<0?ny+(car.axis==='v'?0:0):endY;
 if(occupant(cars,checkX,checkY,id))return null;
 return cars.map(c=>c.id===id?{...c,x:nx,y:ny}:c);
}
function legalSteps(cars,exclude=['R']){
 const list=[];for(const car of cars){if(exclude.includes(car.id))continue;for(const dir of [-1,1])if(moveVehicle(cars,car.id,dir))list.push({id:car.id,dir});}return list;
}
export function createPuzzle(config){
 let cars=baseCars();for(let i=0;i<4;i++)cars=moveVehicle(cars,'R',-1);
 cars=moveVehicle(cars,'C',1);
 let seed=config.seed>>>0,last=null;
 for(let i=0;i<config.scrambleSteps;i++){
  let choices=legalSteps(cars);if(last&&choices.length>1)choices=choices.filter(m=>m.id!==last.id||m.dir!==-last.dir);
  if(!choices.length)choices=legalSteps(cars,[]);
  let r;[seed,r]=random(seed);const choice=choices[Math.floor(r*choices.length)];cars=moveVehicle(cars,choice.id,choice.dir);last=choice;
 }
 const game={config:{...config},cars,moves:0,elapsed:0,undoCount:0,undoStack:[],selectedId:'R',counted:false,finished:false,scrambleSteps:config.scrambleSteps};
 return game;
}
export function canEscape(cars){
 const red=cars.find(c=>c.id===RED);if(!red)return false;
 for(let x=red.x+red.len;x<SIZE;x++)if(occupant(cars,x,red.y,RED))return false;
 return true;
}
export function isValidGame(game){
 if(!game||!['classic','timed','daily'].includes(game.config?.mode)||!game.config||!Array.isArray(game.cars)||game.cars.length!==10)return false;
 const ids=new Set();for(const c of game.cars){if(!c||typeof c.id!=='string'||ids.has(c.id)||!['h','v'].includes(c.axis)||![2,3].includes(c.len)||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.y<0||c.x+(c.axis==='h'?c.len:1)>SIZE||c.y+(c.axis==='v'?c.len:1)>SIZE)return false;ids.add(c.id);}
 if(!ids.has('R')||game.cars.find(c=>c.id==='R').axis!=='h'||game.cars.find(c=>c.id==='R').y!==2)return false;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(occupant(game.cars,x,y,'__none__')&&game.cars.filter(c=>x>=c.x&&x<c.x+(c.axis==='h'?c.len:1)&&y>=c.y&&y<c.y+(c.axis==='v'?c.len:1)).length>1)return false;
 return Number.isFinite(game.moves)&&Number.isFinite(game.elapsed);
}