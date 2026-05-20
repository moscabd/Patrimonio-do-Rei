import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAssetPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const assetId = request.nextUrl.searchParams.get('id');

    if (!assetId) {
      return NextResponse.json(
        { error: 'ID do patrimônio é obrigatório' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Patrimônio não encontrado' },
        { status: 404 }
      );
    }

    const committee = await prisma.committee.findFirst();
    const pdfBytes = await generateAssetPDF(asset, committee);
    const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;

    return new NextResponse(new Blob([pdfBuffer], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="patrimonio_${asset.tagNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
