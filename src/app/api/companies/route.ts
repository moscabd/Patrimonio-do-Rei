import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    
    if (!company) {
      return NextResponse.json(
        { error: 'Nenhuma empresa encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: company.id, name: company.name });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
      { status: 500 }
    );
  }
}