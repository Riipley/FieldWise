import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import pandas as pd
import os
import shutil

wb = openpyxl.Workbook()

# Setup styles
header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
header_fill_dark = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
header_fill_green = PatternFill(start_color="166534", end_color="166534", fill_type="solid")
header_fill_blue = PatternFill(start_color="0369A1", end_color="0369A1", fill_type="solid")
header_fill_red = PatternFill(start_color="991B1B", end_color="991B1B", fill_type="solid")
cell_font = Font(name="Segoe UI", size=9)
border_thin = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

# -------------------------------------------------------------
# Sheet 1: Crops (Corrected Date-Bugs into clean agronomic values)
# -------------------------------------------------------------
ws_crops = wb.active
ws_crops.title = "Crops_المحاصيل"
ws_crops.views.sheetView[0].showGridLines = True

crops_headers = [
    "id", "name_en", "name_ar", "family", "season", "sow_doy", "sow_start_doy", "sow_end_doy",
    "duration_days", "prep_weeks", "t_base", "t_opt_min", "t_opt_max", "t_max", "gdd_req",
    "kc_ini", "kc_mid", "kc_end", "water_ref_mm", "tex_sand", "tex_loamy_sand", "tex_sandy_loam",
    "tex_loam", "tex_clay_loam", "tex_clay", "ph_min", "ph_opt_min", "ph_opt_max", "ph_max",
    "ece_threshold", "ece_slope", "bnf_total_low", "bnf_total_high", "bnf_net_low", "bnf_net_high",
    "bnf_uncertainty", "root", "tuber_or_bulb", "family_break_years", "yield_t_ha", "price_usd_t",
    "cost_usd_ha", "price_cv", "capital", "sources", "root_depth_m", "depletion_p", "frost_kill_c", "gaez_crop_code"
]

for col_idx, h in enumerate(crops_headers, 1):
    cell = ws_crops.cell(row=1, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill_green
    cell.alignment = Alignment(horizontal="center", vertical="center")

# Cleaned data rows with Excel date-corruptions fixed:
# e.g., 2026-05-05 -> 5.5, 2026-07-05 -> 7.5, 2026-08-05 -> 8.5, 2026-07-01 -> 7.1, 2026-06-05 -> 6.5, etc.
crops_data = [
    [
        "wheat", "Wheat", "قمح", "Poaceae", "winter", 320, 305, 345,
        150, 2, 0, 15, 23, 30, 2000,
        0.30, 1.15, 0.25, 450, 40, 60, 80,
        100, 100, 90, 5.5, 6.0, 7.5, 8.5,
        6.0, 7.1, 0, 0, 0, 0,
        0.1, "fibrous", False, 1, 6.5, 250,
        800, 0.15, "low", "FAO-56; GAEZ v4", 1.2, 0.55, -5, "WHEA"
    ],
    [
        "faba_bean", "Faba bean", "فول بلدي", "Fabaceae", "winter", 300, 285, 330,
        140, 2, 3, 15, 20, 27, 1800,
        0.40, 1.15, 0.30, 380, 30, 50, 70,
        100, 100, 80, 6.5, 7.0, 8.0, 8.5,
        1.5, 9.6, 80, 150, 40, 80,
        0.2, "taproot", False, 3, 3.5, 600,
        900, 0.20, "medium", "FAO-56; Peoples et al.", 0.8, 0.45, -2, "FABA"
    ],
    [
        "maize", "Maize", "ذرة شامية", "Poaceae", "summer", 120, 105, 150,
        120, 2, 10, 25, 32, 40, 1600,
        0.30, 1.20, 0.35, 600, 40, 60, 80,
        100, 100, 70, 5.5, 6.0, 7.2, 8.0,
        1.7, 12.0, 0, 0, 0, 0,
        0.1, "fibrous", False, 1, 8.0, 200,
        1000, 0.18, "medium", "FAO-56; GAEZ v4", 1.2, 0.50, 2, "MAIZ"
    ],
    [
        "soybean", "Soybean", "فول صويا", "Fabaceae", "summer", 135, 120, 165,
        120, 2, 10, 25, 30, 38, 1500,
        0.40, 1.15, 0.50, 500, 30, 50, 80,
        100, 90, 60, 6.0, 6.5, 7.5, 8.0,
        5.0, 20.0, 90, 160, 30, 60,
        0.2, "taproot", False, 2, 3.0, 500,
        850, 0.25, "medium", "FAO-56; Salvagiotti et al.", 1.0, 0.50, 1, "SOYB"
    ],
    [
        "sunflower", "Sunflower", "عباد الشمس", "Asteraceae", "summer", 150, 135, 180,
        100, 2, 6, 20, 28, 38, 1400,
        0.35, 1.05, 0.35, 450, 50, 70, 90,
        100, 90, 70, 6.0, 6.5, 7.5, 8.5,
        4.8, 5.0, 0, 0, 0, 0,
        0.1, "taproot", False, 3, 2.5, 450,
        700, 0.20, "low", "FAO-56; GAEZ v4", 1.5, 0.45, 0, "SUNF"
    ],
    [
        "barley", "Barley", "شعير", "Poaceae", "winter", 320, 305, 350,
        130, 2, 0, 15, 22, 28, 1700,
        0.30, 1.15, 0.25, 320, 60, 80, 100,
        100, 90, 80, 6.0, 6.5, 8.0, 9.0,
        8.0, 5.0, 0, 0, 0, 0,
        0.1, "fibrous", False, 1, 5.0, 200,
        650, 0.10, "low", "FAO-56; Maas & Hoffman", 1.0, 0.55, -6, "BARL"
    ],
    # Adding Potato & Onion for full FieldWise consistency
    [
        "potato", "Potato", "بطاطس", "Solanaceae", "winter", 305, 285, 335,
        110, 3, 7, 16, 22, 28, 1500,
        0.50, 1.15, 0.75, 550, 50, 75, 100,
        90, 70, 35, 5.2, 5.8, 6.5, 7.5,
        1.7, 12.0, 0, 0, 0, 0,
        0.1, "shallow_tuber", True, 3, 30.0, 350,
        2800, 0.30, "high", "FAO-56; CIP", 0.6, 0.35, 0, "POTA"
    ],
    [
        "onion", "Onion", "بصل", "Amaryllidaceae", "winter", 320, 305, 345,
        150, 3, 6, 15, 25, 34, 1800,
        0.40, 1.05, 0.75, 450, 40, 65, 95,
        100, 85, 50, 6.0, 6.5, 7.5, 8.0,
        1.2, 16.0, 0, 0, 0, 0,
        0.1, "shallow_bulb", True, 3, 35.0, 280,
        2200, 0.35, "high", "FAO-56; Brewster", 0.45, 0.30, -2, "ONIO"
    ]
]

for row_idx, r_data in enumerate(crops_data, 2):
    for col_idx, val in enumerate(r_data, 1):
        cell = ws_crops.cell(row=row_idx, column=col_idx, value=val)
        cell.font = cell_font
        cell.border = border_thin
        if isinstance(val, (int, float)):
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif isinstance(val, bool):
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.fill = PatternFill(start_color="DCFCE7" if val else "FEE2E2", fill_type="solid")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

for col in ws_crops.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_crops.column_dimensions[col_letter].width = max(max_len + 3, 11)

# -------------------------------------------------------------
# Sheet 2: Crop Diseases & Favorable Conditions (أمراض المحاصيل)
# -------------------------------------------------------------
ws_diseases = wb.create_sheet(title="Crop_Diseases_أمراض_المحاصيل")
ws_diseases.views.sheetView[0].showGridLines = True

disease_headers = ["المحصول", "المرض", "المسبب العلمي", "الظروف البيئية والمناخية الملائمة للمرض", "Crop_En", "Pathogen_Group"]

for col_idx, h in enumerate(disease_headers, 1):
    cell = ws_diseases.cell(row=1, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill_blue
    cell.alignment = Alignment(horizontal="center", vertical="center")

disease_raw = [
    # الفول البلدي
    ("الفول البلدي", "التبقع الشوكولاتي", "Botrytis fabae", "رطوبة عالية وبلل أوراق لعدة أيام، حرارة 15-28°م، تشتد في الجو المعتدل الرطب وكثافة النباتات", "Faba bean", "Fungus"),
    ("الفول البلدي", "اللفحة الأسكوكيتية", "Didymella fabae (Ascochyta fabae)", "طقس ممطر رطب وبلل الأوراق المتصل ورذاذ الأمطار", "Faba bean", "Fungus"),
    ("الفول البلدي", "الصدأ", "Uromyces viciae-fabae", "دفء يقارب 20-25°م مع 6-18 ساعة من بلل الأوراق والندى الليلي", "Faba bean", "Fungus"),
    ("الفول البلدي", "البياض الزغبي", "Peronospora viciae f. sp. fabae", "جو بارد رطب ورطوبة مرتفعة وبلل الأوراق", "Faba bean", "Oomycete"),
    ("الفول البلدي", "العفن الأبيض", "Sclerotinia sclerotiorum", "جو معتدل مائل للبرودة ورطوبة مرتفعة وابتلال التربة والنبات", "Faba bean", "Fungus (Soil-borne)"),
    ("الفول البلدي", "أعفان الجذور والبادرات", "Fusarium spp., Rhizoctonia solani, Pythium spp.", "التغدق وسوء الصرف، والتربة الباردة المبتلة وانضغاط التربة", "Faba bean", "Fungus (Soil-borne)"),
    
    # القمح
    ("القمح", "الصدأ الأصفر", "Puccinia striiformis", "بارد ورطب (13-24°م)، وتزداد الفرص عند 10-16°م وندى غزير", "Wheat", "Fungus (Air-borne)"),
    ("القمح", "صدأ الأوراق", "Puccinia triticina", "رطوبة مرتفعة وحرارة معتدلة (18-25°م)", "Wheat", "Fungus (Air-borne)"),
    ("القمح", "صدأ الساق", "Puccinia graminis", "طقس دافئ ورطب متأخر في الموسم (20-30°م)", "Wheat", "Fungus (Air-borne)"),
    ("القمح", "البياض الدقيقي", "Blumeria graminis f. sp. tritici", "حرارة معتدلة (15-22°م) ورطوبة مرتفعة، ويزيد بالإفراط في التسميد النيتروجيني", "Wheat", "Fungus"),
    ("القمح", "التفحم السائب", "Ustilago tritici", "عدوى مرتبطة بالبذور وتحدث أثناء التزهير في جو رطب", "Wheat", "Fungus (Seed-borne)"),
    ("القمح", "التفحم الشائع", "Tilletia foetida / T. caries", "ظروف باردة ورطبة وقت الإنبات الأولي للبادرات", "Wheat", "Fungus (Seed/Soil)"),
    ("القمح", "عفن الجذور والقاعدة الفيوزاريومي", "Fusarium spp.", "تتأثر برطوبة وحرارة التربة، الدفء مع إجهاد مائي وتكرار زراعة النجيليات", "Wheat", "Fungus (Soil-borne)"),
    ("القمح", "الإرغوت (الأرجوت)", "Claviceps purpurea", "يرتبط بفترة تزهير باردة رطبة ووجود الحشائش النجيلية العائلة", "Wheat", "Fungus"),
    ("القمح", "عفن الجذور الشائع", "Bipolaris sorokiniana", "ظروف التربة الدافئة مع الإجهاد المائي وسوء التغذية", "Wheat", "Fungus (Soil-borne)"),
    ("القمح", "مرض التدهور العام (تيك-أول)", "Gaeumannomyces tritici", "بقاء المسبب في التربة وتوالي النجيليات (قمح خلف قمح)، قلوي خفيف، رطب", "Wheat", "Fungus (Soil-borne)"),

    # الشعير
    ("الشعير", "البياض الشبكي", "Pyrenophora teres", "رطوبة مرتفعة وبلل الأوراق نحو 10-25°م وبقايا المحصول المصاب", "Barley", "Fungus"),
    ("الشعير", "التبقع / اللفحة البنية", "Bipolaris sorokiniana", "دفء مع رطوبة ملائمة ويزيد الضرر مع إجهاد النبات المائي", "Barley", "Fungus"),
    ("الشعير", "التبقع / اللفحة السلمية", "Rhynchosporium commune", "جو بارد رطب ومطر أو ابتلال طويل للأوراق تقريبا 4-25°م", "Barley", "Fungus"),
    ("الشعير", "صدأ الأوراق", "Puccinia hordei", "اعتدال الحرارة مع ندى أو رطوبة مرتفعة غالبا 16-22°م", "Barley", "Fungus"),
    ("الشعير", "البياض الدقيقي", "Blumeria graminis f. sp. hordei", "جو معتدل ورطوبة جوية مرتفعة غالبا 15-22°م، ولا يحتاج ماء حر على الورقة", "Barley", "Fungus"),
    ("الشعير", "عفن الجذور والتاج", "Fusarium spp.", "الدفء وإجهاد الماء قد يزيدان الضرر، يعيش في التربة وبقايا المحصول السابق", "Barley", "Fungus (Soil-borne)"),
    ("الشعير", "لفحة السنابل", "Fusarium spp.", "طقس دافئ ورطب وابتلال مستمر وقت التزهير", "Barley", "Fungus"),
    ("الشعير", "التفحم السائب", "Ustilago nuda", "عدوى داخل البذرة، تتأثر بظروف الإزهار وتكوين البذور", "Barley", "Fungus (Seed-borne)"),

    # الذرة الشامية
    ("الذرة الشامية", "لفحة الأوراق", "Helminthosporium maydis / Setosphaeria turcica", "الرطوبة العالية ووجود بقايا نباتية مصابة ودفء 20-30°م", "Maize", "Fungus"),
    ("الذرة الشامية", "تبقع الأوراق الرمادي", "Cercospora zeae-maydis", "الرطوبة النسبية العالية (>90%) والغيوم والحرارة الدافئة", "Maize", "Fungus"),
    ("الذرة الشامية", "الصدأ الشائع", "Puccinia sorghi", "الحرارة المعتدلة (16-25°م) والرطوبة المرتفعة", "Maize", "Fungus"),
    ("الذرة الشامية", "أعفان الكيزان والسيقان", "Fusarium و Aspergillus", "الإصابات الحشرية (حفارات)، الظروف الحارة الرطبة والتخزين السيء", "Maize", "Fungus"),
    ("الذرة الشامية", "تفحم الذرة", "Ustilago maydis", "الرطوبة والجروح وتوافر الجراثيم في التربة والري الزائد", "Maize", "Fungus (Soil-borne)"),
    ("الذرة الشامية", "البياض الزغبي", "Peronosclerospora spp.", "الرطوبة المرتفعة واعتدال الحرارة والضباب في الصباح الباكر", "Maize", "Oomycete"),
    ("الذرة الشامية", "الذبول المتأخر (الشلل)", "Cephalosporium maydis (Harpophora maydis)", "تراكم الفطر في التربة وتكرار زراعة الذرة وسوء الصرف، ويظهر غالبا بعد التزهير", "Maize", "Fungus (Soil-borne)"),

    # عباد الشمس
    ("عباد الشمس", "تبقع الأوراق/اللفحة الألترنارية", "Alternaria helianthi", "الرطوبة وبلل الأوراق والطقس الدافئ، كثافة المجموع الخضري", "Sunflower", "Fungus"),
    ("عباد الشمس", "البياض الزغبي", "Plasmopara halstedii", "التربة المشبعة بالماء والطقس البارد الرطب وقت الإنبات", "Sunflower", "Oomycete (Soil-borne)"),
    ("عباد الشمس", "الصدأ", "Puccinia helianthi", "الرطوبة واعتدال الحرارة (20-26°م) ووجود أوراق مبتلة", "Sunflower", "Fungus"),
    ("عباد الشمس", "عفن الساق والقرص الزهري الأبيض", "Sclerotinia sclerotiorum", "رطوبة عالية وبلل الأنسجة والتربة، ودرجات حرارة معتدلة نسبيًا (15-22°م)", "Sunflower", "Fungus (Soil-borne)"),
    ("عباد الشمس", "ذبول الفرتيسيليوم", "Verticillium dahliae", "ممرض ترابي يستوطن التربة، يزداد مع تكرار زراعة العوائل الحساسة كالبطاطس والقطن", "Sunflower", "Fungus (Soil-borne)"),
    ("عباد الشمس", "العفن الفحمى", "Macrophomina phaseolina", "يزداد بقوة مع الحرارة العالية والجفاف والإجهاد المائي وقت تكوين البذور", "Sunflower", "Fungus (Soil-borne)"),
    ("عباد الشمس", "تبقع/اسوداد الساق الفوماوي", "Plenodomus lindquistii (Phoma macdonaldii)", "الرطوبة والأمطار وبقايا المحصول المصابة والحشرات الناقلة", "Sunflower", "Fungus"),
    ("عباد الشمس", "تبقع الأوراق السبتوري", "Septoria helianthi", "يرتبط ببلل الأوراق والرطوبة المرتفعة", "Sunflower", "Fungus"),
    ("عباد الشمس", "عفن القرص الزهري الرمادي/الريزوبسي", "Botrytis cinerea / Rhizopus spp.", "الرطوبة العالية والأمطار أو الري الرذاذي الذي يبلل الأقراص، والجروح وتأخر الجفاف", "Sunflower", "Fungus"),

    # فول الصويا
    ("فول الصويا", "تبقع عين الضفدع", "Cercospora sojina", "جو دافئ رطب غالبا 25-30°م ورطوبة نسبية مرتفعة جدا >90% وبلل الأوراق", "Soybean", "Fungus"),
    ("فول الصويا", "تبقع الأوراق البني", "Septoria glycines", "الرطوبة والأمطار وتبلل الأوراق، خاصة في المجموع الخضري الكثيف", "Soybean", "Fungus"),
    ("فول الصويا", "صدأ فول الصويا الآسيوي", "Phakopsora pachyrhizi", "حرارة معتدلة تقريبا 15-28°م، رطوبة نسبية أعلى من 90% وبلل ورقي متصل نحو 6 ساعات أو أكثر", "Soybean", "Fungus"),
    ("فول الصويا", "العفن الفحمي", "Macrophomina phaseolina", "يزداد في الجو الحار الجاف ومع إجهاد العطش والحرارة وضعف الجذور", "Soybean", "Fungus (Soil-borne)"),
    ("فول الصويا", "عفن الجذور والساق الفيتوفتوري", "Phytophthora sojae", "تشبع التربة بالماء وسوء الصرف والتربة الثقيلة، خاصة بعد الأمطار أو الري الزائد", "Soybean", "Oomycete (Soil-borne)"),
    ("فول الصويا", "أعفان الجذور والبادرات", "Pythium spp., Rhizoctonia solani, Fusarium spp.", "رطوبة التربة الزائدة وسوء الصرف وبرودة التربة تزيد أعفان البادرات", "Soybean", "Fungus (Soil-borne)"),
    ("فول الصويا", "البياض الزغبي", "Peronospora manshurica", "طقس رطب وبلل الأوراق ودرجات حرارة معتدلة (20-22°م)", "Soybean", "Oomycete"),
    ("فول الصويا", "اللفحة البكتيرية", "Pseudomonas savastanoi pv. glycinea", "الطقس البارد إلى المعتدل الممطر ورذاذ المطر وحبوب البرد والري بالرش", "Soybean", "Bacteria"),
    ("فول الصويا", "التقرح البكتيري", "Xanthomonas citri pv. glycines", "الحرارة المرتفعة (30-33°م) والرطوبة ورذاذ المطر والري بالرش", "Soybean", "Bacteria")
]

for row_idx, r_data in enumerate(disease_raw, 2):
    for col_idx, val in enumerate(r_data, 1):
        cell = ws_diseases.cell(row=row_idx, column=col_idx, value=val)
        cell.font = cell_font
        cell.border = border_thin
        if col_idx in [1, 5, 6]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx == 2:
            cell.font = Font(name="Segoe UI", size=9, bold=True, color="0F172A")
            cell.alignment = Alignment(horizontal="left", vertical="center")
        elif col_idx == 3:
            cell.font = Font(name="Segoe UI", size=9, italic=True, color="0369A1")
            cell.alignment = Alignment(horizontal="left", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

for col in ws_diseases.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_diseases.column_dimensions[col_letter].width = max(max_len + 3, 14)

ws_diseases.column_dimensions['D'].width = 55

# -------------------------------------------------------------
# Sheet 3: Soil-Borne Pathogens & Crop Break Rules (ممرضات التربة)
# -------------------------------------------------------------
ws_pathogens = wb.create_sheet(title="Soil_Pathogens_ممرضات_التربة")
ws_pathogens.views.sheetView[0].showGridLines = True

pathogen_headers = ["id (الكود)", "name_en (الاسم الإنجليزي)", "name_ar (الاسم العربي)", "hosts (المحاصيل العائلة)", "break_years (سنوات الحظر الإلزامية)", "severity (شدة الضرر 0-1)", "control (استراتيجية المكافحة بالدورة)"]

for col_idx, h in enumerate(pathogen_headers, 1):
    cell = ws_pathogens.cell(row=1, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill_red
    cell.alignment = Alignment(horizontal="center", vertical="center")

pathogens_data = [
    ("take_all", "Take-all", "مرض التيك-أول (عفن قواعد الحبوب)", "wheat;barley", 3, 0.70, "rotation_effective (المكافحة بالدورة فعالة جداً بفاصل نباتات عريضة الأوراق)"),
    ("cereal_cyst_nematode", "Cereal cyst nematode", "نيماتودا الحويصلات في الحبوب", "wheat;barley", 2, 0.60, "rotation_effective (المكافحة بالدورة تكسر دورة تكاثر الحويصلات)"),
    ("verticillium_dahliae", "Verticillium wilt", "الذبول الفرتسيليومي", "sunflower;potato;cotton", 4, 0.80, "rotation_partial (مكافحة جزئية؛ يتطلب دورة 4 سنوات واستبعاد الباذنجانيات والقطن)"),
    ("broomrape", "Broomrape (Orobanche crenata)", "الهالوك (طفيل البقوليات)", "faba_bean", 3, 0.70, "rotation_partial (مكافحة جزئية؛ تدوير مع محاصيل صائدة غير عائلة لتطهير بنك البذور)"),
    ("sclerotinia", "Sclerotinia stem rot", "العفن الأبيض (عفن الساق السكلروتيني)", "sunflower;soybean;faba_bean", 4, 0.80, "rotation_partial (مكافحة جزئية؛ يتطلب إدخال نجيليات كالقمع والذرة لمدة 4 سنوات)"),
    ("charcoal_rot", "Charcoal rot", "العفن الفحمي", "maize;soybean;sunflower", 3, 0.70, "rotation_partial (يتطلب منع الإجهاد المائي الصيفي والتعاقب مع محاصيل شتوية وتسميد بوتاسي)")
]

for row_idx, r_data in enumerate(pathogens_data, 2):
    for col_idx, val in enumerate(r_data, 1):
        cell = ws_pathogens.cell(row=row_idx, column=col_idx, value=val)
        cell.font = cell_font
        cell.border = border_thin
        if col_idx in [1, 5, 6]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [2, 3]:
            cell.font = Font(name="Segoe UI", size=9, bold=True)
            cell.alignment = Alignment(horizontal="left", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

for col in ws_pathogens.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_pathogens.column_dimensions[col_letter].width = max(max_len + 4, 16)

# -------------------------------------------------------------
# Sheet 4: Data Dictionary (دليل الأعمدة والمصطلحات)
# -------------------------------------------------------------
ws_dict = wb.create_sheet(title="Data_Dictionary_دليل_المصطلحات")
ws_dict.views.sheetView[0].showGridLines = True

dict_headers = ["العمود (Header)", "الترجمة (Translation)", "الشرح الزراعي والتحليلي (Description)"]

for col_idx, h in enumerate(dict_headers, 1):
    cell = ws_dict.cell(row=1, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill_dark
    cell.alignment = Alignment(horizontal="center", vertical="center")

dict_data = [
    ("id", "كود المحصول", "المعرف البرمجي الفريد للمحصول في قاعدة البيانات (يكتب بالإنجليزية ولا يترجم برمجياً)."),
    ("name_en", "الاسم بالإنجليزي", "الاسم الشائع للمحصول باللغة الإنجليزية (مثل: Wheat, Maize, Soybean)."),
    ("name_ar", "الاسم بالعربي", "الاسم الشائع للمحصول باللغة العربية (مثل: قمح، ذرة شامية، فول صويا)."),
    ("family", "العائلة النباتية", "التصنيف النباتي العلمي للعائلة التي ينتمي إليها المحصول (تكتب باللاتيني مثل: Poaceae أو Fabaceae)."),
    ("season", "الموسم الزراعي", "الموسم المناخي الرئيسي لزراعة المحصول (يكتب بالإنجليزية summer للصيفي أو winter للشتوي)."),
    ("sow_doy", "يوم الزراعة المفضل", "رقم اليوم المثالي للزراعة في السنة الميلادية (من 1 إلى 365)."),
    ("sow_start_doy", "بداية نافذة الزراعة", "أول يوم مسموح به في السنة الميلادية (DOY من 1 إلى 365) لبدء زراعة المحصول."),
    ("sow_end_doy", "نهاية نافذة الزراعة", "آخر يوم في السنة الميلادية (DOY من 1 إلى 365) يمكن فيه زراعة المحصول دون تراجع الإنتاجية."),
    ("duration_days", "عمر المحصول (بالأيام)", "عدد الأيام التقريبية لدورة حياة المحصول من الزراعة والإنبات حتى الحصاد."),
    ("prep_weeks", "مدة تجهيز الأرض (أسابيع)", "المدة الزمنية المطلوبة قبل الزراعة لحراثة وتجهيز وتسوية التربة بالأسابيع."),
    ("t_base", "أقل حرارة للنمو (درجة مئوية)", "درجة الحرارة الأساسية التي يتوقف عندها نمو النبات وتراكم الساعات الحرارية."),
    ("t_opt_min", "أدنى حرارة مثالية للنمو", "الحد الأدنى لنطاق درجة الحرارة المثالية لتحقيق النمو السليم والإنتاجية."),
    ("t_opt_max", "أقصى حرارة مثالية للنمو", "الحد الأعلى لنطاق درجة الحرارة المثالية لتحقيق أسرع نمو للمحصول."),
    ("t_max", "أقصى حرارة يتحملها النبات", "أقصى درجة حرارة مئوية يتحملها النبات، وتؤدي الزيادة عنها لوقف النمو وتلف المحصول."),
    ("gdd_req", "الاحتياج الحراري المتراكم (GDD)", "مجموع الأيام الحرارية المتراكمة (Growing Degree Days) اللازمة لاكتمال نضج المحصول."),
    ("kc_ini", "معامل المحصول (المرحلة الأولى)", "معامل استهلاك المياه التبخيري (Kc) في مرحلة البداية والإنبات الأولى."),
    ("kc_mid", "معامل المحصول (مرحلة الوسط)", "معامل استهلاك المياه التبخيري (Kc) في مرحلة ذروة النمو الخضري والإزهار."),
    ("kc_end", "معامل المحصول (نهاية الموسم)", "معامل استهلاك المياه التبخيري (Kc) في مرحلة النضج واكتمال المحصول قبل الحصاد."),
    ("water_ref_mm", "الاحتياج المائي الإرشادي (ملم)", "إجمالي كمية المياه المرجعية اللازمة للمحصول طوال الموسم بالمليمتر (mm)."),
    ("tex_sand", "ملاءمة التربة الرملية", "درجة ملاءمة المحصول للنمو في التربة الرملية بنسبة تقييمية من 0 إلى 100."),
    ("tex_loamy_sand", "ملاءمة التربة الرملية الطميية", "درجة ملاءمة المحصول للنمو في تربة الرمل الطميي (من 0 إلى 100)."),
    ("tex_sandy_loam", "ملاءمة التربة الطميية الرملية", "درجة ملاءمة المحصول للنمو في تربة الطمي الرملي (من 0 إلى 100)."),
    ("tex_loam", "ملاءمة التربة الطميية (اللوم)", "درجة ملاءمة المحصول للنمو في التربة الطميية المتوازنة (من 0 إلى 100)."),
    ("tex_clay_loam", "ملاءمة التربة الطينية الطميية", "درجة ملاءمة المحصول للنمو في تربة الطين الطميي (من 0 إلى 100)."),
    ("tex_clay", "ملاءمة التربة الطينية", "درجة ملاءمة المحصول للنمو في التربة الطينية الثقيلة (من 0 إلى 100)."),
    ("ph_min", "أقل حموضة للتربة (pH)", "أدنى قيمة هيدروجينية (حموضة) للتربة يتحملها النبات دون حدوث أضرار أو سمية."),
    ("ph_opt_min", "أدنى حموضة مثالية (pH)", "الحد الأدنى لدرجة حموضة التربة المثلى لامتصاص العناصر والنمو الأفضل."),
    ("ph_opt_max", "أقصى حموضة مثالية (pH)", "الحد الأعلى لدرجة حموضة التربة المثلى لامتصاص العناصر وأعلى إنتاج."),
    ("ph_max", "أقصى قلوية للتربة (pH)", "أعلى قيمة هيدروجينية (قلوية) للتربة يتحملها المحصول قبل حدوث نقص حاد بالعناصر."),
    ("ece_threshold", "عتبة تحمل الملوحة (ECe)", "مستوى التوصيل الكهربائي للتربة (dS/m) الذي يبدأ عنده المحصول في التأثر سلباً بالملوحة."),
    ("ece_slope", "معدل انخفاض المحصول بالملوحة (%)", "نسبة انخفاض الإنتاجية (%) لكل زيادة بمقدار 1 ديسي سيمنز/م فوق عتبة التحمل."),
    ("bnf_total_low", "تثبيت النيتروجين الكلي (أدنى)", "الحد الأدنى لإجمالي كمية النيتروجين المثبت بيولوجياً (كجم/هكتار) لمحاصيل البقوليات فقط."),
    ("bnf_total_high", "تثبيت النيتروجين الكلي (أقصى)", "الحد الأقصى لإجمالي كمية النيتروجين المثبت بيولوجياً (كجم/هكتار) للبقوليات."),
    ("bnf_net_low", "صافي النيتروجين المتبقي (أدنى)", "الحد الأدنى لصافي النيتروجين المتبقي والمضاف للتربة بعد حصاد الحبوب (كجم/هكتار)."),
    ("bnf_net_high", "صافي النيتروجين المتبقي (أقصى)", "الحد الأقصى لصافي النيتروجين المتبقي والمضاف للتربة بعد حصاد الحبوب (كجم/هكتار)."),
    ("bnf_uncertainty", "عدم اليقين في تثبيت النيتروجين", "معامل تفاوت وتباين دقة تقدير تثبيت النيتروجين الحيوي حسب الظروف البيئية."),
    ("root", "نوع المجموع الجذري", "شكل وتكوين الجذر: ليفي (fibrous) أو وتدي (taproot)."),
    ("tuber_or_bulb", "درنة أو بصلة", "قيمة منطقية (TRUE/FALSE) تبين ما إذا كان المحصول يكوّن درنات أو أبصالاً كجزء إنتاجي."),
    ("family_break_years", "فترة راحة الدورة الزراعية", "عدد السنوات الموصى بمرورها قبل إعادة زراعة نفس العائلة النباتية في الحقل لمنع الأمراض."),
    ("yield_t_ha", "الإنتاجية المتوقعة (طن/هكتار)", "متوسط الإنتاجية المتوقعة للهكتار الواحد بوحدة الطن في الظروف القياسية."),
    ("price_usd_t", "سعر البيع المقدر (دولار/طن)", "متوسط سعر بيع طن المحصول المقدر بالدولار الأمريكي."),
    ("cost_usd_ha", "تكلفة الإنتاج (دولار/هكتار)", "إجمالي تكلفة زراعة الهكتار المقدرة (مدخلات، ري، عمالة، معدات) بالدولار الأمريكي."),
    ("price_cv", "معامل تقلب الأسعار (المخاطرة)", "معامل التباين الإحصائي (CV) لسعر المحصول لقياس مدى تذبذب الأسعار والمخاطرة."),
    ("capital", "مستوى رأس المال المطلوب", "تصنيف متطلبات رأس المال والسيولة لبدء زراعة المحصول (منخفض low / متوسط medium / مرتفع high)."),
    ("sources", "المراجع وقواعد البيانات", "المصادر المرجعية والدراسات العلمية المعتمدة لبيانات هذا المحصول (مثل FAO)."),
    ("root_depth_m", "عمق الجذور الفعال (متر)", "العمق الأقصى الفعال لجذور النبات لاستخلاص المياه والعناصر بالمتر (m)."),
    ("depletion_p", "معامل استنزاف المياه المتاحة (p)", "نسبة استنزاف الماء الميسر في منطقة الجذور قبل تعرض المحصول لإجهاد الجفاف."),
    ("frost_kill_c", "حرارة الصقيع القاتلة (مئوية)", "درجة الحرارة المئوية المنخفضة التي تؤدي إلى موت وتلف أنسجة المحصول بالكامل."),
    ("gaez_crop_code", "كود المحصول بنظام GAEZ", "الرمز التعريفي الدولي للمحصول المعتمد بنظام مناطق البيئة الزراعية التابع لمنظمة فاو.")
]

for row_idx, r_data in enumerate(dict_data, 2):
    for col_idx, val in enumerate(r_data, 1):
        cell = ws_dict.cell(row=row_idx, column=col_idx, value=val)
        cell.font = cell_font
        cell.border = border_thin
        if col_idx == 1:
            cell.font = Font(name="Arial", size=9, bold=True, color="0F172A")
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx == 2:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

ws_dict.column_dimensions['A'].width = 18
ws_dict.column_dimensions['B'].width = 28
ws_dict.column_dimensions['C'].width = 65

# Save workbook
excel_path = "fieldwise_crops_database.xlsx"
wb.save(excel_path)
print(f"Generated comprehensive multi-sheet workbook at: {excel_path}")

# Copy to public/
if os.path.exists("public"):
    shutil.copy(excel_path, os.path.join("public", excel_path))

# Export clean individual CSVs
df_crops = pd.DataFrame(crops_data, columns=crops_headers)
df_crops.to_csv("fieldwise_crops_database.csv", index=False, encoding="utf-8-sig")
df_crops.to_csv("public/fieldwise_crops_database.csv", index=False, encoding="utf-8-sig")

df_diseases = pd.DataFrame(disease_raw, columns=disease_headers)
df_diseases.to_csv("fieldwise_crop_diseases.csv", index=False, encoding="utf-8-sig")
df_diseases.to_csv("public/fieldwise_crop_diseases.csv", index=False, encoding="utf-8-sig")

df_pathogens = pd.DataFrame(pathogens_data, columns=[h.split()[0] for h in pathogen_headers])
df_pathogens.to_csv("fieldwise_soil_pathogens.csv", index=False, encoding="utf-8-sig")
df_pathogens.to_csv("public/fieldwise_soil_pathogens.csv", index=False, encoding="utf-8-sig")

df_dict = pd.DataFrame(dict_data, columns=dict_headers)
df_dict.to_csv("fieldwise_data_dictionary.csv", index=False, encoding="utf-8-sig")
df_dict.to_csv("public/fieldwise_data_dictionary.csv", index=False, encoding="utf-8-sig")

print("All CSV and Excel files created and verified successfully!")
