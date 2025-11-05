// Typesense Indexing Script
// Indexes all SIPs from PostgreSQL to Typesense

import { prisma } from '../lib/prisma';
import { searchClient, SIP_COLLECTION, initializeSearchIndex } from '../lib/search';

interface SearchDocument {
  id: string;
  name: string;
  slug: string;
  categories: string[];
  oses: string[];
  supplier: string;
  manufacturer: string;
  shortSummary: string;
  description: string;
  costMinUSD: number;
  costMaxUSD: number;
  versions: Array<{ name: string; releasedAt: string | null }>;
  components: Array<{ type: string; name: string; spec: string | null }>;
  dependencies: string[];
}

async function indexSIPs() {
  console.log('Starting SIP indexing to Typesense...');

  try {
    // Initialize search collection with schema
    await initializeSearchIndex();

    // Fetch all SIPs with relations
    const sips = await prisma.sIP.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        oses: {
          include: {
            os: true,
          },
        },
        supplier: true,
        manufacturer: true,
        versions: true,
        components: true,
        dependencies: {
          include: {
            dependsOn: true,
          },
        },
      },
    });

    // Transform to search documents
    const documents: SearchDocument[] = sips.map((sip) => ({
      id: sip.id,
      name: sip.name,
      slug: sip.slug,
      categories: sip.categories.map((c) => c.category.name),
      oses: sip.oses.map((o) => o.os.name),
      supplier: sip.supplier?.name || '',
      manufacturer: sip.manufacturer?.name || '',
      shortSummary: sip.shortSummary || '',
      description: sip.description || '',
      costMinUSD: sip.costMinUSD || 0,
      costMaxUSD: sip.costMaxUSD || 0,
      versions: sip.versions.map((v) => ({
        name: v.name,
        releasedAt: v.releasedAt?.toISOString() || null,
      })),
      components: sip.components.map((c) => ({
        type: c.type,
        name: c.name,
        spec: c.spec,
      })),
      dependencies: sip.dependencies.map((d) => d.dependsOn.name),
    }));

    // Index documents with upsert
    console.log(`Indexing ${documents.length} SIPs to Typesense...`);

    if (documents.length > 0) {
      const result = await searchClient
        .collections(SIP_COLLECTION)
        .documents()
        .import(documents, { action: 'upsert' });

      console.log(`Indexing completed successfully: ${documents.length} documents indexed`);

      // Check for any import errors
      const errors = result.filter((r: any) => !r.success);
      if (errors.length > 0) {
        console.warn(`${errors.length} documents had errors:`, errors);
      }
    } else {
      console.log('No documents to index');
    }
  } catch (error) {
    console.error('Indexing failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  indexSIPs();
}

export { indexSIPs };
