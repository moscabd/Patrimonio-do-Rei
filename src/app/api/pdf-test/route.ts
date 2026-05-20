import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');

    const tests = { pdfLib: false, fontEmbed: false, drawText: false, save: false, buffer: false };
    let error = '';

    tests.pdfLib = true;

    const pdfDoc = await PDFDocument.create();
    tests.fontEmbed = true;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    tests.fontEmbed = true;

    const page = pdfDoc.addPage([595, 842]);
    page.drawText('PDF TEST - OK', { x: 50, y: 800, size: 20, font: boldFont });
    page.drawText('àáâãçéêíóôõú ÀÁÂÃÇÉÊÍÓÔÕÚ', { x: 50, y: 770, size: 12, font });
    page.drawText('ABCDEFGHIJKLM abcdefghijklm', { x: 50, y: 750, size: 12, font });
    page.drawText('1.1.0001 - R$ 1.500,00', { x: 50, y: 730, size: 12, font });
    tests.drawText = true;

    const bytes = await pdfDoc.save();
    tests.save = true;

    const buf = Buffer.from(bytes);
    tests.buffer = true;

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="teste.pdf"',
      },
    });
  } catch (e: any) {
    return Response.json({
      error: e?.message || 'Erro desconhecido',
      stack: e?.stack?.split('\n').slice(0, 5).join('\n') || '',
    }, { status: 500 });
  }
}
