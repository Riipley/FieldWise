from PIL import Image
import numpy as np
import os

src = r"C:/Users/Ripley/.gemini/antigravity/brain/b9ec50e8-117a-4a33-8337-d26d57f6522a/.user_uploaded/media_1794612787952_b93a7a3c.jpg"
base_dir = r"C:\Users\Ripley\.gemini\antigravity\scratch\fieldwise"
public_dir = os.path.join(base_dir, "public")
app_dir = os.path.join(base_dir, "app")
os.makedirs(public_dir, exist_ok=True)
os.makedirs(app_dir, exist_ok=True)

img = Image.open(src).convert("RGBA")

# 1. Save original to public
img.convert("RGB").save(os.path.join(public_dir, "fieldwise-logo-original.jpg"), quality=95)

# 2. Bounding box of content
arr = np.array(img)
rgb = arr[:, :, :3]
mask = np.sum(rgb, axis=2) > 25
rows = np.any(mask, axis=1)
cols = np.any(mask, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]

pad = 15
ymin = max(0, ymin - pad)
ymax = min(img.height, ymax + pad)
xmin = max(0, xmin - pad)
xmax = min(img.width, xmax + pad)

cropped = img.crop((xmin, ymin, xmax, ymax))
cropped.save(os.path.join(public_dir, "fieldwise-logo-dark.png"))

# 3. Transparent version
arr_crop = np.array(cropped).astype(float)
brightness = np.max(arr_crop[:, :, :3], axis=2)
# smooth alpha curve
alpha = np.clip((brightness - 10) / (50 - 10) * 255, 0, 255)
arr_trans = arr_crop.copy()
arr_trans[:, :, 3] = alpha
img_trans = Image.fromarray(arr_trans.astype(np.uint8))
img_trans.save(os.path.join(public_dir, "fieldwise-logo-transparent.png"))

# 4. Emblem only (the circular satellite + landscape + leaf)
# In original 1024x682: emblem is roughly y from 75 to 450, x from 280 to 740
emblem_crop = img.crop((280, 65, 740, 455))
emblem_crop.save(os.path.join(public_dir, "fieldwise-emblem-dark.png"))

arr_emb = np.array(emblem_crop).astype(float)
br_emb = np.max(arr_emb[:, :, :3], axis=2)
alpha_emb = np.clip((br_emb - 10) / (50 - 10) * 255, 0, 255)
arr_emb[:, :, 3] = alpha_emb
img_emb_trans = Image.fromarray(arr_emb.astype(np.uint8))
img_emb_trans.save(os.path.join(public_dir, "fieldwise-emblem-transparent.png"))

# 5. Square App Icon & Favicon (512x512)
icon_size = 512
icon_bg = Image.new("RGBA", (icon_size, icon_size), (11, 29, 40, 255))
scale = 440 / max(emblem_crop.width, emblem_crop.height)
new_w = int(emblem_crop.width * scale)
new_h = int(emblem_crop.height * scale)
emblem_resized = emblem_crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
paste_x = (icon_size - new_w) // 2
paste_y = (icon_size - new_h) // 2
icon_bg.paste(emblem_resized, (paste_x, paste_y), emblem_resized)

icon_bg.save(os.path.join(public_dir, "fieldwise-icon.png"))
icon_bg.save(os.path.join(app_dir, "icon.png"))
icon_bg.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.ico"))
icon_bg.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(app_dir, "favicon.ico"))

print("All FieldWise brand assets created successfully:")
print("1. public/fieldwise-logo-dark.png (Cropped full logo on dark background)")
print("2. public/fieldwise-logo-transparent.png (Full logo with transparency)")
print("3. public/fieldwise-emblem-dark.png (Emblem circular icon)")
print("4. public/fieldwise-emblem-transparent.png (Emblem transparent)")
print("5. public/fieldwise-icon.png (Square 512x512 app icon)")
print("6. public/favicon.ico & app/icon.png (Browser tab favicon)")
