import { PrismaClient } from '@prisma/client';
import { SIPData, FetchResult, ETLOptions, SourceFetcher } from './types';
import { ETLLogger } from './logger';
import { fetchApacheProjects } from './sources/apache-projects';
import { fetchFreeRTOSDevices } from './sources/freertos-devices';
import { fetchWearablesCatalog } from './sources/wearables-catalog';
import { fetchGitHubProjects } from './sources/github-releases';
import { slugify } from './utils';

// NEW: Import scrapers
import { AppleScraper, SamsungWatchScraper, GarminScraper, FitbitScraper, XiaomiScraper } from './scrapers/manufacturers/wearables';
import { LGScraper, LGThinQScraper, SamsungAppliancesScraper, SamsungSmartThingsScraper, iRobotScraper } from './scrapers/manufacturers/appliances';

const prisma = new PrismaClient();

// Available data sources
const DATA_SOURCES: Record<string, SourceFetcher> = {
  // EXISTING SOURCES - DO NOT MODIFY
  'apache-projects': {
    name: 'Apache Projects',
    fetch: fetchApacheProjects, 
  },
  'freertos-devices': {
    name: 'FreeRTOS Devices',
    fetch: fetchFreeRTOSDevices,
  },
  'wearables-catalog': {
    name: 'Wearables Catalog',
    fetch: fetchWearablesCatalog,
  },
  'github-projects': {
    name: 'GitHub Projects',
    fetch: fetchGitHubProjects,
  },

  // NEW SCRAPER SOURCES - WEARABLES
  'scrape-apple-watches': {
    name: 'Apple Watches (Scraper)',
    fetch: async () => new AppleScraper().scrapeAll(),
  },
  'scrape-samsung-watches': {
    name: 'Samsung Watches (Scraper)',
    fetch: async () => new SamsungWatchScraper().scrapeAll(),
  },
  'scrape-garmin-watches': {
    name: 'Garmin Watches (Scraper)',
    fetch: async () => new GarminScraper().scrapeAll(),
  },
  'scrape-fitbit': {
    name: 'Fitbit (Scraper)',
    fetch: async () => new FitbitScraper().scrapeAll(),
  },
  'scrape-xiaomi': {
    name: 'Xiaomi Wearables (Scraper)',
    fetch: async () => new XiaomiScraper().scrapeAll(),
  },

  // NEW SCRAPER SOURCES - APPLIANCES
  'scrape-lg': {
    name: 'LG Appliances (Scraper)',
    fetch: async () => new LGScraper().scrapeAll(),
  },
  'scrape-lg-thinq': {
    name: 'LG ThinQ Smart Appliances (Scraper)',
    fetch: async () => new LGThinQScraper().scrapeAll(),
  },
  'scrape-samsung-appliances': {
    name: 'Samsung Appliances (Scraper)',
    fetch: async () => new SamsungAppliancesScraper().scrapeAll(),
  },
  'scrape-samsung-smartthings': {
    name: 'Samsung SmartThings Appliances (Scraper)',
    fetch: async () => new SamsungSmartThingsScraper().scrapeAll(),
  },
  'scrape-irobot': {
    name: 'iRobot (Scraper)',
    fetch: async () => new iRobotScraper().scrapeAll(),
  },
};

export async function runETLPipeline(options: ETLOptions = {}): Promise<void> {
  const logger = new ETLLogger(options.verbose);
  await logger.init();

  const { dryRun = false, sources = Object.keys(DATA_SOURCES) } = options;

  await logger.info('=== ETL Pipeline Started ===');
  await logger.info(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  await logger.info(`Sources: ${sources.join(', ')}`);

  const results: FetchResult[] = [];

  // Phase 1: Fetch data from all sources in parallel
  await logger.info('\n--- Phase 1: Fetching Data ---');

  const fetchPromises = sources.map(async (sourceKey) => {
    const source = DATA_SOURCES[sourceKey];
    if (!source) {
      await logger.warn(`Unknown source: ${sourceKey}`);
      return null;
    }

    const startTime = Date.now();
    try {
      await logger.info(`Fetching from ${source.name}...`);
      const sips = await source.fetch();
      const duration = Date.now() - startTime;

      await logger.success(`${source.name}: ${sips.length} SIPs fetched (${duration}ms)`);

      return {
        source: source.name,
        success: true,
        sipsCount: sips.length,
        duration,
        data: sips,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await logger.error(`${source.name} failed: ${errorMessage}`);

      return {
        source: source.name,
        success: false,
        sipsCount: 0,
        duration,
        error: errorMessage,
      };
    }
  });

  const fetchedResults = await Promise.all(fetchPromises);
  const allSIPs: SIPData[] = [];

  for (const result of fetchedResults) {
    if (result && result.success && 'data' in result) {
      results.push(result);
      allSIPs.push(...(result.data as SIPData[]));
    } else if (result && !result.success) {
      results.push(result);
    }
  }

  await logger.info(`\nTotal SIPs fetched: ${allSIPs.length}`);

  if (dryRun) {
    await logger.info('\n--- DRY RUN: Skipping database operations ---');
    await logger.info(`Would have imported ${allSIPs.length} SIPs`);
    printSummary(results, logger);
    return;
  }

  // Phase 2: Upsert to database
  await logger.info('\n--- Phase 2: Upserting to Database ---');

  let successCount = 0;
  let errorCount = 0;

  for (const sipData of allSIPs) {
    try {
      await upsertSIP(sipData, logger);
      successCount++;
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logger.error(`Failed to upsert ${sipData.name}: ${errorMessage}`);
    }
  }

  await logger.success(`Database upsert complete: ${successCount} successful, ${errorCount} failed`);

  // Phase 3: Reindex Meilisearch
  await logger.info('\n--- Phase 3: Reindexing Search ---');

  try {
    await reindexSearch(logger);
    await logger.success('Search reindexing complete');
  } catch (error) {
    await logger.error(`Search reindexing failed: ${error}`);
  }

  // Print summary
  await logger.info('\n=== Pipeline Complete ===');
  printSummary(results, logger);

  await logger.success(`Log file: ${logger.getLogPath()}`);

  await prisma.$disconnect();
}

async function upsertSIP(sipData: SIPData, logger: ETLLogger): Promise<void> {
  // Get or create supplier
  let supplier = null;
  if (sipData.supplier) {
    supplier = await prisma.supplier.upsert({
      where: { name: sipData.supplier },
      update: {},
      create: { name: sipData.supplier },
    });
  }

  // Get or create manufacturer
  let manufacturer = null;
  if (sipData.manufacturer) {
    manufacturer = await prisma.manufacturer.upsert({
      where: { name: sipData.manufacturer },
      update: {},
      create: { name: sipData.manufacturer },
    });
  }

  // Upsert SIP
  const sip = await prisma.sIP.upsert({
    where: { slug: sipData.slug },
    update: {
      name: sipData.name,
      shortSummary: sipData.shortSummary,
      description: sipData.description,
      costMinUSD: sipData.costMinUSD,
      costMaxUSD: sipData.costMaxUSD,
      supplierId: supplier?.id,
      manufacturerId: manufacturer?.id,
      scrapedAt: sipData.scrapedAt,
      dataSource: sipData.dataSource || 'manual',
    },
    create: {
      name: sipData.name,
      slug: sipData.slug,
      shortSummary: sipData.shortSummary,
      description: sipData.description,
      costMinUSD: sipData.costMinUSD,
      costMaxUSD: sipData.costMaxUSD,
      supplierId: supplier?.id,
      manufacturerId: manufacturer?.id,
      scrapedAt: sipData.scrapedAt,
      dataSource: sipData.dataSource || 'manual',
    },
  });

  // Delete existing relations to allow clean update
  await prisma.sIP_Category.deleteMany({ where: { sipId: sip.id } });
  await prisma.sIP_OS.deleteMany({ where: { sipId: sip.id } });
  await prisma.version.deleteMany({ where: { sipId: sip.id } });
  await prisma.component.deleteMany({ where: { sipId: sip.id } });

  // Create categories
  for (const categoryName of sipData.categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    await prisma.sIP_Category.create({
      data: {
        sipId: sip.id,
        categoryId: category.id,
      },
    });
  }

  // Create OS associations
  for (const osName of sipData.operatingSystems) {
    const os = await prisma.operatingSystem.upsert({
      where: { name: osName },
      update: {},
      create: { name: osName },
    });

    await prisma.sIP_OS.create({
      data: {
        sipId: sip.id,
        osId: os.id,
      },
    });
  }

  // Create versions
  for (const versionData of sipData.versions) {
    await prisma.version.create({
      data: {
        sipId: sip.id,
        name: versionData.name,
        releasedAt: versionData.releasedAt,
        notes: versionData.notes,
      },
    });
  }

  // Create components
  for (const componentData of sipData.components) {
    await prisma.component.create({
      data: {
        sipId: sip.id,
        type: componentData.type,
        name: componentData.name,
        spec: componentData.spec,
        required: componentData.required,
      },
    });
  }

  await logger.info(`✓ Upserted: ${sipData.name}`);
}

async function reindexSearch(logger: ETLLogger): Promise<void> {
  // Check if Typesense is configured
  if (!process.env.TYPESENSE_HOST || !process.env.TYPESENSE_API_KEY) {
    await logger.warn('Typesense not configured, skipping search indexing');
    return;
  }

  // Dynamic import to avoid errors if module not installed yet
  try {
    const { Client } = await import('typesense');

    const client = new Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108'),
          protocol: (process.env.TYPESENSE_PROTOCOL || 'http') as 'http' | 'https',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || '',
      connectionTimeoutSeconds: 2,
    });

    // Fetch all SIPs with relations
    const sips = await prisma.sIP.findMany({
      include: {
        categories: { include: { category: true } },
        oses: { include: { os: true } },
        supplier: true,
        manufacturer: true,
        versions: true,
        components: true,
        dependencies: { include: { dependsOn: true } },
      },
    });

    // Transform to search documents
    const documents = sips.map((sip) => ({
      id: sip.id,
      name: sip.name,
      slug: sip.slug,
      categories: sip.categories.map((c) => c.category.name),
      oses: sip.oses.map((o) => o.os.name),
      supplier: sip.supplier?.name || '',
      manufacturer: sip.manufacturer?.name || '',
      shortSummary: sip.shortSummary || '',
      description: sip.description || '',
      costMinUSD: sip.costMinUSD || 0,
      costMaxUSD: sip.costMaxUSD || 0,
      versions: sip.versions.map((v) => ({
        name: v.name,
        releasedAt: v.releasedAt?.toISOString(),
      })),
      components: sip.components.map((c) => ({
        type: c.type,
        name: c.name,
        spec: c.spec,
      })),
      dependencies: sip.dependencies.map((d) => d.dependsOn.name),
    }));

    await logger.info(`Indexing ${documents.length} documents to Typesense...`);

    // Ensure collection exists with proper schema
    const collectionName = 'sips';
    try {
      await client.collections(collectionName).retrieve();
      await logger.info('Typesense collection exists');
    } catch (error: any) {
      if (error.httpStatus === 404) {
        await logger.info('Creating Typesense collection...');
        await client.collections().create({
          name: collectionName,
          fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'slug', type: 'string' },
            { name: 'shortSummary', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'categories', type: 'string[]', facet: true },
            { name: 'oses', type: 'string[]', facet: true },
            { name: 'supplier', type: 'string', facet: true },
            { name: 'manufacturer', type: 'string', facet: true },
            { name: 'costMinUSD', type: 'int32' }, // Required: default sorting field
            { name: 'costMaxUSD', type: 'int32', optional: true },
            { name: 'versions', type: 'object[]', optional: true },
            { name: 'components', type: 'object[]', optional: true },
            { name: 'dependencies', type: 'string[]', optional: true },
          ],
        } as any);
      } else {
        throw error;
      }
    }

    // Import documents (upsert mode)
    if (documents.length > 0) {
      await client.collections(collectionName).documents().import(documents, { action: 'upsert' });
      await logger.success(`Indexed ${documents.length} SIPs to Typesense`);
    } else {
      await logger.warn('No documents to index');
    }
  } catch (error) {
    await logger.error(`Typesense indexing failed: ${error}`);
    throw error;
  }
}

function printSummary(results: FetchResult[], logger: ETLLogger): void {
  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│              ETL Summary Report                 │');
  console.log('├─────────────────────────────────────────────────┤');

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`│ ${status} ${result.source.padEnd(25)} ${String(result.sipsCount).padStart(3)} SIPs │ ${duration}s`);
  }

  const totalSIPs = results.reduce((sum, r) => sum + r.sipsCount, 0);
  const successfulSources = results.filter((r) => r.success).length;

  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│ Total SIPs: ${String(totalSIPs).padStart(35)} │`);
  console.log(`│ Successful sources: ${successfulSources}/${results.length}`.padEnd(50) + '│');
  console.log('└─────────────────────────────────────────────────┘\n');
}

// CLI entry point
export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const options: ETLOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  // Check for specific sources (support multiple --source= args)
  const sourceArgs = args.filter((arg) => arg.startsWith('--source='));
  if (sourceArgs.length > 0) {
    options.sources = sourceArgs.map((arg) => arg.split('=')[1]);
  }

  try {
    await runETLPipeline(options);
    process.exit(0);
  } catch (error) {
    console.error('ETL Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
