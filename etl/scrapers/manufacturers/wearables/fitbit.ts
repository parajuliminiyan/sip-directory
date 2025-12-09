import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

/**
 * Fitbit Scraper (Google-owned)
 * Real-time scraping of Fitbit product pages
 * Returns null if scraping fails - no fallback data
 */
export class FitbitScraper extends BaseScraper {
  constructor() {
    super('https://www.fitbit.com', 'Fitbit');
  }

  async getProductListings(): Promise<string[]> {
    // Fitbit has a simpler product lineup, hardcoded URLs for now
    // Could be enhanced to dynamically discover products from /shop page
    return [
      'https://www.fitbit.com/global/us/products/trackers/charge6',
      'https://www.fitbit.com/global/us/products/smartwatches/sense2',
      'https://www.fitbit.com/global/us/products/smartwatches/versa4',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    try {
      // Try to fetch with Playwright first (Fitbit uses JavaScript rendering)
      let $ = await this.fetchHTMLWithBrowser(url);

      // Fallback to regular fetch if browser fails
      if (!$) {
        console.warn(`Browser fetch failed for ${url}, trying regular fetch...`);
        $ = await this.fetchHTML(url);
      }

      if (!$) {
        console.warn(`All fetch methods failed for ${url}`);
        return null;
      }

      // Extract product data
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('h1[class*="product"]').first().text().trim() ||
                    $('h1').first().text().trim();

      // Use enhanced description extraction
      const { shortSummary, description, technicalSpecs } = this.extractDetailedDescription($);

      // Extract price with advanced method
      let priceMin = null;
      let priceMax = null;

      // Try JSON-LD structured data first
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
          // Ignore JSON parse errors
        }
      });

      // If no price from JSON-LD, use advanced price extraction (includes Buy buttons)
      if (!priceMin) {
        const advancedPrices = this.extractPriceAdvanced($);
        priceMin = advancedPrices.min;
        priceMax = advancedPrices.max;
      }

      // Extract specs/components
      const components: Array<{ type: 'HARDWARE' | 'SOFTWARE'; name: string; spec?: string; required: boolean }> = [];

      $('[class*="spec"] li, [class*="feature"] li, .product-specs li, [class*="detail"] li').each((_, el) => {
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
          } else {
            components.push({
              type: 'HARDWARE',
              name: text,
              required: true,
            });
          }
        }
      });

      // If we have technical specs, add them to components
      if (technicalSpecs) {
        const specsArray = technicalSpecs.split('|').map(s => s.trim()).filter(s => s.length > 0);
        specsArray.forEach(spec => {
          components.push({
            type: 'HARDWARE',
            name: spec.split(':')[0]?.trim() || spec,
            spec: spec.includes(':') ? spec.split(':')[1]?.trim() : undefined,
            required: true,
          });
        });
      }

      // Validate that we have minimum required data
      if (!title || title.length === 0 || title.includes('fitbit.com')) {
        console.warn(`Failed to extract valid title from ${url}`);
        return null;
      }

      if (!priceMin) {
        console.warn(`Failed to extract price from ${url}`);
        return null;
      }

      console.log(`✓ Successfully scraped: ${title}`);

      return {
        name: title,
        slug: slugify(title),
        shortSummary: shortSummary || description?.substring(0, 250) || undefined,
        description: description || undefined,
        costMinUSD: priceMin,
        costMaxUSD: priceMax || priceMin,
        manufacturer: 'Fitbit',
        supplier: 'Google',
        scrapedAt: new Date(),
        dataSource: 'scraped',
        categories: ['Wearables'],
        operatingSystems: ['Fitbit OS'],
        versions: [],
        components: components.length > 0 ? components : [],
        dependencies: [],
      };

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  }
}
