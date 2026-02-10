"use client";

import { useState } from "react";
import { deleteDebt, updateDebt } from "@/app/actions";

interface DebtCardProps {
    debt: {
        id: string;
        name: string;
        totalAmount: number; // Changed from initialDebt to match Prisma model
        keywords: string;
        paid: number;
        pending: number;
    };
}

export function DebtCard({ debt }: DebtCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 relative">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Editar Deuda</h3>
                <form
                    action={async (formData) => {
                        await updateDebt(formData);
                        setIsEditing(false);
                    }}
                    className="space-y-3"
                >
                    <input type="hidden" name="id" value={debt.id} />

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Nombre</label>
                        <input
                            name="name"
                            defaultValue={debt.name}
                            required
                            className="border rounded p-2 text-sm w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Monto Total</label>
                        <input
                            name="amount"
                            type="number"
                            defaultValue={debt.totalAmount}
                            required
                            className="border rounded p-2 text-sm w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Keywords (separadas por coma)</label>
                        <input
                            name="keywords"
                            defaultValue={debt.keywords}
                            required
                            className="border rounded p-2 text-sm w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-500 dark:text-blue-400 text-xs hover:underline"
                >
                    Editar
                </button>
                <form action={deleteDebt.bind(null, debt.id)}>
                    <button className="text-red-500 dark:text-red-400 text-xs hover:underline">Eliminar</button>
                </form>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{debt.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Keywords: {debt.keywords}</p>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Deuda Inicial:</span>
                    <span className="font-medium dark:text-gray-200">${debt.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Pagado:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">${debt.paid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-end">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pendiente:</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ${debt.pending.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
