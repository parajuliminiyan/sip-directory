import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Scale, DollarSign, Lock, Cpu } from 'lucide-react'

interface ResultCardProps {
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

export function ResultCard({
  name,
  slug,
  shortSummary,
  manufacturer,
  categories,
  oses,
  costMinUSD,
  costMaxUSD,
}: ResultCardProps) {
  // Detect product type
  const isOpenSource =
    name.toLowerCase().includes('apache') ||
    name.toLowerCase().includes('open source') ||
    (manufacturer?.toLowerCase().includes('apache') ?? false) ||
    (manufacturer?.toLowerCase().includes('foundation') ?? false) ||
    (shortSummary?.toLowerCase().includes('open source') ?? false) ||
    (shortSummary?.toLowerCase().includes('open-source') ?? false)

  const isDevelopmentBoard =
    name.toLowerCase().includes('board') ||
    name.toLowerCase().includes('kit') ||
    name.toLowerCase().includes('devkit') ||
    name.toLowerCase().includes('development')

  const isConsumerProduct = costMinUSD && costMinUSD > 0

  // Render price intelligently
  const renderPrice = () => {
    // Has price information
    if (costMinUSD && costMinUSD > 0) {
      const minPrice = formatCurrency(costMinUSD)
      const maxPrice = costMaxUSD && costMaxUSD !== costMinUSD ? formatCurrency(costMaxUSD) : null

      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-lg font-semibold text-green-600">
            {maxPrice ? `${minPrice} - ${maxPrice}` : minPrice}
          </span>
        </div>
      )
    }

    // Open source software
    if (isOpenSource) {
      return (
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Open Source</span>
          <span className="text-xs text-muted-foreground">Free</span>
        </div>
      )
    }

    // No price info available
    return (
      <span className="text-sm text-muted-foreground italic">
        Price not available
      </span>
    )
  }

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link href={`/sip/${slug}`} className="flex-1 cursor-pointer">
        <div className="flex-1">
          {/* Product Type Indicators */}
          <div className="flex flex-wrap gap-1 mb-3">
            {isConsumerProduct && (
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs">
                💰 Consumer
              </Badge>
            )}
            {isOpenSource && (
              <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
                🔓 Open Source
              </Badge>
            )}
            {isDevelopmentBoard && (
              <Badge variant="default" className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs">
                🔧 Dev Board
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-semibold mb-2 hover:text-primary">{name}</h3>

          {manufacturer && (
            <p className="text-sm text-muted-foreground mb-3">by {manufacturer}</p>
          )}

          {shortSummary && <p className="text-sm mb-4 line-clamp-2">{shortSummary}</p>}

          <div className="flex items-center justify-between mb-3">
            {/* Category and OS badges */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>

            {oses.length > 0 && (
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {oses[0]}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t mt-auto">
          {renderPrice()}
        </div>
      </Link>

      <div className="mt-4">
        <Link href={`/compare?left=${slug}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="w-full">
            <Scale className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </Link>
      </div>
    </div>
  )
}
