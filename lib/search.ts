import { Client } from 'typesense'

// 1. Define the necessary environment variable for connection check
const TYPESENSE_HOST = process.env.TYPESENSE_HOST

let client: Client | null = null // Initialize as null or Client

// 2. Conditionally initialize the client
if (TYPESENSE_HOST) {
  try {
    client = new Client({
      nodes: [
        {
          // We can remove the '|| localhost' now, since we already checked TYPESENSE_HOST
          host: TYPESENSE_HOST,
          port: parseInt(process.env.TYPESENSE_PORT || '443'), // Default to 443 for cloud
          protocol: (process.env.TYPESENSE_PROTOCOL || 'https') as 'http' | 'https', // Default to https
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || '',
      connectionTimeoutSeconds: 5, // Increased timeout for stability
    })
    console.log('Typesense client initialized successfully.')
  } catch (e) {
    console.error('Failed to instantiate Typesense Client:', e)
    // client remains null if instantiation fails
  }
} else {
  // If the host is missing, we log a warning but allow the build to proceed
  console.warn(
    '⚠️ Typesense client initialization skipped. TYPESENSE_HOST environment variable not found.'
  )
}

// const client = new Client({
//   nodes: [
//     {
//       host: process.env.TYPESENSE_HOST || 'localhost',
//       port: parseInt(process.env.TYPESENSE_PORT || '8108'),
//       protocol: (process.env.TYPESENSE_PROTOCOL || 'http') as 'http' | 'https',
//     },
//   ],
//   apiKey: process.env.TYPESENSE_API_KEY || '',
//   connectionTimeoutSeconds: 2,
// })

export const searchClient = client

export const SIP_COLLECTION = 'sips'

/**
 * Initialize Typesense collection schema for SIPs
 */
export async function initializeSearchIndex() {
  if (!client) {
    console.warn('Cannot initialize index: Typesense client is not available.')
    return null
  }
  try {
    // Try to retrieve the collection first
    try {
      const collection = await client.collections(SIP_COLLECTION).retrieve()
      console.log('Search collection already exists:', collection.name)
      return collection
    } catch (error) {
      // If collection doesn't exist (404), create it
      const typedError = error as { httpStatus?: number }
      if (typedError.httpStatus === 404) {
        console.log('Creating new search collection...')
      } else {
        throw error
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
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = await client.collections().create(schema as any)
    console.log('Search collection created successfully:', collection.name)
    return collection
  } catch (error) {
    console.error('Failed to initialize search collection:', error)
    throw error
  }
}

/**
 * Delete and recreate the search collection (useful for schema changes)
 */
export async function resetSearchIndex() {
  if (!client) {
    console.warn('Cannot reset index: Typesense client is not available.')
    return null
  }
  try {
    await client.collections(SIP_COLLECTION).delete()
    console.log('Deleted existing search collection')
  } catch (error) {
    const typedError = error as { httpStatus?: number }
    if (typedError.httpStatus !== 404) {
      throw error
    }
  }

  return initializeSearchIndex()
}
