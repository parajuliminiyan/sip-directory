import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const sip = await prisma.sIP.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        oses: {
          include: {
            os: true,
          },
        },
        manufacturer: true,
        supplier: true,
        versions: {
          orderBy: {
            releasedAt: 'desc',
          },
        },
        components: {
          orderBy: {
            type: 'asc',
          },
        },
        dependencies: {
          include: {
            dependsOn: true,
          },
        },
      },
    })

    if (!sip) {
      return NextResponse.json({ error: 'SIP not found' }, { status: 404 })
    }

    // Transform the data
    const result = {
      id: sip.id,
      name: sip.name,
      slug: sip.slug,
      shortSummary: sip.shortSummary,
      description: sip.description,
      costMinUSD: sip.costMinUSD,
      costMaxUSD: sip.costMaxUSD,
      scrapedAt: sip.scrapedAt,
      dataSource: sip.dataSource,
      createdAt: sip.createdAt,
      updatedAt: sip.updatedAt,
      manufacturer: sip.manufacturer
        ? {
            id: sip.manufacturer.id,
            name: sip.manufacturer.name,
            url: sip.manufacturer.url,
          }
        : null,
      supplier: sip.supplier
        ? {
            id: sip.supplier.id,
            name: sip.supplier.name,
            url: sip.supplier.url,
          }
        : null,
      categories: sip.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
      })),
      oses: sip.oses.map((o) => ({
        id: o.os.id,
        name: o.os.name,
      })),
      versions: sip.versions.map((v) => ({
        id: v.id,
        name: v.name,
        releasedAt: v.releasedAt,
        notes: v.notes,
      })),
      components: sip.components.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        spec: c.spec,
        required: c.required,
      })),
      dependencies: sip.dependencies.map((d) => ({
        id: d.id,
        name: d.dependsOn.name,
        slug: d.dependsOn.slug,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching SIP:', error)
    return NextResponse.json({ error: 'Failed to fetch SIP' }, { status: 500 })
  }
}
