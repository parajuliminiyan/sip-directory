import { SIPData, SIPDataSchema } from '../types';
import { fetchHTML, slugify, checkRobotsTxt, retryWithBackoff, fetchGitHubReleases } from '../utils';

interface FreeRTOSDevice {
  name: string;
  manufacturer: string;
  processor: string;
  description: string;
}

export async function fetchFreeRTOSDevices(): Promise<SIPData[]> {
  console.log('Fetching FreeRTOS supported devices...');

  // Check robots.txt first
  const url = 'https://www.freertos.org/RTOS_ports.html';
  const allowed = await checkRobotsTxt(url);

  if (!allowed) {
    console.warn('FreeRTOS scraping not allowed by robots.txt, using curated data instead');
    return getFreeRTOSCuratedData();
  }

  try {
    const $ = await retryWithBackoff(() => fetchHTML(url));

    const devices: FreeRTOSDevice[] = [];

    // Try to extract device information from the page
    // Note: This is based on typical HTML structure - may need adjustment
    $('table tr').each((_, element) => {
      const cells = $(element).find('td');
      if (cells.length >= 2) {
        const deviceText = $(cells[0]).text().trim();
        const processorText = $(cells[1]).text().trim();

        if (deviceText && processorText && !deviceText.includes('Port')) {
          const match = deviceText.match(/^([^-]+?)(?:\s*-\s*(.+))?$/);
          const manufacturer = match?.[1]?.trim() || 'Unknown';
          const name = match?.[2]?.trim() || deviceText;

          devices.push({
            name: `${manufacturer} ${name}`,
            manufacturer,
            processor: processorText,
            description: `FreeRTOS port for ${manufacturer} ${name} with ${processorText} processor`,
          });
        }
      }
    });

    if (devices.length === 0) {
      console.warn('No devices found via scraping, using curated data');
      return getFreeRTOSCuratedData();
    }

    const sips = await processFreeRTOSDevices(devices);
    console.log(`FreeRTOS Devices: ${sips.length} SIPs fetched`);
    return sips;
  } catch (error) {
    console.error('Error scraping FreeRTOS, using curated data:', error);
    return getFreeRTOSCuratedData();
  }
}

async function processFreeRTOSDevices(devices: FreeRTOSDevice[]): Promise<SIPData[]> {
  const sips: SIPData[] = [];

  // Fetch FreeRTOS versions from GitHub
  let freeRTOSVersions: SIPData['versions'] = [];
  try {
    const releases = await fetchGitHubReleases('FreeRTOS', 'FreeRTOS-Kernel', 5);
    freeRTOSVersions = releases.map(r => ({
      name: r.tag_name,
      releasedAt: new Date(r.published_at),
      notes: r.body.slice(0, 500),
    }));
  } catch (error) {
    console.warn('Could not fetch FreeRTOS versions');
  }

  for (const device of devices.slice(0, 15)) { // Limit to 15 devices
    const sipData: SIPData = {
      name: device.name,
      slug: slugify(device.name),
      shortSummary: device.description.slice(0, 200),
      description: device.description,
      costMinUSD: undefined, // Development boards - price varies by retailer
      costMaxUSD: undefined,
      manufacturer: device.manufacturer,
      supplier: device.manufacturer,
      categories: ['Appliances'],
      operatingSystems: ['FreeRTOS'],
      versions: freeRTOSVersions,
      components: [
        {
          type: 'HARDWARE',
          name: device.processor,
          spec: `${device.processor} processor`,
          required: true,
        },
        {
          type: 'SOFTWARE',
          name: 'FreeRTOS Kernel',
          spec: 'Open source real-time operating system kernel',
          required: true,
        },
        {
          type: 'SOFTWARE',
          name: 'FreeRTOS Port',
          spec: `Port for ${device.processor}`,
          required: true,
        },
      ],
      dependencies: [],
    };

    try {
      SIPDataSchema.parse(sipData);
      sips.push(sipData);
    } catch (error) {
      console.error(`Validation failed for ${device.name}:`, error);
    }
  }

  return sips;
}

// Curated FreeRTOS device data as fallback
async function getFreeRTOSCuratedData(): Promise<SIPData[]> {
  const curatedDevices: FreeRTOSDevice[] = [
    {
      name: 'STM32F4 Discovery',
      manufacturer: 'STMicroelectronics',
      processor: 'ARM Cortex-M4',
      description: 'STM32F4 Discovery kit with FreeRTOS support for ARM Cortex-M4 processor',
    },
    {
      name: 'ESP32 DevKit',
      manufacturer: 'Espressif',
      processor: 'Xtensa LX6',
      description: 'ESP32 development kit with dual-core processor and FreeRTOS',
    },
    {
      name: 'Arduino Due',
      manufacturer: 'Arduino',
      processor: 'ARM Cortex-M3',
      description: 'Arduino Due board with FreeRTOS port for ARM Cortex-M3',
    },
    {
      name: 'Raspberry Pi Pico',
      manufacturer: 'Raspberry Pi',
      processor: 'ARM Cortex-M0+',
      description: 'Raspberry Pi Pico microcontroller board with FreeRTOS support',
    },
    {
      name: 'Nordic nRF52840',
      manufacturer: 'Nordic Semiconductor',
      processor: 'ARM Cortex-M4F',
      description: 'Nordic nRF52840 SoC with Bluetooth 5 and FreeRTOS',
    },
    {
      name: 'NXP i.MX RT1050',
      manufacturer: 'NXP',
      processor: 'ARM Cortex-M7',
      description: 'NXP i.MX RT crossover processor with FreeRTOS support',
    },
    {
      name: 'Texas Instruments CC3220',
      manufacturer: 'Texas Instruments',
      processor: 'ARM Cortex-M4',
      description: 'TI SimpleLink Wi-Fi CC3220 wireless MCU with FreeRTOS',
    },
    {
      name: 'Microchip SAM D21',
      manufacturer: 'Microchip',
      processor: 'ARM Cortex-M0+',
      description: 'Microchip SAM D21 MCU with FreeRTOS support',
    },
    {
      name: 'Renesas RX65N',
      manufacturer: 'Renesas',
      processor: 'RXv2 Core',
      description: 'Renesas RX65N MCU with FreeRTOS for IoT applications',
    },
    {
      name: 'Silicon Labs EFR32',
      manufacturer: 'Silicon Labs',
      processor: 'ARM Cortex-M4',
      description: 'Silicon Labs EFR32 wireless SoC with FreeRTOS support',
    },
  ];

  return await processFreeRTOSDevices(curatedDevices).then(sips => {
    console.log(`FreeRTOS Devices (curated): ${sips.length} SIPs fetched`);
    return sips;
  }).catch(() => []);
}
