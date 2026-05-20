import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, quantity, value, date, reason, notes } = body;

    const disposal = await prisma.disposal.create({
      data: {
        description,
        quantity: parseInt(quantity) || 1,
        value: parseFloat(value) || 0,
        date: new Date(date),
        reason,
        notes: notes || null,
      },
    });

    return NextResponse.json(disposal);
  } catch (error) {
    console.error('Erro ao criar descarte:', error);
    return NextResponse.json(
      { error: 'Erro ao criar registro' },
      { status: 500 }
    );
  }
}
