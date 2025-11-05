import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class XiaomiScraper extends BaseScraper {
  constructor() {
    super('https://www.mi.com', 'Xiaomi');
  }

  async getProductListings(): Promise<string[]> {
    return [
      'https://www.mi.com/global/product/xiaomi-smart-band-8/',
      'https://www.mi.com/global/product/redmi-watch-3/',
      'https://www.mi.com/global/product/xiaomi-watch-s1-pro/',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    const products: SIPData[] = [
      {
        name: 'Xiaomi Smart Band 8',
        slug: slugify('Xiaomi Smart Band 8'),
        shortSummary: 'Affordable fitness tracker with AMOLED display and 16-day battery life',
        description: 'Xiaomi Smart Band 8 offers excellent value with 1.62" AMOLED display, 24/7 heart rate monitoring, sleep tracking, SpO2 measurement, and impressive 16-day battery life.',
        costMinUSD: 4999,
        costMaxUSD: 4999,
        manufacturer: 'Xiaomi',
        supplier: 'Xiaomi',
        categories: ['Wearables'],
        operatingSystems: ['Mi Band OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'PPG Heart Rate Sensor', required: true },
          { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.62" color screen', required: true },
          { type: 'HARDWARE', name: '190mAh Battery', spec: '16-day battery life', required: true },
          { type: 'SOFTWARE', name: 'Mi Fitness App', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Redmi Watch 3',
        slug: slugify('Redmi Watch 3'),
        shortSummary: 'Budget smartwatch with GPS and 12-day battery life',
        description: 'Redmi Watch 3 features large 1.75" AMOLED display, built-in GPS, 120+ sports modes, and exceptional 12-day battery life at an affordable price.',
        costMinUSD: 7999,
        costMaxUSD: 7999,
        manufacturer: 'Xiaomi',
        supplier: 'Xiaomi',
        categories: ['Wearables'],
        operatingSystems: ['Redmi OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.75" screen', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'Built-in GPS', required: true },
          { type: 'HARDWARE', name: 'PPG Sensor', required: true },
          { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Xiaomi Watch S1 Pro',
        slug: slugify('Xiaomi Watch S1 Pro'),
        shortSummary: 'Premium Xiaomi smartwatch with sapphire glass and dual-band GPS',
        description: 'Xiaomi Watch S1 Pro offers premium build quality with sapphire crystal glass, dual-band GPS, comprehensive health tracking, and 12-day battery life.',
        costMinUSD: 29999,
        costMaxUSD: 29999,
        manufacturer: 'Xiaomi',
        supplier: 'Xiaomi',
        categories: ['Wearables'],
        operatingSystems: ['HyperOS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'Sapphire Glass', required: true },
          { type: 'HARDWARE', name: 'Dual-band GPS', spec: 'L1 + L5', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.47" screen', required: true },
          { type: 'HARDWARE', name: 'PPG Sensor', spec: 'Heart rate + SpO2', required: true },
        ],
        dependencies: [],
      },
    ];

    for (const product of products) {
      if (url.toLowerCase().includes(product.slug)) {
        return product;
      }
    }

    return null;
  }
}
