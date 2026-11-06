"""Render install and social graphics from the KookyeCatGames vector identity."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def render_icon(size):
    image = Image.new("RGBA", (size, size), "#191624")
    scale = size / 128
    draw = ImageDraw.Draw(image)
    margin = int(14 * scale)
    rounded(draw, (margin, margin, size - margin, size - margin), int(27 * scale), "#30243b")
    cell = int(size * .18)
    gap = int(size * .035)
    grid_size = cell * 3 + gap * 2
    start_x = (size - grid_size) // 2
    start_y = (size - grid_size) // 2
    fills = ["#b58aff", "#ff91c3", "#352a49", "#a97af7", "#d3a4ff", "#ff91c3", "#352a49", "#a97af7", "#bd90ff"]
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tiles = ImageDraw.Draw(layer)
    for row in range(3):
        for column in range(3):
            x = start_x + column * (cell + gap)
            y = start_y + row * (cell + gap)
            rounded(tiles, (x, y, x + cell, y + cell), int(6 * scale), fills[row * 3 + column], "#292238", max(1, int(2 * scale)))
    layer = layer.rotate(8, resample=Image.Resampling.BICUBIC, center=(size // 2, size // 2))
    image.alpha_composite(layer)
    draw = ImageDraw.Draw(image)
    cx, cy = int(size * .82), int(size * .22)
    radius = max(2, int(size * .05))
    points = [(cx, cy - radius), (cx + radius * .35, cy - radius * .35), (cx + radius, cy), (cx + radius * .35, cy + radius * .35), (cx, cy + radius), (cx - radius * .35, cy + radius * .35), (cx - radius, cy), (cx - radius * .35, cy - radius * .35)]
    draw.polygon(points, fill="#cefa8c")
    return image.convert("RGB")


def render_social():
    width, height = 1200, 630
    image = Image.new("RGB", (width, height))
    pixels = image.load()
    start, middle, end = (21, 19, 30), (48, 32, 68), (87, 44, 87)
    for y in range(height):
        for x in range(width):
            blend = min(1, (x / width * .7 + y / height * .3))
            left, right, t = (start, middle, blend / .55) if blend < .55 else (middle, end, (blend - .55) / .45)
            pixels[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(left, right))
    draw = ImageDraw.Draw(image, "RGBA")
    for radius in range(230, 510, 42):
        draw.ellipse((950 - radius, 310 - radius, 950 + radius, 310 + radius), outline=(255, 115, 184, 35), width=2)
    rounded(draw, (775, 185, 1080, 490), 36, "#191624", "#89629d", 3)
    tile, gap, x0, y0 = 50, 7, 812, 222
    pattern = [1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0]
    for index, filled in enumerate(pattern):
        col, row = index % 5, index // 5
        x, y = x0 + col * (tile + gap), y0 + row * (tile + gap)
        rounded(draw, (x, y, x + tile, y + tile), 10, "#b58aff" if filled else "#302b40")
    draw.text((100, 120), "KOOKYE CAT · GAMES ARCADE", fill="#cefa8c", font=font(22, True), spacing=6)
    draw.text((100, 210), "Un juego más.", fill="#ffffff", font=font(76, True))
    draw.text((100, 298), "Solo uno más.", fill="#ff73b8", font=font(76, True))
    draw.text((102, 395), "Minijuegos, retos y trofeos. Gratis y en tu dispositivo.", fill="#d5d0df", font=font(24))
    rounded(draw, (100, 470, 325, 525), 12, "#ff73b8")
    draw.text((124, 484), "JUEGA AHORA  ↗", fill="#231324", font=font(18, True))
    return image


ASSETS.mkdir(parents=True, exist_ok=True)
render_icon(192).save(ASSETS / "icon-192.png", optimize=True)
render_icon(512).save(ASSETS / "icon-512.png", optimize=True)
render_icon(180).save(ASSETS / "apple-touch-icon.png", optimize=True)
render_icon(32).save(ASSETS / "favicon-32.png", optimize=True)
render_social().save(ASSETS / "og-games.png", optimize=True)
print("Rendered app icons and Open Graph image in assets/.")
