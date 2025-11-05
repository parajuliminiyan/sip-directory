import { Client } from 'typesense';

const client = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: (process.env.TYPESENSE_PROTOCOL || 'http') as 'http' | 'https',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 2,
});

export const searchClient = client;

export const SIP_COLLECTION = 'sips';

/**
 * Initialize Typesense collection schema for SIPs
 */
export async function initializeSearchIndex() {
  try {
    // Try to retrieve the collection first
    try {
      const collection = await client.collections(SIP_COLLECTION).retrieve();
      console.log('Search collection already exists:', collection.name);
      return collection;
    } catch (error) {
      // If collection doesn't exist (404), create it
      const typedError = error as { httpStatus?: number };
      if (typedError.httpStatus === 404) {
        console.log('Creating new search collection...');
      } else {
        throw error;
      }
    }

    // Create the collection with schema
    const schema = {
      name: SIP_COLLECTION,
      enable_nested_fields: true,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'shortSummary', type: 'string', optional: true },
        { name: 'description', type: 'string', optional: true },

        // Facetable fields
        { name: 'categories', type: 'string[]', facet: true },
        { name: 'oses', type: 'string[]', facet: true },
        { name: 'supplier', type: 'string', facet: true, optional: true },
        { name: 'manufacturer', type: 'string', facet: true, optional: true },

        // Numeric fields for filtering and sorting (costMinUSD is required for default sorting)
        { name: 'costMinUSD', type: 'int32' },
        { name: 'costMaxUSD', type: 'int32', optional: true },

        // Additional data (not searchable, just returned)
        { name: 'versions', type: 'object[]', optional: true },
        { name: 'components', type: 'object[]', optional: true },
        { name: 'dependencies', type: 'string[]', optional: true },
      ],
      default_sorting_field: 'costMinUSD',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = await client.collections().create(schema as any);
    console.log('Search collection created successfully:', collection.name);
    return collection;
  } catch (error) {
    console.error('Failed to initialize search collection:', error);
    throw error;
  }
}

/**
 * Delete and recreate the search collection (useful for schema changes)
 */
export async function resetSearchIndex() {
  try {
    await client.collections(SIP_COLLECTION).delete();
    console.log('Deleted existing search collection');
  } catch (error) {
    const typedError = error as { httpStatus?: number };
    if (typedError.httpStatus !== 404) {
      throw error;
    }
  }

  return initializeSearchIndex();
}
