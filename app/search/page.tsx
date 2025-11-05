'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'
import { FacetFilters } from '@/components/FacetFilters'
import { ResultCard } from '@/components/ResultCard'
import { Pagination } from '@/components/Pagination'

interface SIP {
  id: string
  name: string
  slug: string
  shortSummary: string | null
  manufacturer: string | null
  categories: string[]
  oses: string[]
  costMinUSD: number | null
  costMaxUSD: number | null
}

interface Category {
  id: string
  name: string
}

interface OperatingSystem {
  id: string
  name: string
}

interface SearchResults {
  results: SIP[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [results, setResults] = useState<SIP[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [oses, setOses] = useState<OperatingSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const os = searchParams.get('os') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const productTypeParam = searchParams.get('productType') || ''
  const productType = productTypeParam ? productTypeParam.split(',') : []

  // Fetch categories and operating systems
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, osesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/os'),
        ])

        if (categoriesRes.ok && osesRes.ok) {
          const [categoriesData, osesData] = await Promise.all([
            categoriesRes.json(),
            osesRes.json(),
          ])
          setCategories(categoriesData)
          setOses(osesData)
        }
      } catch (error) {
        console.error('Failed to fetch filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (category) params.set('category', category)
        if (os) params.set('os', os)
        if (productType.length > 0) params.set('productType', productType.join(','))
        params.set('page', page.toString())

        const response = await fetch(`/api/sips?${params}`)
        if (response.ok) {
          const data: SearchResults = await response.json()
          setResults(data.results)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Failed to fetch results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, category, os, productType.join(','), page])

  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    if (newParams.category !== undefined || newParams.os !== undefined || newParams.productType !== undefined) {
      params.set('page', '1')
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    updateURL({ category: value === 'all' ? '' : value })
  }

  const handleOSChange = (value: string) => {
    updateURL({ os: value === 'all' ? '' : value })
  }

  const handleProductTypeChange = (types: string[]) => {
    updateURL({ productType: types.length > 0 ? types.join(',') : '' })
  }

  const handleClearFilters = () => {
    updateURL({ category: '', os: '', productType: '' })
  }

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search SIPs</h1>
        <SearchBar defaultValue={query} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <FacetFilters
            categories={categories}
            oses={oses}
            selectedCategory={category}
            selectedOS={os}
            productType={productType}
            onCategoryChange={handleCategoryChange}
            onOSChange={handleOSChange}
            onProductTypeChange={handleProductTypeChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Results */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {pagination.total} result{pagination.total !== 1 ? 's' : ''}
                {query && (
                  <>
                    {' '}
                    for <span className="font-semibold text-foreground">{query}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {results.map((sip) => (
                  <ResultCard key={sip.id} {...sip} />
                ))}
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-semibold mb-2">No results found</p>
              <p className="text-muted-foreground">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
