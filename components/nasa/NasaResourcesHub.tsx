'use client';

import React from 'react';
import {
  Satellite,
  ExternalLink,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export interface NasaResourceItem {
  id: string;
  name: string;
  agency: string;
  resolution: string;
  usageType: 'active_engine' | 'field_validation';
  url: string;
  howUsedEn: string;
  howUsedAr: string;
}

// ONLY datasets directly used in the FieldWise Engine or explicitly required for global/Egypt field validation (Item 28)
export const ACTIVE_FIELDWISE_DATASETS: NasaResourceItem[] = [
  {
    id: 'nasa-power',
    name: 'NASA POWER Agroclimatology API',
    agency: 'NASA LaRC',
    resolution: '0.5° × 0.5° (~50 km) • 2001–2020 Climatology',
    usageType: 'active_engine',
    url: 'https://power.larc.nasa.gov/',
    howUsedEn:
      'Directly queried via /api/nasa-power for the farm coordinates to retrieve T2M (mean, max 42.8°C, min 3.3°C), PRECTOTCORR rainfall (89 mm/yr), RH2M humidity, and ALLSKY_SFC_SW_DWN solar radiation (21.2 MJ/m²/d) — driving the Climate (15%) and Water Deficit (-1,561 mm/yr) calculations.',
    howUsedAr:
      'يتم الاتصال به مباشرة عبر (/api/nasa-power) بإحداثيات المزرعة لجلب درجات الحرارة (العظمى 42.8°م والصغرى 3.3°م)، الأمطار (89 ملم/سنة)، الرطوبة، والإشعاع الشمسي (21.2 ميغاجول/م²/يوم) لحساب بُعد المناخ (15%) والعجز المائي (-1,561 ملم/سنة).',
  },
  {
    id: 'fao-gaez',
    name: 'FAO GAEZ v4 & FAO-56 Crop Water Parameters',
    agency: 'FAO / Agronomic Core',
    resolution: 'Crop-Specific Kc, ETc & ECe Thresholds',
    usageType: 'active_engine',
    url: 'https://gaez.fao.org/',
    howUsedEn:
      'Powers the crop database parameters: seasonal crop evapotranspiration (ETc: Wheat 450 mm, Maize 600 mm, Faba Bean 380 mm, Sunflower 450 mm), soil pH suitability (6.0–7.5), and salinity thresholds (Potato 1.7 dS/m, Onion 1.2 dS/m) used in Soil & pH (15%) and Water & Demand (15%).',
    howUsedAr:
      'يغذي محرك الحسابات بمعاملات الاستهلاك المائي للمحاصيل (القمح 450 ملم، الذرة 600 ملم، الفول 380 ملم، دوار الشمس 450 ملم) وحدود تحمل الملوحة (البطاطس 1.7 ديسيسيمنز/م والبصل 1.2 ديسيسيمنز/م) في تقييم التربة والمياه.',
  },
  {
    id: 'usda-ag-commons',
    name: 'USDA Ag Data Commons & BNF Agronomic Trials',
    agency: 'Agronomic Literature',
    resolution: 'Empirical Legume BNF & Host-Pathogen Rules',
    usageType: 'active_engine',
    url: 'https://www.nal.usda.gov/services/agdatacommons',
    howUsedEn:
      'Provides empirical biological nitrogen fixation (BNF) residual credit ranges (25–45 kg N/ha for Faba Bean; 55–90 kg N/ha for Faba Bean + Soybean) and non-host pathogen break intervals used in Nitrogen BNF (15%) and Pest Break (15%).',
    howUsedAr:
      'يوفر القيم المرجعية لتثبيت النيتروجين الحيوي للبقوليات (25–45 كجم N/هكتار للفول البلدي) وفترات كسر دورات الآفات غير العائلة المستخدمة في حساب بُعد النيتروجين (15%) والآفات (15%).',
  },
  {
    id: 'egypt-agriprice',
    name: 'Egyptian Cabinet IDSC Local Crop Prices (AgriPrice)',
    agency: 'IDSC Egypt',
    resolution: '27 Governorates • Farmgate, Wholesale & Retail (EGP/Ton)',
    usageType: 'active_engine',
    url: 'http://www.agriprice.gov.eg/local-prices',
    howUsedEn:
      'Supplies official Egyptian farmgate (أسعار الحقول: Wheat 17,075 EGP/t, Faba Bean 40,000 EGP/t, Potato 15,500 EGP/t, Onion 13,250 EGP/t) and wholesale prices powering Economic Return (10%) and the Feddan Net Profit Calculator.',
    howUsedAr:
      'يمد المحرك بأسعار الحقول والجملة الرسمية بمصر (القمح 17,075 ج/طن، الفول 40,000 ج/طن، البطاطس 15,500 ج/طن، البصل 13,250 ج/طن) لحساب بُعد العائد الاقتصادي (10%) وصافي ربح الفدان.',
  },
  {
    id: 'smap',
    name: 'NASA SMAP (Soil Moisture Active Passive)',
    agency: 'NASA Earthdata',
    resolution: '9 km L4 Root-Zone • 2–3 Day Revisit',
    usageType: 'field_validation',
    url: 'https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap',
    howUsedEn:
      'Used as the primary satellite validation layer for root-zone soil moisture depletion and infiltration efficiency between flood irrigation turns on reclaimed loam soils.',
    howUsedAr:
      'طبقة التحقق الفضائي الأساسية لمتابعة رطوبة منطقة الجذور وكفاءة تسرب المياه بين ريات الغمر في الأراضي الطميية المستصلحة.',
  },
  {
    id: 'modis-landsat',
    name: 'NASA Landsat 8/9 (30 m) & MODIS NDVI',
    agency: 'NASA / USGS',
    resolution: '30 m – 250 m • Canopy Vigor & Bare-Soil Detection',
    usageType: 'field_validation',
    url: 'https://lpdaac.usgs.gov/products/',
    howUsedEn:
      'Tracks seasonal NDVI crop vigor transitions and monitors the 3-month bare-soil window (February–May after Potato harvest) to verify catch-crop ground cover.',
    howUsedAr:
      'يُستخدم لتتبع مؤشر الكثافة النباتية (NDVI) خلال مواسم النمو ورصد فترة خلو الأرض (فبراير–مايو بعد حصاد البطاطس) للتحقق من زراعة المحصول الكاسح.',
  },
  {
    id: 'grace-fo',
    name: 'NASA GRACE / GRACE-FO Water Storage',
    agency: 'NASA JPL',
    resolution: 'Regional Basin • Terrestrial Water Storage Trends',
    usageType: 'field_validation',
    url: 'https://gracefo.jpl.nasa.gov/',
    howUsedEn:
      'Monitors regional Nile Delta and Suez Canal basin terrestrial water storage and groundwater depletion trends to inform long-term water conservation priority weighting.',
    howUsedAr:
      'يرصد اتجاهات الخزن المائي الأرضي والمياه الجوفية في إقليم الدلتا وقناة السويس لدعم قرارات ترشيد المياه طويلة الأمد.',
  },
];

export default function NasaResourcesHub({ compact = false }: { compact?: boolean }) {
  const { isAr } = useLanguage();

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md mb-2">
          <Satellite className="w-3.5 h-3.5 text-emerald-700" />
          <span>
            {isAr
              ? 'مصادر البيانات المستخدمة فعلياً في محرك FieldWise'
              : 'Active Data Sources Powering FieldWise'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {isAr
            ? 'البنية العلمية والفضائية والاقتصادية المعتمدة في الحسابات (7 مصادر فعلية)'
            : 'Core Engine Inputs, Economic Pricing & Satellite Validation (7 Active Sources)'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          {isAr
            ? 'نلتزم بالشفافية العلمية: يعرض هذا القسم فقط قواعد البيانات الفضائية والزراعية الداخلة فعلياً في معادلات التقييم الثماني أو في تدقيق الحقل.'
            : 'Strict scientific transparency: only datasets directly feeding our 8-dimension mathematical equations or parcel-level satellite validation are included.'}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {ACTIVE_FIELDWISE_DATASETS.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-emerald-300 transition flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">
                  {item.agency}
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                    item.usageType === 'active_engine'
                      ? 'bg-emerald-900 text-emerald-50'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {item.usageType === 'active_engine' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isAr ? 'يدخل في الحسابات' : 'Active in Scoring Math'}</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3 h-3" />
                      <span>{isAr ? 'تدقيق فضائي مساند' : 'Next-Step Validation'}</span>
                    </>
                  )}
                </span>
              </div>

              <h3 className="font-bold text-stone-900 text-sm leading-snug">
                {item.name}
              </h3>

              <p className="text-[11px] font-mono text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/70 inline-block">
                {item.resolution}
              </p>

              <p className="text-xs text-stone-600 leading-relaxed">
                {isAr ? item.howUsedAr : item.howUsedEn}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/80">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                <span>{isAr ? 'المصدر الرسمي' : 'Official Source'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
