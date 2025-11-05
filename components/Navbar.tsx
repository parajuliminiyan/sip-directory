'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/search', label: 'Search' },
  { href: '/stats', label: 'Statistics' },
  { href: '/compare', label: 'Compare' },
]

export function Navbar() {
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
              SIP Directory
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'text-sm font-medium transition-colors px-2 py-1',
                    pathname === link.href
                      ? 'text-foreground bg-accent rounded-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="py-4 border-t">
            <SearchBar onSearch={() => setShowSearch(false)} />
          </div>
        )}
      </div>
    </nav>
  )
}
