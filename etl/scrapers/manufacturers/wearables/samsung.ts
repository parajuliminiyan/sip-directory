import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

/**
 * Samsung Galaxy Watch Scraper
 * Dynamically discovers and scrapes Samsung wearables
 */
export class SamsungWatchScraper extends BaseScraper {
  constructor() {
    super('https://www.samsung.com', 'Samsung');
  }

  async getProductListings(): Promise<string[]> {
    try {
      // Fetch Samsung wearables page with browser for dynamic content
      const $ = await this.fetchHTMLWithBrowser('https://www.samsung.com/us/mobile/wearables/all-wearables/');

      if (!$) {
        console.warn('Failed to fetch Samsung watches main page, using fallback URLs');
        return this.getFallbackUrls();
      }

      const productUrls = new Set<string>();

      // Method 1: Find direct product links
      $('a[href*="/watches/galaxy-watch"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.includes('/buy') && !href.includes('/compare') && !href.includes('?')) {
          let url = href;
          if (url.startsWith('/')) {
            url = `https://www.samsung.com${url}`;
          }
          url = url.split('?')[0].split('#')[0];
          if (!url.endsWith('/')) {
            url += '/';
          }
          productUrls.add(url);
        }
      });

      // Method 2: Look for product cards and navigation
      $('[class*="product"] a, [data-linktype="product"] a, [class*="card"] a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('galaxy-watch') && !href.includes('/buy')) {
          let url = href;
          if (url.startsWith('/')) {
            url = `https://www.samsung.com${url}`;
          }
          url = url.split('?')[0].split('#')[0];
          if (!url.endsWith('/')) {
            url += '/';
          }
          productUrls.add(url);
        }
      });

      // Filter to only actual product pages
      const validUrls = Array.from(productUrls).filter(url => {
        return url.match(/galaxy-watch[^/]*\/$/i) && !url.includes('/accessories');
      });

      if (validUrls.length > 0) {
        console.log(`Discovered ${validUrls.length} Samsung Galaxy Watch product URLs`);
        return validUrls;
      }

      console.warn('No products discovered, using fallback URLs');
      return this.getFallbackUrls();

    } catch (error) {
      console.error('Error discovering Samsung watches:', error);
      return this.getFallbackUrls();
    }
  }

  private getFallbackUrls(): string[] {
    return [
      'https://www.samsung.com/us/watches/galaxy-watch7/',
      'https://www.samsung.com/us/watches/galaxy-watch-ultra/',
      'https://www.samsung.com/us/watches/galaxy-watch6/',
      'https://www.samsung.com/us/watches/galaxy-watch6-classic/',
      'https://www.samsung.com/us/watches/galaxy-watch-fe/',
      'https://www.samsung.com/us/watches/galaxy-watch5/',
      'https://www.samsung.com/us/watches/galaxy-watch5-pro/',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    try {
      // Try to fetch with Playwright first
      let $ = await this.fetchHTMLWithBrowser(url);

      // Fallback to regular fetch
      if (!$) {
        console.warn(`Browser fetch failed for ${url}, trying regular fetch...`);
        $ = await this.fetchHTML(url);
      }

      if (!$) {
        console.warn(`All fetch methods failed for ${url}, using curated data`);
        return this.getCuratedData(url);
      }

      // Extract product data
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('h1[class*="product"]').first().text().trim() ||
                    $('h1').first().text().trim();

      const description = $('meta[name="description"]').attr('content') ||
                         $('meta[property="og:description"]').attr('content') ||
                         '';

      // Extract price
      let priceMin = null;
      let priceMax = null;

      // Try JSON-LD
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonLd = JSON.parse($(el).html() || '{}');
          if (jsonLd['@type'] === 'Product' && jsonLd.offers) {
            const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers : [jsonLd.offers];
            const prices = offers.map((offer: any) => {
              const price = offer.price || offer.lowPrice;
              return price ? parseFloat(price) * 100 : null;
            }).filter((p: any) => p !== null);

            if (prices.length > 0) {
              priceMin = Math.min(...prices);
              priceMax = Math.max(...prices);
            }
          }
        } catch (e) {
          // Ignore
        }
      });

      // Try price selectors
      if (!priceMin) {
        const priceSelectors = [
          '[class*="price"]',
          '[data-price]',
          '.pd-g-price',
          '[class*="price-display"]',
        ];

        for (const selector of priceSelectors) {
          const priceText = $(selector).first().text().match(/\$?([\d,]+)\.?(\d{2})?/);
          if (priceText) {
            const dollars = priceText[1].replace(/,/g, '');
            const cents = priceText[2] || '00';
            priceMin = parseInt(dollars) * 100 + parseInt(cents);
            break;
          }
        }
      }

      // Extract specs
      const components: Array<{ type: 'HARDWARE' | 'SOFTWARE'; name: string; spec?: string; required: boolean }> = [];

      $('[class*="spec"] li, [class*="feature"] li, .pd-g-specs li').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0 && text.length < 200) {
          const parts = text.split(':');
          if (parts.length === 2) {
            components.push({
              type: 'HARDWARE',
              name: parts[0].trim(),
              spec: parts[1].trim(),
              required: true,
            });
          } else if (text.length > 3) {
            components.push({
              type: 'HARDWARE',
              name: text,
              required: true,
            });
          }
        }
      });

      // If we got good data, return it
      if (title && title.length > 0 && !title.includes('samsung.com')) {
        console.log(`✓ Successfully scraped: ${title}`);

        return {
          name: title,
          slug: slugify(title),
          shortSummary: description.substring(0, 250) || `${title} - Samsung smartwatch`,
          description: description || `${title} with advanced features and Samsung ecosystem integration.`,
          costMinUSD: priceMin || 29999,
          costMaxUSD: priceMax || priceMin || 42999,
          manufacturer: 'Samsung',
          supplier: 'Samsung',
          scrapedAt: new Date(),
          dataSource: 'scraped',
          categories: ['Wearables'],
          operatingSystems: ['Wear OS'],
          versions: [
            {
              name: 'Wear OS 4',
              releasedAt: new Date('2023-08-11'),
              notes: 'Latest Wear OS version',
            },
          ],
          components: components.length > 0 ? components : [
            { type: 'HARDWARE', name: 'Super AMOLED Display', required: true },
            { type: 'HARDWARE', name: 'BioActive Sensor', required: true },
            { type: 'HARDWARE', name: 'GPS', required: true },
            { type: 'SOFTWARE', name: 'Wear OS', required: true },
          ],
          dependencies: [],
        };
      }

      // Fallback to curated data
      console.warn(`Incomplete scraping data for ${url}, using curated data`);
      return this.getCuratedData(url);

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return this.getCuratedData(url);
    }
  }

  private getCuratedData(url: string): SIPData | null {
    const products: Record<string, SIPData> = {
      'galaxy-watch7': {
        name: 'Samsung Galaxy Watch7',
        slug: slugify('Samsung Galaxy Watch7'),
        shortSummary: 'Latest Galaxy Watch with enhanced AI features and improved battery life',
        description: 'Samsung Galaxy Watch7 features advanced AI health monitoring, improved Exynos processor, enhanced battery life, and comprehensive fitness tracking powered by Wear OS 5.',
        costMinUSD: 29999, // $299.99
        costMaxUSD: 44999, // $449.99
        manufacturer: 'Samsung',
        supplier: 'Samsung',
        categories: ['Wearables'],
        operatingSystems: ['Wear OS'],
        versions: [
          {
            name: '7.0',
            releasedAt: new Date('2024-07-24'),
            notes: 'Latest release with Wear OS 5 and AI features',
          },
        ],
        components: [
          { type: 'HARDWARE', name: 'Exynos W1000', spec: '3nm processor', required: true },
          { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Heart rate, ECG, body composition, sleep apnea detection', required: true },
          { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.3" or 1.5" Sapphire Crystal', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'Dual-frequency GPS', required: true },
          { type: 'SOFTWARE', name: 'Wear OS 5', required: true },
          { type: 'SOFTWARE', name: 'One UI Watch 6', required: true },
        ],
        dependencies: [],
      },
      'galaxy-watch-ultra': {
        name: 'Samsung Galaxy Watch Ultra',
        slug: slugify('Samsung Galaxy Watch Ultra'),
        shortSummary: 'Ultra-rugged smartwatch for extreme sports and outdoor adventures',
        description: 'Samsung Galaxy Watch Ultra is built for endurance with titanium case, extended battery life, enhanced GPS accuracy, and advanced fitness tracking for extreme conditions.',
        costMinUSD: 64999, // $649.99
        costMaxUSD: 69999, // $699.99
        manufacturer: 'Samsung',
        supplier: 'Samsung',
        categories: ['Wearables'],
        operatingSystems: ['Wear OS'],
        versions: [
          {
            name: '1.0',
            releasedAt: new Date('2024-07-24'),
            notes: 'Ultra edition with rugged features',
          },
        ],
        components: [
          { type: 'HARDWARE', name: 'Titanium Case', spec: 'Grade 4 titanium', required: true },
          { type: 'HARDWARE', name: 'Exynos W1000', spec: '3nm processor', required: true },
          { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.5" with 3000 nits brightness', required: true },
          { type: 'HARDWARE', name: 'Dual-Frequency GPS', spec: 'L1 + L5 bands', required: true },
          { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Advanced health monitoring', required: true },
          { type: 'HARDWARE', name: 'Quick Button', spec: 'Customizable action button', required: true },
          { type: 'SOFTWARE', name: 'Wear OS 5', required: true },
        ],
        dependencies: [],
      },
      'galaxy-watch6': {
        name: 'Samsung Galaxy Watch6',
        slug: slugify('Samsung Galaxy Watch6'),
        shortSummary: 'Premium Wear OS smartwatch with advanced health tracking and Samsung ecosystem integration',
        description: 'Samsung Galaxy Watch6 features Exynos W930 processor, Super AMOLED display, advanced sleep tracking with sleep coaching, body composition analysis, and comprehensive fitness features powered by Wear OS 4.',
        costMinUSD: 29999, // $299.99
        costMaxUSD: 42999, // $429.99
        manufacturer: 'Samsung',
        supplier: 'Samsung',
        categories: ['Wearables'],
        operatingSystems: ['Wear OS'],
        versions: [
          {
            name: '6.0',
            releasedAt: new Date('2023-08-11'),
            notes: 'Initial release with Wear OS 4',
          },
        ],
        components: [
          { type: 'HARDWARE', name: 'Exynos W930', spec: '5nm dual-core 1.4GHz processor', required: true },
          { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Heart rate, ECG, body composition', required: true },
          { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.3" or 1.5" Sapphire Crystal', required: true },
          { type: 'HARDWARE', name: 'Accelerometer', required: true },
          { type: 'HARDWARE', name: 'Gyroscope', required: true },
          { type: 'HARDWARE', name: 'Barometer', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'GPS, GLONASS, Galileo', required: true },
          { type: 'SOFTWARE', name: 'Wear OS 4', required: true },
          { type: 'SOFTWARE', name: 'One UI Watch 5', required: true },
        ],
        dependencies: [],
      },
      'galaxy-watch6-classic': {
        name: 'Samsung Galaxy Watch6 Classic',
        slug: slugify('Samsung Galaxy Watch6 Classic'),
        shortSummary: 'Premium rotating bezel smartwatch with classic design and advanced health features',
        description: 'Samsung Galaxy Watch6 Classic brings back the iconic rotating bezel with premium stainless steel build, larger display options, and all the health and fitness features of the Galaxy Watch6.',
        costMinUSD: 39999, // $399.99
        costMaxUSD: 52999, // $529.99
        manufacturer: 'Samsung',
        supplier: 'Samsung',
        categories: ['Wearables'],
        operatingSystems: ['Wear OS'],
        versions: [
          {
            name: '6.0',
            releasedAt: new Date('2023-08-11'),
            notes: 'Classic edition with rotating bezel',
          },
        ],
        components: [
          { type: 'HARDWARE', name: 'Exynos W930', spec: '5nm dual-core 1.4GHz processor', required: true },
          { type: 'HARDWARE', name: 'Rotating Bezel', spec: 'Physical rotating bezel for navigation', required: true },
          { type: 'HARDWARE', name: 'Stainless Steel Case', required: true },
          { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Heart rate, ECG, body composition', required: true },
          { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.3" or 1.5" Sapphire Crystal', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'GPS, GLONASS, Galileo', required: true },
          { type: 'SOFTWARE', name: 'Wear OS 4', required: true },
          { type: 'SOFTWARE', name: 'One UI Watch 5', required: true },
        ],
        dependencies: [],
      },
      'galaxy-watch-fe': {
        name: 'Samsung Galaxy Watch FE',
        slug: slugify('Samsung Galaxy Watch FE'),
        shortSummary: 'Essential features at an affordable price with Galaxy Watch quality',
        description: 'Samsung Galaxy Watch FE offers core Galaxy Watch features including heart rate monitoring, sleep tracking, fitness tracking, and Wear OS compatibility at an accessible price point.',
        costMinUSD: 19999, // $199.99
        costMaxUSD: 19999,
        manufacturer: 'Samsung',
        supplier: 'Samsung',
        categories: ['Wearables'],
        operatingSystems: ['Wear OS'],
        versions: [
          {
            name: '1.0',
            releasedAt: new Date('2024-06-24'),
            notes: 'Fan Edition with essentials',
          },
        ],
        components: [
          { type: 'HARDWARE', name: 'Exynos W920', spec: 'Dual-core processor', required: true },
          { type: 'HARDWARE', name: 'Samsung BioActive Sensor', spec: 'Heart rate monitoring', required: true },
          { type: 'HARDWARE', name: 'Super AMOLED Display', spec: '1.2" display', required: true },
          { type: 'HARDWARE', name: 'GPS', required: true },
          { type: 'SOFTWARE', name: 'Wear OS 4', required: true },
          { type: 'SOFTWARE', name: 'Samsung Health', required: true },
        ],
        dependencies: [],
      },
    };

    for (const [key, data] of Object.entries(products)) {
      if (url.includes(key)) {
        return data;
      }
    }

    return null;
  }
}
