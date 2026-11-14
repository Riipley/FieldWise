export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & General
  navHome: string;
  navFarm: string;
  navDashboard: string;
  navRecommendations: string;
  navReport: string;
  navAnalyzeBtn: string;
  spaceAppsBadge: string;
  challengeTitle: string;

  // Landing Page
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroAnalyzeBtn: string;
  heroDemoBtn: string;
  problemBadge: string;
  problemTitle: string;
  problemP1: string;
  problemP2: string;
  problemSolution: string;
  farmA_title: string;
  farmA_desc: string;
  farmA_point1: string;
  farmA_point2: string;
  farmB_title: string;
  farmB_desc: string;
  farmB_point1: string;
  farmB_point2: string;
  solutionBannerTitle: string;
  solutionBannerDesc: string;

  // Workflow Steps
  workflowBadge: string;
  workflowTitle: string;
  workflowSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;

  // NASA Spotlight
  nasaBadge: string;
  nasaTitle: string;
  nasaDescription: string;
  nasaTempDesc: string;
  nasaRainDesc: string;
  nasaHumidityDesc: string;
  nasaSolarDesc: string;
  nasaDisclaimerTitle: string;
  nasaDisclaimerText: string;

  // Features
  featuresBadge: string;
  featuresTitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtn: string;

  // Farm Profile Page
  step1HeaderBadge: string;
  farmProfileTitle: string;
  farmProfileSubtitle: string;
  quickPresets: string;
  geoCoordsTitle: string;
  geoCoordsDesc: string;
  clickMapHint: string;
  latLabel: string;
  lngLabel: string;
  farmInfoTitle: string;
  farmNameLabel: string;
  countryLabel: string;
  regionLabel: string;
  areaLabel: string;
  haUnit: string;
  acresUnit: string;
  feddanUnit: string;
  currentCropsLabel: string;
  currentCropsHint: string;
  waterTitle: string;
  irrigationMethodLabel: string;
  waterAvailLabel: string;
  soilTitle: string;
  soilHint: string;
  soilTypeLabel: string;
  soilPHLabel: string;
  organicMatterLabel: string;
  soilDisclaimer: string;
  prioritiesTitle: string;
  prioritiesHint: string;
  saveAndFetchBtn: string;
  savingBtn: string;

  // Irrigation & Water options
  irr_rainfed: string;
  irr_drip: string;
  irr_sprinkler: string;
  irr_flood: string;
  irr_other: string;
  water_abundant: string;
  water_adequate: string;
  water_limited: string;
  water_scarce: string;

  // Priorities
  p_soil_health: string;
  p_water_conservation: string;
  p_disease_resistance: string;
  p_yield_stability: string;
  p_low_input_costs: string;
  p_climate_resilience: string;

  // Climate Dashboard
  step2HeaderBadge: string;
  climateTitle: string;
  refreshBtn: string;
  proceedToRecsBtn: string;
  annualMeanTemp: string;
  annualPrecip: string;
  relativeHumidity: string;
  solarRadiation: string;
  liveNasaSource: string;
  demoSource: string;
  tempChartTitle: string;
  tempChartDesc: string;
  rainChartTitle: string;
  rainChartDesc: string;
  humiditySolarChartTitle: string;
  humiditySolarChartDesc: string;
  agriInterpretationTitle: string;
  agriInterpretationP1: string;
  limitationsTitle: string;
  limitationResolution: string;
  limitationForecast: string;
  limitationSoil: string;

  // Recommendations Page
  step3HeaderBadge: string;
  recsTitle: string;
  recsSubtitle: string;
  generateReportBtn: string;
  strategyBaselineBadge: string;
  strategyLegumeBadge: string;
  strategyFoodSecurityBadge: string;
  strategyHorticulturalBadge: string;
  strategyDiversifiedBadge: string;
  croppingSequenceTitle: string;
  suitabilityScoreLabel: string;
  advantagesLabel: string;
  considerationsLabel: string;
  risksLabel: string;
  whyRecommendedTitle: string;
  radarTitle: string;
  radarSubtitle: string;
  matrixTitle: string;
  matrixSubtitle: string;
  viewDetailsBtn: string;
  hideDetailsBtn: string;

  // 8 Dimensions & Breakdown
  dimClimate: string;
  dimWater: string;
  dimSoil: string;
  dimNitrogen: string;
  dimPest: string;
  dimDiversity: string;
  dimEconomic: string;
  dimCalendar: string;
  dimSustainability: string;
  dimensionWeight: string;
  dimensionScore: string;
  dimensionContribution: string;

  // Scientific Enhancements
  multiYearTimelineTitle: string;
  confidenceBadge: string;
  geoAlertTitle: string;
  nitrogenBnfTitle: string;
  pestDisruptionTitle: string;
  soilConstraintTitle: string;

  // Final Report Page
  backToRecsBtn: string;
  reportHeaderTitle: string;
  reportHeaderDesc: string;
  printBtn: string;
  shareBtn: string;
  copiedBtn: string;
  dateGeneratedLabel: string;
  farmIdLabel: string;
  jurisdictionLabel: string;
  agriBaselineTitle: string;
  nasaReportSectionTitle: string;
  compTableTitle: string;
  detailedBreakdownTitle: string;
  attributionTitle: string;
  validation1Title: string;
  validation2Title: string;
  validation3Title: string;

  // Footer
  footerMission: string;
  footerDisclaimer: string;
  footerCopyright: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navHome: 'Home',
    navFarm: 'Farm Profile',
    navDashboard: 'Climate Dashboard',
    navRecommendations: 'Rotation Strategies',
    navReport: 'Farm Report',
    navAnalyzeBtn: 'Analyze Farm',
    spaceAppsBadge: 'NASA Space Apps 2026',
    challengeTitle: 'Field Shift Challenge',

    heroTitle: 'FieldWise',
    heroSubtitle: 'Smarter Rotations. Resilient Agriculture.',
    heroDescription:
      'A location-based decision support system transforming NASA environmental data into actionable, scientifically grounded crop rotation strategies tailored to your exact parcel conditions.',
    heroAnalyzeBtn: 'Analyze Your Farm',
    heroDemoBtn: 'Try Demo Farm',
    problemBadge: 'The Problem: Micro-spatial agricultural divergence',
    problemTitle: 'Two Adjacent Farms Are Rarely Identical',
    problemP1:
      'Even when farms are situated only a few kilometers apart, they frequently face markedly different soil chemistry, micro-topography, water rights, and historical nutrient extraction.',
    problemP2:
      'Standard regional blanket advisories overlook micro-spatial variances, risking fertilizer waste, groundwater salinization, and avoidable crop failure during extreme climate anomalies.',
    problemSolution:
      'FieldWise bridges this gap by marrying NASA Earth observations with farm-specific soil and management profiles to calculate resilient, field-tailored rotation plans.',
    farmA_title: 'Farm Alpha (Sandy-Loam, Limited Canal)',
    farmA_desc: 'Requires drought-adapted taproots and biological nitrogen fixation.',
    farmA_point1: 'High solar insolation, low water retention.',
    farmA_point2: 'Recommended: Barley → Chickpea → Sunflower.',
    farmB_title: 'Farm Beta (Heavy Alluvial Clay, Drip Fertigated)',
    farmB_desc: 'Capable of intensive high-value rotations with structured disease breaks.',
    farmB_point1: 'High water holding capacity, prone to compaction.',
    farmB_point2: 'Recommended: Potato → Maize → Faba Bean.',
    solutionBannerTitle: 'FieldWise Tailors Strategies to Every Single Parcel',
    solutionBannerDesc:
      'Never copy-paste agricultural prescriptions. Ground every decision in NASA climatology, botanical diversity, and rigorous multi-year rotation science.',

    workflowBadge: 'Scientific Methodology',
    workflowTitle: 'From NASA Satellites to Field Decisions',
    workflowSubtitle: 'A transparent five-stage pipeline delivering explainable agronomic guidance.',
    step1Title: '1. Parcel & Soil Definition',
    step1Desc: 'Enter exact coordinates, verified land area in feddans or hectares, soil texture, pH, and irrigation status.',
    step2Title: '2. NASA POWER Ingestion',
    step2Desc: 'Automated extraction of 20-year climatological solar insolation, temperatures, rainfall, and relative humidity.',
    step3Title: '3. Edaphic & Water Accounting',
    step3Desc: 'Calculate potential evapotranspiration deficits and evaluate soil organic matter and pH constraints.',
    step4Title: '4. Multi-Year Seasonal Engine',
    step4Desc: 'Evaluate botanical compatibility across seasonal windows without overlapping winter-crop collisions.',
    step5Title: '5. Transparent Decision Scoring',
    step5Desc: 'Independent evaluation across 8 agronomic dimensions with explicit weights and biological uncertainty bounds.',

    nasaBadge: 'NASA Earth Observations',
    nasaTitle: 'Powered by NASA POWER Climatology',
    nasaDescription:
      'FieldWise utilizes the NASA Prediction Of Worldwide Energy Resources (POWER) agroclimatology dataset, providing multi-decadal solar and meteorological parameters.',
    nasaTempDesc: 'Air Temperature at 2m (T2M): Annual means, extremes, and seasonal heat units (GDD).',
    nasaRainDesc: 'Precipitation Corrected (PRECTOTCORR): Monthly totals and annual rainfall benchmarks.',
    nasaHumidityDesc: 'Relative Humidity at 2m (RH2M): Ambient moisture levels and fungal disease pressure markers.',
    nasaSolarDesc: 'All Sky Surface Shortwave Downward (ALLSKY_SFC_SW_DWN): Insolation available for photosynthesis.',
    nasaDisclaimerTitle: 'NASA Data Integration & Resolution Notice',
    nasaDisclaimerText:
      'NASA POWER parameters represent gridded estimates at ~0.5° × 0.5° (~50 km) resolution derived from MERRA-2 assimilation and satellite models. While optimal for regional agro-climatology, local on-farm microclimates and laboratory soil chemistry should always be verified.',

    featuresBadge: 'Core Capabilities',
    featuresTitle: 'Engineered for Modern Resilient Agriculture',
    feat1Title: 'Geographic Validation & Feddan Conversion',
    feat1Desc: 'Bounding-box verification of coordinates and jurisdictions with dual feddan/hectare units.',
    feat2Title: 'Multi-Year Feasible Calendars',
    feat2Desc: 'Constructs physically possible crop rotations respecting true seasonal sowing and harvesting windows.',
    feat3Title: 'Explainable 8-Dimension Scoring',
    feat3Desc: 'Transparent breakdown of climate, water, soil pH, nitrogen fixation, pests, economics, and sustainability.',
    ctaTitle: 'Ready to optimize your crop rotation?',
    ctaSubtitle: 'Get a scientifically grounded agronomic report for your land in under 2 minutes.',
    ctaBtn: 'Start Free Parcel Analysis',

    step1HeaderBadge: 'Step 1 of 4 • Farm Profiling',
    farmProfileTitle: 'Farm Profile & Geospatial Boundary',
    farmProfileSubtitle: 'Define your agricultural parcel, soil characteristics, and irrigation infrastructure.',
    quickPresets: 'Quick Preset Locations:',
    geoCoordsTitle: 'Geospatial Location & Coordinates',
    geoCoordsDesc: 'Click anywhere on the interactive map or enter GPS latitude and longitude directly.',
    clickMapHint: 'Click anywhere on the satellite/terrain map to set coordinates',
    latLabel: 'Latitude (°N)',
    lngLabel: 'Longitude (°E)',
    farmInfoTitle: 'Parcel Identification',
    farmNameLabel: 'Farm / Parcel Name',
    countryLabel: 'Country',
    regionLabel: 'Governorate / Region',
    areaLabel: 'Total Farm Area',
    haUnit: 'Hectares (ha)',
    acresUnit: 'Acres (ac)',
    feddanUnit: 'Feddans (فدان)',
    currentCropsLabel: 'Current Crops Grown',
    currentCropsHint: 'Select up to 4 crops currently cultivated in your parcel rotation:',
    waterTitle: 'Water & Irrigation Profile',
    irrigationMethodLabel: 'Irrigation System',
    waterAvailLabel: 'Water Supply Security',
    soilTitle: 'Soil Characteristics (Edaphic Factors)',
    soilHint: 'Provide laboratory measurements or visual field assessments:',
    soilTypeLabel: 'Soil Texture',
    soilPHLabel: 'Soil pH Range',
    organicMatterLabel: 'Soil Organic Matter',
    soilDisclaimer: 'Note: NASA satellites do not directly measure subsurface soil chemistry. Ground testing is advised.',
    prioritiesTitle: 'Farmer Management Priorities',
    prioritiesHint: 'Select the primary goals guiding your rotation decisions:',
    saveAndFetchBtn: 'Save Farm & Retrieve NASA Climate Data',
    savingBtn: 'Validating & Retrieving NASA Data...',

    irr_rainfed: 'Rainfed (No Supplemental Irrigation)',
    irr_drip: 'Drip / Micro-fertigation (High Efficiency)',
    irr_sprinkler: 'Center Pivot / Sprinkler',
    irr_flood: 'Surface / Furrow / Flood Irrigation',
    irr_other: 'Other Irrigation Method',
    water_abundant: 'Abundant (Reliable Canal / Well Supply)',
    water_adequate: 'Adequate (Normal Seasonal Supply)',
    water_limited: 'Limited (Periodic Restrictions)',
    water_scarce: 'Scarce (Severe Drought / Deficit)',

    p_soil_health: 'Soil Health & Organic Structure',
    p_water_conservation: 'Water Conservation & Drought Defense',
    p_disease_resistance: 'Disease & Pest Cycle Breaking',
    p_yield_stability: 'Yield Stability & Food Security',
    p_low_input_costs: 'Low Chemical Input & Fertilizer Savings',
    p_climate_resilience: 'Thermal & Climate Resilience',

    step2HeaderBadge: 'Step 2 of 4 • Environmental Intelligence',
    climateTitle: 'NASA Agro-Climatology Analysis',
    refreshBtn: 'Refresh NASA Data',
    proceedToRecsBtn: 'Evaluate Rotation Strategies',
    annualMeanTemp: 'Mean Annual Temperature',
    annualPrecip: 'Annual Precipitation',
    relativeHumidity: 'Mean Relative Humidity',
    solarRadiation: 'Daily Solar Insolation',
    liveNasaSource: 'Live NASA POWER API',
    demoSource: 'Calibrated Demonstration Mode',
    tempChartTitle: 'Thermal Regime & Seasonal Extremes (°C)',
    tempChartDesc: 'Monthly minimum, mean, and maximum temperatures derived from 20-year NASA assimilation.',
    rainChartTitle: 'Monthly Precipitation vs. Evaporative Demand (mm)',
    rainChartDesc: 'Shows precipitation distribution and reveals seasonal climatic water deficit periods.',
    humiditySolarChartTitle: 'Relative Humidity (%) & Solar Radiation (MJ/m²/day)',
    humiditySolarChartDesc: 'Photosynthetic light availability and atmospheric moisture indicators.',
    agriInterpretationTitle: 'Agronomic Environmental Interpretation',
    agriInterpretationP1:
      'Climate records guide crop thermal matching, frost avoidance, and irrigation scheduling during peak summer evapotranspiration.',
    limitationsTitle: 'Scientific Data Transparency & Constraints',
    limitationResolution:
      'Spatial Resolution: NASA POWER data is provided at ~0.5° × 0.5° (~50 km) grid resolution, representing regional climate rather than micro-parcel topography.',
    limitationForecast:
      'Temporal Coverage: Represents 20-year multi-decadal climatological baseline (2001–2020), not a short-term 10-day weather forecast.',
    limitationSoil:
      'Subsurface Soil Testing: Satellites cannot measure root-zone salinity (ECe) or available phosphorus (Olsen P); ground lab testing remains essential.',

    step3HeaderBadge: 'Step 3 of 4 • Multi-Year Decision Matrix',
    recsTitle: 'Agronomic Rotation Strategies',
    recsSubtitle: 'Compare your baseline against scientifically validated multi-year adaptation rotations.',
    generateReportBtn: 'Generate Farm Report',
    strategyBaselineBadge: 'Strategy A • Baseline Control',
    strategyLegumeBadge: 'Strategy B • Soil Restorative',
    strategyFoodSecurityBadge: 'Strategy B • Food Security & Soil Restorative',
    strategyHorticulturalBadge: 'Strategy C • High-Value Horticultural Cash',
    strategyDiversifiedBadge: 'Strategy C • Multi-Tier Resilience',
    croppingSequenceTitle: 'Multi-Year Cropping Sequence',
    suitabilityScoreLabel: 'Overall Suitability Score',
    advantagesLabel: 'Key Scientific Advantages:',
    considerationsLabel: 'Considerations & Management Constraints:',
    risksLabel: 'Agronomic Risks & Uncertainties:',
    whyRecommendedTitle: 'Scientific Rationale & NASA Climate Fit:',
    radarTitle: 'Multi-Criteria Agronomic Radar',
    radarSubtitle: 'Simultaneous evaluation across all 8 agronomic dimensions.',
    matrixTitle: 'Side-by-Side Strategy Comparison Matrix',
    matrixSubtitle: 'Direct comparison of water consumption, biological nitrogen, and market returns.',
    viewDetailsBtn: 'View 8-Dimension Breakdown & Calendar',
    hideDetailsBtn: 'Hide Detailed Breakdown',

    dimClimate: 'Climate Suitability',
    dimWater: 'Water Availability & Demand',
    dimSoil: 'Soil Compatibility & pH',
    dimNitrogen: 'Nutrient Dynamics & N-Credit',
    dimPest: 'Pest & Pathogen Interruption',
    dimDiversity: 'Botanical Diversity',
    dimEconomic: 'Economic Profitability & Margin',
    dimCalendar: 'Crop Calendar Feasibility',
    dimSustainability: 'Environmental Sustainability',
    dimensionWeight: 'Weight',
    dimensionScore: 'Score',
    dimensionContribution: 'Contribution',

    multiYearTimelineTitle: 'Multi-Year Seasonal Cropping Calendar',
    confidenceBadge: 'Data Confidence Level',
    geoAlertTitle: 'Geographic Validation & Jurisdiction Notice',
    nitrogenBnfTitle: 'Biological Nitrogen Fixation (BNF) Scientific Assessment',
    pestDisruptionTitle: 'Pest & Soil Pathogen Cycle Interruption Analysis',
    soilConstraintTitle: 'Soil pH Constraints & Fertility Directives',

    backToRecsBtn: 'Back to Rotation Strategies',
    reportHeaderTitle: 'Comprehensive Agricultural Decision Report',
    reportHeaderDesc:
      'NASA Space Apps Challenge 2026 • Challenge: Field Shift – Adapting Farms with NASA Data',
    printBtn: 'Print / Save as PDF',
    shareBtn: 'Share Report',
    copiedBtn: 'Link Copied!',
    dateGeneratedLabel: 'Date Generated:',
    farmIdLabel: 'Report Reference:',
    jurisdictionLabel: 'Verified Jurisdiction:',
    agriBaselineTitle: 'Farm Profile & Verified Geographic Jurisdiction',
    nasaReportSectionTitle: 'NASA POWER Agro-Climatology Profile',
    compTableTitle: 'Comparative Evaluation of Crop Rotation Strategies',
    detailedBreakdownTitle: 'Detailed Scientific Rotation Breakdown',
    attributionTitle: 'Attribution, Methodological Limitations & Ground Verification',
    validation1Title: '1. Laboratory Soil Analysis:',
    validation2Title: '2. Local Extension Directives:',
    validation3Title: '3. Market Access & Logistics:',

    footerMission:
      'FieldWise is an Agricultural Decision Support System built for the NASA Space Apps Challenge 2026 under the challenge "Field Shift – Adapting Farms with NASA Data".',
    footerDisclaimer:
      'FieldWise provides decision support. Recommendations are based on NASA POWER satellite climatology (~50km grid) and agronomic principles. They do not replace local agricultural extension directives or laboratory soil testing.',
    footerCopyright: 'FieldWise. NASA Space Apps Challenge 2026.',
  },

  ar: {
    navHome: 'الرئيسية',
    navFarm: 'بيانات الحقل',
    navDashboard: 'لوحة بيانات ناسا',
    navRecommendations: 'الدورات الزراعية',
    navReport: 'التقرير النهائي',
    navAnalyzeBtn: 'تحليل الحقل',
    spaceAppsBadge: 'تحدي ناسا لتطبيقات الفضاء 2026',
    challengeTitle: 'تحدي Field Shift مع ناسا',

    heroTitle: 'فيلد وايز (FieldWise)',
    heroSubtitle: 'دورات زراعية أذكى. زراعة أكثر استدامة ومرونة.',
    heroDescription:
      'نظام ذكي لدعم القرار الزراعي يحول بيانات الأقمار الصناعية من وكالة ناسا إلى خطط دورات زراعية عملية ومبنية على أسس علمية تناسب موقع حقلك وظروفه الخاصة بدقة.',
    heroAnalyzeBtn: 'ابدأ بتحليل حقلك الآن',
    heroDemoBtn: 'استعراض مزرعة تجريبية',
    problemBadge: 'المعضلة الزراعية في الحقول المتقاربة',
    problemTitle: 'حقلان متجاوران قد تختلف ظروفهما تماماً!',
    problemP1:
      'حتى المزارع التي تبعد كيلومترات قليلة عن بعضها غالباً ما تختلف في المناخ المصغر، وفرة مياه الري، نوع التربة، ومدى استنزاف العناصر الغذائية على مدار السنين.',
    problemP2:
      'التوصيات الزراعية العامة التي تقترح نفس المحصول ونفس الدورة الزراعية لجميع المزارعين في المنطقة قد تؤدي إلى تراجع الإنتاج، وإهدار الأسمدة المكلفة، وزيادة خطر الجفاف.',
    problemSolution:
      'منصة FieldWise تحل هذه المشكلة عبر دمج بيانات ناسا المناخية مع بيانات التربة وطبيعة ري مزرعتك لتقديم توصيات مخصصة لكل حقل بذاته.',
    farmA_title: 'المزرعة (أ) - تربة رملية ومياه ري محدودة',
    farmA_desc: 'تتطلب محاصيل وتدية عميقة تتحمل الجفاف وبقوليات تعوض فقر النيتروجين.',
    farmA_point1: 'إشعاع شمسي عالي مع احتفاظ ضعيف بالماء.',
    farmA_point2: 'الدورة المناسبة: شعير ← حمص ← دوار شمس.',
    farmB_title: 'المزرعة (ب) - تربة طينية غنية مع ري بالتنقيط',
    farmB_desc: 'مؤهلة لزراعة محاصيل خضر بستانية ذات عائد مالي مرتفع مع كسر الآفات.',
    farmB_point1: 'سعة احتفاظ عالية بالماء مع خطر انضغاط التربة.',
    farmB_point2: 'الدورة المناسبة: بطاطس ← ذرة شامية ← فول بلدي.',
    solutionBannerTitle: 'FieldWise تخصص التوصيات لكل حقل على حدة',
    solutionBannerDesc:
      'لا نعتمد على قوالب جاهزة؛ بل نبني خطة الدورة الزراعية على قياسات ناسا المناخية الفعلية والتوازن البيئي لتربتك.',

    workflowBadge: 'المنهجية العلمية والخطوات',
    workflowTitle: 'من أقمار ناسا الصناعية إلى قرارك في الحقل',
    workflowSubtitle: 'نظام متكامل من خمس مراحل لتحويل الأرقام الفضائية إلى خطة زراعية عملية.',
    step1Title: '1. تحديد موقع وخصائص الحقل',
    step1Desc: 'تحديد الإحداثيات الجغرافية بدقة، ومساحة الأرض بالفدان أو الهكتار، ونوع التربة وشبكة الري.',
    step2Title: '2. جلب السجلات المناخية من ناسا',
    step2Desc: 'سحب بيانات الإشعاع الشمسي والحرارة والأمطار والرطوبة لأكثر من 20 عاماً من مشروع NASA POWER.',
    step3Title: '3. قياس التوازن المائي وقيد التربة',
    step3Desc: 'حساب العجز التبخيري ومقارنة حاجة المحاصيل المائية مع وفرة مياه الري وقيد حموضة التربة.',
    step4Title: '4. توليد تعاقب العروات والمواسم',
    step4Desc: 'تنظيم المحاصيل في تقويم زراعي متعدد السنوات يمنع تضارب المحاصيل الشتوية في نفس الموسم.',
    step5Title: '5. تقييم شفاف ثماني الأبعاد',
    step5Desc: 'تقييم مستقل عبر 8 محاور علمية بأوزان معلنة مع إيضاح نسب عدم اليقين في التسميد الحيوي.',

    nasaBadge: 'بيانات وكالة الفضاء الأمريكية (NASA)',
    nasaTitle: 'مدعوم بمشروع NASA POWER الزراعي',
    nasaDescription:
      'تعتمد المنصة على مشروع NASA POWER المتخصص في علوم المناخ الزراعي وتوليد الطاقة المتجددة.',
    nasaTempDesc: 'درجة حرارة الهواء (T2M): المتوسطات اليومية والسنوية والقمم الحرارية الصيفية ودرجات البرودة الشتوية.',
    nasaRainDesc: 'معدل الأمطار المصحح (PRECTOTCORR): كميات الأمطار التراكمية وتحديد مواسم الجفاف ومواسم الوفرة.',
    nasaHumidityDesc: 'الرطوبة النسبية (RH2M): قياس رطوبة الهواء لتوقع مخاطر انتشار الفطريات والأمراض الورقية.',
    nasaSolarDesc: 'الإشعاع الشمسي الكلي (ALLSKY_SFC_SW_DWN): كمية الطاقة الضوئية المتاحة لعملية البناء الضوئي.',
    nasaDisclaimerTitle: 'طبيعة ودقة بيانات ناسا الفضائية',
    nasaDisclaimerText:
      'بيانات NASA POWER تمثل شبكة استشعار بمقياس ~0.5° × 0.5° (~50 كم) مستمدة من نماذج إعادة التحليل MERRA-2 والأقمار الصناعية. وهي ممتازة لتحديد المناخ العام للمنطقة، ولكن يجب استكمالها بفحص محلي لملوحة التربة ومصادر الري.',

    featuresBadge: 'مميزات المنصة',
    featuresTitle: 'أدوات صممت خصيصاً للمزارع العصري',
    feat1Title: 'توثيق الموقع والتحويل التلقائي للفدان',
    feat1Desc: 'التحقق التلقائي من توافق الإحداثيات مع الدولة والمحافظة ودعم التحويل المباشر بين الفدان والهكتار.',
    feat2Title: 'تقويم زراعي متعدد السنوات قابل للتطبيق',
    feat2Desc: 'جدولة دقيقة تضمن عدم تضارب المحاصيل الشتوية وتوفر فترات لخدمة وتجهيز الأرض بين المواسم.',
    feat3Title: 'تقييم شفاف عبر 8 أبعاد علمية',
    feat3Desc: 'تفصيل معلن لأوزان المناخ والماء والتربة والتسميد الحيوي والآفات والجدوى الاقتصادية والاستدامة.',
    ctaTitle: 'هل أنت مستعد لاختيار الدورة الزراعية الأفضل لأرضك؟',
    ctaSubtitle: 'احصل على تحليل علمي شامل لمزرعتك في أقل من دقيقتين مجاناً.',
    ctaBtn: 'ابدأ تحليل مزرعتك الآن',

    step1HeaderBadge: 'الخطوة 1 من 4 • تعريف بيانات المزرعة',
    farmProfileTitle: 'بيانات الحقل والموقع الجغرافي',
    farmProfileSubtitle: 'حدد إحداثيات ومساحة أرضك وطبيعة التربة ونظام الري للبدء في استخراج بيانات ناسا.',
    quickPresets: 'مواقع نموذجية جاهزة للتجربة:',
    geoCoordsTitle: 'الموقع والإحداثيات الجغرافية',
    geoCoordsDesc: 'انقر على الخريطة التفاعلية لتحديد أرضك بدقة، أو أدخل خط الطول ودوائر العرض يدوياً.',
    clickMapHint: 'انقر في أي مكان على الخريطة لاختيار الإحداثيات الجغرافية لحقلك',
    latLabel: 'خط العرض (شمالاً °N)',
    lngLabel: 'خط الطول (شرقاً °E)',
    farmInfoTitle: 'بيانات وتعريف المزرعة',
    farmNameLabel: 'اسم المزرعة أو الحقل',
    countryLabel: 'الدولة',
    regionLabel: 'المحافظة / الإقليم',
    areaLabel: 'مساحة المزرعة الكلية',
    haUnit: 'هكتار (ha)',
    acresUnit: 'أكر / فدان أمريكي (ac)',
    feddanUnit: 'فدان مصري (feddans)',
    currentCropsLabel: 'المحاصيل المزروعة حالياً في حقلك',
    currentCropsHint: 'اختر حتى 4 محاصيل تزرعها عادة في دوراتك المعتادة:',
    waterTitle: 'نظام ومصادر مياه الري',
    irrigationMethodLabel: 'طريقة الري المتبعة',
    waterAvailLabel: 'مدى توفر مياه الري',
    soilTitle: 'طبيعة وخصائص التربة (العوامل الإيدافية)',
    soilHint: 'أدخل البيانات المتوفرة لديك من فحص التربة أو المعاينة الحقلية:',
    soilTypeLabel: 'نوع وقوام التربة',
    soilPHLabel: 'درجة حموضة التربة (pH)',
    organicMatterLabel: 'نسبة المادة العضوية بالتربة',
    soilDisclaimer: 'ملاحظة: لا تقيس أقمار ناسا كيمياء باطن التربة مباشرة، ويوصى دائماً بالتحاليل المخبرية الدورية.',
    prioritiesTitle: 'أولويات وأهداف المزارع',
    prioritiesHint: 'حدد الأهداف الأهم بالنسبة لك لتوجيه وزن التوصيات الزراعية:',
    saveAndFetchBtn: 'حفظ بيانات الحقل وجلب سجلات ناسا المناخية',
    savingBtn: 'جارِ التحقق واستخراج بيانات ناسا...',

    irr_rainfed: 'زراعة مطرية (بدون ري تكميلي)',
    irr_drip: 'ري بالتنقيط (عالي الكفاءة)',
    irr_sprinkler: 'ري بالرش أو المحاور (بيفوت)',
    irr_flood: 'ري سطحي أو بالغمر (تقليدي)',
    irr_other: 'طريقة ري أخرى',
    water_abundant: 'وفيرة جداً (ترعة دائمة أو بئر غزير)',
    water_adequate: 'كافية ومستقرة (مناوبات ري منتظمة)',
    water_limited: 'محدودة (أوقات انقطاع أو تقنين)',
    water_scarce: 'شحيحة (جفاف أو تكلفة ضخ مرتفعة)',

    p_soil_health: 'بناء خصوبة التربة والمادة العضوية',
    p_water_conservation: 'توفير المياه ومقاومة الجفاف',
    p_disease_resistance: 'كسر دورات الآفات وأمراض الجذور',
    p_yield_stability: 'استقرار الإنتاج والأمن الغذائي',
    p_low_input_costs: 'خفض مصاريف الأسمدة والكيماويات',
    p_climate_resilience: 'تحمل موجات الحر والتقلبات المناخية',

    step2HeaderBadge: 'الخطوة 2 من 4 • التحليل البيئي والمناخي',
    climateTitle: 'سجلات ناسا للمناخ الزراعي',
    refreshBtn: 'تحديث بيانات ناسا',
    proceedToRecsBtn: 'الانتقال لتقييم الدورات الزراعية',
    annualMeanTemp: 'متوسط الحرارة السنوي',
    annualPrecip: 'الأمطار السنوية التراكمية',
    relativeHumidity: 'متوسط الرطوبة النسبية',
    solarRadiation: 'معدل الإشعاع الشمسي اليومي',
    liveNasaSource: 'واجهة NASA POWER الحية المباشرة',
    demoSource: 'معايرة مناخية احترازية مطابقة للموقع',
    tempChartTitle: 'المدى الحراري والقمم الموسمية (°م)',
    tempChartDesc: 'المتوسطات الشهرية للحرارة العظمى والصغرى على مدار 20 عاماً من بيانات ناسا.',
    rainChartTitle: 'كميات الأمطار الشهرية مقابل الاحتياج التبخيري (ملم)',
    rainChartDesc: 'توزيع الهطول المطري وتوضيح فترات العجز المائي المناخي التي تتطلب رياً إضافياً.',
    humiditySolarChartTitle: 'الرطوبة النسبية (%) والإشعاع الشمسي (ميغاجول/م²/يوم)',
    humiditySolarChartDesc: 'توضح كفاية الطاقة الضوئية للبناء الضوئي ومؤشرات الرطوبة المسببة للأمراض الفطرية.',
    agriInterpretationTitle: 'التحليل الزراعي لمناخ أرضك',
    agriInterpretationP1:
      'تحدد السجلات المناخية مواعيد الزراعة الآمنة وتجنب فترات الصقيع أو موجات الحر الشديدة خلال فترات التزهير وامتلاء الحبوب.',
    limitationsTitle: 'شفافية وحدود البيانات العلمية',
    limitationResolution:
      'الدقة المكانية: شبكة بيانات ناسا تمتد بدقة ~0.5 درجة (نحو 50 كم). هذا يعني أنها تقدم مناخ المنطقة العام دون رصد تضاريس الوادي الدقيقة بمقياس المتر.',
    limitationForecast:
      'التغطية الزمنية: السجلات تمثل المتوسط المناخي التراكمي لأكثر من 20 عاماً (2001-2020)، ولا تُعامل كنشرة جوية لأيام قادمة.',
    limitationSoil:
      'التربة وباطن الأرض: أقمار ناسا لا تقيس ملوحة التربة الداخلية أو العناصر الصغرى، وينصح دائماً بإجراء تحاليل معملية دورية.',

    step3HeaderBadge: 'الخطوة 3 من 4 • محرك المقارنة والقرار',
    recsTitle: 'خيارات الدورات الزراعية المقترحة',
    recsSubtitle: 'مقارنة بين دورتك الحالية وخيارين بديلين يحميان أرضك ويزيدان أرباحك',
    generateReportBtn: 'إصدار التقرير النهائي',
    strategyBaselineBadge: 'الخيار (أ) • دورتك الحالية (خط الأساس)',
    strategyLegumeBadge: 'الخيار (ب) • دورة معززة بالبقوليات المخصبة',
    strategyFoodSecurityBadge: 'الخيار (ب) • دورة الأمن الغذائي وتجديد التربة',
    strategyHorticulturalBadge: 'الخيار (ج) • دورة التنويع البستاني عالي الربحية',
    strategyDiversifiedBadge: 'الخيار (ج) • دورة ثلاثية متنوعة عالية المرونة',
    croppingSequenceTitle: 'تسلسل الزراعة متعدد السنوات (عروات متعاقبة)',
    suitabilityScoreLabel: 'درجة الملاءمة الإجمالية',
    advantagesLabel: 'أبرز المزايا والفوائد العلمية:',
    considerationsLabel: 'أمور وتحديات ومحددات إدارية:',
    risksLabel: 'المخاطر والشكوك المحصولية:',
    whyRecommendedTitle: 'لماذا نقترح هذه الدورة لمزرعتك وتوافقها مع مناخ ناسا؟',
    radarTitle: 'مخطط الرادار الزراعي المقارن',
    radarSubtitle: 'مقارنة شاملة تكشف نقاط القوة والضعف في كل خيار زراعي عبر 8 أبعاد.',
    matrixTitle: 'جدول المقارنة المباشر بين الخيارات',
    matrixSubtitle: 'مقارنة تفصيلية لاستهلاك الماء ورصيد النيتروجين الحيوي والعائد التجاري.',
    viewDetailsBtn: 'عرض تفصيل التقييم والتقويم الزراعي',
    hideDetailsBtn: 'إخفاء التفاصيل الزراعية',

    dimClimate: 'ملاءمة المناخ والحرارة',
    dimWater: 'أمان وتوازن المياه والري',
    dimSoil: 'توافق التربة وقيد الحموضة',
    dimNitrogen: 'تغذية التربة والتثبيت الحيوي',
    dimPest: 'كسر دورات الآفات وأمراض التربة',
    dimDiversity: 'التنوع النباتي والبيئي',
    dimEconomic: 'الجدوى الاقتصادية والعائد التجاري',
    dimCalendar: 'قابلية التطبيق في التقويم الزراعي',
    dimSustainability: 'الاستدامة البيئية والكربون العضوي',
    dimensionWeight: 'الوزن النسبي',
    dimensionScore: 'الدرجة',
    dimensionContribution: 'المساهمة',

    multiYearTimelineTitle: 'التقويم الزراعي متعدد السنوات (عروات متعاقبة)',
    confidenceBadge: 'مستوى الموثوقية البيانية',
    geoAlertTitle: 'التوثيق الجغرافي والإحداثيات',
    nitrogenBnfTitle: 'التحليل العلمي للتثبيت الحيوي للنيتروجين (BNF)',
    pestDisruptionTitle: 'تحليل كسر دورات الآفات وفطريات التربة',
    soilConstraintTitle: 'توجيهات حموضة التربة والتسميد الفوسفاتي',

    backToRecsBtn: 'العودة لمقارنة الاستراتيجيات',
    reportHeaderTitle: 'تقرير الدورة الزراعية والمناخ الحقلي الشامل',
    reportHeaderDesc:
      'تحدي ناسا لتطبيقات الفضاء 2026 • تحدي: تكييف المزارع مع بيانات ناسا (Field Shift)',
    printBtn: 'طباعة أو حفظ بصيغة PDF',
    shareBtn: 'مشاركة الرابط',
    copiedBtn: 'تم نسخ الرابط!',
    dateGeneratedLabel: 'تاريخ إصدار التقرير:',
    farmIdLabel: 'رقم المرجع للتقرير:',
    jurisdictionLabel: 'المنطقة الجغرافية الموثقة:',
    agriBaselineTitle: 'بيانات الحقل والموقع الجغرافي المعتمد',
    nasaReportSectionTitle: 'السجل المناخي من وكالة ناسا (Agroclimatology)',
    compTableTitle: 'جدول مقارنة الدورات الزراعية المقترحة',
    detailedBreakdownTitle: 'التحليل الزراعي التفصيلي لكل دورة',
    attributionTitle: 'إسناد البيانات والقيود العلمية والخطوات الموصى بها',
    validation1Title: '1. فحص التربة المخبري:',
    validation2Title: '2. استشارة الإرشاد الزراعي المحلي:',
    validation3Title: '3. الجدوى التسويقية وسلاسل الإمداد:',

    footerMission:
      'منصة FieldWise هي نظام لدعم القرار الزراعي طُور للمشاركة في تحدي NASA Space Apps Challenge 2026 ضمن مسار تكييف المزارع ببيانات ناسا.',
    footerDisclaimer:
      'يقدم FieldWise إرشادات استشارية مبنية على السجلات المناخية الفضائية، ولا تغني عن الاستشارة الميدانية للمهندسين الزراعيين أو التحاليل الكيميائية لعينات التربة.',
    footerCopyright: 'FieldWise. تحدي ناسا لتطبيقات الفضاء 2026.',
  },
};
