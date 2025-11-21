// @ts-nocheck
'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { approveAttendance, rejectAttendance, reassignMaster } from '@/app/actions'

type PendingItem = {
    id: string
    date: Date
    location: string
    apprentice: { name: string }
    activity: { name: string }
}

type Master = {
    id: string
    name: string
}

export default function PendingApprovalsList({
    pending,
    masters
}: {
    pending: PendingItem[],
    masters: Master[]
}) {
    const [reassigningId, setReassigningId] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)

    return (
        <div className="grid gap-4">
            {pending.map((item) => (
                <div key={item.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-200">{item.apprentice.name}</h3>
                        <p className="text-slate-400 text-sm">
                            {item.activity.name} • {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                        <p className="text-slate-500 text-sm mt-1">{item.location}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {/* Approve Button */}
                        <form action={approveAttendance.bind(null, item.id)}>
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Atestar Presença
                            </button>
                        </form>

                        {/* Reject Button */}
                        {rejectingId === item.id ? (
                            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-red-500/50">
                                <span className="text-xs text-red-400 font-medium px-1">Confirmar rejeição?</span>
                                <form action={async () => {
                                    await rejectAttendance(item.id)
                                    setRejectingId(null)
                                }}>
                                    <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Sim</button>
                                </form>
                                <button
                                    onClick={() => setRejectingId(null)}
                                    className="text-xs bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
                                >
                                    Não
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setRejectingId(item.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reprovar
                            </button>
                        )}

                        {/* Reassign Master Button */}
                        {reassigningId === item.id ? (
                            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-amber-500/50">
                                <select
                                    onChange={async (e) => {
                                        if (e.target.value) {
                                            await reassignMaster(item.id, e.target.value)
                                            setReassigningId(null)
                                        }
                                    }}
                                    className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-amber-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Selecione o Mestre</option>
                                    {masters.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setReassigningId(null)}
                                    className="text-xs bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setReassigningId(item.id)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Associar outro Mestre
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {pending.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                    Nenhuma solicitação pendente.
                </div>
            )}
        </div>
    )
}
