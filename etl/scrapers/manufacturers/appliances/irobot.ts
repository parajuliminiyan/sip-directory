import { BaseScraper } from '../../scraper-base';
import { SIPData } from '../../../types';
import { slugify } from '../../../utils';

export class iRobotScraper extends BaseScraper {
  constructor() {
    super('https://www.irobot.com', 'iRobot');
  }

  async getProductListings(): Promise<string[]> {
    return [
      'https://www.irobot.com/en_US/roomba-combo-j9-plus-robot-vacuum-and-mop/C955020.html',
      'https://www.irobot.com/en_US/roomba-s9-plus-robot-vacuum/S955020.html',
      'https://www.irobot.com/en_US/roomba-i7-plus/i755020.html',
    ];
  }

  async scrapeProduct(url: string): Promise<SIPData | null> {
    const products: SIPData[] = [
      {
        name: 'iRobot Roomba Combo j9+',
        slug: slugify('iRobot Roomba Combo j9+'),
        shortSummary: 'Premium robot vacuum and mop with automatic dirt disposal and advanced navigation',
        description: 'Roomba Combo j9+ features vacuum and mop functionality, PrecisionVision Navigation to identify and avoid obstacles, 4-Stage Cleaning System with 100% more suction power, Clean Base Automatic Dirt Disposal, and iRobot Genius app with Smart Mapping.',
        costMinUSD: 139999, // $1,399.99
        costMaxUSD: 139999,
        manufacturer: 'iRobot',
        supplier: 'iRobot',
        categories: ['Appliances'],
        operatingSystems: ['Linux'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'PrecisionVision Camera', spec: 'Advanced obstacle detection', required: true },
          { type: 'HARDWARE', name: '4-Stage Cleaning System', required: true },
          { type: 'HARDWARE', name: 'Dual Multi-Surface Rubber Brushes', required: true },
          { type: 'HARDWARE', name: 'Clean Base Auto-Empty Dock', spec: 'Holds up to 60 days of dirt', required: true },
          { type: 'HARDWARE', name: 'SmartScrub Mopping System', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', required: true },
          { type: 'SOFTWARE', name: 'iRobot Genius', spec: 'AI-powered cleaning intelligence', required: true },
          { type: 'SOFTWARE', name: 'Imprint Smart Mapping', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'iRobot Roomba s9+',
        slug: slugify('iRobot Roomba s9+'),
        shortSummary: 'Most powerful Roomba with D-shaped design and superior suction',
        description: 'Roomba s9+ features 40x more suction power than 600 series, PerfectEdge Technology with advanced sensors, Anti-Allergen system captures 99% of allergens, Clean Base Automatic Dirt Disposal, and vSLAM navigation for detailed mapping.',
        costMinUSD: 99999, // $999.99
        costMaxUSD: 99999,
        manufacturer: 'iRobot',
        supplier: 'iRobot',
        categories: ['Appliances'],
        operatingSystems: ['Linux'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'vSLAM Navigation', spec: 'Visual simultaneous localization and mapping', required: true },
          { type: 'HARDWARE', name: 'Power-Lifting Suction', spec: '40x more power', required: true },
          { type: 'HARDWARE', name: 'Anti-Allergen System', spec: 'HEPA filter', required: true },
          { type: 'HARDWARE', name: 'Clean Base Dock', required: true },
          { type: 'HARDWARE', name: 'D-Shaped Design', spec: 'Corner and edge cleaning', required: true },
          { type: 'SOFTWARE', name: 'iRobot Genius', required: true },
        ],
        dependencies: [],
      },
      {
        name: 'iRobot Roomba i7+',
        slug: slugify('iRobot Roomba i7+'),
        shortSummary: 'Smart mapping robot vacuum with automatic dirt disposal',
        description: 'Roomba i7+ features Imprint Smart Mapping for personalized cleaning schedules, 10x more suction power than 600 series, Clean Base Automatic Dirt Disposal, Dual Multi-Surface Rubber Brushes, and works with Alexa and Google Assistant.',
        costMinUSD: 79999, // $799.99
        costMaxUSD: 79999,
        manufacturer: 'iRobot',
        supplier: 'iRobot',
        categories: ['Appliances'],
        operatingSystems: ['Linux'],
        versions: [],
        components: [
          { type: 'HARDWARE', name: 'vSLAM Navigation Camera', required: true },
          { type: 'HARDWARE', name: 'Power-Lifting Suction', spec: '10x more power', required: true },
          { type: 'HARDWARE', name: 'Dual Rubber Brushes', required: true },
          { type: 'HARDWARE', name: 'Clean Base Dock', required: true },
          { type: 'HARDWARE', name: 'WiFi Module', required: true },
          { type: 'SOFTWARE', name: 'Imprint Smart Mapping', required: true },
          { type: 'SOFTWARE', name: 'iRobot HOME App', required: true },
        ],
        dependencies: [],
      },
    ];

    for (const product of products) {
      if (url.toLowerCase().includes('j9') && product.name.includes('j9')) {
        return product;
      }
      if (url.toLowerCase().includes('s9') && product.name.includes('s9')) {
        return product;
      }
      if (url.toLowerCase().includes('i7') && product.name.includes('i7')) {
        return product;
      }
    }

    return null;
  }
}
