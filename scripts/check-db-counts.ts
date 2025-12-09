import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseCounts() {
  try {
    console.log('🔍 Checking production database counts...\n');

    // Count all tables
    const sipCount = await prisma.sIP.count();
    const categoryCount = await prisma.category.count();
    const osCount = await prisma.operatingSystem.count();
    const manufacturerCount = await prisma.manufacturer.count();
    const supplierCount = await prisma.supplier.count();
    const componentCount = await prisma.component.count();
    const versionCount = await prisma.version.count();
    const dependencyCount = await prisma.dependency.count();

    console.log('📊 Database Summary:');
    console.log('━'.repeat(50));
    console.log(`Total SIPs:              ${sipCount}`);
    console.log(`Total Categories:        ${categoryCount}`);
    console.log(`Total Operating Systems: ${osCount}`);
    console.log(`Total Manufacturers:     ${manufacturerCount}`);
    console.log(`Total Suppliers:         ${supplierCount}`);
    console.log(`Total Components:        ${componentCount}`);
    console.log(`Total Versions:          ${versionCount}`);
    console.log(`Total Dependencies:      ${dependencyCount}`);
    console.log('━'.repeat(50));

    // Get SIPs by category
    console.log('\n📦 SIPs by Category:');
    const categoriesWithCounts = await prisma.category.findMany({
      include: {
        _count: {
          select: { sips: true }
        }
      }
    });

    categoriesWithCounts.forEach(cat => {
      console.log(`  ${cat.name}: ${cat._count.sips} products`);
    });

    // Get SIPs by manufacturer
    console.log('\n🏭 SIPs by Manufacturer:');
    const manufacturersWithCounts = await prisma.manufacturer.findMany({
      include: {
        _count: {
          select: { sips: true }
        }
      },
      orderBy: {
        sips: {
          _count: 'desc'
        }
      }
    });

    manufacturersWithCounts.forEach(mfr => {
      console.log(`  ${mfr.name}: ${mfr._count.sips} products`);
    });

    // Get SIPs by OS
    console.log('\n💿 SIPs by Operating System:');
    const osWithCounts = await prisma.operatingSystem.findMany({
      include: {
        _count: {
          select: { sips: true }
        }
      },
      orderBy: {
        sips: {
          _count: 'desc'
        }
      }
    });

    osWithCounts.forEach(os => {
      console.log(`  ${os.name}: ${os._count.sips} products`);
    });

    // Get data source breakdown
    console.log('\n📡 SIPs by Data Source:');
    const scrapedCount = await prisma.sIP.count({
      where: { dataSource: 'scraped' }
    });
    const curatedCount = await prisma.sIP.count({
      where: { dataSource: 'curated' }
    });
    const manualCount = await prisma.sIP.count({
      where: { dataSource: 'manual' }
    });

    console.log(`  Scraped: ${scrapedCount}`);
    console.log(`  Curated: ${curatedCount}`);
    console.log(`  Manual:  ${manualCount}`);

    // Get recent scrapes
    console.log('\n🕒 Recently Scraped Products (Last 5):');
    const recentSips = await prisma.sIP.findMany({
      where: {
        scrapedAt: { not: null }
      },
      orderBy: {
        scrapedAt: 'desc'
      },
      take: 5,
      select: {
        name: true,
        manufacturer: true,
        scrapedAt: true,
        dataSource: true
      }
    });

    recentSips.forEach(sip => {
      const scrapedDate = sip.scrapedAt ? new Date(sip.scrapedAt).toLocaleString() : 'N/A';
      console.log(`  ${sip.name} (${sip.manufacturer}) - ${scrapedDate}`);
    });

    console.log('\n✅ Database check complete!\n');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseCounts();
