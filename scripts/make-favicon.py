"""Generate favicon.ico with Geist Black font, white text on black background."""
import os, tempfile
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

WOFF2_PATH = "node_modules/.pnpm/next@16.1.7_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.59.1_react-d_1de8f0c4af626d36792e61638dad511b/node_modules/next/dist/next-devtools/server/font/geist-latin.woff2"

# Convert woff2 → ttf in a temp file
font_tt = TTFont(WOFF2_PATH)
tmp = tempfile.NamedTemporaryFile(suffix=".ttf", delete=False)
font_tt.save(tmp.name)
font_tt.close()

# Render at 256px then downscale for sharpness
SIZE = 256
img = Image.new("RGB", (SIZE, SIZE), "black")
draw = ImageDraw.Draw(img)

# Load Geist at a size that fills the square nicely
font = ImageFont.truetype(tmp.name, size=88)
text = "W.S."

# Center the text
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
x = (SIZE - tw) / 2 - bbox[0]
y = (SIZE - th) / 2 - bbox[1]
draw.text((x, y), text, fill="white", font=font)

# Save ICO with multiple sizes
sizes = [(16, 16), (32, 32), (48, 48)]
img.save("app/favicon.ico", format="ICO", sizes=sizes)
print("favicon.ico → app/favicon.ico")

# Also save a 180px apple-touch-icon
img.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png")
print("apple-touch-icon.png → public/apple-touch-icon.png")

os.unlink(tmp.name)
