"""Render a standalone Open Graph PNG, without browser/runtime dependencies."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parent
S = 2
im = Image.new('RGB', (1200*S,630*S), '#e5f6f1')
d = ImageDraw.Draw(im)
def font(size):
    return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',size*S)
def text(x,y,value,size,color):
    d.text((x*S,y*S),value,font=font(size),fill=color)
def ellipse(box,color):
    d.ellipse(tuple(int(v*S) for v in box),fill=color)
def bubble(x,y,r,color,symbol=''):
    ellipse((x-r+2,y-r+7,x+r+2,y+r+7),'#c5dbdd')
    ellipse((x-r,y-r,x+r,y+r),color)
    d.ellipse(tuple(int(v*S) for v in (x-r,y-r,x+r,y+r)),outline='white',width=3*S)
    ellipse((x-r*.6,y-r*.7,x+r*.1,y-r*.35),'#ffffff')
    if symbol:d.text((x*S,y*S),symbol,font=font(22),fill='white',anchor='mm')
ellipse((780,200,1400,820),'#dceaff')
ellipse((-150,-200,500,370),'#edfdf7')
text(65,75,'KOOKYECAT GAMES',22,'#147c70')
text(60,177,'Bubble',86,'#163952')
text(60,273,'Shooter',86,'#147c70')
text(65,404,'Apunta. Rebota. Despeja el cielo.',24,'#496b79')
text(65,469,'60 niveles · Contrarreloj · Reto diario',20,'#496b79')
colors=['#ed6090','#3f94e7','#26a68c','#ac79de','#edb83d','#ed8155']
for row in range(5):
    for col in range(7-row):
        bubble(660+col*73+row*36,94+row*64,34,colors[(col+row//2)%6],['+','o','*'][col%3])
for i in range(15):
    t=i/14;x=850+290*t;y=535-140*t
    ellipse((x-3,y-3,x+3,y+3),'#147c70')
d.rounded_rectangle((808*S,535*S,892*S,587*S),radius=18*S,fill='#204f68')
bubble(850,540,31,colors[2],'+')
im.resize((1200,630),Image.Resampling.LANCZOS).save(ROOT/'assets/cover.png',optimize=True)
print('Rendered Bubble Shooter cover.png (1200 x 630)')
