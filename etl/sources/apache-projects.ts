import { SIPData, SIPDataSchema } from '../types';
import { rateLimitedRequest, slugify, fetchGitHubReleases, retryWithBackoff } from '../utils';

interface ApacheProject {
  name: string;
  description: string;
  homepage: string;
  category: string;
  repository?: string[];
  created?: string;
  programming_language?: string[];
}

interface ApacheProjectsResponse {
  projects: Record<string, ApacheProject>;
}

const IOT_PROJECTS = [
  'Apache NuttX',
  'Apache Mynewt',
  'Apache PLC4X',
  'Apache IoTDB',
  'Apache Edgent',
  'Apache StreamPipes',
];

export async function fetchApacheProjects(): Promise<SIPData[]> {
  console.log('Fetching Apache Projects...');

  let data: ApacheProjectsResponse;

  try {
    data = await retryWithBackoff(async () => {
      return await rateLimitedRequest<ApacheProjectsResponse>(
        'https://projects.apache.org/json/projects/json'
      );
    });
  } catch (error) {
    console.warn('Failed to fetch from Apache Projects API, using curated data');
    return getCuratedApacheProjects();
  }

  const sips: SIPData[] = [];

  for (const [key, project] of Object.entries(data.projects)) {
    // Filter for IoT/embedded projects
    if (!IOT_PROJECTS.includes(project.name)) {
      continue;
    }

    const slug = slugify(project.name);

    // Extract GitHub info for versions
    let versions: SIPData['versions'] = [];
    if (project.repository && project.repository.length > 0) {
      const githubRepo = project.repository.find(r => r.includes('github.com'));
      if (githubRepo) {
        const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const [, owner, repo] = match;
          try {
            const releases = await fetchGitHubReleases(owner, repo, 5);
            versions = releases.map(r => ({
              name: r.tag_name,
              releasedAt: new Date(r.published_at),
              notes: r.body.slice(0, 500),
            }));
          } catch (error) {
            console.warn(`Could not fetch releases for ${project.name}`);
          }
        }
      }
    }

    // Determine OS based on project name/description
    let operatingSystems: string[] = [];
    const description = project.description.toLowerCase();

    if (project.name.includes('NuttX')) {
      operatingSystems.push('NuttX');
    } else if (project.name.includes('Mynewt')) {
      operatingSystems.push('Mynewt OS');
    } else if (description.includes('rtos')) {
      operatingSystems.push('RTOS');
    } else {
      operatingSystems.push('Linux');
    }

    // Create components
    const components: SIPData['components'] = [];

    // Add programming language as software component
    if (project.programming_language && project.programming_language.length > 0) {
      project.programming_language.forEach(lang => {
        components.push({
          type: 'SOFTWARE',
          name: `${lang} Runtime`,
          spec: `Primary development language: ${lang}`,
          required: true,
        });
      });
    }

    // Add Apache foundation components
    components.push({
      type: 'SOFTWARE',
      name: 'Apache License 2.0',
      spec: 'Open source license',
      required: true,
    });

    const sipData: SIPData = {
      name: project.name,
      slug,
      shortSummary: project.description.slice(0, 200),
      description: `Open source ${project.description}`, // Explicitly mention "open source"
      costMinUSD: 0, // Mark as free/open source
      costMaxUSD: 0,
      supplier: 'Apache Software Foundation',
      manufacturer: 'Apache Software Foundation',
      categories: ['Appliances'],
      operatingSystems,
      versions,
      components,
      dependencies: [],
    };

    try {
      SIPDataSchema.parse(sipData);
      sips.push(sipData);
      console.log(`✓ Processed: ${project.name}`);
    } catch (error) {
      console.error(`Validation failed for ${project.name}:`, error);
    }
  }

  console.log(`Apache Projects: ${sips.length} SIPs fetched`);
  return sips;
}

// Curated Apache IoT projects as fallback
function getCuratedApacheProjects(): SIPData[] {
  const curatedProjects = [
    {
      name: 'Apache NuttX',
      description: 'Apache NuttX is a real-time operating system (RTOS) with an emphasis on standards compliance and small footprint. Scalable from 8-bit to 64-bit microcontroller environments.',
      homepage: 'https://nuttx.apache.org',
      os: 'NuttX',
    },
    {
      name: 'Apache Mynewt',
      description: 'Apache Mynewt is an operating system for IoT devices, featuring a modular architecture for building applications on constrained embedded systems.',
      homepage: 'https://mynewt.apache.org',
      os: 'Mynewt OS',
    },
    {
      name: 'Apache PLC4X',
      description: 'Apache PLC4X is a set of libraries for communicating with industrial programmable logic controllers (PLCs) using a variety of protocols but with a shared API.',
      homepage: 'https://plc4x.apache.org',
      os: 'Linux',
    },
    {
      name: 'Apache IoTDB',
      description: 'Apache IoTDB is a data management system for time series data, designed for IoT scenarios with high write throughput and complex query requirements.',
      homepage: 'https://iotdb.apache.org',
      os: 'Linux',
    },
  ];

  const sips: SIPData[] = curatedProjects.map(project => ({
    name: project.name,
    slug: slugify(project.name),
    shortSummary: project.description.slice(0, 200),
    description: project.description,
    costMinUSD: 0, // Mark as free/open source
    costMaxUSD: 0,
    supplier: 'Apache Software Foundation',
    manufacturer: 'Apache Software Foundation',
    categories: ['Appliances'],
    operatingSystems: [project.os],
    versions: [],
    components: [
      {
        type: 'SOFTWARE',
        name: 'Apache License 2.0',
        spec: 'Open source license',
        required: true,
      },
    ],
    dependencies: [],
  }));

  console.log(`Apache Projects (curated): ${sips.length} SIPs fetched`);
  return sips;
}
