import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { description, quantity, value, date, reason, notes } = body;

    const disposal = await prisma.disposal.update({
      where: { id },
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
    console.error('Erro ao atualizar descarte:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar registro' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.disposal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir descarte:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir registro' },
      { status: 500 }
    );
  }
}
