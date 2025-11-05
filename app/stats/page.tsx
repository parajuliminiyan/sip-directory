'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Package, Cpu, Code } from 'lucide-react'

interface StatsData {
  totalSIPs: number
  sipsPerCategory: Array<{ category: string; count: number }>
  osDistribution: Array<{ category: string; os: string; count: number }>
  avgCostPerCategory: Array<{ category: string; avgMin: number | null; avgMax: number | null }>
  componentStats: Array<{ category: string; hardware: number; software: number }>
}

export default function StatsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''

  const [stats, setStats] = useState<StatsData | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [statsRes, categoriesRes] = await Promise.all([
          fetch(`/api/stats${selectedCategory ? `?category=${selectedCategory}` : ''}`),
          fetch('/api/categories'),
        ])

        if (statsRes.ok && categoriesRes.ok) {
          const [statsData, categoriesData] = await Promise.all([
            statsRes.json(),
            categoriesRes.json(),
          ])
          setStats(statsData)
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory])

  const handleCategoryChange = (value: string) => {
    const newCategory = value === 'all' ? '' : value
    router.push(`/stats${newCategory ? `?category=${newCategory}` : ''}`)
  }

  // Transform OS distribution data for grouped bar chart
  const osChartData = stats?.osDistribution.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.category === item.category)
      if (existing) {
        existing[item.os] = item.count
      } else {
        acc.push({
          category: item.category,
          [item.os]: item.count,
        })
      }
      return acc
    },
    [] as Array<Record<string, string | number>>
  )

  // Get unique OS names for the chart
  const osNames = Array.from(
    new Set(stats?.osDistribution.map((item) => item.os) || [])
  )

  // Colors for different OS
  const osColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Failed to load statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Statistics Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Comprehensive analytics and insights about SIP products
        </p>

        {/* Category Filter */}
        <div className="max-w-xs">
          <Label htmlFor="category-filter" className="mb-2 block">
            Filter by Category
          </Label>
          <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total SIPs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SIPs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSIPs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCategory ? `in ${selectedCategory}` : 'across all categories'}
            </p>
          </CardContent>
        </Card>

        {/* Categories Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sipsPerCategory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCategory ? 'filtered' : 'total categories'}
            </p>
          </CardContent>
        </Card>

        {/* Total Hardware Components */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hardware Components</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.componentStats.reduce((sum, item) => sum + item.hardware, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total across all SIPs</p>
          </CardContent>
        </Card>

        {/* Total Software Components */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Software Components</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.componentStats.reduce((sum, item) => sum + item.software, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total across all SIPs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SIPs per Category */}
        <Card>
          <CardHeader>
            <CardTitle>SIPs per Category</CardTitle>
            <CardDescription>Number of products in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.sipsPerCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Cost per Category */}
        <Card>
          <CardHeader>
            <CardTitle>Average Cost per Category</CardTitle>
            <CardDescription>Average price range by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.avgCostPerCategory.map((item) => ({
                  ...item,
                  avgMin: item.avgMin ? item.avgMin / 100 : 0,
                  avgMax: item.avgMax ? item.avgMax / 100 : 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="avgMin" fill="#10b981" name="Avg Min Price" />
                <Bar dataKey="avgMax" fill="#f59e0b" name="Avg Max Price" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* OS Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>OS Distribution per Category</CardTitle>
          <CardDescription>Operating systems used in each category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={osChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              {osNames.map((osName, index) => (
                <Bar
                  key={osName}
                  dataKey={osName}
                  fill={osColors[index % osColors.length]}
                  name={osName}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Component Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Component Distribution</CardTitle>
          <CardDescription>Hardware vs Software components by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.componentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hardware" fill="#3b82f6" name="Hardware" />
              <Bar dataKey="software" fill="#10b981" name="Software" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

