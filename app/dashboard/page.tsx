'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Orbit,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import type { FarmProfile, NasaClimateData } from '@/lib/types';
import {
  loadFarmProfile,
  loadClimateData,
  saveClimateData,
} from '@/lib/farm-store';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ClimateCharts from '@/components/dashboard/ClimateCharts';
import NasaResourcesHub from '@/components/nasa/NasaResourcesHub';
import { useLanguage } from '@/lib/language-context';

export default function DashboardPage() {
  const router = useRouter();
  const { t, isAr } = useLanguage();
  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [climate, setClimate] = useState<NasaClimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/nasa-power?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }
      const data: NasaClimateData = await res.json();
      setClimate(data);
      saveClimateData(data);
    } catch (err) {
      console.error('Failed to fetch NASA data:', err);
      setError('Unable to reach NASA POWER API. Local fallback loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentFarm = loadFarmProfile();
    setFarm(currentFarm);

    const cached = loadClimateData();
    if (
      cached &&
      Math.abs(cached.location.lat - currentFarm.lat) < 0.01 &&
      Math.abs(cached.location.lng - currentFarm.lng) < 0.01
    ) {
      setClimate(cached);
      setLoading(false);
    } else {
      fetchData(currentFarm.lat, currentFarm.lng);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md mb-2">
            {t.step2HeaderBadge}
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
            {t.climateTitle}
          </h1>
          <p className="text-stone-600 text-sm mt-1 flex items-center gap-2 flex-wrap">
            <span>{isAr ? 'الحقل:' : 'Farm:'} <strong>{farm?.name || (isAr ? 'حقل تجريبي' : 'Unnamed Farm')}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {farm ? `${farm.lat.toFixed(4)}°N, ${farm.lng.toFixed(4)}°E (${farm.region}, ${farm.country})` : 'Pending'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => farm && fetchData(farm.lat, farm.lng)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            {t.refreshBtn}
          </button>

          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition hover:shadow"
          >
            <span>{t.proceedToRecsBtn}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>

      {/* DATA SOURCE & SCIENTIFIC BADGE */}
      {climate && (
        <div className="mb-6 p-4 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${climate.source === 'nasa_power' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900">
                  {climate.source === 'nasa_power' ? t.liveNasaSource : t.demoSource}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-stone-100 text-stone-600 border border-stone-200">
                  {isAr ? 'الدقة المكانية: ~0.5° (~50 كم)' : 'Spatial Res: ~0.5° (~50km)'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {isAr
                  ? `فترة الرصد: سجل مناخي 20 عاماً • تاريخ الاستعلام: ${new Date(climate.retrievedAt).toLocaleDateString()}`
                  : `Period: ${climate.period.start} – ${climate.period.end} Climatology • Retrieved: ${new Date(climate.retrievedAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-500">
            {isAr ? 'المصدر: ' : 'Source: '}
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline font-medium"
            >
              power.larc.nasa.gov
            </a>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="my-16 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin mb-4" />
          <h2 className="text-lg font-bold text-stone-900">
            {isAr ? 'جاري الاتصال بأقمار ناسا وسحب البيانات البيئية...' : 'Querying NASA Earth Science Data...'}
          </h2>
          <p className="text-xs text-stone-500 max-w-md mt-1">
            {isAr
              ? `الاتصال بخوادم NASA POWER لإحداثيات ${farm?.lat}°N, ${farm?.lng}°E واستخراج المؤشرات الزراعية.`
              : `Accessing NASA POWER Agroclimatology servers for latitude ${farm?.lat}°N, longitude ${farm?.lng}°E.`}
          </p>
        </div>
      )}

      {/* MAIN CONTENT WHEN LOADED */}
      {!loading && climate && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <SummaryCards climate={climate} />

          {/* Visual Time-Series Charts */}
          <ClimateCharts monthly={climate.monthly} />

          {/* SCIENTIFIC INTERPRETATION & LIMITATIONS DUAL BOX */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Agronomic Interpretation */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {t.agriInterpretationTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isAr ? (
                  <>
                    بناءً على متوسط درجة الحرارة السنوي البالغ <strong>{climate.annual.meanTemp}°C</strong> (بين {climate.annual.minTemp}°C و {climate.annual.maxTemp}°C) وإجمالي الأمطار السنوية <strong>{climate.annual.totalPrecip} ملم</strong>:
                  </>
                ) : (
                  <>
                    With an annual mean temperature of <strong>{climate.annual.meanTemp}°C</strong> (ranging from {climate.annual.minTemp}°C to {climate.annual.maxTemp}°C) and total annual precipitation of <strong>{climate.annual.totalPrecip} mm</strong>:
                  </>
                )}
              </p>
              <ul className="text-xs text-stone-700 space-y-2 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>
                    <strong>{isAr ? 'فترات الزراعة الحرارية:' : 'Thermal Cropping Window:'}</strong>{' '}
                    {isAr
                      ? `المناخ ملائم جداً للحبوب الشتوية (قمح، شعير) والبقوليات (فول بلدي). درجات حرارة الصيف (${climate.annual.maxTemp}°C) تتطلب اختيار محاصيل صيفية تتحمل الحرارة مثل الذرة الرفيعة أو عباد الشمس.`
                      : `Favorable for cool-season cereals (Wheat, Barley) and winter legumes (Faba Bean). Peak summer temperatures (${climate.annual.maxTemp}°C) suggest summer crops require heat tolerance.`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>
                    <strong>{isAr ? 'نظام الرطوبة والأمطار:' : 'Moisture Regimes:'}</strong>{' '}
                    {isAr
                      ? (climate.annual.totalPrecip < 450
                          ? 'ظروف شبه جافة / شح مائي. ينصح بشدة بالاعتماد على محاصيل ذات جذور وتدية عميقة لامتصاص الرطوبة من الطبقات السفلية وإدخال بقوليات لا تستهلك مياهاً كثيرة.'
                          : 'هطول مطري معتدل ومناسب. يمكن زراعة محاصيل ذات متطلبات مائية متوسطة إلى عالية مع تنظيم مواعيد الري وفق أشهر الوفرة.')
                      : (climate.annual.totalPrecip < 450
                          ? 'Semi-arid / Water-limited condition. Rotations incorporating drought-tolerant taproots or low-water legumes are strongly recommended.'
                          : 'Moderate precipitation volume. Crop rotations can sustain higher-demand crops if well timed with rainfall peaks.')}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>
                    <strong>{isAr ? 'مورد الإشعاع الشمسي:' : 'Solar Resource:'}</strong>{' '}
                    {isAr
                      ? `معدل إشعاع شمسي ${climate.annual.meanSolarRad} ميغاجول/م²/يوم يضمن طاقة ضوئية ممتازة للتمثيل الضوئي، مما يجعل محدد الإنتاج الرئيسي هو الماء وليس الضوء.`
                      : `Mean downward solar flux of ${climate.annual.meanSolarRad} MJ/m²/day provides abundant photosynthetically active radiation (PAR).`}
                  </span>
                </li>
              </ul>
            </div>

            {/* Scientific Disclosures & Limitations */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-stone-900 text-stone-300 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                {t.limitationsTitle}
              </h3>
              <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
                <p>{t.limitationResolution}</p>
                <p>{t.limitationForecast}</p>
                <p>{t.limitationSoil}</p>
              </div>
            </div>
          </div>

          {/* Complete NASA & Space Agency Partner Data Ecosystem */}
          <NasaResourcesHub compact />

          {/* Action Row */}
          <div className="flex justify-end pt-4">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition hover:shadow-lg"
            >
              <span>{t.proceedToRecsBtn}</span>
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
