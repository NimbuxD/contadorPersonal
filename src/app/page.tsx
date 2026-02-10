import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const revalidate = 0; // Disable cache for real-time updates

export default async function Home() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
    });

    const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const paidAmount = transactions
        .filter((t) => t.status === "PAID")
        .reduce((acc, curr) => acc + curr.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Expense Control</h1>
                    <div className="text-sm text-gray-500">
                        {format(new Date(), "PPpp")}
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">Total Debt</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            ${totalAmount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">Paid</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">
                            ${paidAmount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">
                            ${pendingAmount.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recent Transactions
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Bank</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Code</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No transactions found. Send an image to the bot!
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
                                                    {t.status}
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
