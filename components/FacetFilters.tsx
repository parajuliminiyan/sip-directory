'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Category {
  id: string
  name: string
  _count?: {
    sips: number
  }
}

interface OperatingSystem {
  id: string
  name: string
  _count?: {
    sips: number
  }
}

interface FacetFiltersProps {
  categories: Category[]
  oses: OperatingSystem[]
  selectedCategory: string
  selectedOS: string
  productType: string[]
  onCategoryChange: (value: string) => void
  onOSChange: (value: string) => void
  onProductTypeChange: (types: string[]) => void
  onClearFilters: () => void
}

export function FacetFilters({
  categories,
  oses,
  selectedCategory,
  selectedOS,
  productType,
  onCategoryChange,
  onOSChange,
  onProductTypeChange,
  onClearFilters,
}: FacetFiltersProps) {
  const hasFilters = selectedCategory || selectedOS || productType.length > 0

  const handleProductTypeToggle = (type: string) => {
    if (productType.includes(type)) {
      onProductTypeChange(productType.filter(t => t !== type))
    } else {
      onProductTypeChange([...productType, type])
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="category" className="text-sm mb-2 block">
            Category
          </Label>
          <Select value={selectedCategory || 'all'} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name} {category._count?.sips && `(${category._count.sips})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="os" className="text-sm mb-2 block">
            Operating System
          </Label>
          <Select value={selectedOS || 'all'} onValueChange={onOSChange}>
            <SelectTrigger id="os">
              <SelectValue placeholder="All Operating Systems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operating Systems</SelectItem>
              {oses.map((os) => (
                <SelectItem key={os.id} value={os.name}>
                  {os.name} {os._count?.sips && `(${os._count.sips})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Product Type</Label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productType.includes('consumer')}
                onChange={() => handleProductTypeToggle('consumer')}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Consumer Products</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productType.includes('opensource')}
                onChange={() => handleProductTypeToggle('opensource')}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Open Source</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productType.includes('devboard')}
                onChange={() => handleProductTypeToggle('devboard')}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Dev Boards</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
