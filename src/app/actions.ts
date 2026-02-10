"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDebt(formData: FormData) {
  const name = formData.get("name") as string;
  const totalAmount = parseFloat(formData.get("amount") as string);
  const keywords = formData.get("keywords") as string;

  if (!name || !totalAmount || !keywords) {
    throw new Error("Missing required fields");
  }

  await prisma.debt.create({
    data: {
      name,
      totalAmount,
      keywords: keywords.toLowerCase(), // Normalize to lowercase
    },
  });

  revalidatePath("/");
}

export async function deleteDebt(id: string) {
  await prisma.debt.delete({
    where: { id },
  });
  revalidatePath("/");
}
