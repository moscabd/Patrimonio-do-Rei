import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pdf } from '@react-pdf/renderer';
import { ReportPDF } from '@/components/pdf/ReportPDF';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

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

    const pdfDocument = <ReportPDF assets={assets} committee={committee} filters={{ category, search }} />;
    const pdfBlob = await pdf(pdfDocument).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio_patrimonios.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório PDF' },
      { status: 500 }
    );
  }
}
