'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ExternalLink,
  Calculator,
  Coins,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  AGRIPRICE_CROPS,
  AGRIPRICE_BENCHMARK_EXTRAS,
  AGRIPRICE_SOURCE_METADATA,
} from '@/lib/agriprice-data';
import type { FarmProfile } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface AgriPriceMarketCardProps {
  farmProfile: FarmProfile;
}

export default function AgriPriceMarketCard({ farmProfile }: AgriPriceMarketCardProps) {
  const { isAr } = useLanguage();

  const areaFeddans =
    farmProfile.areaUnit === 'feddans'
      ? farmProfile.area
      : farmProfile.areaUnit === 'hectares'
      ? Math.round((farmProfile.area / 0.42) * 10) / 10
      : Math.round(((farmProfile.area * 0.404686) / 0.42) * 10) / 10;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md mb-2">
            <Coins className="w-3.5 h-3.5" />
            {isAr
              ? 'أسعار المحاصيل الرسمية وحاسبة أرباح الفدان (AgriPrice Egypt)'
              : 'Official Egyptian Crop Prices & Feddan Profit Calculator'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {isAr
              ? 'بوابة الأسعار المحلية والعالمية — مجلس الوزراء المصري (نوفمبر 2026)'
              : 'Egyptian Cabinet IDSC Local Crop Prices & Parcel Economics (Nov 2026)'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {isAr
              ? `أسعار الحقول المباشرة (للطن) وسوق الجملة والتجزئة عبر 27 محافظة، مع حساب الإيراد الإجمالي وصافي الربح لمساحة مزرعتك (${areaFeddans} فدان).`
              : `Official Farmgate (EGP/ton), Wholesale, and Retail prices across 27 Egyptian governorates, scaled to your parcel (${areaFeddans} feddans).`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={AGRIPRICE_SOURCE_METADATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition inline-flex items-center gap-1"
          >
            <span>{isAr ? 'المصدر الرسمي (agriprice.gov.eg)' : 'Official Source (agriprice.gov.eg)'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-y border-stone-200">
              <th className="py-3 px-3.5 text-start font-bold">
                {isAr ? 'المحصول' : 'Crop'}
              </th>
              <th className="py-3 px-3.5 text-start font-bold">
                {isAr ? 'سعر الحقل للطن (EGP)' : 'Farmgate Price / Ton (EGP)'}
              </th>
              <th className="py-3 px-3.5 text-start font-bold">
                {isAr ? 'سعر الجملة / التجزئة' : 'Wholesale / Retail'}
              </th>
              <th className="py-3 px-3.5 text-start font-bold">
                {isAr ? 'متوسط إنتاج الفدان' : 'Avg Yield / Feddan'}
              </th>
              <th className="py-3 px-3.5 text-start font-bold bg-emerald-50/60 text-emerald-950">
                {isAr ? 'إيراد الفدان وصافي الربح التقديري' : 'Gross Revenue & Net Margin / Feddan'}
              </th>
              <th className="py-3 px-3.5 text-start font-bold bg-amber-50/60 text-amber-950">
                {isAr
                  ? `صافي ربح المزرعة (${areaFeddans} فدان)`
                  : `Total Parcel Net Margin (${areaFeddans} feddans)`}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {AGRIPRICE_CROPS.map((item) => {
              const farmgateAvg = item.farmgateTonEgp?.avg || 15000;
              const grossRevPerFeddan = Math.round(farmgateAvg * item.avgYieldTonPerFeddan.typical);
              const netMarginPerFeddan = Math.round(grossRevPerFeddan - item.estimatedCostPerFeddanEgp);
              const totalParcelNet = Math.round(netMarginPerFeddan * areaFeddans);

              return (
                <tr key={item.cropId} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-3.5 font-bold text-stone-900">
                    <div>{isAr ? item.nameAr : item.nameEn}</div>
                    <span className="text-[10px] font-normal text-stone-500">
                      {item.category === 'vegetables'
                        ? isAr
                          ? 'محصول خضر بستاني نقدي'
                          : 'Horticultural Cash Crop'
                        : isAr
                        ? 'محصول حقلي (حبوب / بقوليات / زيوت)'
                        : 'Field Crop (Grain / Pulse / Oilseed)'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <div className="font-bold text-stone-900">
                      {farmgateAvg.toLocaleString('en-US')} EGP/t
                    </div>
                    {item.farmgateTonEgp && (
                      <span className="text-[10px] text-stone-500">
                        {isAr ? 'المدى:' : 'Range:'} {item.farmgateTonEgp.min.toLocaleString('en-US')} –{' '}
                        {item.farmgateTonEgp.max.toLocaleString('en-US')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-stone-700">
                    {item.wholesaleEgp && (
                      <div>
                        <span className="text-stone-500">{isAr ? 'جملة:' : 'Wholesale:'}</span>{' '}
                        <strong>{item.wholesaleEgp.avg.toLocaleString('en-US')}</strong> EGP/
                        {isAr ? item.wholesaleEgp.unitAr : item.wholesaleEgp.unitEn}
                      </div>
                    )}
                    {item.retailEgp && (
                      <div className="text-[10px] text-stone-500">
                        {isAr ? 'تجزئة:' : 'Retail:'} {item.retailEgp.avg.toLocaleString('en-US')} EGP/
                        {isAr ? item.retailEgp.unitAr : item.retailEgp.unitEn}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-stone-900 font-mono">
                      {item.avgYieldTonPerFeddan.typical} {isAr ? 'طن/فدان' : 't/feddan'}
                    </div>
                    <span className="text-[10px] text-stone-500">
                      {isAr
                        ? item.avgYieldTonPerFeddan.localUnitNoteAr
                        : item.avgYieldTonPerFeddan.localUnitNoteEn}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 bg-emerald-50/40 font-mono">
                    <div className="font-bold text-emerald-800">
                      +{netMarginPerFeddan.toLocaleString('en-US')} EGP/{isAr ? 'فدان' : 'fed'}
                    </div>
                    <span className="text-[10px] text-stone-600">
                      {isAr ? 'الإيراد:' : 'Gross:'} {grossRevPerFeddan.toLocaleString('en-US')} |{' '}
                      {isAr ? 'التكلفة:' : 'Cost:'} {item.estimatedCostPerFeddanEgp.toLocaleString('en-US')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 bg-amber-50/40 font-mono font-extrabold text-amber-900">
                    {totalParcelNet.toLocaleString('en-US')} EGP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* National Crop Benchmarks (Always Visible) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-700" />
          {isAr
            ? 'مؤشرات أسعار محاصيل مصرية استراتيجية إضافية (أرز / سمسم / فاصوليا / قطن)'
            : 'Additional National Egyptian Crop Benchmarks (Rice / Sesame / Dry Beans / Cotton)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGRIPRICE_BENCHMARK_EXTRAS.map((extra, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-stone-200 bg-stone-50/80 space-y-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {isAr ? extra.levelAr : extra.levelEn}
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                {isAr ? extra.nameAr : extra.nameEn}
              </h4>
              <div className="text-xl font-black text-emerald-800 font-mono">
                {extra.avgEgp.toLocaleString('en-US')} EGP / {isAr ? extra.unitAr : extra.unitEn}
              </div>
              <p className="text-xs text-stone-600 font-mono">
                {isAr ? 'المدى السعري:' : 'Price Range:'} {extra.minEgp.toLocaleString('en-US')} –{' '}
                {extra.maxEgp.toLocaleString('en-US')} EGP
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Annualized Comparison Summary Footer */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-start sm:items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            {isAr
              ? 'تمت معايرة البعد الاقتصادي (10%) وهوامش الربح السنوية للدورات الثلاث (Option A: 24–32 ألف ج/فدان | Option B: 38–48 ألف ج/فدان | Option C: 65–95 ألف ج/فدان) مباشرة من أسعار الحقول الرسمية لبوابة مجلس الوزراء المصري.'
              : 'Economic Return (10%) and annualized strategy gross margins (Option A: 24–32k EGP/fed/yr | Option B: 38–48k EGP/fed/yr | Option C: 65–95k EGP/fed/yr) are directly calibrated from official Egyptian Cabinet IDSC farmgate prices.'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-500 shrink-0" dir="ltr">
          Source: agriprice.gov.eg (Nov 2026)
        </span>
      </div>
    </div>
  );
}
