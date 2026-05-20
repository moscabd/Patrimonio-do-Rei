import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pdf } from '@react-pdf/renderer';
import { AssetPDF } from '@/components/pdf/AssetPDF';

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

    const pdfDocument = <AssetPDF asset={asset} committee={committee} />;
    const pdfBlob = await pdf(pdfDocument).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    return new NextResponse(pdfBuffer, {
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
