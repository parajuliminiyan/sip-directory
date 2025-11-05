import { NextRequest, NextResponse } from 'next/server'
import { searchSIPs } from '@/lib/searchService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const os = searchParams.get('os') || ''
    const productTypeParam = searchParams.get('productType') || ''
    const productType = productTypeParam ? productTypeParam.split(',') : []
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Use the unified search service (Meilisearch with Postgres fallback)
    const searchResults = await searchSIPs({
      query,
      category,
      os,
      productType,
      page,
      pageSize,
    })

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search SIPs' }, { status: 500 })
  }
}
