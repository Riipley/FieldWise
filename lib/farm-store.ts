import type { FarmProfile, NasaClimateData, RecommendationResult } from './types';

export const FARM_PROFILE_KEY = 'fieldwise_farm_profile';
export const CLIMATE_DATA_KEY = 'fieldwise_climate_data';
export const RECOMMENDATIONS_KEY = 'fieldwise_recommendations';

export const DEFAULT_FARM_PROFILE: FarmProfile = {
  name: 'Ismailia Reclaimed Farm',
  country: 'Egypt',
  region: 'Ismailia Governorate / Suez Canal',
  lat: 30.8268,
  lng: 32.3245,
  area: 5,
  areaUnit: 'feddans',
  currentCrops: ['Maize', 'Wheat'],
  soilType: 'loam',
  soilPH: 'neutral',
  organicMatter: 'medium',
  irrigationMethod: 'flood',
  waterAvailability: 'scarce',
  priorities: ['disease resistance', 'water conservation', 'soil health', 'climate resilience', 'yield stability', 'low input costs'],
};

export const PRESET_FARMS: Record<string, FarmProfile> = {
  ismailia_egypt: {
    name: 'Ismailia Reclaimed Farm',
    country: 'Egypt',
    region: 'Ismailia Governorate / Suez Canal',
    lat: 30.8268,
    lng: 32.3245,
    area: 5,
    areaUnit: 'feddans',
    currentCrops: ['Maize', 'Wheat'],
    soilType: 'loam',
    soilPH: 'neutral',
    organicMatter: 'medium',
    irrigationMethod: 'flood',
    waterAvailability: 'scarce',
    priorities: ['disease resistance', 'water conservation', 'soil health', 'climate resilience', 'yield stability', 'low input costs'],
  },
  mediterranean_tunisia: {
    name: 'Bizerte Coastal Valley Farm',
    country: 'Tunisia',
    region: 'Bizerte',
    lat: 37.27,
    lng: 9.87,
    area: 30,
    areaUnit: 'hectares',
    currentCrops: ['Wheat', 'Faba Bean'],
    soilType: 'clay-loam',
    soilPH: 'neutral',
    organicMatter: 'medium',
    irrigationMethod: 'rainfed',
    waterAvailability: 'limited',
    priorities: ['soil health', 'water conservation'],
  },
  nile_delta: {
    name: 'Kafr El Sheikh Nile Alluvial Farm',
    country: 'Egypt',
    region: 'Kafr El Sheikh (Nile Delta)',
    lat: 31.11,
    lng: 30.94,
    area: 15,
    areaUnit: 'feddans',
    currentCrops: ['Wheat', 'Maize'],
    soilType: 'clay',
    soilPH: 'alkaline',
    organicMatter: 'high',
    irrigationMethod: 'flood',
    waterAvailability: 'adequate',
    priorities: ['yield stability', 'low input costs'],
  },
  midwest_us: {
    name: 'Prairie Ridge Farm',
    country: 'United States',
    region: 'Iowa',
    lat: 42.03,
    lng: -93.63,
    area: 120,
    areaUnit: 'acres',
    currentCrops: ['Maize', 'Soybean'],
    soilType: 'loam',
    soilPH: 'neutral',
    organicMatter: 'high',
    irrigationMethod: 'rainfed',
    waterAvailability: 'adequate',
    priorities: ['soil health', 'disease resistance'],
  },
};

export function saveFarmProfile(farm: FarmProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FARM_PROFILE_KEY, JSON.stringify(farm));
  } catch (e) {
    console.error('Failed to save farm profile to localStorage', e);
  }
}

export function loadFarmProfile(): FarmProfile {
  if (typeof window === 'undefined') return DEFAULT_FARM_PROFILE;
  try {
    const item = localStorage.getItem(FARM_PROFILE_KEY);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Failed to load farm profile', e);
  }
  return DEFAULT_FARM_PROFILE;
}

export function saveClimateData(data: NasaClimateData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIMATE_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save climate data', e);
  }
}

export function loadClimateData(): NasaClimateData | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(CLIMATE_DATA_KEY);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Failed to load climate data', e);
  }
  return null;
}

export function saveRecommendations(result: RecommendationResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save recommendations', e);
  }
}

export function loadRecommendations(): RecommendationResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(RECOMMENDATIONS_KEY);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Failed to load recommendations', e);
  }
  return null;
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FARM_PROFILE_KEY);
  localStorage.removeItem(CLIMATE_DATA_KEY);
  localStorage.removeItem(RECOMMENDATIONS_KEY);
}
