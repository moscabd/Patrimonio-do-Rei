import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
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
          { error: 'Nenhuma empresa cadastrada.' },
          { status: 400 }
        );
      }
      companyId = company.id;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Planilha vazia' },
        { status: 400 }
      );
    }

    const assets: Array<{
      tagNumber: string;
      name: string;
      description?: string;
      barcode?: string;
      acquisitionValue?: number;
      acquisitionDate?: Date;
      invoiceNumber?: string;
      physicalLocation?: string;
      category: string;
      subcategory?: string;
    }> = [];

    let currentCategory = '';
    let currentSubcategory = '';

    for (const row of data) {
      const code = String(row['__EMPTY_1'] || '').trim();
      const description = String(row['__EMPTY_2'] || '').trim();
      const barcode = String(row['__EMPTY_3'] || '').trim();
      const value = row['__EMPTY_4'];
      const dateStr = row['__EMPTY_5'];
      const invoice = String(row['__EMPTY_6'] || '').trim();
      const location = String(row['__EMPTY_7'] || '').trim();

      if (/^\d+\.$/.test(code) || /^\d+\.\d+\.$/.test(code)) {
        const parts = code.replace(/\.$/, '').split('.');
        if (parts.length === 1) {
          currentCategory = description;
          currentSubcategory = '';
        } else if (parts.length === 2) {
          currentSubcategory = description;
        }
        continue;
      }

      if (!code || code.includes('TOTAL')) continue;

      const parts = code.split('.');
      if (parts.length !== 2 || !/^\d{4,}$/.test(parts[1])) continue;

      const cleanCode = parts[1];
      
      let acquisitionValue: number | undefined;
      if (value) {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(numValue)) acquisitionValue = numValue;
      }

      let acquisitionDate: Date | undefined;
      if (dateStr) {
        if (typeof dateStr === 'number') {
          acquisitionDate = new Date((dateStr - 25569) * 86400 * 1000);
        } else if (typeof dateStr === 'string') {
          const match = dateStr.match(/^(\d{2})[\/|-](\d{2})[\/|-](\d{4})$/);
          if (match) {
            const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
            if (!isNaN(date.getTime())) acquisitionDate = date;
          }
        }
      }

      assets.push({
        tagNumber: cleanCode,
        name: description || 'Sem nome',
        description: undefined,
        barcode: barcode || undefined,
        acquisitionValue,
        acquisitionDate,
        invoiceNumber: (invoice && invoice !== ' ') ? invoice : undefined,
        physicalLocation: (location && location !== ' ') ? location : undefined,
        category: currentCategory || 'Geral',
        subcategory: currentSubcategory || undefined,
      });
    }

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ativo válido encontrado na planilha' },
        { status: 400 }
      );
    }

    const results = { created: 0, updated: 0, errors: [] as string[] };

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
              category: assetData.category,
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
              category: assetData.category,
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
        results.errors.push(`Erro ao processar ${assetData.tagNumber}`);
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