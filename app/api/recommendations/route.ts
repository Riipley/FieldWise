import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { DEFAULT_FARM_PROFILE } from '@/lib/farm-store';
import { getDemoClimateData } from '@/lib/nasa-power';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const farm = body.farm || DEFAULT_FARM_PROFILE;
    const climate = body.climate || getDemoClimateData(farm.lat, farm.lng);

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
