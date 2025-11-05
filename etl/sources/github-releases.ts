import { SIPData, SIPDataSchema } from '../types';
import { slugify, fetchGitHubReleases, retryWithBackoff } from '../utils';

interface GitHubProject {
  name: string;
  owner: string;
  repo: string;
  description: string;
  category: string;
  os: string;
  manufacturer?: string;
  supplier?: string;
  components?: SIPData['components'];
}

// Curated list of embedded/IoT GitHub projects
const GITHUB_PROJECTS: GitHubProject[] = [
  {
    name: 'Zephyr Project',
    owner: 'zephyrproject-rtos',
    repo: 'zephyr',
    description: 'Zephyr is a small, scalable real-time operating system for connected, resource-constrained and embedded devices',
    category: 'Appliances',
    os: 'Zephyr',
    supplier: 'Linux Foundation',
    manufacturer: 'Linux Foundation',
    components: [
      { type: 'SOFTWARE', name: 'Zephyr RTOS Kernel', required: true },
      { type: 'SOFTWARE', name: 'Device Drivers', spec: 'Multi-platform device driver library', required: true },
    ],
  },
  {
    name: 'RIOT OS',
    owner: 'RIOT-OS',
    repo: 'RIOT',
    description: 'RIOT is a real-time multi-threading operating system that supports a range of devices that are typically found in the Internet of Things',
    category: 'Appliances',
    os: 'RIOT',
    supplier: 'RIOT Community',
    manufacturer: 'RIOT Community',
    components: [
      { type: 'SOFTWARE', name: 'RIOT Kernel', required: true },
      { type: 'SOFTWARE', name: 'Network Stack', spec: 'IPv6, 6LoWPAN, CoAP support', required: false },
    ],
  },
  {
    name: 'Contiki-NG',
    owner: 'contiki-ng',
    repo: 'contiki-ng',
    description: 'Contiki-NG is an open-source, cross-platform operating system for Next-Generation IoT devices',
    category: 'Appliances',
    os: 'Contiki',
    supplier: 'Contiki-NG Community',
    manufacturer: 'Contiki-NG Community',
    components: [
      { type: 'SOFTWARE', name: 'Contiki Kernel', required: true },
      { type: 'SOFTWARE', name: 'uIP Stack', spec: 'Lightweight TCP/IP stack', required: true },
    ],
  },
  {
    name: 'ESP-IDF',
    owner: 'espressif',
    repo: 'esp-idf',
    description: 'Espressif IoT Development Framework for ESP32, ESP32-S, ESP32-C and ESP32-H series of SoCs',
    category: 'Appliances',
    os: 'FreeRTOS',
    supplier: 'Espressif Systems',
    manufacturer: 'Espressif Systems',
    components: [
      { type: 'HARDWARE', name: 'ESP32 SoC', spec: 'Dual-core Xtensa LX6', required: true },
      { type: 'SOFTWARE', name: 'ESP-IDF Framework', required: true },
      { type: 'HARDWARE', name: 'Wi-Fi Module', spec: '802.11 b/g/n', required: true },
      { type: 'HARDWARE', name: 'Bluetooth Module', spec: 'BLE 5.0', required: false },
    ],
  },
  {
    name: 'Arduino Core',
    owner: 'arduino',
    repo: 'Arduino',
    description: 'Arduino IDE and core libraries for embedded development',
    category: 'Appliances',
    os: 'Arduino',
    supplier: 'Arduino',
    manufacturer: 'Arduino',
    components: [
      { type: 'SOFTWARE', name: 'Arduino Core', required: true },
      { type: 'SOFTWARE', name: 'Standard Libraries', spec: 'Wire, SPI, Serial, etc.', required: true },
    ],
  },
  {
    name: 'Mbed OS',
    owner: 'ARMmbed',
    repo: 'mbed-os',
    description: 'Arm Mbed OS is an open source embedded operating system designed for IoT devices',
    category: 'Appliances',
    os: 'Mbed OS',
    supplier: 'Arm',
    manufacturer: 'Arm',
    components: [
      { type: 'SOFTWARE', name: 'Mbed RTOS', required: true },
      { type: 'SOFTWARE', name: 'Connectivity Stack', spec: 'Bluetooth, LoRaWAN, Cellular', required: false },
      { type: 'HARDWARE', name: 'ARM Cortex-M Processor', required: true },
    ],
  },
];

export async function fetchGitHubProjects(): Promise<SIPData[]> {
  console.log('Fetching GitHub-based IoT projects...');

  const sips: SIPData[] = [];

  for (const project of GITHUB_PROJECTS) {
    try {
      // Fetch releases
      const releases = await retryWithBackoff(async () => {
        return await fetchGitHubReleases(project.owner, project.repo, 10);
      });

      const versions = releases.map(r => ({
        name: r.tag_name,
        releasedAt: new Date(r.published_at),
        notes: r.body.slice(0, 500),
      }));

      const sipData: SIPData = {
        name: project.name,
        slug: slugify(project.name),
        shortSummary: project.description.slice(0, 200),
        description: `Open source ${project.description}`, // Explicitly mark as open source
        costMinUSD: 0, // Open source software - free
        costMaxUSD: 0,
        supplier: project.supplier,
        manufacturer: project.manufacturer,
        categories: [project.category],
        operatingSystems: [project.os],
        versions,
        components: project.components || [],
        dependencies: [],
      };

      SIPDataSchema.parse(sipData);
      sips.push(sipData);
      console.log(`✓ Processed: ${project.name} (${versions.length} versions)`);
    } catch (error) {
      console.error(`Failed to fetch ${project.name}:`, error);
    }
  }

  console.log(`GitHub Projects: ${sips.length} SIPs fetched`);
  return sips;
}
