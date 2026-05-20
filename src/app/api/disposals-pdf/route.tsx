import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDisposalPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const disposals = await prisma.disposal.findMany({
      orderBy: { date: 'desc' },
    });

    if (disposals.length === 0) {
      return new Response('<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:#aaa"><p style="text-align:center;font-size:18px">Nenhum registro encontrado</p></body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateDisposalPDF(disposals, committee);
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio_descartes.pdf"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF de descarte:', error);
    return Response.json(
      { error: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
