# Scrapers Quick Start Guide

## 🚀 Run Scrapers

### Test Before Running (Dry Run)
```bash
# Test single scraper
pnpm scrape:apple --dry-run

# Test multiple scrapers
pnpm tsx etl/pipeline.ts --source=scrape-apple-watches --source=scrape-xiaomi --dry-run
```

### Run Live (Updates Database)
```bash
# Single manufacturer
pnpm scrape:apple

# All wearables
pnpm scrape:wearables

# All appliances
pnpm scrape:appliances

# Everything (existing ETL + scrapers)
pnpm scrape:all
```

## 📋 Available Commands

| Command | Products | Time | Category |
|---------|----------|------|----------|
| `pnpm scrape:apple` | 3 | ~8s | Wearables |
| `pnpm scrape:samsung` | 3 | <1s | Wearables |
| `pnpm scrape:garmin` | 0* | <1s | Wearables |
| `pnpm scrape:fitbit` | 0* | <1s | Wearables |
| `pnpm scrape:xiaomi` | 3 | <1s | Wearables |
| `pnpm scrape:lg` | 3 | <1s | Appliances |
| `pnpm scrape:samsung-appliances` | 3 | <1s | Appliances |
| `pnpm scrape:irobot` | 3 | <1s | Appliances |

*Currently returning 0 due to URL mismatch (needs fix)

## 🛠️ Add New Manufacturer

1. Create scraper file:
```typescript
// etl/scrapers/manufacturers/wearables/new-brand.ts
import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class NewBrandScraper extends BaseScraper {
  constructor() {
    super('https://www.newbrand.com', 'New Brand');
  }

  async getProductListings(): Promise<string[]> {
    return [
      'https://www.newbrand.com/product-1',
      'https://www.newbrand.com/product-2',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    // Return curated product data
    const products: SIPData[] = [
      {
        name: 'Product Name',
        slug: slugify('Product Name'),
        shortSummary: 'Brief description',
        description: 'Full description',
        costMinUSD: 9999, // $99.99
        costMaxUSD: 9999,
        manufacturer: 'New Brand',
        supplier: 'New Brand',
        categories: ['Wearables'],
        operatingSystems: ['Product OS'],
        versions: [],
        components: [],
        dependencies: [],
      },
    ];

    for (const product of products) {
      if (url.includes(product.slug)) {
        return product;
      }
    }

    return null;
  }
}
```

2. Export from index:
```typescript
// etl/scrapers/manufacturers/wearables/index.ts
export { NewBrandScraper } from './new-brand';
```

3. Add to pipeline:
```typescript
// etl/pipeline.ts
import { NewBrandScraper } from './scrapers/manufacturers/wearables';

const DATA_SOURCES = {
  // ... existing sources
  'scrape-new-brand': {
    name: 'New Brand (Scraper)',
    fetch: async () => new NewBrandScraper().scrapeAll(),
  },
};
```

4. Add CLI command to package.json:
```json
{
  "scripts": {
    "scrape:new-brand": "tsx etl/pipeline.ts --source=scrape-new-brand"
  }
}
```

5. Test:
```bash
pnpm scrape:new-brand --dry-run
```

## 🐛 Troubleshooting

### No Products Found
- Check URLs in `getProductListings()`
- Verify URL matching logic in `scrapeProduct()`
- Use `--verbose` flag for detailed logs

### Products Not Importing
- Run `--dry-run` first to see what would be imported
- Check Zod validation errors in logs
- Verify required fields are present

### Slow Execution
- Rate limiting (2s delay) is intentional
- Run scrapers in parallel: use multiple `--source` flags
- Apple scraper is slowest (~8s) due to delays

## 📊 Check Results

```bash
# Count products in database
pnpm tsx scripts/count-sips.ts

# View in Prisma Studio
pnpm prisma studio
```

## ⚠️ Important Notes

1. **Don't modify existing sources/** - Only add to scrapers/
2. **Test with --dry-run first** - Verify before database changes
3. **Use curated data** - Don't rely on actual scraping
4. **Follow existing patterns** - Copy from working scrapers

## 🎯 Next Steps

1. Fix Garmin URL matching
2. Fix Fitbit URL matching
3. Fix LG duplicate product issue
4. Add more manufacturers (Polar, Amazfit, etc.)
5. Expand to 100+ products

## 📚 Documentation

- Full docs: `etl/scrapers/README.md`
- Implementation summary: `SCRAPER_IMPLEMENTATION_SUMMARY.md`
- Base class: `etl/scrapers/scraper-base.ts`
