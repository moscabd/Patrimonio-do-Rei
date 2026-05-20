import * as XLSX from 'xlsx';

export interface ParsedAsset {
  tagNumber: string;
  name: string;
  description?: string;
  barcode?: string;
  acquisitionValue?: number;
  acquisitionDate?: Date;
  invoiceNumber?: string;
  physicalLocation?: string;
  category?: string;
  subcategory?: string;
}

function processWorksheet(worksheet: XLSX.WorkSheet): ParsedAsset[] {
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
  const assets: ParsedAsset[] = [];
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

    if (isCategoryRow(code)) {
      const parts = code.replace(/\.$/, '').split('.');
      if (parts.length === 1) {
        currentCategory = description;
        currentSubcategory = '';
      } else if (parts.length === 2) {
        currentSubcategory = description;
      }
      continue;
    }

    if (!isValidAssetCode(code)) continue;

    const asset: ParsedAsset = {
      tagNumber: code,
      name: description,
      category: currentCategory || 'Não categorizado',
      subcategory: currentSubcategory || undefined,
    };

    if (barcode) asset.barcode = barcode;
    if (value) {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(numValue)) asset.acquisitionValue = numValue;
    }
    if (dateStr) {
      const date = parseDateValue(dateStr);
      if (date) asset.acquisitionDate = date;
    }
    if (invoice && invoice !== ' ') asset.invoiceNumber = invoice;
    if (location && location !== ' ') asset.physicalLocation = location;

    assets.push(asset);
  }

  return assets;
}

function isValidAssetCode(code: string): boolean {
  if (!code || code.includes('TOTAL')) return false;
  const parts = code.split('.');
  if (parts.length === 2) {
    const lastPart = parts[1];
    return /^\d{4,}$/.test(lastPart);
  }
  return false;
}

function isCategoryRow(code: string): boolean {
  return /^\d+\.$/.test(code) || /^\d+\.\d+\.$/.test(code);
}

function parseDateValue(value: unknown): Date | undefined {
  if (typeof value === 'number') {
    return new Date((value - 25569) * 86400 * 1000);
  }
  if (typeof value === 'string') {
    const match = value.match(/^(\d{2})[\/|-](\d{2})[\/|-](\d{4})$/);
    if (match) {
      const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      if (!isNaN(date.getTime())) return date;
    }
  }
  return undefined;
}

export function parseInventorySheet(filePath: string): ParsedAsset[] {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return processWorksheet(worksheet);
}

export function parseInventoryFromBuffer(buffer: Buffer): ParsedAsset[] {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return processWorksheet(worksheet);
}