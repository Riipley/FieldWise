'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  MapPin,
  FileText,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { RecommendationResult } from '@/lib/types';
import {
  loadFarmProfile,
  loadClimateData,
  saveRecommendations,
} from '@/lib/farm-store';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { getDemoClimateData } from '@/lib/nasa-power';
import StrategyCard from '@/components/recommendations/StrategyCard';
import ComparisonChart from '@/components/recommendations/ComparisonChart';
import RegionalAndSeasonalCard from '@/components/recommendations/RegionalAndSeasonalCard';
import AgriPriceMarketCard from '@/components/recommendations/AgriPriceMarketCard';
import { useLanguage } from '@/lib/language-context';

export default function RecommendationsPage() {
  const { t, isAr } = useLanguage();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const farm = loadFarmProfile();
    let climate = loadClimateData();

    if (!climate) {
      climate = getDemoClimateData(farm.lat, farm.lng);
    }

    const generated = generateRecommendations(farm, climate);
    setResult(generated);
    saveRecommendations(generated);
    setLoading(false);
  }, []);

  if (loading || !result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-stone-900">
          {isAr ? 'جاري تقييم التوافق الزراعي للدورات المحصولية...' : 'Evaluating Crop Rotation Synergies...'}
        </h2>
        <p className="text-xs text-stone-500">
          {isAr
            ? 'تشغيل خوارزميات الملاءمة ثمانية الأبعاد بالاستناد إلى متغيرات ناسا المناخية.'
            : 'Running 8-dimension rule-based agronomic suitability matrices against NASA POWER environmental variables.'}
        </p>
      </div>
    );
  }

  const { farmProfile, climateData, geoValidation, strategies, currentMonth, regionalFamousCrops, seasonalPlantingCrops } = result;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md mb-2">
            {t.step3HeaderBadge}
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
            {t.recsTitle}
          </h1>
          <p className="text-stone-600 text-sm mt-1 flex items-center gap-2 flex-wrap">
            <span>{isAr ? 'المزرعة:' : 'Farm:'} <strong>{farmProfile.name}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {farmProfile.lat.toFixed(4)}°N, {farmProfile.lng.toFixed(4)}°E ({isAr ? geoValidation.detectedRegionAr || farmProfile.region : geoValidation.detectedRegion || farmProfile.region}, {isAr ? geoValidation.detectedCountryAr || farmProfile.country : geoValidation.detectedCountry || farmProfile.country})
            </span>
            <span>&bull;</span>
            <span>{isAr ? 'الأمطار السنوية:' : 'Annual Precip:'} {climateData.annual.totalPrecip} {isAr ? 'ملم' : 'mm'}</span>
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition hover:shadow"
        >
          <FileText className="w-4 h-4" />
          <span>{t.generateReportBtn}</span>
          <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        </Link>
      </div>

      {/* GEOGRAPHIC INCONSISTENCY NOTICE IF PRESENT */}
      {!geoValidation.isConsistent && (
        <div className="mb-4 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-amber-800">
              {t.geoAlertTitle}
            </h4>
            <p className="leading-relaxed">
              {isAr ? geoValidation.warningMessageAr : geoValidation.warningMessage}
            </p>
          </div>
        </div>
      )}

      {/* SOIL-LOCATION CONTRADICTION NOTICE IF PRESENT */}
      {!geoValidation.soilLocationConsistent && (
        <div className="mb-6 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-rose-800">
              {isAr ? 'تنبيه التوافق بين الموقع الجغرافي وقوام التربة' : 'Geospatial & Soil Profile Cross-Validation Notice'}
            </h4>
            <p className="leading-relaxed">
              {isAr ? geoValidation.soilWarningMessageAr : geoValidation.soilWarningMessage}
            </p>
          </div>
        </div>
      )}

      {/* REGIONAL FAMOUS CROPS & READY TO PLANT NOW SPOTLIGHT */}
      <div className="mb-12">
        <RegionalAndSeasonalCard
          regionalCrops={regionalFamousCrops}
          seasonalCrops={seasonalPlantingCrops}
          currentMonth={currentMonth}
        />
      </div>

      {/* CORE STRATEGY CARDS (3 COLUMNS: BASELINE, FOOD SECURITY, HORTICULTURAL) */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              {isAr ? 'خيارات واستراتيجيات الدورات الزراعية المقترحة' : 'Evaluated Crop Rotation Strategies'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isAr
                ? 'استراتيجيات زراعية حقيقية متمايزة الأهداف: خط الأساس التقليدي، أمن الحبوب والتربة، والتنويع البستاني عالي الربحية'
                : 'Distinct agronomic strategies: Conventional baseline, food security & soil restorative, and high-value horticultural cash'}
            </p>
          </div>
          <span className="text-xs text-stone-500 hidden sm:block">
            {t.recsSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StrategyCard strategy={strategies[0]} isBaseline={true} />
          <StrategyCard strategy={strategies[1]} />
          <StrategyCard strategy={strategies[2]} />
        </div>
      </div>

      {/* COMPARISON RADAR & SIDE-BY-SIDE MATRIX */}
      <div className="mb-12">
        <ComparisonChart strategies={strategies} />
      </div>

      {/* OFFICIAL EGYPTIAN AGRIPRICE MARKET DATA & FEDDAN PROFIT CALCULATOR */}
      <div className="mb-12">
        <AgriPriceMarketCard farmProfile={result.farmProfile} />
      </div>

      {/* METHODOLOGY & TRANSPARENCY DISCLOSURE */}
      <div className="bg-stone-900 text-stone-300 p-8 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          {isAr
            ? 'المنهجية الزراعية القابلة للتفسير والنزاهة العلمية'
            : 'Explainable Agronomic Methodology & Scientific Integrity'}
        </div>
        <p className="text-xs leading-relaxed text-stone-300">
          {isAr
            ? 'يعتمد تطبيق FieldWise على مصفوفة قرار قطعية متعددة المعايير (Deterministic Decision Matrix) خاضعة لقواعد العلوم الزراعية بدلاً من خوارزميات الصندوق الأسود المعتمة. يتم تقييم كل استراتيجية عبر 8 أبعاد مستقلة بأوزان معلنة، مع مراعاة فترات الحظر الدوري للباذنجانيات وحظر تداخل المحاصيل الشتوية في نفس الموسم:'
            : 'FieldWise employs a deterministic, multi-criteria agronomic decision matrix. Rather than opaque black-box machine learning, every recommendation is calculated from empirical agricultural principles across 8 independent dimensions with explicit weights:'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700">
            <strong className="text-white block mb-1">
              {isAr ? '1. فترات الحرارة والتقويم متعدد السنوات:' : '1. Multi-Year Thermal Calendars:'}
            </strong>
            {isAr
              ? 'توزيع المحاصيل في عروات متعددة السنوات تمنع زراعة محصولين شتويين متعاقبين (مثل القمح والحمص) في نفس الموسم.'
              : 'NASA POWER monthly thermal records are matched to multi-year seasonal slots, preventing biologically impossible winter-crop collisions.'}
          </div>
          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700">
            <strong className="text-white block mb-1">
              {isAr ? '2. التوازن المائي مقابل العجز المناخي:' : '2. Climatic Deficit vs. Irrigation:'}
            </strong>
            {isAr
              ? 'الفصل الواضح بين الشح المناخي للأمطار وإمكانات مياه الري المتاحة بالمزرعة (كالري بالتنقيط) لتأمين الاحتياج المائي.'
              : 'Explicitly separates the severe climatic rainfall deficit from farm-level irrigation security (e.g. drip canals/wells).'}
          </div>
          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700">
            <strong className="text-white block mb-1">
              {isAr ? '3. التثبيت الحيوي وحظر الباذنجانيات:' : '3. BNF Nitrogen & Solanaceae Breaks:'}
            </strong>
            {isAr
              ? 'احتساب رصيد النيتروجين الحيوي الصافي (25-45 كغ N/هكتار) مع نسب عدم اليقين، والالتزام الصارم بفاصل 3 سنوات للبطاطس لمنع الذبول الفيرتيسيليومي.'
              : 'Credits net biological residual nitrogen (25–45 kg N/ha) with uncertainty ranges and enforces a mandatory 3-year break for Solanaceae to prevent Verticillium wilt.'}
          </div>
        </div>
        <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-2 border-t border-stone-800">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>{isAr ? 'تنويه علمي:' : 'Disclaimer:'}</strong>{' '}
            {isAr
              ? 'الدرجات تعبر عن الملاءمة النسبية في ظل الإحصاءات المناخية. وتعتمد النتائج الحقلية على الصرف الموضعي وعمق التربة وإدارة المزارع والتحاليل المعملية الدورية.'
              : 'Scores indicate relative suitability under historical climate statistics. Actual farm performance depends on field micro-topography, laboratory soil tests, and localized seasonal weather.'}
          </span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-end pt-8">
        <Link
          href="/report"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition hover:shadow-lg"
        >
          <FileText className="w-5 h-5" />
          <span>{isAr ? 'استعراض التقرير الزراعي النهائي للحقل' : 'View Comprehensive Farm Report'}</span>
          <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    </div>
  );
}
