import Link from 'next/link'
import { SearchBar } from '@/components/SearchBar'
import { Watch, Home } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          SIP Directory
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-12 px-4">
          Discover and compare software-intensive products with detailed hardware and software component information
        </p>

        <div className="mb-16 px-4">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 px-4">
          <Link href="/search?category=Appliances">
            <div className="p-6 border rounded-lg hover:shadow-md hover:border-primary transition-all cursor-pointer group">
              <div className="flex items-center justify-center mb-4">
                <Home className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Appliances</h3>
              <p className="text-sm text-muted-foreground">
                Explore smart home devices, kitchen appliances, and more
              </p>
            </div>
          </Link>
          <Link href="/search?category=Wearables">
            <div className="p-6 border rounded-lg hover:shadow-md hover:border-primary transition-all cursor-pointer group">
              <div className="flex items-center justify-center mb-4">
                <Watch className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Wearables</h3>
              <p className="text-sm text-muted-foreground">
                Discover smartwatches, fitness trackers, and wearable tech
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
