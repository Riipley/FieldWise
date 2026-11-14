import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { DEFAULT_FARM_PROFILE } from '@/lib/farm-store';
import { getDemoClimateData, isValidCoordinatePair } from '@/lib/nasa-power';
import type { FarmProfile, NasaClimateData } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON in request body.' },
      { status: 400 }
    );
  }

  try {
    const farmCandidate = body.farm ?? body.farmProfile;
    const rawFarm = (farmCandidate && typeof farmCandidate === 'object' && !Array.isArray(farmCandidate))
      ? (farmCandidate as Partial<FarmProfile>)
      : {};

    const lat = rawFarm.lat !== undefined ? Number(rawFarm.lat) : DEFAULT_FARM_PROFILE.lat;
    const lng = rawFarm.lng !== undefined ? Number(rawFarm.lng) : DEFAULT_FARM_PROFILE.lng;

    if (!isValidCoordinatePair(lat, lng)) {
      return NextResponse.json(
        { error: 'Invalid farm coordinates. Latitude must be within [-90, 90] and Longitude within [-180, 180].' },
        { status: 400 }
      );
    }

    const area = rawFarm.area !== undefined ? Number(rawFarm.area) : DEFAULT_FARM_PROFILE.area;
    if (!Number.isFinite(area) || area <= 0 || area > 1000000) {
      return NextResponse.json(
        { error: 'Invalid farm area. Area must be a positive number between 0.1 and 1,000,000.' },
        { status: 400 }
      );
    }

    const validUnits = ['feddans', 'hectares', 'acres'] as const;
    const areaUnit = validUnits.includes(rawFarm.areaUnit as typeof validUnits[number])
      ? (rawFarm.areaUnit as FarmProfile['areaUnit'])
      : DEFAULT_FARM_PROFILE.areaUnit;

    const validWaterAvail = ['abundant', 'adequate', 'limited', 'scarce'] as const;
    const waterAvailability = validWaterAvail.includes(rawFarm.waterAvailability as typeof validWaterAvail[number])
      ? (rawFarm.waterAvailability as FarmProfile['waterAvailability'])
      : DEFAULT_FARM_PROFILE.waterAvailability;

    const farm: FarmProfile = {
      name: typeof rawFarm.name === 'string' && rawFarm.name.trim() ? rawFarm.name.trim().slice(0, 120) : DEFAULT_FARM_PROFILE.name,
      country: typeof rawFarm.country === 'string' && rawFarm.country.trim() ? rawFarm.country.trim().slice(0, 80) : DEFAULT_FARM_PROFILE.country,
      region: typeof rawFarm.region === 'string' && rawFarm.region.trim() ? rawFarm.region.trim().slice(0, 120) : DEFAULT_FARM_PROFILE.region,
      lat,
      lng,
      area,
      areaUnit,
      currentCrops: Array.isArray(rawFarm.currentCrops)
        ? rawFarm.currentCrops.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 6)
        : DEFAULT_FARM_PROFILE.currentCrops,
      soilType: typeof rawFarm.soilType === 'string' && rawFarm.soilType.trim() ? rawFarm.soilType.trim() : 'unknown',
      soilPH: typeof rawFarm.soilPH === 'string' && rawFarm.soilPH.trim() ? rawFarm.soilPH.trim() : 'unknown',
      organicMatter: typeof rawFarm.organicMatter === 'string' && rawFarm.organicMatter.trim() ? rawFarm.organicMatter.trim() : 'unknown',
      irrigationMethod: typeof rawFarm.irrigationMethod === 'string' && rawFarm.irrigationMethod.trim() ? rawFarm.irrigationMethod.trim() : DEFAULT_FARM_PROFILE.irrigationMethod,
      waterAvailability,
      priorities: Array.isArray(rawFarm.priorities)
        ? rawFarm.priorities.filter((p): p is string => typeof p === 'string')
        : DEFAULT_FARM_PROFILE.priorities,
    };

    const rawClimate = (body.climate ?? body.climateData) as NasaClimateData | undefined;
    const climate =
      rawClimate &&
      typeof rawClimate === 'object' &&
      rawClimate.annual &&
      typeof rawClimate.annual.meanTemp === 'number' &&
      Array.isArray(rawClimate.monthly) &&
      rawClimate.monthly.length === 12
        ? rawClimate
        : getDemoClimateData(farm.lat, farm.lng);

    const result = generateRecommendations(farm, climate);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to process recommendation engine' },
      { status: 500 }
    );
  }
}
