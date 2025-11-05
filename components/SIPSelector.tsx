'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SIPOption {
  id: string
  name: string
  slug: string
  categories: string[]
}

interface SIPSelectorProps {
  selectedSlug: string
  onSelect: (slug: string) => void
  excludeSlug?: string
}

export function SIPSelector({ selectedSlug, onSelect, excludeSlug }: SIPSelectorProps) {
  const [sips, setSips] = useState<SIPOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSIPs = async () => {
      try {
        const response = await fetch('/api/sips?pageSize=100')
        if (response.ok) {
          const data = await response.json()
          setSips(data.results)
        }
      } catch (error) {
        console.error('Failed to fetch SIPs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSIPs()
  }, [])

  const availableSIPs = sips.filter((sip) => sip.slug !== excludeSlug)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded" />
      </div>
    )
  }

  return (
    <Select value={selectedSlug} onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a product..." />
      </SelectTrigger>
      <SelectContent>
        {availableSIPs.map((sip) => (
          <SelectItem key={sip.id} value={sip.slug}>
            {sip.name}
            {sip.categories.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({sip.categories.join(', ')})
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
