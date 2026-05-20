import * as XLSX from 'xlsx';

interface RawRow {
  '__EMPTY_1'?: string;
  '__EMPTY_2'?: string;
  '__EMPTY_3'?: string;
  '__EMPTY_4'?: number | string;
  '__EMPTY_5'?: string | number;
  '__EMPTY_6'?: string | number;
  '__EMPTY_7'?: string;
}

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

function isValidAssetCode(code: string): boolean {
  if (!code) return false;
  const trimmed = code.trim();
  if (trimmed === '' || trimmed === 'TOTAL' || trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      return /^\d+$/.test(lastPart) && lastPart.length >= 4;
    }
    return false;
  }
  return /^\d+$/.test(trimmed);
}

function isCategoryRow(code: string): boolean {
  if (!code) return false;
  const trimmed = code.trim();
  const parts = trimmed.split('.');
  if (parts.length === 2 && parts[1] === '') return true;
  return /^\d+\.$/.test(trimmed) || /^\d+\.\d+\.$/.test(trimmed);
}

function parseDate(dateValue: string | number | undefined): Date | undefined {
  if (!dateValue) return undefined;
  
  if (typeof dateValue === 'number') {
    const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
    if (!isNaN(excelDate.getTime())) return excelDate;
  }
  
  if (typeof dateValue === 'string') {
    const cleaned = dateValue.trim();
    const formats = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{2})-(\d{2})-(\d{4})$/,
    ];
    
    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  return undefined;
}

export function parseInventorySheet(filePath: string): ParsedAsset[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<RawRow>(worksheet);

  const assets: ParsedAsset[] = [];
  let currentCategory = '';
  let currentSubcategory = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const code = row.__EMPTY_1?.trim() || '';
    const description = row.__EMPTY_2?.trim() || '';
    const barcode = row.__EMPTY_3?.trim();
    const value = row.__EMPTY_4;
    const dateStr = row.__EMPTY_5;
    const invoice = row.__EMPTY_6?.toString().trim();
    const location = row.__EMPTY_7?.trim();

    if (isCategoryRow(code)) {
      if (code.includes('.')) {
        const parts = code.replace(/\.$/, '').split('.');
        if (parts.length === 1) {
          currentCategory = description;
          currentSubcategory = '';
        } else if (parts.length === 2) {
          currentSubcategory = description;
        }
      }
      continue;
    }

    if (!isValidAssetCode(code)) {
      if (code.toUpperCase().includes('TOTAL')) continue;
      if (description.toUpperCase().includes('TOTAL')) continue;
      continue;
    }

    let acquisitionValue: number | undefined;
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'number') {
        acquisitionValue = value;
      } else if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        acquisitionValue = parseFloat(cleaned);
      }
    }

    const asset: ParsedAsset = {
      tagNumber: code,
      name: description,
      category: currentCategory || 'Não categorizado',
      subcategory: currentSubcategory || undefined,
    };

    if (barcode && barcode.trim()) {
      asset.barcode = barcode.trim();
    }

    if (acquisitionValue && !isNaN(acquisitionValue)) {
      asset.acquisitionValue = acquisitionValue;
    }

    const parsedDate = parseDate(dateStr);
    if (parsedDate) {
      asset.acquisitionDate = parsedDate;
    }

    if (invoice && invoice.trim() && invoice.trim() !== ' ') {
      asset.invoiceNumber = invoice.trim();
    }

    if (location && location.trim() && location.trim() !== ' ') {
      asset.physicalLocation = location.trim();
    }

    assets.push(asset);
  }

  return assets;
}

export function parseInventoryFromBuffer(buffer: Buffer): ParsedAsset[] {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<RawRow>(worksheet);

  const assets: ParsedAsset[] = [];
  let currentCategory = '';
  let currentSubcategory = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const code = row.__EMPTY_1?.trim() || '';
    const description = row.__EMPTY_2?.trim() || '';
    const barcode = row.__EMPTY_3?.trim();
    const value = row.__EMPTY_4;
    const dateStr = row.__EMPTY_5;
    const invoice = row.__EMPTY_6?.toString().trim();
    const location = row.__EMPTY_7?.trim();

    if (isCategoryRow(code)) {
      if (code.includes('.')) {
        const parts = code.replace(/\.$/, '').split('.');
        if (parts.length === 1) {
          currentCategory = description;
          currentSubcategory = '';
        } else if (parts.length === 2) {
          currentSubcategory = description;
        }
      }
      continue;
    }

    if (!isValidAssetCode(code)) {
      if (code.toUpperCase().includes('TOTAL')) continue;
      if (description.toUpperCase().includes('TOTAL')) continue;
      continue;
    }

    let acquisitionValue: number | undefined;
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'number') {
        acquisitionValue = value;
      } else if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        acquisitionValue = parseFloat(cleaned);
      }
    }

    const asset: ParsedAsset = {
      tagNumber: code,
      name: description,
      category: currentCategory || 'Não categorizado',
      subcategory: currentSubcategory || undefined,
    };

    if (barcode && barcode.trim()) {
      asset.barcode = barcode.trim();
    }

    if (acquisitionValue && !isNaN(acquisitionValue)) {
      asset.acquisitionValue = acquisitionValue;
    }

    const parsedDate = parseDate(dateStr);
    if (parsedDate) {
      asset.acquisitionDate = parsedDate;
    }

    if (invoice && invoice.trim() && invoice.trim() !== ' ') {
      asset.invoiceNumber = invoice.trim();
    }

    if (location && location.trim() && location.trim() !== ' ') {
      asset.physicalLocation = location.trim();
    }

    assets.push(asset);
  }

  return assets;
}