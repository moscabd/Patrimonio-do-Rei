import { NextRequest } from 'next/server';
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
      return new Response('<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:#aaa"><p style="text-align:center;font-size:18px">Nenhum patrimônio encontrado</p></body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateReportPDF(assets, committee, { category, search });
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio_patrimonios.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    return Response.json(
      { error: 'Erro ao gerar relatório PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
