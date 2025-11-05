'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ExternalLink, CheckCircle2, Circle } from 'lucide-react'

interface SIP {
  id: string
  name: string
  slug: string
  shortSummary: string | null
  description: string | null
  costMinUSD: number | null
  costMaxUSD: number | null
  scrapedAt: string | null
  dataSource: string | null
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

export default function SIPDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [sip, setSip] = useState<SIP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSIP = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/sips/${slug}`)

        if (response.status === 404) {
          setError('Product not found')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch product details')
        }

        const data = await response.json()
        setSip(data)
      } catch (err) {
        console.error('Error fetching SIP:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchSIP()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-4" />
          <div className="h-4 w-96 bg-muted rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !sip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/search"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Product not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The product you are looking for does not exist or could not be loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hardwareComponents = sip.components.filter((c) => c.type === 'HARDWARE')
  const softwareComponents = sip.components.filter((c) => c.type === 'SOFTWARE')

  const priceRange =
    sip.costMinUSD && sip.costMaxUSD
      ? sip.costMinUSD === sip.costMaxUSD
        ? formatCurrency(sip.costMinUSD)
        : `${formatCurrency(sip.costMinUSD)} - ${formatCurrency(sip.costMaxUSD)}`
      : 'Price not available'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/search"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Search
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{sip.name}</h1>
        {sip.shortSummary && (
          <p className="text-xl text-muted-foreground mb-4">{sip.shortSummary}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {sip.categories.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
          {sip.oses.map((os) => (
            <Badge key={os.id} variant="outline">
              {os.name}
            </Badge>
          ))}
        </div>

        {/* Data Source Info */}
        {sip.scrapedAt && sip.dataSource && (
          <p className="text-sm text-muted-foreground italic">
            Data {sip.dataSource === 'scraped' ? 'extracted from manufacturer website' : 'from ' + sip.dataSource} on{' '}
            {new Date(sip.scrapedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        <p className="text-2xl font-bold text-primary">{priceRange}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="software">Software</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {sip.description || sip.shortSummary || 'No description available.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sip.manufacturer && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">Manufacturer</span>
                      <span className="text-sm">
                        {sip.manufacturer.url ? (
                          <a
                            href={sip.manufacturer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            {sip.manufacturer.name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          sip.manufacturer.name
                        )}
                      </span>
                    </div>
                  )}

                  {sip.supplier && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">Supplier</span>
                      <span className="text-sm">
                        {sip.supplier.url ? (
                          <a
                            href={sip.supplier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            {sip.supplier.name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          sip.supplier.name
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Categories</span>
                    <span className="text-sm">
                      {sip.categories.map((c) => c.name).join(', ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Operating Systems</span>
                    <span className="text-sm">{sip.oses.map((o) => o.name).join(', ')}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hardware Tab */}
            <TabsContent value="hardware" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Components</CardTitle>
                  <CardDescription>
                    {hardwareComponents.length} component
                    {hardwareComponents.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hardwareComponents.length > 0 ? (
                    <div className="space-y-4">
                      {hardwareComponents.map((component) => (
                        <div key={component.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold flex items-center">
                              {component.required ? (
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              {component.name}
                            </h4>
                            {!component.required && (
                              <Badge variant="outline" className="text-xs">
                                Optional
                              </Badge>
                            )}
                          </div>
                          {component.spec && (
                            <p className="text-sm text-muted-foreground">{component.spec}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hardware components listed.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Software Tab */}
            <TabsContent value="software" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Software Components</CardTitle>
                  <CardDescription>
                    {softwareComponents.length} component
                    {softwareComponents.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {softwareComponents.length > 0 ? (
                    <div className="space-y-4">
                      {softwareComponents.map((component) => (
                        <div key={component.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold flex items-center">
                              {component.required ? (
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              {component.name}
                            </h4>
                            {!component.required && (
                              <Badge variant="outline" className="text-xs">
                                Optional
                              </Badge>
                            )}
                          </div>
                          {component.spec && (
                            <p className="text-sm text-muted-foreground">{component.spec}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No software components listed.
                    </p>
                  )}
                </CardContent>
              </Card>

              {sip.dependencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Products this SIP depends on or integrates with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sip.dependencies.map((dep) => (
                        <Link
                          key={dep.id}
                          href={`/sip/${dep.slug}`}
                          className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <p className="text-sm font-medium">{dep.name}</p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    {sip.versions.length} version{sip.versions.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sip.versions.length > 0 ? (
                    <div className="space-y-4">
                      {sip.versions.map((version) => (
                        <div key={version.id} className="border-l-2 border-primary pl-4 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">Version {version.name}</h4>
                            {version.releasedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(version.releasedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {version.notes && (
                            <p className="text-sm text-muted-foreground">{version.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No version history available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Components</p>
                <p className="text-2xl font-bold">{sip.components.length}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Hardware</p>
                <p className="text-xl font-semibold">{hardwareComponents.length}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Software</p>
                <p className="text-xl font-semibold">{softwareComponents.length}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Versions</p>
                <p className="text-xl font-semibold">{sip.versions.length}</p>
              </div>

              {sip.versions.length > 0 && sip.versions[0] && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Latest Version</p>
                  <p className="text-xl font-semibold">{sip.versions[0].name}</p>
                </div>
              )}

              {sip.dependencies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                  <p className="text-xl font-semibold">{sip.dependencies.length}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
