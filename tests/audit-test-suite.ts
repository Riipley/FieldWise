/**
 * FieldWise — Comprehensive End-to-End Automated Test Suite
 * Covers:
 * 1. Crop Database Integrity & Scientific Consistency (13 crops)
 * 2. Geospatial & 27-Governorate Validator + Soil-Location Contradictions
 * 3. NASA POWER API Client, Unit Handling, Falsiness Safety & Fallback Calibration
 * 4. 8-Dimension Agricultural Recommendation Engine (Benchmark + Dynamic Sensitivity)
 * 5. Live HTTP API Endpoints (/api/nasa-power, /api/recommendations) & Edge Cases
 * 6. End-to-End Frontend Route Verification (/, /farm, /dashboard, /recommendations, /report)
 */

import { CROPS, findCropByName, getCropById } from '../lib/crop-database';
import {
  validateCoordinates,
  convertArea,
  EGYPT_GOVERNORATES,
  findNearestEgyptGovernorate,
} from '../lib/geo-validator';
import {
  isValidCoordinatePair,
  isValidNasaValue,
  getDemoClimateData,
  fetchNasaPowerData,
} from '../lib/nasa-power';
import { generateRecommendations } from '../lib/recommendation-engine';
import { DEFAULT_FARM_PROFILE } from '../lib/farm-store';
import type { FarmProfile } from '../lib/types';

interface TestOutcome {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestOutcome[] = [];

function runTest(id: string, category: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ id, category, name, passed: true });
    console.log(`✅ [${id}] ${category}: ${name}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ id, category, name, passed: false, details: message });
    console.error(`❌ [${id}] ${category}: ${name} -> ${message}`);
  }
}

async function runAsyncTest(
  id: string,
  category: string,
  name: string,
  fn: () => Promise<void>
) {
  try {
    await fn();
    results.push({ id, category, name, passed: true });
    console.log(`✅ [${id}] ${category}: ${name}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ id, category, name, passed: false, details: message });
    console.error(`❌ [${id}] ${category}: ${name} -> ${message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log('================================================================');
  console.log('FieldWise Full-Stack & Agricultural Logic Audit Test Suite');
  console.log('================================================================\n');

  // =========================================================================
  // 1. CROP DATABASE TESTS
  // =========================================================================
  runTest('CROP-01', 'Crop Database', 'Contains all 13 calibrated crops with complete metadata', () => {
    assert(CROPS.length === 13, `Expected 13 crops, got ${CROPS.length}`);
    for (const crop of CROPS) {
      assert(Boolean(crop.id && crop.name && crop.arabicName), `Missing name/id on ${crop.id}`);
      assert(Boolean(crop.scientificName && crop.scientificName.includes(' ')), `Missing binomial scientificName on ${crop.id}`);
      assert(Array.isArray(crop.scientificReferences) && crop.scientificReferences.length >= 2, `Missing scientificReferences on ${crop.id}`);
      assert(crop.plantingMonths.length > 0 && crop.harvestMonths.length > 0 && crop.growingDays > 0, `Missing phenology on ${crop.id}`);
      assert(crop.compatibleAfter.length > 0 && crop.incompatibleAfter.length > 0, `Missing rotation rules on ${crop.id}`);
      assert(crop.pests.length > 0 && crop.diseases.length > 0, `Missing pests/diseases on ${crop.id}`);
    }
  });

  runTest('CROP-02', 'Crop Database', 'Temperature thresholds follow strict cardinal ordering (tempMin < tempOptMin < tempOptMax < tempMax)', () => {
    for (const crop of CROPS) {
      assert(
        crop.tempMin < crop.tempOptMin &&
          crop.tempOptMin < crop.tempOptMax &&
          crop.tempOptMax < crop.tempMax,
        `Invalid cardinal temperatures for ${crop.name}: [${crop.tempMin}, ${crop.tempOptMin}, ${crop.tempOptMax}, ${crop.tempMax}]`
      );
    }
  });

  runTest('CROP-03', 'Crop Database', 'Soil pH and FAO-56 ECe salinity thresholds are consistent across all crops', () => {
    for (const crop of CROPS) {
      assert(crop.minPH >= 4.0 && crop.maxPH <= 9.0 && crop.minPH < crop.maxPH, `Invalid pH range for ${crop.name}`);
      assert(crop.salinityToleranceDsM > 0 && crop.salinityToleranceDsM <= 12, `Invalid ECe for ${crop.name}`);
      assert(crop.annualWaterMm >= 200 && crop.annualWaterMm <= 1200, `Invalid ETc for ${crop.name}`);
    }
    assert(getCropById('onion')?.salinityToleranceDsM === 1.2, 'Onion ECe must be 1.2 dS/m (FAO-56 Table 22)');
    assert(getCropById('potato')?.salinityToleranceDsM === 1.7, 'Potato ECe must be 1.7 dS/m (FAO-56 Table 22)');
    assert(getCropById('faba_bean')?.salinityToleranceDsM === 1.6, 'Faba Bean ECe must be 1.6 dS/m');
    assert(getCropById('sorghum')?.salinityToleranceDsM === 6.8, 'Sorghum ECe must be 6.8 dS/m');
  });

  runTest('CROP-04', 'Crop Database', 'Legume BNF total fixation vs net residual credit separation is scientifically valid', () => {
    for (const crop of CROPS) {
      if (crop.nitrogenFixation) {
        assert(crop.family === 'Fabaceae', `Fixer crop ${crop.name} must belong to Fabaceae`);
        assert(
          Boolean(crop.bnfData) &&
            crop.bnfData!.totalMinKgHa > 0 &&
            crop.bnfData!.residualMinKgHa > 0 &&
            crop.bnfData!.residualMaxKgHa < crop.bnfData!.totalMaxKgHa,
          `Invalid BNF split for ${crop.name}`
        );
      } else {
        assert(!crop.bnfData, `Non-fixer ${crop.name} should not define positive bnfData`);
      }
    }
  });

  runTest('CROP-05', 'Crop Database', 'Lookup by English, Arabic, and fuzzy crop names works accurately', () => {
    assert(findCropByName('Wheat')?.id === 'wheat', 'English lookup failed');
    assert(findCropByName('القمح')?.id === 'wheat', 'Arabic lookup failed');
    assert(findCropByName('Faba Bean')?.id === 'faba_bean', 'Faba Bean lookup failed');
    assert(findCropByName('NonExistentCropXYZ') === undefined, 'Unknown crop should return undefined');
  });

  // =========================================================================
  // 2. GEOSPATIAL & SOIL VALIDATOR TESTS
  // =========================================================================
  runTest('GEO-01', 'Geospatial Validator', 'All 27 Egyptian governorates exist with valid GPS coordinates', () => {
    assert(EGYPT_GOVERNORATES.length === 27, `Expected 27 governorates, got ${EGYPT_GOVERNORATES.length}`);
    const ids = new Set(EGYPT_GOVERNORATES.map((g) => g.id));
    assert(ids.size === 27, 'Governorate IDs must be unique');
    for (const gov of EGYPT_GOVERNORATES) {
      assert(gov.lat >= 22.0 && gov.lat <= 31.8, `Invalid latitude for ${gov.nameEn}`);
      assert(gov.lng >= 25.0 && gov.lng <= 36.0, `Invalid longitude for ${gov.nameEn}`);
    }
  });

  runTest('GEO-02', 'Geospatial Validator', 'Resolves Ismailia coordinates (30.8268, 32.3245) and validates consistency', () => {
    const nearest = findNearestEgyptGovernorate(30.8268, 32.3245);
    assert(nearest?.id === 'ismailia', `Expected ismailia, got ${nearest?.id}`);
    const check = validateCoordinates(30.8268, 32.3245, 'Egypt', 'Ismailia Governorate / Suez Canal', 'loam');
    assert(check.isConsistent === true, 'Ismailia coordinates should be consistent');
    assert(check.soilLocationConsistent === true, 'Loam soil in Ismailia should be consistent');
  });

  runTest('GEO-03', 'Geospatial Validator', 'Detects cross-country GPS mismatch (Tunisia GPS with Egypt label)', () => {
    const check = validateCoordinates(37.2744, 9.8739, 'Egypt', 'Ismailia Governorate', 'loam');
    assert(check.isConsistent === false, 'Should flag Tunisia GPS with Egypt country label');
    assert(check.suggestedCountry === 'Tunisia', `Expected suggestedCountry Tunisia, got ${check.suggestedCountry}`);
  });

  runTest('GEO-04', 'Geospatial Validator', 'Detects intra-country governorate mismatch and soil-location contradiction', () => {
    const govMismatch = validateCoordinates(24.0889, 32.8998, 'Egypt', 'Kafr El-Sheikh Governorate', 'clay');
    assert(govMismatch.isConsistent === false, 'Should flag Aswan GPS when region says Kafr El-Sheikh');
    const soilMismatch = validateCoordinates(25.4514, 30.5463, 'Egypt', 'New Valley Governorate (El-Wadi El-Gadid)', 'clay');
    assert(soilMismatch.soilLocationConsistent === false, 'Should flag heavy alluvial clay in desert New Valley');
  });

  runTest('GEO-05', 'Geospatial Validator', 'Converts feddans, hectares, and acres accurately', () => {
    const ha = convertArea(5, 'feddans', 'hectares');
    const fed = convertArea(2.1, 'hectares', 'feddans');
    assert(ha === 2.1, `Expected 5 feddans = 2.10 ha, got ${ha}`);
    assert(fed === 5, `Expected 2.10 ha = 5 feddans, got ${fed}`);
  });

  // =========================================================================
  // 3. NASA POWER CLIENT & PARSING TESTS
  // =========================================================================
  runTest('NASA-01', 'NASA POWER Client', 'Validates coordinate bounds and handles 0°C / -999 sentinel values safely', () => {
    assert(isValidCoordinatePair(30.8268, 32.3245) === true, 'Valid Egypt coordinates rejected');
    assert(isValidCoordinatePair(0, 0) === true, '(0,0) coordinates should be valid');
    assert(isValidCoordinatePair(95, 30) === false, 'Latitude > 90 must be rejected');
    assert(isValidCoordinatePair(30, -185) === false, 'Longitude < -180 must be rejected');
    assert(isValidCoordinatePair(Number.NaN, 30) === false, 'NaN must be rejected');
    assert(isValidNasaValue(0) === true, '0°C or 0 mm must be treated as valid (not falsy)');
    assert(isValidNasaValue(-999) === false, '-999 sentinel must be rejected');
    assert(isValidNasaValue(-999.0) === false, '-999.0 sentinel must be rejected');
    assert(isValidNasaValue(undefined) === false, 'undefined must be rejected');
  });

  runTest('NASA-02', 'NASA POWER Client', 'Fallback climatology computes true annual max/min extremes (42.8°C / 3.3°C) and -1,561 mm deficit', () => {
    const demo = getDemoClimateData(30.8268, 32.3245);
    assert(demo.annual.maxTemp === 42.8, `Expected maxTemp 42.8°C, got ${demo.annual.maxTemp}`);
    assert(demo.annual.minTemp === 3.3, `Expected minTemp 3.3°C, got ${demo.annual.minTemp}`);
    assert(demo.annual.totalPrecip === 89, `Expected totalPrecip 89 mm, got ${demo.annual.totalPrecip}`);
    assert(demo.annual.annualDeficitMm === -1561, `Expected annualDeficitMm -1561, got ${demo.annual.annualDeficitMm}`);
    assert(demo.monthly.length === 12, 'Must contain 12 monthly records');
  });

  await runAsyncTest('NASA-03', 'NASA POWER Client', 'Live NASA POWER API query for Ismailia returns valid 12-month climatology', async () => {
    const live = await fetchNasaPowerData(30.8268, 32.3245);
    assert(live.monthly.length === 12, 'Expected 12 months from NASA POWER');
    assert(live.annual.meanTemp > 18 && live.annual.meanTemp < 25, `Unexpected meanTemp ${live.annual.meanTemp}`);
    assert(live.annual.maxTemp > 38, `Expected absolute maxTemp > 38°C, got ${live.annual.maxTemp}`);
    assert(live.annual.minTemp < 8, `Expected absolute minTemp < 8°C, got ${live.annual.minTemp}`);
  });

  // =========================================================================
  // 4. AGRICULTURAL RECOMMENDATION ENGINE TESTS
  // =========================================================================
  runTest('ENG-01', 'Recommendation Engine', 'Default Ismailia 5-feddan profile reproduces exact benchmark scores (A=61, B=82, C=85)', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const res = generateRecommendations(DEFAULT_FARM_PROFILE, climate);
    assert(res.strategies.length === 3, 'Must return 3 strategies');
    const [stratA, stratB, stratC] = res.strategies;

    assert(stratA.suitabilityScore === 61, `Expected Strategy A = 61, got ${stratA.suitabilityScore}`);
    assert(stratB.suitabilityScore === 82, `Expected Strategy B = 82, got ${stratB.suitabilityScore}`);
    assert(stratC.suitabilityScore === 85, `Expected Strategy C = 85, got ${stratC.suitabilityScore}`);

    // Verify exact water rule scores (36 / 50 / 50)
    assert(stratA.scores.waterBalance === 36, `Expected Strategy A water = 36, got ${stratA.scores.waterBalance}`);
    assert(stratB.scores.waterBalance === 50, `Expected Strategy B water = 50, got ${stratB.scores.waterBalance}`);
    assert(stratC.scores.waterBalance === 50, `Expected Strategy C water = 50, got ${stratC.scores.waterBalance}`);

    // Verify weighted sum math matches suitabilityScore for each strategy
    for (const s of res.strategies) {
      const totalWeight = Math.round(s.dimensionBreakdown.reduce((acc, d) => acc + d.weight * 100, 0));
      assert(totalWeight === 100, `Dimension weights must sum to 100%, got ${totalWeight}%`);
      const weightedSum = Math.round(
        s.dimensionBreakdown.reduce((acc, d) => acc + d.score * d.weight, 0)
      );
      assert(
        weightedSum === s.suitabilityScore,
        `Weighted sum ${weightedSum} != suitabilityScore ${s.suitabilityScore} on ${s.id}`
      );
    }
  });

  runTest('ENG-02', 'Recommendation Engine', 'Handles Unknown soil texture & pH conservatively without fabricating high soil scores', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const unknownSoilFarm: FarmProfile = {
      ...DEFAULT_FARM_PROFILE,
      soilType: 'unknown',
      soilPH: 'unknown',
    };
    const res = generateRecommendations(unknownSoilFarm, climate);
    const [stratA, stratB, stratC] = res.strategies;
    assert(stratA.scores.soilHealth <= 60, `Expected conservative soil score <= 60 for unknown soil, got ${stratA.scores.soilHealth}`);
    assert(stratB.scores.soilHealth <= 65, `Expected conservative soil score <= 65 for unknown soil, got ${stratB.scores.soilHealth}`);
    assert(stratC.scores.soilHealth <= 60, `Expected conservative soil score <= 60 for unknown soil, got ${stratC.scores.soilHealth}`);
  });

  runTest('ENG-03', 'Recommendation Engine', 'Penalizes root/tuber cash rotation (Option C: Potato + Onion) on heavy Clay soil', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const clayFarm: FarmProfile = {
      ...DEFAULT_FARM_PROFILE,
      soilType: 'clay',
    };
    const res = generateRecommendations(clayFarm, climate);
    const stratC = res.strategies[2];
    assert(
      stratC.scores.soilHealth < 75,
      `Expected Strategy C soil score < 75 on heavy clay due to tuber drainage/harvest risk, got ${stratC.scores.soilHealth}`
    );
  });

  runTest('ENG-04', 'Recommendation Engine', 'Penalizes legume BNF nitrogen scores under acidic soil (pH < 6.0)', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const acidicFarm: FarmProfile = {
      ...DEFAULT_FARM_PROFILE,
      soilPH: 'acidic',
    };
    const res = generateRecommendations(acidicFarm, climate);
    assert(res.strategies[1].scores.nitrogenBalance < 82, 'Acidic soil must reduce Option B BNF score');
    assert(res.strategies[2].scores.nitrogenBalance < 88, 'Acidic soil must reduce Option C BNF score');
  });

  runTest('ENG-05', 'Recommendation Engine', 'Dynamically updates Option A when farmer selects a legume-cereal baseline rotation', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const legumeBaselineFarm: FarmProfile = {
      ...DEFAULT_FARM_PROFILE,
      currentCrops: ['Faba Bean', 'Wheat'],
    };
    const res = generateRecommendations(legumeBaselineFarm, climate);
    const stratA = res.strategies[0];
    assert(stratA.scores.nitrogenBalance > 60, `Expected Option A nitrogen > 60 when Faba Bean is in currentCrops, got ${stratA.scores.nitrogenBalance}`);
    assert(stratA.scores.pestDiversity > 70, `Expected Option A pestDiversity > 70 for dicot+monocot baseline, got ${stratA.scores.pestDiversity}`);
  });

  runTest('ENG-06', 'Recommendation Engine', 'Dynamically adjusts dimension weights when farmer changes priorities', () => {
    const climate = getDemoClimateData(DEFAULT_FARM_PROFILE.lat, DEFAULT_FARM_PROFILE.lng);
    const waterPriorityFarm: FarmProfile = {
      ...DEFAULT_FARM_PROFILE,
      priorities: ['water conservation'],
    };
    const res = generateRecommendations(waterPriorityFarm, climate);
    const waterDim = res.strategies[0].dimensionBreakdown.find((d) =>
      d.key === 'water'
    );
    assert(waterDim !== undefined && waterDim.weight > 0.15, `Expected water weight > 0.15 when only water conservation is prioritized, got ${waterDim?.weight}`);
  });

  // =========================================================================
  // 5. LIVE HTTP API & EDGE-CASE TESTS (http://localhost:3000)
  // =========================================================================
  const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

  await runAsyncTest('API-01', 'Backend API', 'GET /api/nasa-power returns 200 and valid climate payload for Ismailia', async () => {
    const resp = await fetch(`${BASE_URL}/api/nasa-power?lat=30.8268&lng=32.3245`);
    assert(resp.status === 200, `Expected HTTP 200, got ${resp.status}`);
    const data = await resp.json();
    assert(Array.isArray(data.monthly) && data.monthly.length === 12, 'Expected 12 monthly climate records');
    assert(typeof data.annual?.meanTemp === 'number', 'Missing annual.meanTemp');
  });

  await runAsyncTest('API-02', 'Backend API', 'GET /api/nasa-power rejects out-of-range coordinates (lat=999) with HTTP 400', async () => {
    const resp = await fetch(`${BASE_URL}/api/nasa-power?lat=999&lng=32.3245`);
    assert(resp.status === 400, `Expected HTTP 400 for lat=999, got ${resp.status}`);
    const body = await resp.json();
    assert(Boolean(body.error), 'Error message should be present in 400 response');
  });

  await runAsyncTest('API-03', 'Backend API', 'GET /api/nasa-power rejects empty or non-numeric coordinates with HTTP 400', async () => {
    const respEmpty = await fetch(`${BASE_URL}/api/nasa-power?lat=&lng=`);
    assert(respEmpty.status === 400, `Expected HTTP 400 for empty lat/lng, got ${respEmpty.status}`);
    const respNaN = await fetch(`${BASE_URL}/api/nasa-power?lat=abc&lng=xyz`);
    assert(respNaN.status === 400, `Expected HTTP 400 for non-numeric lat/lng, got ${respNaN.status}`);
  });

  await runAsyncTest('API-04', 'Backend API', 'POST /api/recommendations returns 200 and 3 rotation strategies for valid profile', async () => {
    const resp = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmProfile: DEFAULT_FARM_PROFILE }),
    });
    assert(resp.status === 200, `Expected HTTP 200, got ${resp.status}`);
    const data = await resp.json();
    assert(Array.isArray(data.strategies) && data.strategies.length === 3, 'Expected 3 rotation strategies');
    assert(data.strategies[0].suitabilityScore === 61, 'Expected Option A score = 61');
    assert(data.strategies[1].suitabilityScore === 82, 'Expected Option B score = 82');
    assert(data.strategies[2].suitabilityScore === 85, 'Expected Option C score = 85');
  });

  await runAsyncTest('API-05', 'Backend API', 'POST /api/recommendations rejects malformed JSON, negative area, and invalid GPS with HTTP 400', async () => {
    const badJsonResp = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid_json:',
    });
    assert(badJsonResp.status === 400, `Expected HTTP 400 for malformed JSON, got ${badJsonResp.status}`);

    const negAreaResp = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmProfile: { ...DEFAULT_FARM_PROFILE, area: -25 } }),
    });
    assert(negAreaResp.status === 400, `Expected HTTP 400 for negative area, got ${negAreaResp.status}`);

    const badCoordResp = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmProfile: { ...DEFAULT_FARM_PROFILE, lat: -120 } }),
    });
    assert(badCoordResp.status === 400, `Expected HTTP 400 for out-of-range lat=-120, got ${badCoordResp.status}`);
  });

  await runAsyncTest('API-06', 'Backend API', 'Handles 10 concurrent API requests without race conditions or failures', async () => {
    const requests = Array.from({ length: 10 }, (_, idx) =>
      fetch(`${BASE_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmProfile: { ...DEFAULT_FARM_PROFILE, area: idx + 1 },
          climateData: getDemoClimateData(30.8268, 32.3245),
        }),
      })
    );
    const responses = await Promise.all(requests);
    for (const r of responses) {
      assert(r.status === 200, `Concurrent request failed with status ${r.status}`);
    }
  });

  // =========================================================================
  // 6. END-TO-END FRONTEND ROUTE RENDERING TESTS
  // =========================================================================
  const routes = ['/', '/farm', '/dashboard', '/recommendations', '/report'];
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    await runAsyncTest(
      `E2E-0${i + 1}`,
      'Frontend Route E2E',
      `GET ${route} renders HTTP 200 with valid HTML`,
      async () => {
        const resp = await fetch(`${BASE_URL}${route}`);
        assert(resp.status === 200, `Expected HTTP 200 on ${route}, got ${resp.status}`);
        const html = await resp.text();
        assert(html.includes('FieldWise'), `Expected 'FieldWise' branding in ${route} HTML`);
      }
    );
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main();
