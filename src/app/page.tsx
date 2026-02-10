import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const revalidate = 0; // Disable cache for real-time updates

const DEBTS = [
    {
        id: "rodrigo",
        name: "Rodrigo Illanes (Hermano)",
        initialDebt: 2198444,
        keywords: ["rodrigo", "illanes", "hermano"],
    },
    {
        id: "monica",
        name: "Mónica Lagos (Mamá)",
        initialDebt: 200000,
        keywords: ["monica", "mónica", "lagos", "mama", "mamá"],
    },
];

function getDebtorStats(transactions: any[], debtor: typeof DEBTS[0]) {
    const paidAmount = transactions
        .filter((t) => {
            const recipient = t.recipient.toLowerCase();
            return debtor.keywords.some((k) => recipient.includes(k));
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

    return {
        paid: paidAmount,
        pending: debtor.initialDebt - paidAmount,
    };
}

export default async function Home() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Calculate Global Totals (Only for identified debts)
    let globalTotalDebt = 0;
    let globalPaid = 0;
    let globalPending = 0;

    const debtsWithStats = DEBTS.map((debtor) => {
        const stats = getDebtorStats(transactions, debtor);
        globalTotalDebt += debtor.initialDebt;
        globalPaid += stats.paid;
        globalPending += stats.pending;
        return { ...debtor, ...stats };
    });

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Control de Gastos</h1>
                    <div className="text-sm text-gray-500">
                        {format(new Date(), "PPpp")}
                    </div>
                </header>

                {/* Global Summary */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500">Deuda Total</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                ${globalTotalDebt.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500">Pagado</h3>
                            <p className="mt-2 text-3xl font-bold text-green-600">
                                ${globalPaid.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500">Pendiente</h3>
                            <p className="mt-2 text-3xl font-bold text-red-600">
                                ${globalPending.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Individual Debts */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalle por Persona</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {debtsWithStats.map((debtor) => (
                            <div key={debtor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">{debtor.name}</h3>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Deuda Inicial:</span>
                                        <span className="font-medium">${debtor.initialDebt.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Pagado:</span>
                                        <span className="font-medium text-green-600">${debtor.paid.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
                                        <span className="text-sm text-gray-500">Pendiente:</span>
                                        <span className="text-2xl font-bold text-red-600">
                                            ${debtor.pending.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Movimientos Recientes
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Destinatario</th>
                                    <th className="px-6 py-4">Banco</th>
                                    <th className="px-6 py-4">Monto</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Código</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No hay transacciones. ¡Envía una imagen al bot!
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(t.date), "dd/MM/yyyy")}
                                                <div className="text-xs text-gray-400">{t.time}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {t.recipient}
                                                <div className="text-xs text-gray-400">{t.accountNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">{t.bank}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                                ${t.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === "PAID"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {t.status === "PAID" ? "PAGADO" : "PENDIENTE"}
                                                </span>
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
        </main>
    );
}
