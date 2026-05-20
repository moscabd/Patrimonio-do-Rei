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

    // Create committee information
    const committee = await prisma.committee.upsert({
      where: { id: 'default-committee' },
      update: {},
      create: {
        id: 'default-committee',
        organization: 'Núcleo REI RABINO',
        cnpj: '09.621.597/0001-66',
        location: 'PERDIGÃO/MG',
        president: 'Càssio Eduardo Paiva',
        vicePresident: 'EVANDRO APARECIDO MACHADO',
        fiscalPresident: 'JÕAO BATISTA ALVES SORES',
        member1: 'ANA CÉLIA ALVARENGA SOARES',
        member2: 'LETÍCIA MORAIS',
      }
    });

    console.log('✅ Committee information created');

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

    // Seed disposal data
    const disposals = [
      { description: 'GELADEIRA ELETROLUX 260LTS', quantity: 1, value: 400.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'GELADEIRA BRASTEMP 340 LTS', quantity: 1, value: 350.00, date: new Date(), reason: 'DOADA', notes: 'Doada para Márcio' },
      { description: 'GELADEIRA ELETROLUX 360LTS', quantity: 1, value: 350.00, date: new Date(), reason: 'DOADA' },
      { description: 'MAQUINA DE LAVAR ROUPAS CONTINENTAL', quantity: 1, value: 400.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'CADEIRAS DE PLÁSTICO BRANCA', quantity: 12, value: 480.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'CADEIRAS DE PLÁSTICO VERMELHA', quantity: 12, value: 480.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'BEBEDOURO INDUSTRIAL BRANCO 220V', quantity: 1, value: 400.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'TOTÓ', quantity: 1, value: 299.00, date: new Date(), reason: 'DESCARTADA' },
      { description: 'FORNO A GÁS DAKO', quantity: 1, value: 450.00, date: new Date(), reason: 'DOADA' },
      { description: 'MESA DE PEDRA ARDOSIA 1,30X0,80 MT', quantity: 1, value: 400.00, date: new Date(), reason: 'QUEBROU' },
      { description: 'PIA COZINHA GRANITO C/ ARMARIO 1,20 X 0,45 MT', quantity: 1, value: 400.00, date: new Date(), reason: 'QUEBROU' },
      { description: 'ROÇADEIRA', quantity: 1, value: 600.00, date: new Date(), reason: 'ESTRAGOU', notes: 'Sem conserto' },
    ];

    for (const d of disposals) {
      await prisma.disposal.create({ data: d });
    }

    console.log(`✅ ${disposals.length} disposals seeded`);
    console.log('✅ Sistema pronto para uso!');
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
