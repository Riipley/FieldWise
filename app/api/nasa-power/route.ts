import { NextRequest, NextResponse } from 'next/server';
import { fetchNasaPowerData, getDemoClimateData } from '@/lib/nasa-power';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const lat = latParam ? parseFloat(latParam) : 37.27;
  const lng = lngParam ? parseFloat(lngParam) : 9.87;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Invalid coordinates provided' },
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
