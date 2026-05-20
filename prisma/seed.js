const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create default company
    const company = await prisma.company.upsert({
      where: { document: '12.345.678/0001-99' },
      update: {
        name: 'Patrimônio do Rei',
      },
      create: {
        name: 'Patrimônio do Rei',
        document: '12.345.678/0001-99',
      }
    });

    console.log('✅ Default company created:', company.name);

    // Create default admin user
    const hashedPassword = await bcryptjs.hash('Rei@1404', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@rei.com' },
      update: {
        username: 'Admin',
        password: hashedPassword,
        name: 'Administrador',
        role: 'SUPER_ADMIN',
        companyId: company.id,
      },
      create: {
        username: 'Admin',
        email: 'admin@rei.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyId: company.id,
      }
    });

    console.log('✅ Default admin user seeded:', user.username, '/ Rei@1404');
    console.log('✅ Sistema pronto para uso!');
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
