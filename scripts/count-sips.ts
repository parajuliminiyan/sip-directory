import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalSIPs = await prisma.sIP.count();
  const totalCategories = await prisma.category.count();
  const totalOS = await prisma.operatingSystem.count();
  const totalVersions = await prisma.version.count();
  const totalComponents = await prisma.component.count();

  console.log('\n📊 Database Statistics:');
  console.log('─────────────────────────');
  console.log(`SIPs:          ${totalSIPs}`);
  console.log(`Categories:    ${totalCategories}`);
  console.log(`OS:            ${totalOS}`);
  console.log(`Versions:      ${totalVersions}`);
  console.log(`Components:    ${totalComponents}`);
  console.log('─────────────────────────\n');

  // Show breakdown by category
  const sipsByCategory = await prisma.category.findMany({
    include: {
      _count: {
        select: { sips: true },
      },
    },
  });

  console.log('📁 SIPs by Category:');
  sipsByCategory.forEach((cat) => {
    console.log(`  ${cat.name}: ${cat._count.sips}`);
  });

  console.log('\n');

  // Show breakdown by OS
  const sipsByOS = await prisma.operatingSystem.findMany({
    include: {
      _count: {
        select: { sips: true },
      },
    },
  });

  console.log('💻 SIPs by Operating System:');
  sipsByOS.forEach((os) => {
    console.log(`  ${os.name}: ${os._count.sips}`);
  });

  console.log('\n');

  await prisma.$disconnect();
}

main();
