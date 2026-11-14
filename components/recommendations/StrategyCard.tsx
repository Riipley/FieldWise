'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Calendar,
  Layers,
  Droplets,
  DollarSign,
  Info,
  Beaker,
  Bug,
  Leaf,
} from 'lucide-react';
import type { RotationStrategy } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface StrategyCardProps {
  strategy: RotationStrategy;
  isBaseline?: boolean;
}

export default function StrategyCard({ strategy, isBaseline }: StrategyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const { t, isAr } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const name = isAr && strategy.nameAr ? strategy.nameAr : strategy.name;
  const description = isAr && strategy.descriptionAr ? strategy.descriptionAr : strategy.description;
  const objective = isAr && strategy.objectiveAr ? strategy.objectiveAr : strategy.objective;
  const sequence = isAr && strategy.sequenceAr ? strategy.sequenceAr : strategy.sequence;
  const advantages = isAr && strategy.advantagesAr ? strategy.advantagesAr : strategy.advantages;
  const disadvantages = isAr && strategy.disadvantagesAr ? strategy.disadvantagesAr : strategy.disadvantages;
  const risks = isAr && strategy.risksAr ? strategy.risksAr : strategy.risks;
  const explanation = isAr && strategy.explanationAr ? strategy.explanationAr : strategy.explanation;
  const dataLimitations = isAr && strategy.dataLimitationsAr ? strategy.dataLimitationsAr : strategy.dataLimitations;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isBaseline
          ? 'bg-stone-50 border-stone-300'
          : strategy.label === 'horticultural'
          ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-500/20'
          : strategy.label === 'food_security'
          ? 'bg-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-stone-200 shadow-xs'
      }`}
    >
      <div className="p-6">
        {/* Card Header & Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isBaseline
                ? 'bg-stone-200 text-stone-700 border-stone-300'
                : strategy.label === 'food_security'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : strategy.label === 'horticultural'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-sky-100 text-sky-800 border-sky-300'
            }`}
          >
            {isBaseline
              ? t.strategyBaselineBadge
              : strategy.label === 'food_security'
              ? t.strategyFoodSecurityBadge
              : strategy.label === 'horticultural'
              ? t.strategyHorticulturalBadge
              : t.strategyDiversifiedBadge}
          </span>

          {/* Suitability Score & Confidence Pill */}
          <div className="flex items-center gap-2">
            {strategy.confidence && (
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200"
                title={strategy.confidence.penalties.join('\n')}
              >
                {t.confidenceBadge}: {isAr ? strategy.confidence.ratingAr : strategy.confidence.rating} ({strategy.confidence.score}%)
              </span>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-bold text-sm ${getScoreColor(
                strategy.suitabilityScore
              )}`}
              dir="ltr"
            >
              <span>{strategy.suitabilityScore}</span>
              <span className="text-[10px] font-normal text-stone-500">/100</span>
            </div>
          </div>
        </div>

        {/* Strategy Name & Objective */}
        <h3 className="text-lg font-bold text-stone-900 tracking-tight mb-1.5">
          {name}
        </h3>
        {objective && (
          <p className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60 mb-3">
            {objective}
          </p>
        )}
        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          {description}
        </p>

        {/* Multi-Year Seasonal Timeline Visualizer */}
        <div className="mb-6 p-3.5 rounded-xl bg-stone-100/90 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-700 font-extrabold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              {t.multiYearTimelineTitle}
            </span>
          </div>

          <div className="space-y-2">
            {strategy.timeline && strategy.timeline.length > 0 ? (
              strategy.timeline.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-stone-200/90 text-xs shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                      {isAr ? slot.seasonNameAr : slot.seasonName}
                    </span>
                    <span className="font-bold text-stone-900">
                      {isAr ? slot.cropNameAr : slot.cropName}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      ({isAr ? slot.familyAr : slot.family})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
                    <span>
                      📅 {isAr ? `الزراعة: ${slot.plantingWindowAr}` : `Plant: ${slot.plantingWindow}`}
                    </span>
                    <span>
                      🌾 {isAr ? `الحصاد: ${slot.harvestWindowAr}` : `Harvest: ${slot.harvestWindow}`}
                    </span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      💧 {slot.waterDemandMm} mm
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {sequence.map((cropName, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs">
                      {cropName}
                    </span>
                    {idx < sequence.length - 1 && (
                      <span className={`text-stone-400 font-bold text-xs ${isAr ? 'rotate-180' : ''}`}>&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 8-Dimension Scores Summary with Toggle */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
            <span>{isAr ? 'التقييم عبر 8 أبعاد علمية معتمدة' : '8-Dimension Agronomic Breakdown'}</span>
            <button
              type="button"
              onClick={() => setShowDimensions(!showDimensions)}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-semibold"
            >
              {showDimensions ? (isAr ? 'إخفاء جدول الأوزان' : 'Hide Weights') : (isAr ? 'عرض جدول الأوزان والمساهمات' : 'View Weights & Contributions')}
            </button>
          </div>

          {showDimensions && strategy.dimensionBreakdown && (
            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-3 mb-4 text-[11px]">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-bold text-[10px] uppercase">
                    <th className="pb-1.5 text-start">{isAr ? 'المحور' : 'Dimension'}</th>
                    <th className="pb-1.5 text-center">{t.dimensionWeight}</th>
                    <th className="pb-1.5 text-center">{t.dimensionScore}</th>
                    <th className="pb-1.5 text-center">{t.dimensionContribution}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 font-medium">
                  {strategy.dimensionBreakdown.map((dim, idx) => (
                    <tr key={idx} className="hover:bg-white/60">
                      <td className="py-1 text-stone-800 font-semibold">{isAr ? dim.nameAr : dim.name}</td>
                      <td className="py-1 text-center font-mono text-stone-500">{Math.round(dim.weight * 100)}%</td>
                      <td className="py-1 text-center font-mono font-bold text-stone-700">{dim.score}</td>
                      <td className="py-1 text-center font-mono font-bold text-emerald-700">+{dim.contribution}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-stone-300 font-bold bg-emerald-50/50">
                    <td className="py-1.5 text-emerald-950">{isAr ? 'المجموع الإجمالي' : 'Overall Suitability'}</td>
                    <td className="py-1.5 text-center font-mono">100%</td>
                    <td className="py-1.5 text-center font-mono">-</td>
                    <td className="py-1.5 text-center font-mono text-emerald-800 text-xs">
                      {strategy.suitabilityScore}/100
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Progress bar visualizer */}
          <div className="space-y-2 text-xs">
            {[
              { label: t.dimClimate, val: strategy.scores.climateSuitability },
              { label: t.dimWater, val: strategy.scores.waterBalance },
              { label: t.dimSoil, val: strategy.scores.soilHealth },
              { label: t.dimNitrogen, val: strategy.scores.nitrogenBalance },
              { label: t.dimPest, val: strategy.scores.pestDiversity },
              { label: t.dimEconomic, val: strategy.scores.economicProfitability },
              { label: t.dimCalendar, val: strategy.scores.calendarFeasibility },
              { label: t.dimSustainability, val: strategy.scores.sustainability },
            ].map((dim, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-0.5 font-medium text-stone-700">
                  <span>{dim.label}</span>
                  <span className="font-mono font-semibold" dir="ltr">{dim.val}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressBarColor(dim.val)}`}
                    style={{ width: `${dim.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biological Nitrogen Fixation (BNF) Box */}
        {strategy.nitrogenAnalysis && (
          <div className="mb-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Beaker className="w-4 h-4 text-emerald-700" />
              <span>{t.nitrogenBnfTitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-white p-1.5 rounded border border-emerald-200">
                <span className="text-stone-500 block text-[9px] uppercase">{isAr ? 'إجمالي النيتروجين المثبت حيوياً' : 'Total Biological N Fixed'}</span>
                <span className="font-bold text-emerald-800">{strategy.nitrogenAnalysis.totalBnfRangeKgHa || '0 kg N/ha'}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-emerald-200">
                <span className="text-stone-500 block text-[9px] uppercase">{isAr ? 'الرصيد الصافي المتاح للمحصول التالي' : 'Net Residual Credit to Next Crop'}</span>
                <span className="font-bold text-emerald-800">{strategy.nitrogenAnalysis.residualAvailableKgHa || '0 kg N/ha'}</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-600 leading-tight">
              ⚠️ {isAr ? strategy.nitrogenAnalysis.uncertaintyRangeAr : strategy.nitrogenAnalysis.uncertaintyRange}
            </p>
          </div>
        )}

        {/* Soil pH Constraint Box */}
        {strategy.soilAmendmentAdvice && (
          <div className="mb-4 p-3 rounded-xl border border-amber-300 bg-amber-50 text-xs space-y-1 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t.soilConstraintTitle}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {isAr ? strategy.soilAmendmentAdvice.phConstraintAr : strategy.soilAmendmentAdvice.phConstraint}
            </p>
            <p className="text-[11px] font-semibold text-amber-950">
              👉 {isAr ? strategy.soilAmendmentAdvice.recommendedActionAr : strategy.soilAmendmentAdvice.recommendedAction}
            </p>
          </div>
        )}

        {/* High-level Advantages */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.advantagesLabel}
          </span>
          <ul className="text-xs text-stone-600 space-y-1.5">
            {advantages.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable Deep Dive */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-stone-200 space-y-4 text-xs">
            {/* Disadvantages / Constraints */}
            <div>
              <span className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {t.considerationsLabel}
              </span>
              <ul className="text-stone-600 space-y-1">
                {disadvantages.map((dis, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold mt-0.5">&bull;</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pathogen Cycle Disruption Details */}
            {strategy.pestAnalysis && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                  <Bug className="w-4 h-4 text-stone-600" />
                  <span>{t.pestDisruptionTitle}</span>
                </div>
                <div className="text-[11px] text-stone-600 space-y-1">
                  <p>
                    <strong className="text-emerald-800">{isAr ? 'الآفات المكبوحة بدورة التعاقب:' : 'Disrupted Pathogens:'}</strong>{' '}
                    {isAr
                      ? strategy.pestAnalysis.disruptedPathogensAr.join('، ')
                      : strategy.pestAnalysis.disruptedPathogens.join(', ')}
                  </p>
                  <p>
                    <strong className="text-amber-800">{isAr ? 'ملاحظة الفاصل الزمني:' : 'Rotation Interval Rule:'}</strong>{' '}
                    {isAr
                      ? strategy.pestAnalysis.rotationIntervalNoteAr
                      : strategy.pestAnalysis.rotationIntervalNote}
                  </p>
                </div>
              </div>
            )}

            {/* Management Risks */}
            <div>
              <span className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                {t.risksLabel}
              </span>
              <ul className="text-stone-600 space-y-1">
                {risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold mt-0.5">&bull;</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Scientific Explanation */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
              <span className="font-bold text-emerald-950 block">
                {t.whyRecommendedTitle}
              </span>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                {explanation}
              </p>
            </div>

            {/* Data Limitations */}
            <div className="text-[11px] text-stone-500 space-y-1 pt-1">
              <span className="font-bold text-stone-700 block">
                {isAr ? 'شفافية البيانات ومحدودية النماذج:' : 'Scientific Data Transparency & Uncertainty:'}
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {dataLimitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className="p-4 bg-stone-50/80 border-t border-stone-200/80 rounded-b-2xl">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 transition"
        >
          <span>{expanded ? t.hideDetailsBtn : t.viewDetailsBtn}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
