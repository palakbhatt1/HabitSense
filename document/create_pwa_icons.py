from pathlib import Path
from PIL import Image, ImageDraw

target = Path("public/icons")
target.mkdir(parents=True, exist_ok=True)

for size, filename in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
    image = Image.new("RGB", (size, size), "#F7F7F5")
    draw = ImageDraw.Draw(image)
    scale = size / 192
    center = size / 2
    radius = size * 0.31
    draw.ellipse((center - radius, center - radius, center + radius, center + radius), fill="#374151")

    points = [
        (center - size * 0.15, center + size * 0.005),
        (center - size * 0.045, center + size * 0.105),
        (center + size * 0.17, center - size * 0.13),
    ]
    width = round(11 * scale)
    draw.line(points, fill="#FFFFFF", width=width, joint="curve")
    cap_radius = width / 2
    for x, y in (points[0], points[-1]):
        draw.ellipse((x-cap_radius, y-cap_radius, x+cap_radius, y+cap_radius), fill="#FFFFFF")

    image.save(target / filename, format="PNG", optimize=True)
