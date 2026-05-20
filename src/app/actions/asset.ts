"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// We assume there's at least one company from our seed
async function getDefaultCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

export async function createAsset(formData: FormData) {
  const companyId = await getDefaultCompanyId();
  if (!companyId) throw new Error("No company found. Please seed the database.");

  const tagNumber = formData.get("tagNumber") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as any;
  const currentValueRaw = formData.get("currentValue") as string;
  const currentValue = currentValueRaw ? parseFloat(currentValueRaw.replace(',', '.')) : null;

  await prisma.asset.create({
    data: {
      tagNumber,
      name,
      category,
      status: status || "ACTIVE",
      currentValue,
      companyId,
    },
  });

  revalidatePath("/assets");
}

export async function updateAsset(id: string, formData: FormData) {
  const tagNumber = formData.get("tagNumber") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as any;
  const currentValueRaw = formData.get("currentValue") as string;
  const currentValue = currentValueRaw ? parseFloat(currentValueRaw.replace(',', '.')) : null;

  await prisma.asset.update({
    where: { id },
    data: {
      tagNumber,
      name,
      category,
      status,
      currentValue,
    },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
}

export async function deleteAsset(id: string) {
  // Manual cascade para evitar erro de Foreign Key
  await prisma.auditChecklist.deleteMany({ where: { assetId: id } });
  await prisma.document.deleteMany({ where: { assetId: id } });
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/assets");
}

export async function deleteAllAssets() {
  // Manual cascade para limpar tudo com segurança
  await prisma.auditChecklist.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.assetHistory.deleteMany({});
  await prisma.movement.deleteMany({});
  await prisma.asset.deleteMany({});
  revalidatePath("/assets");
}

export async function importAssets(assetsData: any[]) {
  const companyId = await getDefaultCompanyId();
  if (!companyId) throw new Error("No company found.");

  const dataToInsert = assetsData.map(item => ({
    tagNumber: item.tagNumber || `REI-IMPORT-${Math.floor(Math.random()*10000)}`,
    name: item.name || "Item Importado",
    category: item.category || "Geral",
    subcategory: item.subcategory || null,
    brand: item.brand || null,
    model: item.model || null,
    serialNumber: item.serialNumber || null,
    description: item.description || null,
    barcode: item.barcode || null,
    status: (item.status as any) || "ACTIVE",
    currentValue: item.currentValue ? parseFloat(String(item.currentValue).replace(',', '.')) : null,
    acquisitionValue: item.acquisitionValue ? parseFloat(String(item.acquisitionValue).replace(',', '.')) : null,
    invoiceNumber: item.invoiceNumber || null,
    physicalLocation: item.physicalLocation || null,
    companyId
  }));

  for (const data of dataToInsert) {
    try {
      await prisma.asset.upsert({
        where: { tagNumber: data.tagNumber },
        update: { ...data },
        create: { ...data }
      });
    } catch (e) {
      console.error("Erro ao importar item:", data.tagNumber);
    }
  }

  revalidatePath("/assets");
  return { success: true, count: dataToInsert.length };
}
