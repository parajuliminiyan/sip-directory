# Web Scrapers for SIP Directory

This directory contains web scrapers for collecting real product data from manufacturer websites.

## Architecture

```
scrapers/
├── scraper-base.ts          # Base class for all scrapers
├── manufacturers/
│   ├── wearables/           # Smartwatch/fitness tracker scrapers
│   │   ├── apple.ts
│   │   ├── samsung.ts
│   │   ├── garmin.ts
│   │   ├── fitbit.ts
│   │   ├── xiaomi.ts
│   │   └── index.ts
│   └── appliances/          # Smart appliance scrapers
│       ├── lg.ts
│       ├── samsung-appliances.ts
│       ├── irobot.ts
│       └── index.ts
└── README.md
```

## How Scrapers Work

1. **BaseScraper Class** (`scraper-base.ts`)
   - All scrapers extend this base class
   - Provides common functionality:
     - robots.txt checking
     - Rate limiting (2 seconds between requests)
     - HTML fetching with error handling
     - Helper methods for data extraction

2. **Manufacturer Scrapers**
   - Each extends `BaseScraper`
   - Implements two required methods:
     - `getProductListings()` - Returns array of product URLs
     - `scrapeProduct(url)` - Extracts data from product page
   - Returns array of `SIPData` objects

## Creating a New Scraper

### Example: Basic Scraper

```typescript
import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class ManufacturerScraper extends BaseScraper {
  constructor() {
    super('https://www.manufacturer.com', 'Manufacturer Name');
  }

  async getProductListings(): Promise<string[]> {
    // Option 1: Hardcoded URLs (most reliable)
    return [
      'https://www.manufacturer.com/product-1',
      'https://www.manufacturer.com/product-2',
    ];

    // Option 2: Scrape product listing page
    const $ = await this.fetchHTML(this.baseUrl + '/products');
    if (!$) return [];

    const urls: string[] = [];
    $('.product-link').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        urls.push(new URL(href, this.baseUrl).toString());
      }
    });

    return urls;
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    const $ = await this.fetchHTML(url);
    if (!$) return null;

    try {
      // Extract data using cheerio selectors
      const name = this.extractText($, 'h1.product-title');
      const priceText = this.extractText($, '.price');
      const description = this.extractText($, '.product-description');

      if (!name) return null;

      const costMinUSD = priceText ? this.extractPrice(priceText) : null;

      return {
        name,
        slug: slugify(name),
        shortSummary: description?.slice(0, 200) || null,
        description,
        costMinUSD,
        costMaxUSD: costMinUSD,
        manufacturer: this.manufacturer,
        supplier: this.manufacturer,
        categories: ['Wearables'], // or 'Appliances'
        operatingSystems: ['Product OS'],
        versions: [],
        components: [],
        dependencies: [],
      };
    } catch (error) {
      console.error(`Failed to parse ${url}:`, error);
      return null;
    }
  }
}
```

## Best Practices

### 1. Respect robots.txt
- Always check robots.txt before scraping
- Base class handles this automatically
- If blocked, scraper returns empty array

### 2. Rate Limiting
- 2 second delay between requests (enforced by base class)
- Prevents overwhelming manufacturer servers
- Prevents IP bans

### 3. Error Handling
- Return `null` if product can't be scraped
- Don't crash the entire pipeline
- Log errors for debugging

### 4. Data Quality
- Only return products with complete data
- Validate required fields (name, price, etc.)
- Skip discontinued/invalid products

### 5. Selectors
- Use specific, stable CSS selectors
- Avoid brittle selectors (nth-child, etc.)
- Test selectors on actual product pages

## Running Scrapers

### Individual Manufacturer
```bash
pnpm scrape:apple        # Apple watches only
pnpm scrape:samsung      # Samsung watches only
```

### By Category
```bash
pnpm scrape:wearables    # All wearable scrapers
pnpm scrape:appliances   # All appliance scrapers
```

### All Scrapers
```bash
pnpm scrape:all          # Existing ETL + all scrapers
```

### Dry Run
```bash
pnpm etl:dry-run --source scrape-apple-watches
```

## Troubleshooting

### Scraper Returns Empty Array
1. Check if robots.txt blocks scraping
2. Verify product URLs are correct
3. Check if HTML structure changed

### Scraper Fails with Errors
1. Check network connectivity
2. Verify selectors match current HTML
3. Check console logs for specific errors

### Products Not Imported
1. Verify required fields are present
2. Check Zod validation in pipeline
3. Review ETL logs in `/logs`

## Maintenance

### When to Update Scrapers
- Website redesign
- URL structure changes
- Product listing format changes

### Testing Scrapers
1. Run with `--dry-run` first
2. Check console output for errors
3. Verify data in Prisma Studio
4. Test on 1-2 products before full run

## Ethical Considerations

- **Educational Use Only**: These scrapers are for academic research
- **Respect Terms of Service**: Check manufacturer ToS before scraping
- **Rate Limiting**: Built-in delays prevent server overload
- **robots.txt Compliance**: Automatic checking and respect
- **User Agent**: Identifies as educational bot
- **No Commercial Use**: Data for research purposes only

## Future Enhancements

- [ ] Caching of product pages
- [ ] Incremental updates (only new products)
- [ ] Structured data extraction (JSON-LD)
- [ ] Price history tracking
- [ ] Availability monitoring
- [ ] Review aggregation

## Support

For issues or questions:
1. Check console logs
2. Review ETL log files in `/logs`
3. Verify HTML selectors on live website
4. Create GitHub issue with error details
