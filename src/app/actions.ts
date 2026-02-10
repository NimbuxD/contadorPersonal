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

export async function updateDebt(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const totalAmount = parseFloat(formData.get("amount") as string);
  const keywords = formData.get("keywords") as string;

  if (!id || !name || !totalAmount || !keywords) {
    throw new Error("Missing required fields");
  }

  await prisma.debt.update({
    where: { id },
    data: {
      name,
      totalAmount,
      keywords: keywords.toLowerCase(),
    },
  });

  revalidatePath("/");
}
export async function createTransaction(formData: FormData) {
  const recipient = formData.get("recipient") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  if (!recipient || !amount) {
    throw new Error("Missing required fields");
  }

  await prisma.transaction.create({
    data: {
      recipient,
      amount,
      date,
      time: date.toLocaleTimeString(),
      transactionCode: `MANUAL-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: "PAID",
      bank: "MANUAL",
      accountType: "MANUAL",
      accountNumber: "MANUAL",
    },
  });

  revalidatePath("/");
}
