export interface CropDisease {
  cropNameAr: string;
  cropNameEn: string;
  diseaseNameAr: string;
  pathogenScientific: string;
  favorableConditionsAr: string;
  cropEn: string;
  pathogenGroup: 'Fungus' | 'Oomycete' | 'Bacteria' | 'Fungus (Soil-borne)' | 'Fungus (Air-borne)' | 'Fungus (Seed-borne)' | 'Fungus (Seed/Soil)' | 'Oomycete (Soil-borne)';
}

export interface SoilPathogenRule {
  id: string;
  nameEn: string;
  nameAr: string;
  hosts: string[];
  breakYears: number;
  severity: number;
  control: string;
}

export const SOIL_PATHOGENS: SoilPathogenRule[] = [
  {
    id: 'take_all',
    nameEn: 'Take-all',
    nameAr: 'مرض التيك-أول (عفن قواعد وجذور الحبوب)',
    hosts: ['wheat', 'barley'],
    breakYears: 3,
    severity: 0.70,
    control: 'rotation_effective (المكافحة بالدورة فعالة جداً؛ إدخال نباتات عريضة الأوراق كالفول ودوار الشمس)',
  },
  {
    id: 'cereal_cyst_nematode',
    nameEn: 'Cereal cyst nematode',
    nameAr: 'نيماتودا حويصلات الحبوب النجيلية',
    hosts: ['wheat', 'barley'],
    breakYears: 2,
    severity: 0.60,
    control: 'rotation_effective (المكافحة بالدورة تكسر دورة تكاثر الحويصلات في التربة)',
  },
  {
    id: 'verticillium_dahliae',
    nameEn: 'Verticillium wilt',
    nameAr: 'الذبول الفرتسيليومي الوعائي',
    hosts: ['sunflower', 'potato', 'cotton'],
    breakYears: 4,
    severity: 0.80,
    control: 'rotation_partial (مكافحة جزئية؛ يتطلب دورة رباعية مع استبعاد العوائل الباذنجانية والقطن)',
  },
  {
    id: 'broomrape',
    nameEn: 'Broomrape (Orobanche crenata)',
    nameAr: 'الهالوك (طفيل البقوليات)',
    hosts: ['faba_bean'],
    breakYears: 3,
    severity: 0.70,
    control: 'rotation_partial (مكافحة جزئية؛ تدوير مع محاصيل صائدة غير عائلة كالشعير لتطهير بنك البذور)',
  },
  {
    id: 'sclerotinia',
    nameEn: 'Sclerotinia stem rot',
    nameAr: 'العفن الأبيض (عفن الساق السكلروتيني)',
    hosts: ['sunflower', 'soybean', 'faba_bean'],
    breakYears: 4,
    severity: 0.80,
    control: 'rotation_partial (مكافحة جزئية؛ يتطلب إدخال محاصيل نجيلية كالقمح والذرة لمدة 4 سنوات)',
  },
  {
    id: 'charcoal_rot',
    nameEn: 'Charcoal rot',
    nameAr: 'العفن الفحمي الجاف',
    hosts: ['maize', 'soybean', 'sunflower'],
    breakYears: 3,
    severity: 0.70,
    control: 'rotation_partial (منع الإجهاد المائي الصيفي والتعاقب مع محاصيل شتوية وتسميد بوتاسي متوازن)',
  },
];

export const CROP_DISEASES: CropDisease[] = [
  // الفول البلدي
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'التبقع الشوكولاتي (البني)',
    pathogenScientific: 'Botrytis fabae',
    favorableConditionsAr: 'رطوبة جوية عالية (>85%) وبلل أوراق متصل لعدة أيام، حرارة 15-28°م، تشتد في الجو المعتدل الرطب وكثافة الغطاء النباتي',
    cropEn: 'faba_bean',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'اللفحة الأسكوكيتية',
    pathogenScientific: 'Didymella fabae (Ascochyta fabae)',
    favorableConditionsAr: 'طقس ممطر رطب وبلل الأوراق المتصل ورذاذ الأمطار المتطاير',
    cropEn: 'faba_bean',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'الصدأ',
    pathogenScientific: 'Uromyces viciae-fabae',
    favorableConditionsAr: 'دفء يقارب 20-25°م مع 6-18 ساعة من بلل الأوراق والندى الليلي الغزير',
    cropEn: 'faba_bean',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'البياض الزغبي',
    pathogenScientific: 'Peronospora viciae f. sp. fabae',
    favorableConditionsAr: 'جو بارد رطب ورطوبة نسبية مرتفعة وبلل الأوراق في الشتاء',
    cropEn: 'faba_bean',
    pathogenGroup: 'Oomycete',
  },
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'العفن الأبيض السكلروتيني',
    pathogenScientific: 'Sclerotinia sclerotiorum',
    favorableConditionsAr: 'جو معتدل مائل للبرودة ورطوبة مرتفعة وابتلال سطح التربة وقواعد السيقان',
    cropEn: 'faba_bean',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'الفول البلدي',
    cropNameEn: 'Faba bean',
    diseaseNameAr: 'أعفان الجذور والبادرات',
    pathogenScientific: 'Fusarium spp., Rhizoctonia solani, Pythium spp.',
    favorableConditionsAr: 'التغدق وسوء صرف التربة، التربة الطينية الباردة المبتلة والإفراط في الري',
    cropEn: 'faba_bean',
    pathogenGroup: 'Fungus (Soil-borne)',
  },

  // القمح
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'الصدأ الأصفر (المخطط)',
    pathogenScientific: 'Puccinia striiformis',
    favorableConditionsAr: 'جو بارد ورطب (13-24°م)، وتشتد الخطورة عند 10-16°م مع ندى ليلي غزير في شمال ووسط الدلتا',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Air-borne)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'صدأ الأوراق (البرتقالي)',
    pathogenScientific: 'Puccinia triticina',
    favorableConditionsAr: 'رطوبة جوية مرتفعة وحرارة معتدلة (18-25°م) في أواخر الشتاء والربيع',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Air-borne)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'صدأ الساق (الأسود)',
    pathogenScientific: 'Puccinia graminis',
    favorableConditionsAr: 'طقس دافئ ورطب متأخر في الموسم (20-30°م) مع ندى ورقي',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Air-borne)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'البياض الدقيقي',
    pathogenScientific: 'Blumeria graminis f. sp. tritici',
    favorableConditionsAr: 'حرارة معتدلة (15-22°م) ورطوبة نسبية مرتفعة، ويزيد بالإفراط في التسميد النيتروجيني وكثافة النباتات',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'التفحم السائب',
    pathogenScientific: 'Ustilago tritici',
    favorableConditionsAr: 'عدوى مرتبطة بالبذور المصابة وتحدث أثناء التزهير في جو رطب',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Seed-borne)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'التفحم الشائع (المغلف)',
    pathogenScientific: 'Tilletia foetida / T. caries',
    favorableConditionsAr: 'ظروف باردة ورطبة وقت الإنبات الأولي للبادرات في التربة',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Seed/Soil)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'عفن الجذور والقاعدة الفيوزاريومي',
    pathogenScientific: 'Fusarium spp.',
    favorableConditionsAr: 'تتأثر بحرارة ورطوبة التربة؛ الدفء المصحوب بإجهاد مائي وتكرار زراعة النجيليات في نفس الحقل',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'القمح',
    cropNameEn: 'Wheat',
    diseaseNameAr: 'مرض التدهور العام (تيك-أول)',
    pathogenScientific: 'Gaeumannomyces tritici',
    favorableConditionsAr: 'بقاء المسبب في التربة وتوالي النجيليات (قمح خلف قمح)، تفضله التربة القلوية الخفيفة وسوء الصرف',
    cropEn: 'wheat',
    pathogenGroup: 'Fungus (Soil-borne)',
  },

  // الشعير
  {
    cropNameAr: 'الشعير',
    cropNameEn: 'Barley',
    diseaseNameAr: 'البياض الشبكي',
    pathogenScientific: 'Pyrenophora teres',
    favorableConditionsAr: 'رطوبة مرتفعة وبلل الأوراق عند حرارة 10-25°م وبقايا المحصول المصاب',
    cropEn: 'barley',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الشعير',
    cropNameEn: 'Barley',
    diseaseNameAr: 'التبقع / اللفحة البنية',
    pathogenScientific: 'Bipolaris sorokiniana',
    favorableConditionsAr: 'دفء مع رطوبة ملائمة ويزيد الضرر مع تعرض النبات لإجهاد العطش',
    cropEn: 'barley',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الشعير',
    cropNameEn: 'Barley',
    diseaseNameAr: 'التبقع السلمي (الاسكالد)',
    pathogenScientific: 'Rhynchosporium commune',
    favorableConditionsAr: 'جو بارد رطب ومطر أو ابتلال طويل للأوراق من 4 إلى 20°م',
    cropEn: 'barley',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الشعير',
    cropNameEn: 'Barley',
    diseaseNameAr: 'صدأ أوراق الشعير',
    pathogenScientific: 'Puccinia hordei',
    favorableConditionsAr: 'اعتدال الحرارة مع ندى أو رطوبة مرتفعة غالباً 16-22°م',
    cropEn: 'barley',
    pathogenGroup: 'Fungus',
  },

  // الذرة الشامية
  {
    cropNameAr: 'الذرة الشامية',
    cropNameEn: 'Maize',
    diseaseNameAr: 'لفحة الأوراق الشمالية والجنوبية',
    pathogenScientific: 'Helminthosporium maydis / Setosphaeria turcica',
    favorableConditionsAr: 'الرطوبة العالية ووجود بقايا نباتية مصابة ودفء 20-30°م وتجمع مياه الندى',
    cropEn: 'maize',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الذرة الشامية',
    cropNameEn: 'Maize',
    diseaseNameAr: 'تبقع الأوراق الرمادي',
    pathogenScientific: 'Cercospora zeae-maydis',
    favorableConditionsAr: 'الرطوبة النسبية العالية المستمرة (>90%) والغيوم والحرارة الدافئة',
    cropEn: 'maize',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'الذرة الشامية',
    cropNameEn: 'Maize',
    diseaseNameAr: 'الذبول المتأخر (الشلل)',
    pathogenScientific: 'Cephalosporium maydis (Harpophora maydis)',
    favorableConditionsAr: 'تراكم الفطر في التربة وتكرار زراعة الذرة الشامية وسوء الصرف، وتظهر أعراضه بعد التزهير',
    cropEn: 'maize',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'الذرة الشامية',
    cropNameEn: 'Maize',
    diseaseNameAr: 'أعفان الكيزان والسيقان',
    pathogenScientific: 'Fusarium verticillioides & Aspergillus flavus',
    favorableConditionsAr: 'الإصابات الحشرية (ثاقبات الساق) والظروف الحارة الرطبة والتخزين غير الجيد',
    cropEn: 'maize',
    pathogenGroup: 'Fungus',
  },

  // عباد الشمس
  {
    cropNameAr: 'عباد الشمس',
    cropNameEn: 'Sunflower',
    diseaseNameAr: 'عفن الساق والقرص الزهري الأبيض',
    pathogenScientific: 'Sclerotinia sclerotiorum',
    favorableConditionsAr: 'رطوبة عالية وبلل الأنسجة والتربة، ودرجات حرارة معتدلة (15-22°م) خلال مرحلة التزهير',
    cropEn: 'sunflower',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'عباد الشمس',
    cropNameEn: 'Sunflower',
    diseaseNameAr: 'ذبول الفرتيسيليوم',
    pathogenScientific: 'Verticillium dahliae',
    favorableConditionsAr: 'ممرض ترابي يستوطن التربة لسنوات، وتتأثر شدته بوجود عوائل حساسة سابقة كالطماطم والبطاطس والقطن',
    cropEn: 'sunflower',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'عباد الشمس',
    cropNameEn: 'Sunflower',
    diseaseNameAr: 'العفن الفحمي',
    pathogenScientific: 'Macrophomina phaseolina',
    favorableConditionsAr: 'يزداد بقوة في الجو الحار الجاف مع إجهاد العطش والحرارة الشديدة (>32°م) في أواخر الموسم',
    cropEn: 'sunflower',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'عباد الشمس',
    cropNameEn: 'Sunflower',
    diseaseNameAr: 'تبقع الأوراق الألترناري',
    pathogenScientific: 'Alternaria helianthi',
    favorableConditionsAr: 'الرطوبة العالية وبلل الأوراق والطقس الدافئ وكثافة المجموع الخضري',
    cropEn: 'sunflower',
    pathogenGroup: 'Fungus',
  },

  // فول الصويا
  {
    cropNameAr: 'فول الصويا',
    cropNameEn: 'Soybean',
    diseaseNameAr: 'صدأ فول الصويا الآسيوي',
    pathogenScientific: 'Phakopsora pachyrhizi',
    favorableConditionsAr: 'حرارة معتدلة (15-28°م)، رطوبة نسبية >90% وبلل ورقي متصل نحو 6 ساعات أو أكثر',
    cropEn: 'soybean',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'فول الصويا',
    cropNameEn: 'Soybean',
    diseaseNameAr: 'العفن الفحمي',
    pathogenScientific: 'Macrophomina phaseolina',
    favorableConditionsAr: 'يزداد في الجو الحار الجاف ومع إجهاد العطش وضعف الجذور الصيفية',
    cropEn: 'soybean',
    pathogenGroup: 'Fungus (Soil-borne)',
  },
  {
    cropNameAr: 'فول الصويا',
    cropNameEn: 'Soybean',
    diseaseNameAr: 'عفن الجذور والساق الفيتوفتوري',
    pathogenScientific: 'Phytophthora sojae',
    favorableConditionsAr: 'تشبع التربة بالماء وسوء الصرف والتربة الطينية الثقيلة، خاصة بعد الأمطار أو الري الزائد',
    cropEn: 'soybean',
    pathogenGroup: 'Oomycete (Soil-borne)',
  },
  {
    cropNameAr: 'فول الصويا',
    cropNameEn: 'Soybean',
    diseaseNameAr: 'تبقع عين الضفدع',
    pathogenScientific: 'Cercospora sojina',
    favorableConditionsAr: 'جو دافئ رطب (25-30°م) ورطوبة نسبية مرتفعة جداً (>90%) وبلل مستمر للأوراق',
    cropEn: 'soybean',
    pathogenGroup: 'Fungus',
  },
  {
    cropNameAr: 'فول الصويا',
    cropNameEn: 'Soybean',
    diseaseNameAr: 'اللفحة البكتيرية',
    pathogenScientific: 'Pseudomonas savastanoi pv. glycinea',
    favorableConditionsAr: 'الطقس البارد إلى المعتدل الممطر ورذاذ المطر وحبوب البرد والري بالرش',
    cropEn: 'soybean',
    pathogenGroup: 'Bacteria',
  },
];

/**
 * Returns matching diseases for a specific crop ID
 */
export function getDiseasesForCrop(cropId: string): CropDisease[] {
  const normId = cropId.toLowerCase().replace(/[\s_-]+/g, '');
  return CROP_DISEASES.filter((d) => {
    const dNorm = d.cropEn.toLowerCase().replace(/[\s_-]+/g, '');
    return normId.includes(dNorm) || dNorm.includes(normId);
  });
}

/**
 * Checks environmental risk for a crop given NASA POWER climate metrics
 */
export function checkClimateDiseaseRisks(
  cropId: string,
  meanTemp: number,
  relativeHumidity: number,
  soilType?: string
): { disease: CropDisease; riskLevel: 'high' | 'moderate'; reasonAr: string; reasonEn: string }[] {
  const cropDiseases = getDiseasesForCrop(cropId);
  const alerts: { disease: CropDisease; riskLevel: 'high' | 'moderate'; reasonAr: string; reasonEn: string }[] = [];

  for (const d of cropDiseases) {
    // Stripe rust in wheat (cool + humid)
    if (d.pathogenScientific.includes('Puccinia striiformis') && meanTemp >= 10 && meanTemp <= 22 && relativeHumidity >= 60) {
      alerts.push({
        disease: d,
        riskLevel: relativeHumidity >= 75 ? 'high' : 'moderate',
        reasonAr: `درجات الحرارة (${meanTemp.toFixed(1)}°م) والرطوبة (${relativeHumidity.toFixed(0)}%) تماثل نافذة انتشار الصدأ الأصفر.`,
        reasonEn: `Temperature (${meanTemp.toFixed(1)}°C) and humidity (${relativeHumidity.toFixed(0)}%) match Stripe Rust epidemic conditions.`,
      });
    }

    // Chocolate spot in faba bean (moderate temp + very humid)
    if (d.pathogenScientific.includes('Botrytis fabae') && meanTemp >= 14 && meanTemp <= 26 && relativeHumidity >= 65) {
      alerts.push({
        disease: d,
        riskLevel: relativeHumidity >= 80 ? 'high' : 'moderate',
        reasonAr: `الرطوبة العالية (${relativeHumidity.toFixed(0)}%) والاعتدال الحراري يوفران بيئة مثالية لإنبات جراثيم التبقع الشوكولاتي.`,
        reasonEn: `High humidity (${relativeHumidity.toFixed(0)}%) and moderate warmth favor Botrytis fabae spore germination.`,
      });
    }

    // Charcoal rot in summer crops (sunflower/soybean/maize) under heat & drought stress
    if (d.pathogenScientific.includes('Macrophomina') && meanTemp >= 28) {
      alerts.push({
        disease: d,
        riskLevel: meanTemp >= 32 ? 'high' : 'moderate',
        reasonAr: `درجات الحرارة الصيفية المرتفعة (${meanTemp.toFixed(1)}°م) ترفع خطر العفن الفحمي في حالة تعرض النبات لإجهاد العطش.`,
        reasonEn: `High summer temperature (${meanTemp.toFixed(1)}°C) elevates Charcoal Rot risk if moisture stress occurs.`,
      });
    }

    // Damping off and Phytophthora in heavy clay soils
    if (
      (d.pathogenScientific.includes('Phytophthora') || d.pathogenScientific.includes('Pythium')) &&
      soilType === 'clay'
    ) {
      alerts.push({
        disease: d,
        riskLevel: 'moderate',
        reasonAr: `قوام التربة الطينية الثقيلة مع بطء الصرف يزيد حساسية الجذور لأعفان الماء والبادرات.`,
        reasonEn: `Heavy clay texture with slow internal drainage increases root vulnerability to water molds.`,
      });
    }
  }

  return alerts;
}
