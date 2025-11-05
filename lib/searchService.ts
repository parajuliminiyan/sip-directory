import { searchClient, SIP_COLLECTION } from './search';
import { prisma } from './prisma';

interface SearchParams {
  query?: string;
  category?: string;
  os?: string;
  productType?: string[];
  page?: number;
  pageSize?: number;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  shortSummary: string | null;
  description: string | null;
  costMinUSD: number | null;
  costMaxUSD: number | null;
  manufacturer: string | null;
  supplier: string | null;
  categories: string[];
  oses: string[];
}

interface SearchResponse {
  results: SearchResult[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface TypesenseDocument {
  id: string;
  name: string;
  slug: string;
  shortSummary?: string;
  costMinUSD?: number;
  costMaxUSD?: number;
  manufacturer?: string;
  supplier?: string;
  categories: string[];
  oses: string[];
}

interface TypesenseHit {
  document: TypesenseDocument;
}

/**
 * Search SIPs using Typesense with fallback to Postgres
 */
export async function searchSIPs(params: SearchParams): Promise<SearchResponse> {

  // Try Typesense first
  try {
    return await searchWithTypesense(params);
  } catch (error) {
    console.warn('Typesense unavailable, falling back to Postgres:', error);
    // Fall through to Postgres search
  }

  // Use Postgres as fallback
  return await searchWithPostgres(params);
}

/**
 * Search using Typesense for fuzzy/typo-tolerant search with filters
 */
async function searchWithTypesense(params: SearchParams): Promise<SearchResponse> {
  const { query = '*', category = '', os = '', productType = [], page = 1, pageSize = 20 } = params;

  // Build filter_by clause
  const filters: string[] = [];

  if (category) {
    filters.push(`categories:=[${category}]`);
  }

  if (os) {
    filters.push(`oses:=[${os}]`);
  }

  // Product type filters
  if (productType.length > 0) {
    const productTypeFilters: string[] = [];

    if (productType.includes('consumer')) {
      productTypeFilters.push('costMinUSD:>0');
    }

    if (productType.includes('opensource')) {
      productTypeFilters.push('costMinUSD:=0');
    }

    if (productTypeFilters.length > 0) {
      filters.push(`(${productTypeFilters.join(' || ')})`);
    }
  }

  const searchParams = {
    q: query || '*',
    query_by: 'name,shortSummary,description,categories,oses,supplier,manufacturer',
    filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
    page,
    per_page: pageSize,
    sort_by: query === '*' ? 'costMinUSD:asc' : '_text_match:desc,costMinUSD:asc',
  };

  const searchResults = await searchClient
    .collections(SIP_COLLECTION)
    .documents()
    .search(searchParams);

  const results: SearchResult[] = (searchResults.hits as TypesenseHit[] || []).map((hit) => ({
    id: hit.document.id,
    name: hit.document.name,
    slug: hit.document.slug,
    shortSummary: hit.document.shortSummary || null,
    description: null, // Don't return full description in search results
    costMinUSD: hit.document.costMinUSD || null,
    costMaxUSD: hit.document.costMaxUSD || null,
    manufacturer: hit.document.manufacturer || null,
    supplier: hit.document.supplier || null,
    categories: hit.document.categories || [],
    oses: hit.document.oses || [],
  }));

  return {
    results,
    pagination: {
      page,
      pageSize,
      total: searchResults.found || 0,
      totalPages: Math.ceil((searchResults.found || 0) / pageSize),
    },
  };
}

/**
 * Search using Postgres with SQL LIKE for compatibility
 */
async function searchWithPostgres(params: SearchParams): Promise<SearchResponse> {
  const { query = '', category = '', os = '', productType = [], page = 1, pageSize = 20 } = params;

  // Build product type filters
  const productTypeFilters = [];

  if (productType.includes('consumer')) {
    // Consumer products have price > 0
    productTypeFilters.push({ costMinUSD: { gt: 0 } });
  }

  if (productType.includes('opensource')) {
    // Open source products have cost = 0 OR contain open source keywords
    productTypeFilters.push({
      OR: [
        { costMinUSD: { equals: 0 } },
        { description: { contains: 'open source', mode: 'insensitive' as const } },
        { description: { contains: 'open-source', mode: 'insensitive' as const } },
        { name: { contains: 'apache', mode: 'insensitive' as const } },
        {
          manufacturer: {
            OR: [
              { name: { contains: 'apache', mode: 'insensitive' as const } },
              { name: { contains: 'foundation', mode: 'insensitive' as const } },
            ],
          },
        },
      ],
    });
  }

  if (productType.includes('devboard')) {
    // Development boards contain keywords
    productTypeFilters.push({
      OR: [
        { name: { contains: 'board', mode: 'insensitive' as const } },
        { name: { contains: 'kit', mode: 'insensitive' as const } },
        { name: { contains: 'devkit', mode: 'insensitive' as const } },
        { name: { contains: 'development', mode: 'insensitive' as const } },
      ],
    });
  }

  // Build where clause
  const where = {
    AND: [
      // Search by name, description, summary, category name, or OS name
      query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { description: { contains: query, mode: 'insensitive' as const } },
              { shortSummary: { contains: query, mode: 'insensitive' as const } },
              {
                categories: {
                  some: {
                    category: {
                      name: { contains: query, mode: 'insensitive' as const },
                    },
                  },
                },
              },
              {
                oses: {
                  some: {
                    os: {
                      name: { contains: query, mode: 'insensitive' as const },
                    },
                  },
                },
              },
              {
                manufacturer: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
              {
                supplier: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {},
      // Filter by category
      category
        ? {
            categories: {
              some: {
                category: {
                  name: { equals: category, mode: 'insensitive' as const },
                },
              },
            },
          }
        : {},
      // Filter by OS
      os
        ? {
            oses: {
              some: {
                os: {
                  name: { equals: os, mode: 'insensitive' as const },
                },
              },
            },
          }
        : {},
      // Filter by product type
      ...(productTypeFilters.length > 0 ? [{ OR: productTypeFilters }] : []),
    ],
  };

  // Get total count for pagination
  const total = await prisma.sIP.count({ where });

  // Get paginated results
  const sips = await prisma.sIP.findMany({
    where,
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
      manufacturer: true,
      supplier: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      name: 'asc',
    },
  });

  // Transform results
  const results: SearchResult[] = sips.map((sip) => ({
    id: sip.id,
    name: sip.name,
    slug: sip.slug,
    shortSummary: sip.shortSummary,
    description: sip.description,
    costMinUSD: sip.costMinUSD,
    costMaxUSD: sip.costMaxUSD,
    manufacturer: sip.manufacturer?.name || null,
    supplier: sip.supplier?.name || null,
    categories: sip.categories.map((c) => c.category.name),
    oses: sip.oses.map((o) => o.os.name),
  }));

  return {
    results,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
