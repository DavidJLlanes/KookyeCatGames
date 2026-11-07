import {WIDTH,HEIGHT,RADIUS,STEP,CANNON,LIMIT,COLORS,SYMBOLS,position} from './rules.js?v=47';

export function createRenderer(canvas) {
  const c=canvas.getContext('2d');
  function bubble(x,y,color,r=RADIUS) {
    c.save(); c.shadowColor='#263c6225';c.shadowBlur=5;c.shadowOffsetY=3;
    const gradient=c.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r);
    gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.3,COLORS[color]);gradient.addColorStop(1,COLORS[color]);
    c.fillStyle=gradient;c.beginPath();c.arc(x,y,r-1,0,Math.PI*2);c.fill();c.shadowColor='transparent';
    c.strokeStyle='#ffffffa0';c.lineWidth=1.5;c.stroke();
    c.fillStyle='white';c.font=`900 ${r*.75}px system-ui`;c.textAlign='center';c.textBaseline='middle';
    c.fillText(SYMBOLS[color],x,y+1);c.restore();
  }
  function draw(game,angle,shot) {
    const dpr=Math.min(2,window.devicePixelRatio||1);
    if(canvas.width!==WIDTH*dpr){canvas.width=WIDTH*dpr;canvas.height=HEIGHT*dpr;}
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,WIDTH,HEIGHT);
    const bg=c.createLinearGradient(0,0,0,HEIGHT);bg.addColorStop(0,'#ebf8ff');bg.addColorStop(1,'#fcf6ff');
    c.fillStyle=bg;c.fillRect(0,0,WIDTH,HEIGHT);
    c.fillStyle='#c6e5f455';for(let y=20;y<HEIGHT;y+=40)for(let x=20;x<WIDTH;x+=40){c.beginPath();c.arc(x,y,1.3,0,7);c.fill();}
    c.fillStyle='#d1e6f2';c.fillRect(18,0,4,LIMIT);c.fillRect(418,0,4,LIMIT);
    if(game.drop){c.fillStyle='#b5d5e6';c.fillRect(20,0,400,game.drop*STEP+3);}
    c.strokeStyle='#cb5c7880';c.setLineDash([7,7]);c.beginPath();c.moveTo(22,LIMIT);c.lineTo(418,LIMIT);c.stroke();c.setLineDash([]);
    if(!game.finished&&!shot){
      let x=CANNON.x,y=CANNON.y,vx=Math.sin(angle)*7,vy=-Math.cos(angle)*7;
      c.fillStyle=COLORS[game.current];
      for(let i=0;i<220;i++){
        x+=vx;y+=vy;if(x<40){x=80-x;vx=Math.abs(vx);}if(x>400){x=800-x;vx=-Math.abs(vx);}
        if(y<=24+game.drop*STEP||game.board.some(b=>{const p=position(b.r,b.c,game.drop);return Math.hypot(p.x-x,p.y-y)<RADIUS*2;}))break;
        if(i%3===0){c.globalAlpha=.4;c.beginPath();c.arc(x,y,2.5,0,7);c.fill();}
      }c.globalAlpha=1;
    }
    game.board.forEach(b=>{const p=position(b.r,b.c,game.drop);bubble(p.x,p.y,b.color);});
    c.fillStyle='#18365c';c.beginPath();c.roundRect(181,579,78,49,20);c.fill();
    c.save();c.translate(CANNON.x,CANNON.y);c.rotate(angle);c.fillStyle='#468bc5';c.beginPath();c.roundRect(-13,-49,26,49,9);c.fill();c.restore();
    if(shot)bubble(shot.x,shot.y,shot.color);else bubble(CANNON.x,CANNON.y,game.current);
    bubble(105,594,game.next,15);c.textAlign='center';c.fillStyle='#596b87';c.font='800 10px system-ui';c.fillText('SIGUIENTE',105,626);
    c.fillText('LÍMITE DEL CIELO',WIDTH/2,LIMIT+17);
  }
  return draw;
}
