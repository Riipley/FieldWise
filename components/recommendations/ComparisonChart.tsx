'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import type { RotationStrategy } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface ComparisonChartProps {
  strategies: RotationStrategy[];
}

export default function ComparisonChart({ strategies }: ComparisonChartProps) {
  const { t, isAr } = useLanguage();

  if (!strategies || strategies.length < 3) return null;

  const [stratA, stratB, stratC] = strategies;

  // Prepare data for the 8-dimension Radar chart
  const radarData = [
    {
      dimension: t.dimClimate,
      Current: stratA.scores.climateSuitability,
      FoodSecurity: stratB.scores.climateSuitability,
      Horticultural: stratC.scores.climateSuitability,
    },
    {
      dimension: t.dimWater,
      Current: stratA.scores.waterBalance,
      FoodSecurity: stratB.scores.waterBalance,
      Horticultural: stratC.scores.waterBalance,
    },
    {
      dimension: t.dimSoil,
      Current: stratA.scores.soilHealth,
      FoodSecurity: stratB.scores.soilHealth,
      Horticultural: stratC.scores.soilHealth,
    },
    {
      dimension: t.dimNitrogen,
      Current: stratA.scores.nitrogenBalance,
      FoodSecurity: stratB.scores.nitrogenBalance,
      Horticultural: stratC.scores.nitrogenBalance,
    },
    {
      dimension: t.dimPest,
      Current: stratA.scores.pestDiversity,
      FoodSecurity: stratB.scores.pestDiversity,
      Horticultural: stratC.scores.pestDiversity,
    },
    {
      dimension: t.dimEconomic,
      Current: stratA.scores.economicProfitability,
      FoodSecurity: stratB.scores.economicProfitability,
      Horticultural: stratC.scores.economicProfitability,
    },
    {
      dimension: t.dimCalendar,
      Current: stratA.scores.calendarFeasibility,
      FoodSecurity: stratB.scores.calendarFeasibility,
      Horticultural: stratC.scores.calendarFeasibility,
    },
    {
      dimension: t.dimSustainability,
      Current: stratA.scores.sustainability,
      FoodSecurity: stratB.scores.sustainability,
      Horticultural: stratC.scores.sustainability,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. VISUAL RADAR BENCHMARK */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="mb-4 pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {t.radarTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {t.radarSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-stone-600">
              <span className="w-3 h-3 rounded-xs bg-stone-400 inline-block" /> {isAr ? 'الدورة الحالية (أ)' : 'Current Baseline (A)'}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> {isAr ? 'الأمن الغذائي والتربة (ب)' : 'Food Security (B)'}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-700">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> {isAr ? 'التنويع البستاني (ج)' : 'Horticultural Cash (C)'}
            </span>
          </div>
        </div>

        <div className="h-84 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e7e5e4" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#44403c', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e7e5e4',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Radar
                name={isAr ? 'الدورة الحالية (أ)' : 'Current Baseline (A)'}
                dataKey="Current"
                stroke="#78716c"
                fill="#78716c"
                fillOpacity={0.2}
              />
              <Radar
                name={isAr ? 'الأمن الغذائي والتربة (ب)' : 'Food Security & Soil (B)'}
                dataKey="FoodSecurity"
                stroke="#059669"
                fill="#059669"
                fillOpacity={0.35}
              />
              <Radar
                name={isAr ? 'التنويع البستاني (ج)' : 'Horticultural Cash (C)'}
                dataKey="Horticultural"
                stroke="#d97706"
                fill="#d97706"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-base font-bold text-stone-900">
            {t.matrixTitle}
          </h3>
          <p className="text-xs text-stone-500">
            {t.matrixSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">{isAr ? 'المؤشر والبعد العلمي' : 'Agronomic Dimension'}</th>
                <th className="py-3.5 px-4 bg-stone-100/60">{isAr ? 'الدورة الحالية (أ) - خط الأساس' : 'Current Baseline (A)'}</th>
                <th className="py-3.5 px-4 bg-emerald-50/60 text-emerald-950">{isAr ? 'الخيار (ب) - أمن الحبوب والتربة' : 'Option (B) - Food Security'}</th>
                <th className="py-3.5 px-4 bg-amber-50/60 text-amber-950">{isAr ? 'الخيار (ج) - الاستثمار البستاني' : 'Option (C) - Horticultural Cash'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'الهدف الزراعي الرئيسي' : 'Primary Strategic Objective'}</td>
                <td className="py-3 px-4 bg-stone-100/30 font-medium">
                  {isAr ? stratA.objectiveAr : stratA.objective}
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 font-medium text-emerald-900">
                  {isAr ? stratB.objectiveAr : stratB.objective}
                </td>
                <td className="py-3 px-4 bg-amber-50/30 font-medium text-amber-900">
                  {isAr ? stratC.objectiveAr : stratC.objective}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'درجة الملاءمة الإجمالية (من 100)' : 'Overall Suitability Score'}</td>
                <td className="py-3 px-4 bg-stone-100/30 font-mono font-bold text-stone-700 text-sm">
                  {stratA.suitabilityScore} / 100
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 font-mono font-bold text-emerald-700 text-sm">
                  {stratB.suitabilityScore} / 100
                </td>
                <td className="py-3 px-4 bg-amber-50/30 font-mono font-bold text-amber-700 text-sm">
                  {stratC.suitabilityScore} / 100
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'تسلسل العروات والمواسم' : 'Multi-Year Cropping Sequence'}</td>
                <td className="py-3 px-4 bg-stone-100/30 font-medium">
                  {(isAr && stratA.sequenceAr ? stratA.sequenceAr : stratA.sequence).join(isAr ? ' ← ' : ' → ')}
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 font-medium text-emerald-900">
                  {(isAr && stratB.sequenceAr ? stratB.sequenceAr : stratB.sequence).join(isAr ? ' ← ' : ' → ')}
                </td>
                <td className="py-3 px-4 bg-amber-50/30 font-medium text-amber-900">
                  {(isAr && stratC.sequenceAr ? stratC.sequenceAr : stratC.sequence).join(isAr ? ' ← ' : ' → ')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'تثبيت النيتروجين الحيوي (BNF)' : 'Biological Nitrogen Credit (BNF)'}</td>
                <td className="py-3 px-4 bg-stone-100/30 text-rose-700 font-medium">
                  {stratA.nitrogenAnalysis?.residualAvailableKgHa || (isAr ? '0 كجم N/هكتار (اعتماد تام على الأسمدة)' : '0 kg N/ha (100% synthetic reliance)')}
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 text-emerald-800 font-medium">
                  {stratB.nitrogenAnalysis?.residualAvailableKgHa || '25 – 45 kg N/ha (13 – 23 kg N/ha/yr)'}
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-900 font-medium">
                  {stratC.nitrogenAnalysis?.residualAvailableKgHa || '45 – 83 kg N/ha (11 – 21 kg N/ha/yr)'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'كسر أمراض التربة والآفات' : 'Pathogen Cycle Disruption'}</td>
                <td className="py-3 px-4 bg-stone-100/30 text-rose-700">
                  {isAr ? `ضعيف (${stratA.scores.pestDiversity}%) - توالي النجيليات يراكم أعفان الجذور` : `Low (${stratA.scores.pestDiversity}%) - Continuous cereals build up take-all`}
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 text-emerald-800">
                  {isAr ? `قوي (${stratB.scores.pestDiversity}%) - فاصل عام كامل ثنائي الفلقة (الفول + دوار الشمس)` : `Strong (${stratB.scores.pestDiversity}%) - 1-year dicot break (Faba Bean + Sunflower)`}
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-900 font-medium">
                  {isAr ? `ممتاز (${stratC.scores.pestDiversity}%) - دورة رباعية بفاصل 3 سنوات للبطاطس + كبح النيماتودا بالبصل (عائل ضعيف)` : `Superior (${stratC.scores.pestDiversity}%) - 4-year cycle (3-yr Solanaceae break + Onion poor-host Meloidogyne suppression)`}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-stone-900">{isAr ? 'العائد المالي ومستوى رأس المال' : 'Profit Margin & Working Capital'}</td>
                <td className="py-3 px-4 bg-stone-100/30 text-stone-600">
                  {isAr ? 'هامش ربح أساسي متواضع مع رأس مال منخفض' : 'Modest staple margin, low working capital'}
                </td>
                <td className="py-3 px-4 bg-emerald-50/30 text-emerald-800 font-medium">
                  {isAr ? 'استقرار غذائي وتكلفة أسمدة منخفضة' : 'High stability & reduced fertilizer cost'}
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-900 font-bold">
                  {isAr ? 'عائد نقدي وتصديري قياسي يتطلب رأس مال أكبر' : 'High gross margin, higher capital required'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
