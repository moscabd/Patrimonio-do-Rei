import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAssetPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const assetId = request.nextUrl.searchParams.get('id');

    if (!assetId) {
      return Response.json(
        { error: 'ID do patrimônio é obrigatório' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return Response.json(
        { error: 'Patrimônio não encontrado' },
        { status: 404 }
      );
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateAssetPDF(asset, committee);
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="patrimonio_${asset.tagNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json(
      { error: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
