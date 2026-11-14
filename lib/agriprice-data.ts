/**
 * Official Egyptian Local Agricultural Prices Dataset
 * Source: Egyptian Cabinet Information and Decision Support Center (IDSC)
 * Portal: http://www.agriprice.gov.eg/local-prices (بوابة الأسعار المحلية والعالمية - مجلس الوزراء المصري)
 * Includes Farmgate (أسعار الحقول), Wholesale (سوق الجملة), Retail (أسعار التجزئة), and Outlets (أسعار المنافذ)
 */

export interface AgriPriceCropEntry {
  cropId: string;
  nameEn: string;
  nameAr: string;
  category: 'grains_legumes' | 'vegetables';
  farmgateTonEgp?: {
    min: number;
    max: number;
    avg: number;
    date: string;
  };
  wholesaleEgp?: {
    unitEn: string;
    unitAr: string;
    min: number;
    max: number;
    avg: number;
    tonEquivalentAvgEgp: number;
    date: string;
  };
  retailEgp?: {
    unitEn: string;
    unitAr: string;
    avg: number;
    date: string;
  };
  avgYieldTonPerFeddan: {
    min: number;
    max: number;
    typical: number;
    localUnitNoteEn: string;
    localUnitNoteAr: string;
  };
  estimatedCostPerFeddanEgp: number;
}

export const AGRIPRICE_SOURCE_METADATA = {
  portalNameEn: 'Egyptian Cabinet IDSC — Local & Global Agricultural Prices Portal',
  portalNameAr: 'بوابة الأسعار المحلية والعالمية — مركز المعلومات ودعم اتخاذ القرار بمجلس الوزراء المصري',
  url: 'http://www.agriprice.gov.eg/local-prices',
  lastUpdated: 'November 2026',
  governoratesCovered: 27,
};

export const AGRIPRICE_CROPS: AgriPriceCropEntry[] = [
  {
    cropId: 'wheat',
    nameEn: 'Local Hard/Bread Wheat',
    nameAr: 'القمح المحلي (أسعار الحقول والتوريد)',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 16300,
      max: 18000,
      avg: 17075,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      min: 15000,
      max: 17075,
      avg: 16300,
      tonEquivalentAvgEgp: 16300,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      avg: 14925,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 2.4,
      max: 3.0,
      typical: 2.7,
      localUnitNoteEn: '16–20 ardeb/feddan (1 ardeb = 150 kg)',
      localUnitNoteAr: '16–20 إردب/فدان (الإردب = 150 كجم)',
    },
    estimatedCostPerFeddanEgp: 19500,
  },
  {
    cropId: 'faba_bean',
    nameEn: 'Broad Beans / Faba Bean',
    nameAr: 'الفول البلدي الصحيح السائب',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 35000,
      max: 45000,
      avg: 40000,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      min: 38000,
      max: 45000,
      avg: 40000,
      tonEquivalentAvgEgp: 40000,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      avg: 54.53,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 1.24,
      max: 1.7,
      typical: 1.45,
      localUnitNoteEn: '8–11 ardeb/feddan (1 ardeb = 155 kg)',
      localUnitNoteAr: '8–11 إردب/فدان (الإردب = 155 كجم)',
    },
    estimatedCostPerFeddanEgp: 18500,
  },
  {
    cropId: 'maize',
    nameEn: 'Maize / Yellow & White Corn',
    nameAr: 'الذرة الصفراء والبيضاء',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 12500,
      max: 15000,
      avg: 13800,
      date: '2026-11-12',
    },
    wholesaleEgp: {
      unitEn: 'Ton (White) / Sack (Yellow)',
      unitAr: 'طن (بيضاء) / شيكارة (صفراء 750 ج)',
      min: 12500,
      max: 15000,
      avg: 13800,
      tonEquivalentAvgEgp: 13800,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      avg: 15640,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 3.1,
      max: 3.9,
      typical: 3.5,
      localUnitNoteEn: '22–28 ardeb/feddan (1 ardeb = 140 kg)',
      localUnitNoteAr: '22–28 إردب/فدان (الإردب = 140 كجم)',
    },
    estimatedCostPerFeddanEgp: 22500,
  },
  {
    cropId: 'potato',
    nameEn: 'Potato (Winter & Nili Tubers)',
    nameAr: 'البطاطس (أسعار الحقول والجملة)',
    category: 'vegetables',
    farmgateTonEgp: {
      min: 14000,
      max: 18000,
      avg: 15500,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      min: 15.0,
      max: 22.0,
      avg: 18.25,
      tonEquivalentAvgEgp: 18250,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      avg: 23.85,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 12.0,
      max: 16.0,
      typical: 14.0,
      localUnitNoteEn: '12–16 tonnes/feddan',
      localUnitNoteAr: '12–16 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 85000,
  },
  {
    cropId: 'onion',
    nameEn: 'Dry Commercial Onion',
    nameAr: 'البصل الجاف (حقول وتصدير)',
    category: 'vegetables',
    farmgateTonEgp: {
      min: 8000,
      max: 19000,
      avg: 13250,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      min: 20.0,
      max: 23.0,
      avg: 20.38,
      tonEquivalentAvgEgp: 20380,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      avg: 22.21,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 14.0,
      max: 18.0,
      typical: 15.5,
      localUnitNoteEn: '14–18 tonnes/feddan',
      localUnitNoteAr: '14–18 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 52000,
  },
  {
    cropId: 'tomato',
    nameEn: 'Tomato (Field & Fresh Market)',
    nameAr: 'الطماطم (أسعار الحقول والجملة)',
    category: 'vegetables',
    farmgateTonEgp: {
      min: 7500,
      max: 17000,
      avg: 11500,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      min: 8.0,
      max: 20.0,
      avg: 13.75,
      tonEquivalentAvgEgp: 13750,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      avg: 23.86,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 18.0,
      max: 25.0,
      typical: 20.0,
      localUnitNoteEn: '18–25 tonnes/feddan',
      localUnitNoteAr: '18–25 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 75000,
  },
  {
    cropId: 'garlic',
    nameEn: 'Fresh Baladi Garlic',
    nameAr: 'الثوم البلدي الجديد',
    category: 'vegetables',
    farmgateTonEgp: {
      min: 14000,
      max: 32000,
      avg: 21500,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      min: 10.0,
      max: 50.0,
      avg: 23.75,
      tonEquivalentAvgEgp: 23750,
      date: '2026-11-12',
    },
    retailEgp: {
      unitEn: 'Kg',
      unitAr: 'كيلو',
      avg: 28.41,
      date: '2026-11-13',
    },
    avgYieldTonPerFeddan: {
      min: 8.0,
      max: 11.0,
      typical: 9.5,
      localUnitNoteEn: '8–11 tonnes/feddan',
      localUnitNoteAr: '8–11 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 48000,
  },
  {
    cropId: 'sunflower',
    nameEn: 'Sunflower (Oilseed Contract)',
    nameAr: 'دوار الشمس الزيتي (تعاقدي)',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 22000,
      max: 28000,
      avg: 25000,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      min: 24000,
      max: 29000,
      avg: 26500,
      tonEquivalentAvgEgp: 26500,
      date: '2026-11-12',
    },
    avgYieldTonPerFeddan: {
      min: 1.1,
      max: 1.5,
      typical: 1.3,
      localUnitNoteEn: '1.1–1.5 tonnes/feddan',
      localUnitNoteAr: '1.1–1.5 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 14500,
  },
  {
    cropId: 'soybean',
    nameEn: 'Soybean (High-Protein Oilseed)',
    nameAr: 'فول الصويا (تعاقدي ومصانع الأعلاف)',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 24000,
      max: 30000,
      avg: 27000,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      min: 26000,
      max: 31000,
      avg: 28500,
      tonEquivalentAvgEgp: 28500,
      date: '2026-11-12',
    },
    avgYieldTonPerFeddan: {
      min: 1.2,
      max: 1.6,
      typical: 1.45,
      localUnitNoteEn: '1.2–1.6 tonnes/feddan',
      localUnitNoteAr: '1.2–1.6 طن/فدان',
    },
    estimatedCostPerFeddanEgp: 17500,
  },
  {
    cropId: 'sorghum',
    nameEn: 'Grain Sorghum',
    nameAr: 'الذرة الرفيعة (حبوب وعلف)',
    category: 'grains_legumes',
    farmgateTonEgp: {
      min: 11500,
      max: 14000,
      avg: 12800,
      date: '2026-11-08',
    },
    wholesaleEgp: {
      unitEn: 'Ton',
      unitAr: 'طن',
      min: 12500,
      max: 14800,
      avg: 13500,
      tonEquivalentAvgEgp: 13500,
      date: '2026-11-12',
    },
    avgYieldTonPerFeddan: {
      min: 2.5,
      max: 3.1,
      typical: 2.8,
      localUnitNoteEn: '18–22 ardeb/feddan',
      localUnitNoteAr: '18–22 إردب/فدان',
    },
    estimatedCostPerFeddanEgp: 16500,
  },
];

export const AGRIPRICE_BENCHMARK_EXTRAS = [
  {
    nameEn: 'Loose Paddy Rice (الأرز السائب - أسعار الحقول)',
    nameAr: 'الأرز السائب (أسعار الحقول)',
    unitEn: 'Ton',
    unitAr: 'طن',
    minEgp: 22000,
    maxEgp: 27400,
    avgEgp: 23850,
    levelEn: 'Farmgate (8 Nov 2026)',
    levelAr: 'أسعار الحقول (8 نوفمبر 2026)',
  },
  {
    nameEn: 'White Sesame (السمسم الأبيض - أسعار الحقول)',
    nameAr: 'السمسم الأبيض (أسعار الحقول)',
    unitEn: 'Ton',
    unitAr: 'طن',
    minEgp: 70000,
    maxEgp: 150000,
    avgEgp: 113333,
    levelEn: 'Farmgate (8 Nov 2026)',
    levelAr: 'أسعار الحقول (8 نوفمبر 2026)',
  },
  {
    nameEn: 'Dry White Beans (الفاصوليا الجافة - أسعار الحقول)',
    nameAr: 'الفاصوليا السائبة (أسعار الحقول)',
    unitEn: 'Ton',
    unitAr: 'طن',
    minEgp: 25000,
    maxEgp: 66000,
    avgEgp: 43250,
    levelEn: 'Farmgate (8 Nov 2026)',
    levelAr: 'أسعار الحقول (8 نوفمبر 2026)',
  },
  {
    nameEn: 'Local Cotton (القطن المحلي - قنطار)',
    nameAr: 'القطن المحلي (بالقنطار)',
    unitEn: 'Kantar',
    unitAr: 'قنطار',
    minEgp: 5928,
    maxEgp: 7000,
    avgEgp: 6464,
    levelEn: 'Local Market / Outlets (Nov 2026)',
    levelAr: 'السوق المحلي والمنافذ (نوفمبر 2026)',
  },
];

export function getAgriPriceByCropId(cropId: string): AgriPriceCropEntry | undefined {
  return AGRIPRICE_CROPS.find((c) => c.cropId === cropId);
}
