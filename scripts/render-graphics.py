"""Render the bright KookyeCatGames PWA icons and social card."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]; ASSETS=ROOT/'assets'
def font(size,bold=False):
    p='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(p,size) if Path(p).exists() else ImageFont.load_default()
def icon(size):
    im=Image.new('RGB',(size,size),'#38b6f4'); d=ImageDraw.Draw(im); s=size/128
    def box(coords,r,color): d.rounded_rectangle(tuple(int(x*s) for x in coords),radius=int(r*s),fill=color)
    box((0,0,127,127),29,'#38b6f4'); d.ellipse(tuple(int(x*s) for x in (91,2,124,35)),fill='#ffdf55'); box((16,16,112,112),19,'#7757bd');box((23,23,105,105),12,'#fff9ed')
    for y,cols in [(26,[57]),(42,[41,57,73]),(58,[25,41,57,73,89]),(74,[41,57,73]),(90,[57])]:
        for x in cols:box((x,y,x+14,y+14),3,'#f66caa')
    return im
def social():
    im=Image.new('RGB',(1200,630),'#36aff1');d=ImageDraw.Draw(im)
    d.ellipse((750,0,1250,500),fill='#8bdef5');d.ellipse((850,390,1400,880),fill='#62c993')
    d.rounded_rectangle((785,115,1095,425),radius=44,fill='#7757bd');d.rounded_rectangle((804,134,1076,406),radius=27,fill='#fff9ed')
    tile=49
    for row,cols in enumerate(([2],[1,2,3],[0,1,2,3,4],[1,2,3],[2])):
        for col in cols:
            x=814+col*51;y=144+row*51
            d.rounded_rectangle((x,y,x+tile,y+tile),radius=10,fill='#f66caa')
    d.text((70,112),'KOOKYECAT GAMES',font=font(36,True),fill='#fff2ae')
    d.text((70,192),'Un mundo de juegos',font=font(55,True),fill='white')
    d.text((70,262),'para disfrutar.',font=font(60,True),fill='#ffdf55')
    d.text((72,367),'Picross · Retos · Trofeos',font=font(26,True),fill='white')
    d.rounded_rectangle((70,449,331,516),radius=28,fill='#ffdf55');d.text((95,465),'JUEGA AHORA',font=font(23,True),fill='#17223f')
    return im
for n in (32,180,192,512):icon(n).save(ASSETS/({32:'favicon-32.png',180:'apple-touch-icon.png',192:'icon-192.png',512:'icon-512.png'}[n]),optimize=True)
social().save(ASSETS/'og-games.png',optimize=True)
