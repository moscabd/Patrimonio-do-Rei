import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDisposalPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const disposals = await prisma.disposal.findMany({
      orderBy: { date: 'desc' },
    });

    if (disposals.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum registro encontrado' },
        { status: 404 }
      );
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateDisposalPDF(disposals, committee);
    const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;

    return new NextResponse(new Blob([pdfBuffer], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio_descartes.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF de descarte:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
