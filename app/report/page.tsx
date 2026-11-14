'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';
import type { RecommendationResult } from '@/lib/types';
import {
  loadFarmProfile,
  loadClimateData,
  loadRecommendations,
  saveRecommendations,
} from '@/lib/farm-store';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { getDemoClimateData } from '@/lib/nasa-power';
import ReportView from '@/components/report/ReportView';
import { useLanguage } from '@/lib/language-context';

export default function ReportPage() {
  const { t, isAr } = useLanguage();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let recs = loadRecommendations();
    const currentVersion = 'FieldWise-Scientific-v2.3 (8-Dimension Corrected Weights & Water Rule)';
    
    // If no recs or older engine version, regenerate fresh
    if (!recs || recs.engineVersion !== currentVersion || !recs.strategies?.[0]?.dimensionBreakdown) {
      const farm = loadFarmProfile();
      let climate = loadClimateData();
      if (!climate) {
        climate = getDemoClimateData(farm.lat, farm.lng);
      }
      recs = generateRecommendations(farm, climate);
      saveRecommendations(recs);
    }
    setResult(recs);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-700 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-500 text-sm">
          {isAr ? 'جاري تجهيز وطباعة التقرير الزراعي النهائي...' : 'Compiling Final Agricultural Report...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Action Header bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200 no-print">
        <div>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 mb-2 transition"
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.backToRecsBtn}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.reportHeaderTitle}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {isAr
              ? 'جاهز للتصدير كملف PDF، أو الطباعة للملف الميداني، أو مراجعته مع مهندسي الإرشاد الزراعي.'
              : 'Ready to export as PDF, print for farm records, or review with agricultural extension specialists.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? t.copiedBtn : t.shareBtn}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition hover:shadow"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBtn}</span>
          </button>
        </div>
      </div>

      {/* RENDER THE FULL AGRONOMIC REPORT */}
      <ReportView result={result} />
    </div>
  );
}
