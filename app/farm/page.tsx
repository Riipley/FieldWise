'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Save,
  ArrowRight,
  Sparkles,
  Layers,
  Droplets,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import type { FarmProfile } from '@/lib/types';
import {
  loadFarmProfile,
  saveFarmProfile,
  PRESET_FARMS,
} from '@/lib/farm-store';
import { CROPS } from '@/lib/crop-database';
import { useLanguage } from '@/lib/language-context';
import {
  validateCoordinates,
  formatDualArea,
  EGYPT_GOVERNORATES,
  findNearestEgyptGovernorate,
  type EgyptGovernorate,
} from '@/lib/geo-validator';

// Dynamically import Leaflet LocationPicker with SSR disabled
const LocationPicker = dynamic(
  () => import('@/components/farm/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] sm:h-[420px] bg-stone-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-stone-400 text-sm border border-stone-200">
        <MapPin className="w-8 h-8 text-stone-300 animate-bounce mb-2" />
        Initializing OpenStreetMap geospatial canvas...
      </div>
    ),
  }
);

export default function FarmProfilePage() {
  const router = useRouter();
  const { t, isAr } = useLanguage();
  const [profile, setProfile] = useState<FarmProfile>(() => loadFarmProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadFarmProfile();
    if (existing) {
      setProfile(existing);
    }
  }, []);

  // Real-time geographic & soil cross-validation
  const geoValidation = useMemo(() => {
    return validateCoordinates(profile.lat, profile.lng, profile.country, profile.region, profile.soilType);
  }, [profile.lat, profile.lng, profile.country, profile.region, profile.soilType]);

  const handleCoordinateSelect = (lat: number, lng: number) => {
    const nearestGov = findNearestEgyptGovernorate(lat, lng);
    if (nearestGov) {
      setProfile((prev) => ({
        ...prev,
        country: 'Egypt',
        region: nearestGov.regionValue,
        lat,
        lng,
      }));
    } else {
      setProfile((prev) => ({ ...prev, lat, lng }));
    }
  };

  const handleGovernorateSelect = (gov: EgyptGovernorate) => {
    setProfile((prev) => ({
      ...prev,
      country: 'Egypt',
      region: gov.regionValue,
      lat: gov.lat,
      lng: gov.lng,
      soilType: gov.defaultSoil,
    }));
  };

  const selectedGovId = useMemo(() => {
    const byRegion = EGYPT_GOVERNORATES.find(
      (g) =>
        profile.region === g.regionValue ||
        profile.region.toLowerCase().includes(g.nameEn.toLowerCase()) ||
        profile.region.includes(g.nameAr)
    );
    if (byRegion) return byRegion.id;
    const byCoords = findNearestEgyptGovernorate(profile.lat, profile.lng);
    return byCoords?.id || '';
  }, [profile.region, profile.lat, profile.lng]);

  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESET_FARMS[presetKey];
    if (preset) {
      setProfile({ ...preset });
    }
  };

  const applyGeoCorrection = () => {
    if (geoValidation.suggestedCountry && geoValidation.suggestedRegion) {
      setProfile((prev) => ({
        ...prev,
        country: geoValidation.suggestedCountry!,
        region: geoValidation.suggestedRegion!,
      }));
    }
  };

  const togglePriority = (priority: string) => {
    setProfile((prev) => {
      const exists = prev.priorities.includes(priority);
      const updated = exists
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority];
      return { ...prev, priorities: updated };
    });
  };

  const toggleCurrentCrop = (cropName: string) => {
    setProfile((prev) => {
      const exists = prev.currentCrops.includes(cropName);
      let updated: string[];
      if (exists) {
        updated = prev.currentCrops.filter((c) => c !== cropName);
      } else {
        if (prev.currentCrops.length >= 4) return prev;
        updated = [...prev.currentCrops, cropName];
      }
      return { ...prev, currentCrops: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile.name || profile.name.trim().length === 0) {
      setFormError(
        isAr ? 'يرجى إدخال اسم المزرعة أو الحقل.' : 'Please enter a valid farm or parcel name.'
      );
      return;
    }

    if (
      !Number.isFinite(profile.lat) ||
      profile.lat < -90 ||
      profile.lat > 90 ||
      !Number.isFinite(profile.lng) ||
      profile.lng < -180 ||
      profile.lng > 180
    ) {
      setFormError(
        isAr
          ? 'إحداثيات غير صالحة: يجب أن يكون خط العرض بين -90 و 90 وخط الطول بين -180 و 180.'
          : 'Invalid GPS coordinates: Latitude must be between -90 and 90, and Longitude between -180 and 180.'
      );
      return;
    }

    if (!Number.isFinite(profile.area) || profile.area <= 0 || profile.area > 100000) {
      setFormError(
        isAr
          ? 'يرجى إدخال مساحة زراعية موجبة ومنطقية (من 0.1 إلى 100,000).'
          : 'Please enter a valid positive farm area (between 0.1 and 100,000).'
      );
      return;
    }

    if (!Array.isArray(profile.currentCrops) || profile.currentCrops.length === 0) {
      setFormError(
        isAr
          ? 'يرجى اختيار محصول واحد على الأقل من المحاصيل المزروعة حالياً.'
          : 'Please select at least 1 current or recent crop in your baseline rotation.'
      );
      return;
    }

    setIsSaving(true);
    const updatedProfile = { ...profile, name: profile.name.trim(), geoValidation };
    saveFarmProfile(updatedProfile);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const SOIL_TYPES = [
    { value: 'clay', label: isAr ? 'طينية (ثقيلة وتحتفظ بالماء)' : 'Clay (Heavy Alluvial)' },
    { value: 'clay-loam', label: isAr ? 'طينية طميية (متوسطة ومثالية)' : 'Clay-Loam (Balanced)' },
    { value: 'loam', label: isAr ? 'طميية خصبة (سهلة الخدمة)' : 'Loam (Friable)' },
    { value: 'sandy-loam', label: isAr ? 'رملية طميية (جيدة الصرف)' : 'Sandy-Loam (Well-drained)' },
    { value: 'sand', label: isAr ? 'رملية خفيفة (سريعة الجفاف)' : 'Sand (Coarse)' },
    { value: 'unknown', label: isAr ? 'غير محدد معملياً' : 'Unknown / Untested' },
  ];

  const SOIL_PH_OPTIONS = [
    { value: 'acidic', label: isAr ? 'حامضية (< 6.0) قيد تثبيت الفوسفور' : 'Acidic (<6.0) - P fixation risk' },
    { value: 'neutral', label: isAr ? 'معتدلة (6.0 - 7.5) مثالية' : 'Neutral (6.0 - 7.5)' },
    { value: 'alkaline', label: isAr ? 'قلوية / كلسية (> 7.5) شائعة بمصر' : 'Alkaline (>7.5) - Common in Nile Valley' },
    { value: 'unknown', label: isAr ? 'غير معروف' : 'Unknown / Not tested' },
  ];

  const ORGANIC_MATTER_OPTIONS = [
    { value: 'low', label: isAr ? 'منخفضة (< 1.5%) فقيرة' : 'Low (<1.5%)' },
    { value: 'medium', label: isAr ? 'متوسطة (1.5% - 3%)' : 'Medium (1.5% - 3%)' },
    { value: 'high', label: isAr ? 'عالية (> 3%) خصبة' : 'High (>3%)' },
    { value: 'unknown', label: isAr ? 'غير محدد' : 'Unknown' },
  ];

  const IRRIGATION_METHODS = [
    { value: 'drip', label: t.irr_drip },
    { value: 'sprinkler', label: t.irr_sprinkler },
    { value: 'flood', label: t.irr_flood },
    { value: 'rainfed', label: t.irr_rainfed },
    { value: 'other', label: t.irr_other },
  ];

  const WATER_AVAILABILITY = [
    { value: 'abundant', label: t.water_abundant },
    { value: 'adequate', label: t.water_adequate },
    { value: 'limited', label: t.water_limited },
    { value: 'scarce', label: t.water_scarce },
  ];

  const PRIORITIES = [
    { id: 'soil health', label: t.p_soil_health },
    { id: 'water conservation', label: t.p_water_conservation },
    { id: 'disease resistance', label: t.p_disease_resistance },
    { id: 'yield stability', label: t.p_yield_stability },
    { id: 'low input costs', label: t.p_low_input_costs },
    { id: 'climate resilience', label: t.p_climate_resilience },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md mb-2">
            {t.step1HeaderBadge}
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.farmProfileTitle}
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            {t.farmProfileSubtitle}
          </p>
        </div>

        {/* Preset Loader */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">{t.quickPresets}</span>
          <button
            type="button"
            onClick={() => handlePresetSelect('ismailia_egypt')}
            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-300 font-semibold transition"
          >
            🇪🇬 {isAr ? 'مصر (الإسماعيلية - 5 فدان)' : 'Ismailia, Egypt (5 feddans)'}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('mediterranean_tunisia')}
            className="text-xs bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-300 font-medium transition"
          >
            🇹🇳 {isAr ? 'تونس (بنزرت - 30 هكتار)' : 'Bizerte, Tunisia (30 ha)'}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('nile_delta')}
            className="text-xs bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-300 font-medium transition"
          >
            🇪🇬 {isAr ? 'مصر (الدلتا - 15 فدان)' : 'Nile Delta, Egypt (15 feddans)'}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('midwest_us')}
            className="text-xs bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-300 font-medium transition"
          >
            🇺🇸 {isAr ? 'أمريكا (آيوا - 120 أكر)' : 'Iowa, USA (120 acres)'}
          </button>
        </div>
      </div>

      {/* GEOGRAPHIC INCONSISTENCY ALERT BANNER */}
      {!geoValidation.isConsistent && (
        <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                {t.geoAlertTitle}
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {isAr ? geoValidation.warningMessageAr : geoValidation.warningMessage}
              </p>
            </div>
          </div>
          {geoValidation.suggestedCountry && (
            <button
              type="button"
              onClick={applyGeoCorrection}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg shrink-0 transition"
            >
              {isAr ? `تحديث الاسم إلى: ${geoValidation.suggestedRegion}` : `Correct Name to: ${geoValidation.suggestedRegion}`}
            </button>
          )}
        </div>
      )}

      {/* SOIL-LOCATION CONTRADICTION ALERT BANNER */}
      {!geoValidation.soilLocationConsistent && (
        <div className="mb-6 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-0.5">
              {isAr ? 'تنبيه عدم توافق قوام التربة مع المنطقة الجغرافية' : 'Soil Texture & Governorate Mismatch Alert'}
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              {isAr ? geoValidation.soilWarningMessageAr : geoValidation.soilWarningMessage}
            </p>
          </div>
        </div>
      )}

      {/* FORM VALIDATION ERROR BANNER */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl border border-rose-400 bg-rose-50 text-rose-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-0.5">
              {isAr ? 'خطأ في المدخلات' : 'Form Validation Error'}
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Geospatial Map */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">{t.geoCoordsTitle}</h2>
                    <p className="text-xs text-stone-500">
                      {t.geoCoordsDesc}
                    </p>
                  </div>
                </div>

                {geoValidation.isConsistent && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? 'الإحداثيات موثقة' : 'GPS Verified'}
                  </span>
                )}
              </div>

              {/* Egypt 27 Governorates Quick Dropdown Selector */}
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950">
                    🇪🇬 {isAr ? 'اختر محافظة المزرعة (جميع محافظات مصر الـ 27):' : 'Select Egyptian Governorate (All 27 Governorates):'}
                  </label>
                  <span className="text-[11px] text-emerald-800">
                    {isAr
                      ? 'عند اختيار أي محافظة يتم تحديد موقعها وإحداثياتها وقوام تربتها تلقائياً على الخريطة'
                      : 'Selecting any governorate automatically centers the map, sets GPS coordinates, and matches soil texture'}
                  </span>
                </div>
                <select
                  value={selectedGovId}
                  onChange={(e) => {
                    const gov = EGYPT_GOVERNORATES.find((g) => g.id === e.target.value);
                    if (gov) handleGovernorateSelect(gov);
                  }}
                  className="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-emerald-400 bg-white text-stone-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 min-w-[230px]"
                >
                  <option value="" disabled>
                    {isAr ? '— اختر المحافظة (27 محافظة) —' : '— Select Governorate (27) —'}
                  </option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {isAr
                        ? `${gov.nameAr} (${gov.nameEn}) — ${gov.zoneAr}`
                        : `${gov.nameEn} (${gov.nameAr}) — ${gov.zoneEn}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Map */}
              <LocationPicker
                lat={profile.lat}
                lng={profile.lng}
                selectedRegion={profile.region}
                onLocationSelect={handleCoordinateSelect}
                onGovernorateSelect={handleGovernorateSelect}
              />

              {/* Manual Coordinate Override */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.latLabel}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    dir="ltr"
                    value={profile.lat}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setProfile({ ...profile, lat: Number.isNaN(val) ? 0 : val });
                    }}
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.lngLabel}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    dir="ltr"
                    value={profile.lng}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setProfile({ ...profile, lng: Number.isNaN(val) ? 0 : val });
                    }}
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Farm Identification */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {t.farmInfoTitle}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.farmNameLabel}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder={isAr ? 'مثال: مزرعة الأمل الخضراء' : 'e.g. Green Valley Farm'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.countryLabel}
                  </label>
                  <select
                    value={
                      profile.country.toLowerCase().includes('egypt') || profile.country.includes('مصر')
                        ? 'Egypt'
                        : profile.country
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Egypt') {
                        const defaultGov = EGYPT_GOVERNORATES[0];
                        handleGovernorateSelect(defaultGov);
                      } else {
                        setProfile({ ...profile, country: val });
                      }
                    }}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Egypt">{isAr ? 'مصر (Egypt)' : 'Egypt (مصر)'}</option>
                    <option value="Tunisia">{isAr ? 'تونس (Tunisia)' : 'Tunisia'}</option>
                    <option value="Saudi Arabia">{isAr ? 'السعودية (Saudi Arabia)' : 'Saudi Arabia'}</option>
                    <option value="United States">{isAr ? 'الولايات المتحدة (United States)' : 'United States'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isAr ? 'المحافظة / الإقليم (27 محافظة):' : 'Governorate / Region (27 Governorates):'}
                  </label>
                  {profile.country.toLowerCase().includes('egypt') || profile.country.includes('مصر') ? (
                    <select
                      value={selectedGovId}
                      onChange={(e) => {
                        const gov = EGYPT_GOVERNORATES.find((g) => g.id === e.target.value);
                        if (gov) handleGovernorateSelect(gov);
                      }}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {isAr ? `${gov.nameAr} (${gov.nameEn})` : `${gov.nameEn} (${gov.nameAr})`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile.region}
                      onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      placeholder={isAr ? 'أدخل الإقليم أو المنطقة' : 'Enter Region / State'}
                      required
                    />
                  )}
                </div>
              </div>

              {/* Area Input with Feddan / Hectare / Acre Support & Dual Conversion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.areaLabel}
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      dir="ltr"
                      value={profile.area}
                      onChange={(e) =>
                        setProfile({ ...profile, area: parseFloat(e.target.value) || 1 })
                      }
                      className="w-full text-sm px-3 py-2 rounded-s-lg border border-e-0 border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left"
                      required
                    />
                    <select
                      value={profile.areaUnit}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          areaUnit: e.target.value as 'hectares' | 'acres' | 'feddans',
                        })
                      }
                      className="text-sm px-3 py-2 rounded-e-lg border border-stone-300 bg-stone-50 font-medium"
                    >
                      <option value="feddans">{t.feddanUnit}</option>
                      <option value="hectares">{t.haUnit}</option>
                      <option value="acres">{t.acresUnit}</option>
                    </select>
                  </div>
                  {/* Live dual conversion display */}
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1.5 inline-block border border-emerald-200">
                    {formatDualArea(profile.area, profile.areaUnit, isAr)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.currentCropsLabel}
                  </label>
                  <p className="text-[11px] text-stone-500 mb-2">
                    {t.currentCropsHint}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CROPS.map((crop) => {
                      const isSelected = profile.currentCrops.includes(crop.name);
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => toggleCurrentCrop(crop.name)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium transition ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {isAr ? crop.arabicName : crop.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Soil & Water Settings */}
          <div className="lg:col-span-5 space-y-6">
            {/* Water & Irrigation */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                {t.waterTitle}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.irrigationMethodLabel}
                  </label>
                  <select
                    value={profile.irrigationMethod}
                    onChange={(e) =>
                      setProfile({ ...profile, irrigationMethod: e.target.value })
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {IRRIGATION_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.waterAvailLabel}
                  </label>
                  <select
                    value={profile.waterAvailability}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        waterAvailability: e.target.value as FarmProfile['waterAvailability'],
                      })
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {WATER_AVAILABILITY.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Soil Characteristics */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                {t.soilTitle}
              </h2>
              <p className="text-[11px] text-stone-500">{t.soilHint}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.soilTypeLabel}
                  </label>
                  <select
                    value={profile.soilType}
                    onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {SOIL_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.soilPHLabel}
                  </label>
                  <select
                    value={profile.soilPH}
                    onChange={(e) => setProfile({ ...profile, soilPH: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {SOIL_PH_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.organicMatterLabel}
                  </label>
                  <select
                    value={profile.organicMatter}
                    onChange={(e) =>
                      setProfile({ ...profile, organicMatter: e.target.value })
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {ORGANIC_MATTER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                {t.soilDisclaimer}
              </div>
            </div>

            {/* Farmer Priorities */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                {t.prioritiesTitle}
              </h2>
              <p className="text-[11px] text-stone-500">{t.prioritiesHint}</p>

              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => {
                  const isChecked = profile.priorities.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePriority(p.id)}
                      className={`text-xs p-2.5 rounded-xl border text-start font-medium transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.savingBtn}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t.saveAndFetchBtn}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
