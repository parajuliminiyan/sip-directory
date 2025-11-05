import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class FitbitScraper extends BaseScraper {
  constructor() {
    super('https://www.fitbit.com', 'Fitbit');
  }

  async getProductListings(): Promise<string[]> {
    return [
      'https://www.fitbit.com/global/us/products/trackers/charge6',
      'https://www.fitbit.com/global/us/products/smartwatches/sense2',
      'https://www.fitbit.com/global/us/products/smartwatches/versa4',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    const products: SIPData[] = [
      {
        name: 'Fitbit Charge 6',
        slug: slugify('Fitbit Charge 6'),
        shortSummary: 'Advanced fitness tracker with built-in GPS and Google integration',
        description: 'Fitbit Charge 6 offers continuous heart rate monitoring, built-in GPS, stress management tools, and seamless Google integration including YouTube Music controls and Google Maps.',
        costMinUSD: 15999,
        costMaxUSD: 15999,
        manufacturer: 'Fitbit',
        supplier: 'Google',
        categories: ['Wearables'],
        operatingSystems: ['Fitbit OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'Multi-path Optical Heart Rate Sensor', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'Built-in GPS + GLONASS', required: true },
          { type: 'HARDWARE', name: 'EDA Sensor', spec: 'Electrodermal activity', required: true },
          { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
          { type: 'SOFTWARE', name: 'Google Fit Integration', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Fitbit Sense 2',
        slug: slugify('Fitbit Sense 2'),
        shortSummary: 'Advanced health smartwatch with stress management and ECG',
        description: 'Fitbit Sense 2 focuses on holistic health with continuous EDA scanning for stress, ECG app, skin temperature sensing, and comprehensive sleep tracking.',
        costMinUSD: 29995,
        costMaxUSD: 29995,
        manufacturer: 'Fitbit',
        supplier: 'Google',
        categories: ['Wearables'],
        operatingSystems: ['Fitbit OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'cEDA Sensor', spec: 'Continuous electrodermal activity', required: true },
          { type: 'HARDWARE', name: 'ECG Sensor', required: true },
          { type: 'HARDWARE', name: 'Skin Temperature Sensor', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Fitbit Versa 4',
        slug: slugify('Fitbit Versa 4'),
        shortSummary: 'Versatile fitness smartwatch with built-in GPS and long battery life',
        description: 'Fitbit Versa 4 combines fitness tracking essentials with built-in GPS, 6+ day battery life, and 40+ exercise modes.',
        costMinUSD: 22995,
        costMaxUSD: 22995,
        manufacturer: 'Fitbit',
        supplier: 'Google',
        categories: ['Wearables'],
        operatingSystems: ['Fitbit OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'Optical Heart Rate Sensor', required: true },
          { type: 'HARDWARE', name: 'GPS', spec: 'Built-in GPS', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', required: true },
          { type: 'HARDWARE', name: 'SpO2 Sensor', required: true },
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
