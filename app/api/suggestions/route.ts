import { NextResponse } from 'next/server';
import { searchClient, SIP_COLLECTION } from '@/lib/search';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use Typesense search
    const typesenseParams = {
      q: query,
      query_by: 'name,shortSummary,categories',
      per_page: 5,
      highlight_fields: 'name',
      highlight_full_fields: 'name',
    };

    const results = await searchClient
      .collections(SIP_COLLECTION)
      .documents()
      .search(typesenseParams);

    const suggestions = (results.hits || []).map((hit: any) => ({
      id: hit.document.id,
      name: hit.document.name,
      slug: hit.document.slug,
      categories: hit.document.categories || [],
      shortSummary: hit.document.shortSummary || null,
      highlightedName: hit.highlights?.[0]?.snippet || hit.document.name,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestion search error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
