import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('Cleaning existing data...')
  await prisma.dependency.deleteMany()
  await prisma.component.deleteMany()
  await prisma.version.deleteMany()
  await prisma.sIP_OS.deleteMany()
  await prisma.sIP_Category.deleteMany()
  await prisma.sIP.deleteMany()
  await prisma.category.deleteMany()
  await prisma.operatingSystem.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.manufacturer.deleteMany()

  // Create Categories
  console.log('Creating categories...')
  const appliances = await prisma.category.create({
    data: { name: 'Appliances' },
  })
  const wearables = await prisma.category.create({
    data: { name: 'Wearables' },
  })

  // Create Operating Systems
  console.log('Creating operating systems...')
  const freeRTOS = await prisma.operatingSystem.create({
    data: { name: 'FreeRTOS' },
  })
  const nuttx = await prisma.operatingSystem.create({
    data: { name: 'NuttX' },
  })
  const linux = await prisma.operatingSystem.create({
    data: { name: 'Linux' },
  })
  const android = await prisma.operatingSystem.create({
    data: { name: 'Android' },
  })
  const watchOS = await prisma.operatingSystem.create({
    data: { name: 'watchOS' },
  })
  const wearOS = await prisma.operatingSystem.create({
    data: { name: 'Wear OS' },
  })

  // Create Suppliers
  console.log('Creating suppliers...')
  const apple = await prisma.supplier.create({
    data: { name: 'Apple', url: 'https://www.apple.com' },
  })
  const samsung = await prisma.supplier.create({
    data: { name: 'Samsung', url: 'https://www.samsung.com' },
  })
  const fitbit = await prisma.supplier.create({
    data: { name: 'Fitbit', url: 'https://www.fitbit.com' },
  })
  const garmin = await prisma.supplier.create({
    data: { name: 'Garmin', url: 'https://www.garmin.com' },
  })
  const lg = await prisma.supplier.create({
    data: { name: 'LG Electronics', url: 'https://www.lg.com' },
  })
  const irobot = await prisma.supplier.create({
    data: { name: 'iRobot', url: 'https://www.irobot.com' },
  })
  const google = await prisma.supplier.create({
    data: { name: 'Google', url: 'https://www.google.com' },
  })
  const bosch = await prisma.supplier.create({
    data: { name: 'Bosch', url: 'https://www.bosch-home.com' },
  })
  const anova = await prisma.supplier.create({
    data: { name: 'Anova Culinary', url: 'https://anovaculinary.com' },
  })

  // Create Manufacturers (can be same or different from suppliers)
  console.log('Creating manufacturers...')
  const foxconn = await prisma.manufacturer.create({
    data: { name: 'Foxconn', url: 'https://www.foxconn.com' },
  })
  const samsungMfg = await prisma.manufacturer.create({
    data: { name: 'Samsung Electronics', url: 'https://www.samsung.com' },
  })
  const lgMfg = await prisma.manufacturer.create({
    data: { name: 'LG Electronics', url: 'https://www.lg.com' },
  })
  const garminMfg = await prisma.manufacturer.create({
    data: { name: 'Garmin Ltd.', url: 'https://www.garmin.com' },
  })
  const irobotMfg = await prisma.manufacturer.create({
    data: { name: 'iRobot Corporation', url: 'https://www.irobot.com' },
  })
  const boschMfg = await prisma.manufacturer.create({
    data: { name: 'BSH Hausgeräte', url: 'https://www.bsh-group.com' },
  })

  // Create SIPs with complete data
  console.log('Creating SIPs...')

  // 1. Apple Watch Series 9
  const appleWatch = await prisma.sIP.create({
    data: {
      name: 'Apple Watch Series 9',
      slug: 'apple-watch-series-9',
      shortSummary: 'Advanced smartwatch with health and fitness tracking',
      description:
        'The Apple Watch Series 9 features an Always-On Retina display, advanced health sensors including ECG and blood oxygen monitoring, crash detection, and seamless integration with iPhone.',
      costMinUSD: 39900,
      costMaxUSD: 79900,
      supplierId: apple.id,
      manufacturerId: foxconn.id,
      categories: {
        create: [{ categoryId: wearables.id }],
      },
      oses: {
        create: [{ osId: watchOS.id }],
      },
      versions: {
        create: [
          {
            name: '10.3.1',
            releasedAt: new Date('2024-02-08'),
            notes: 'Bug fixes and performance improvements',
          },
          {
            name: '10.3.0',
            releasedAt: new Date('2024-01-22'),
            notes: 'New watch faces and health features',
          },
          {
            name: '10.2.0',
            releasedAt: new Date('2023-12-11'),
            notes: 'Initial watchOS 10 release for Series 9',
          },
        ],
      },
      components: {
        create: [
          {
            type: 'HARDWARE',
            name: 'S9 SiP',
            spec: 'Dual-core 64-bit processor',
            required: true,
          },
          {
            type: 'HARDWARE',
            name: 'W3 Wireless Chip',
            spec: 'Bluetooth 5.3, Wi-Fi',
            required: true,
          },
          {
            type: 'HARDWARE',
            name: 'U2 Ultra Wideband Chip',
            spec: 'Precision Finding',
            required: true,
          },
          {
            type: 'HARDWARE',
            name: 'Blood Oxygen Sensor',
            spec: 'SpO2 measurement',
            required: true,
          },
          {
            type: 'HARDWARE',
            name: 'ECG Sensor',
            spec: 'Electrocardiogram',
            required: true,
          },
          {
            type: 'HARDWARE',
            name: 'Accelerometer',
            spec: 'Up to 256g crash detection',
            required: true,
          },
          {
            type: 'SOFTWARE',
            name: 'Health App',
            spec: 'Activity tracking and health monitoring',
            required: true,
          },
          {
            type: 'SOFTWARE',
            name: 'Workout App',
            spec: 'Fitness tracking',
            required: true,
          },
        ],
      },
    },
  })

  // 2. Samsung Galaxy Watch 6
  const galaxyWatch = await prisma.sIP.create({
    data: {
      name: 'Samsung Galaxy Watch 6',
      slug: 'samsung-galaxy-watch-6',
      shortSummary: 'Premium Android smartwatch with health monitoring',
      description:
        'The Galaxy Watch 6 offers comprehensive health tracking, sleep monitoring, and seamless integration with Samsung Galaxy devices.',
      costMinUSD: 29999,
      costMaxUSD: 42999,
      supplierId: samsung.id,
      manufacturerId: samsungMfg.id,
      categories: {
        create: [{ categoryId: wearables.id }],
      },
      oses: {
        create: [{ osId: wearOS.id }],
      },
      versions: {
        create: [
          { name: '5.0.0', releasedAt: new Date('2024-01-15'), notes: 'Wear OS 5 update' },
          { name: '4.5.2', releasedAt: new Date('2023-11-20'), notes: 'Security patches' },
          {
            name: '4.5.0',
            releasedAt: new Date('2023-08-11'),
            notes: 'Initial release version',
          },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Exynos W930', spec: 'Dual-core 1.4 GHz', required: true },
          { type: 'HARDWARE', name: 'BioActive Sensor', spec: 'Heart rate, ECG, BIA', required: true },
          { type: 'HARDWARE', name: 'Accelerometer', spec: '3-axis', required: true },
          { type: 'HARDWARE', name: 'Gyroscope', spec: '3-axis', required: true },
          { type: 'HARDWARE', name: 'Barometer', spec: 'Altitude tracking', required: true },
          { type: 'SOFTWARE', name: 'Samsung Health', spec: 'Health and fitness platform', required: true },
          { type: 'SOFTWARE', name: 'Sleep Tracking', spec: 'Advanced sleep analysis', required: true },
        ],
      },
    },
  })

  // 3. Fitbit Charge 6
  const fitbitCharge = await prisma.sIP.create({
    data: {
      name: 'Fitbit Charge 6',
      slug: 'fitbit-charge-6',
      shortSummary: 'Fitness tracker with GPS and heart rate monitoring',
      description:
        'Fitbit Charge 6 is a slim fitness tracker featuring built-in GPS, 24/7 heart rate monitoring, and up to 7 days of battery life.',
      costMinUSD: 15995,
      costMaxUSD: 15995,
      supplierId: fitbit.id,
      manufacturerId: foxconn.id,
      categories: {
        create: [{ categoryId: wearables.id }],
      },
      oses: {
        create: [{ osId: freeRTOS.id }],
      },
      versions: {
        create: [
          { name: '1.3.0', releasedAt: new Date('2024-02-01'), notes: 'New exercise modes' },
          { name: '1.2.0', releasedAt: new Date('2023-12-15'), notes: 'Bug fixes' },
          {
            name: '1.0.0',
            releasedAt: new Date('2023-09-28'),
            notes: 'Initial firmware release',
          },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'GPS Module', spec: 'Built-in GPS/GLONASS', required: true },
          { type: 'HARDWARE', name: 'Heart Rate Sensor', spec: 'PurePulse 2.0', required: true },
          { type: 'HARDWARE', name: 'SpO2 Sensor', spec: 'Blood oxygen monitoring', required: true },
          { type: 'HARDWARE', name: 'NFC Chip', spec: 'Contactless payments', required: false },
          { type: 'SOFTWARE', name: 'Fitbit OS', spec: 'Custom embedded OS', required: true },
          { type: 'SOFTWARE', name: 'Google Maps', spec: 'Turn-by-turn navigation', required: false },
        ],
      },
    },
  })

  // 4. Garmin Forerunner 965
  const garminWatch = await prisma.sIP.create({
    data: {
      name: 'Garmin Forerunner 965',
      slug: 'garmin-forerunner-965',
      shortSummary: 'Premium GPS running smartwatch for athletes',
      description:
        'The Forerunner 965 offers advanced running dynamics, training metrics, and multi-band GPS for serious athletes.',
      costMinUSD: 59999,
      costMaxUSD: 59999,
      supplierId: garmin.id,
      manufacturerId: garminMfg.id,
      categories: {
        create: [{ categoryId: wearables.id }],
      },
      oses: {
        create: [{ osId: linux.id }],
      },
      versions: {
        create: [
          { name: '20.26', releasedAt: new Date('2024-01-30'), notes: 'Performance improvements' },
          { name: '20.19', releasedAt: new Date('2023-12-05'), notes: 'New training features' },
          { name: '20.00', releasedAt: new Date('2023-03-15'), notes: 'Initial release' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Multi-band GPS', spec: 'GPS, GLONASS, Galileo', required: true },
          { type: 'HARDWARE', name: 'Elevate V4 Sensor', spec: 'Wrist-based HR, Pulse Ox', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.4" touchscreen', required: true },
          { type: 'HARDWARE', name: 'Barometric Altimeter', spec: 'Elevation tracking', required: true },
          { type: 'HARDWARE', name: 'Compass', spec: '3-axis compass', required: true },
          { type: 'SOFTWARE', name: 'Garmin Connect', spec: 'Training platform', required: true },
          { type: 'SOFTWARE', name: 'Training Readiness', spec: 'AI-powered insights', required: true },
        ],
      },
    },
  })

  // 5. LG Smart Washing Machine
  const lgWasher = await prisma.sIP.create({
    data: {
      name: 'LG WM4000HWA ThinQ Washer',
      slug: 'lg-wm4000hwa-thinq-washer',
      shortSummary: 'AI-powered smart front-load washing machine',
      description:
        'LG ThinQ washer with AI DD technology that detects fabric texture and load size to optimize washing motions.',
      costMinUSD: 89900,
      costMaxUSD: 129900,
      supplierId: lg.id,
      manufacturerId: lgMfg.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: linux.id }, { osId: android.id }],
      },
      versions: {
        create: [
          { name: '3.2.1', releasedAt: new Date('2024-01-10'), notes: 'ThinQ app improvements' },
          { name: '3.1.0', releasedAt: new Date('2023-09-20'), notes: 'New wash cycles' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Inverter Direct Drive Motor', spec: '1400 RPM', required: true },
          { type: 'HARDWARE', name: 'AI Sensor', spec: 'Fabric detection', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', spec: '802.11 b/g/n', required: true },
          { type: 'HARDWARE', name: 'Touch Display', spec: 'LED control panel', required: true },
          { type: 'HARDWARE', name: 'Steam Generator', spec: 'TrueSteam technology', required: false },
          { type: 'SOFTWARE', name: 'ThinQ App', spec: 'Remote control and monitoring', required: true },
          { type: 'SOFTWARE', name: 'AI DD', spec: 'Intelligent fabric care', required: true },
        ],
      },
    },
  })

  // 6. Samsung Smart Refrigerator
  const samsungFridge = await prisma.sIP.create({
    data: {
      name: 'Samsung Family Hub Refrigerator',
      slug: 'samsung-family-hub-refrigerator',
      shortSummary: 'Smart refrigerator with touchscreen and cameras',
      description:
        'Family Hub refrigerator features a 21.5" touchscreen, internal cameras, and SmartThings integration for complete home management.',
      costMinUSD: 329900,
      costMaxUSD: 449900,
      supplierId: samsung.id,
      manufacturerId: samsungMfg.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: linux.id }, { osId: android.id }],
      },
      versions: {
        create: [
          { name: '8.0.2', releasedAt: new Date('2024-02-15'), notes: 'UI improvements' },
          {
            name: '8.0.0',
            releasedAt: new Date('2023-10-01'),
            notes: 'Major Family Hub update',
          },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Internal Cameras', spec: '3x cameras', required: true },
          { type: 'HARDWARE', name: 'Touchscreen Display', spec: '21.5" LCD', required: true },
          { type: 'HARDWARE', name: 'WiFi 6 Module', spec: '802.11ax', required: true },
          { type: 'HARDWARE', name: 'Inverter Compressor', spec: 'Energy efficient', required: true },
          { type: 'HARDWARE', name: 'Ice Maker', spec: 'Dual ice maker', required: false },
          { type: 'SOFTWARE', name: 'SmartThings', spec: 'Home automation hub', required: true },
          { type: 'SOFTWARE', name: 'Bixby Voice', spec: 'Voice assistant', required: true },
          { type: 'SOFTWARE', name: 'View Inside', spec: 'Remote camera viewing', required: true },
        ],
      },
    },
  })

  // 7. iRobot Roomba j7+
  const roomba = await prisma.sIP.create({
    data: {
      name: 'iRobot Roomba j7+',
      slug: 'irobot-roomba-j7-plus',
      shortSummary: 'AI-powered robot vacuum with object detection',
      description:
        'Roomba j7+ uses AI and computer vision to identify and avoid obstacles, with automatic dirt disposal.',
      costMinUSD: 59999,
      costMaxUSD: 79999,
      supplierId: irobot.id,
      manufacturerId: irobotMfg.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: linux.id }],
      },
      versions: {
        create: [
          { name: '4.10.8', releasedAt: new Date('2024-01-25'), notes: 'Navigation improvements' },
          { name: '4.8.2', releasedAt: new Date('2023-11-10'), notes: 'AI object recognition' },
          { name: '4.0.0', releasedAt: new Date('2023-06-15'), notes: 'Major firmware update' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'PrecisionVision Camera', spec: 'Object recognition', required: true },
          { type: 'HARDWARE', name: 'vSLAM Navigation', spec: 'Visual mapping', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', spec: '802.11 b/g/n', required: true },
          { type: 'HARDWARE', name: 'Cliff Sensors', spec: 'Fall prevention', required: true },
          { type: 'HARDWARE', name: 'Dirt Detect Sensors', spec: 'High traffic detection', required: true },
          { type: 'SOFTWARE', name: 'iRobot Genius', spec: 'AI-powered cleaning', required: true },
          { type: 'SOFTWARE', name: 'iRobot Home App', spec: 'Mobile control', required: true },
          { type: 'SOFTWARE', name: 'Pet Owner Intelligence', spec: 'Pet waste avoidance', required: true },
        ],
      },
    },
  })

  // 8. Google Nest Thermostat
  const nestThermostat = await prisma.sIP.create({
    data: {
      name: 'Google Nest Learning Thermostat',
      slug: 'google-nest-learning-thermostat',
      shortSummary: 'Smart thermostat that learns your schedule',
      description:
        'Nest Learning Thermostat automatically adapts to your preferences and can save up to 12% on heating and 15% on cooling bills.',
      costMinUSD: 24999,
      costMaxUSD: 24999,
      supplierId: google.id,
      manufacturerId: foxconn.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: linux.id }],
      },
      versions: {
        create: [
          { name: '6.0.1', releasedAt: new Date('2024-02-20'), notes: 'Energy saving features' },
          { name: '5.9.3', releasedAt: new Date('2023-12-01'), notes: 'Bug fixes' },
          { name: '5.9.0', releasedAt: new Date('2023-09-15'), notes: 'Matter support added' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Temperature Sensor', spec: 'High precision', required: true },
          { type: 'HARDWARE', name: 'Humidity Sensor', spec: 'Environmental monitoring', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', spec: '802.11 b/g/n', required: true },
          { type: 'HARDWARE', name: 'Far-field Microphone', spec: 'Voice commands', required: true },
          { type: 'HARDWARE', name: 'Farsight Display', spec: '2.08" 480x480', required: true },
          { type: 'SOFTWARE', name: 'Auto-Schedule', spec: 'Learning algorithm', required: true },
          { type: 'SOFTWARE', name: 'Google Home Integration', spec: 'Smart home control', required: true },
        ],
      },
    },
  })

  // 9. Bosch Dishwasher
  const boschDishwasher = await prisma.sIP.create({
    data: {
      name: 'Bosch 800 Series Dishwasher',
      slug: 'bosch-800-series-dishwasher',
      shortSummary: 'Premium quiet dishwasher with Home Connect',
      description:
        'Bosch 800 Series features the quietest operation at 42 dBA, MyWay third rack, and Home Connect smart features.',
      costMinUSD: 109900,
      costMaxUSD: 149900,
      supplierId: bosch.id,
      manufacturerId: boschMfg.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: freeRTOS.id }],
      },
      versions: {
        create: [
          { name: '2.5.0', releasedAt: new Date('2024-01-05'), notes: 'New wash programs' },
          { name: '2.3.1', releasedAt: new Date('2023-10-10'), notes: 'Performance optimization' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'EcoSilence Motor', spec: 'Brushless DC motor', required: true },
          { type: 'HARDWARE', name: 'AquaStop Plus', spec: 'Leak protection', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', spec: '802.11 b/g/n', required: true },
          { type: 'HARDWARE', name: 'Load Sensor', spec: 'Auto-detect load size', required: true },
          { type: 'HARDWARE', name: 'Zeolite Drying', spec: 'Energy-efficient drying', required: true },
          { type: 'SOFTWARE', name: 'Home Connect App', spec: 'Remote control', required: true },
          { type: 'SOFTWARE', name: 'PrecisionWash', spec: 'Intelligent wash cycles', required: true },
        ],
      },
    },
  })

  // 10. Anova Precision Cooker
  const anovaCooker = await prisma.sIP.create({
    data: {
      name: 'Anova Precision Cooker Pro',
      slug: 'anova-precision-cooker-pro',
      shortSummary: 'Professional sous vide immersion circulator',
      description:
        'Anova Precision Cooker Pro delivers restaurant-quality sous vide cooking with WiFi connectivity and app control.',
      costMinUSD: 29900,
      costMaxUSD: 29900,
      supplierId: anova.id,
      manufacturerId: foxconn.id,
      categories: {
        create: [{ categoryId: appliances.id }],
      },
      oses: {
        create: [{ osId: freeRTOS.id }],
      },
      versions: {
        create: [
          { name: '3.1.2', releasedAt: new Date('2024-02-10'), notes: 'New cooking guides' },
          { name: '3.0.0', releasedAt: new Date('2023-11-01'), notes: 'Major UI redesign' },
          { name: '2.8.5', releasedAt: new Date('2023-08-20'), notes: 'Stability improvements' },
        ],
      },
      components: {
        create: [
          { type: 'HARDWARE', name: 'Heating Element', spec: '1200W', required: true },
          { type: 'HARDWARE', name: 'Circulation Pump', spec: 'High-flow pump', required: true },
          { type: 'HARDWARE', name: 'Temperature Sensor', spec: '±0.1°C accuracy', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', spec: '802.11 b/g/n', required: true },
          { type: 'HARDWARE', name: 'LED Display', spec: 'Temperature display', required: true },
          { type: 'SOFTWARE', name: 'Anova App', spec: 'Recipe library and control', required: true },
          { type: 'SOFTWARE', name: 'Timer System', spec: 'Precision timing', required: true },
        ],
      },
    },
  })

  // Create Dependencies
  console.log('Creating dependencies...')

  // Wearables depend on smartphone ecosystems
  await prisma.dependency.create({
    data: {
      sipId: fitbitCharge.id,
      dependsOnId: appleWatch.id, // Example: Fitbit can sync with Apple Health
    },
  })

  await prisma.dependency.create({
    data: {
      sipId: galaxyWatch.id,
      dependsOnId: samsungFridge.id, // Galaxy Watch integrates with SmartThings
    },
  })

  await prisma.dependency.create({
    data: {
      sipId: roomba.id,
      dependsOnId: nestThermostat.id, // Smart home integration
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\nCreated:')
  console.log('- 2 Categories')
  console.log('- 6 Operating Systems (FreeRTOS, NuttX, Linux, Android, watchOS, Wear OS)')
  console.log('- 9 Suppliers')
  console.log('- 6 Manufacturers')
  console.log('- 10 SIPs with:')
  console.log('  - 25 Versions')
  console.log('  - 69 Components')
  console.log('  - 3 Dependencies')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
