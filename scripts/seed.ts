import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.transaction.create({
    data: {
      recipient: "Juan Perez",
      bank: "Banco Estado",
      accountType: "Cuenta Rut",
      accountNumber: "12345678",
      date: new Date(),
      time: "14:30",
      transactionCode: "TRX-SEED-" + Date.now(),
      amount: 15000,
      status: "PENDING",
    },
  });

  await prisma.transaction.create({
    data: {
      recipient: "Maria Gonzalez",
      bank: "Banco Santander",
      accountType: "Corriente",
      accountNumber: "987654321",
      date: new Date(Date.now() - 86400000), // Yesterday
      time: "10:15",
      transactionCode: "TRX-SEED-OLD-" + Date.now(),
      amount: 25000,
      status: "PAID",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
