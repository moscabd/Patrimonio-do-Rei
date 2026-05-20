import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const assets = await prisma.asset.findMany({ orderBy: { name: 'asc' } });

  const header = [
    'Código',
    'Nome',
    'Categoria',
    'Subcategoria',
    'Cód Barras',
    'Valor (R$)',
    'Data Aquisição',
    'Documento Fiscal',
    'Local'
  ];

  const lines = [header.join(';')];

  for (const a of assets) {
    const row = [
      a.tagNumber || '',
      a.name || '',
      a.category || '',
      a.subcategory || '',
      a.barcode || '',
      a.currentValue != null ? String(a.currentValue) : (a.acquisitionValue != null ? String(a.acquisitionValue) : ''),
      a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString('pt-BR') : '',
      a.invoiceNumber || '',
      a.physicalLocation || ''
    ];
    lines.push(row.map(v => String(v).replace(/\r|\n/g, ' ')).join(';'));
  }

  const csv = '\uFEFF' + lines.join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=patrimonios_export_${Date.now()}.csv`
    }
  });
}
