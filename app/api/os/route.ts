import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const oses = await prisma.operatingSystem.findMany({
      where: {
        sips: {
          some: {}, // Only include OS that have at least one SIP
        },
      },
      include: {
        _count: {
          select: { sips: true }, // Include count for display
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(oses)
  } catch (error) {
    console.error('Error fetching operating systems:', error)
    return NextResponse.json({ error: 'Failed to fetch operating systems' }, { status: 500 })
  }
}
