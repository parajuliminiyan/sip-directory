# ETL System Documentation

## Overview

The ETL (Extract, Transform, Load) system automatically fetches real SIP data from various public sources and populates the database. It's designed to be idempotent, fault-tolerant, and easily extensible.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  ETL Pipeline                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Fetchers  │  │ Normalizers │  │  Database  │ │
│  │             │→ │             │→ │   Upsert   │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│                                           ↓        │
│                                    ┌────────────┐  │
│                                    │ Meilisearch│  │
│                                    │   Reindex  │  │
│                                    └────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Sources

### 1. **Apache Projects** (`apache-projects.ts`)
- **URL**: `https://projects.apache.org/json/projects/json`
- **Fetches**: Apache IoT/embedded projects (NuttX, Mynewt, PLC4X, IoTDB)
- **Fallback**: Curated data if API unavailable
- **Category**: Appliances
- **Count**: ~4 SIPs

### 2. **FreeRTOS Devices** (`freertos-devices.ts`)
- **URL**: `https://www.freertos.org/RTOS_ports.html`
- **Fetches**: Supported hardware boards and microcontrollers
- **Fallback**: Curated list of popular development boards
- **Category**: Appliances
- **Count**: ~10 SIPs

### 3. **GitHub Projects** (`github-releases.ts`)
- **APIs**: GitHub Releases API for various RTOS projects
- **Fetches**: Zephyr, RIOT OS, Contiki-NG, ESP-IDF, Arduino, Mbed OS
- **Category**: Appliances
- **Count**: ~6 SIPs

### 4. **Wearables Catalog** (`wearables-catalog.ts`)
- **Source**: Curated catalog with real product data
- **Products**: Apple Watch, Samsung Galaxy Watch, Fitbit, Garmin, Xiaomi, Amazfit, Polar, Huawei, Withings, Whoop
- **Category**: Wearables
- **Count**: ~10 SIPs

## Usage

### Run Full ETL Pipeline

```bash
pnpm etl:fetch
```

This will:
1. Fetch data from all sources in parallel
2. Normalize and validate data
3. Upsert to PostgreSQL database
4. Reindex Meilisearch

### Dry Run (Preview)

```bash
pnpm etl:dry-run
```

Shows what would be imported without making any database changes.

### Run Specific Source

```bash
pnpm etl:source apache-projects
pnpm etl:source freertos-devices
pnpm etl:source wearables-catalog
pnpm etl:source github-projects
```

### Verbose Logging

```bash
pnpm etl:verbose
```

Enables detailed logging output.

## Features

### ✅ Fault Tolerance
- **Retry Logic**: 3 attempts with exponential backoff
- **Graceful Degradation**: Continues with other sources if one fails
- **Fallback Data**: Uses curated data when APIs are unavailable

### ✅ Rate Limiting
- 500ms delay between requests to same domain
- Respects robots.txt (with fallback if unavailable)
- Custom User-Agent headers

### ✅ Data Validation
- Zod schemas validate all fetched data
- Invalid records are logged but don't stop pipeline
- Schema enforcement prevents bad data from entering database

### ✅ Idempotency
- Uses slugs as unique identifiers
- Upsert operations (update if exists, create if not)
- Safe to run multiple times without duplicates

### ✅ Logging
- Timestamped log files in `/logs` directory
- Console output for errors and successes
- Detailed summary report after each run

## Environment Variables

```bash
# Required for database operations
DATABASE_URL=postgresql://...

# Required for search indexing
MEILISEARCH_HOST=https://your-instance.meilisearch.net
MEILISEARCH_API_KEY=your-api-key
```

## Automated Updates

### GitHub Actions
The ETL pipeline runs automatically on the 1st of each month via GitHub Actions.

**Workflow**: `.github/workflows/etl-monthly.yml`

#### Manual Trigger
You can manually trigger the workflow from GitHub UI with options:
- **Dry Run**: Test without database changes
- **Specific Source**: Run only one data source

## Adding New Data Sources

To add a new data source:

1. **Create fetcher** in `etl/sources/your-source.ts`:

```typescript
import { SIPData } from '../types';

export async function fetchYourSource(): Promise<SIPData[]> {
  // Fetch and transform data
  return sips;
}
```

2. **Register in pipeline** (`etl/pipeline.ts`):

```typescript
const DATA_SOURCES: Record<string, SourceFetcher> = {
  // ... existing sources
  'your-source': {
    name: 'Your Source Name',
    fetch: fetchYourSource,
  },
};
```

3. **Test**:

```bash
pnpm etl:source your-source --dry-run
```

## Data Flow

```
┌──────────────┐
│  Raw Data    │  (JSON/HTML/API responses)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Normalize   │  (Map to SIPData schema)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validate    │  (Zod schema validation)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Database    │  (Prisma upsert)
│  - SIP       │
│  - Categories│
│  - OS        │
│  - Versions  │
│  - Components│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Meilisearch  │  (Reindex for search)
└──────────────┘
```

## Expected Output

```
=== ETL Pipeline Started ===
Mode: LIVE
Sources: apache-projects, freertos-devices, wearables-catalog, github-projects

--- Phase 1: Fetching Data ---
✅ Apache Projects: 4 SIPs fetched (1234ms)
✅ FreeRTOS Devices: 10 SIPs fetched (2345ms)
✅ Wearables Catalog: 10 SIPs fetched (123ms)
✅ GitHub Projects: 6 SIPs fetched (3456ms)

Total SIPs fetched: 30

--- Phase 2: Upserting to Database ---
✓ Upserted: Apache NuttX
✓ Upserted: Apache Mynewt
...
✅ Database upsert complete: 30 successful, 0 failed

--- Phase 3: Reindexing Search ---
Indexing 30 documents to Meilisearch...
✅ Indexed 30 SIPs to Meilisearch

=== Pipeline Complete ===

┌─────────────────────────────────────────────────┐
│              ETL Summary Report                 │
├─────────────────────────────────────────────────┤
│ ✅ Apache Projects             4 SIPs │ 1.23s
│ ✅ FreeRTOS Devices           10 SIPs │ 2.35s
│ ✅ Wearables Catalog          10 SIPs │ 0.12s
│ ✅ GitHub Projects             6 SIPs │ 3.46s
├─────────────────────────────────────────────────┤
│ Total SIPs:                                  30 │
│ Successful sources: 4/4                         │
└─────────────────────────────────────────────────┘

✅ Log file: logs/etl-2025-10-19T12-30-45-123Z.log
```

## Troubleshooting

### API Returns 404
- Check if API endpoint has changed
- Verify internet connectivity
- System will use fallback curated data

### Rate Limiting Errors
- Increase delay in `utils.ts` (`rateLimitedRequest`)
- Add exponential backoff

### Database Connection Issues
- Verify `DATABASE_URL` environment variable
- Check database is accessible
- Ensure Prisma client is generated

### Meilisearch Errors
- Verify `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY`
- Check Meilisearch instance is running
- Pipeline will continue even if indexing fails

## Performance

- **Parallel Fetching**: All sources fetch simultaneously
- **Batch Operations**: Database operations are batched per SIP
- **Rate Limiting**: Prevents API throttling
- **Typical Runtime**: 5-10 seconds for all sources

## Data Quality

### Validation Rules
- All SIPs must have: name, slug
- Categories and OS are created/linked automatically
- Versions are optional but recommended
- Components should include type (HARDWARE/SOFTWARE)

### Data Completeness
- **Apache Projects**: ✅ Name, description, OS (fallback available)
- **FreeRTOS**: ✅ Name, manufacturer, processor specs
- **Wearables**: ✅✅✅ Complete data (name, description, costs, versions, components)
- **GitHub Projects**: ✅✅ Name, description, versions from releases

## Future Enhancements

- [ ] Add more wearables manufacturers
- [ ] Scrape product pricing from e-commerce sites
- [ ] Add automotive SIPs (Tesla, Rivian, etc.)
- [ ] Add smart home appliances (Nest, Ring, etc.)
- [ ] Implement incremental updates (only fetch new/changed data)
- [ ] Add data quality metrics dashboard
- [ ] Send notifications on ETL completion
