import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pdf } from '@react-pdf/renderer';
import { DisposalPDF } from '@/components/pdf/DisposalPDF';

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

    const pdfDocument = <DisposalPDF disposals={disposals} committee={committee} />;
    const pdfBlob = await pdf(pdfDocument).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio_descartes.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF de descarte:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}
