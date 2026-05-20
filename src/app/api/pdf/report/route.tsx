import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReportPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') || undefined;
    const search = request.nextUrl.searchParams.get('search') || undefined;

    const whereFilter: any = {};
    if (category) whereFilter.category = category;
    if (search) {
      whereFilter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where: whereFilter,
      orderBy: [{ category: 'asc' }, { tagNumber: 'asc' }],
    });

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum patrimônio encontrado' },
        { status: 404 }
      );
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateReportPDF(assets, committee, { category, search });
    const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;

    return new NextResponse(new Blob([pdfBuffer], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio_patrimonios.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
