'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { SIPSelector } from '@/components/SIPSelector'

interface SIP {
  id: string
  name: string
  slug: string
  shortSummary: string | null
  description: string | null
  costMinUSD: number | null
  costMaxUSD: number | null
  manufacturer: {
    id: string
    name: string
    url: string | null
  } | null
  supplier: {
    id: string
    name: string
    url: string | null
  } | null
  categories: Array<{ id: string; name: string }>
  oses: Array<{ id: string; name: string }>
  versions: Array<{
    id: string
    name: string
    releasedAt: string | null
    notes: string | null
  }>
  components: Array<{
    id: string
    type: 'HARDWARE' | 'SOFTWARE'
    name: string
    spec: string | null
    required: boolean
  }>
  dependencies: Array<{
    id: string
    name: string
    slug: string
  }>
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [leftSIP, setLeftSIP] = useState<SIP | null>(null)
  const [rightSIP, setRightSIP] = useState<SIP | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const leftSlug = searchParams.get('left') || ''
  const rightSlug = searchParams.get('right') || ''

  useEffect(() => {
    const fetchSIPs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch left SIP if slug exists
        if (leftSlug) {
          const leftResponse = await fetch(`/api/sips/${leftSlug}`)
          if (leftResponse.ok) {
            const leftData = await leftResponse.json()
            setLeftSIP(leftData)
          } else {
            setLeftSIP(null)
          }
        } else {
          setLeftSIP(null)
        }

        // Fetch right SIP if slug exists
        if (rightSlug) {
          const rightResponse = await fetch(`/api/sips/${rightSlug}`)
          if (rightResponse.ok) {
            const rightData = await rightResponse.json()
            setRightSIP(rightData)
          } else {
            setRightSIP(null)
          }
        } else {
          setRightSIP(null)
        }
      } catch (err) {
        console.error('Error fetching SIPs:', err)
        setError('Failed to load products for comparison')
      } finally {
        setLoading(false)
      }
    }

    fetchSIPs()
  }, [leftSlug, rightSlug])

  const handleSIPSelect = (position: 'left' | 'right', slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(position, slug)
    router.push(`/compare?${params.toString()}`)
  }

  const handleClear = () => {
    router.push('/compare')
  }

  // If one or both SIPs not selected, show selector interface
  if (!leftSlug || !rightSlug || !leftSIP || !rightSIP) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/search"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare SIPs</h1>
          <p className="text-muted-foreground">
            {leftSlug && leftSIP
              ? 'Select a second product to compare'
              : 'Select two products to compare side-by-side'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {leftSIP ? (
                  <span className="text-primary">{leftSIP.name}</span>
                ) : (
                  'First Product'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leftSIP ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selected Product</p>
                    <div className="flex flex-wrap gap-2">
                      {leftSIP.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSIPSelect('left', '')}
                  >
                    Change Selection
                  </Button>
                </div>
              ) : (
                <SIPSelector
                  selectedSlug={leftSlug}
                  onSelect={(slug) => handleSIPSelect('left', slug)}
                  excludeSlug={rightSlug}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {rightSIP ? (
                  <span className="text-primary">{rightSIP.name}</span>
                ) : (
                  'Second Product'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rightSIP ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selected Product</p>
                    <div className="flex flex-wrap gap-2">
                      {rightSIP.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSIPSelect('right', '')}
                  >
                    Change Selection
                  </Button>
                </div>
              ) : (
                <SIPSelector
                  selectedSlug={rightSlug}
                  onSelect={(slug) => handleSIPSelect('right', slug)}
                  excludeSlug={leftSlug}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleClear}>Start New Comparison</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Comparison calculations
  const leftHardware = leftSIP.components.filter((c) => c.type === 'HARDWARE')
  const rightHardware = rightSIP.components.filter((c) => c.type === 'HARDWARE')
  const leftSoftware = leftSIP.components.filter((c) => c.type === 'SOFTWARE')
  const rightSoftware = rightSIP.components.filter((c) => c.type === 'SOFTWARE')

  const leftPrice =
    leftSIP.costMinUSD && leftSIP.costMaxUSD
      ? leftSIP.costMinUSD === leftSIP.costMaxUSD
        ? formatCurrency(leftSIP.costMinUSD)
        : `${formatCurrency(leftSIP.costMinUSD)} - ${formatCurrency(leftSIP.costMaxUSD)}`
      : 'N/A'

  const rightPrice =
    rightSIP.costMinUSD && rightSIP.costMaxUSD
      ? rightSIP.costMinUSD === rightSIP.costMaxUSD
        ? formatCurrency(rightSIP.costMinUSD)
        : `${formatCurrency(rightSIP.costMinUSD)} - ${formatCurrency(rightSIP.costMaxUSD)}`
      : 'N/A'

  const priceDiffers =
    leftSIP.costMinUSD !== rightSIP.costMinUSD || leftSIP.costMaxUSD !== rightSIP.costMaxUSD

  const categoriesDiffer =
    JSON.stringify(leftSIP.categories.map((c) => c.name).sort()) !==
    JSON.stringify(rightSIP.categories.map((c) => c.name).sort())

  const osesDiffer =
    JSON.stringify(leftSIP.oses.map((o) => o.name).sort()) !==
    JSON.stringify(rightSIP.oses.map((o) => o.name).sort())

  const manufacturerDiffers = leftSIP.manufacturer?.name !== rightSIP.manufacturer?.name
  const supplierDiffers = leftSIP.supplier?.name !== rightSIP.supplier?.name

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/search"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>
        <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
          New Comparison
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
        <p className="text-muted-foreground">Side-by-side comparison of selected products</p>
      </div>

      {/* Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left SIP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              <Link href={`/sip/${leftSIP.slug}`} className="hover:text-primary">
                {leftSIP.name}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price */}
            <div className={priceDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-xl font-bold text-primary">{leftPrice}</p>
            </div>

            {/* Categories */}
            <div className={categoriesDiffer ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {leftSIP.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Operating Systems */}
            <div className={osesDiffer ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-2">Operating Systems</p>
              <div className="flex flex-wrap gap-2">
                {leftSIP.oses.map((os) => (
                  <Badge key={os.id} variant="outline">
                    {os.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Manufacturer */}
            {leftSIP.manufacturer && (
              <div
                className={manufacturerDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}
              >
                <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                <p className="text-sm font-medium">
                  {leftSIP.manufacturer.url ? (
                    <a
                      href={leftSIP.manufacturer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      {leftSIP.manufacturer.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    leftSIP.manufacturer.name
                  )}
                </p>
              </div>
            )}

            {/* Supplier */}
            {leftSIP.supplier && (
              <div className={supplierDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
                <p className="text-sm text-muted-foreground mb-1">Supplier</p>
                <p className="text-sm font-medium">
                  {leftSIP.supplier.url ? (
                    <a
                      href={leftSIP.supplier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      {leftSIP.supplier.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    leftSIP.supplier.name
                  )}
                </p>
              </div>
            )}

            {/* Components Count */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Components</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hardware</span>
                  <span className="text-sm font-semibold">{leftHardware.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Software</span>
                  <span className="text-sm font-semibold">{leftSoftware.length}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-bold">{leftSIP.components.length}</span>
                </div>
              </div>
            </div>

            {/* Versions */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Versions Available</p>
              <p className="text-sm font-semibold">{leftSIP.versions.length}</p>
              {leftSIP.versions[0] && (
                <p className="text-xs text-muted-foreground mt-1">
                  Latest: {leftSIP.versions[0].name}
                </p>
              )}
            </div>

            {/* Dependencies */}
            {leftSIP.dependencies.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                <p className="text-sm font-semibold">{leftSIP.dependencies.length}</p>
                <div className="mt-2 space-y-1">
                  {leftSIP.dependencies.map((dep) => (
                    <p key={dep.id} className="text-xs text-muted-foreground">
                      • {dep.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <Link href={`/sip/${leftSIP.slug}`}>
              <Button variant="outline" className="w-full">
                View Full Details
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Right SIP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              <Link href={`/sip/${rightSIP.slug}`} className="hover:text-primary">
                {rightSIP.name}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price */}
            <div className={priceDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-xl font-bold text-primary">{rightPrice}</p>
            </div>

            {/* Categories */}
            <div className={categoriesDiffer ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {rightSIP.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Operating Systems */}
            <div className={osesDiffer ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
              <p className="text-sm text-muted-foreground mb-2">Operating Systems</p>
              <div className="flex flex-wrap gap-2">
                {rightSIP.oses.map((os) => (
                  <Badge key={os.id} variant="outline">
                    {os.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Manufacturer */}
            {rightSIP.manufacturer && (
              <div
                className={manufacturerDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}
              >
                <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                <p className="text-sm font-medium">
                  {rightSIP.manufacturer.url ? (
                    <a
                      href={rightSIP.manufacturer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      {rightSIP.manufacturer.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    rightSIP.manufacturer.name
                  )}
                </p>
              </div>
            )}

            {/* Supplier */}
            {rightSIP.supplier && (
              <div className={supplierDiffers ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded' : ''}>
                <p className="text-sm text-muted-foreground mb-1">Supplier</p>
                <p className="text-sm font-medium">
                  {rightSIP.supplier.url ? (
                    <a
                      href={rightSIP.supplier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      {rightSIP.supplier.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    rightSIP.supplier.name
                  )}
                </p>
              </div>
            )}

            {/* Components Count */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Components</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hardware</span>
                  <span className="text-sm font-semibold">{rightHardware.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Software</span>
                  <span className="text-sm font-semibold">{rightSoftware.length}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-bold">{rightSIP.components.length}</span>
                </div>
              </div>
            </div>

            {/* Versions */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Versions Available</p>
              <p className="text-sm font-semibold">{rightSIP.versions.length}</p>
              {rightSIP.versions[0] && (
                <p className="text-xs text-muted-foreground mt-1">
                  Latest: {rightSIP.versions[0].name}
                </p>
              )}
            </div>

            {/* Dependencies */}
            {rightSIP.dependencies.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                <p className="text-sm font-semibold">{rightSIP.dependencies.length}</p>
                <div className="mt-2 space-y-1">
                  {rightSIP.dependencies.map((dep) => (
                    <p key={dep.id} className="text-xs text-muted-foreground">
                      • {dep.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <Link href={`/sip/${rightSIP.slug}`}>
              <Button variant="outline" className="w-full">
                View Full Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Key Differences Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Differences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priceDiffers && (
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm font-semibold">Price</p>
                <p className="text-xs text-muted-foreground">Different price ranges</p>
              </div>
            )}
            {categoriesDiffer && (
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm font-semibold">Categories</p>
                <p className="text-xs text-muted-foreground">Different product categories</p>
              </div>
            )}
            {osesDiffer && (
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm font-semibold">Operating Systems</p>
                <p className="text-xs text-muted-foreground">Different OS platforms</p>
              </div>
            )}
            {manufacturerDiffers && (
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm font-semibold">Manufacturer</p>
                <p className="text-xs text-muted-foreground">Different manufacturers</p>
              </div>
            )}
            {leftHardware.length !== rightHardware.length && (
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-semibold">Hardware Components</p>
                <p className="text-xs text-muted-foreground">
                  {leftHardware.length} vs {rightHardware.length}
                </p>
              </div>
            )}
            {leftSoftware.length !== rightSoftware.length && (
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-semibold">Software Components</p>
                <p className="text-xs text-muted-foreground">
                  {leftSoftware.length} vs {rightSoftware.length}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
