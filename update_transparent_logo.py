from PIL import Image
import numpy as np
import os

src = r"C:/Users/Ripley/.gemini/antigravity/brain/b9ec50e8-117a-4a33-8337-d26d57f6522a/.user_uploaded/media_1794613747030_0c769aa6.png"
base_dir = r"C:\Users\Ripley\.gemini\antigravity\scratch\fieldwise"
public_dir = os.path.join(base_dir, "public")
app_dir = os.path.join(base_dir, "app")
os.makedirs(public_dir, exist_ok=True)
os.makedirs(app_dir, exist_ok=True)

img = Image.open(src).convert("RGBA")
arr = np.array(img)
alpha = arr[:, :, 3]
mask = alpha > 5

rows = np.any(mask, axis=1)
cols = np.any(mask, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]

pad = 8
ymin = max(0, ymin - pad)
ymax = min(img.height, ymax + pad)
xmin = max(0, xmin - pad)
xmax = min(img.width, xmax + pad)

cropped = img.crop((xmin, ymin, xmax, ymax))
cropped.save(os.path.join(public_dir, "fieldwise-logo.png"))
cropped.save(os.path.join(public_dir, "fieldwise-logo-transparent.png"))
cropped.save(os.path.join(public_dir, "fieldwise-logo-dark.png")) # replace the old dark one too!

# Crop the emblem
emblem_arr = arr[:446, :]
emblem_mask = emblem_arr[:, :, 3] > 5
e_rows = np.any(emblem_mask, axis=1)
e_cols = np.any(emblem_mask, axis=0)
e_ymin, e_ymax = np.where(e_rows)[0][[0, -1]]
e_xmin, e_xmax = np.where(e_cols)[0][[0, -1]]

e_crop = img.crop((e_xmin - 4, e_ymin - 4, e_xmax + 4, e_ymax + 4))
e_crop.save(os.path.join(public_dir, "fieldwise-emblem.png"))
e_crop.save(os.path.join(public_dir, "fieldwise-emblem-transparent.png"))
e_crop.save(os.path.join(public_dir, "fieldwise-emblem-dark.png")) # replace old emblem too

# Square Icon for Favicon / App Icon (on clean transparent background)
max_dim = max(e_crop.size)
sq_icon = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
offset = ((max_dim - e_crop.width) // 2, (max_dim - e_crop.height) // 2)
sq_icon.paste(e_crop, offset)

sq_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(app_dir, "icon.png"))
sq_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "fieldwise-icon.png"))
sq_icon.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.ico"))
sq_icon.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(app_dir, "favicon.ico"))

# Also for dark backgrounds (like hero), create a light-text version of the logo if needed,
# or let's inspect how the logo looks on the hero background!
print("Successfully generated all transparent PNG assets!")
print(f"Logo Size: {cropped.size}, Emblem Size: {e_crop.size}")
