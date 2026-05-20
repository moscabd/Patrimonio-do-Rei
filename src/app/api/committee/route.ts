import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const committee = await prisma.committee.findFirst();
    return NextResponse.json(committee);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization, cnpj, location, president, vicePresident, fiscalPresident, member1, member2 } = body;

    const existing = await prisma.committee.findFirst();

    if (existing) {
      const updated = await prisma.committee.update({
        where: { id: existing.id },
        data: { organization, cnpj, location, president, vicePresident, fiscalPresident, member1, member2 },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.committee.create({
        data: { organization, cnpj, location, president, vicePresident, fiscalPresident, member1, member2 },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
