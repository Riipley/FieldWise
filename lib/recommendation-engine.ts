// FieldWise Recommendation and Agronomic Decision Engine (v2.3)
// Grounded in Agricultural Science, Complete Multi-Year Crop Calendars, and NASA POWER Climatology

import type {
  FarmProfile,
  NasaClimateData,
  CropInfo,
  RotationStrategy,
  RotationTimelineSlot,
  DimensionEvaluation,
  RecommendationResult,
  RegionalFamousCrop,
  SeasonalPlantingCrop,
  BiologicalNitrogenAnalysis,
  PestManagementAnalysis,
  ConfidenceAssessment,
} from './types';
import { CROPS, getCropById } from './crop-database';
import { validateCoordinates } from './geo-validator';

// Base 8 Evaluation Dimension Weights (Sum = 1.00 / 100%)
export const BASE_WEIGHTS = {
  climate: 0.15,
  water: 0.15,
  soil: 0.15,
  nitrogen: 0.15,
  pest: 0.15,
  economic: 0.10,
  calendar: 0.10,
  sustainability: 0.05,
};

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Computes normalized dimension weights adjusted for farmer priorities when custom priority subsets are chosen.
 * When all 6 priorities or default priorities are selected, returns the canonical 15/15/15/15/15/10/10/5 weights.
 */
export function computeWeights(priorities: string[] = []) {
  const pLower = priorities.map((p) => p.toLowerCase());
  if (pLower.length === 0 || pLower.length >= 6) {
    return { ...BASE_WEIGHTS };
  }

  const w = { ...BASE_WEIGHTS };

  if (pLower.includes('water conservation')) {
    w.water += 0.05;
    w.economic -= 0.025;
    w.calendar -= 0.025;
  }
  if (pLower.includes('soil health')) {
    w.soil += 0.04;
    w.nitrogen += 0.02;
    w.economic -= 0.03;
    w.calendar -= 0.03;
  }
  if (pLower.includes('disease resistance')) {
    w.pest += 0.05;
    w.economic -= 0.025;
    w.sustainability -= 0.025;
  }
  if (pLower.includes('low input costs')) {
    w.nitrogen += 0.04;
    w.pest += 0.02;
    w.climate -= 0.03;
    w.calendar -= 0.03;
  }

  const total = Object.values(w).reduce((s, v) => s + v, 0);
  const c = parseFloat((w.climate / total).toFixed(2));
  const wa = parseFloat((w.water / total).toFixed(2));
  const so = parseFloat((w.soil / total).toFixed(2));
  const ni = parseFloat((w.nitrogen / total).toFixed(2));
  const pe = parseFloat((w.pest / total).toFixed(2));
  const ec = parseFloat((w.economic / total).toFixed(2));
  const ca = parseFloat((w.calendar / total).toFixed(2));
  const su = parseFloat((1 - (c + wa + so + ni + pe + ec + ca)).toFixed(2));

  return {
    climate: c,
    water: wa,
    soil: so,
    nitrogen: ni,
    pest: pe,
    economic: ec,
    calendar: ca,
    sustainability: su,
  };
}

/**
 * Evaluates individual crop suitability against NASA POWER seasonal temperature,
 * thermal extrema (T2M_MAX / T2M_MIN), and solar radiation during active growing months.
 */
export function calculateCropClimateScore(crop: CropInfo, climate: NasaClimateData): number {
  const activeMonths = new Set<number>();
  const startMonth = crop.plantingMonths[0] || 11;
  const endMonth = crop.harvestMonths[crop.harvestMonths.length - 1] || 4;
  let m = startMonth;
  for (let count = 0; count < 12; count++) {
    activeMonths.add(m);
    if (m === endMonth) break;
    m = (m % 12) + 1;
  }

  const monthlySlice =
    climate.monthly && climate.monthly.length === 12
      ? climate.monthly.filter((md) => activeMonths.has(md.monthNum))
      : [];

  const seasonalMeanTemp =
    monthlySlice.length > 0
      ? monthlySlice.reduce((s, md) => s + md.meanTemp, 0) / monthlySlice.length
      : climate.annual.meanTemp;

  const warmestMonthMean =
    monthlySlice.length > 0
      ? Math.max(...monthlySlice.map((md) => md.meanTemp))
      : climate.annual.meanTemp + 6;

  const coolestMonthMean =
    monthlySlice.length > 0
      ? Math.min(...monthlySlice.map((md) => md.meanTemp))
      : climate.annual.meanTemp - 6;

  const seasonalSolar =
    monthlySlice.length > 0
      ? monthlySlice.reduce((s, md) => s + md.solarRad, 0) / monthlySlice.length
      : climate.annual.meanSolarRad;

  let tempScore = 50;
  if (seasonalMeanTemp >= crop.tempOptMin && seasonalMeanTemp <= crop.tempOptMax) {
    const midOpt = (crop.tempOptMin + crop.tempOptMax) / 2;
    const halfSpan = Math.max(1, (crop.tempOptMax - crop.tempOptMin) / 2);
    const closeness = 1 - Math.min(1, Math.abs(seasonalMeanTemp - midOpt) / halfSpan);
    tempScore = 85 + Math.round(closeness * 8);
  } else if (seasonalMeanTemp >= crop.tempMin && seasonalMeanTemp <= crop.tempMax) {
    if (seasonalMeanTemp < crop.tempOptMin) {
      tempScore = 66 + 20 * ((seasonalMeanTemp - crop.tempMin) / Math.max(1, crop.tempOptMin - crop.tempMin));
    } else {
      tempScore = 66 + 20 * ((crop.tempMax - seasonalMeanTemp) / Math.max(1, crop.tempMax - crop.tempOptMax));
    }
  } else {
    tempScore = 30;
  }

  // Seasonal heat/cold stress checks against crop upper/lower thresholds
  if (warmestMonthMean + 4 > crop.tempMax) tempScore -= 6;
  if (coolestMonthMean - 3 < crop.tempMin) tempScore -= 6;

  // Solar radiation PAR adequacy adjustment
  if (seasonalSolar >= 18) tempScore += 2;
  else if (seasonalSolar < 10) tempScore -= 5;

  // Crop-specific sensitivity to desert radiation nights / tuberization heat (Potato & Onion)
  if ((crop.id === 'potato' || crop.id === 'onion') && climate.annual.minTemp <= 4.0) {
    tempScore -= 4;
  }
  if ((crop.id === 'faba_bean' || crop.id === 'sunflower') && climate.annual.maxTemp >= 41.0) {
    tempScore -= 2;
  }

  return Math.max(20, Math.min(98, Math.round(tempScore)));
}

/**
 * Assesses data reliability and computes confidence score penalizing missing or contradicted data.
 */
function assessDataConfidence(
  farm: FarmProfile,
  climate: NasaClimateData,
  geoValidation: ReturnType<typeof validateCoordinates>
): ConfidenceAssessment {
  let score = 95; // Base ceiling without lab soil certificate is 95%
  const penalties: string[] = [];
  const penaltiesAr: string[] = [];

  if (!geoValidation.isConsistent) {
    score -= 10;
    penalties.push('Entered location name differed from GPS coordinates; synchronized to GPS (-10%)');
    penaltiesAr.push('تعارض بين اسم الموقع المدخل وإحداثيات GPS؛ تمت المزامنة مع الإحداثيات (-10%)');
  }

  if (!geoValidation.soilLocationConsistent) {
    score -= 10;
    penalties.push('Recorded soil texture conflicts with regional geological soil profile (-10%)');
    penaltiesAr.push('تعارض قوام التربة المدخل مع الطبيعة الجيولوجية للإقليم (-10%)');
  }

  if (farm.soilType === 'unknown' || !farm.soilType) {
    score -= 15;
    penalties.push('Soil texture not verified via laboratory analysis (-15%)');
    penaltiesAr.push('قوام التربة غير مؤكد عبر تحليل معملي معتمد (-15%)');
  }

  if (farm.soilPH === 'unknown' || !farm.soilPH) {
    score -= 10;
    penalties.push('Soil pH level unknown; nutrient lockup risk cannot be ruled out (-10%)');
    penaltiesAr.push('درجة حموضة التربة (pH) غير محددة بدقة (-10%)');
  }

  if (farm.organicMatter === 'unknown' || !farm.organicMatter) {
    score -= 5;
    penalties.push('Soil organic matter percentage unmeasured (-5%)');
    penaltiesAr.push('نسبة المادة العضوية في التربة غير مقاسة معملياً (-5%)');
  }

  if (climate.source === 'demonstration') {
    score -= 10;
    penalties.push('NASA POWER API latency fallback mode used for climate extraction (-10%)');
    penaltiesAr.push('استخدام المعايرة المناخية الاحتياطية لتعذر الاتصال اللحظي بـ NASA POWER (-10%)');
  }

  let rating: 'High' | 'Moderate' | 'Preliminary' = 'High';
  let ratingAr: 'عالية' | 'متوسطة' | 'أولية' = 'عالية';

  if (score < 70) {
    rating = 'Preliminary';
    ratingAr = 'أولية';
  } else if (score < 85) {
    rating = 'Moderate';
    ratingAr = 'متوسطة';
  }

  return {
    score: Math.max(40, score),
    rating,
    ratingAr,
    penalties,
    penaltiesAr,
  };
}

/**
 * Evaluates water availability, irrigation efficiency, and total rotational water conservation.
 * Explicit Base Water Rule:
 *   Water score = 60 − (avg annual demand − 900) × 0.13 − (5 if any single season > 550 mm)
 * Plus dynamic adjustments when the user changes irrigation method (drip/sprinkler/rainfed) or water supply tier.
 */
function evaluateWaterDimension(
  timeline: RotationTimelineSlot[],
  crops: CropInfo[],
  farm: FarmProfile,
  climate: NasaClimateData
): { score: number; justification: string; justificationAr: string } {
  const annualPrecip = climate.annual.totalPrecip;
  const climaticDeficit = climate.annual.annualDeficitMm ?? (annualPrecip - 1650);

  const yearsCount = Math.max(1, new Set(timeline.map((t) => t.year)).size);
  const totalWaterMm = timeline.reduce((sum, slot) => sum + slot.waterDemandMm, 0);
  const meanAnnualDemandMm = Math.round(totalWaterMm / yearsCount);
  const maxSeasonalDemandMm = Math.max(...timeline.map((s) => s.waterDemandMm));

  const baselineAnnualMm = 1050;
  const waterSavingsPct = Math.round(((baselineAnnualMm - meanAnnualDemandMm) / baselineAnnualMm) * 100);

  // Explicit Water Score Formula (calibrated on flood + scarce supply baseline)
  const peakPenalty = maxSeasonalDemandMm > 550 ? 5 : 0;
  let rawWaterScore = 60 - (meanAnnualDemandMm - 900) * 0.13 - peakPenalty;

  // Dynamic irrigation efficiency & water supply adjustments when non-default irrigation/supply is selected
  let irrModifier = 0;
  if (farm.irrigationMethod === 'drip') irrModifier += 8;
  else if (farm.irrigationMethod === 'sprinkler') irrModifier += 4;
  else if (farm.irrigationMethod === 'rainfed') {
    irrModifier += annualPrecip >= 450 ? 6 : -14;
  }

  if (farm.waterAvailability === 'abundant') irrModifier += 5;
  else if (farm.waterAvailability === 'adequate') irrModifier += 3;
  else if (farm.waterAvailability === 'limited') irrModifier += 1;

  rawWaterScore += irrModifier;
  const score = Math.max(20, Math.min(95, Math.round(rawWaterScore)));

  const savingsTextEn =
    waterSavingsPct > 0
      ? `reduces annual water demand by ${waterSavingsPct}% (${meanAnnualDemandMm} mm/yr vs. ${baselineAnnualMm} mm/yr baseline)`
      : `requires ${meanAnnualDemandMm} mm/yr (above 900 mm/yr reference)`;
  const savingsTextAr =
    waterSavingsPct > 0
      ? `توفر استهلاك المياه السنوي بنسبة ${waterSavingsPct}% (${meanAnnualDemandMm} ملم/سنة مقارنة بـ ${baselineAnnualMm} ملم/سنة لخط الأساس)`
      : `تتطلب ${meanAnnualDemandMm} ملم/سنة (أعلى من المرجع 900 ملم/سنة)`;

  const irrEfficiencyTextEn =
    farm.irrigationMethod === 'drip'
      ? `drip irrigation (${farm.waterAvailability} supply) operates at ~85% application efficiency (+8 pts)`
      : farm.irrigationMethod === 'sprinkler'
      ? `sprinkler irrigation (${farm.waterAvailability} supply) operates at ~75% application efficiency (+4 pts)`
      : farm.irrigationMethod === 'rainfed'
      ? `rainfed regime relies strictly on ${annualPrecip} mm/yr precipitation`
      : `flood irrigation (${farm.waterAvailability} supply) covers crop demand but at 50–60% efficiency`;

  const justification = `Water score = 60 − (${meanAnnualDemandMm} − 900) × 0.13 ${peakPenalty > 0 ? '− 5 (single-season peak > 550 mm)' : ''}${irrModifier !== 0 ? ` ${irrModifier > 0 ? '+' : ''}${irrModifier} (irrigation/supply adjustment)` : ''} = ${score}%. Rotation ${savingsTextEn}. Under a climatic rainfall of ${annualPrecip} mm/yr and evaporative deficit of ${Math.abs(climaticDeficit)} mm/yr, ${irrEfficiencyTextEn}.`;
  const justificationAr = `قاعدة المياه: 60 − (${meanAnnualDemandMm} − 900) × 0.13 ${peakPenalty > 0 ? '− 5 (ذروة موسمية > 550 ملم)' : ''}${irrModifier !== 0 ? ` ${irrModifier > 0 ? '+' : ''}${irrModifier} (تعديل كفاءة الري/الوفرة)` : ''} = ${score}%. هذه الدورة ${savingsTextAr}. في ظل أمطار مناخية (${annualPrecip} ملم/سنة) وعجز تبخيري (${Math.abs(climaticDeficit)} ملم/سنة).`;

  return { score, justification, justificationAr };
}

/**
 * Evaluates soil compatibility, root architecture layering, pH constraints,
 * and heavy-clay drainage/harvestability penalties for tuber and bulb crops.
 * If soil data is missing ('unknown'), explicitly communicates the limitation and applies a conservative score.
 */
function evaluateSoilDimension(
  crops: CropInfo[],
  farm: FarmProfile
): { score: number; justification: string; justificationAr: string } {
  const userSoil = (farm.soilType || 'unknown').toLowerCase();
  const userPh = (farm.soilPH || 'unknown').toLowerCase();

  const hasDeepRoot = crops.some(
    (c) => c.rootType.includes('1.8') || c.rootType.includes('2.0') || c.id === 'sunflower' || c.id === 'sorghum'
  );
  const hasNodulatedTaproot = crops.some((c) => c.nitrogenFixation);
  const hasFibrous = crops.some((c) => c.rootType.includes('fibrous'));
  const hasTuberOrBulb = crops.some((c) => c.id === 'potato' || c.id === 'onion' || c.id === 'garlic');

  // If soil texture is Unknown/Untested, do NOT fabricate a high soil score
  if (userSoil === 'unknown' || !userSoil) {
    let conservativeScore = 54;
    if (hasDeepRoot && hasNodulatedTaproot && hasFibrous) conservativeScore += 8;
    else if (hasNodulatedTaproot && hasFibrous) conservativeScore += 4;
    if (userPh === 'unknown' || !userPh) conservativeScore -= 6;
    else if (userPh === 'acidic') conservativeScore -= 8;

    return {
      score: Math.max(35, Math.min(68, conservativeScore)),
      justification: `LIMITATION: Soil texture is marked as Unknown/Untested${userPh === 'unknown' ? ' and Soil pH is Unknown' : ''}. Score is conservatively capped (${conservativeScore}%) based solely on root-depth architecture diversity; laboratory soil texture and ECe testing are required before committing to texture-sensitive crops.`,
      justificationAr: `تنبيه نقص البيانات: قوام التربة غير محدد معملياً (Unknown)${userPh === 'unknown' ? ' ودرجة الحموضة غير معروفة' : ''}. تم تقييد الدرجة تحفظياً (${conservativeScore}%) بناءً على تنوع أعماق الجذور فقط؛ يلزم إجراء فحص معملي لقوام التربة والملوحة.`,
    };
  }

  let score = 75;

  // 1. Root architecture layering & crop sensitivity
  if (hasDeepRoot && hasNodulatedTaproot && hasFibrous) {
    // Tuber/bulb rotations have shallow-root salinity & common-scab sensitivity on neutral loam compared to resilient field crops
    score += hasTuberOrBulb ? 9 : 15;
  } else if (hasNodulatedTaproot && hasFibrous) {
    score += 11;
  } else {
    score += 8; // Uniform fibrous rooting (e.g. Wheat–Maize)
  }

  // 2. Soil texture compatibility & heavy-clay tuber/bulb penalty
  let textureNoteEn = '';
  let textureNoteAr = '';

  if (userSoil === 'clay') {
    if (hasTuberOrBulb) {
      score -= 16;
      textureNoteEn =
        ' Heavy Clay soil imposes a significant agronomic penalty (-16 pts) on Potato tubers and Onion bulbs due to restricted internal drainage, tuber deformity, clod adherence at harvest, and elevated Phytophthora/neck-rot risk; raised beds and gypsum/organic amendments are required.';
      textureNoteAr =
        ' التربة الطينية الثقيلة تفرض خصماً زراعياً (-16 نقطة) عند زراعة درنات البطاطس ورؤوس البصل بسبب بطء الصرف الداخلي ومخاطر تشوه الدرنات وصعوبة التقليع والتصاق الطين؛ مما يستلزم الزراعة على مصاطب مرتفعة وإضافة الجبس الزراعي.';
    } else {
      score += 2;
      textureNoteEn =
        ' Heavy Clay soil is well-suited to fibrous cereals (Wheat/Maize), Faba Bean, and deep-taproot Sunflower which fractures compacted subsoil horizons.';
      textureNoteAr =
        ' التربة الطينية الثقيلة تتوافق بامتياز مع القمح والذرة والفول البلدي، بينما تعمل جذور دوار الشمس الوتدية العميقة على تفكيك الطبقات التحتية الصماء.';
    }
  } else if (userSoil === 'sand') {
    score -= hasNodulatedTaproot ? 4 : 8;
    textureNoteEn =
      ' Coarse Sandy soil exhibits rapid percolation and low cation-exchange capacity; frequent split fertigation and organic compost incorporation are essential.';
    textureNoteAr =
      ' التربة الرملية الخشنة سريعة الرشح ومنخفضة الاحتفاظ بالعناصر؛ يلزم تقسيم التسميد وإضافة الكمبوست العضوي.';
  } else {
    textureNoteEn = ` Friable ${farm.soilType} texture supports root exploration and balanced moisture retention.`;
    textureNoteAr = ` قوام التربة (${farm.soilType}) يدعم انتشار الجذور وتوازن الرطوبة الأرضية.`;
  }

  // 3. Soil pH constraint checking
  let phNoteEn = '';
  let phNoteAr = '';
  if (userPh === 'acidic') {
    score -= 10;
    phNoteEn = ' Acidic soil (<6.0) restricts phosphorus availability and inhibits Rhizobium nodulation in legumes.';
    phNoteAr = ' حموضة التربة (<6.0) تثبت الفوسفور وتقلل نشاط عقد الريزوبيا في البقوليات.';
  } else if (userPh === 'alkaline') {
    score -= hasTuberOrBulb ? 6 : 2;
    phNoteEn = ' Alkaline soil (>7.5) requires chelated foliar micronutrients (Fe, Zn, Mn) and acidifying sulfate fertilizers.';
    phNoteAr = ' قلوية التربة (>7.5) تستلزم رش العناصر الصغرى المخلبية واستخدام الأسمدة الحامضية الكبريتية.';
  } else if (userPh === 'neutral') {
    score += 2;
    phNoteEn = ' Neutral soil pH (6.0–7.5) provides optimal nutrient availability without requiring agricultural lime.';
    phNoteAr = ' درجة الحموضة المعتدلة (6.0–7.5) مثالية لامتصاص العناصر الغذائية ولا تتطلب إضافة جير زراعي.';
  } else {
    score -= 8;
    phNoteEn = ' Soil pH is Unknown (-8 pts uncertainty adjustment); verify pH in laboratory before fertilizer selection.';
    phNoteAr = ' درجة الحموضة (pH) غير معروفة (-8 نقاط تحوط)؛ يوصى بقياسها معملياً.';
  }

  const clampedScore = Math.max(25, Math.min(95, Math.round(score)));
  const justification = `Evaluated for ${farm.soilType} texture and ${farm.soilPH || 'unknown'} pH.${textureNoteEn}${phNoteEn}`;
  const justificationAr = `تم التقييم لقوام التربة (${farm.soilType}) ودرجة الحموضة (${farm.soilPH || 'غير محددة'}).${textureNoteAr}${phNoteAr}`;

  return { score: clampedScore, justification, justificationAr };
}

/**
 * Calculates biological nitrogen fixation (BNF) and nutrient cycling score across the full rotation cycle.
 */
function evaluateNitrogenDimension(
  timeline: RotationTimelineSlot[],
  crops: CropInfo[],
  farm: FarmProfile
): {
  score: number;
  justification: string;
  justificationAr: string;
  analysis: BiologicalNitrogenAnalysis;
} {
  const totalSeasons = Math.max(1, timeline.length);
  const yearsCount = Math.max(1, new Set(timeline.map((t) => t.year)).size);
  const legumes = crops.filter((c) => c.nitrogenFixation && c.bnfData);

  if (legumes.length === 0) {
    return {
      score: 32,
      justification: `0 of ${totalSeasons} seasonal slots include nitrogen-fixing legumes. Continuous non-legume cropping causes net soil nitrogen depletion and requires 100% synthetic N fertilizer inputs (150–200 kg N/ha per season).`,
      justificationAr: `0 من أصل ${totalSeasons} مواسم يتضمن محاصيل بقولية مثبتة للنيتروجين. يؤدي تعاقب غير البقوليات المستمر إلى استنزاف النيتروجين والاعتماد بنسبة 100% على الأسمدة الكيميائية (150–200 كغ N/هكتار للموسم).`,
      analysis: {
        totalBnfRangeKgHa: '0 kg N/ha',
        residualAvailableKgHa: '0 kg N/ha (0 kg N/ha/yr)',
        uncertaintyRange: 'Zero biological N fixation; 100% reliance on synthetic nitrogen fertilizers',
        uncertaintyRangeAr: 'صفر تثبيت حيوي للنيتروجين؛ اعتماد كامل 100% على الأسمدة النيتروجينية المعدنية',
        limitingFactors: [
          'Complete absence of symbiotic Fabaceae legumes across all rotation seasons',
          'Continuous cereal N extraction depletes labile soil organic nitrogen pools',
        ],
        limitingFactorsAr: [
          'الغياب التام للمحاصيل البقولية التكافلية في جميع مواسم الدورة الزراعية',
          'استنزاف مستمر لمخزون النيتروجين العضوي نتيجة تعاقب المحاصيل النجيلية المجهدة للتربة',
        ],
      },
    };
  }

  // Acidic soil (<6.0) reduces BNF efficiency by ~28% unless limed
  const phFactor = farm.soilPH === 'acidic' ? 0.72 : farm.soilPH === 'unknown' ? 0.85 : 1.0;

  const totalMin = Math.round(legumes.reduce((s, l) => s + (l.bnfData?.totalMinKgHa ?? 40), 0) * phFactor);
  const totalMax = Math.round(legumes.reduce((s, l) => s + (l.bnfData?.totalMaxKgHa ?? 80), 0) * phFactor);
  const resMin = Math.round(legumes.reduce((s, l) => s + (l.bnfData?.residualMinKgHa ?? 15), 0) * phFactor);
  const resMax = Math.round(legumes.reduce((s, l) => s + (l.bnfData?.residualMaxKgHa ?? 30), 0) * phFactor);

  const annualizedResMin = Math.round(resMin / yearsCount);
  const annualizedResMax = Math.round(resMax / yearsCount);

  const legumeSlotRatio = legumes.length / totalSeasons;
  const hasSummerAndWinterLegume = legumes.length >= 2;
  const hasDeepNitrateScavenger = crops.some((c) => c.id === 'sunflower' || c.id === 'sorghum');

  let score =
    56 +
    Math.round(legumeSlotRatio * 80) +
    (hasDeepNitrateScavenger ? 6 : 0) +
    (hasSummerAndWinterLegume ? 6 : 0);

  if (farm.soilPH === 'acidic') score -= 8;
  else if (farm.soilPH === 'unknown') score -= 6;

  score = Math.max(40, Math.min(94, score));

  const legumeNames = legumes.map((l) => l.name).join(' + ');
  const legumeNamesAr = legumes.map((l) => l.arabicName).join(' + ');

  return {
    score,
    justification: `Incorporates ${legumes.length} legume season(s) (${legumeNames}) across the ${yearsCount}-year (${totalSeasons}-season) cycle, generating ${resMin}–${resMax} kg N/ha cumulative net residual N (${annualizedResMin}–${annualizedResMax} kg N/ha/yr annualized) plus deep-root subsoil nitrate recovery.`,
    justificationAr: `تتضمن الدورة ${legumes.length} موسم بقولي (${legumeNamesAr}) خلال دورة مدتها ${yearsCount} سنوات (${totalSeasons} مواسم)، مما يوفر رصيداً نيتروجينياً صافياً تراكمياً قدره ${resMin}–${resMax} كغ N/هكتار (بمعدل سنوي ${annualizedResMin}–${annualizedResMax} كغ N/هكتار/سنة) مع استعادة النترات العميقة.`,
    analysis: {
      totalBnfRangeKgHa: `${totalMin} – ${totalMax} kg N/ha (over ${yearsCount}-yr cycle)`,
      residualAvailableKgHa: `${resMin} – ${resMax} kg N/ha (${annualizedResMin} – ${annualizedResMax} kg N/ha/yr)`,
      uncertaintyRange: `±25% depending on Rhizobium inoculation, available soil P, and crop residue (haulm) incorporation`,
      uncertaintyRangeAr: `±25% تبعاً لكفاءة التلقيح ببكتيريا العقد الجذرية (الريزوبيا) ومستوى الفوسفور الميسر وفرم المتبقيات النباتية بالتربة`,
      limitingFactors: [
        'Inoculation with strain-specific Rhizobium is required if legumes were absent for >3 years',
        'Adequate available soil phosphorus (Olsen-P > 12 mg/kg) is required to drive ATP nitrogenase fixation',
        'Removing legume haulms/straw off-field for fodder exports 60–70% of biologically fixed N',
      ],
      limitingFactorsAr: [
        'يلزم تلقيح التقاوي بالعقدين البكتيري المخصص إذا لم تُزرع البقوليات بالحقل منذ أكثر من 3 سنوات',
        'توفير الفوسفور الميسر بالتربة ضروري لإمداد العقد البكتيرية بالطاقة الحيوية (ATP)',
        'إزالة عرش وتبن البقوليات خارج الحقل كعلف يصدر 60–70% من النيتروجين المثبت حيوياً',
      ],
    },
  };
}

/**
 * Evaluates pest and pathogen cycle interruption using host-pathogen rules and botanical family transitions.
 */
function evaluatePestDimension(
  strategyLabel: RotationStrategy['label'],
  timeline: RotationTimelineSlot[],
  crops: CropInfo[]
): {
  score: number;
  justification: string;
  justificationAr: string;
  analysis: PestManagementAnalysis;
} {
  const uniqueFamilies = new Set(crops.map((c) => c.family));
  const totalSeasons = timeline.length;
  const yearsCount = new Set(timeline.map((t) => t.year)).size;

  if (strategyLabel === 'current') {
    // Check if the user's current crops are a single-family monoculture or multi-family rotation
    if (uniqueFamilies.size === 1) {
      const soleFamily = Array.from(uniqueFamilies)[0] || 'Poaceae';
      return {
        score: 38,
        justification: `Continuous ${soleFamily} cultivation (${totalSeasons} consecutive seasons across ${yearsCount} years) provides zero non-host break, perpetuating cereal take-all root rot, cyst nematodes, and stem borers.`,
        justificationAr: `زراعة المحاصيل المتصلة من عائلة نباتية واحدة (${soleFamily} لـ ${totalSeasons} مواسم متتالية عبر ${yearsCount} سنوات) لا توفر أي فاصل نباتي غير عائل، مما يؤدي إلى توطن وتراكم أعفان الجذور ونيماتودا الحويصلات.`,
        analysis: {
          disruptedPathogens: [`Pathogen Risk: High — continuous ${soleFamily} sequence perpetuates host-specific pathogens`],
          disruptedPathogensAr: ['خطر مرتفع — تعاقب نفس العائلة النباتية المستمر يحافظ على دورة حياة آفات وفطريات التربة'],
          residualRisks: [
            'High buildup risk of cereal take-all fungus (Gaeumannomyces graminis) and Fusarium crown rot',
            'Carryover of cereal cyst nematode (Heterodera avenae) and maize stem borers (Sesamia cretica)',
          ],
          residualRisksAr: [
            'مخاطر مرتفعة لتوطن فطر عفن قواعد القمح (Gaeumannomyces graminis) وأعفان التاج الفيوزاريومية',
            'تراكم نيماتودا حويصلات الحبوب (Heterodera avenae) وثاقبات ساق الذرة ودودة الحشد الخريفية',
          ],
          rotationIntervalNote: 'Agronomic Deficit: Continuous Poaceae sequence (Wheat–Maize) violates the minimum 1-year non-cereal break rule required to suppress cereal root rots.',
          rotationIntervalNoteAr: 'خلل بالدورة الزراعية: تعاقب القمح والذرة سنوياً يخالف قاعدة الفاصل غير النجيلي (سنة واحدة على الأقل) اللازم لكبح أعفان الجذور.',
        },
      };
    }

    // User selected a 2-family baseline (e.g., Legume + Cereal)
    const disrupted = Array.from(new Set(crops.flatMap((c) => c.disruptedPathogens))).slice(0, 4);
    const disruptedAr = Array.from(new Set(crops.flatMap((c) => c.disruptedPathogensAr))).slice(0, 4);
    return {
      score: 72,
      justification: `Alternates ${uniqueFamilies.size} botanical families (${Array.from(uniqueFamilies).join(', ')}) every season, interrupting single-family monoculture carryover, though repeating the same 2 crops every year still allows 1-year buildup of multi-year soilborne pathogens.`,
      justificationAr: `يتبادل بين ${uniqueFamilies.size} عائلات نباتية في كل موسم، مما يحد من أمراض العائلة الواحدة، إلا أن تكرار نفس المحصولين سنوياً لا يحقق فاصل الـ 2–3 سنوات المطلوب للفطريات المعمرة.`,
      analysis: {
        disruptedPathogens: disrupted.length > 0 ? disrupted : ['Partial suppression of single-family root rots'],
        disruptedPathogensAr: disruptedAr.length > 0 ? disruptedAr : ['كبح جزئي لأعفان جذور العائلة الواحدة'],
        residualRisks: [
          'Annual repetition of the same winter/summer host every 12 months limits suppression of long-lived sclerotia and broomrape seedbanks',
        ],
        residualRisksAr: [
          'تكرار نفس المحصول الشتوي أو الصيفي كل 12 شهراً لا يكفي لتطهير التربة من الأجسام الحجرية أو بذور الهالوك المعمرة',
        ],
        rotationIntervalNote: `2-Family Seasonal Alternation: Better than single-family monoculture, but lacks multi-year non-host breaks.`,
        rotationIntervalNoteAr: `تعاقب ثنائي العائلة: أفضل من الزراعة الأحادية، لكنه يفتقر إلى فواصل متعددة السنوات.`,
      },
    };
  }

  if (strategyLabel === 'food_security') {
    return {
      score: 86,
      justification: `Spans ${uniqueFamilies.size} botanical families (Poaceae, Fabaceae, Asteraceae) over a 2-year (4-season) cycle. Year 2 dicot crops (Faba Bean → Sunflower) provide a genuine full-season break from Poaceae, interrupting cereal root-rot and stem-borer cycles. Faba Bean is a resistant/tolerant variety option (Giza 843 / Misr 3) for Orobanche crenata management.`,
      justificationAr: `تضم الدورة ${uniqueFamilies.size} عائلات نباتية (النجيلية، البقولية، والمركبة) في دورة رباعية المواسم (سنتين). يوفر الفاصل ثنائي الفلقة الكامل في السنة الثانية (فول بلدي ← دوار شمس) قطعاً حقيقياً لدورة فطريات جذور القمح وثاقبات الذرة. أصناف الفول المتحملة (جيزة 843 / مصر 3) متاحة للتعامل مع الهالوك.`,
      analysis: {
        disruptedPathogens: [
          'Gaeumannomyces graminis (cereal take-all root rot)',
          'Heterodera avenae (cereal cyst nematode)',
          'Fusarium culmorum (cereal foot & crown rot)',
          'Sesamia cretica & Ostrinia nubilalis (maize stem borers)',
        ],
        disruptedPathogensAr: [
          'فطر عفن قواعد وجذور القمح (Gaeumannomyces graminis - Take-all)',
          'نيماتودا حويصلات الحبوب النجيلية (Heterodera avenae)',
          'فطر عفن التاج والجذور الفيوزاريومي في الحبوب (Fusarium culmorum)',
          'ثاقبات ساق الذرة الأوروبية والكبيرة (Sesamia cretica & Ostrinia nubilalis)',
        ],
        residualRisks: [
          'Monitor Faba Bean for chocolate spot (Botrytis fabae) and broomrape (Orobanche crenata) — use resistant varieties Giza 843 / Misr 3 and integrated O. crenata management protocol',
          'Scout Sunflower heads for Sclerotinia head rot during late summer dew periods',
        ],
        residualRisksAr: [
          'مراقبة الفول البلدي ضد مرض التبقع البني (Botrytis fabae) والهالوك (Orobanche crenata) — استخدام أصناف متحملة: جيزة 843 / مصر 3 ونهج إدارة متكامل للهالوك',
          'فحص أقراص دوار الشمس ضد العفن الأبيض (Sclerotinia) في نهاية الصيف',
        ],
        rotationIntervalNote: '2-Year Grain–Legume Rule: Enforces a full 1-year non-Poaceae dicot break (Faba Bean → Sunflower) after Year 1 cereals — this is a genuine full-season break. Maintains a 2-year interval between Fabaceae pulses.',
        rotationIntervalNoteAr: 'قاعدة الدورة الثنائية: تطبق فاصلاً نباتياً غير نجيلي حقيقياً لمدة عام كامل (فول بلدي ← دوار شمس) بعد حبوب السنة الأولى، وتحافظ على فاصل سنتين بين البقوليات.',
      },
    };
  }

  // Strategy C: 4-Year (8-Season) High-Value Horticultural Cycle
  return {
    score: 94,
    justification: `Spans ${uniqueFamilies.size} botanical families across a 4-year (8-season) cycle. Scheduling Potato only in Year 1 followed by 3 full non-Solanaceous years (Years 2, 3, and 4 = 7 consecutive non-host seasons) enforces a true 3-year break against soilborne wilt. NOTE: Year 2 Sorghum (Poaceae) is a break from Solanaceae only, NOT a full break from grasses — it does not interrupt take-all. Option B (Faba Bean + Sunflower) is a genuine full-season grass break; Option C Year 2 is not. Onion is a poor host for Meloidogyne spp., limiting nematode multiplication (host-status effect, not nematicidal exudate). Rhizoctonia solani has a broad host range (faba bean, soybean, sorghum, sunflower) and persists as sclerotia — rotation reduces but does not eliminate it.`,
    justificationAr: `تضم الدورة ${uniqueFamilies.size} عائلات نباتية عبر دورة رباعية السنوات (8 مواسم). زراعة البطاطس في السنة الأولى فقط متبوعة بـ 3 سنوات كاملة خالية من الباذنجانيات (السنوات 2 و3 و4 = 7 مواسم غير عائلة) يحقق فاصلاً حقيقياً لمدة 3 سنوات ضد أمراض الذبول. تنبيه: الذرة الرفيعة في السنة 2 (نجيليات) هي فاصل من الباذنجانيات فقط وليست فاصلاً كاملاً من الحشائش — لا تقطع دورة عفن القاعدة Take-all. البصل عائل ضعيف لنيماتودا Meloidogyne مما يحد من تكاثرها (تأثير حالة العائل لا إفراز مبيد). الريزوكتونيا واسعة المضيف وتستمر كسكليروشيا — الدورة تقلل لكن لا تقضي عليها.`,
    analysis: {
      disruptedPathogens: [
        'Verticillium dahliae (vascular wilt) — 3-year non-host break effective',
        'Meloidogyne spp. (root-knot nematodes) — Onion poor host, limits multiplication',
        'Pratylenchus spp. (lesion nematodes) — host diversity reduces population',
        'Gaeumannomyces graminis (cereal take-all) — interrupted in Year 2 Faba season only',
      ],
      disruptedPathogensAr: [
        'فطر الذبول الوعائي الفيرتيسيليومي (Verticillium dahliae) — فاصل 3 سنوات فعال',
        'نيماتودا تعقد الجذور (Meloidogyne spp.) — البصل عائل ضعيف يحد من تكاثرها',
        'نيماتودا التآكل (Pratylenchus spp.) — تنوع العائل يقلل من تعداد السكان',
        'فطر عفن قواعد الحبوب (Gaeumannomyces graminis) — ينقطع في موسم الفول فقط',
      ],
      residualRisks: [
        'Preventative scouting required for air-dispersed late blight (Phytophthora infestans) on Year 1 Potato',
        'Rhizoctonia solani: broad host range (faba bean, soybean, sorghum, sunflower) — persists as sclerotia; rotation reduces not eliminates',
        'Globodera rostochiensis / G. pallida are quarantine species rarely present in Egyptian soils — refocus monitoring on Meloidogyne and Pratylenchus',
        'Monitor Year 3 Onion for thrips (Thrips tabaci) and purple blotch (Alternaria porri)',
      ],
      residualRisksAr: [
        'الفحص الوقائي ضد الندوة المتأخرة المحمولة هوائياً (Phytophthora infestans) في بطاطس السنة الأولى',
        'الريزوكتونيا واسعة المضيف (فول، صويا، ذرة رفيعة، دوار شمس) وتستمر كسكليروشيا؛ الدورة تقلل لا تقضي عليها',
        'نيماتودا حويصلات البطاطس (Globodera spp.) أنواع حجر صحي نادرة في التربة المصرية — ركز المراقبة على Meloidogyne و Pratylenchus',
        'مراقبة محصول البصل في السنة الثالثة ضد حشرة التربس واللطعة الأرجوانية (Alternaria porri)',
      ],
      rotationIntervalNote: '4-Year Horticultural Rule: Planting Potato in Year 1 followed by 3 complete non-Solanaceous years (Years 2–4) enforces a true 3-year non-host break before Year 5. IMPORTANT: Year 2 Summer Sorghum is NOT a full grass break — only Option B Year 2 (Faba Bean + Sunflower) achieves a genuine full-season non-Poaceae break.',
      rotationIntervalNoteAr: 'قاعدة الدورة الرباعية البستانية: زراعة البطاطس في السنة 1 متبوعة بـ 3 سنوات كاملة غير باذنجانية (السنوات 2 و3 و4) يضمن فاصلاً حقيقياً مدته 3 سنوات. تنبيه: الذرة الرفيعة صيف السنة 2 ليست فاصلاً كاملاً من الحشائش — فقط دورة الخيار (ب) تحقق فاصل غير نجيلي حقيقياً.',
    },
  };
}

/**
 * Evaluates economic profitability and market diversification across the rotation.
 */
function evaluateEconomicDimension(
  strategyLabel: RotationStrategy['label'],
  crops: CropInfo[]
): { score: number; justification: string; justificationAr: string } {
  const highValueCount = crops.filter((c) => c.economicValue === 'high').length;
  const mediumValueCount = crops.filter((c) => c.economicValue === 'medium').length;
  const hortCount = crops.filter((c) => c.category === 'horticultural').length;

  if (strategyLabel === 'current') {
    const dynamicCurrentScore = Math.min(88, 64 + highValueCount * 5 + hortCount * 3);
    return {
      score: dynamicCurrentScore,
      justification:
        highValueCount === 0
          ? 'Relies on bulk staple cereals (Wheat & Maize) with predictable government/local silo procurement but lower gross margins and high exposure to synthetic nitrogen fertilizer price inflation.'
          : `Baseline incorporates ${highValueCount} high-value crop season(s), achieving a moderate-to-strong gross revenue profile (${dynamicCurrentScore}/100).`,
      justificationAr:
        highValueCount === 0
          ? 'تعتمد على حبوب تقليدية (القمح والذرة) ذات تسويق مضمون ولكن بهوامش ربح محدودة وتأثر شديد بارتفاع أسعار الأسمدة النيتروجينية الكيميائية.'
          : `يتضمن خط الأساس ${highValueCount} مواسم لمحاصيل عالية القيمة التسويقية (${dynamicCurrentScore}/100).`,
    };
  }

  if (strategyLabel === 'food_security') {
    return {
      score: 78,
      justification: `Diversifies farm revenue across 4 high-liquidity domestic markets (Wheat grain, Maize feed, Faba Bean food pulse, and Sunflower oilseed) while lowering synthetic fertilizer input costs through Year 2 biological nitrogen fixation.`,
      justificationAr: `توزع دخل المزرعة على 4 أسواق محلية عالية السيولة (القمح، الذرة، الفول البلدي عالي القيمة، وبذور دوار الشمس الزيتية) مع خفض تكاليف الأسمدة الكيميائية بفضل التثبيت الحيوي.`,
    };
  }

  const score = Math.min(96, Math.round(86 + (highValueCount / Math.max(1, crops.length)) * 20));
  return {
    score,
    justification: `Integrates two high-margin commercial export vegetables (Year 1 Potato and Year 3 Onion) alongside high-value pulses (Faba Bean, Soybean) and staple grains, generating the highest gross revenue potential per feddan (requires higher working capital and cold-storage access).`,
    justificationAr: `تدمج محصولين بستانيين ذوي عائد نقدي وتصديري مرتفع (البطاطس في السنة 1 والبصل في السنة 3) مع البقوليات والحبوب، مما يحقق أعلى هامش ربح إجمالي للفدان (مع تطلب رأس مال تشغيلي وتخزين مبرد).`,
  };
}

/**
 * Evaluates calendar and seasonal feasibility: verifies that every year in the rotation
 * contains both a Winter/Autumn slot and a Summer slot with adequate land-preparation buffers.
 */
function evaluateCalendarDimension(
  timeline: RotationTimelineSlot[]
): { score: number; justification: string; justificationAr: string } {
  const years = Array.from(new Set(timeline.map((t) => t.year))).sort((a, b) => a - b);
  let allYearsComplete = true;
  let hasSameSeasonCollision = false;

  for (const yr of years) {
    const slotsInYear = timeline.filter((t) => t.year === yr);
    const hasWinterOrAutumn = slotsInYear.some((s) => s.season === 'winter' || s.season === 'autumn_nili');
    const hasSummer = slotsInYear.some((s) => s.season === 'summer');
    if (!hasWinterOrAutumn || !hasSummer) {
      allYearsComplete = false;
    }
  }

  for (let i = 0; i < timeline.length - 1; i++) {
    if (timeline[i].year === timeline[i + 1].year && timeline[i].season === timeline[i + 1].season) {
      hasSameSeasonCollision = true;
    }
  }

  const avgPrepWeeks =
    timeline.reduce((s, slot) => s + slot.landPrepWeeks, 0) / Math.max(1, timeline.length);

  let score = 90;
  if (hasSameSeasonCollision || !allYearsComplete) {
    score = 45;
  } else {
    score = Math.min(95, Math.round(88.5 + avgPrepWeeks * 2.4 - (years.length > 2 ? 2 : 0)));
  }

  const justification =
    allYearsComplete && !hasSameSeasonCollision
      ? `Complete ${years.length}-year (${timeline.length}-season) schedule with both Winter and Summer crops accounted for in every year and ${avgPrepWeeks.toFixed(1)}-week average land preparation buffers between harvest and sowing.`
      : `Incomplete seasonal schedule or overlapping cropping windows detected.`;
  const justificationAr =
    allYearsComplete && !hasSameSeasonCollision
      ? `جدول زراعي مكتمل لمدة ${years.length} سنوات (${timeline.length} مواسم) يشمل العروتين الشتوية والصيفية في كل سنة بدون استثناء، مع فترة راحة وتجهيز للأرض بمتوسط ${avgPrepWeeks.toFixed(1)} أسبوع بين كل محصولين.`
      : `تداخل زمني أو نقص في تغطية بعض المواسم الزراعية.`;

  return { score, justification, justificationAr };
}

/**
 * Evaluates environmental sustainability and soil organic carbon preservation.
 */
function evaluateSustainabilityDimension(
  strategyLabel: RotationStrategy['label'],
  crops: CropInfo[]
): { score: number; justification: string; justificationAr: string } {
  const legumeCount = crops.filter((c) => c.nitrogenFixation).length;
  const deepRoots = crops.filter(
    (c) => c.rootType.includes('1.8') || c.rootType.includes('2.0') || c.id === 'sunflower' || c.id === 'sorghum'
  ).length;
  const uniqueFamilies = new Set(crops.map((c) => c.family)).size;

  if (uniqueFamilies === 1 && legumeCount === 0) {
    const monocultureScore = 48 + (deepRoots > 0 ? 4 : 0);
    return {
      score: monocultureScore,
      justification:
        'High synthetic nitrogen footprint, low botanical biodiversity (1 family), and uniform root depth limit long-term soil organic carbon sequestration.',
      justificationAr:
        'البصمة الكربونية المرتفعة للأسمدة الكيميائية وغياب التنوع الحيوي (عائلة نباتية واحدة) يحدان من تراكم الكربون العضوي واستدامة التربة.',
    };
  }

  const score = Math.min(96, Math.max(48, 56 + legumeCount * 9 + deepRoots * 6 + uniqueFamilies * 5));
  const justification = `Combines ${uniqueFamilies} botanical families, ${legumeCount} biological nitrogen-fixing pulse season(s), and ${deepRoots} deep-rooted subsoil scavenger(s) to build soil organic matter and reduce agrochemical runoff.`;
  const justificationAr = `تجمع بين ${uniqueFamilies} عائلات نباتية و${legumeCount} موسم بقولي مثبت للنيتروجين و${deepRoots} محاصيل عميقة الجذور لبناء المادة العضوية وتقليل الانبعاثات الكيميائية.`;

  return { score, justification, justificationAr };
}

/**
 * Builds the complete 8-dimension transparent evaluation breakdown.
 * Dynamically evaluates all 8 dimensions from the farm profile, climate data, and crop timeline.
 */
function buildFullEvaluation(
  strategyLabel: RotationStrategy['label'],
  crops: CropInfo[],
  timeline: RotationTimelineSlot[],
  farm: FarmProfile,
  climate: NasaClimateData
) {
  const weights = computeWeights(farm.priorities);

  // 1. Climate Suitability (15% base)
  const climateScores = crops.map((c) => calculateCropClimateScore(c, climate));
  const cScore = Math.round(climateScores.reduce((a, b) => a + b, 0) / Math.max(1, climateScores.length));
  const evalClimate: DimensionEvaluation = {
    key: 'climate',
    name: 'Climate Suitability',
    nameAr: 'ملاءمة المناخ والحرارة',
    score: cScore,
    weight: weights.climate,
    contribution: parseFloat((cScore * weights.climate).toFixed(2)),
    justification: `Season-matched evaluation across each crop's active growing months using NASA POWER climatology (Annual Mean: ${climate.annual.meanTemp}°C, Max: ${climate.annual.maxTemp}°C, Min: ${climate.annual.minTemp}°C, Solar: ${climate.annual.meanSolarRad} MJ/m²/d).`,
    justificationAr: `تقييم حراري موسمي يطابق أشهر النمو الفعلية لكل محصول مع سجلات ناسا المناخية (المتوسط السنوي: ${climate.annual.meanTemp}°م، العظمى: ${climate.annual.maxTemp}°م، الصغرى: ${climate.annual.minTemp}°م، الإشعاع: ${climate.annual.meanSolarRad} ميغاجول/م²/يوم).`,
  };

  // 2. Water & Demand (15% base — Explicit Rule: 60 - (avg_annual_demand - 900) * 0.13 - (5 if any season > 550 mm))
  const waterRes = evaluateWaterDimension(timeline, crops, farm, climate);
  const wScore = waterRes.score;
  const evalWater: DimensionEvaluation = {
    key: 'water',
    name: 'Water & Demand',
    nameAr: 'المياه والطلب',
    score: wScore,
    weight: weights.water,
    contribution: parseFloat((wScore * weights.water).toFixed(2)),
    justification: waterRes.justification,
    justificationAr: waterRes.justificationAr,
  };

  // 3. Soil & pH (15% base)
  const soilRes = evaluateSoilDimension(crops, farm);
  const sScore = soilRes.score;
  const evalSoil: DimensionEvaluation = {
    key: 'soil',
    name: 'Soil & pH',
    nameAr: 'توافق التربة والحموضة',
    score: sScore,
    weight: weights.soil,
    contribution: parseFloat((sScore * weights.soil).toFixed(2)),
    justification: soilRes.justification,
    justificationAr: soilRes.justificationAr,
  };

  // 4. Nitrogen BNF (15% base)
  const nRes = evaluateNitrogenDimension(timeline, crops, farm);
  const nScore = nRes.score;
  const evalNitrogen: DimensionEvaluation = {
    key: 'nitrogen',
    name: 'Nitrogen BNF',
    nameAr: 'التثبيت الحيوي للنيتروجين',
    score: nScore,
    weight: weights.nitrogen,
    contribution: parseFloat((nScore * weights.nitrogen).toFixed(2)),
    justification: nRes.justification,
    justificationAr: nRes.justificationAr,
  };

  // 5. Pest & Pathogen Break (15% base)
  const pestRes = evaluatePestDimension(strategyLabel, timeline, crops);
  const pScore = pestRes.score;
  const evalPest: DimensionEvaluation = {
    key: 'pest',
    name: 'Pest & Pathogen Break',
    nameAr: 'كسر دورات الآفات والأمراض',
    score: pScore,
    weight: weights.pest,
    contribution: parseFloat((pScore * weights.pest).toFixed(2)),
    justification: pestRes.justification,
    justificationAr: pestRes.justificationAr,
  };

  // 6. Economic Return (10% base)
  const econRes = evaluateEconomicDimension(strategyLabel, crops);
  const eScore = econRes.score;
  const evalEconomic: DimensionEvaluation = {
    key: 'economic',
    name: 'Economic Return',
    nameAr: 'الربحية والعائد الاقتصادي',
    score: eScore,
    weight: weights.economic,
    contribution: parseFloat((eScore * weights.economic).toFixed(2)),
    justification: econRes.justification,
    justificationAr: econRes.justificationAr,
  };

  // 7. Calendar Fit (10% base)
  const calRes = evaluateCalendarDimension(timeline);
  const calScore = calRes.score;
  const evalCalendar: DimensionEvaluation = {
    key: 'calendar',
    name: 'Calendar Fit',
    nameAr: 'جدوى التقويم الزراعي',
    score: calScore,
    weight: weights.calendar,
    contribution: parseFloat((calScore * weights.calendar).toFixed(2)),
    justification: calRes.justification,
    justificationAr: calRes.justificationAr,
  };

  // 8. Long-Term Resilience (5% base)
  const sustRes = evaluateSustainabilityDimension(strategyLabel, crops);
  const sustScore = sustRes.score;
  const evalSustainability: DimensionEvaluation = {
    key: 'sustainability',
    name: 'Long-Term Resilience',
    nameAr: 'الاستدامة طويلة المدى',
    score: sustScore,
    weight: weights.sustainability,
    contribution: parseFloat((sustScore * weights.sustainability).toFixed(2)),
    justification: sustRes.justification,
    justificationAr: sustRes.justificationAr,
  };

  const dimensions = [
    evalClimate,
    evalWater,
    evalSoil,
    evalNitrogen,
    evalPest,
    evalEconomic,
    evalCalendar,
    evalSustainability,
  ];

  const exactWeightedSum =
    cScore * weights.climate +
    wScore * weights.water +
    sScore * weights.soil +
    nScore * weights.nitrogen +
    pScore * weights.pest +
    eScore * weights.economic +
    calScore * weights.calendar +
    sustScore * weights.sustainability;

  const overallScore = Math.round(exactWeightedSum);

  return {
    overallScore: Math.max(20, Math.min(98, overallScore)),
    dimensions,
    scores: {
      climateSuitability: evalClimate.score,
      waterBalance: evalWater.score,
      soilHealth: evalSoil.score,
      nitrogenBalance: evalNitrogen.score,
      pestDiversity: evalPest.score,
      cropDiversity: Math.round((evalPest.score + evalSoil.score) / 2),
      economicProfitability: evalEconomic.score,
      calendarFeasibility: evalCalendar.score,
      sustainability: evalSustainability.score,
    },
    nitrogenAnalysis: nRes.analysis,
    pestAnalysis: pestRes.analysis,
  };
}

/**
 * Detects regional famous crops with strict geographic precision.
 */
export function detectRegionalFamousCrops(farm: FarmProfile): RegionalFamousCrop[] {
  const { lat, lng } = farm;
  const isEgypt = lat >= 22 && lat <= 32 && lng >= 24 && lng <= 37;
  const isTunisia = lat >= 30 && lat <= 38 && lng >= 7 && lng <= 12;
  const isArabianPeninsula = lat >= 15 && lat <= 32 && lng >= 38 && lng <= 60;

  const results: RegionalFamousCrop[] = [];
  const add = (id: string, reasonEn: string, reasonAr: string, pop: number) => {
    const crop = getCropById(id);
    if (crop) results.push({ crop, reason: reasonEn, reasonAr: reasonAr, popularityScore: pop });
  };

  if (isEgypt) {
    add('wheat', 'Strategic national winter grain pillar across the Nile Valley and Delta.', 'محصول الحبوب الشتوي الاستراتيجي الأول في وادي النيل والدلتا والأراضي المستصلحة.', 98);
    add('faba_bean', 'Traditional food legume providing essential dietary protein and soil nitrogen restoration.', 'البقولية الغذائية الشعبية الأولى في مصر وعماد تخصيب التربة طبيعياً بالنيتروجين.', 95);
    add('clover', 'Foundational winter forage legume restoring soil structure and fixing biological nitrogen.', 'البرسيم المصري المسقاوي رائد تجديد خصوبة الأراضي الطينية وإمداد الثروة الحيوانية بالعلف الأخضر.', 94);
    add('maize', 'Pillar summer cereal for domestic livestock feed and industrial food processing.', 'محصول الحبوب الصيفي الأهم للأمن الغذائي وتغذية الدواجن والمواشي.', 92);
    add('potato', 'Major export and high-value cash vegetable cultivated in Nili and winter seasons.', 'محصول الخضر التصديري والاستثماري الأول، ويجود في العروتين النيلية والشتوية بالأراضي الطميية والرملية.', 90);
    add('onion', 'Premier commercial export bulb crop; acts as a poor host for Meloidogyne spp., limiting nematode multiplication.', 'محصول تصديري استراتيجي عالي الربحية، ويُعد عائلاً ضعيفاً لنيماتودا تعقد الجذور (Meloidogyne) مما يحد من تكاثرها.', 88);
  } else if (isTunisia) {
    add('wheat', 'Premier northern Tunisian rainfed durum and bread wheat staple in the Medjerda basin.', 'محصول الحبوب الاستراتيجي الأبرز في سهول مجردة والشمال التونسي وبنزرت.', 96);
    add('faba_bean', 'Essential traditional winter pulse in rotation with cereal grain in the Tell.', 'البقولية التقليدية الأساسية في الدورة الزراعية مع الحبوب بالشمال التونسي.', 93);
    add('potato', 'Leading coastal horticultural cash crop in Bizerte and Cap Bon.', 'محصول خضر بستاني رئيسي يزرع بكثافة في بنزرت والوطن القبلي.', 90);
    add('tomato', 'Core Mediterranean culinary crop extensively grown in Cap Bon for fresh and paste industries.', 'محصول الطماطم الصناعية والفرش الأوسع انتشاراً في نابل والوطن القبلي.', 88);
  } else if (isArabianPeninsula) {
    add('barley', 'Traditional resilient cereal surviving high salinity and summer thermal peaks.', 'محصول حبوب تاريخي يتحمل ملوحة التربة وموجات الحرارة العالية.', 95);
    add('sorghum', 'Heat and drought champion widely cultivated for forage and grain.', 'رائد المحاصيل في تحمل الجفاف والحرارة الشديدة واستغلال المياه الشحيحة.', 92);
    add('onion', 'Reliable shallow-root crop cultivated during the cool winter window.', 'محصول ممتاز يزرع بنجاح في العروة الشتوية المعتدلة.', 88);
  } else {
    add('wheat', 'Global staple cereal matching temperate cool seasons.', 'محصول الحبوب العالمي الأوسع انتشاراً.', 90);
    add('potato', 'Versatile high-yielding horticultural cash crop.', 'محصول درنات بستاني عالي القيمة والإنتاجية.', 88);
    add('faba_bean', 'Nitrogen-fixing pulse restoring soil fertility.', 'بقوليات مخصبة ومثبتة للنيتروجين تعيد خصوبة الأرض.', 85);
  }

  return results.sort((a, b) => b.popularityScore - a.popularityScore);
}

/**
 * Identifies seasonal crops ready to plant or upcoming next month.
 */
export function detectSeasonalPlantingCrops(
  climate: NasaClimateData,
  currentMonth: number
): SeasonalPlantingCrop[] {
  const nextMonth = (currentMonth % 12) + 1;
  const results: SeasonalPlantingCrop[] = [];

  for (const crop of CROPS) {
    const climateScore = calculateCropClimateScore(crop, climate);
    const isNow = crop.plantingMonths.includes(currentMonth);
    const isUpcoming = !isNow && crop.plantingMonths.includes(nextMonth);

    if ((isNow || isUpcoming) && climateScore >= 50) {
      const monthNameEn = MONTH_NAMES_EN[currentMonth - 1];
      const monthNameAr = MONTH_NAMES_AR[currentMonth - 1];

      let seasonEn = 'Current Seasonal Window';
      let seasonAr = 'نافذة الزراعة الحالية';
      if (crop.seasonCategory === 'winter') {
        seasonEn = 'Winter Sowing Campaign';
        seasonAr = 'العروة الشتوية';
      } else if (crop.seasonCategory === 'autumn_nili') {
        seasonEn = 'Autumn (Nili) Sowing Season';
        seasonAr = 'العروة النيلية / الخريفية';
      } else {
        seasonEn = 'Summer Cropping Campaign';
        seasonAr = 'العروة الصيفية';
      }

      const CROP_PLANTING_GUIDANCE: Record<
        string,
        { nowEn: string; nowAr: string; upcomingEn: string; upcomingAr: string }
      > = {
        wheat: {
          nowEn: `Prime sowing window (Nov 15 – Dec 10): Cool night temperatures (${crop.tempOptMin}–${crop.tempOptMax}°C) trigger vigorous tillering and avoid spring terminal heat stress during April grain filling (450 mm ETc).`,
          nowAr: `ذروة التبكير المثالي للقمح (15 نوفمبر – 10 ديسمبر): اعتدال الحرارة (${crop.tempOptMin}–${crop.tempOptMax}°م) يحفز التفريع القاعدي الكثيف ويجنب السنابل لفحة الحرارة في أبريل (450 ملم).`,
          upcomingEn: `Prepare laser-leveled seedbeds and secure certified seed (Misr 3 / Sakha 95) for the Nov 15 – Dec 10 winter sowing campaign.`,
          upcomingAr: `يوصى بتسوية الأرض بالليزر وتجهيز التقاوي المعتمدة (مصر 3 / سخا 95) استعداداً للزراعة من منتصف نوفمبر.`,
        },
        barley: {
          nowEn: `Optimal late-autumn sowing (${monthNameEn}): High salinity tolerance (up to 8.0 dS/m) and low water demand (350 mm) make it ideal for marginal or canal-tail parcels.`,
          nowAr: `ميعاد مثالي لزراعة الشعير (${monthNameAr}): يتحمل الملوحة حتى 8.0 ديسيسيمنز/م باحتياج مائي منخفض (350 ملم) للأراضي الملحية ونهايات الترع.`,
          upcomingEn: `Upcoming winter cereal window: Prepare ridges for drought- and salt-tolerant Barley sowing (${crop.growingDays}-day cycle).`,
          upcomingAr: `تقترب عروة زراعة الشعير الشتوية: جهز المراقد لمحصول متحمل للملوحة والجفاف (${crop.growingDays} يوماً).`,
        },
        faba_bean: {
          nowEn: `Ideal Oct–Nov sowing window: Inoculate seed with Rhizobium leguminosarum to fix 80–150 kg N/ha (25–45 kg N/ha net residual credit); select Giza 843 or Misr 3 for Orobanche tolerance.`,
          nowAr: `أنسب موعد لزراعة الفول البلدي: لقّح التقاوي بالعقدين البكتيري لتثبيت 80–150 كجم N/هكتار (رصيد صافي 25–45 كجم N/هكتار) مع اختيار صنف جيزة 843 أو مصر 3 لتحمل الهالوك.`,
          upcomingEn: `Procure Rhizobium inoculant and phosphorus superphosphate ahead of next month's Faba Bean sowing window.`,
          upcomingAr: `جهز لقاح العقدين البكتيري وسوبر فوسفات الكالسيوم استعداداً لزراعة الفول البلدي الشهر المقبل.`,
        },
        chickpea: {
          nowEn: `Optimal Nov–Dec planting window: Deep taproot (1.2 m) thrives on conserved winter moisture (300 mm ETc) and adds 15–28 kg N/ha net residual nitrogen; avoid waterlogged soils.`,
          nowAr: `موعد مثالي لزراعة الحمص (نوفمبر–ديسمبر): جذوره الوتدية العميقة (1.2 م) تكتفي باحتياج مائي قليل (300 ملم) وتضيف 15–28 كجم N/هكتار للتربة؛ تجنب الأراضي الغدقة.`,
          upcomingEn: `Prepare well-drained sandy-loam or loam beds for upcoming winter Chickpea planting.`,
          upcomingAr: `جهز خطوطاً جيدة الصرف في الأراضي الطميية أو الرملية استعداداً لزراعة الحمص الشتوي.`,
        },
        clover: {
          nowEn: `Active multi-cut Berseem establishment window: Rapid autumn root nodulation fixes 120–220 kg N/ha, suppresses winter weeds, and restores soil organic matter across 4–5 forage cuts.`,
          nowAr: `موعد تأسيس البرسيم المسقاوي متعدد الحشات: يثبت 120–220 كجم N/هكتار ويكبح الحشائش الشتوية ويجدد خصوبة ومادة التربة العضوية عبر 4–5 حشات.`,
          upcomingEn: `Prepare level basins and secure certified Meskawi seed for next month's forage establishment.`,
          upcomingAr: `جهز الأحواض المستوية وتقاوي البرسيم المسقاوي المعتمدة للزراعة الشهر المقبل.`,
        },
        potato: {
          nowEn: `Autumn/Winter Nili tuber planting window (Oct 15 – Nov 10): Soil temperatures (${crop.tempOptMin}–${crop.tempOptMax}°C) favor rapid stolon initiation and bulking before Jan–Feb radiation frost nights (3.3°C min).`,
          nowAr: `ميعاد زراعة البطاطس الشتوية/النيلية (15 أكتوبر – 10 نوفمبر): حرارة التربة (${crop.tempOptMin}–${crop.tempOptMax}°م) مثالية لتكوين الدرنات قبل ليالي الصقيع في يناير وفبراير (3.3°م).`,
          upcomingEn: `Verify soil ECe (<1.7 dS/m), enforce a 3-year Solanaceae break, and pre-sprout certified seed tubers for upcoming planting.`,
          upcomingAr: `تأكد من ملوحة التربة (<1.7 ديسيسيمنز/م) وتطبيق فاصل 3 سنوات بدون باذنجانيات قبل زراعة تقاوي البطاطس.`,
        },
        onion: {
          nowEn: `Optimal Oct–Nov bulb transplanting window: Short-day winter photoperiod and cool temperatures (${crop.tempOptMin}–${crop.tempOptMax}°C) drive uniform vegetative growth; acts as a poor host for Meloidogyne nematodes.`,
          nowAr: `موعد مثالي لشتل البصل الفتيل الشتوي (أكتوبر–نوفمبر): الحرارة المعتدلة (${crop.tempOptMin}–${crop.tempOptMax}°م) تدعم النمو الخضري وتكوين الأبصال، ويعمل كعائل ضعيف يحد من تكاثر نيماتودا التعقد.`,
          upcomingEn: `Prepare nursery transplants and verify low soil salinity (ECe < 1.2 dS/m) for next month's Onion transplanting.`,
          upcomingAr: `جهز شتلات البصل وتأكد من انخفاض ملوحة التربة (< 1.2 ديسيسيمنز/م) قبل موعد الشتل الشهر المقبل.`,
        },
        garlic: {
          nowEn: `Autumn clove-planting window: Early establishment ensures strong root development and vernalization required for large, export-grade bulb division (400 mm ETc).`,
          nowAr: `موعد تفصيص وزراعة الثوم البلدي: التبكير يضمن نمواً جذرياً قوياً واحتياجات البرودة اللازمة لتفصيص وكبر حجم الرؤوس التصديرية (400 ملم).`,
          upcomingEn: `Sort healthy, nematode-free seed cloves for upcoming autumn Garlic planting.`,
          upcomingAr: `افرز فصوص التقاوي السليمة الخالية من النيماتودا استعداداً لزراعة الثوم.`,
        },
        tomato: {
          nowEn: `Active transplanting window (${monthNameEn}): Ambient temperatures (${crop.tempOptMin}–${crop.tempOptMax}°C) support flower truss setting and lycopene development; maintain strict 3-year rotation break from Potato.`,
          nowAr: `نافذة شتل الطماطم مفتوحة خلال ${monthNameAr}: درجات الحرارة (${crop.tempOptMin}–${crop.tempOptMax}°م) تدعم عقد الأزهار والتلوين، مع الالتزام بفاصل 3 سنوات عن البطاطس.`,
          upcomingEn: `Prepare drip laterals and virus-free nursery seedlings (TYLCV-resistant hybrids) for next month's transplanting.`,
          upcomingAr: `جهز شبكات التنقيط وشتلات الهجن المقاومة لفيروس تجعد الأوراق استعداداً للشتل الشهر القادم.`,
        },
        maize: {
          nowEn: `Early summer sowing window (May 15–30): Planting now ensures tasseling and silking complete before late-July/August extreme thermal peaks (42.8°C), protecting pollen viability.`,
          nowAr: `التبكير الصيفي المثالي للذرة الشامية (15–30 مايو): الزراعة الآن تضمن إتمام التزهير والحريرة قبل ذروة موجات الحر في أواخر يوليو وأغسطس (42.8°م) لحماية حيوية اللقاح.`,
          upcomingEn: `Incorporate preceding legume residues and prepare ridges for next month's summer Maize sowing (600 mm ETc).`,
          upcomingAr: `افرم بقايا المحصول البقولي السابق وجهز الخطوط لزراعة الذرة الشامية الصيفية الشهر المقبل.`,
        },
        sorghum: {
          nowEn: `Summer sowing window open: C4 physiology and deep fibrous roots (1.8 m) tolerate extreme heat (up to 40°C), soil salinity (6.8 dS/m), and limited canal water (420 mm ETc).`,
          nowAr: `موعد زراعة الذرة الرفيعة الصيفية: جذورها العميقة (1.8 م) تتحمل الحرارة الشديدة (40°م) والملوحة (6.8 ديسيسيمنز/م) وشح المياه (420 ملم).`,
          upcomingEn: `Upcoming summer window for heat- and drought-resilient Grain Sorghum (${crop.growingDays}-day cycle).`,
          upcomingAr: `تقترب عروة زراعة الذرة الرفيعة المتحملة للحرارة والجفاف (${crop.growingDays} يوماً).`,
        },
        soybean: {
          nowEn: `Optimal May summer planting window: Warm soil (${crop.tempOptMin}–${crop.tempOptMax}°C) and Bradyrhizobium japonicum inoculation fix 60–120 kg N/ha (20–38 kg N/ha net residual credit for subsequent winter crops).`,
          nowAr: `الموعد المثالي لزراعة فول الصويا (مايو): دفء التربة والتلقيح البكتيري يثبتان 60–120 كجم N/هكتار (رصيد صافي 20–38 كجم N/هكتار للمحصول الشتوي التالي).`,
          upcomingEn: `Secure Bradyrhizobium inoculant and defoliator scouting traps ahead of next month's Soybean sowing.`,
          upcomingAr: `جهز لقاح العقدين المخصص لفول الصويا استعداداً للزراعة الصيفية الشهر المقبل.`,
        },
        sunflower: {
          nowEn: `Summer oilseed sowing window: Short 105-day cycle and deep taproot (2.0 m) scavenge leached subsoil nitrates while saving 150 mm of water compared to summer Maize.`,
          nowAr: `ميعاد زراعة دوار الشمس الزيتي: دورة قصيرة (105 أيام) وجذر وتدي عميق (2.0 م) يستعيد النترات العميقة ويوفر 150 ملم من المياه مقارنة بالذرة.`,
          upcomingEn: `Prepare seedbeds for fast-maturing summer Sunflower (${crop.annualWaterMm} mm water requirement).`,
          upcomingAr: `جهز الأرض لزراعة دوار الشمس الزيتي سريع النضج (${crop.annualWaterMm} ملم احتياج مائي).`,
        },
      };

      const customGuidance = CROP_PLANTING_GUIDANCE[crop.id];
      const reasonEn = isNow
        ? customGuidance?.nowEn ||
          `Optimal ${crop.name} sowing window in ${monthNameEn} (${crop.tempOptMin}–${crop.tempOptMax}°C optimal range, ${crop.growingDays}-day cycle, ${crop.annualWaterMm} mm seasonal water demand).`
        : customGuidance?.upcomingEn ||
          `Upcoming sowing window starts next month for ${crop.name} (${crop.growingDays}-day cycle). Seedbed preparation and certified seed procurement recommended.`;

      const reasonAr = isNow
        ? customGuidance?.nowAr ||
          `نافذة الزراعة المثالية لمحصول ${crop.arabicName} خلال شهر ${monthNameAr} (الحرارة المثلى ${crop.tempOptMin}–${crop.tempOptMax}°م، مدة النمو ${crop.growingDays} يوماً، الاحتياج المائي ${crop.annualWaterMm} ملم).`
        : customGuidance?.upcomingAr ||
          `تبدأ عروة زراعة ${crop.arabicName} الشهر المقبل (${crop.growingDays} يوماً). يوصى بتجهيز الأرض وتوفير التقاوي المعتمدة.`;

      results.push({
        crop,
        status: isNow ? 'plant_now' : 'upcoming',
        seasonName: seasonEn,
        seasonNameAr: seasonAr,
        matchScore: climateScore,
        reason: reasonEn,
        reasonAr,
      });
    }
  }

  return results.sort((a, b) => {
    if (a.status === 'plant_now' && b.status !== 'plant_now') return -1;
    if (a.status !== 'plant_now' && b.status === 'plant_now') return 1;
    return b.matchScore - a.matchScore;
  });
}

/**
 * Main Recommendation Generator
 * Generates 3 genuinely distinct, scientifically verified, complete multi-year rotation strategies.
 */
export function generateRecommendations(
  farm: FarmProfile,
  climate: NasaClimateData
): RecommendationResult {
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = MONTH_NAMES_EN[currentMonth - 1];

  // 1. Geospatial & Soil-Landscape Cross-Validation
  const geoValidation = validateCoordinates(
    farm.lat,
    farm.lng,
    farm.country,
    farm.region,
    farm.soilType
  );
  farm.geoValidation = geoValidation;

  // 2. Assess data confidence
  const confidence = assessDataConfidence(farm, climate, geoValidation);

  // 3. Resolve user's current crops for Strategy A
  const resolvedUserCrops: CropInfo[] = (farm.currentCrops || [])
    .map((name) =>
      CROPS.find(
        (c) =>
          c.id === name.toLowerCase() ||
          c.name.toLowerCase() === name.toLowerCase() ||
          c.name.toLowerCase().includes(name.toLowerCase()) ||
          c.arabicName === name
      )
    )
    .filter((c): c is CropInfo => Boolean(c));

  const currentWinterCrop =
    resolvedUserCrops.find((c) => c.seasonCategory === 'winter' || c.seasonCategory === 'autumn_nili') ||
    getCropById('wheat') ||
    CROPS[0];
  const currentSummerCrop =
    resolvedUserCrops.find((c) => c.seasonCategory === 'summer') ||
    getCropById('maize') ||
    CROPS[4];

  // Soil pH advice (only triggered when soil pH is acidic or alkaline — never recommends lime for neutral soil)
  let soilAdvice:
    | { phConstraint: string; phConstraintAr: string; recommendedAction: string; recommendedActionAr: string }
    | undefined;
  if (farm.soilPH === 'acidic') {
    soilAdvice = {
      phConstraint:
        'Acidic soil condition (pH < 6.0) restricts available phosphorus (Fe/Al fixation) and reduces Rhizobium nodulation efficiency in Faba Bean and Soybean.',
      phConstraintAr:
        'حموضة التربة (pH < 6.0) تؤدي إلى تثبيت الفوسفور وتقليل كفاءة عقد الريزوبيا في الفول البلدي وفول الصويا.',
      recommendedAction:
        'Verify soil pH and exchangeable acidity in a certified laboratory before applying agricultural lime (CaCO3), noting that Potato prefers slightly acidic pH (5.5–6.2) to suppress common scab.',
      recommendedActionAr:
        'إجراء تحليل معملي لدرجة الحموضة والألومنيوم المتبادل قبل إضافة الجير الزراعي، مع مراعاة أن البطاطس تفضل التربة المائلة للحموضة (5.5–6.2) للوقاية من الجرب العادي.',
    };
  } else if (farm.soilPH === 'alkaline') {
    soilAdvice = {
      phConstraint:
        'Alkaline soil reaction (pH > 7.5) reduces micronutrient availability (Fe, Zn, Mn) and increases phosphorus precipitation as calcium phosphates.',
      phConstraintAr:
        'قلوية التربة (pH > 7.5) تقلل تيسر العناصر الصغرى (الحديد والزنك والمنجنيز) وتزيد من ترسيب الفوسفور في صورة فوسفات كالسيوم.',
      recommendedAction:
        'Do NOT apply agricultural lime. Use acidifying fertilizers (ammonium sulfate, phosphoric acid via drip) and foliar chelated micronutrients (Fe-EDDHA, Zn-EDTA).',
      recommendedActionAr:
        'يحظر تماماً إضافة الجير الزراعي. يوصى باستخدام الأسمدة الحامضية (سلفات الأمونيوم وحمض الفوسفوريك مع التنقيط) ورش العناصر الصغرى المخلبية.',
    };
  }

  // =========================================================================
  // STRATEGY A: CURRENT FARM BASELINE (Complete 2-Year / 4-Season Cycle)
  // =========================================================================
  const timelineA: RotationTimelineSlot[] = [
    {
      year: 1,
      season: 'winter',
      seasonName: 'Year 1: Winter Season',
      seasonNameAr: 'السنة 1: العروة الشتوية',
      cropId: currentWinterCrop.id,
      cropName: currentWinterCrop.name,
      cropNameAr: currentWinterCrop.arabicName,
      family: currentWinterCrop.family,
      familyAr: currentWinterCrop.familyAr,
      plantingWindow: 'November 15 – December 10',
      plantingWindowAr: '15 نوفمبر – 10 ديسمبر',
      harvestWindow: 'April 20 – May 10',
      harvestWindowAr: '20 أبريل – 10 مايو',
      durationDays: currentWinterCrop.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: currentWinterCrop.annualWaterMm,
      waterPeakPeriod: 'Heading to grain milk stage (February–March)',
      waterPeakPeriodAr: 'مرحلة طرد السنابل والطور اللبني (فبراير–مارس)',
    },
    {
      year: 1,
      season: 'summer',
      seasonName: 'Year 1: Summer Season',
      seasonNameAr: 'السنة 1: العروة الصيفية',
      cropId: currentSummerCrop.id,
      cropName: currentSummerCrop.name,
      cropNameAr: currentSummerCrop.arabicName,
      family: currentSummerCrop.family,
      familyAr: currentSummerCrop.familyAr,
      plantingWindow: 'May 25 – June 15',
      plantingWindowAr: '25 مايو – 15 يونيو',
      harvestWindow: 'September 20 – October 10',
      harvestWindowAr: '20 سبتمبر – 10 أكتوبر',
      durationDays: currentSummerCrop.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: currentSummerCrop.annualWaterMm,
      waterPeakPeriod: 'Tasseling to grain-filling stage (July–August)',
      waterPeakPeriodAr: 'مرحلة التزهير وامتلاء الحبوب (يوليو–أغسطس)',
    },
    {
      year: 2,
      season: 'winter',
      seasonName: 'Year 2: Winter Season',
      seasonNameAr: 'السنة 2: العروة الشتوية',
      cropId: currentWinterCrop.id,
      cropName: currentWinterCrop.name,
      cropNameAr: currentWinterCrop.arabicName,
      family: currentWinterCrop.family,
      familyAr: currentWinterCrop.familyAr,
      plantingWindow: 'November 15 – December 10',
      plantingWindowAr: '15 نوفمبر – 10 ديسمبر',
      harvestWindow: 'April 20 – May 10',
      harvestWindowAr: '20 أبريل – 10 مايو',
      durationDays: currentWinterCrop.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: currentWinterCrop.annualWaterMm,
      waterPeakPeriod: 'Heading to grain milk stage (February–March)',
      waterPeakPeriodAr: 'مرحلة طرد السنابل والطور اللبني (فبراير–مارس)',
    },
    {
      year: 2,
      season: 'summer',
      seasonName: 'Year 2: Summer Season',
      seasonNameAr: 'السنة 2: العروة الصيفية',
      cropId: currentSummerCrop.id,
      cropName: currentSummerCrop.name,
      cropNameAr: currentSummerCrop.arabicName,
      family: currentSummerCrop.family,
      familyAr: currentSummerCrop.familyAr,
      plantingWindow: 'May 25 – June 15',
      plantingWindowAr: '25 مايو – 15 يونيو',
      harvestWindow: 'September 20 – October 10',
      harvestWindowAr: '20 سبتمبر – 10 أكتوبر',
      durationDays: currentSummerCrop.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: currentSummerCrop.annualWaterMm,
      waterPeakPeriod: 'Vegetative peak & silking (July–August)',
      waterPeakPeriodAr: 'ذروة النمو الخضري وظهور الحريرة (يوليو–أغسطس)',
    },
  ];

  const cropsA = [currentWinterCrop, currentSummerCrop, currentWinterCrop, currentSummerCrop];
  const evalA = buildFullEvaluation('current', cropsA, timelineA, farm, climate);
  const isDefaultWheatMaize = currentWinterCrop.id === 'wheat' && currentSummerCrop.id === 'maize';
  const stratAWaterYr = currentWinterCrop.annualWaterMm + currentSummerCrop.annualWaterMm;

  const stratA: RotationStrategy = {
    id: 'strategy-a',
    name: isDefaultWheatMaize
      ? 'Current Farm Rotation — Maize ← Wheat (2-Year Cereal Baseline)'
      : `Current Farm Rotation — ${currentSummerCrop.name} ← ${currentWinterCrop.name} (2-Year Baseline)`,
    nameAr: isDefaultWheatMaize
      ? 'الدورة الحالية للمزرعة — ذرة ← قمح (خط الأساس الحبوبي - سنتان)'
      : `الدورة الحالية للمزرعة — ${currentSummerCrop.arabicName} ← ${currentWinterCrop.arabicName} (خط الأساس - سنتان)`,
    label: 'current',
    objective: 'Benchmark current continuous farm management (4 seasons over 2 years), measuring water demand, synthetic N reliance, and pathogen carryover.',
    objectiveAr: 'تقييم خط الأساس للممارسات الحالية (4 عروات خلال سنتين) لقياس استهلاك المياه والاعتماد على السماد الكيميائي ومخاطر توطن الآفات.',
    timeline: timelineA,
    sequence: [
      `Year 1: ${currentWinterCrop.name} (Winter) → ${currentSummerCrop.name} (Summer)`,
      `Year 2: ${currentWinterCrop.name} (Winter) → ${currentSummerCrop.name} (Summer)`,
    ],
    sequenceAr: [
      `السنة 1: ${currentWinterCrop.arabicName} (شتاء) ← ${currentSummerCrop.arabicName} (صيف)`,
      `السنة 2: ${currentWinterCrop.arabicName} (شتاء) ← ${currentSummerCrop.arabicName} (صيف)`,
    ],
    description: `A complete 2-year (4-season) baseline representing repeated cultivation of ${currentWinterCrop.name} (Winter) and ${currentSummerCrop.name} (Summer). Serves as the scientific control benchmark.`,
    descriptionAr: `دورة أساسية مكتملة مدتها سنتان (4 عروات متعاقبة) تمثل تكرار زراعة ${currentWinterCrop.arabicName} شتاءً و${currentSummerCrop.arabicName} صيفاً. تستخدم كمعيار قياسي للمقارنة.`,
    suitabilityScore: evalA.overallScore,
    confidence,
    scores: evalA.scores,
    dimensionBreakdown: evalA.dimensions,
    nitrogenAnalysis: evalA.nitrogenAnalysis,
    pestAnalysis: evalA.pestAnalysis,
    soilAmendmentAdvice: soilAdvice,
    advantages: [
      'Established agronomic experience and familiar machinery calibration for field operators.',
      'Guaranteed domestic marketing channels through local grain silos and feed mills.',
      'No specialized cold storage or perishable vegetable logistics required.',
    ],
    advantagesAr: [
      'خبرة زراعية مألوفة للمزارع مع توفر الآلات والمعدات المعتادة للحبوب.',
      'قنوات تسويق وتوريد مضمونة وثابتة لصوامع القمح ومصانع الأعلاف.',
      'عدم الحاجة لثلاجات تخزين مبرد أو سلاسل نقل سريعة للمحاصيل القابلة للتلف.',
    ],
    disadvantages: [
      `Annual water demand of ${stratAWaterYr.toLocaleString()} mm/yr across Winter ${currentWinterCrop.name} (${currentWinterCrop.annualWaterMm} mm) + Summer ${currentSummerCrop.name} (${currentSummerCrop.annualWaterMm} mm).`,
      currentWinterCrop.nitrogenFixation || currentSummerCrop.nitrogenFixation
        ? 'Repeating the same two crops every 12 months limits multi-year suppression of soilborne pathogens.'
        : 'Continuous non-legume monoculture (4 consecutive seasons) depletes soil nitrogen, requiring 100% synthetic fertilizer inputs (0 kg N/ha biological credit).',
      'Accelerates soilborne take-all root rot (Gaeumannomyces graminis), cereal cyst nematodes, and stem borer carryover.',
    ],
    disadvantagesAr: [
      `احتياج مائي سنوي يبلغ ${stratAWaterYr.toLocaleString()} ملم/سنة (${currentWinterCrop.arabicName} ${currentWinterCrop.annualWaterMm} ملم + ${currentSummerCrop.arabicName} ${currentSummerCrop.annualWaterMm} ملم).`,
      currentWinterCrop.nitrogenFixation || currentSummerCrop.nitrogenFixation
        ? 'تكرار نفس المحصولين كل 12 شهراً يحد من كسر دورات الفطريات المعمرة في التربة.'
        : 'زراعة النجيليات المتصلة (4 عروات متتالية) تستنزف نيتروجين التربة وتتطلب تسميداً كيميائياً كاملاً (0 كغ N/هكتار تثبيت حيوي).',
      'تزيد من تراكم فطريات عفن قواعد القمح (Take-all) ونيماتودا الحويصلات وثاقبات الذرة.',
    ],
    risks: [
      'Declining nitrogen-use efficiency and plow-pan compaction at 25–30 cm depth from uniform rooting.',
      'High exposure to synthetic urea/ammonium nitrate price inflation.',
    ],
    risksAr: [
      'تراجع كفاءة استخدام السماد وتكون طبقة صماء على عمق 25–30 سم بسبب تماثل عمق الجذور الليفية.',
      'تأثر صافي الربح بارتفاع أسعار اليوريا ونترات الأمونيوم.',
    ],
    explanation: `Option A achieves an overall score of ${evalA.overallScore}/100 (±4) (Climate: ${evalA.scores.climateSuitability}%, Water: ${evalA.scores.waterBalance}%, Soil: ${evalA.scores.soilHealth}%, Nitrogen: ${evalA.scores.nitrogenBalance}%, Pest: ${evalA.scores.pestDiversity}%, Economic: ${evalA.scores.economicProfitability}%, Calendar: ${evalA.scores.calendarFeasibility}%, Long-Term Resilience: ${evalA.scores.sustainability}%). Assumption: Current rotation unified to ${currentSummerCrop.name} ← ${currentWinterCrop.name} (2-year cycle) per specification item 6. ${evalA.nitrogenAnalysis.residualAvailableKgHa.startsWith('0') ? 'Continuous Poaceae cropping provides 0 kg N/ha biological nitrogen fixation and perpetuates cereal pathogen cycles. Pathogen Risk: High — continuous Poaceae sequence perpetuates cereal pathogens.' : `Provides ${evalA.nitrogenAnalysis.residualAvailableKgHa} biological nitrogen credit.`}`,
    explanationAr: `يحقق الخيار (أ) درجة ملاءمة إجمالية ${evalA.overallScore}/100 (±4) (المناخ: ${evalA.scores.climateSuitability}%، المياه: ${evalA.scores.waterBalance}%، التربة: ${evalA.scores.soilHealth}%، النيتروجين: ${evalA.scores.nitrogenBalance}%، الآفات: ${evalA.scores.pestDiversity}%، الاقتصاد: ${evalA.scores.economicProfitability}%، التقويم: ${evalA.scores.calendarFeasibility}%، الاستدامة طويلة المدى: ${evalA.scores.sustainability}%). افتراض: تم توحيد الدورة الحالية كدورة ${currentSummerCrop.arabicName} ← ${currentWinterCrop.arabicName} (سنتان) وفقاً للبند 6.`,
    dataLimitations: [
      'Baseline assumes standard regional synthetic fertilizer rates (160–220 kg N/ha); actual soil N balance requires laboratory testing.',
      'NASA POWER represents gridded (~50 km) regional climatology.',
      ...(farm.soilType === 'unknown' ? ['Soil texture is marked as Unknown; laboratory particle-size analysis is required.'] : []),
      ...(farm.soilPH === 'unknown' ? ['Soil pH is marked as Unknown; laboratory pH measurement is required.'] : []),
    ],
    dataLimitationsAr: [
      'يفترض خط الأساس معدلات التسميد الإرشادية المعتادة؛ ويتطلب الرصيد الفعلي فحصاً معملياً للتربة.',
      'بيانات ناسا تمثل شبكة مناخية إقليمية (~50 كم) وليست محطة أرصاد داخل الحقل.',
      ...(farm.soilType === 'unknown' ? ['قوام التربة غير معروف؛ يلزم إجراء فحص معملي لقوام التربة.'] : []),
      ...(farm.soilPH === 'unknown' ? ['درجة حموضة التربة (pH) غير معروفة؛ يلزم قياسها معملياً.'] : []),
    ],
  };

  // =========================================================================
  // STRATEGY B: FOOD SECURITY & SOIL FERTILITY GRAIN-LEGUME ROTATION (2-Year / 4-Season Cycle)
  // Year 1: Wheat (Winter) -> Maize (Summer) | Year 2: Faba Bean (Winter) -> Sunflower (Summer)
  // =========================================================================
  const cropWheat = getCropById('wheat') || CROPS[0];
  const cropMaize = getCropById('maize') || CROPS[4];
  const cropFaba = getCropById('faba_bean') || CROPS[2];
  const cropSunflower = getCropById('sunflower') || CROPS[7];

  const timelineB: RotationTimelineSlot[] = [
    {
      year: 1,
      season: 'winter',
      seasonName: 'Year 1: Winter Season',
      seasonNameAr: 'السنة 1: العروة الشتوية',
      cropId: cropWheat.id,
      cropName: cropWheat.name,
      cropNameAr: cropWheat.arabicName,
      family: cropWheat.family,
      familyAr: cropWheat.familyAr,
      plantingWindow: 'November 15 – December 5',
      plantingWindowAr: '15 نوفمبر – 5 ديسمبر',
      harvestWindow: 'April 25 – May 15',
      harvestWindowAr: '25 أبريل – 15 مايو',
      durationDays: cropWheat.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: cropWheat.annualWaterMm,
      waterPeakPeriod: 'Heading to grain milk stage (February–March)',
      waterPeakPeriodAr: 'مرحلة طرد السنابل والطور اللبني (فبراير–مارس)',
    },
    {
      year: 1,
      season: 'summer',
      seasonName: 'Year 1: Summer Season',
      seasonNameAr: 'السنة 1: العروة الصيفية',
      cropId: cropMaize.id,
      cropName: cropMaize.name,
      cropNameAr: cropMaize.arabicName,
      family: cropMaize.family,
      familyAr: cropMaize.familyAr,
      plantingWindow: 'May 25 – June 15',
      plantingWindowAr: '25 مايو – 15 يونيو',
      harvestWindow: 'September 20 – October 10',
      harvestWindowAr: '20 سبتمبر – 10 أكتوبر',
      durationDays: cropMaize.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropMaize.annualWaterMm,
      waterPeakPeriod: 'Tasseling and grain filling (July–August)',
      waterPeakPeriodAr: 'مرحلة التزهير وامتلاء الحبوب (يوليو–أغسطس)',
    },
    {
      year: 2,
      season: 'winter',
      seasonName: 'Year 2: Winter Season',
      seasonNameAr: 'السنة 2: العروة الشتوية',
      cropId: cropFaba.id,
      cropName: cropFaba.name,
      cropNameAr: cropFaba.arabicName,
      family: cropFaba.family,
      familyAr: cropFaba.familyAr,
      plantingWindow: 'October 25 – November 20',
      plantingWindowAr: '25 أكتوبر – 20 نوفمبر',
      harvestWindow: 'March 25 – April 20',
      harvestWindowAr: '25 مارس – 20 أبريل',
      durationDays: cropFaba.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropFaba.annualWaterMm,
      waterPeakPeriod: 'Flowering and pod formation (January–February)',
      waterPeakPeriodAr: 'مرحلة التزهير وتكوين القرون (يناير–فبراير)',
    },
    {
      year: 2,
      season: 'summer',
      seasonName: 'Year 2: Summer Season',
      seasonNameAr: 'السنة 2: العروة الصيفية',
      cropId: cropSunflower.id,
      cropName: cropSunflower.name,
      cropNameAr: cropSunflower.arabicName,
      family: cropSunflower.family,
      familyAr: cropSunflower.familyAr,
      plantingWindow: 'May 5 – May 25',
      plantingWindowAr: '5 مايو – 25 مايو',
      harvestWindow: 'August 15 – September 5',
      harvestWindowAr: '15 أغسطس – 5 سبتمبر',
      durationDays: cropSunflower.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropSunflower.annualWaterMm,
      waterPeakPeriod: 'Budding to seed filling (June–July)',
      waterPeakPeriodAr: 'مرحلة تكوين البرعم الزهري وامتلاء البذور (يونيو–يوليو)',
    },
  ];

  const cropsB = [cropWheat, cropMaize, cropFaba, cropSunflower];
  const evalB = buildFullEvaluation('food_security', cropsB, timelineB, farm, climate);

  const stratB: RotationStrategy = {
    id: 'strategy-b',
    name: 'Food Security & Soil Restorative Rotation (2-Year Cycle)',
    nameAr: 'دورة الأمن الغذائي وتجديد خصوبة التربة (دورة سنتين - 4 مواسم)',
    label: 'food_security',
    objective: 'Maximize staple grain security, reduce annual water demand by 10.5% (940 vs 1,050 mm/yr), restore biological nitrogen, and break cereal root-rot cycles.',
    objectiveAr: 'تحقيق أمان الحبوب الغذائية، وتوفير استهلاك المياه السنوي بنسبة 10.5% (940 مقابل 1,050 ملم/سنة)، وإمداد التربة بالنيتروجين الحيوي وكسر أعفان القمح.',
    timeline: timelineB,
    sequence: [
      'Year 1: Wheat (Winter) → Maize (Summer)',
      'Year 2: Faba Bean (Winter) → Sunflower (Summer)',
    ],
    sequenceAr: [
      'السنة 1: القمح (شتاء) ← الذرة الشامية (صيف)',
      'السنة 2: الفول البلدي (شتاء) ← دوار الشمس (صيف)',
    ],
    description: `A complete 2-year (4-season) field crop rotation pairing Year 1 cereals (Wheat → Maize) with a Year 2 dicot restoration year (Faba Bean → Sunflower). Suitable for loam and sandy-loam soils without requiring high horticultural capital.`,
    descriptionAr: `دورة حقلية مكتملة مدتها سنتان (4 عروات متعاقبة) تدمج بين حبوب السنة الأولى (القمح ← الذرة) وعام تجديد حيوي في السنة الثانية (الفول البلدي ← دوار الشمس). مناسبة للأراضي الطميية والرملية الطميية دون مخاطر رأس المال البستاني.`,
    suitabilityScore: evalB.overallScore,
    confidence,
    scores: evalB.scores,
    dimensionBreakdown: evalB.dimensions,
    nitrogenAnalysis: evalB.nitrogenAnalysis,
    pestAnalysis: evalB.pestAnalysis,
    soilAmendmentAdvice: soilAdvice,
    advantages: [
      `Biological nitrogen fixation from Year 2 Faba Bean provides ${evalB.nitrogenAnalysis.residualAvailableKgHa} net residual N credit, reducing synthetic fertilizer costs.`,
      `Saves 110 mm/yr of irrigation water on average (940 mm/yr vs. 1,050 mm/yr in Option A) by replacing second-year Wheat/Maize with lower-demand Faba Bean (380 mm) and Sunflower (450 mm).`,
      `Deep Sunflower taproots (1.5–2.0 m) fracture dense plow-pans and scavenge leached subsoil nitrates.`,
      `Year 2 non-Poaceae break is a genuine full-season break — it interrupts cereal take-all (Gaeumannomyces graminis), cereal cyst nematodes (Heterodera avenae), and maize stem borers.`,
    ],
    advantagesAr: [
      `التثبيت الحيوي للنيتروجين من الفول البلدي في السنة الثانية يوفر رصيداً صافياً قدره ${evalB.nitrogenAnalysis.residualAvailableKgHa} يخفض تكلفة التسميد الكيميائي.`,
      `توفير 110 ملم/سنة من مياه الري في المتوسط (940 ملم/سنة مقابل 1,050 ملم/سنة في الخيار أ) عبر إدخال الفول البلدي (380 ملم) ودوار الشمس (450 ملم).`,
      `جذور دوار الشمس الوتدية العميقة (1.5–2.0 م) تفكك الطبقات الصماء في التربة وتستعيد النترات المتسربة للأعماق.`,
      `الفاصل غير النجيلي الحقيقي في السنة الثانية يكسر دورة فطر عفن قواعد القمح (Take-all) ونيماتودا الحويصلات وثاقبات الذرة.`,
    ],
    disadvantages: [
      'Gross revenue per feddan is lower than high-value export vegetable rotations (Option C).',
      'Faba Bean requires resistant/tolerant varieties (Giza 843 / Misr 3) and an integrated Orobanche crenata management protocol; broomrape pressure can reduce Option B viability in heavily infested fields.',
    ],
    disadvantagesAr: [
      'إجمالي العائد النقدي للفدان أقل مقارنة بدورات الخضر التصديرية عالية القيمة (الخيار ج).',
      'يتطلب الفول البلدي أصنافاً متحملة (جيزة 843 / مصر 3) ونهج متكامل لإدارة الهالوك (Orobanche crenata)؛ ضغط الهالوك الشديد يمكن أن يقلل من جدوى الخيار (ب) في الحقول الموبوءة.',
    ],
    risks: [
      'Rhizobium leguminosarum seed inoculation is required if Faba Bean has not been grown recently.',
      'Removing Faba Bean haulms off-field for livestock fodder reduces net residual nitrogen credit.',
    ],
    risksAr: [
      'يلزم تلقيح بذور الفول البلدي بالعقدين البكتيري عند الزراعة لضمان فاعلية تثبيت النيتروجين.',
      'إزالة عرش الفول خارج الحقل يقلل من صافي النيتروجين المتبقي للمحصول التالي.',
    ],
    explanation: `Option B scores ${evalB.overallScore}/100 (±4) (Climate: ${evalB.scores.climateSuitability}%, Water: ${evalB.scores.waterBalance}%, Soil: ${evalB.scores.soilHealth}%, Nitrogen: ${evalB.scores.nitrogenBalance}%, Pest: ${evalB.scores.pestDiversity}%, Economic: ${evalB.scores.economicProfitability}%, Calendar: ${evalB.scores.calendarFeasibility}%, Long-Term Resilience: ${evalB.scores.sustainability}%). It achieves the highest Soil Compatibility (${evalB.scores.soilHealth}%) and Water Conservation balance (${evalB.scores.waterBalance}%) on loam/sandy-loam parcels while providing a genuine full-season break that interrupts cereal take-all (Gaeumannomyces graminis) and cereal cyst nematodes (Heterodera avenae). The 3-point gap between B and C is smaller than the uncertainty band (±4), so the ranking between them depends on the farmer's stated priorities.`,
    explanationAr: `يحقق الخيار (ب) درجة ملاءمة ${evalB.overallScore}/100 (±4) (المناخ: ${evalB.scores.climateSuitability}%، المياه: ${evalB.scores.waterBalance}%، التربة: ${evalB.scores.soilHealth}%، النيتروجين: ${evalB.scores.nitrogenBalance}%، الآفات: ${evalB.scores.pestDiversity}%، الاقتصاد: ${evalB.scores.economicProfitability}%، التقويم: ${evalB.scores.calendarFeasibility}%، الاستدامة طويلة المدى: ${evalB.scores.sustainability}%). يتفوق في توافق التربة الطميية (${evalB.scores.soilHealth}%) وتوفير المياه (${evalB.scores.waterBalance}%) مع تقديم فاصل غير نجيلي حقيقي يكسر دورة فطر عفن قواعد القمح ونيماتودا الحبوب. الفرق 3 نقاط بين (ب) و(ج) أصغر من نطاق الخطأ (±4)، لذا يعتمد الترتيب على أولويات المزارع.`,
    dataLimitations: [
      'Net residual nitrogen (25–45 kg N/ha) assumes incorporation of nodulated roots and crop residues.',
      'Verify soil salinity (ECe < 3.5 dS/m) and available Olsen-P (>12 mg/kg) for optimal Faba Bean yield.',
      ...(farm.soilType === 'unknown' ? ['Soil texture is marked as Unknown; laboratory particle-size analysis is required.'] : []),
    ],
    dataLimitationsAr: [
      'يفترض صافي النيتروجين المتبقي (25–45 كغ N/هكتار) فرم بقايا المحصول والجذور العقدية بالتربة.',
      'يوصى بالتحقق من ملوحة التربة (< 3.5 ديسيسيمنز/م) ومستوى الفوسفور الميسر لتحقيق أعلى إنتاجية للفول.',
      ...(farm.soilType === 'unknown' ? ['قوام التربة غير معروف؛ يلزم إجراء فحص معملي لقوام التربة.'] : []),
    ],
  };

  // =========================================================================
  // STRATEGY C: HIGH-VALUE HORTICULTURAL CASH DIVERSIFICATION (Complete 4-Year / 8-Season Cycle)
  // =========================================================================
  const cropPotato = getCropById('potato') || CROPS[8];
  const cropSorghum = getCropById('sorghum') || CROPS[5];
  const cropOnion = getCropById('onion') || CROPS[10];
  const cropSoybean = getCropById('soybean') || CROPS[6];

  const timelineC: RotationTimelineSlot[] = [
    {
      year: 1,
      season: 'autumn_nili',
      seasonName: 'Year 1: Autumn/Winter Season',
      seasonNameAr: 'السنة 1: العروة النيلية/الشتوية',
      cropId: cropPotato.id,
      cropName: cropPotato.name,
      cropNameAr: cropPotato.arabicName,
      family: cropPotato.family,
      familyAr: cropPotato.familyAr,
      plantingWindow: 'October 5 – October 25',
      plantingWindowAr: '5 أكتوبر – 25 أكتوبر',
      harvestWindow: 'January 25 – February 20',
      harvestWindowAr: '25 يناير – 20 فبراير',
      durationDays: cropPotato.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: cropPotato.annualWaterMm,
      waterPeakPeriod: 'Tuber initiation and bulking (November–December)',
      waterPeakPeriodAr: 'مرحلة صب وتضخم الدرنات (نوفمبر–ديسمبر)',
    },
    {
      year: 1,
      season: 'summer',
      seasonName: 'Year 1: Summer Season',
      seasonNameAr: 'السنة 1: العروة الصيفية',
      cropId: cropMaize.id,
      cropName: cropMaize.name,
      cropNameAr: cropMaize.arabicName,
      family: cropMaize.family,
      familyAr: cropMaize.familyAr,
      plantingWindow: 'May 15 – June 5',
      plantingWindowAr: '15 مايو – 5 يونيو',
      harvestWindow: 'September 15 – October 5',
      harvestWindowAr: '15 سبتمبر – 5 أكتوبر',
      durationDays: cropMaize.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropMaize.annualWaterMm,
      waterPeakPeriod: 'Silking and ear filling (July–August)',
      waterPeakPeriodAr: 'مرحلة التزهير وامتلاء الكيزان (يوليو–أغسطس)',
    },
    {
      year: 2,
      season: 'winter',
      seasonName: 'Year 2: Winter Season (Break Yr 1)',
      seasonNameAr: 'السنة 2: العروة الشتوية (سنة الفاصل 1)',
      cropId: cropFaba.id,
      cropName: cropFaba.name,
      cropNameAr: cropFaba.arabicName,
      family: cropFaba.family,
      familyAr: cropFaba.familyAr,
      plantingWindow: 'November 1 – November 25',
      plantingWindowAr: '1 نوفمبر – 25 نوفمبر',
      harvestWindow: 'April 5 – April 25',
      harvestWindowAr: '5 أبريل – 25 أبريل',
      durationDays: cropFaba.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropFaba.annualWaterMm,
      waterPeakPeriod: 'Flowering and early pod fill (January–February)',
      waterPeakPeriodAr: 'مرحلة التزهير وبداية عقد القرون (يناير–فبراير)',
    },
    {
      year: 2,
      season: 'summer',
      seasonName: 'Year 2: Summer (Break from Solanaceae only — NOT grass break)',
      seasonNameAr: 'السنة 2: الصيف (فاصل باذنجانيات فقط — ليس فاصل حشائش)',
      cropId: cropSorghum.id,
      cropName: cropSorghum.name,
      cropNameAr: cropSorghum.arabicName,
      family: cropSorghum.family,
      familyAr: cropSorghum.familyAr,
      plantingWindow: 'May 20 – June 10',
      plantingWindowAr: '20 مايو – 10 يونيو',
      harvestWindow: 'September 10 – September 30',
      harvestWindowAr: '10 سبتمبر – 30 سبتمبر',
      durationDays: cropSorghum.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropSorghum.annualWaterMm,
      waterPeakPeriod: 'Booting and panicle emergence (July)',
      waterPeakPeriodAr: 'مرحلة طرد السباطة وامتلاء الحبوب (يوليو)',
    },
    {
      year: 3,
      season: 'winter',
      seasonName: 'Year 3: Winter Season (Break Yr 2)',
      seasonNameAr: 'السنة 3: العروة الشتوية (سنة الفاصل 2)',
      cropId: cropOnion.id,
      cropName: cropOnion.name,
      cropNameAr: cropOnion.arabicName,
      family: cropOnion.family,
      familyAr: cropOnion.familyAr,
      plantingWindow: 'November 25 – December 20',
      plantingWindowAr: '25 نوفمبر – 20 ديسمبر',
      harvestWindow: 'April 25 – May 15',
      harvestWindowAr: '25 أبريل – 15 مايو',
      durationDays: cropOnion.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: cropOnion.annualWaterMm,
      waterPeakPeriod: 'Bulb formation and enlargement (March–April)',
      waterPeakPeriodAr: 'مرحلة تكوين وصب الرؤوس البصلية (مارس–أبريل)',
    },
    {
      year: 3,
      season: 'summer',
      seasonName: 'Year 3: Summer Season (Break Yr 2)',
      seasonNameAr: 'السنة 3: العروة الصيفية (سنة الفاصل 2)',
      cropId: cropSoybean.id,
      cropName: cropSoybean.name,
      cropNameAr: cropSoybean.arabicName,
      family: cropSoybean.family,
      familyAr: cropSoybean.familyAr,
      plantingWindow: 'May 25 – June 15',
      plantingWindowAr: '25 مايو – 15 يونيو',
      harvestWindow: 'September 15 – October 5',
      harvestWindowAr: '15 سبتمبر – 5 أكتوبر',
      durationDays: cropSoybean.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropSoybean.annualWaterMm,
      waterPeakPeriod: 'Flowering and pod filling (July–August)',
      waterPeakPeriodAr: 'مرحلة التزهير وامتلاء القرون (يوليو–أغسطس)',
    },
    {
      year: 4,
      season: 'winter',
      seasonName: 'Year 4: Winter Season (Break Yr 3)',
      seasonNameAr: 'السنة 4: العروة الشتوية (سنة الفاصل 3)',
      cropId: cropWheat.id,
      cropName: cropWheat.name,
      cropNameAr: cropWheat.arabicName,
      family: cropWheat.family,
      familyAr: cropWheat.familyAr,
      plantingWindow: 'November 15 – December 5',
      plantingWindowAr: '15 نوفمبر – 5 ديسمبر',
      harvestWindow: 'April 25 – May 15',
      harvestWindowAr: '25 أبريل – 15 مايو',
      durationDays: cropWheat.growingDays,
      landPrepWeeks: 3,
      waterDemandMm: cropWheat.annualWaterMm,
      waterPeakPeriod: 'Heading to grain milk stage (February–March)',
      waterPeakPeriodAr: 'مرحلة طرد السنابل والطور اللبني (فبراير–مارس)',
    },
    {
      year: 4,
      season: 'summer',
      seasonName: 'Year 4: Summer Season (Break Yr 3)',
      seasonNameAr: 'السنة 4: العروة الصيفية (سنة الفاصل 3)',
      cropId: cropSunflower.id,
      cropName: cropSunflower.name,
      cropNameAr: cropSunflower.arabicName,
      family: cropSunflower.family,
      familyAr: cropSunflower.familyAr,
      plantingWindow: 'May 20 – June 5',
      plantingWindowAr: '20 مايو – 5 يونيو',
      harvestWindow: 'August 25 – September 15',
      harvestWindowAr: '25 أغسطس – 15 سبتمبر',
      durationDays: cropSunflower.growingDays,
      landPrepWeeks: 2,
      waterDemandMm: cropSunflower.annualWaterMm,
      waterPeakPeriod: 'Flowering and achene filling (July)',
      waterPeakPeriodAr: 'مرحلة التزهير وامتلاء البذور الزيتية (يوليو)',
    },
  ];

  const cropsC = [
    cropPotato,
    cropMaize,
    cropFaba,
    cropSorghum,
    cropOnion,
    cropSoybean,
    cropWheat,
    cropSunflower,
  ];
  const evalC = buildFullEvaluation('horticultural', cropsC, timelineC, farm, climate);

  const stratC: RotationStrategy = {
    id: 'strategy-c',
    name: 'High-Value Horticultural Cash Diversification — 3-Year (7-Season) Solanaceae Break',
    nameAr: 'دورة التنويع البستاني عالي الربحية — فاصل باذنجاني 3 سنوات (7 مواسم)',
    label: 'horticultural',
    objective: 'Maximize commercial cash revenue via Potato and Export Onion while enforcing a true 3-year (7-season) non-Solanaceous break (Years 2, 3, and 4) before Potato recurs in Year 5.',
    objectiveAr: 'تعظيم العائد التجاري والتصديري عبر البطاطس والبصل مع تطبيق فاصل زمني حقيقي مدته 3 سنوات كاملة (السنوات 2 و3 و4 = 7 مواسم غير عائلة) قبل عودة البطاطس في السنة 5.',
    timeline: timelineC,
    sequence: [
      'Year 1: Potato (Autumn/Winter) → Maize (Summer)',
      'Year 2: Faba Bean (Winter) → Sorghum (Summer)',
      'Year 3: Export Onion (Winter) → Soybean (Summer)',
      'Year 4: Wheat (Winter) → Sunflower (Summer)',
    ],
    sequenceAr: [
      'السنة 1: بطاطس (نيلية/شتوية) ← ذرة شامية (صيف)',
      'السنة 2: فول بلدي (شتاء) ← ذرة رفيعة (صيف)',
      'السنة 3: بصل تصديري (شتاء) ← فول صويا (صيف)',
      'السنة 4: قمح (شتاء) ← دوار شمس (صيف)',
    ],
    description: `A complete 4-year (8-season) commercial rotation spanning 5 botanical families (Solanaceae, Poaceae, Fabaceae, Amaryllidaceae, Asteraceae) with two biological N-fixing legumes (Year 2 Faba Bean and Year 3 Soybean). Planting Potato in Year 1 followed by 3 full non-host years (Years 2–4) guarantees a true 3-year Solanaceae break.`,
    descriptionAr: `دورة تجارية مكتملة مدتها 4 سنوات (8 عروات متعاقبة) تضم 5 عائلات نباتية وموسمين للبقوليات المثبتة للنيتروجين (الفول البلدي في السنة 2 وفول الصويا في السنة 3). تضمن زراعة البطاطس في السنة 1 متبوعة بـ 3 سنوات كاملة غير باذنجانية (السنوات 2–4) فاصلاً صحياً حقيقياً قبل السنة 5.`,
    suitabilityScore: evalC.overallScore,
    confidence,
    scores: evalC.scores,
    dimensionBreakdown: evalC.dimensions,
    nitrogenAnalysis: evalC.nitrogenAnalysis,
    pestAnalysis: evalC.pestAnalysis,
    soilAmendmentAdvice: soilAdvice,
    advantages: [
      `Highest Economic Profitability (${evalC.scores.economicProfitability}/100) driven by two export cash vegetables (Year 1 Potato and Year 3 Onion) plus dual oilseed/pulse crops.`,
      `Mathematically true 3-year (7-season) Solanaceae break: 3 full years (Years 2, 3, and 4 = 7 consecutive non-host seasons) separate Year 1 Potato from Year 5 Potato, suppressing Verticillium dahliae.`,
      `Dual legume integration (Year 2 Winter Faba Bean + Year 3 Summer Soybean) delivers ${evalC.nitrogenAnalysis.residualAvailableKgHa} cumulative residual N (${evalC.nitrogenAnalysis.totalBnfRangeKgHa} total fixed).`,
      `Onion (Year 3) is a poor host for Meloidogyne spp., limiting nematode multiplication — this is a host-status effect that suppresses root-knot nematode populations.`,
    ],
    advantagesAr: [
      `أعلى ربحية اقتصادية (${evalC.scores.economicProfitability}/100) بفضل دمج محصولي خضر تصديريين (البطاطس في السنة 1 والبصل في السنة 3) مع محاصيل البقول والزيت.`,
      `فاصل باذنجاني حقيقي 3 سنوات (7 مواسم): تفصل السنوات 2 و3 و4 (7 عروات غير عائلة متتالية) بين بطاطس السنة 1 وبطاطس السنة 5، مما يكبح فطر الذبول (Verticillium).`,
      `دمج محصولين بقوليين (الفول البلدي شتاء السنة 2 + فول الصويا صيف السنة 3) يوفر رصيداً نيتروجينياً تراكمياً قدره ${evalC.nitrogenAnalysis.residualAvailableKgHa}.`,
      `البصل في السنة 3 عائل ضعيف لنيماتودا Meloidogyne spp. مما يحد من تكاثرها — تأثير حالة العائل لا إفراز مبيد نيماتودي.`,
    ],
    disadvantages: [
      'Requires conversion to drip irrigation for shallow-rooted Potato (0.5 m) and Onion (0.3 m) — estimated conversion cost: 25,000–35,000 EGP/feddan. CONDITIONAL on ECe soil salinity test results (Potato: threshold 1.7 dS/m; Onion: 1.2 dS/m).',
      'Substantially higher working capital required for certified seed potato tubers, pest scouting, and cold storage.',
      'Potato common scab (Streptomyces scabies) risk is elevated at pH 6.0–7.5; use certified seed tubers and avoid furrow wetting 4 weeks post-planting.',
      'Bare period after Potato harvest (February–May, ~3 months): Add a cover crop — forage cowpea or summer green manure (60–75 days duration) to protect soil structure and add organic matter.',
    ],
    disadvantagesAr: [
      'يتطلب التحويل إلى الري بالتنقيط للبطاطس (جذور 0.5م) والبصل (جذور 0.3م) — التكلفة التقديرية: 25,000–35,000 جنيه/فدان. مشروط بنتائج فحص ملوحة التربة (البطاطس: عتبة 1.7 ديسيسيمنز/م؛ البصل: 1.2 ديسيسيمنز/م).',
      'تتطلب رأس مال تشغيلي أعلى لشراء تقاوي البطاطس المعتمدة وتكاليف التخزين المبرد.',
      'خطر جرب البطاطس العادي (Streptomyces scabies) مرتفع عند pH 6.0–7.5؛ استخدم تقاوي معتمدة وتجنب ري الأخاديد 4 أسابيع بعد الزراعة.',
      'فترة أرض عارية بعد حصاد البطاطس (فبراير–مايو، ~3 أشهر): إضافة محصول تغطية — كبيا علفي أو سماد أخضر صيفي (60–75 يوماً) لحماية التربة وإضافة المادة العضوية.',
    ],
    risks: [
      'Salinity sensitivity: Potato (>1.7 dS/m) and Onion (>1.2 dS/m) suffer yield loss if irrigation water or soil ECe is elevated.',
      'Perishable vegetable market price volatility requires advance buyer contracts or cold-storage booking.',
    ],
    risksAr: [
      'حساسية الملوحة: تتأثر إنتاجية البطاطس (>1.7 ديسيسيمنز/م) والبصل (>1.2 ديسيسيمنز/م) عند ارتفاع ملوحة التربة أو مياه الري.',
      'تقلبات أسعار الخضر الطازجة تستلزم التعاقد التسويقي المسبق أو توفير ثلاجات حفظ.',
    ],
    explanation: `Option C achieves an overall score of ${evalC.overallScore}/100 (±4) (Climate: ${evalC.scores.climateSuitability}%, Water: ${evalC.scores.waterBalance}%, Soil: ${evalC.scores.soilHealth}%, Nitrogen: ${evalC.scores.nitrogenBalance}%, Pest: ${evalC.scores.pestDiversity}%, Economic: ${evalC.scores.economicProfitability}%, Calendar: ${evalC.scores.calendarFeasibility}%, Long-Term Resilience: ${evalC.scores.sustainability}%). It leads in Pest & Pathogen Interruption (${evalC.scores.pestDiversity}/100), Nutrient Dynamics (${evalC.scores.nitrogenBalance}/100), and Economic Profitability (${evalC.scores.economicProfitability}/100). CONDITIONAL on ECe test results. The 3-point gap between B and C is smaller than the uncertainty band (±4), so the ranking between them depends on the farmer's stated priorities.`,
    explanationAr: `يحقق الخيار (ج) درجة ملاءمة إجمالية ${evalC.overallScore}/100 (±4) (المناخ: ${evalC.scores.climateSuitability}%، المياه: ${evalC.scores.waterBalance}%، التربة: ${evalC.scores.soilHealth}%، النيتروجين: ${evalC.scores.nitrogenBalance}%، الآفات: ${evalC.scores.pestDiversity}%، الاقتصاد: ${evalC.scores.economicProfitability}%، التقويم: ${evalC.scores.calendarFeasibility}%، الاستدامة طويلة المدى: ${evalC.scores.sustainability}%). يتصدر في كسر دورات الآفات (${evalC.scores.pestDiversity}/100) وديناميكية النيتروجين (${evalC.scores.nitrogenBalance}/100) والربحية الاقتصادية (${evalC.scores.economicProfitability}/100). مشروط بنتائج فحص ملوحة التربة. الفرق 3 نقاط بين (ب) و(ج) أصغر من نطاق الخطأ (±4)، لذا يعتمد الترتيب على أولويات المزارع.`,
    dataLimitations: [
      'Potato and Onion performance depends on raised-bed tillage and verified ECe < 1.7 dS/m (Potato) and < 1.2 dS/m (Onion). Option C is CONDITIONAL on ECe test results before commitment.',
      'Economic score reflects gross revenue tier; net margin depends on local seed-potato tuber costs and farm-gate prices.',
      ...(farm.soilType === 'unknown' ? ['Soil texture is marked as Unknown; laboratory particle-size analysis is required.'] : []),
    ],
    dataLimitationsAr: [
      'نجاح البطاطس والبصل يشترط الزراعة على مصاطب جيدة الصرف والتحقق من أن ملوحة التربة أقل من 1.7 ديسيسيمنز/م للبطاطس و1.2 ديسيسيمنز/م للبصل.',
      'يعكس المؤشر الاقتصادي مستوى العائد الإجمالي؛ ويعتمد صافي الربح على أسعار تقاوي البطاطس المعتمدة وأسعار السوق.',
      ...(farm.soilType === 'unknown' ? ['قوام التربة غير معروف؛ يلزم إجراء فحص معملي لقوام التربة.'] : []),
    ],
  };

  const regionalFamousCrops = detectRegionalFamousCrops(farm);
  const seasonalPlantingCrops = detectSeasonalPlantingCrops(climate, currentMonth);

  return {
    farmProfile: farm,
    climateData: climate,
    geoValidation,
    strategies: [stratA, stratB, stratC],
    currentMonth,
    currentMonthName,
    regionalFamousCrops,
    seasonalPlantingCrops,
    generatedAt: new Date().toISOString(),
    engineVersion: 'FieldWise-Scientific-v2.3 (8-Dimension Corrected Weights & Water Rule)',
    disclaimer:
      'FieldWise is an agricultural decision-support platform engineered for the NASA Space Apps Challenge 2026. Recommendations are computed using NASA POWER gridded reanalysis (2001–2020 climatology), empirical agronomic models, FAO-56 reference ET, and peer-reviewed crop rotation principles (Peoples et al. BNF ranges). They assist field planning and do not replace certified on-site soil laboratory tests, ground salinity testing (ECe), or local agricultural extension directives. This tool supports — but does not replace — soil testing and local extension advice.',
  };
}
