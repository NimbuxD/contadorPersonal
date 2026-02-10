import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { createDebt, deleteDebt, createTransaction } from "./actions";
import { DebtCard } from "@/components/DebtCard";
import { auth, signOut } from "@/auth";

export const revalidate = 0;

function getDebtorStats(transactions: any[], debtorKeywords: string, initialDebt: number) {
    const keywords = debtorKeywords.split(",").map((k) => k.trim().toLowerCase());

    const paidAmount = transactions
        .filter((t) => {
            const recipient = t.recipient.toLowerCase();
            return keywords.some((k) => k && recipient.includes(k));
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

    return {
        paid: paidAmount,
        pending: initialDebt - paidAmount,
    };
}

export default async function Home() {
    const session = await auth();

    const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
    });

    const debts = await prisma.debt.findMany({
        orderBy: { createdAt: "asc" },
    });

    // Calculate Global Totals (Only for identified debts)
    let globalTotalDebt = 0;
    let globalPaid = 0;
    let globalPending = 0;

    const debtsWithStats = debts.map((debtor) => {
        const stats = getDebtorStats(
            transactions,
            debtor.keywords,
            debtor.totalAmount
        );
        globalTotalDebt += debtor.totalAmount;
        globalPaid += stats.paid;
        globalPending += stats.pending;
        return { ...debtor, ...stats };
    });

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 lg:p-8 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-neutral-800">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Control de Gastos
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hola, {session?.user?.name ?? "Usuario"}
                        </p>
                    </div>
                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className="text-sm text-red-500 hover:underline">
                            Cerrar Sesión
                        </button>
                    </form>
                </header>

                {/* Global Summary Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Deuda Total
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                            ${globalTotalDebt.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Pagado
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                            ${globalPaid.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Pendiente
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                            ${globalPending.toLocaleString()}
                        </p>
                    </div>
                </section>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Data (Debts & Transactions) - 8 Cols */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Individual Debts - Now Grid 2 cols on Large */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Detalle por Persona
                            </h2>

                            {debtsWithStats.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No hay deudas registradas.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {debtsWithStats.map((debtor) => (
                                        <DebtCard key={debtor.id} debt={debtor} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent Transactions */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Movimientos Recientes
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                    <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Destinatario</th>
                                            <th className="px-6 py-4">Banco</th>
                                            <th className="px-6 py-4">Monto</th>
                                            <th className="px-6 py-4">Código</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center text-gray-400"
                                                >
                                                    No hay transacciones. ¡Envía una imagen al bot!
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((t) => (
                                                <tr
                                                    key={t.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {format(new Date(t.date), "dd/MM/yyyy")}
                                                        <div className="text-xs text-gray-400">
                                                            {t.time}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {t.recipient}
                                                        <div className="text-xs text-gray-400">
                                                            {t.accountNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{t.bank}</td>
                                                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-gray-300">
                                                        ${t.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                                        {t.transactionCode}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions Sidebar - 4 Cols */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Add Debt Form */}
                        <section className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Agregar Nueva Deuda
                            </h2>
                            <form action={createDebt} className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Nombre
                                    </label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="Ej: Rodrigo"
                                        className="border rounded p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Monto Total
                                    </label>
                                    <input
                                        name="amount"
                                        type="number"
                                        required
                                        placeholder="200000"
                                        className="border rounded p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Palabras Clave (separadas por coma)
                                    </label>
                                    <input
                                        name="keywords"
                                        required
                                        placeholder="rodrigo, hermano, illanes"
                                        className="border rounded p-2 text-sm w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
                                >
                                    Guardar Deuda
                                </button>
                            </form>
                        </section>

                        {/* Manual Transaction Form */}
                        <section className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Registrar Pago Manual
                            </h2>
                            <form action={createTransaction} className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Destinatario (Nombre)
                                    </label>
                                    <input
                                        name="recipient"
                                        required
                                        placeholder="Ej: Rodrigo"
                                        className="border rounded p-2 text-sm w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Monto
                                    </label>
                                    <input
                                        name="amount"
                                        type="number"
                                        required
                                        placeholder="50000"
                                        className="border rounded p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">
                                        Fecha (Opcional)
                                    </label>
                                    <input
                                        name="date"
                                        type="date"
                                        className="border rounded p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
                                >
                                    Registrar Pago
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
