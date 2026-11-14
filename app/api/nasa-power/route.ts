import { NextRequest, NextResponse } from 'next/server';
import { fetchNasaPowerData, getDemoClimateData, isValidCoordinatePair } from '@/lib/nasa-power';
import { DEFAULT_FARM_PROFILE } from '@/lib/farm-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // If query params are explicitly provided as empty strings or invalid numbers, reject with 400
  if ((latParam !== null && latParam.trim() === '') || (lngParam !== null && lngParam.trim() === '')) {
    return NextResponse.json(
      { error: 'Empty coordinate parameter provided. Expected numeric lat (-90..90) and lng (-180..180).' },
      { status: 400 }
    );
  }

  const lat = latParam !== null ? Number(latParam) : DEFAULT_FARM_PROFILE.lat;
  const lng = lngParam !== null ? Number(lngParam) : DEFAULT_FARM_PROFILE.lng;

  if (!isValidCoordinatePair(lat, lng)) {
    return NextResponse.json(
      { error: 'Invalid coordinates provided. Latitude must be between -90 and 90, and Longitude between -180 and 180.' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchNasaPowerData(lat, lng);
    return NextResponse.json(data);
  } catch (error) {
    console.warn('NASA POWER API failed, returning demonstration data fallback:', error);
    const demoData = getDemoClimateData(lat, lng);
    return NextResponse.json(demoData);
  }
}
