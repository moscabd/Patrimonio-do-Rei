import { NextRequest, NextResponse } from 'next/server';
import { parseInventoryFromBuffer } from '@/lib/excel-parser';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let companyId = formData.get('companyId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    if (!companyId) {
      const company = await prisma.company.findFirst();
      if (!company) {
        return NextResponse.json(
          { error: 'Nenhuma empresa cadastrada. Cadastre uma empresa primeiro.' },
          { status: 400 }
        );
      }
      companyId = company.id;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use arquivos Excel (.xlsx ou .xls)' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const assets = parseInventoryFromBuffer(buffer);

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ativo válido encontrado na planilha' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const assetData of assets) {
      try {
        const existingAsset = await prisma.asset.findUnique({
          where: { tagNumber: assetData.tagNumber },
        });

        if (existingAsset) {
          await prisma.asset.update({
            where: { id: existingAsset.id },
            data: {
              name: assetData.name,
              description: assetData.description || null,
              category: assetData.category || 'Geral',
              subcategory: assetData.subcategory || null,
              barcode: assetData.barcode || null,
              acquisitionValue: assetData.acquisitionValue || null,
              acquisitionDate: assetData.acquisitionDate || null,
              invoiceNumber: assetData.invoiceNumber || null,
              physicalLocation: assetData.physicalLocation || null,
            },
          });
          results.updated++;
        } else {
          await prisma.asset.create({
            data: {
              tagNumber: assetData.tagNumber,
              name: assetData.name,
              description: assetData.description || null,
              category: assetData.category || 'Geral',
              subcategory: assetData.subcategory || null,
              barcode: assetData.barcode || null,
              acquisitionValue: assetData.acquisitionValue || null,
              currentValue: assetData.acquisitionValue || null,
              acquisitionDate: assetData.acquisitionDate || null,
              invoiceNumber: assetData.invoiceNumber || null,
              physicalLocation: assetData.physicalLocation || null,
              companyId: companyId,
              status: 'ACTIVE',
            },
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Erro ao processar ${assetData.tagNumber}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${results.created} criados, ${results.updated} atualizados`,
      totalProcessed: assets.length,
      results,
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a planilha' },
      { status: 500 }
    );
  }
}