"""
Genera los íconos PNG de MarketPoás: 192, 512 y maskable-512.
Fondo degradado verde (montaña) + letra M estilizada.
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = "/home/z/my-project/public"
os.makedirs(OUT_DIR, exist_ok=True)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_gradient(size, top_color, bottom_color):
    img = Image.new("RGB", (size, size), top_color)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(size - 1, 1)
        c = lerp(top_color, bottom_color, t)
        draw.line([(0, y), (size, y)], fill=c)
    return img


def draw_mountain(draw, size, color):
    # Triángulo montaña estilizado
    cx = size // 2
    base_y = int(size * 0.78)
    peak_y = int(size * 0.20)
    half_w = int(size * 0.36)
    draw.polygon(
        [(cx - half_w, base_y), (cx, peak_y), (cx + half_w, base_y)],
        fill=color,
    )
    # Nieve/cima en blanco
    snow_w = int(size * 0.13)
    snow_y = int(size * 0.32)
    draw.polygon(
        [
            (cx - snow_w, snow_y + int(size * 0.05)),
            (cx, peak_y),
            (cx + snow_w, snow_y + int(size * 0.05)),
            (cx + int(snow_w * 0.4), snow_y + int(size * 0.1)),
            (cx, snow_y + int(size * 0.13)),
            (cx - int(snow_w * 0.4), snow_y + int(size * 0.1)),
        ],
        fill=(255, 255, 255),
    )


def make_icon(size, padding_frac, name):
    # Verde oscuro -> verde claro
    TOP = (5, 150, 105)    # emerald-600
    BOTTOM = (4, 120, 87)  # emerald-700
    SNOW = (255, 255, 255)

    img = make_gradient(size, TOP, BOTTOM)
    draw = ImageDraw.Draw(img)

    # Marco redondeado
    draw_mountain(draw, size, (255, 255, 255))

    out = os.path.join(OUT_DIR, name)
    img.save(out, "PNG", optimize=True)
    print(f"  creado {out} ({size}x{size})")


def make_maskable(size, name):
    # Maskable: fondo cubre todo el espacio (sin transparencia en los bordes)
    # Pero con padding para que el ícono no se corte
    TOP = (4, 120, 87)
    BOTTOM = (6, 95, 70)
    img = make_gradient(size, TOP, BOTTOM)
    draw = ImageDraw.Draw(img)

    # Montaña en el centro con padding seguro (~40%)
    inner_size = int(size * 0.5)
    inner_offset = (size - inner_size) // 2

    cx = size // 2
    base_y = inner_offset + int(inner_size * 0.85)
    peak_y = inner_offset + int(inner_size * 0.15)
    half_w = int(inner_size * 0.45)

    draw.polygon(
        [(cx - half_w, base_y), (cx, peak_y), (cx + half_w, base_y)],
        fill=(255, 255, 255),
    )
    # Nieve
    snow_w = int(inner_size * 0.18)
    snow_y = inner_offset + int(inner_size * 0.30)
    draw.polygon(
        [
            (cx - snow_w, snow_y + int(inner_size * 0.04)),
            (cx, peak_y),
            (cx + snow_w, snow_y + int(inner_size * 0.04)),
            (cx + int(snow_w * 0.4), snow_y + int(inner_size * 0.08)),
            (cx, snow_y + int(inner_size * 0.12)),
            (cx - int(snow_w * 0.4), snow_y + int(inner_size * 0.08)),
        ],
        fill=(TOP[0] + 20, TOP[1] + 10, TOP[2] + 5),
    )

    out = os.path.join(OUT_DIR, name)
    img.save(out, "PNG", optimize=True)
    print(f"  creado {out} ({size}x{size} maskable)")


if __name__ == "__main__":
    print("Generando íconos de MarketPoás...")
    make_icon(192, 0.08, "icon-192.png")
    make_icon(512, 0.08, "icon-512.png")
    make_maskable(512, "icon-maskable-512.png")
    print("Listo.")
