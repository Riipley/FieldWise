'use client';

import React from 'react';
import { Thermometer, Droplets, Sun, Wind, AlertCircle } from 'lucide-react';
import type { NasaClimateData } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface SummaryCardsProps {
  climate: NasaClimateData;
}

export default function SummaryCards({ climate }: SummaryCardsProps) {
  const { t, isAr } = useLanguage();
  const { annual } = climate;

  const deficit = annual.annualDeficitMm ?? (annual.totalPrecip - 1650);

  const cards = [
    {
      title: t.annualMeanTemp,
      param: 'T2M MEAN',
      value: `${annual.meanTemp}°C`,
      subtext: isAr
        ? `القصوى: ${annual.maxTemp}°C • الدنيا: ${annual.minTemp}°C`
        : `Warmest: ${annual.maxTemp}°C • Coolest: ${annual.minTemp}°C`,
      icon: Thermometer,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: isAr ? 'متوسط مناخي 20 عاماً' : '20-Year Climatology Mean',
    },
    {
      title: t.annualPrecip,
      param: 'PRECTOTCORR',
      value: `${annual.totalPrecip} ${isAr ? 'ملم/سنة' : 'mm/yr'}`,
      subtext: isAr
        ? `تراكمي 12 شهراً كاملة • شهرياً: ${(annual.totalPrecip / 12).toFixed(1)} ملم`
        : `12-Month Cumulative Sum • Monthly avg: ${(annual.totalPrecip / 12).toFixed(1)} mm`,
      icon: Droplets,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      badge: isAr ? 'هطول سنوي تراكمي' : 'Cumulative Annual Sum',
    },
    {
      title: isAr ? 'العجز المائي المناخي (ETo)' : 'Climatic Water Deficit',
      param: 'DEFICIT (P - PET)',
      value: `${deficit} ${isAr ? 'ملم' : 'mm'}`,
      subtext: isAr
        ? 'عجز تبخيري مناخي يغطيه الري بالتنقيط'
        : 'Evaporative deficit covered by irrigation',
      icon: AlertCircle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      badge: isAr ? 'فجوة المطر والتبخير' : 'Precipitation vs. Demand',
    },
    {
      title: t.relativeHumidity,
      param: 'RH2M MEAN',
      value: `${annual.meanHumidity}%`,
      subtext: isAr ? 'رطوبة الهواء السطحي على ارتفاع 2م' : 'Surface air at 2m height',
      icon: Wind,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      badge: isAr ? 'مؤشر الرطوبة الجوية' : 'Atmospheric Moisture',
    },
    {
      title: t.solarRadiation,
      param: 'ALLSKY_SFC_SW_DWN',
      value: `${annual.meanSolarRad} ${isAr ? 'ميغاجول' : 'MJ'}`,
      subtext: isAr ? 'إشعاع نازل يومي لكل م²' : 'Daily surface downward flux',
      icon: Sun,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      badge: isAr ? 'طاقة البناء الضوئي' : 'Photosynthetic Flux',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-md">
                  {card.param}
                </span>
                <div className={`w-7 h-7 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-[11px] font-semibold text-stone-600 mb-0.5">{card.title}</h3>
              <div className="text-xl font-black text-stone-900 tracking-tight" dir="ltr">
                {card.value}
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500">
              <span className="block font-medium text-stone-600">{card.badge}</span>
              <span className="text-stone-400">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
