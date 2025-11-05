import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || ''

    // Total SIPs count
    const totalSIPs = await prisma.sIP.count({
      where: category
        ? {
            categories: {
              some: {
                category: {
                  name: { equals: category, mode: 'insensitive' as const },
                },
              },
            },
          }
        : {},
    })

    // SIPs per category
    const sipsPerCategory = category
      ? await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
          SELECT c.name as category, COUNT(sc."sipId")::bigint as count
          FROM "SIP_Category" sc
          JOIN "Category" c ON c.id = sc."categoryId"
          WHERE c.name ILIKE ${`%${category}%`}
          GROUP BY c.name
          ORDER BY count DESC
        `
      : await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
          SELECT c.name as category, COUNT(sc."sipId")::bigint as count
          FROM "SIP_Category" sc
          JOIN "Category" c ON c.id = sc."categoryId"
          GROUP BY c.name
          ORDER BY count DESC
        `

    // OS distribution per category
    const osDistribution = category
      ? await prisma.$queryRaw<Array<{ category: string; os: string; count: bigint }>>`
          SELECT c.name as category, o.name as os, COUNT(*)::bigint as count
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "SIP_OS" so ON so."sipId" = s.id
          JOIN "OperatingSystem" o ON o.id = so."osId"
          JOIN "Category" c ON c.id = sc."categoryId"
          WHERE c.name ILIKE ${`%${category}%`}
          GROUP BY c.name, o.name
          ORDER BY c.name, count DESC
        `
      : await prisma.$queryRaw<Array<{ category: string; os: string; count: bigint }>>`
          SELECT c.name as category, o.name as os, COUNT(*)::bigint as count
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "SIP_OS" so ON so."sipId" = s.id
          JOIN "OperatingSystem" o ON o.id = so."osId"
          JOIN "Category" c ON c.id = sc."categoryId"
          GROUP BY c.name, o.name
          ORDER BY c.name, count DESC
        `

    // Average cost per category
    const avgCostPerCategory = category
      ? await prisma.$queryRaw<
          Array<{ category: string; avgMin: number | null; avgMax: number | null }>
        >`
          SELECT
            c.name as category,
            AVG(s."costMinUSD")::numeric as "avgMin",
            AVG(s."costMaxUSD")::numeric as "avgMax"
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "Category" c ON c.id = sc."categoryId"
          WHERE c.name ILIKE ${`%${category}%`}
          GROUP BY c.name
          ORDER BY c.name
        `
      : await prisma.$queryRaw<
          Array<{ category: string; avgMin: number | null; avgMax: number | null }>
        >`
          SELECT
            c.name as category,
            AVG(s."costMinUSD")::numeric as "avgMin",
            AVG(s."costMaxUSD")::numeric as "avgMax"
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "Category" c ON c.id = sc."categoryId"
          GROUP BY c.name
          ORDER BY c.name
        `

    // Component counts
    const componentStats = category
      ? await prisma.$queryRaw<Array<{ category: string; hardware: bigint; software: bigint }>>`
          SELECT
            c.name as category,
            COUNT(CASE WHEN comp.type = 'HARDWARE' THEN 1 END)::bigint as hardware,
            COUNT(CASE WHEN comp.type = 'SOFTWARE' THEN 1 END)::bigint as software
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "Component" comp ON comp."sipId" = s.id
          JOIN "Category" c ON c.id = sc."categoryId"
          WHERE c.name ILIKE ${`%${category}%`}
          GROUP BY c.name
          ORDER BY c.name
        `
      : await prisma.$queryRaw<Array<{ category: string; hardware: bigint; software: bigint }>>`
          SELECT
            c.name as category,
            COUNT(CASE WHEN comp.type = 'HARDWARE' THEN 1 END)::bigint as hardware,
            COUNT(CASE WHEN comp.type = 'SOFTWARE' THEN 1 END)::bigint as software
          FROM "SIP_Category" sc
          JOIN "SIP" s ON s.id = sc."sipId"
          JOIN "Component" comp ON comp."sipId" = s.id
          JOIN "Category" c ON c.id = sc."categoryId"
          GROUP BY c.name
          ORDER BY c.name
        `

    // Transform bigint to number for JSON serialization
    const transformedData = {
      totalSIPs,
      sipsPerCategory: sipsPerCategory.map((item) => ({
        category: item.category,
        count: Number(item.count),
      })),
      osDistribution: osDistribution.map((item) => ({
        category: item.category,
        os: item.os,
        count: Number(item.count),
      })),
      avgCostPerCategory: avgCostPerCategory.map((item) => ({
        category: item.category,
        avgMin: item.avgMin ? Number(item.avgMin) : null,
        avgMax: item.avgMax ? Number(item.avgMax) : null,
      })),
      componentStats: componentStats.map((item) => ({
        category: item.category,
        hardware: Number(item.hardware),
        software: Number(item.software),
      })),
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
