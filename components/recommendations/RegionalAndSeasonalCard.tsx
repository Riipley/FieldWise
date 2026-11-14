'use client';

import React from 'react';
import { Calendar, MapPin, Sparkles, CheckCircle2, Clock, Leaf, Tag } from 'lucide-react';
import type { RegionalFamousCrop, SeasonalPlantingCrop } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface RegionalAndSeasonalCardProps {
  regionalCrops: RegionalFamousCrop[];
  seasonalCrops: SeasonalPlantingCrop[];
  currentMonth: number;
}

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function RegionalAndSeasonalCard({
  regionalCrops,
  seasonalCrops,
  currentMonth,
}: RegionalAndSeasonalCardProps) {
  const { isAr } = useLanguage();
  const currentMonthName = isAr
    ? MONTH_NAMES_AR[currentMonth - 1]
    : MONTH_NAMES_EN[currentMonth - 1];

  return (
    <div className="space-y-6">
      {/* 1. CROPS READY TO PLANT RIGHT NOW (الوقت الحالي) */}
      <div className="bg-gradient-to-br from-emerald-900 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-700/40 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              {isAr ? `توقيت الموسم الحالي: شهر ${currentMonthName}` : `Current Calendar Window: ${currentMonthName}`}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {isAr ? 'أنسب المحاصيل التي يمكن زراعتها في هذا التوقيت' : 'Optimal Crops Ready to Plant Right Now'}
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {isAr
                ? `بناءً على منحنيات حرارة ناسا لهذا الشهر (${currentMonthName})، هذه المحاصيل تتطابق متطلبات إنباتها مع درجات الحرارة الحالية في حقلك:`
                : `Based on NASA satellite thermal climatology for ${currentMonthName}, these crops currently match optimal soil & germination temperatures:`}
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 text-center">
            {isAr ? `${seasonalCrops.length} محاصيل متاحة للزراعة` : `${seasonalCrops.length} Active Crop Windows`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasonalCrops.map((item, idx) => {
            const isNow = item.status === 'plant_now';
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition hover:scale-[1.01] ${
                  isNow
                    ? 'bg-stone-800/90 border-emerald-500/60 shadow-inner'
                    : 'bg-stone-800/50 border-stone-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {isAr ? item.crop.arabicName : item.crop.name}
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      {isAr ? item.crop.name : item.crop.arabicName} &bull; {item.crop.family}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-700/70 text-emerald-300 font-medium">
                    {item.crop.category === 'horticultural'
                      ? (isAr ? 'محصول بستاني / خضر' : 'Horticultural / Cash Veg')
                      : (isAr ? 'محصول حبوب / حقلي' : 'Field / Grain Crop')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-700/70 text-stone-300">
                    {isAr ? item.seasonNameAr : item.seasonName}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {isAr ? item.reasonAr : item.reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MOST FAMOUS REGIONAL CROPS (أشهر المحاصيل في هذه المنطقة) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              {isAr ? 'المطابقة الجغرافية والتراث الزراعي' : 'Geographical & Agronomic Profiling'}
            </div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">
              {isAr ? 'أشهر المحاصيل الزراعية في هذه المنطقة' : 'Most Prevalent & Famous Crops in this Region'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {isAr
                ? 'المحاصيل الاستراتيجية والبستانية التي يزرعها المزارعون بنجاح في هذا الإقليم المناخي مع توفر أسواقها:'
                : 'Commercial staples and horticultural crops historically adapted and widely marketed across this territory:'}
            </p>
          </div>

          <span className="text-xs text-stone-500">
            {isAr ? 'تشمل محاصيل حقلية وبستانية نقدية' : 'Includes Field & High-Value Cash Vegetables'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regionalCrops.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200 flex flex-col justify-between hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.crop.category === 'horticultural'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {item.crop.category === 'horticultural'
                      ? (isAr ? 'بستاني / خضر' : 'Horticultural')
                      : (isAr ? 'محصول حقلي' : 'Field Crop')}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500" dir="ltr">
                    {item.popularityScore}%
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm mb-0.5">
                  {isAr ? item.crop.arabicName : item.crop.name}
                </h4>
                <span className="text-[11px] text-stone-500 block mb-2">
                  {isAr ? item.crop.name : item.crop.arabicName} &bull; {item.crop.family}
                </span>

                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  {isAr ? item.reasonAr : item.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                <span>{isAr ? 'احتياج الماء:' : 'Water:'} <strong className="capitalize">{item.crop.waterDemand}</strong></span>
                <span>{isAr ? 'النمو:' : 'Days:'} <strong>{item.crop.growingDays} {isAr ? 'يوم' : 'd'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
