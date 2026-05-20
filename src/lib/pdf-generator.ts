import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

const GOLD = rgb(0.83, 0.69, 0.22);
const DARK = rgb(0.2, 0.2, 0.2);
const MUTED = rgb(0.6, 0.6, 0.6);
const LIGHT_BG = rgb(0.97, 0.96, 0.94);
const WHITE = rgb(1, 1, 1);

const statusColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
  ACTIVE: { bg: [0.83, 0.93, 0.85], text: [0.08, 0.34, 0.14] },
  IN_USE: { bg: [0.8, 0.9, 1], text: [0, 0.25, 0.52] },
  MAINTENANCE: { bg: [1, 0.95, 0.8], text: [0.52, 0.39, 0.02] },
  RETIRED: { bg: [0.89, 0.89, 0.9], text: [0.22, 0.24, 0.25] },
  MISSING: { bg: [0.97, 0.85, 0.86], text: [0.45, 0.11, 0.14] },
  RESERVE: { bg: [0.82, 0.93, 0.95], text: [0.05, 0.33, 0.38] },
};

const reasonColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
  DESCARTADA: { bg: [0.97, 0.85, 0.86], text: [0.45, 0.11, 0.14] },
  DOADA: { bg: [0.83, 0.93, 0.85], text: [0.08, 0.34, 0.14] },
  QUEBROU: { bg: [1, 0.95, 0.8], text: [0.52, 0.39, 0.02] },
  ESTRAGOU: { bg: [1, 0.89, 0.8], text: [0.8, 0.33, 0] },
  ROUBADA: { bg: [0.89, 0.83, 0.95], text: [0.35, 0.18, 0.51] },
  PERDIDA: { bg: [0.89, 0.89, 0.9], text: [0.22, 0.24, 0.25] },
};

const reasonLabels: Record<string, string> = {
  DESCARTADA: 'Descartado',
  DOADA: 'Doado',
  QUEBROU: 'Quebrou',
  ESTRAGOU: 'Estragou',
  ROUBADA: 'Roubado',
  PERDIDA: 'Perdido',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Baixado',
  MISSING: 'Extraviado',
  RESERVE: 'Reserva',
};

function formatCurrency(value: number | null): string {
  if (!value) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sanitizePdfText(text: string): string {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[•–—]/g, '-')
    .replace(/["""''´`]/g, "'")
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

async function drawHeader(page: any, font: PDFFont, boldFont: PDFFont, committee: any, title: string, subtitle: string) {
  const width = page.getWidth();
  let y = page.getHeight() - 40;

  page.drawText('PATRIMÔNIO DO REI', {
    x: width / 2 - 100,
    y,
    size: 18,
    font: boldFont,
    color: GOLD,
  });
  y -= 25;

  page.drawText(title, {
    x: width / 2 - 80,
    y,
    size: 10,
    font: font,
    color: DARK,
  });
  y -= 15;

  const org = committee?.organization || 'Núcleo REI RABINO';
  const cnpj = committee?.cnpj || '09.621.597/0001-66';
  page.drawText(`${sanitizePdfText(org)} - CNPJ: ${cnpj}`, {
    x: width / 2 - 100,
    y,
    size: 8,
    font: font,
    color: MUTED,
  });
  y -= 12;

  const location = sanitizePdfText(committee?.location || 'PERDIGÃO/MG');
  const date = new Date().toLocaleDateString('pt-BR');
  page.drawText(`${location} - ${date}`, {
    x: width / 2 - 60,
    y,
    size: 7,
    font: font,
    color: MUTED,
  });
  y -= 15;

  page.drawLine({
    start: { x: 40, y: y },
    end: { x: width - 40, y: y },
    thickness: 2,
    color: GOLD,
  });

  return y - 20;
}

async function drawFooter(page: any, font: PDFFont, currentPage: number, totalPages: number) {
  const width = page.getWidth();
  const y = 30;

  page.drawLine({
    start: { x: 40, y: y + 10 },
    end: { x: width - 40, y: y + 10 },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });

  const text = `Patrimônio do Rei - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${currentPage} de ${totalPages}`;
  page.drawText(text, {
    x: width / 2 - text.length * 2.5,
    y: y - 5,
    size: 6,
    font: font,
    color: MUTED,
  });
}

async function drawCommittee(page: any, font: PDFFont, boldFont: PDFFont, committee: any, startY: number) {
  const width = page.getWidth();
  let y = startY;

  page.drawText('COMISSÃO DE PATRIMÔNIO', {
    x: width / 2 - 60,
    y,
    size: 10,
    font: boldFont,
    color: GOLD,
  });
  y -= 20;

  const members = [
    { role: 'Presidente', name: committee?.president || '' },
    { role: 'Vice-Presidente', name: committee?.vicePresident || '' },
    { role: 'Pres. Conselho Fiscal', name: committee?.fiscalPresident || '' },
    { role: '1º Membro', name: committee?.member1 || '' },
    { role: '2º Membro', name: committee?.member2 || '' },
  ];

  for (const member of members) {
    page.drawText(member.role.toUpperCase(), {
      x: 60,
      y,
      size: 6,
      font: font,
      color: MUTED,
    });
    y -= 10;

    page.drawText(sanitizePdfText(member.name), {
      x: 60,
      y,
      size: 8,
      font: boldFont,
      color: DARK,
    });
    y -= 15;

    page.drawLine({
      start: { x: 60, y: y },
      end: { x: width - 60, y: y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;
  }

  return y;
}

export async function generateAssetPDF(asset: any, committee: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = await drawHeader(page, font, boldFont, committee, 'FICHA INDIVIDUAL DE PATRIMÔNIO', '');

  // Tag Number Box
  page.drawRectangle({
    x: 40,
    y: y - 50,
    width: page.getWidth() - 80,
    height: 50,
    color: GOLD,
  });
  page.drawText('CÓDIGO DO PATRIMÔNIO', {
    x: page.getWidth() / 2 - 60,
    y: y - 25,
    size: 8,
    font: boldFont,
    color: WHITE,
  });
  page.drawText(sanitizePdfText(asset.tagNumber), {
    x: page.getWidth() / 2 - 40,
    y: y - 42,
    size: 20,
    font: boldFont,
    color: WHITE,
  });
  y -= 70;

  // Asset Info
  page.drawText('INFORMAÇÕES DO BEM', {
    x: 40,
    y,
    size: 11,
    font: boldFont,
    color: GOLD,
  });
  y -= 15;

  const infoFields = [
    { label: 'Nome', value: sanitizePdfText(asset.name) },
    { label: 'Categoria', value: sanitizePdfText(asset.category || '-') },
    { label: 'Subcategoria', value: sanitizePdfText(asset.subcategory || '-') },
    { label: 'Marca', value: sanitizePdfText(asset.brand || '-') },
    { label: 'Modelo', value: sanitizePdfText(asset.model || '-') },
    { label: 'Nº Série', value: sanitizePdfText(asset.serialNumber || '-') },
    { label: 'Cód. Interno', value: sanitizePdfText(asset.internalCode || '-') },
    { label: 'Cód. Barras', value: sanitizePdfText(asset.barcode || '-') },
  ];

  for (let i = 0; i < infoFields.length; i += 2) {
    const x1 = 40;
    const x2 = 300;
    const fieldY = y - i * 15;

    page.drawText(infoFields[i].label.toUpperCase(), { x: x1, y: fieldY, size: 6, font: font, color: MUTED });
    page.drawText(infoFields[i].value, { x: x1, y: fieldY - 10, size: 9, font: boldFont, color: DARK });

    if (infoFields[i + 1]) {
      page.drawText(infoFields[i + 1].label.toUpperCase(), { x: x2, y: fieldY, size: 6, font: font, color: MUTED });
      page.drawText(infoFields[i + 1].value, { x: x2, y: fieldY - 10, size: 9, font: boldFont, color: DARK });
    }
  }
  y -= infoFields.length * 8 + 20;

  // Financial
  page.drawRectangle({
    x: 40,
    y: y - 80,
    width: page.getWidth() - 80,
    height: 80,
    color: LIGHT_BG,
    borderColor: GOLD,
    borderWidth: 1,
  });

  page.drawText('INFORMAÇÕES FINANCEIRAS', {
    x: 55,
    y: y - 10,
    size: 9,
    font: boldFont,
    color: GOLD,
  });

  const finFields = [
    { label: 'Valor Aquisição', value: formatCurrency(asset.acquisitionValue) },
    { label: 'Valor Atual', value: formatCurrency(asset.currentValue) },
    { label: 'Data Aquisição', value: formatDate(asset.acquisitionDate) },
    { label: 'Nota Fiscal', value: sanitizePdfText(asset.invoiceNumber || '-') },
  ];

  for (let i = 0; i < finFields.length; i += 2) {
    const x1 = 55;
    const x2 = 300;
    const fieldY = y - 25 - i * 15;

    page.drawText(finFields[i].label, { x: x1, y: fieldY, size: 7, font: font, color: MUTED });
    page.drawText(finFields[i].value, { x: x1, y: fieldY - 10, size: 9, font: boldFont, color: GOLD });

    if (finFields[i + 1]) {
      page.drawText(finFields[i + 1].label, { x: x2, y: fieldY, size: 7, font: font, color: MUTED });
      page.drawText(finFields[i + 1].value, { x: x2, y: fieldY - 10, size: 9, font: boldFont, color: GOLD });
    }
  }
  y -= 100;

  // Location
  page.drawText('LOCALIZAÇÃO', {
    x: 40,
    y,
    size: 11,
    font: boldFont,
    color: GOLD,
  });
  y -= 15;

  page.drawText(`Local: ${sanitizePdfText(asset.physicalLocation || '-')}`, { x: 40, y, size: 9, font: font, color: DARK });
  y -= 12;
  page.drawText(`Responsável: ${sanitizePdfText(asset.responsibleName || '-')}`, { x: 40, y, size: 9, font: font, color: DARK });
  y -= 30;

  // Committee
  await drawCommittee(page, font, boldFont, committee, y);

  drawFooter(page, font, 1, 1);

  return pdfDoc.save();
}

export async function generateReportPDF(assets: any[], committee: any, filters: { category?: string; search?: string }): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalAssets = assets.length;
  const totalAcquisition = assets.reduce((sum, a) => sum + (Number(a.acquisitionValue) || 0), 0);
  const totalCurrent = assets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);

  const categoryStats: Record<string, { count: number; value: number }> = {};
  assets.forEach(a => {
    const cat = a.category || 'Sem Categoria';
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, value: 0 };
    categoryStats[cat].count++;
    categoryStats[cat].value += Number(a.acquisitionValue) || 0;
  });

  const statusStats: Record<string, number> = {};
  assets.forEach(a => {
    const status = a.status || 'ACTIVE';
    statusStats[status] = (statusStats[status] || 0) + 1;
  });

  const filterText = [];
  if (filters.category) filterText.push(`Categoria: ${filters.category}`);
  if (filters.search) filterText.push(`Busca: ${filters.search}`);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalAssets / itemsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([595, 842]);
    const start = pageIdx * itemsPerPage;
    const end = start + itemsPerPage;
    const pageAssets = assets.slice(start, end);

    let y = await drawHeader(page, font, boldFont, committee, 'RELATÓRIO GERAL DE BENS PATRIMONIAIS', '');

    if (pageIdx === 0) {
      // Summary
      page.drawText('RESUMO EXECUTIVO', { x: 40, y, size: 10, font: boldFont, color: GOLD });
      y -= 15;

      // Summary boxes
      const boxWidth = 160;
      const boxHeight = 40;
      const gap = 15;

      const summaries = [
        { label: 'Total de Bens', value: totalAssets.toString() },
        { label: 'Valor Aquisição', value: formatCurrency(totalAcquisition) },
        { label: 'Valor Atual', value: formatCurrency(totalCurrent) },
      ];

      summaries.forEach((s, i) => {
        const x = 40 + i * (boxWidth + gap);
        page.drawRectangle({ x, y: y - boxHeight, width: boxWidth, height: boxHeight, color: LIGHT_BG, borderColor: GOLD, borderWidth: 0.5 });
        page.drawText(s.label.toUpperCase(), { x: x + 8, y: y - 12, size: 6, font: font, color: MUTED });
        page.drawText(s.value, { x: x + 8, y: y - 28, size: 10, font: boldFont, color: GOLD });
      });
      y -= boxHeight + 20;

      // By Category
      page.drawText('POR CATEGORIA', { x: 40, y, size: 9, font: boldFont, color: GOLD });
      y -= 12;

      Object.entries(categoryStats).forEach(([cat, stats]) => {
        const safeCat = sanitizePdfText(cat);
        page.drawText(safeCat, { x: 40, y, size: 7, font: font, color: DARK });
        page.drawText(`${stats.count} itens - ${formatCurrency(stats.value)}`, { x: 350, y, size: 7, font: font, color: MUTED });
        y -= 10;
      });
      y -= 10;

      // By Status
      page.drawText('POR STATUS', { x: 40, y, size: 9, font: boldFont, color: GOLD });
      y -= 12;

      let statusX = 40;
      Object.entries(statusStats).forEach(([status, count]) => {
      const safeStatusLabel = statusLabels[status] || sanitizePdfText(status);
        page.drawText(`${safeStatusLabel}: ${count}`, { x: statusX, y, size: 7, font: font, color: DARK });
        statusX += 80;
      });
      y -= 25;
    }

    // Table Header
    page.drawRectangle({
      x: 40,
      y: y - 15,
      width: page.getWidth() - 80,
      height: 15,
      color: GOLD,
    });

    const headers = ['Código', 'Nome', 'Categoria', 'Local', 'Valor', 'Status'];
    const colWidths = [70, 120, 80, 80, 70, 60];
    let colX = 45;

    headers.forEach((h, i) => {
      page.drawText(h, { x: colX, y: y - 10, size: 7, font: boldFont, color: WHITE });
      colX += colWidths[i];
    });
    y -= 20;

    // Table Rows
    pageAssets.forEach((asset, idx) => {
      if (y < 100) return;

      const bgColor = idx % 2 === 1 ? rgb(0.98, 0.98, 0.98) : WHITE;
      page.drawRectangle({
        x: 40,
        y: y - 12,
        width: page.getWidth() - 80,
        height: 12,
        color: bgColor,
      });

      colX = 45;
      page.drawText(sanitizePdfText(asset.tagNumber), { x: colX, y: y - 8, size: 6, font: boldFont, color: GOLD });
      colX += colWidths[0];

      const name = sanitizePdfText(asset.name.length > 25 ? asset.name.substring(0, 25) + '...' : asset.name);
      page.drawText(name, { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[1];

      const cat = sanitizePdfText(((asset.category || '-').length > 15 ? (asset.category || '-').substring(0, 15) : (asset.category || '-')));
      page.drawText(cat, { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[2];

      const loc = sanitizePdfText(((asset.physicalLocation || '-').length > 15 ? (asset.physicalLocation || '-').substring(0, 15) : (asset.physicalLocation || '-')));
      page.drawText(loc, { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[3];

      page.drawText(formatCurrency(asset.acquisitionValue), { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[4];

      const status = sanitizePdfText(statusLabels[asset.status] || asset.status);
      page.drawText(status, { x: colX, y: y - 8, size: 6, font: font, color: DARK });

      y -= 14;
    });

    // Total box on last page
    if (pageIdx === totalPages - 1) {
      y -= 10;
      page.drawRectangle({
        x: 40,
        y: y - 30,
        width: page.getWidth() - 80,
        height: 30,
        color: GOLD,
      });
      page.drawText('VALOR TOTAL DE AQUISIÇÃO', { x: 55, y: y - 10, size: 8, font: boldFont, color: WHITE });
      page.drawText(formatCurrency(totalAcquisition), { x: 400, y: y - 10, size: 10, font: boldFont, color: WHITE });
      page.drawText('VALOR TOTAL ATUAL', { x: 55, y: y - 22, size: 8, font: boldFont, color: WHITE });
      page.drawText(formatCurrency(totalCurrent), { x: 400, y: y - 22, size: 10, font: boldFont, color: WHITE });
      y -= 50;

      // Committee
      await drawCommittee(page, font, boldFont, committee, y);
    }

    drawFooter(page, font, pageIdx + 1, totalPages);
  }

  return pdfDoc.save();
}

export async function generateDisposalPDF(disposals: any[], committee: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalItems = disposals.reduce((sum, d) => sum + d.quantity, 0);
  const totalValue = disposals.reduce((sum, d) => sum + Number(d.value), 0);

  const byReason: Record<string, { count: number; value: number }> = {};
  disposals.forEach(d => {
    if (!byReason[d.reason]) byReason[d.reason] = { count: 0, value: 0 };
    byReason[d.reason].count += d.quantity;
    byReason[d.reason].value += Number(d.value);
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(disposals.length / itemsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([595, 842]);
    const start = pageIdx * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = disposals.slice(start, end);

    let y = await drawHeader(page, font, boldFont, committee, 'RELATÓRIO DE DESCARTE E DOAÇÃO DE BENS', '');

    if (pageIdx === 0) {
      // Summary
      page.drawText('RESUMO', { x: 40, y, size: 10, font: boldFont, color: GOLD });
      y -= 15;

      const boxWidth = 160;
      const boxHeight = 40;
      const gap = 15;

      const summaries = [
        { label: 'Total de Itens', value: totalItems.toString() },
        { label: 'Valor Total', value: formatCurrency(totalValue) },
        { label: 'Registros', value: disposals.length.toString() },
      ];

      summaries.forEach((s, i) => {
        const x = 40 + i * (boxWidth + gap);
        page.drawRectangle({ x, y: y - boxHeight, width: boxWidth, height: boxHeight, color: LIGHT_BG, borderColor: GOLD, borderWidth: 0.5 });
        page.drawText(s.label.toUpperCase(), { x: x + 8, y: y - 12, size: 6, font: font, color: MUTED });
        page.drawText(s.value, { x: x + 8, y: y - 28, size: 10, font: boldFont, color: GOLD });
      });
      y -= boxHeight + 20;

      // By Reason
      page.drawText('POR MOTIVO', { x: 40, y, size: 9, font: boldFont, color: GOLD });
      y -= 12;

      Object.entries(byReason).forEach(([reason, stats]) => {
        const label = sanitizePdfText(reasonLabels[reason] || reason);
        page.drawText(label, { x: 40, y, size: 7, font: font, color: DARK });
        page.drawText(`${stats.count} itens - ${formatCurrency(stats.value)}`, { x: 350, y, size: 7, font: font, color: MUTED });
        y -= 10;
      });
      y -= 15;
    }

    // Table Header
    page.drawRectangle({
      x: 40,
      y: y - 15,
      width: page.getWidth() - 80,
      height: 15,
      color: GOLD,
    });

    const headers = ['Descrição', 'Qtd', 'Valor', 'Data', 'Motivo'];
    const colWidths = [180, 40, 70, 70, 80];
    let colX = 45;

    headers.forEach((h, i) => {
      page.drawText(h, { x: colX, y: y - 10, size: 7, font: boldFont, color: WHITE });
      colX += colWidths[i];
    });
    y -= 20;

    // Table Rows
    pageItems.forEach((d, idx) => {
      if (y < 100) return;

      const bgColor = idx % 2 === 1 ? rgb(0.98, 0.98, 0.98) : WHITE;
      page.drawRectangle({
        x: 40,
        y: y - 12,
        width: page.getWidth() - 80,
        height: 12,
        color: bgColor,
      });

      colX = 45;
      const desc = sanitizePdfText(d.description.length > 30 ? d.description.substring(0, 30) + '...' : d.description);
      page.drawText(desc, { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[0];

      page.drawText(d.quantity.toString(), { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[1];

      page.drawText(formatCurrency(Number(d.value)), { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[2];

      page.drawText(formatDate(d.date), { x: colX, y: y - 8, size: 6, font: font, color: DARK });
      colX += colWidths[3];

      const reason = sanitizePdfText(reasonLabels[d.reason] || d.reason);
      page.drawText(reason, { x: colX, y: y - 8, size: 6, font: font, color: DARK });

      y -= 14;
    });

    // Total on last page
    if (pageIdx === totalPages - 1) {
      y -= 10;
      page.drawRectangle({
        x: 40,
        y: y - 20,
        width: page.getWidth() - 80,
        height: 20,
        color: GOLD,
      });
      page.drawText('VALOR TOTAL DOS BENS DESCARTADOS/DOADOS', { x: 55, y: y - 8, size: 8, font: boldFont, color: WHITE });
      page.drawText(formatCurrency(totalValue), { x: 400, y: y - 8, size: 10, font: boldFont, color: WHITE });
      y -= 40;

      await drawCommittee(page, font, boldFont, committee, y);
    }

    drawFooter(page, font, pageIdx + 1, totalPages);
  }

  return pdfDoc.save();
}
