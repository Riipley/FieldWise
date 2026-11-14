'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  Compass,
  BarChart3,
  Globe2,
  FileText,
  ShieldCheck,
  Droplets,
  Sun,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import NasaResourcesHub from '@/components/nasa/NasaResourcesHub';

export default function LandingPage() {
  const { t, isAr } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-emerald-950 to-stone-900 text-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b433215_1px,transparent_1px),linear-gradient(to_bottom,#1b433215_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Official FieldWise Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/fieldwise-logo-dark-bg.png"
                alt="FieldWise - Smarter Rotations. Resilient Agriculture."
                className="h-36 sm:h-48 md:h-56 w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* NASA Space Apps 2026 Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.spaceAppsBadge} &bull; {t.challengeTitle}
            </div>

            <p className="text-lg sm:text-xl text-stone-300 font-normal leading-relaxed mb-8">
              {t.heroDescription}
            </p>

            {/* Core Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/farm"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MapPin className="w-5 h-5 text-stone-900" />
                {t.heroAnalyzeBtn}
                <ArrowRight className={`w-4 h-4 text-stone-900 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 border border-stone-700 font-medium px-6 py-3.5 rounded-xl transition"
              >
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                {t.heroDemoBtn}
              </Link>
            </div>

            {/* Micro proof points */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left rtl:text-right border-t border-stone-800/80 pt-8 text-stone-400 text-xs">
              <div>
                <span className="text-emerald-400 font-semibold block text-base">NASA POWER</span>
                {isAr ? 'ربط مباشر بالخادم' : 'Direct API Integration'}
              </div>
              <div>
                <span className="text-emerald-400 font-semibold block text-base">{isAr ? '3 دورات زراعية' : '3+ Rotations'}</span>
                {isAr ? 'مقارنة شاملة متوازية' : 'Comparative Evaluation'}
              </div>
              <div>
                <span className="text-emerald-400 font-semibold block text-base">{isAr ? 'تفسير منطقي 100%' : '100% Explainable'}</span>
                {isAr ? 'بدون افتراضات مبهمة' : 'No Black-Box Assumptions'}
              </div>
              <div>
                <span className="text-emerald-400 font-semibold block text-base">{isAr ? 'مخصص لحقلك' : 'Location-Specific'}</span>
                {isAr ? 'بناءً على إحداثياتك' : 'Tailored Micro-Agronomy'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM STATEMENT */}
      <section className="py-16 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md">
                {t.problemBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {t.problemTitle}
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">
                {t.problemP1}
              </p>
              <p className="text-stone-600 leading-relaxed text-base">
                {t.problemP2}
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-950 leading-snug">
                  {t.problemSolution}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold mb-3">
                    A
                  </div>
                  <h3 className="font-bold text-stone-900 mb-1">{t.farmA_title}</h3>
                  <p className="text-xs text-stone-500 mb-3">{t.farmA_desc}</p>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-stone-700">
                      {t.farmA_point1}
                    </li>
                    <li className="flex items-center gap-1.5 text-stone-700">
                      {t.farmA_point2}
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                    B
                  </div>
                  <h3 className="font-bold text-stone-900 mb-1">{t.farmB_title}</h3>
                  <p className="text-xs text-stone-500 mb-3">{t.farmB_desc}</p>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-stone-700">
                      {t.farmB_point1}
                    </li>
                    <li className="flex items-center gap-1.5 text-stone-700">
                      {t.farmB_point2}
                    </li>
                  </ul>
                </div>

                <div className="sm:col-span-2 p-5 bg-stone-900 text-white rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                    <Sparkles className="w-4 h-4" />
                    {t.solutionBannerTitle}
                  </div>
                  <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                    {t.solutionBannerDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 5 STEP WORKFLOW */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">
              {t.workflowBadge}
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">
              {t.workflowTitle}
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              {t.workflowSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: t.step1Title,
                desc: t.step1Desc,
                icon: MapPin,
              },
              {
                step: '02',
                title: t.step2Title,
                desc: t.step2Desc,
                icon: Globe2,
              },
              {
                step: '03',
                title: t.step3Title,
                desc: t.step3Desc,
                icon: Layers,
              },
              {
                step: '04',
                title: t.step4Title,
                desc: t.step4Desc,
                icon: Compass,
              },
              {
                step: '05',
                title: t.step5Title,
                desc: t.step5Desc,
                icon: FileText,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs relative flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div>
                    <span className="text-2xl font-black text-emerald-600/40 font-mono block mb-2">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mb-2">{item.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NASA DATA INTEGRATION SPOTLIGHT */}
      <section className="py-16 md:py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-md">
                {t.nasaBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t.nasaTitle}
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {t.nasaDescription}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Sun className="w-4 h-4" /> T2M / MAX / MIN
                  </div>
                  <p className="text-stone-400">{t.nasaTempDesc}</p>
                </div>

                <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
                  <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                    <Droplets className="w-4 h-4" /> PRECTOTCORR
                  </div>
                  <p className="text-stone-400">{t.nasaRainDesc}</p>
                </div>

                <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <Compass className="w-4 h-4" /> RH2M
                  </div>
                  <p className="text-stone-400">{t.nasaHumidityDesc}</p>
                </div>

                <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <Sun className="w-4 h-4" /> ALLSKY_SFC_SW_DWN
                  </div>
                  <p className="text-stone-400">{t.nasaSolarDesc}</p>
                </div>
              </div>

              {/* Scientific limitation transparency */}
              <div className="p-4 bg-stone-800/60 rounded-xl border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">{t.nasaDisclaimerTitle}</strong>
                  {t.nasaDisclaimerText}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-stone-800/50 p-6 rounded-2xl border border-stone-700/80">
              <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>{isAr ? 'قاعدة بيانات المحاصيل المعتمدة' : 'Crop Knowledge Base'}</span>
                <span className="text-emerald-400 text-xs">{isAr ? '7 محاصيل قياسية' : '7 Standard Benchmark Crops'}</span>
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: isAr ? 'القمح (Wheat)' : 'Wheat (Triticum aestivum)', family: 'Poaceae', role: isAr ? 'محصول حبوب شتوي أساسي' : 'Cool-season staple cereal' },
                  { name: isAr ? 'الذرة الصفراء (Maize)' : 'Maize (Zea mays)', family: 'Poaceae', role: isAr ? 'حبوب صيفية عالية الطاقة' : 'High-energy summer grain' },
                  { name: isAr ? 'الفول البلدي (Faba Bean)' : 'Faba Bean (Vicia faba)', family: 'Fabaceae', role: isAr ? 'تثبيت حيوي للنيتروجين (30-50 كغ/هكتار)' : 'Biological nitrogen fixer (30-50 kg N/ha)' },
                  { name: isAr ? 'فول الصويا (Soybean)' : 'Soybean (Glycine max)', family: 'Fabaceae', role: isAr ? 'بقوليات بروتينية صيفية' : 'Warm-season protein pulse' },
                  { name: isAr ? 'عباد الشمس (Sunflower)' : 'Sunflower (Helianthus annuus)', family: 'Asteraceae', role: isAr ? 'جذور وتدية عميقة متحملة للجفاف' : 'Deep-rooted drought scavenger' },
                  { name: isAr ? 'الشعير (Barley)' : 'Barley (Hordeum vulgare)', family: 'Poaceae', role: isAr ? 'متحمل للجفاف والملوحة' : 'Salinity & drought resilient cereal' },
                  { name: isAr ? 'الذرة الرفيعة (Sorghum)' : 'Sorghum (Sorghum bicolor)', family: 'Poaceae', role: isAr ? 'تحمل فائق للحرارة والجفاف' : 'High heat & arid tolerance' },
                ].map((crop, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{crop.name}</span>
                      <span className="text-stone-400 text-[11px]">{crop.role}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px] font-mono border border-stone-700">
                      {crop.family}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">
              {t.featuresBadge}
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">
              {t.featuresTitle}
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              {isAr
                ? 'بنية قرار شاملة تعتمد على المنطق الحيوي والبيانات التجريبية والشفافية التامة.'
                : 'A comprehensive decision architecture that prioritizes transparency, biological logic, and empirical data.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{t.feat1Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.feat1Desc}</p>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{t.feat2Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.feat2Desc}</p>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{t.feat3Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICIAL NASA & SPACE AGENCY PARTNER RESOURCES HUB */}
      <section className="py-12 md:py-16 bg-stone-50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NasaResourcesHub />
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-emerald-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t.ctaTitle}
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-base">
            {t.ctaSubtitle}
          </p>
          <div className="pt-2">
            <Link
              href="/farm"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-emerald-50 transition hover:scale-105 active:scale-95"
            >
              <MapPin className="w-5 h-5 text-emerald-700" />
              {t.ctaBtn}
              <ArrowRight className={`w-4 h-4 text-emerald-700 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
