const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  // Create default admin user
  const hashedPassword = await bcryptjs.hash('admin123', 10);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'admin@rei.com' },
      update: {
        password: hashedPassword,
        name: 'Administrador',
        role: 'SUPER_ADMIN'
      },
      create: {
        email: 'admin@rei.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });

    console.log('✅ Default admin user seeded:', user.email);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
