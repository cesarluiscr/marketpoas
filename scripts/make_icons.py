"""
Genera los íconos PWA de MarketPoás con la nueva identidad visual:
- Fondo: gradiente verde volcán (#0a3d2e -> #1a6b4a)
- Volcán con crater y sol dorado (estilo Volcán Poás)
"""
from PIL import Image, ImageDraw
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


def draw_volcano_scene(draw, size):
    """Dibuja escena del Volcán Poás con sol, volcán, crater y humo."""
    s = size
    # Sol dorado
    sun_cx = int(s * 0.75)
    sun_cy = int(s * 0.25)
    sun_r = int(s * 0.10)
    # Halo del sol
    for i in range(3):
        halo_r = sun_r + i * int(s * 0.025)
        alpha_color = (212, 160, 23)
        draw.ellipse(
            [sun_cx - halo_r, sun_cy - halo_r, sun_cx + halo_r, sun_cy + halo_r],
            outline=alpha_color,
        )
    # Sol sólido
    draw.ellipse(
        [sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r],
        fill=(212, 160, 23),
    )

    # Montaña fondo izquierda (más oscura)
    base_y = int(s * 0.82)
    draw.polygon(
        [
            (0, base_y),
            (int(s * 0.18), int(s * 0.45)),
            (int(s * 0.35), int(s * 0.60)),
            (int(s * 0.50), int(s * 0.50)),
        ],
        fill=(6, 41, 32),
    )

    # Volcán principal (triángulo)
    cx = int(s * 0.50)
    peak_y = int(s * 0.20)
    base_y_main = int(s * 0.85)
    half_w = int(s * 0.42)
    draw.polygon(
        [(cx - half_w, base_y_main), (cx, peak_y), (cx + half_w, base_y_main)],
        fill=(252, 252, 245),
    )

    # Cráter (elipse oscura en la cima)
    crater_w = int(s * 0.10)
    crater_h = int(s * 0.025)
    crater_cx = cx
    crater_cy = peak_y + int(s * 0.025)
    draw.ellipse(
        [crater_cx - crater_w, crater_cy - crater_h, crater_cx + crater_w, crater_cy + crater_h],
        fill=(30, 58, 95),
    )
    # Laguna del cráter (más clara)
    laguna_w = int(s * 0.08)
    laguna_h = int(s * 0.018)
    draw.ellipse(
        [crater_cx - laguna_w, crater_cy - laguna_h, crater_cx + laguna_w, crater_cy + laguna_h],
        fill=(45, 74, 122),
    )

    # Nieve cima (pequeño triángulo blanco/azul)
    snow_w = int(s * 0.08)
    snow_y = peak_y + int(s * 0.04)
    draw.polygon(
        [
            (crater_cx - snow_w, snow_y + int(s * 0.015)),
            (crater_cx, peak_y - int(s * 0.01)),
            (crater_cx + snow_w, snow_y + int(s * 0.015)),
        ],
        fill=(220, 240, 250),
    )

    # Humo saliendo del cráter
    smoke_color = (255, 255, 255)
    # Humo 1
    draw.ellipse(
        [crater_cx - int(s * 0.025), peak_y - int(s * 0.06),
         crater_cx + int(s * 0.025), peak_y - int(s * 0.03)],
        outline=smoke_color, width=2,
    )
    # Humo 2
    draw.ellipse(
        [crater_cx + int(s * 0.005), peak_y - int(s * 0.10),
         crater_cx + int(s * 0.055), peak_y - int(s * 0.06)],
        outline=smoke_color, width=2,
    )

    # Montaña derecha (más pequeña, fondo)
    draw.polygon(
        [
            (int(s * 0.65), base_y_main),
            (int(s * 0.82), int(s * 0.40)),
            (s, base_y_main),
        ],
        fill=(6, 41, 32),
    )


def make_icon(size, name):
    # Fondo gradiente verde volcán
    TOP = (10, 61, 46)      # #0a3d2e
    BOTTOM = (26, 107, 74)  # #1a6b4a
    img = make_gradient(size, TOP, BOTTOM)
    draw = ImageDraw.Draw(img)

    # Escena del volcán
    draw_volcano_scene(draw, size)

    out = os.path.join(OUT_DIR, name)
    img.save(out, "PNG", optimize=True)
    print(f"  creado {out} ({size}x{size})")


def make_maskable(size, name):
    """Versión maskable con padding seguro."""
    TOP = (6, 41, 32)
    BOTTOM = (10, 61, 46)
    img = make_gradient(size, TOP, BOTTOM)
    draw = ImageDraw.Draw(img)

    # Zona segura central (50% del tamaño)
    inner_size = int(size * 0.62)
    offset = (size - inner_size) // 2

    # Recortar el dibujo a la zona segura
    def scale(v):
        return offset + int(v * inner_size / size)

    cx = size // 2
    # Sol más pequeño
    sun_cx = offset + int(inner_size * 0.75)
    sun_cy = offset + int(inner_size * 0.22)
    sun_r = int(inner_size * 0.08)
    draw.ellipse(
        [sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r],
        fill=(212, 160, 23),
    )

    # Volcán
    base_y = offset + int(inner_size * 0.85)
    peak_y = offset + int(inner_size * 0.15)
    half_w = int(inner_size * 0.42)
    draw.polygon(
        [(cx - half_w, base_y), (cx, peak_y), (cx + half_w, base_y)],
        fill=(252, 252, 245),
    )

    # Cráter
    crater_w = int(inner_size * 0.09)
    crater_h = int(inner_size * 0.022)
    crater_cy = peak_y + int(inner_size * 0.025)
    draw.ellipse(
        [cx - crater_w, crater_cy - crater_h, cx + crater_w, crater_cy + crater_h],
        fill=(30, 58, 95),
    )
    # Laguna
    laguna_w = int(inner_size * 0.07)
    laguna_h = int(inner_size * 0.015)
    draw.ellipse(
        [cx - laguna_w, crater_cy - laguna_h, cx + laguna_w, crater_cy + laguna_h],
        fill=(45, 74, 122),
    )

    # Nieve cima
    snow_w = int(inner_size * 0.075)
    snow_y = peak_y + int(inner_size * 0.035)
    draw.polygon(
        [
            (cx - snow_w, snow_y + int(inner_size * 0.012)),
            (cx, peak_y - int(inner_size * 0.005)),
            (cx + snow_w, snow_y + int(inner_size * 0.012)),
        ],
        fill=(220, 240, 250),
    )

    # Humo
    smoke_color = (255, 255, 255)
    draw.ellipse(
        [cx - int(inner_size * 0.022), peak_y - int(inner_size * 0.05),
         cx + int(inner_size * 0.022), peak_y - int(inner_size * 0.02)],
        outline=smoke_color, width=max(2, int(size * 0.005)),
    )
    draw.ellipse(
        [cx + int(inner_size * 0.005), peak_y - int(inner_size * 0.085),
         cx + int(inner_size * 0.05), peak_y - int(inner_size * 0.045)],
        outline=smoke_color, width=max(2, int(size * 0.005)),
    )

    out = os.path.join(OUT_DIR, name)
    img.save(out, "PNG", optimize=True)
    print(f"  creado {out} ({size}x{size} maskable)")


if __name__ == "__main__":
    print("Generando íconos PWA de MarketPoás (nuevo estilo)...")
    make_icon(192, "icon-192.png")
    make_icon(512, "icon-512.png")
    make_maskable(512, "icon-maskable-512.png")
    print("Listo.")
