import type { GeoValidationResult } from './geo-validator';

export interface FarmProfile {
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  area: number;
  areaUnit: 'hectares' | 'acres' | 'feddans';
  currentCrops: string[];
  soilType: string;
  soilPH: string;
  organicMatter: string;
  irrigationMethod: string;
  waterAvailability: 'abundant' | 'adequate' | 'limited' | 'scarce';
  priorities: string[];
  geoValidation?: GeoValidationResult;
}

export interface NasaClimateData {
  source: 'nasa_power' | 'demonstration';
  retrievedAt: string;
  spatialResolution: string; // e.g. "~0.5° × 0.5° (~50 km) MERRA-2 / GEOS-5 Gridded Reanalysis"
  datasetPeriod: string;     // e.g. "2001–2020 20-Year Climatology Baseline"
  location: { lat: number; lng: number };
  period: { start: string; end: string };
  annual: {
    meanTemp: number;       // T2M annual climatological mean °C
    maxTemp: number;        // T2M_MAX warmest month mean °C
    minTemp: number;        // T2M_MIN coldest month mean °C
    totalPrecip: number;    // PRECTOTCORR annual cumulative precipitation mm
    meanHumidity: number;   // RH2M annual climatological mean %
    meanSolarRad: number;   // ALLSKY_SFC_SW_DWN annual mean daily insolation MJ/m²/day
    annualDeficitMm?: number; // Precipitation minus Potential Evapotranspiration
  };
  monthly: MonthlyData[];
}

export interface MonthlyData {
  month: string;        // "Jan", "Feb", etc.
  monthNum: number;     // 1-12
  meanTemp: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  humidity: number;
  solarRad: number;
}

export interface CropInfo {
  id: string;
  name: string;
  arabicName: string;
  scientificName: string;
  category: 'field_crop' | 'horticultural';
  family: string;
  familyAr: string;
  season: string;
  seasonCategory: 'winter' | 'summer' | 'autumn_nili';
  plantingMonths: number[];  // 1-12
  harvestMonths: number[];   // 1-12
  economicValue: 'high' | 'medium' | 'staple';
  tempMin: number;
  tempOptMin: number;
  tempOptMax: number;
  tempMax: number;
  waterDemand: 'low' | 'medium' | 'high' | 'very_high';
  annualWaterMm: number;
  growingDays: number;
  landPrepWeeks: number;
  nitrogenFixation: boolean;
  nitrogenContribution: 'negative' | 'neutral' | 'low' | 'medium' | 'high';
  bnfData?: {
    totalMinKgHa: number;
    totalMaxKgHa: number;
    residualMinKgHa: number;
    residualMaxKgHa: number;
  };
  rootType: string;
  rootTypeAr: string;
  soilPreferences: string[];
  minPH: number;
  maxPH: number;
  salinityToleranceDsM: number;
  pests: string[];
  diseases: string[];
  disruptedPathogens: string[];
  disruptedPathogensAr: string[];
  compatibleAfter: string[];
  incompatibleAfter: string[];
  minimumBreakYears: number; // e.g. Solanaceae 3-4 years
  scientificReferences: string[];
  notes: string;
  notesAr: string;
}

export interface RotationTimelineSlot {
  year: number; // 1, 2, 3
  season: 'winter' | 'summer' | 'autumn_nili';
  seasonName: string;
  seasonNameAr: string;
  cropId: string;
  cropName: string;
  cropNameAr: string;
  family: string;
  familyAr: string;
  plantingWindow: string;
  plantingWindowAr: string;
  harvestWindow: string;
  harvestWindowAr: string;
  durationDays: number;
  landPrepWeeks: number;
  waterDemandMm: number;
  waterPeakPeriod: string;
  waterPeakPeriodAr: string;
}

export interface DimensionEvaluation {
  key: string;
  name: string;
  nameAr: string;
  score: number;         // 0-100
  weight: number;        // e.g. 0.15
  contribution: number;  // score * weight (0-15)
  justification: string;
  justificationAr: string;
}

export interface BiologicalNitrogenAnalysis {
  totalBnfRangeKgHa: string;
  residualAvailableKgHa: string;
  uncertaintyRange: string;
  uncertaintyRangeAr: string;
  limitingFactors: string[];
  limitingFactorsAr: string[];
}

export interface PestManagementAnalysis {
  disruptedPathogens: string[];
  disruptedPathogensAr: string[];
  residualRisks: string[];
  residualRisksAr: string[];
  rotationIntervalNote: string;
  rotationIntervalNoteAr: string;
}

export interface ConfidenceAssessment {
  score: number; // 0-100
  rating: 'High' | 'Moderate' | 'Preliminary';
  ratingAr: 'عالية' | 'متوسطة' | 'أولية';
  penalties: string[];
  penaltiesAr: string[];
}

export interface RotationStrategy {
  id: string;
  name: string;
  nameAr: string;
  label: 'current' | 'food_security' | 'horticultural' | 'water_efficient' | 'diversified';
  objective: string;
  objectiveAr: string;
  timeline: RotationTimelineSlot[];
  sequence: string[];
  sequenceAr: string[];
  description: string;
  descriptionAr: string;
  suitabilityScore: number;         // 0-100
  confidence: ConfidenceAssessment;
  scores: {
    climateSuitability: number;     // 0-100
    waterBalance: number;           // 0-100
    soilHealth: number;             // 0-100
    nitrogenBalance: number;        // 0-100
    pestDiversity: number;          // 0-100
    cropDiversity?: number;         // legacy compatibility
    economicProfitability: number;  // 0-100
    calendarFeasibility: number;    // 0-100
    sustainability: number;         // 0-100
  };
  dimensionBreakdown: DimensionEvaluation[];
  nitrogenAnalysis?: BiologicalNitrogenAnalysis;
  pestAnalysis?: PestManagementAnalysis;
  soilAmendmentAdvice?: {
    phConstraint: string;
    phConstraintAr: string;
    recommendedAction: string;
    recommendedActionAr: string;
  };
  advantages: string[];
  advantagesAr: string[];
  disadvantages: string[];
  disadvantagesAr: string[];
  risks: string[];
  risksAr: string[];
  explanation: string;
  explanationAr: string;
  dataLimitations: string[];
  dataLimitationsAr: string[];
}

export interface RegionalFamousCrop {
  crop: CropInfo;
  reason: string;
  reasonAr: string;
  popularityScore: number; // 0-100
}

export interface SeasonalPlantingCrop {
  crop: CropInfo;
  status: 'plant_now' | 'upcoming';
  seasonName: string;
  seasonNameAr: string;
  matchScore: number; // 0-100
  reason: string;
  reasonAr: string;
}

export interface RecommendationResult {
  farmProfile: FarmProfile;
  climateData: NasaClimateData;
  geoValidation: GeoValidationResult;
  strategies: RotationStrategy[];
  currentMonth: number;
  currentMonthName: string;
  regionalFamousCrops: RegionalFamousCrop[];
  seasonalPlantingCrops: SeasonalPlantingCrop[];
  generatedAt: string;
  engineVersion: string;
  disclaimer: string;
}
