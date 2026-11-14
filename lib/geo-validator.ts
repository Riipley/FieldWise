// Geographic, Geospatial & Soil-Landscape Validation Engine for FieldWise
// Cross-validates GPS coordinates, governorate/region names, and regional soil profiles
// Provides area unit conversions between Feddans, Hectares, and Acres

export interface GeoValidationResult {
  detectedCountry: string;
  detectedCountryAr: string;
  detectedRegion: string;
  detectedRegionAr: string;
  isConsistent: boolean;
  mismatchType?: 'country_mismatch' | 'region_mismatch' | 'soil_location_mismatch' | 'none';
  warningMessage?: string;
  warningMessageAr?: string;
  soilLocationConsistent: boolean;
  expectedSoils: string[];
  soilWarningMessage?: string;
  soilWarningMessageAr?: string;
  suggestedCountry?: string;
  suggestedRegion?: string;
}

interface BoundingBox {
  country: string;
  countryAr: string;
  region: string;
  regionAr: string;
  keywords: string[];
  expectedSoils: string[];
  soilProfileDesc: string;
  soilProfileDescAr: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Bounding box definitions with regional soil landscapes
const REGIONAL_BOUNDS: BoundingBox[] = [
  // Egypt - Governorates & Agro-Ecological Zones
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'Ismailia & Suez Canal Zone',
    regionAr: 'محافظة الإسماعيلية وإقليم قناة السويس',
    keywords: ['ismailia', 'suez', 'qantara', 'fayed', 'الإسماعيلية', 'اسماعيلية', 'القناة', 'السويس', 'القنطرة'],
    expectedSoils: ['sand', 'sandy-loam', 'loam'],
    soilProfileDesc: 'predominantly Quaternary aeolian sandy and sandy-loam desert reclamation soils',
    soilProfileDescAr: 'أراضٍ رملية ورملية طميية خفيفة مستصلحة',
    minLat: 30.2,
    maxLat: 31.05,
    minLng: 31.85,
    maxLng: 32.7,
  },
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'Northern & Central Nile Delta (Kafr El Sheikh / Gharbia / Dakahlia)',
    regionAr: 'شمال ووسط دلتا النيل (كفر الشيخ / الغربية / الدقهلية)',
    keywords: ['kafr', 'sheikh', 'gharbia', 'dakahlia', 'delta', 'mansoura', 'tanta', 'كفر الشيخ', 'الغربية', 'الدقهلية', 'الدلتا', 'المنصورة', 'طنطا'],
    expectedSoils: ['clay', 'clay-loam', 'loam'],
    soilProfileDesc: 'deep alluvial Nile clay and clay-loam soils',
    soilProfileDescAr: 'أراضٍ طينية وطينية طميية رسوبية ثقيلة',
    minLat: 30.6,
    maxLat: 31.6,
    minLng: 30.4,
    maxLng: 31.84,
  },
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'Western Delta & Alexandria (Beheira / Nubaria)',
    regionAr: 'غرب الدلتا والإسكندرية (البحيرة / النوبارية)',
    keywords: ['alexandria', 'beheira', 'nubaria', 'damanhour', 'الإسكندرية', 'البحيرة', 'النوبارية', 'دمنهور'],
    expectedSoils: ['sandy-loam', 'loam', 'clay-loam', 'sand'],
    soilProfileDesc: 'calcareous sandy-loam to alluvial clay-loam transition soils',
    soilProfileDescAr: 'أراضٍ جيرية رملية طميية إلى طينية طميية',
    minLat: 30.4,
    maxLat: 31.4,
    minLng: 29.5,
    maxLng: 30.39,
  },
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'Greater Cairo, Sharkia & Fayoum',
    regionAr: 'القاهرة الكبرى والشرقية والفيوم',
    keywords: ['cairo', 'giza', 'fayoum', 'sharkia', 'zagazig', 'القاهرة', 'الجيزة', 'الفيوم', 'الشرقية', 'الزقازيق'],
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
    soilProfileDesc: 'alluvial clay-loam and Nile terrace sandy-loam soils',
    soilProfileDescAr: 'أراضٍ طينية طميية ورسوبية على حواف الوادي',
    minLat: 29.1,
    maxLat: 30.59,
    minLng: 30.4,
    maxLng: 31.84,
  },
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'Upper Egypt Nile Valley (Minya / Asyut / Sohag / Luxor)',
    regionAr: 'صعيد مصر ووادي النيل (المنيا / أسيوط / سوهاج / الأقصر)',
    keywords: ['minya', 'asyut', 'sohag', 'qena', 'luxor', 'aswan', 'upper egypt', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الصعيد'],
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
    soilProfileDesc: 'Nile Valley alluvial loam/clay-loam with desert fringe sandy-loam',
    soilProfileDescAr: 'أراضٍ طميية رسوبية في وادي النيل ورملية طميية بالظهير الصحراوي',
    minLat: 24.0,
    maxLat: 29.09,
    minLng: 30.5,
    maxLng: 33.0,
  },
  {
    country: 'Egypt',
    countryAr: 'مصر',
    region: 'New Valley & Toshka Desert Oases',
    regionAr: 'الوادي الجديد وتوشكى والواحات',
    keywords: ['new valley', 'toshka', 'kharga', 'dakhla', 'farafra', 'owinat', 'الوادي الجديد', 'توشكى', 'الخارجة', 'الداخلة', 'الفرافرة', 'العوينات'],
    expectedSoils: ['sand', 'sandy-loam'],
    soilProfileDesc: 'hyper-arid desert sandy and sandy-loam soils',
    soilProfileDescAr: 'أراضٍ رملية صحراوية مستصلحة',
    minLat: 22.0,
    maxLat: 26.0,
    minLng: 27.0,
    maxLng: 31.0,
  },
  // Tunisia
  {
    country: 'Tunisia',
    countryAr: 'تونس',
    region: 'Bizerte & Northern Tell',
    regionAr: 'بنزرت والشمال التونسي',
    keywords: ['bizerte', 'beja', 'jendouba', 'tell', 'بنزرت', 'باجة', 'جندوبة'],
    expectedSoils: ['clay-loam', 'loam', 'clay'],
    soilProfileDesc: 'sub-humid Mediterranean clay-loam and alluvial loam soils',
    soilProfileDescAr: 'أراضٍ طينية طميية متوسطية خصبة',
    minLat: 36.8,
    maxLat: 37.5,
    minLng: 9.0,
    maxLng: 10.3,
  },
  {
    country: 'Tunisia',
    countryAr: 'تونس',
    region: 'Tunis & Cap Bon (Nabeul)',
    regionAr: 'تونس العاصمة والوطن القبلي (نابل)',
    keywords: ['tunis', 'nabeul', 'cap bon', 'ariana', 'تونس', 'نابل', 'الوطن القبلي'],
    expectedSoils: ['sandy-loam', 'loam', 'clay-loam'],
    soilProfileDesc: 'coastal sandy-loam and fertile Mediterranean loam soils',
    soilProfileDescAr: 'أراضٍ طميية ورملية طميية ساحلية',
    minLat: 36.35,
    maxLat: 37.1,
    minLng: 10.0,
    maxLng: 11.2,
  },
  {
    country: 'Tunisia',
    countryAr: 'تونس',
    region: 'Sahel & Central Tunisia (Sousse / Kairouan / Sfax)',
    regionAr: 'الساحل والوسط التونسي (سوسة / القيروان / صفاقس)',
    keywords: ['sousse', 'monastir', 'mahdia', 'kairouan', 'sfax', 'سوسة', 'المنستير', 'المهدية', 'القيروان', 'صفاقس'],
    expectedSoils: ['sandy-loam', 'loam', 'sand'],
    soilProfileDesc: 'semi-arid steppe sandy-loam and calcic loam soils',
    soilProfileDescAr: 'أراضٍ رملية طميية وكلسية شبه جافة',
    minLat: 31.5,
    maxLat: 36.34,
    minLng: 8.0,
    maxLng: 11.5,
  },
  // Saudi Arabia
  {
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    region: 'Al-Qassim & Central Najd',
    regionAr: 'القصيم ووسط نجد',
    keywords: ['qassim', 'buraydah', 'riyadh', 'najd', 'القصيم', 'بريدة', 'الرياض', 'نجد'],
    expectedSoils: ['sand', 'sandy-loam'],
    soilProfileDesc: 'arid desert sandy and sandy-loam soils',
    soilProfileDescAr: 'أراضٍ رملية ورملية طميية صحراوية',
    minLat: 24.5,
    maxLat: 27.5,
    minLng: 42.5,
    maxLng: 46.5,
  },
  // United States - Midwest Corn Belt
  {
    country: 'United States',
    countryAr: 'الولايات المتحدة الأمريكية',
    region: 'Iowa / Illinois (Corn Belt)',
    regionAr: 'آيوا / إلينوي (حزام الذرة الأمريكي)',
    keywords: ['iowa', 'illinois', 'midwest', 'ames', 'des moines', 'آيوا', 'إلينوي'],
    expectedSoils: ['loam', 'clay-loam'],
    soilProfileDesc: 'deep prairie Mollisol loam and silty clay-loam soils',
    soilProfileDescAr: 'أراضٍ طميية وطينية طميية سوداء خصبة',
    minLat: 40.0,
    maxLat: 43.5,
    minLng: -96.5,
    maxLng: -87.5,
  },
];

const BROAD_COUNTRY_BOUNDS: {
  country: string;
  countryAr: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}[] = [
  { country: 'Egypt', countryAr: 'مصر', minLat: 22.0, maxLat: 31.8, minLng: 24.7, maxLng: 36.9 },
  { country: 'Tunisia', countryAr: 'تونس', minLat: 30.2, maxLat: 37.5, minLng: 7.5, maxLng: 11.6 },
  { country: 'Morocco', countryAr: 'المغرب', minLat: 27.5, maxLat: 36.0, minLng: -13.2, maxLng: -1.0 },
  { country: 'Algeria', countryAr: 'الجزائر', minLat: 19.0, maxLat: 37.2, minLng: -8.7, maxLng: 12.0 },
  { country: 'Saudi Arabia', countryAr: 'السعودية', minLat: 16.0, maxLat: 32.2, minLng: 34.5, maxLng: 55.7 },
  { country: 'United States', countryAr: 'الولايات المتحدة', minLat: 24.5, maxLat: 49.4, minLng: -125.0, maxLng: -66.9 },
  { country: 'Spain', countryAr: 'إسبانيا', minLat: 36.0, maxLat: 43.8, minLng: -9.3, maxLng: 3.3 },
  { country: 'Italy', countryAr: 'إيطاليا', minLat: 36.6, maxLat: 47.1, minLng: 6.6, maxLng: 18.5 },
];

/**
 * Validates GPS coordinates against user-entered country, governorate/region, and soil texture.
 * Detects:
 * 1. Cross-country mismatches (e.g. 'Bizerte' entered for Egyptian coordinates).
 * 2. Intra-country governorate mismatches (e.g. 'Ismailia Governorate / Suez Canal' entered for Kafr El Sheikh Nile Delta coordinates 31.11°N, 30.94°E).
 * 3. Soil-location contradictions (e.g. heavy 'Clay' entered for Ismailia sandy desert profile, or 'Ismailia' entered for Nile Delta clay).
 */
export function validateCoordinates(
  lat: number,
  lng: number,
  enteredCountry: string,
  enteredRegion: string,
  soilType = 'unknown'
): GeoValidationResult {
  const nearestEgyptGov = findNearestEgyptGovernorate(lat, lng);
  const detectedRegionMatch = REGIONAL_BOUNDS.find(
    (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
  );

  let detectedCountry = nearestEgyptGov ? 'Egypt' : detectedRegionMatch?.country || '';
  let detectedCountryAr = nearestEgyptGov ? 'مصر' : detectedRegionMatch?.countryAr || '';
  let detectedRegion = nearestEgyptGov ? nearestEgyptGov.regionValue : detectedRegionMatch?.region || '';
  let detectedRegionAr = nearestEgyptGov
    ? `محافظة ${nearestEgyptGov.nameAr} (${nearestEgyptGov.zoneAr})`
    : detectedRegionMatch?.regionAr || '';
  const expectedSoils = nearestEgyptGov
    ? nearestEgyptGov.expectedSoils
    : detectedRegionMatch?.expectedSoils || ['loam', 'clay-loam', 'sandy-loam'];

  if (!detectedCountry) {
    const broadMatch = BROAD_COUNTRY_BOUNDS.find(
      (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
    );
    if (broadMatch) {
      detectedCountry = broadMatch.country;
      detectedCountryAr = broadMatch.countryAr;
      detectedRegion = `${broadMatch.country} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;
      detectedRegionAr = `${broadMatch.countryAr} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;
    } else {
      detectedCountry = enteredCountry || 'International Coordinates';
      detectedCountryAr = enteredCountry || 'إحداثيات دولية';
      detectedRegion = enteredRegion || `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`;
      detectedRegionAr = enteredRegion || `دائرة عرض ${lat.toFixed(2)}، خط طول ${lng.toFixed(2)}`;
    }
  }

  const cleanCountry = (enteredCountry || '').trim().toLowerCase();
  const cleanRegion = (enteredRegion || '').trim().toLowerCase();
  const cleanSoil = (soilType || 'unknown').trim().toLowerCase();
  const detCountryLower = detectedCountry.toLowerCase();

  // Check soil-landscape consistency against the GPS-verified zone
  const soilLocationConsistent =
    cleanSoil === 'unknown' ||
    cleanSoil === '' ||
    expectedSoils.includes(cleanSoil);

  let soilWarningMessage: string | undefined;
  let soilWarningMessageAr: string | undefined;

  if (!soilLocationConsistent) {
    soilWarningMessage = `Soil-Location Contradiction: Recorded soil texture "${soilType}" conflicts with ${detectedRegion}'s typical pedology (expected textures: ${expectedSoils.join(', ')}). Verify soil texture via laboratory particle-size analysis or confirm whether transported alluvial soil was added.`;
    soilWarningMessageAr = `تعارض بين نوع التربة والموقع الجغرافي: قوام التربة المسجل (${soilType}) يتعارض مع الطبيعة السائدة في ${detectedRegionAr} (القوام المتوقع: ${expectedSoils.join('، ')}). يرجى التأكد من فحص قوام التربة معملياً.`;
  }

  // 1. Check if user entered a known region name that belongs to a DIFFERENT regional bounding box
  const otherRegionTyped = REGIONAL_BOUNDS.find(
    (b) =>
      b !== detectedRegionMatch &&
      b.keywords.some((kw) => cleanRegion.includes(kw) || cleanCountry.includes(kw))
  );

  if (otherRegionTyped && detectedRegionMatch) {
    const soilAlignsWithGPS = detectedRegionMatch.expectedSoils.includes(cleanSoil);
    const soilAlignsWithTyped = otherRegionTyped.expectedSoils.includes(cleanSoil);
    const soilContextEn =
      cleanSoil !== 'unknown'
        ? soilAlignsWithGPS && !soilAlignsWithTyped
          ? ` Furthermore, the recorded "${soilType}" soil texture aligns with ${detectedRegion} (${detectedRegionMatch.soilProfileDesc}) and contradicts ${otherRegionTyped.region} (${otherRegionTyped.soilProfileDesc}).`
          : !soilAlignsWithGPS && soilAlignsWithTyped
          ? ` Note: The recorded "${soilType}" soil texture aligns with ${otherRegionTyped.region} rather than the GPS coordinates in ${detectedRegion}.`
          : ''
        : '';
    const soilContextAr =
      cleanSoil !== 'unknown'
        ? soilAlignsWithGPS && !soilAlignsWithTyped
          ? ` كما أن قوام التربة المسجل (${soilType}) يتطابق مع طبيعة أراضي ${detectedRegionAr} (${detectedRegionMatch.soilProfileDescAr}) ويتناقض مع طبيعة ${otherRegionTyped.regionAr} (${otherRegionTyped.soilProfileDescAr}).`
          : !soilAlignsWithGPS && soilAlignsWithTyped
          ? ` ملاحظة: قوام التربة المسجل (${soilType}) يتوافق مع ${otherRegionTyped.regionAr} وليس مع الإحداثيات المدخلة في ${detectedRegionAr}.`
          : ''
        : '';

    return {
      detectedCountry,
      detectedCountryAr,
      detectedRegion,
      detectedRegionAr,
      isConsistent: false,
      mismatchType:
        otherRegionTyped.country !== detectedCountry ? 'country_mismatch' : 'region_mismatch',
      suggestedCountry: detectedCountry,
      suggestedRegion: detectedRegion,
      soilLocationConsistent,
      expectedSoils,
      soilWarningMessage,
      soilWarningMessageAr,
      warningMessage: `Geospatial & Governorate Mismatch: Entered location "${enteredRegion}, ${enteredCountry}" refers to ${otherRegionTyped.region} (${otherRegionTyped.country}), whereas GPS coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) are located in ${detectedRegion}, ${detectedCountry}.${soilContextEn} FieldWise has synchronized the report jurisdiction to the verified GPS location (${detectedRegion}).`,
      warningMessageAr: `تعارض جغرافي وإداري: الموقع المدخل نصياً "${enteredRegion}، ${enteredCountry}" يشير إلى ${otherRegionTyped.regionAr} (${otherRegionTyped.countryAr})، بينما الإحداثيات الجغرافية (${lat.toFixed(4)}° شمالاً، ${lng.toFixed(4)}° شرقاً) تقع فعلياً في ${detectedRegionAr} (${detectedCountryAr}).${soilContextAr} تم تصحيح ومزامنة الموقع الجغرافي في التقرير ليطابق الإحداثيات الفعلية (${detectedRegionAr}).`,
    };
  }

  // 2. Check broad country mismatch
  const countryMatches =
    cleanCountry === '' ||
    detCountryLower.includes(cleanCountry) ||
    cleanCountry.includes(detCountryLower) ||
    (cleanCountry.includes('egypt') && detCountryLower.includes('egypt')) ||
    (cleanCountry.includes('مصر') && detCountryLower.includes('egypt')) ||
    (cleanCountry.includes('tunisia') && detCountryLower.includes('tunisia')) ||
    (cleanCountry.includes('تونس') && detCountryLower.includes('tunisia')) ||
    (cleanCountry.includes('us') && detCountryLower.includes('united states'));

  if (!countryMatches && detectedCountry !== 'International Coordinates') {
    return {
      detectedCountry,
      detectedCountryAr,
      detectedRegion,
      detectedRegionAr,
      isConsistent: false,
      mismatchType: 'country_mismatch',
      suggestedCountry: detectedCountry,
      suggestedRegion: detectedRegion,
      soilLocationConsistent,
      expectedSoils,
      soilWarningMessage,
      soilWarningMessageAr,
      warningMessage: `Location Mismatch: Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) belong to ${detectedRegion}, ${detectedCountry}, which contradicts the entered country "${enteredCountry}". Report jurisdiction has been synchronized to ${detectedRegion}, ${detectedCountry}.`,
      warningMessageAr: `تعارض في بيانات الدولة: الإحداثيات المدخلة (${lat.toFixed(4)}°، ${lng.toFixed(4)}°) تقع جغرافياً في ${detectedRegionAr} (${detectedCountryAr})، بينما تم إدخال "${enteredCountry}". تم اعتماد الموقع الموثق جغرافياً.`,
    };
  }

  // 3. If coordinates & region match, check if soil texture contradicts the region
  if (!soilLocationConsistent && detectedRegionMatch) {
    return {
      detectedCountry,
      detectedCountryAr,
      detectedRegion,
      detectedRegionAr,
      isConsistent: false,
      mismatchType: 'soil_location_mismatch',
      suggestedCountry: detectedCountry,
      suggestedRegion: detectedRegion,
      soilLocationConsistent: false,
      expectedSoils,
      soilWarningMessage,
      soilWarningMessageAr,
      warningMessage: soilWarningMessage,
      warningMessageAr: soilWarningMessageAr,
    };
  }

  return {
    detectedCountry,
    detectedCountryAr,
    detectedRegion: detectedRegion || enteredRegion,
    detectedRegionAr: detectedRegionAr || enteredRegion,
    isConsistent: true,
    mismatchType: 'none',
    soilLocationConsistent: true,
    expectedSoils,
  };
}

/**
 * Standard agricultural area unit conversions
 * 1 Feddan = 4,200.83 m² = 0.420083 hectares = 1.038 acres
 * 1 Hectare = 10,000 m² = 2.3805 feddans = 2.47105 acres
 * 1 Acre = 4,046.86 m² = 0.963 feddans = 0.404686 hectares
 */
export function convertArea(
  value: number,
  fromUnit: 'feddans' | 'hectares' | 'acres',
  toUnit: 'feddans' | 'hectares' | 'acres'
): number {
  if (fromUnit === toUnit) return value;

  let sqMeters = 0;
  switch (fromUnit) {
    case 'feddans':
      sqMeters = value * 4200.83;
      break;
    case 'hectares':
      sqMeters = value * 10000;
      break;
    case 'acres':
      sqMeters = value * 4046.86;
      break;
  }

  switch (toUnit) {
    case 'feddans':
      return parseFloat((sqMeters / 4200.83).toFixed(2));
    case 'hectares':
      return parseFloat((sqMeters / 10000).toFixed(2));
    case 'acres':
      return parseFloat((sqMeters / 4046.86).toFixed(2));
  }
}

export interface EgyptGovernorate {
  id: string;
  nameEn: string;
  nameAr: string;
  regionValue: string;
  zoneEn: string;
  zoneAr: string;
  lat: number;
  lng: number;
  defaultSoil: 'clay' | 'clay-loam' | 'loam' | 'sandy-loam' | 'sand';
  expectedSoils: string[];
}

// Complete Official List of All 27 Governorates of Egypt with Representative Agricultural Coordinates
export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  // Suez Canal & Sinai (5)
  {
    id: 'ismailia',
    nameEn: 'Ismailia',
    nameAr: 'الإسماعيلية',
    regionValue: 'Ismailia Governorate / Suez Canal',
    zoneEn: 'Suez Canal & East Delta Reclamation',
    zoneAr: 'إقليم قناة السويس وشرق الدلتا',
    lat: 30.8268,
    lng: 32.3245,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'sandy-loam', 'sand'],
  },
  {
    id: 'port_said',
    nameEn: 'Port Said',
    nameAr: 'بورسعيد',
    regionValue: 'Port Said Governorate (East Port Said /Tina Plain)',
    zoneEn: 'Suez Canal & Northern Coast',
    zoneAr: 'إقليم قناة السويس وسهل الطينة',
    lat: 31.2653,
    lng: 32.3019,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'sandy-loam', 'sand'],
  },
  {
    id: 'suez',
    nameEn: 'Suez',
    nameAr: 'السويس',
    regionValue: 'Suez Governorate',
    zoneEn: 'Suez Canal Zone',
    zoneAr: 'إقليم قناة السويس',
    lat: 29.9668,
    lng: 32.5498,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'sand', 'loam'],
  },
  {
    id: 'north_sinai',
    nameEn: 'North Sinai',
    nameAr: 'شمال سيناء',
    regionValue: 'North Sinai Governorate (Al-Arish / Sheikh Zuweid)',
    zoneEn: 'Sinai Peninsula',
    zoneAr: 'شبه جزيرة سيناء',
    lat: 31.1321,
    lng: 33.8033,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'sand', 'loam'],
  },
  {
    id: 'south_sinai',
    nameEn: 'South Sinai',
    nameAr: 'جنوب سيناء',
    regionValue: 'South Sinai Governorate (El-Tor / Ras Sudr)',
    zoneEn: 'Sinai Peninsula',
    zoneAr: 'شبه جزيرة سيناء',
    lat: 28.2417,
    lng: 33.617,
    defaultSoil: 'sand',
    expectedSoils: ['sand', 'sandy-loam'],
  },

  // Nile Delta & Alexandria (8)
  {
    id: 'kafr_el_sheikh',
    nameEn: 'Kafr El Sheikh',
    nameAr: 'كفر الشيخ',
    regionValue: 'Kafr El Sheikh Governorate (Northern Nile Delta)',
    zoneEn: 'Northern Nile Delta',
    zoneAr: 'شمال دلتا النيل',
    lat: 31.1107,
    lng: 30.9388,
    defaultSoil: 'clay',
    expectedSoils: ['clay', 'clay-loam', 'loam'],
  },
  {
    id: 'dakahlia',
    nameEn: 'Dakahlia',
    nameAr: 'الدقهلية',
    regionValue: 'Dakahlia Governorate (Mansoura / Central-East Delta)',
    zoneEn: 'Eastern Nile Delta',
    zoneAr: 'شرق ووسط دلتا النيل',
    lat: 31.0409,
    lng: 31.3785,
    defaultSoil: 'clay',
    expectedSoils: ['clay', 'clay-loam', 'loam'],
  },
  {
    id: 'gharbia',
    nameEn: 'Gharbia',
    nameAr: 'الغربية',
    regionValue: 'Gharbia Governorate (Tanta / Central Nile Delta)',
    zoneEn: 'Central Nile Delta',
    zoneAr: 'وسط دلتا النيل',
    lat: 30.7865,
    lng: 31.0004,
    defaultSoil: 'clay',
    expectedSoils: ['clay', 'clay-loam', 'loam'],
  },
  {
    id: 'monufia',
    nameEn: 'Monufia',
    nameAr: 'المنوفية',
    regionValue: 'Monufia Governorate (Shibin El-Kom / Southern Delta)',
    zoneEn: 'Southern Nile Delta',
    zoneAr: 'جنوب دلتا النيل',
    lat: 30.5972,
    lng: 30.9876,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'sharqia',
    nameEn: 'Sharqia',
    nameAr: 'الشرقية',
    regionValue: 'Sharqia Governorate (Zagazig / Salhia)',
    zoneEn: 'Eastern Nile Delta',
    zoneAr: 'شرق دلتا النيل',
    lat: 30.5877,
    lng: 31.502,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'beheira',
    nameEn: 'Beheira',
    nameAr: 'البحيرة',
    regionValue: 'Beheira Governorate (Damanhour / Nubaria)',
    zoneEn: 'Western Nile Delta',
    zoneAr: 'غرب دلتا النيل والنوبارية',
    lat: 30.8481,
    lng: 30.3436,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'loam', 'clay-loam', 'clay', 'sand'],
  },
  {
    id: 'damietta',
    nameEn: 'Damietta',
    nameAr: 'دمياط',
    regionValue: 'Damietta Governorate (Northern Delta Coast)',
    zoneEn: 'Northern Nile Delta',
    zoneAr: 'شمال الدلتا والساحل',
    lat: 31.4175,
    lng: 31.8144,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay', 'clay-loam', 'loam', 'sandy-loam'],
  },
  {
    id: 'alexandria',
    nameEn: 'Alexandria',
    nameAr: 'الإسكندرية',
    regionValue: 'Alexandria Governorate (Amreya / Borg El Arab)',
    zoneEn: 'Western Delta & Mediterranean Coast',
    zoneAr: 'الساحل الشمالي وغرب الدلتا',
    lat: 31.2001,
    lng: 29.9187,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'loam', 'clay-loam', 'sand'],
  },

  // Greater Cairo (3)
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    regionValue: 'Cairo Governorate',
    zoneEn: 'Greater Cairo',
    zoneAr: 'القاهرة الكبرى',
    lat: 30.0444,
    lng: 31.2357,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'sandy-loam', 'clay-loam'],
  },
  {
    id: 'giza',
    nameEn: 'Giza',
    nameAr: 'الجيزة',
    regionValue: 'Giza Governorate (Nile Valley & Bahariya Oasis)',
    zoneEn: 'Greater Cairo & Giza Valley',
    zoneAr: 'الجيزة والواحات البحرية',
    lat: 29.987,
    lng: 31.2118,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'clay-loam', 'sandy-loam', 'sand'],
  },
  {
    id: 'qalyubia',
    nameEn: 'Qalyubia',
    nameAr: 'القليوبية',
    regionValue: 'Qalyubia Governorate (Banha / Qaha)',
    zoneEn: 'Greater Cairo & Southern Delta',
    zoneAr: 'القليوبية وجنوب الدلتا',
    lat: 30.466,
    lng: 31.1848,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay'],
  },

  // Faiyum & Middle Egypt (3)
  {
    id: 'faiyum',
    nameEn: 'Faiyum',
    nameAr: 'الفيوم',
    regionValue: 'Faiyum Governorate (Faiyum Oasis Depression)',
    zoneEn: 'Middle Egypt & Faiyum Depression',
    zoneAr: 'منخفض الفيوم وشمال الصعيد',
    lat: 29.3084,
    lng: 30.8428,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'beni_suef',
    nameEn: 'Beni Suef',
    nameAr: 'بني سويف',
    regionValue: 'Beni Suef Governorate (Middle Egypt Nile Valley)',
    zoneEn: 'Middle Egypt',
    zoneAr: 'شمال الصعيد ووادي النيل',
    lat: 29.0661,
    lng: 31.0994,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'minya',
    nameEn: 'Minya',
    nameAr: 'المنيا',
    regionValue: 'Minya Governorate (West Minya & Nile Valley)',
    zoneEn: 'Middle Egypt',
    zoneAr: 'المنيا ووادي النيل',
    lat: 28.1099,
    lng: 30.7503,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'clay-loam', 'sandy-loam', 'clay'],
  },

  // Upper Egypt (5)
  {
    id: 'asyut',
    nameEn: 'Asyut',
    nameAr: 'أسيوط',
    regionValue: 'Asyut Governorate (Upper Egypt Nile Valley)',
    zoneEn: 'Upper Egypt',
    zoneAr: 'وسط الصعيد ووادي النيل',
    lat: 27.1783,
    lng: 31.1859,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'sohag',
    nameEn: 'Sohag',
    nameAr: 'سوهاج',
    regionValue: 'Sohag Governorate (Upper Egypt Nile Valley)',
    zoneEn: 'Upper Egypt',
    zoneAr: 'جنوب الصعيد ووادي النيل',
    lat: 26.5591,
    lng: 31.6957,
    defaultSoil: 'clay-loam',
    expectedSoils: ['clay-loam', 'loam', 'clay', 'sandy-loam'],
  },
  {
    id: 'qena',
    nameEn: 'Qena',
    nameAr: 'قنا',
    regionValue: 'Qena Governorate (Upper Egypt / Al-Marashda)',
    zoneEn: 'Upper Egypt',
    zoneAr: 'جنوب الصعيد ووادي النيل',
    lat: 26.1551,
    lng: 32.716,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'clay-loam', 'sandy-loam', 'clay'],
  },
  {
    id: 'luxor',
    nameEn: 'Luxor',
    nameAr: 'الأقصر',
    regionValue: 'Luxor Governorate (Esna / Armant)',
    zoneEn: 'Upper Egypt',
    zoneAr: 'جنوب الصعيد والأقصر',
    lat: 25.6872,
    lng: 32.6396,
    defaultSoil: 'loam',
    expectedSoils: ['loam', 'clay-loam', 'sandy-loam'],
  },
  {
    id: 'aswan',
    nameEn: 'Aswan',
    nameAr: 'أسوان',
    regionValue: 'Aswan Governorate (Kom Ombo / Edfu / Toshka)',
    zoneEn: 'Southern Upper Egypt',
    zoneAr: 'أقصى جنوب الصعيد وأسوان',
    lat: 24.0889,
    lng: 32.8998,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'loam', 'clay-loam', 'sand'],
  },

  // Frontier & Desert Governorates (3)
  {
    id: 'new_valley',
    nameEn: 'New Valley',
    nameAr: 'الوادي الجديد',
    regionValue: 'New Valley Governorate (Kharga / Dakhla / Farafra / East Oweinat)',
    zoneEn: 'Western Desert Oases',
    zoneAr: 'الوادي الجديد والواحات والعوينات',
    lat: 25.439,
    lng: 30.5586,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'sand', 'loam'],
  },
  {
    id: 'matrouh',
    nameEn: 'Matrouh',
    nameAr: 'مطروح',
    regionValue: 'Matrouh Governorate (North Coast / Hammam / Siwa Oasis)',
    zoneEn: 'Northwestern Coast & Siwa',
    zoneAr: 'الساحل الشمالي الغربي وواحة سيوة',
    lat: 31.3543,
    lng: 27.2373,
    defaultSoil: 'sandy-loam',
    expectedSoils: ['sandy-loam', 'sand', 'loam'],
  },
  {
    id: 'red_sea',
    nameEn: 'Red Sea',
    nameAr: 'البحر الأحمر',
    regionValue: 'Red Sea Governorate (Eastern Desert & Coastal Wadis)',
    zoneEn: 'Eastern Desert & Red Sea',
    zoneAr: 'البحر الأحمر وأودية الصحراء الشرقية',
    lat: 27.2579,
    lng: 33.8116,
    defaultSoil: 'sand',
    expectedSoils: ['sand', 'sandy-loam'],
  },
];

/**
 * Finds the nearest Egyptian governorate to a given (lat, lng) if within Egypt's bounds.
 */
export function findNearestEgyptGovernorate(lat: number, lng: number): EgyptGovernorate | null {
  if (lat < 21.8 || lat > 31.9 || lng < 24.5 || lng > 37.0) {
    return null;
  }
  let closest = EGYPT_GOVERNORATES[0];
  let minDistSq = Infinity;
  for (const gov of EGYPT_GOVERNORATES) {
    const dLat = lat - gov.lat;
    const dLng = lng - gov.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closest = gov;
    }
  }
  return closest;
}

/**
 * Returns formatted dual area representation (e.g., "25 feddans (≈ 10.5 ha)")
 */
export function formatDualArea(
  value: number,
  unit: 'feddans' | 'hectares' | 'acres',
  isAr = false
): string {
  if (unit === 'feddans') {
    const ha = convertArea(value, 'feddans', 'hectares');
    return isAr ? `${value} فدان (≈ ${ha} هكتار)` : `${value} feddans (≈ ${ha} ha)`;
  }
  if (unit === 'hectares') {
    const fed = convertArea(value, 'hectares', 'feddans');
    return isAr ? `${value} هكتار (≈ ${fed} فدان)` : `${value} hectares (≈ ${fed} feddans)`;
  }
  const ha = convertArea(value, 'acres', 'hectares');
  return isAr ? `${value} فدان أمريكي/أكر (≈ ${ha} هكتار)` : `${value} acres (≈ ${ha} ha)`;
}
