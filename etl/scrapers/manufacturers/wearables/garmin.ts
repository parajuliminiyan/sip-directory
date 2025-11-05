import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class GarminScraper extends BaseScraper {
  constructor() {
    super('https://www.garmin.com', 'Garmin');
  }

  async getProductListings(): Promise<string[]> {
    return [
      'https://www.garmin.com/en-US/p/780139',
      'https://www.garmin.com/en-US/p/735611',
      'https://www.garmin.com/en-US/p/760778',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    const products: SIPData[] = [
      {
        name: 'Garmin Forerunner 965',
        slug: slugify('Garmin Forerunner 965'),
        shortSummary: 'Premium running smartwatch with AMOLED display and advanced training metrics',
        description: 'Garmin Forerunner 965 is designed for serious runners, featuring an AMOLED display, multi-band GPS, training readiness, running dynamics, and extensive performance metrics.',
        costMinUSD: 59999,
        costMaxUSD: 59999,
        manufacturer: 'Garmin',
        supplier: 'Garmin',
        categories: ['Wearables'],
        operatingSystems: ['Garmin OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'Elevate Gen 5 Heart Rate Sensor', required: true },
          { type: 'HARDWARE', name: 'Multi-band GPS', spec: 'GPS, GLONASS, Galileo', required: true },
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.4" touchscreen', required: true },
          { type: 'HARDWARE', name: 'Pulse Ox Sensor', required: true },
          { type: 'SOFTWARE', name: 'Garmin Connect', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Garmin Fenix 7',
        slug: slugify('Garmin Fenix 7'),
        shortSummary: 'Multisport GPS watch with solar charging and comprehensive outdoor features',
        description: 'Garmin Fenix 7 combines rugged design with advanced outdoor navigation, multi-sport tracking, and solar charging for extended battery life.',
        costMinUSD: 69999,
        costMaxUSD: 89999,
        manufacturer: 'Garmin',
        supplier: 'Garmin',
        categories: ['Wearables'],
        operatingSystems: ['Garmin OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'Solar Charging', spec: 'Power Glass lens', required: false },
          { type: 'HARDWARE', name: 'Multi-band GPS', required: true },
          { type: 'HARDWARE', name: 'Sapphire Lens', required: true },
          { type: 'SOFTWARE', name: 'TopoActive Maps', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'Garmin Venu 3',
        slug: slugify('Garmin Venu 3'),
        shortSummary: 'AMOLED fitness smartwatch with voice assistant and wheelchair mode',
        description: 'Garmin Venu 3 features bright AMOLED display, comprehensive health monitoring, voice assistant support, and innovative wheelchair mode for adaptive fitness tracking.',
        costMinUSD: 44999,
        costMaxUSD: 44999,
        manufacturer: 'Garmin',
        supplier: 'Garmin',
        categories: ['Wearables'],
        operatingSystems: ['Garmin OS'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'AMOLED Display', spec: '1.4" touchscreen', required: true },
          { type: 'HARDWARE', name: 'Elevate Gen 5 Sensor', required: true },
          { type: 'SOFTWARE', name: 'Voice Assistant', spec: 'Built-in mic and speaker', required: true },
        ],
        dependencies: [],
      },
    ];

    for (const product of products) {
      if (url.includes(product.slug) || url.includes(product.name.toLowerCase().replace(/\s+/g, '-'))) {
        return product;
      }
    }

    return null;
  }
}
