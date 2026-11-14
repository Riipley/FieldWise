import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os
import shutil

wb = openpyxl.Workbook()

# Sheet 1: Crops Database
ws_crops = wb.active
ws_crops.title = "Crops_Database"
ws_crops.views.sheetView[0].showGridLines = True

headers = [
    # Basic Info
    ("crop_id", "المعرف البرمجي الفريد", "ID"),
    ("crop_name_en", "اسم المحصول (إنجليزي)", "Identity"),
    ("crop_name_ar", "اسم المحصول (عربي)", "Identity"),
    ("botanical_family", "العائلة النباتية (لاتيني)", "Taxonomy"),
    ("botanical_family_ar", "العائلة النباتية (عربي)", "Taxonomy"),
    ("season_category", "العروة الزراعية", "Calendar"),
    ("sowing_months", "أشهر الزراعة (1-12)", "Calendar"),
    ("harvest_months", "أشهر الحصاد (1-12)", "Calendar"),
    ("duration_days", "مدة المكث بالأرض (أيام)", "Calendar"),
    ("land_prep_weeks", "فترة خدمة وتشميس الأرض (أسابيع)", "Calendar"),
    # Thermal & Climate
    ("temp_base_c", "حرارة النمو القاعدية (Tbase °C)", "Climate"),
    ("temp_opt_min_c", "الحرارة المثلى الصغرى (°C)", "Climate"),
    ("temp_opt_max_c", "الحرارة المثلى العظمى (°C)", "Climate"),
    ("temp_max_c", "الحرارة القصوى المجهدة (°C)", "Climate"),
    # Water & FAO-56
    ("water_demand_mm", "الاحتياج المائي الإجمالي (ملم/موسم)", "Water (FAO-56)"),
    ("water_demand_category", "فئة الاستهلاك المائي", "Water (FAO-56)"),
    ("kc_initial", "معامل المحصول الابتدائي (Kc ini)", "Water (FAO-56)"),
    ("kc_mid", "معامل ذروة النمو (Kc mid)", "Water (FAO-56)"),
    ("kc_end", "معامل نهاية النضج (Kc end)", "Water (FAO-56)"),
    # Soil & pH
    ("soil_preferences", "قوام التربة المناسب", "Soil & Root"),
    ("ph_opt_min", "أدنى درجة حموضة مثلى (pH min)", "Soil & Root"),
    ("ph_opt_max", "أقصى درجة حموضة مثلى (pH max)", "Soil & Root"),
    ("salinity_threshold_ds_m", "حد تحمل ملوحة التربة (ECe dS/m)", "Soil & Root"),
    ("root_depth_cm", "عمق المجموع الجذري (سم)", "Soil & Root"),
    ("root_type", "طبيعة المجموع الجذري", "Soil & Root"),
    # BNF & Nitrogen
    ("is_nitrogen_fixer", "هل يثبت النيتروجين؟ (TRUE/FALSE)", "Nitrogen (BNF)"),
    ("bnf_total_min_kg_ha", "أدنى إجمالي N مثبت (كجم/هكتار)", "Nitrogen (BNF)"),
    ("bnf_total_max_kg_ha", "أقصى إجمالي N مثبت (كجم/هكتار)", "Nitrogen (BNF)"),
    ("bnf_residual_min_kg_ha", "أدنى رصيد متبقي صافي (كجم N/هكتار)", "Nitrogen (BNF)"),
    ("bnf_residual_max_kg_ha", "أقصى رصيد متبقي صافي (كجم N/هكتار)", "Nitrogen (BNF)"),
    # Pathology & Crop Break
    ("mandatory_break_years", "سنوات الحظر الإلزامية قبل التكرار", "Crop Health"),
    ("disrupted_pathogens_en", "الآفات والأمراض المكبوحة (إنجليزي)", "Crop Health"),
    ("disrupted_pathogens_ar", "الآفات والأمراض المكبوحة (عربي)", "Crop Health"),
    ("host_pathogens_en", "الأمراض والآفات العائلة (إنجليزي)", "Crop Health"),
    ("host_pathogens_ar", "الأمراض والآفات العائلة (عربي)", "Crop Health"),
    # Economics
    ("economic_value_tier", "فئة العائد والقيمة السوقية", "Economics"),
    ("avg_yield_feddan", "متوسط إنتاجية الفدان", "Economics"),
    ("avg_gross_margin_egp", "متوسط صافي الربح التقديري (جنيه/فدان)", "Economics"),
    ("notes_ar", "ملاحظات وإرشادات زراعية", "Notes")
]

section_colors = {
    "ID": "1B4332",
    "Identity": "2D6A4F",
    "Taxonomy": "40916C",
    "Calendar": "52B788",
    "Climate": "D97706",
    "Water (FAO-56)": "0284C7",
    "Soil & Root": "92400E",
    "Nitrogen (BNF)": "15803D",
    "Crop Health": "B91C1C",
    "Economics": "4F46E5",
    "Notes": "475569"
}

# Row 1: Section Category
for col_idx, (code, title_ar, section) in enumerate(headers, 1):
    cell = ws_crops.cell(row=1, column=col_idx, value=section)
    cell.font = Font(name="Arial", size=9, bold=True, color="FFFFFF")
    cell.fill = PatternFill(start_color=section_colors.get(section, "333333"), end_color=section_colors.get(section, "333333"), fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center")

# Row 2: English Field Code (Machine-readable)
for col_idx, (code, title_ar, section) in enumerate(headers, 1):
    cell = ws_crops.cell(row=2, column=col_idx, value=code)
    cell.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center")

# Row 3: Arabic Field Name (Human-readable)
for col_idx, (code, title_ar, section) in enumerate(headers, 1):
    cell = ws_crops.cell(row=3, column=col_idx, value=title_ar)
    cell.font = Font(name="Segoe UI", size=9, bold=True, color="0F172A")
    cell.fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

# 12 Sample Crops Pre-filled with agronomic standards
crop_rows = [
    # Wheat
    [
        "wheat", "Wheat", "القمح", "Poaceae", "النجيليات", "winter", "11, 12", "4, 5", 155, 3,
        4.0, 15.0, 24.0, 32.0, 450, "medium", 0.35, 1.15, 0.40,
        "clay, clay-loam, loam", 6.0, 7.8, 6.0, 120, "fibrous",
        False, 0, 0, 0, 0,
        1, "None (host to cereal rots)", "لا يوجد (عائل لأعفان جذور النجيليات)", "Take-all (Gaeumannomyces graminis), Rusts, Aphids", "مرض التيك-أول، أصداء القمح، حشرة المن",
        "staple", "18 - 22 إردب", 28000, "المحصول الاستراتيجي الأول للأمن الغذائي بمصر، يحتاج خدمة مبكرة وتسميد أزوتي متوازن."
    ],
    # Faba Bean
    [
        "faba_bean", "Faba Bean", "الفول البلدي", "Fabaceae", "البقوليات", "winter", "10, 11", "3, 4", 140, 2,
        5.0, 14.0, 22.0, 29.0, 380, "low", 0.40, 1.15, 0.50,
        "clay, clay-loam, loam, sandy-loam", 6.5, 8.0, 3.5, 90, "taproot",
        True, 80, 150, 25, 45,
        2, "Cereal take-all root rot, Cereal cyst nematode", "مرض أعفان جذور الحبوب (التيك-أول)، نيماتودا حويصلات الحبوب", "Orobanche (Broomrape), Chocolate spot (Botrytis fabae)", "حشيشة الهالوك، التبقع البني (بوتريتس)",
        "medium", "8 - 11 إردب", 25000, "أهم محصول بقولي شتوي مخصب للتربة؛ يوفر من 25 إلى 45 كجم نيتروجين صافي للمحصول الصيفي التالي."
    ],
    # Maize
    [
        "maize", "Maize (Corn)", "الذرة الشامية", "Poaceae", "النجيليات", "summer", "5, 6", "9, 10", 115, 2,
        10.0, 22.0, 32.0, 38.0, 600, "high", 0.30, 1.20, 0.60,
        "clay-loam, loam, sandy-loam", 5.8, 7.5, 4.0, 120, "fibrous",
        False, 0, 0, 0, 0,
        1, "None (perpetuates cereal borers)", "لا يوجد (يكرر عوائل حفارات الساق)", "Fall armyworm, Stalk borers, Fusarium ear rot", "دودة الحشد الخريفية، حفار الساق، عفن الكوز الفيوزارمي",
        "staple", "24 - 28 إردب", 30000, "محصول حبوب وعلف صيفي رئيسي؛ حساس للتعطيش في فترتي التزهير وامتلاء الحبوب."
    ],
    # Potato
    [
        "potato", "Potato", "البطاطس", "Solanaceae", "الباذنجانيات", "winter", "10, 11, 1", "2, 3, 5", 110, 3,
        7.0, 16.0, 22.0, 28.0, 550, "high", 0.50, 1.15, 0.75,
        "sandy-loam, loam, clay-loam", 5.5, 6.5, 2.5, 60, "shallow_tuber",
        False, 0, 0, 0, 0,
        3, "Cereal foot rots, Root knot nematode (partial)", "أعفان قواعد القمح، نيماتودا تعقد الجذور جزئياً", "Late blight (Phytophthora), Verticillium wilt, Common scab", "الندوة المتأخرة، الذبول الفيرتيسيليومي، الجرب العادي",
        "high", "12 - 16 طن", 75000, "محصول تصديري ونقدي عالي الربحية؛ يُمنع زراعته في نفس الأرض قبل مرور 3 سنوات على الأقل لتفادي أمراض الذبول."
    ],
    # Onion
    [
        "onion", "Onion", "البصل", "Amaryllidaceae", "النرجسيات (الثوميات)", "winter", "11, 12, 1", "4, 5, 6", 150, 3,
        6.0, 15.0, 25.0, 34.0, 450, "medium", 0.40, 1.05, 0.75,
        "loam, sandy-loam, clay-loam", 6.0, 7.5, 4.0, 45, "shallow_bulb",
        False, 0, 0, 0, 0,
        3, "Soil-borne fungi, Phytopathogenic nematodes (Biofumigant)", "فطريات التربة المستوطنة، النيماتودا الممرضة (تطهير حيوي بالإفرازات الكبريتية)", "White rot (Stromatinia cepivora), Purple blotch, Thrips", "العفن الأبيض، اللطعة الأرجوانية، حشرة التربس",
        "high", "15 - 20 طن", 65000, "محصول تصديري وتطهيري حيوي للتربة؛ إفرازاته الكبريتية تكبح مسببات أعفان الجذور، لكنه حساس لمرض العفن الأبيض."
    ],
    # Sunflower
    [
        "sunflower", "Sunflower", "دوار الشمس", "Asteraceae", "المركبات", "summer", "5, 6, 7", "8, 9, 10", 95, 2,
        8.0, 20.0, 30.0, 36.0, 450, "medium", 0.35, 1.10, 0.40,
        "clay, clay-loam, loam, sandy-loam", 6.0, 8.0, 5.0, 160, "deep_taproot",
        False, 0, 0, 0, 0,
        2, "Continuous cereal pests, Soil hardpans", "آفات توالي الحبوب، طبقات التربة الصماء (تعميق الصرف الجذري)", "Sclerotinia head rot, Rust, Birds damage", "عفن الرؤوس السكلروتيني، الأصداء، مهاجمة الطيور",
        "medium", "1.2 - 1.5 طن بذور", 32000, "محصول زيتي ممتاز عالي التحمل للجفاف والمناخ الحار؛ جذوره الوتدية العميقة تخترق الطبقات الصلبة وتصرف الماء الزائد."
    ],
    # Soybean
    [
        "soybean", "Soybean", "فول الصويا", "Fabaceae", "البقوليات", "summer", "5, 6", "9, 10", 110, 2,
        10.0, 22.0, 32.0, 37.0, 500, "medium", 0.30, 1.15, 0.50,
        "clay-loam, loam, sandy-loam", 6.0, 7.5, 4.0, 100, "taproot",
        True, 90, 160, 20, 38,
        2, "Corn rootworm, Continuous cereal take-all", "ديدان جذور الذرة، فطريات توالي النجيليات", "Charcoal rot (Macrophomina), Cotton leafworm", "عفن الفحم الجاف، دودة ورق القطن",
        "medium", "1.4 - 1.8 طن", 38000, "محصول بقولي زيتي صيفي مثالي للدخول في دورة مع القمح لتعويض استنزاف النيتروجين الصيفي."
    ],
    # Sorghum
    [
        "sorghum", "Sorghum", "الذرة الرفيعة", "Poaceae", "النجيليات", "summer", "5, 6", "9, 10", 110, 2,
        12.0, 24.0, 34.0, 40.0, 380, "low", 0.30, 1.05, 0.55,
        "clay, clay-loam, loam, sand", 5.5, 8.5, 6.5, 140, "fibrous_drought",
        False, 0, 0, 0, 0,
        1, "Root-knot nematodes (Meloidogyne suppression via root exudates)", "نيماتودا تعقد الجذور (كبح بيولوجي بمركبات الدورين بالجذور)", "Covered kernel smut, Shoot fly", "التفحم المغطى، ذبابة البادرات",
        "staple", "18 - 22 إردب", 22000, "المحصول الصيفي الأكثر تحملاً للجفاف والملوحة والحرارة الشديدة؛ ممتاز لجنوب الصعيد والأراضي الهامشية."
    ],
    # Chickpea
    [
        "chickpea", "Chickpea", "الحمص", "Fabaceae", "البقوليات", "winter", "11, 12", "4, 5", 130, 2,
        6.0, 15.0, 24.0, 30.0, 300, "low", 0.35, 1.00, 0.40,
        "sandy-loam, loam, clay-loam", 6.0, 8.0, 3.0, 100, "deep_taproot",
        True, 60, 110, 20, 35,
        3, "Cereal root rot pathogens", "أعفان الجذور النجيلية", "Ascochyta blight, Fusarium wilt", "لفحة الأسكوكيتا، ذبول الفيوزاريوم",
        "medium", "6 - 8 إردب", 30000, "بقولي شتوي منخفض الاحتياج المائي جداً ومتحمل للجفاف؛ ممتاز كبديل اقتصادي في نهايات الترع ومناطق شح المياه."
    ],
    # Berseem Clover
    [
        "berseem_clover", "Berseem Clover (Egyptian Clover)", "البرسيم المصري", "Fabaceae", "البقوليات", "winter", "10, 11", "5, 6", 180, 2,
        5.0, 15.0, 25.0, 32.0, 550, "medium", 0.40, 1.15, 0.80,
        "clay, clay-loam, loam", 6.0, 8.0, 5.0, 100, "taproot",
        True, 150, 280, 40, 70,
        1, "Cereal take-all root rot, Soil compaction", "أعفان قواعد القمح، تفكيك انضغاط التربة وزيادة المادة العضوية", "Crown rot, Dodder (Cuscuta), Cotton leafworm", "عفن التاج، حشيشة الحامول، دودة ورق القطن",
        "medium", "4 - 5 حشات (35 - 45 طن علف أخضر)", 35000, "عملاق التثبيت الأزوتي وتحسين خواص التربة في مصر؛ يترك أكبر مخزون نيتروجيني ومادة عضوية للأرض."
    ],
    # Sugar Beet
    [
        "sugar_beet", "Sugar Beet", "بنجر السكر", "Amaranthaceae", "القطيفية (الرمرامية)", "winter", "8, 9, 10", "3, 4, 5", 180, 3,
        5.0, 15.0, 24.0, 30.0, 500, "medium", 0.35, 1.20, 0.70,
        "clay-loam, loam, sandy-loam", 6.5, 8.2, 7.0, 150, "deep_taproot",
        False, 0, 0, 0, 0,
        3, "Cereal pathogens, Nematodes (if non-host)", "أعفان الحبوب، تفتيت الطبقات الصماء", "Rhizoctonia root rot, Cercospora leaf spot", "عفن الجذور الريزوكتوني، تبقع الأوراق السركسبوري",
        "high", "25 - 35 طن", 55000, "محصول تصنيعي تعاقدي عالي التحمل للملوحة والأراضي المستصلحة؛ يفضل زراعته في دورة ثلاثية أو رباعية."
    ],
    # Cotton
    [
        "cotton", "Cotton", "القطن", "Malvaceae", "الخبازيات", "summer", "3, 4", "9, 10", 180, 3,
        14.0, 24.0, 35.0, 42.0, 750, "very_high", 0.35, 1.20, 0.65,
        "clay, clay-loam, loam", 6.0, 8.0, 7.5, 180, "deep_taproot",
        False, 0, 0, 0, 0,
        2, "Continuous Poaceae weeds, Soil compaction", "حشائش النجيليات الحولية، فك انضغاط تحت التربة بالجذر الوتدي", "Bollworms (Pink & Spiny), Cotton leafworm, Fusarium wilt", "ديدان اللوز (القرنفلية والشوكية)، دودة ورق القطن، الذبول",
        "high", "8 - 11 قنطار", 60000, "الذهب الأبيض؛ محصول صيفي نقدي وتصديري ذو جذر وتدي قوي جداً يصل إلى 1.8 متر، يتحمل الملوحة العالية."
    ]
]

# Formatting rows
border_thin = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

for row_idx, row_data in enumerate(crop_rows, 4):
    for col_idx, value in enumerate(row_data, 1):
        cell = ws_crops.cell(row=row_idx, column=col_idx, value=value)
        cell.font = Font(name="Segoe UI", size=9)
        cell.border = border_thin
        
        if value is True:
            cell.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
            cell.font = Font(name="Segoe UI", size=9, bold=True, color="166534")
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif value is False and col_idx == 26:
            cell.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
            cell.font = Font(name="Segoe UI", size=9, color="991B1B")
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif isinstance(value, (int, float)):
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

# Auto-adjust column widths
for col in ws_crops.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_crops.column_dimensions[col_letter].width = max(max_len + 4, 12)

ws_crops.column_dimensions['A'].width = 16
ws_crops.column_dimensions['B'].width = 18
ws_crops.column_dimensions['C'].width = 18
ws_crops.column_dimensions['AG'].width = 30
ws_crops.column_dimensions['AH'].width = 30
ws_crops.column_dimensions['AI'].width = 32
ws_crops.column_dimensions['AJ'].width = 32
ws_crops.column_dimensions['AN'].width = 45

# -------------------------------------------------------------
# Sheet 2: Data Dictionary (دليل الحقول وشرح المدخلات)
# -------------------------------------------------------------
ws_dict = wb.create_sheet(title="Data_Dictionary_دليل_الحقول")
ws_dict.views.sheetView[0].showGridLines = True

dict_headers = ["Field Code (الكود)", "Arabic Field Name (اسم الحقل بالعربي)", "Data Type (نوع البيانات)", "Allowed Values / Unit (القيم المسموحة والوحدة)", "Agronomic Meaning & Impact (الأهمية العلمية والزراعية)"]

for col_idx, h in enumerate(dict_headers, 1):
    cell = ws_dict.cell(row=1, column=col_idx, value=h)
    cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center")

dictionary_rows = [
    ("crop_id", "المعرف البرمجي الفريد", "Text (Unique)", "نص إنجليزي فريد بدون مسافات (مثل: wheat, faba_bean)", "يستخدم في البرمجة لربط المحصول بالدورة الزراعية وقواعد البيانات."),
    ("crop_name_en / ar", "اسم المحصول باللغتين", "Text", "اسم المحصول التجاري الشائع", "العرض في بطاقات الاستراتيجيات والتقرير النهائي."),
    ("botanical_family", "العائلة النباتية", "Text (Taxonomy)", "Poaceae, Fabaceae, Solanaceae, Amaryllidaceae, Asteraceae, Malvaceae, etc.", "تحديد التوافق ومنع توالي نفس العائلة لتفادي توطن الأمراض والآفات المشتركة."),
    ("season_category", "العروة الزراعية", "Option", "winter (شتوي), summer (صيفي), nili (نيلي/خريفي)", "تحديد موقع المحصول في التقويم الفصلي ومنع تداخل محصولين شتويين في نفس الموسم."),
    ("sowing_months / harvest_months", "أشهر الزراعة والحصاد", "Comma-separated numbers", "أرقام من 1 إلى 12 (مثال: 10, 11 يعني أكتوبر ونوفمبر)", "حساب التقويم الزراعي والتحقق من وجود فترة فاصلة كافية لخدمة الأرض."),
    ("duration_days", "مدة المكث في الأرض", "Integer (Days)", "من 80 إلى 220 يوم", "حساب طول الموسم وتفادي تداخل العروات المتعاقبة."),
    ("land_prep_weeks", "فترة خدمة وتشميس الأرض", "Integer (Weeks)", "عادة من 2 إلى 3 أسابيع", "فترة أمان بيولوجية لحرث الأرض والتشميس وتهوية التربة قبل بذر المحصول التالي."),
    ("temp_base_c / opt / max", "الحدود الحرارية الفسيولوجية", "Decimal (°C)", "درجات حرارة مئوية", "مطابقة الاحتياج الحراري للمحصول مع سجلات درجات حرارة ناسا (T2M) لحساب الملاءمة المناخية."),
    ("water_demand_mm", "الاحتياج المائي الإجمالي", "Decimal (mm/season)", "ملم ماء لكل موسم كامل", "حساب الميزان المائي للدورة الزراعية، ومقارنته بالمياه المتاحة والري بالتنقيط."),
    ("kc_initial / mid / end", "معاملات المحصول FAO-56", "Decimals", "قيم Kc حسب منظمة الأغذية والزراعة الفاو", "حساب البخر-نتح الحقيقي للمحصول (ETc = ETo * Kc) عبر مراحل نموه المختلفة."),
    ("soil_preferences", "قوام التربة المناسب", "Comma-separated text", "clay, clay-loam, loam, sandy-loam, sand", "مطابقة المحصول مع نوع تربة الحقل وفرض عقوبة ثقل التربة على الدرنات كالبطاطس."),
    ("ph_opt_min / max", "مدى حموضة وقلوية التربة", "Decimals", "مقياس الحموضة pH (من 4.5 إلى 9.0)", "تحديد حساسية المحصول للحموضة أو القلوية ومنع إضافة الجير إلا في التربة الحامضية."),
    ("salinity_threshold_ds_m", "عتبة تحمل الملوحة", "Decimal (dS/m)", "الملوحة في مستخلص عجينة التربة المشبعة (ECe)", "التأكد من ملائمة المحصول لملوحة التربة ومياه الري لتفادي تدهور الإنتاج."),
    ("root_depth_cm / root_type", "عمق وطبيعة المجموع الجذري", "Number & Text", "عمق بالسنتيمتر + وتدي (taproot) أو ليفي (fibrous)", "تنويع حركة المجموع الجذري: الجذور الوتدية تفكك باطن التربة والليفية تمسك السطح وتمنع الانجراف."),
    ("is_nitrogen_fixer", "التثبيت الحيوي للأزوت", "Boolean", "TRUE للبقوليات فقط، و FALSE لباقي المحاصيل", "تفعيل حسابات الرصيد النيتروجيني الحيوي المخصب للتربة."),
    ("bnf_total_kg_ha", "إجمالي النيتروجين المثبت", "Range (kg N/ha)", "مثال: 80 - 150 كجم N/هكتار", "إجمالي ما تثبته بكتيريا العقد الجذرية (Rhizobium) من الهواء الجوي في المجموع الخضري والجذري."),
    ("bnf_residual_kg_ha", "الرصيد الصافي المتبقي", "Range (kg N/ha)", "مثال: 25 - 45 كجم N/هكتار", "صافي النيتروجين المتبقي في التربة بعد حصد البذور والمتاح لتغذية المحصول اللاحق."),
    ("mandatory_break_years", "سنوات الفاصل الزمني الإلزامي", "Integer (Years)", "1 إلى 4 سنوات", "الفاصل الزمني الحاسم قبل إعادة زراعة نفس المحصول أو عائلته (الباذنجانيات: 3 سنوات كاملة لمنع الذبول الفيرتيسيليومي)."),
    ("disrupted_pathogens", "الآفات والأمراض المكبوحة", "Text List", "أسماء الآفات والفطريات الممرضة باللاتيني والعربي", "الأمراض التي يكسر المحصول دورتها الحيوية في التربة عند دخوله في الدورة."),
    ("host_pathogens", "الأمراض العائلة الشائعة", "Text List", "أسماء أمراض المحصول الشائعة", "الأمراض التي يتكاثر عليها المحصول ويجب مراعاتها لمنع تراكمها في الحقل."),
    ("economic_value_tier", "فئة القيمة الاقتصادية", "Option", "staple (استراتيجي تمويني), medium (متوسط), high (نقدي وبستاني عالي)", "توازن الحسابات الاقتصادية بين أمن الغذاء للمزرعة وتعظيم الأرباح النقدية.")
]

for row_idx, r in enumerate(dictionary_rows, 2):
    for col_idx, val in enumerate(r, 1):
        cell = ws_dict.cell(row=row_idx, column=col_idx, value=val)
        cell.font = Font(name="Segoe UI", size=9)
        cell.border = border_thin
        if col_idx == 1:
            cell.font = Font(name="Arial", size=9, bold=True, color="0F172A")
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [2, 3]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

for col in ws_dict.columns:
    col_letter = get_column_letter(col[0].column)
    ws_dict.column_dimensions[col_letter].width = 28
ws_dict.column_dimensions['E'].width = 50

# Save files
excel_path = "fieldwise_crops_database.xlsx"
wb.save(excel_path)
print(f"Successfully generated Excel workbook at: {excel_path}")

# Copy to public directory if exists
if os.path.exists("public"):
    target_path = os.path.join("public", excel_path)
    shutil.copy(excel_path, target_path)
    print(f"Copied to {target_path} for direct download!")
