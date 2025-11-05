import { SIPData, SIPDataSchema } from '../types';
import { slugify } from '../utils';

interface WearableData {
  name: string;
  manufacturer: string;
  supplier: string;
  description: string;
  shortSummary: string;
  os: string;
  costMinUSD: number;
  costMaxUSD: number;
  versions: Array<{
    name: string;
    releasedAt: Date;
    notes: string;
  }>;
  components: SIPData['components'];
}

// Curated wearables catalog with real products
const WEARABLES_CATALOG: WearableData[] = [
  {
    name: 'Apple Watch Series 9',
    manufacturer: 'Apple',
    supplier: 'Apple',
    shortSummary: 'Advanced smartwatch with health tracking, fitness features, and seamless iOS integration',
    description: 'The Apple Watch Series 9 features the S9 SiP chip, always-on Retina display, advanced health sensors including ECG and blood oxygen monitoring, crash detection, and deep integration with the Apple ecosystem.',
    os: 'watchOS',
    costMinUSD: 39900, // $399
    costMaxUSD: 79900, // $799
    versions: [
      { name: '9.0', releasedAt: new Date('2023-09-22'), notes: 'Initial Series 9 release with S9 chip' },
      { name: '9.1', releasedAt: new Date('2023-10-15'), notes: 'Performance improvements' },
      { name: '9.2', releasedAt: new Date('2024-01-20'), notes: 'Bug fixes and stability updates' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Apple S9 SiP', spec: 'Dual-core processor with 18-hour battery', required: true },
      { type: 'HARDWARE', name: 'Optical Heart Sensor', spec: '4th generation', required: true },
      { type: 'HARDWARE', name: 'ECG Sensor', required: true },
      { type: 'HARDWARE', name: 'Blood Oxygen Sensor', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', spec: 'High-g and high dynamic range', required: true },
      { type: 'HARDWARE', name: 'Gyroscope', required: true },
      { type: 'HARDWARE', name: 'Always-On Retina Display', spec: 'LTPO OLED', required: true },
      { type: 'SOFTWARE', name: 'watchOS 10', required: true },
      { type: 'SOFTWARE', name: 'Health App Integration', required: true },
    ],
  },
  {
    name: 'Samsung Galaxy Watch 6',
    manufacturer: 'Samsung',
    supplier: 'Samsung',
    shortSummary: 'Premium Android smartwatch with comprehensive health tracking and Wear OS',
    description: 'Samsung Galaxy Watch 6 features Exynos W930 processor, Super AMOLED display, advanced sleep tracking, body composition analysis, and comprehensive fitness features powered by Wear OS.',
    os: 'Wear OS',
    costMinUSD: 29999, // $299.99
    costMaxUSD: 42999, // $429.99
    versions: [
      { name: '6.0', releasedAt: new Date('2023-08-11'), notes: 'Initial Galaxy Watch 6 release' },
      { name: '6.1', releasedAt: new Date('2023-11-10'), notes: 'Wear OS 4 update' },
      { name: '6.2', releasedAt: new Date('2024-02-05'), notes: 'Enhanced sleep tracking' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Exynos W930', spec: '5nm dual-core 1.4GHz processor', required: true },
      { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Heart rate, ECG, body composition', required: true },
      { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.3" or 1.5" Sapphire Crystal', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', required: true },
      { type: 'HARDWARE', name: 'Gyroscope', required: true },
      { type: 'HARDWARE', name: 'Barometer', required: true },
      { type: 'SOFTWARE', name: 'Wear OS 4', required: true },
      { type: 'SOFTWARE', name: 'Samsung Health', required: true },
      { type: 'SOFTWARE', name: 'One UI Watch 5', required: true },
    ],
  },
  {
    name: 'Fitbit Charge 6',
    manufacturer: 'Fitbit',
    supplier: 'Google',
    shortSummary: 'Fitness tracker with advanced health metrics and Google integration',
    description: 'Fitbit Charge 6 is a comprehensive fitness tracker featuring heart rate monitoring, built-in GPS, sleep tracking, stress management, and integration with Google services.',
    os: 'Fitbit OS',
    costMinUSD: 15999, // $159.99
    costMaxUSD: 15999,
    versions: [
      { name: '1.0', releasedAt: new Date('2023-10-12'), notes: 'Initial Charge 6 release' },
      { name: '1.1', releasedAt: new Date('2024-01-15'), notes: 'Google Maps integration' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Multi-path Optical Heart Rate Sensor', required: true },
      { type: 'HARDWARE', name: 'GPS', spec: 'Built-in GPS + GLONASS', required: true },
      { type: 'HARDWARE', name: 'EDA Sensor', spec: 'Electrodermal activity for stress', required: true },
      { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: 'Color touchscreen', required: true },
      { type: 'SOFTWARE', name: 'Fitbit OS', required: true },
      { type: 'SOFTWARE', name: 'Google Fit Integration', required: true },
    ],
  },
  {
    name: 'Garmin Forerunner 965',
    manufacturer: 'Garmin',
    supplier: 'Garmin',
    shortSummary: 'Premium running smartwatch with AMOLED display and advanced training metrics',
    description: 'Garmin Forerunner 965 is designed for serious runners, featuring an AMOLED display, multi-band GPS, training readiness, running dynamics, and extensive performance metrics.',
    os: 'Garmin OS',
    costMinUSD: 59999, // $599.99
    costMaxUSD: 59999,
    versions: [
      { name: '1.0', releasedAt: new Date('2023-03-15'), notes: 'Initial Forerunner 965 release' },
      { name: '1.5', releasedAt: new Date('2023-09-20'), notes: 'Training readiness enhancements' },
      { name: '2.0', releasedAt: new Date('2024-03-10'), notes: 'New running dynamics features' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Elevate Gen 5 Heart Rate Sensor', required: true },
      { type: 'HARDWARE', name: 'Multi-band GPS', spec: 'GPS, GLONASS, Galileo', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.4" touchscreen', required: true },
      { type: 'HARDWARE', name: 'Pulse Ox Sensor', required: true },
      { type: 'HARDWARE', name: 'Barometric Altimeter', required: true },
      { type: 'HARDWARE', name: 'Compass', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', required: true },
      { type: 'SOFTWARE', name: 'Garmin OS', required: true },
      { type: 'SOFTWARE', name: 'Training Status', required: true },
      { type: 'SOFTWARE', name: 'Running Dynamics', required: true },
    ],
  },
  {
    name: 'Xiaomi Mi Band 8',
    manufacturer: 'Xiaomi',
    supplier: 'Xiaomi',
    shortSummary: 'Affordable fitness tracker with comprehensive health monitoring',
    description: 'Xiaomi Mi Band 8 offers excellent value with AMOLED display, 24/7 heart rate monitoring, sleep tracking, SpO2 measurement, and 16-day battery life.',
    os: 'Mi Band OS',
    costMinUSD: 4999, // $49.99
    costMaxUSD: 4999,
    versions: [
      { name: '8.0', releasedAt: new Date('2023-06-15'), notes: 'Initial Mi Band 8 release' },
      { name: '8.1', releasedAt: new Date('2023-10-01'), notes: 'Battery optimization' },
    ],
    components: [
      { type: 'HARDWARE', name: 'PPG Heart Rate Sensor', required: true },
      { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.62" color screen', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', required: true },
      { type: 'HARDWARE', name: '190mAh Battery', spec: '16-day battery life', required: true },
      { type: 'SOFTWARE', name: 'Mi Fit App', required: true },
    ],
  },
  {
    name: 'Amazfit GTR 4',
    manufacturer: 'Zepp Health',
    supplier: 'Amazfit',
    shortSummary: 'Feature-rich smartwatch with dual-band GPS and 14-day battery life',
    description: 'Amazfit GTR 4 combines premium design with dual-band GPS, 150+ sports modes, health monitoring, and impressive battery life up to 14 days.',
    os: 'Zepp OS',
    costMinUSD: 19999, // $199.99
    costMaxUSD: 19999,
    versions: [
      { name: '1.0', releasedAt: new Date('2022-10-12'), notes: 'Initial GTR 4 release' },
      { name: '2.0', releasedAt: new Date('2023-06-20'), notes: 'Zepp OS 2.0 update' },
    ],
    components: [
      { type: 'HARDWARE', name: 'BioTracker 4.0 PPG', spec: '6-in-1 biometric sensor', required: true },
      { type: 'HARDWARE', name: 'Dual-band GPS', spec: 'L1 + L5 positioning', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.43" HD screen', required: true },
      { type: 'HARDWARE', name: '475mAh Battery', spec: '14-day battery life', required: true },
      { type: 'SOFTWARE', name: 'Zepp OS 2.0', required: true },
      { type: 'SOFTWARE', name: 'Zepp App', required: true },
    ],
  },
  {
    name: 'Polar Vantage V3',
    manufacturer: 'Polar',
    supplier: 'Polar',
    shortSummary: 'Premium multisport GPS watch with advanced training features',
    description: 'Polar Vantage V3 is designed for serious athletes with AMOLED display, dual-frequency GPS, comprehensive training metrics, sleep tracking, and recovery insights.',
    os: 'Polar OS',
    costMinUSD: 59999, // $599.99
    costMaxUSD: 59999,
    versions: [
      { name: '1.0', releasedAt: new Date('2023-10-04'), notes: 'Initial Vantage V3 release' },
      { name: '1.2', releasedAt: new Date('2024-02-15'), notes: 'Enhanced recovery metrics' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Polar Precision Prime Sensor', spec: 'Optical HR sensor fusion', required: true },
      { type: 'HARDWARE', name: 'Dual-frequency GPS', spec: 'Multi-GNSS support', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.39" touchscreen', required: true },
      { type: 'HARDWARE', name: 'Skin Temperature Sensor', required: true },
      { type: 'HARDWARE', name: 'Barometer', required: true },
      { type: 'SOFTWARE', name: 'Polar Flow', required: true },
      { type: 'SOFTWARE', name: 'Training Load Pro', required: true },
    ],
  },
  {
    name: 'Huawei Watch GT 4',
    manufacturer: 'Huawei',
    supplier: 'Huawei',
    shortSummary: 'Stylish smartwatch with comprehensive health tracking and long battery life',
    description: 'Huawei Watch GT 4 features elegant design, AMOLED display, TruSeen 5.5+ heart rate monitoring, dual-band GPS, and up to 14 days battery life.',
    os: 'HarmonyOS',
    costMinUSD: 29999, // $299.99
    costMaxUSD: 34999, // $349.99
    versions: [
      { name: '4.0', releasedAt: new Date('2023-09-25'), notes: 'Initial GT 4 release' },
      { name: '4.1', releasedAt: new Date('2024-01-10'), notes: 'HarmonyOS 4 update' },
    ],
    components: [
      { type: 'HARDWARE', name: 'TruSeen 5.5+ Sensor', spec: 'Advanced PPG sensor', required: true },
      { type: 'HARDWARE', name: 'Dual-band GPS', spec: 'Five satellite systems', required: true },
      { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.43" HD screen', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', required: true },
      { type: 'HARDWARE', name: 'Gyroscope', required: true },
      { type: 'SOFTWARE', name: 'HarmonyOS 4', required: true },
      { type: 'SOFTWARE', name: 'Huawei Health', required: true },
    ],
  },
  {
    name: 'Withings ScanWatch 2',
    manufacturer: 'Withings',
    supplier: 'Withings',
    shortSummary: 'Hybrid smartwatch with medical-grade ECG and SpO2 monitoring',
    description: 'Withings ScanWatch 2 combines classic watch design with advanced health sensors including medical-grade ECG, SpO2 monitoring, sleep apnea detection, and 30-day battery life.',
    os: 'Withings OS',
    costMinUSD: 34999, // $349.99
    costMaxUSD: 34999,
    versions: [
      { name: '2.0', releasedAt: new Date('2023-09-12'), notes: 'Initial ScanWatch 2 release' },
      { name: '2.1', releasedAt: new Date('2024-03-01'), notes: 'Improved sleep tracking' },
    ],
    components: [
      { type: 'HARDWARE', name: 'Medical-grade ECG', spec: 'FDA cleared', required: true },
      { type: 'HARDWARE', name: 'SpO2 Sensor', spec: 'Continuous monitoring', required: true },
      { type: 'HARDWARE', name: 'PMOLED Display', spec: 'Grayscale screen', required: true },
      { type: 'HARDWARE', name: 'Altimeter', required: true },
      { type: 'HARDWARE', name: 'Analog Watch Face', required: true },
      { type: 'SOFTWARE', name: 'Withings Health Mate', required: true },
    ],
  },
  {
    name: 'Whoop 4.0',
    manufacturer: 'Whoop',
    supplier: 'Whoop',
    shortSummary: 'Screenless fitness tracker focused on recovery and performance optimization',
    description: 'Whoop 4.0 is a subscription-based fitness tracker with no screen, focusing on strain, recovery, and sleep metrics with 24/7 monitoring and 5-day battery life.',
    os: 'Whoop OS',
    costMinUSD: 0, // Hardware free with subscription
    costMaxUSD: 0,
    versions: [
      { name: '4.0', releasedAt: new Date('2021-09-08'), notes: 'Initial Whoop 4.0 release' },
      { name: '4.1', releasedAt: new Date('2023-05-15'), notes: 'Enhanced recovery algorithms' },
    ],
    components: [
      { type: 'HARDWARE', name: '5-LED PPG Sensor', spec: 'Green, red, and infrared LEDs', required: true },
      { type: 'HARDWARE', name: 'Skin Temperature Sensor', required: true },
      { type: 'HARDWARE', name: 'Accelerometer', spec: '3-axis', required: true },
      { type: 'HARDWARE', name: 'Gyroscope', spec: '3-axis', required: true },
      { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
      { type: 'SOFTWARE', name: 'Whoop App', required: true },
      { type: 'SOFTWARE', name: 'Strain Coach', required: true },
    ],
  },
];

export async function fetchWearablesCatalog(): Promise<SIPData[]> {
  console.log('Loading wearables catalog...');

  const sips: SIPData[] = [];

  for (const wearable of WEARABLES_CATALOG) {
    const sipData: SIPData = {
      name: wearable.name,
      slug: slugify(wearable.name),
      shortSummary: wearable.shortSummary,
      description: wearable.description,
      manufacturer: wearable.manufacturer,
      supplier: wearable.supplier,
      categories: ['Wearables'],
      operatingSystems: [wearable.os],
      costMinUSD: wearable.costMinUSD,
      costMaxUSD: wearable.costMaxUSD,
      versions: wearable.versions,
      components: wearable.components,
      dependencies: [],
    };

    try {
      SIPDataSchema.parse(sipData);
      sips.push(sipData);
      console.log(`✓ Processed: ${wearable.name}`);
    } catch (error) {
      console.error(`Validation failed for ${wearable.name}:`, error);
    }
  }

  console.log(`Wearables Catalog: ${sips.length} SIPs fetched`);
  return sips;
}
